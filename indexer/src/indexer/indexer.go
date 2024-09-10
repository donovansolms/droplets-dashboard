package indexer

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/donovansolms/droplets-dashboard/indexer/src/indexer/models"
	"github.com/gogo/protobuf/proto"
	"github.com/kelseyhightower/envconfig"
	"github.com/sirupsen/logrus"
	"github.com/tendermint/tendermint/libs/bytes"
	rpcclient "github.com/tendermint/tendermint/rpc/client"
	rpchttp "github.com/tendermint/tendermint/rpc/client/http"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type Config struct {
	DatabaseDSN             string   `envconfig:"DATABASE_DSN" required:"true"`
	RPCEndpoint             string   `envconfig:"RPC_ENDPOINT" required:"true"`
	CelatoneQuery           string   `envconfig:"CELATONE_QUERY" required:"true"`
	DropAtomQuery           string   `envconfig:"DROP_ATOM_QUERY" required:"true"`
	DropletsContractAddress string   `envconfig:"DROPLETS_CONTRACT_ADDRESS" required:"true"`
	Skiplist                []string `envconfig:"SKIPLIST" required:"true"`

	TempHistoryHeight uint64 `envconfig:"TEMP_HISTORY_HEIGHT" required:"false"`
	TempHistoryDate   string `envconfig:"TEMP_HISTORY_DATE" required:"false"`
}

// Indexer implements the reference indexer service
type Indexer struct {
	rpcEndpoint             string
	celatoneQuery           string
	dropAtomQuery           string
	dropletsContractAddress string
	logger                  *logrus.Entry
	stopChannel             chan bool
	db                      *gorm.DB
	lastTransationTime      time.Time
	skipList                []string

	tempHistoryHeight uint64
	tempHistoryDate   time.Time
}

// New returns a new instance of the indexer service and returns an error if
// there was a problem setting up the service
func New(
	log *logrus.Entry) (*Indexer, error) {

	// Parse config environment variables for self
	var config Config
	err := envconfig.Process("", &config)
	if err != nil {
		log.Fatalf("Unable to process config: %s", err)
	}

	db, err := gorm.Open(postgres.Open(config.DatabaseDSN), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		return nil, err
	}

	// TEMP
	// historyDate, err := time.Parse("2006-01-02T15:04:05", config.TempHistoryDate)
	// if err != nil {
	// 	return nil, err
	// }
	historyDate := time.Now()

	return &Indexer{
		rpcEndpoint:             config.RPCEndpoint,
		celatoneQuery:           config.CelatoneQuery,
		dropAtomQuery:           config.DropAtomQuery,
		dropletsContractAddress: config.DropletsContractAddress,
		logger:                  log,
		stopChannel:             make(chan bool),
		db:                      db,
		lastTransationTime:      time.Now(),
		skipList:                config.Skiplist,

		tempHistoryHeight: config.TempHistoryHeight,
		tempHistoryDate:   historyDate,
	}, nil
}

// Run the indexer service forever
func (i *Indexer) Run() error {
	i.logger.Info("Starting indexer")

	// BACKFILL CODE

	// fmt.Println("Temp history height:", i.tempHistoryHeight)
	// fmt.Println("Temp history date:", i.tempHistoryDate)

	// // os.Exit(0)

	// // // TODO: HAck for testing
	// height := int64(0)
	// i.lastTransationTime = time.Now().Add(-time.Hour * 24 * 7)
	// lastOnchainUpdateTime := time.Now().Add(-time.Hour * 23 * 7)

	// height = int64(i.tempHistoryHeight)
	// lastOnchainUpdateTime = i.tempHistoryDate

	// END OF BACKFILL CODE

	i.logger.Info("Fetching last on-chain update")
	height, lastOnchainUpdateTime, error := i.getLastOnChainUpdate()
	if error != nil {
		i.logger.Error("Failed to get last point update")
		return error
	}

	i.logger.WithFields(logrus.Fields{
		"height": height,
		"date":   lastOnchainUpdateTime,
	}).Info("Last on-chain update")

	// Fetch last update we captured
	i.logger.Info("Fetching last captured update")
	var lastCapture models.DropletStatsHistory
	result := i.db.Order("height DESC").First(&lastCapture)
	if result.Error != nil {
		if result.Error != gorm.ErrRecordNotFound {
			i.logger.WithFields(logrus.Fields{
				"err": result.Error,
			}).Fatal("Unable to fetch last stats")
		}
	}

	i.logger.WithFields(logrus.Fields{
		"height": lastCapture.Height,
		"date":   lastCapture.DateBlock,
	}).Info("Last captured update")

	// Check if the latest on-chain is newer than what we've captured
	// If so, update Droplets
	if lastCapture.Height < height {
		i.logger.Info("Updating Drop Staked ATOM")

		dropStakedAtom, err := i.getDropStakedAtom(height)
		if err != nil {
			i.logger.Error("Failed to get Drop staked ATOM")
			return err
		}
		// Save the Drop staked ATOM totals
		dropStakedAtomModel := models.DropAtomHistory{
			TotalAtom:   dropStakedAtom,
			Height:      height,
			DateBlock:   lastOnchainUpdateTime,
			DateCreated: time.Now(),
		}
		result := i.db.Save(&dropStakedAtomModel)
		if result.Error != nil {
			// If the error is a duplicate key error, we ignore it
			if result.Error != gorm.ErrDuplicatedKey && !strings.Contains(result.Error.Error(), "duplicate key value") {
				i.logger.WithFields(logrus.Fields{
					"total": dropStakedAtom,
					"err":   result.Error,
				}).Fatal("Unable to store Drop staked ATOM")
			}
		}

		i.logger.Info("Updating Droplets")

		// Set the offset key to empty
		offsetKey := bytes.HexBytes{}
		// RPCs typically have a 100 item limit per request
		limit := uint64(100)
		var addressDroplets []AddressDroplets

		lastKey, fetchedDroplets, err := i.getDroplets(height, offsetKey, limit)
		if err != nil {
			i.logger.Error("Failed to get all droplets")
			return err
		}
		addressDroplets = append(addressDroplets, fetchedDroplets...)

		for len(fetchedDroplets) >= int(limit) {
			// Move on to the next batch
			lastKey, fetchedDroplets, err = i.getDroplets(height, lastKey, limit)
			if err != nil {
				i.logger.Error("Failed to get all droplets")
				return err
			}
			addressDroplets = append(addressDroplets, fetchedDroplets...)
			i.logger.WithFields(logrus.Fields{
				"total": len(addressDroplets),
			}).Debug("Droplets fetched")

			// Slow down to not query too hard
			time.Sleep(time.Millisecond * 500)
		}

		// Truncate the leaderboard
		result = i.db.Exec("TRUNCATE TABLE droplet_leaderboard")
		if result.Error != nil {
			i.logger.WithFields(logrus.Fields{
				"err": result.Error,
			}).Fatal("Unable to truncate leaderboard")
		}
		i.logger.Debug("Leaderboard truncated")

		i.logger.Info("Processing Droplets")

		// Capture all the droplets for datetime/lastOnchainUpdateTime
		for _, account := range addressDroplets {

			// Check if account.Address is in the skiplist, if so, continue to
			// the next account
			if len(i.skipList) > 0 {
				skip := false
				for _, skipAddress := range i.skipList {
					if strings.Contains(account.Address, skipAddress) {
						i.logger.WithFields(logrus.Fields{
							"address": account.Address,
						}).Debug("Skipping address")
						skip = true
						break
					}
				}
				if skip {
					continue
				}
			}

			// Store the history item
			historyModel := models.DropletAddressHistory{
				Address:     account.Address,
				Droplets:    account.Droplets,
				Height:      height,
				DateBlock:   lastOnchainUpdateTime,
				DateCreated: time.Now(),
			}
			result := i.db.Save(&historyModel)
			if result.Error != nil {
				// If the error is a duplicate key error, we ignore it
				if result.Error != gorm.ErrDuplicatedKey && !strings.Contains(result.Error.Error(), "duplicate key value") {
					i.logger.WithFields(logrus.Fields{
						"address":  account.Address,
						"droplets": account.Droplets,
						"err":      result.Error,
					}).Fatal("Unable to store history")
				}
			}

			// Add to the leaderboard
			leaderboardModel := models.DropletLeaderboard{
				Address:  account.Address,
				Droplets: account.Droplets,
				Height:   height,

				DateBlock:   lastOnchainUpdateTime,
				DateCreated: time.Now(),
			}
			result = i.db.Save(&leaderboardModel)
			if result.Error != nil {
				// If the error is a duplicate key error, we ignore it
				if result.Error != gorm.ErrDuplicatedKey && !strings.Contains(result.Error.Error(), "duplicate key value") {
					i.logger.WithFields(logrus.Fields{
						"address":  account.Address,
						"droplets": account.Droplets,
						"err":      result.Error,
					}).Fatal("Unable to store leaderboard item")
				} else {
					continue
				}
			}
		}

		// Rank the leaderboard
		rankingQuery := `
		WITH ranked_droplets AS (
		SELECT
			id,
			ROW_NUMBER() OVER (ORDER BY droplets DESC) AS rank  -- Calculate rank based on descending order of 'droplets'
		FROM
			droplet_leaderboard
		)
		UPDATE droplet_leaderboard
		SET position = ranked_droplets.rank  -- Update the 'position' column with the calculated rank
		FROM ranked_droplets
		WHERE droplet_leaderboard.id = ranked_droplets.id;  -- Match each row by 'id' 
	`
		result = i.db.Exec(rankingQuery)
		if result.Error != nil {
			i.logger.WithFields(logrus.Fields{
				"err": result.Error,
			}).Fatal("Unable to rank leaderboard")
		}

		i.logger.Info("Leaderboard rankes inserted")

		// Count unique addresses in the dashboard
		var totalUniqueAddresses int64
		result = i.db.Model(&models.DropletLeaderboard{}).Select("DISTINCT(address)").Count(&totalUniqueAddresses)
		if result.Error != nil {
			i.logger.WithFields(logrus.Fields{
				"err": result.Error,
			}).Fatal("Unable to count unique addresses")
		}

		// Count total droplets in the dashboard
		var totalDroplets int64
		// Sum the droplets
		result = i.db.Model(&models.DropletLeaderboard{}).Select("SUM(droplets)").Scan(&totalDroplets)
		if result.Error != nil {
			i.logger.WithFields(logrus.Fields{
				"err": result.Error,
			}).Fatal("Unable to count total droplets")
		}

		i.logger.WithFields(logrus.Fields{
			"total": totalDroplets,
			"count": len(addressDroplets),
		}).Info("Droplet history updated")

		// Log the stats history
		statsModel := models.DropletStatsHistory{
			TotalDroplets:  totalDroplets,
			TotalAddresses: totalUniqueAddresses,
			Height:         height,

			DateBlock:   lastOnchainUpdateTime,
			DateCreated: time.Now(),
		}
		result = i.db.Save(&statsModel)
		if result.Error != nil {
			// If the error is a duplicate key error, we ignore it
			if result.Error != gorm.ErrDuplicatedKey && !strings.Contains(result.Error.Error(), "duplicate key value") {
				i.logger.WithFields(logrus.Fields{
					"total_address":  totalUniqueAddresses,
					"total_droplets": totalDroplets,
					"err":            result.Error,
				}).Fatal("Unable to store stats item")
			}
		}

		i.logger.Info("All Droplets processed")
	}

	// Now wait 30 minutes to see if we should update again
	// We could wait much longer, but if we capture in the middle of an update
	// by the Drop team, we might have a long delay, instead we can check more
	// often since it is a single API call that determines if we should capture
	// i.logger.Info("Waiting 30 minutes before next update")
	// time.Sleep(time.Minute * 30)
	i.logger.Info("Wait for next run")

	return nil
}

// Stop the indexer
func (i *Indexer) Stop() error {
	i.logger.Info("Stopping indexer")
	i.stopChannel <- true
	i.stopChannel <- true
	return nil
}

// getLastOnChainUpdate gets the last time the points were updated on chain
// We do this by querying the Celatone API for the last transaction that updated points
func (i *Indexer) getLastOnChainUpdate() (int64, time.Time, error) {
	response, err := http.Get(i.celatoneQuery)
	if err != nil {
		i.logger.Error("Failed to get last point update")
		return 0, time.Time{}, err
	}

	var txResponse CelatoneTxResponse
	err = json.NewDecoder(response.Body).Decode(&txResponse)
	if err != nil {
		i.logger.Error("Failed to parse last point update")
		return 0, time.Time{}, err
	}

	// Loop through the items in the response and find the last time a tx was executed
	// We could do better here, but this should be enough for now
	for _, item := range txResponse.Items {
		txTime, err := time.Parse("2006-01-02T15:04:05", item.Created)
		return item.Height, txTime, err
	}

	return 0, time.Time{}, errors.New("no point update found")
}

// getAllDroplets captures all the addresses and their Droplets by fetching the
// raw contract state and parsing all the information
func (i *Indexer) getDroplets(height int64, offsetKey bytes.HexBytes, limit uint64) (bytes.HexBytes, []AddressDroplets, error) {
	start := time.Now()
	lastScannedKey := offsetKey
	addressDroplets := []AddressDroplets{}

	// Create a new RPC client
	client, err := rpchttp.New(i.rpcEndpoint)
	if err != nil {
		return lastScannedKey, addressDroplets, err
	}

	// Create the state request
	var stateRequest QueryAllContractStateRequest
	stateRequest.Address = i.dropletsContractAddress
	stateRequest.Pagination = &PageRequest{
		Key:    offsetKey,
		Offset: 0,
		Limit:  limit,
	}

	// Marshal the request to protobuf
	rpcRequest, err := proto.Marshal(&stateRequest)
	if err != nil {
		return lastScannedKey, addressDroplets, err
	}

	// Perform the ABCI query
	rpcResponse, err := client.ABCIQueryWithOptions(
		context.Background(),
		"/cosmwasm.wasm.v1.Query/AllContractState",
		rpcRequest,
		rpcclient.ABCIQueryOptions{Height: height, Prove: false},
	)
	if err != nil {
		return lastScannedKey, addressDroplets, err
	}

	// Handle the response
	if rpcResponse.Response.Code != 0 {
		fmt.Println("ABCI query error code:", rpcResponse.Response.Code)
		fmt.Println("ABCI query log:", rpcResponse.Response.Log)
		return lastScannedKey, addressDroplets, err
	}

	// The value in the response also contains the contract state in
	// protobuf encoded format
	var stateResponse QueryAllContractStateResponse
	err = proto.Unmarshal(rpcResponse.Response.GetValue(), &stateResponse)
	if err != nil {
		return lastScannedKey, addressDroplets, err
	}

	// Structure of raw state we are querying
	// If a contract has a cw-storage-plus Map "balances" then the raw
	// state keys for that Map will have "balances" as a prefix. Here we need
	// to filter out all the keys we're interested in by looking for the
	// prefix
	// Example: A contract Map "balances" containing MARS addresses as keys
	// will have contract state keys returned as "balancesmars..."
	for _, model := range stateResponse.Models {
		// Example of a key
		// 00056465627473002B6F736D6F316379797A7078706C78647A6B656561376B777379646164673837333537716E6168616B616B7375696F6E
		// The first two bytes "0007" indicate the length of the Map "name" -> 7 characters
		// Followed by the map key "62616C616E6365" -> 'balance'
		// Followed by the rest of the key, the address in this case
		hexKey := model.Key

		// Skip any short keys that don't match what we're looking for
		if len(hexKey) < 50 {
			// Anything shorter than 50 can't be a map
			continue
		}

		lengthIndicator := hexKey[0:2]
		length, err := strconv.ParseInt(lengthIndicator.String(), 16, 64)
		if err != nil {
			i.logger.WithFields(logrus.Fields{
				"err": err,
				"key": hexKey.String(),
			}).Warning("Unable to decode contract state key (map name)")
			continue
		}
		// Shift to next section
		hexKey = hexKey[2:]
		// Get the map name
		mapName := hexKey[0:length]
		// Shift to next section
		hexKey = hexKey[length:]

		// Check if we're interested in this key
		if !strings.Contains("balance", string(mapName)) {
			continue
		}

		// The remaining part of the key is the address
		address := string(hexKey)
		// Strip "" from the value which is represented as "1234"
		value := strings.ReplaceAll(string(model.Value), "\"", "")
		// Parse the value as a string into a uint64
		balance, err := strconv.ParseUint(value, 10, 64)
		if err != nil {
			i.logger.WithFields(logrus.Fields{
				"err":     err,
				"address": address,
			}).Warning("Unable to decode contract state value (balance)")
			continue
		}

		addressDroplets = append(addressDroplets, AddressDroplets{
			Address:  address,
			Droplets: balance,
		})

		lastScannedKey = model.Key
	}
	i.logger.WithFields(logrus.Fields{
		"total":      len(addressDroplets),
		"elapsed_ms": time.Since(start).Milliseconds(),
	}).Debug("Fetched contract items")

	return lastScannedKey, addressDroplets, nil
}

// getDropStakedAtom fetches the current total Drop staked ATOM from the
// core Drop contract
func (i *Indexer) getDropStakedAtom(height int64) (uint64, error) {
	// URL for the smart contract query
	url := i.dropAtomQuery

	// Create a new HTTP request
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return 0, fmt.Errorf("failed to create HTTP request: %v", err)
	}

	// Set the required headers
	req.Header.Set("x-cosmos-block-height", fmt.Sprintf("%d", height))
	req.Header.Set("User-Agent", "DropletDashboard-Indexer")

	// Execute the HTTP request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return 0, fmt.Errorf("failed to execute HTTP request: %v", err)
	}
	defer resp.Body.Close()

	// Check if the response status is OK
	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("received non-OK HTTP status: %s", resp.Status)
	}

	// Parse the response body
	var result map[string]string
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response body: %v", err)
	}

	// Extract the "data" field from the response
	dataStr, ok := result["data"]
	if !ok {
		return 0, fmt.Errorf("missing 'data' field in response")
	}

	// Convert the data string to uint64
	data, err := strconv.ParseUint(dataStr, 10, 64)
	if err != nil {
		return 0, fmt.Errorf("failed to convert data to uint64: %v", err)
	}

	// Log the fetched data
	i.logger.WithFields(logrus.Fields{
		"total":  data,
		"height": height,
	}).Debug("Fetched Drop staked ATOM")

	return data, nil
}
