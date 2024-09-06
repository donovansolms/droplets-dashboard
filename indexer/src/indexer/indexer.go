package indexer

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gogo/protobuf/proto"
	"github.com/kelseyhightower/envconfig"
	"github.com/sirupsen/logrus"
	"github.com/tendermint/tendermint/libs/bytes"
	rpcclient "github.com/tendermint/tendermint/rpc/client"
	rpchttp "github.com/tendermint/tendermint/rpc/client/http"
	"gorm.io/gorm"
)

type Config struct {
	DatabaseDSN             string `envconfig:"DATABASE_DSN" required:"true"`
	RPCEndpoint             string `envconfig:"RPC_ENDPOINT" required:"true"`
	CelatoneQuery           string `envconfig:"CELATONE_QUERY" required:"true"`
	DropletsContractAddress string `envconfig:"DROPLETS_CONTRACT_ADDRESS" required:"true"`
}

// Indexer implements the reference indexer service
type Indexer struct {
	rpcEndpoint             string
	celatoneQuery           string
	dropletsContractAddress string
	logger                  *logrus.Entry
	stopChannel             chan bool
	db                      *gorm.DB
	lastTransationTime      time.Time
	wg                      sync.WaitGroup
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

	db := &gorm.DB{}

	// db, err := gorm.Open(postgres.Open(config.DatabaseDSN), &gorm.Config{
	// 	Logger: logger.Default.LogMode(logger.Silent),
	// })
	// if err != nil {
	// 	return nil, err
	// }

	return &Indexer{
		rpcEndpoint:             config.RPCEndpoint,
		celatoneQuery:           config.CelatoneQuery,
		dropletsContractAddress: config.DropletsContractAddress,
		logger:                  log,
		stopChannel:             make(chan bool),
		db:                      db,
		lastTransationTime:      time.Now(),
	}, nil
}

// Run the indexer service forever
func (i *Indexer) Run() error {
	i.logger.Info("Starting indexer")

	// lastOnchainUpdateTime, error := i.getLastOnChainUpdate()
	// if error != nil {
	// 	i.logger.Error("Failed to get last point update")
	// 	return error
	// }

	// i.logger.Infof("Last onchain update time: %s", lastOnchainUpdateTime)

	// Check if the last onchain update is later than the last time we updated the points
	// If it is, we need to update the points
	// TODO: HAck for testing
	i.lastTransationTime = time.Now().Add(-time.Hour * 24 * 7)
	lastOnchainUpdateTime := time.Now().Add(-time.Hour * 23 * 7)

	if lastOnchainUpdateTime.After(i.lastTransationTime) {
		i.logger.Info("Updating points")

		// Set the offset key to empty
		offsetKey := bytes.HexBytes{}
		// RPCs typically have a 100 item limit per request
		limit := uint64(100)
		var addressDroplets []AddressDroplets

		lastKey, fetchedDroplets, err := i.getDroplets(offsetKey, limit)
		if err != nil {
			i.logger.Error("Failed to get all droplets")
			return err
		}
		addressDroplets = append(addressDroplets, fetchedDroplets...)

		_ = lastKey
		// for len(fetchedDroplets) >= int(limit) {
		// 	// Move on to the next batch
		// 	lastKey, fetchedDroplets, err = i.getDroplets(lastKey, limit)
		// 	if err != nil {
		// 		i.logger.Error("Failed to get all droplets")
		// 		return err
		// 	}
		// 	addressDroplets = append(addressDroplets, fetchedDroplets...)
		// 	i.logger.WithFields(logrus.Fields{
		// 		"total": len(addressDroplets),
		// 	}).Debug("Droplets fetched")

		// 	// Slow down to not query too hard
		// 	time.Sleep(time.Millisecond * 500)
		// }

		fmt.Println("Got all droplets: ", len(addressDroplets))

		// Capture all the droplets for datetime/lastOnchainUpdateTime
		for _, droplet := range addressDroplets {
			fmt.Println(droplet.Address, droplet.Droplets)
		}

	}

	// i.wg.Add(1)
	// go i.indexBlocks()

	// i.wg.Add(1)
	// go i.updateBaseToken()

	// i.wg.Wait()

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
func (i *Indexer) getLastOnChainUpdate() (time.Time, error) {
	response, err := http.Get(i.celatoneQuery)
	if err != nil {
		i.logger.Error("Failed to get last point update")
		return time.Time{}, err
	}

	var txResponse CelatoneTxResponse
	err = json.NewDecoder(response.Body).Decode(&txResponse)
	if err != nil {
		i.logger.Error("Failed to parse last point update")
		return time.Time{}, err
	}

	// Loop through the items in the response and find the last time a tx was executed
	// We could do better here, but this should be enough for now
	for _, item := range txResponse.Items {
		return time.Parse("2006-01-02T15:04:05", item.Created)
	}

	return time.Time{}, errors.New("no point update found")
}

// getAllDroplets captures all the addresses and their Droplets by fetching the
// raw contract state and parsing all the information
func (i *Indexer) getDroplets(offsetKey bytes.HexBytes, limit uint64) (bytes.HexBytes, []AddressDroplets, error) {
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
		rpcclient.ABCIQueryOptions{Height: 0, Prove: false},
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

	// We need to combine all debts and collateral per account here
	// So we add them to a map
	// accounts := make(map[string]types.HealthCheckWorkItem)

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
