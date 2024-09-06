package indexer

// CelatoneTxResponse is the response from the Celatone API
type CelatoneTxResponse struct {
	Items []struct {
		Created       string `json:"created,omitempty"`
		Hash          string `json:"hash,omitempty"`
		Height        int64  `json:"height,omitempty"`
		IsClearAdmin  bool   `json:"is_clear_admin,omitempty"`
		IsExecute     bool   `json:"is_execute,omitempty"`
		IsIbc         bool   `json:"is_ibc,omitempty"`
		IsInstantiate bool   `json:"is_instantiate,omitempty"`
		IsMigrate     bool   `json:"is_migrate,omitempty"`
		IsSend        bool   `json:"is_send,omitempty"`
		IsSigner      bool   `json:"is_signer,omitempty"`
		IsStoreCode   bool   `json:"is_store_code,omitempty"`
		IsUpdateAdmin bool   `json:"is_update_admin,omitempty"`
		Messages      []struct {
			Detail struct {
				Type     string `json:"@type,omitempty"`
				Contract string `json:"contract,omitempty"`
				Funds    []any  `json:"funds,omitempty"`
				Msg      struct {
					SetBalances struct {
						Balances [][]string `json:"balances,omitempty"`
					} `json:"set_balances,omitempty"`
				} `json:"msg,omitempty"`
				MsgJSON string `json:"msg_json,omitempty"`
				Sender  string `json:"sender,omitempty"`
			} `json:"detail,omitempty"`
			Type string `json:"type,omitempty"`
		} `json:"messages,omitempty"`
		Sender  string `json:"sender,omitempty"`
		Success bool   `json:"success,omitempty"`
	} `json:"items,omitempty"`
}

// AddressDroplets is the internal structure to capture the address and droplets
// from the RPC query
type AddressDroplets struct {
	Address  string `json:"address"`
	Droplets uint64 `json:"droplets"`
}

// type TempTxChecks struct {
// 	Items []struct {
// 		Created       string `json:"created"`
// 		Hash          string `json:"hash"`
// 		Height        int    `json:"height"`
// 		IsClearAdmin  bool   `json:"is_clear_admin"`
// 		IsExecute     bool   `json:"is_execute"`
// 		IsIbc         bool   `json:"is_ibc"`
// 		IsInstantiate bool   `json:"is_instantiate"`
// 		IsMigrate     bool   `json:"is_migrate"`
// 		IsSend        bool   `json:"is_send"`
// 		IsSigner      bool   `json:"is_signer"`
// 		IsStoreCode   bool   `json:"is_store_code"`
// 		IsUpdateAdmin bool   `json:"is_update_admin"`
// 		Messages      []struct {
// 			Detail struct {
// 				Type     string `json:"@type"`
// 				Contract string `json:"contract"`
// 				Funds    []any  `json:"funds"`
// 				Msg      struct {
// 					SetBalances struct {
// 						Balances [][]string `json:"balances"`
// 					} `json:"set_balances"`
// 				} `json:"msg"`
// 				MsgJSON string `json:"msg_json"`
// 				Sender  string `json:"sender"`
// 			} `json:"detail"`
// 			Type string `json:"type"`
// 		} `json:"messages"`
// 		Sender  string `json:"sender"`
// 		Success bool   `json:"success"`
// 	} `json:"items"`
// }
