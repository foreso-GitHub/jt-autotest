let consts = {

    //region rpc
    rpcFunctions: {
        sendTx: 'jt_sendTransaction',
        signTx: 'jt_signTransaction',
        sendRawTx: 'jt_sendRawTransaction',
        getBlockNumber: 'jt_blockNumber',
        getBlockByNumber: 'jt_getBlockByNumber',
        getBlockByHash: 'jt_getBlockByHash',
        createAccount: 'jt_createAccount',
        getAccount: 'jt_getAccount',
        getAccounts: 'jt_accounts',
        getBalance:'jt_getBalance',
        getTransactionReceipt:'jt_getTransactionReceipt',
        getTransactionByHash:'jt_getTransactionByHash',
        getTransactionByBlockHashAndIndex:'jt_getTransactionByBlockHashAndIndex',
        getTransactionByBlockNumberAndIndex: 'jt_getTransactionByBlockNumberAndIndex',
        getBlockTransactionCountByHash:'jt_getBlockTransactionCountByHash',
        getBlockTransactionCountByNumber:'jt_getBlockTransactionCountByNumber',
    },

    rpcParamConsts:{
        issueCoin: 'IssueCoin',
    },
    //endregion

    //region ipfs
    ipfsFunctions: {
        getNodeInfo:'sw_nodeInfo',
        uploadData:'sw_uploadData',
        downloadData:'sw_downloadData',
        removeData:'sw_removeData',
        pinData:'sw_pinData',
        unpinData:'sw_unpinData',
    },
    //endregion

    //region issue token flags
    // "flags":        float64(data.TxCoinMintable | data.TxCoinBurnable)
    // TxCoinMintable  TransactionFlag = 0x00010000 (65536)
    // TxCoinBurnable  TransactionFlag = 0x00020000 (131072)
    // Mintable+Burnable  TransactionFlag = 0x00030000  (196608)
    // Neither Mintable nor Burnable  TransactionFlag = 0x00000000  (0)
    flags:{
        normal: 0,
        mintable: 65536,
        burnable: 131072,
        both: 196608,
    },
    //endregion

    //region engine result
    engineResults : {
        tesSUCCESS :{
            "engine_result":"tesSUCCESS",
            "engine_result_code":0,
            "engine_result_message":"The transaction was applied. Only final in a validated ledger.",
        },
        temMALFORMED :{
            "engine_result":"temMALFORMED",
            "engine_result_code":-299,
            "engine_result_message":"Malformed transaction.",
        },
        temINVALID_SECRET :{
            "engine_result":"temINVALID_SECRET",
            "engine_result_code":-200,
            "engine_result_message":"The secret is invalid.",
        },
        temINVALID_FROM_ADDRESS :{
            "engine_result":"temINVALID_FROM_ADDRESS",
            "engine_result_code":-200,
            "engine_result_message":"The \"from\" address is invalid.",
        },
        temINVALID_TO_ADDRESS :{
            "engine_result":"temINVALID_TO_ADDRESS",
            "engine_result_code":-200,
            "engine_result_message":"The \"to\" address is invalid.",
        },
        temBAD_AMOUNT :{
            "engine_result":"temBAD_AMOUNT",
            "engine_result_code":-298,
            "engine_result_message":"Can only send non-negative amounts.",
        },
        temINVALID_SECRET :{
            "engine_result":"temINVALID_SECRET",
            "engine_result_code":-200,
            "engine_result_message":"The secret is invalid.",
        },
        tefPAST_SEQ :{
            "engine_result":"tefPAST_SEQ",
            "engine_result_code":-190,
            "engine_result_message":"This sequence number has already past.",
        },
        temBAD_SEQUENCE :{
            "engine_result":"temBAD_SEQUENCE",
            "engine_result_code":-200,
            "engine_result_message":"Sequence number must be positive integer.",
        },
        terPRE_SEQ :{
            "engine_result":"terPRE_SEQ",
            "engine_result_code":-190,
            "engine_result_message":"Missing/inapplicable prior transaction.",
        },

    }

    //endregion

}

module.exports = consts