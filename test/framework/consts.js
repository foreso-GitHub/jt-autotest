module.exports =  consts = {

    //region rpc
    rpcFunctions: {
        sendTx: 'jt_sendTransaction',
        signTx: 'jt_signTransaction',
        sendRawTx: 'jt_sendRawTransaction',
        getBlockNumber: 'jt_blockNumber',
        getBlockByNumber: 'jt_getBlockByNumber',
        getBlockByHash: 'jt_getBlockByHash',
        createWallet: 'jt_createWallet',
        createAccount: 'jt_createAccount',
        getAccount: 'jt_getAccount',
        getAccounts: 'jt_accounts',
        getBalance:'jt_getBalance',
        getCurrency:'jt_getCurrency',
        getVersion: 'jt_version',
        getTransactionReceipt:'jt_getTransactionReceipt',
        getTransactionByHash:'jt_getTransactionByHash',
        getTransactionByIndex:'jt_getTransactionByIndex',
        getTransactionByBlockHashAndIndex:'jt_getTransactionByBlockHashAndIndex',
        getTransactionByBlockNumberAndIndex: 'jt_getTransactionByBlockNumberAndIndex',
        getBlockTransactionCountByHash:'jt_getBlockTransactionCountByHash',
        getBlockTransactionCountByNumber:'jt_getBlockTransactionCountByNumber',
        getTransactionCount: 'jt_getTransactionCount',
        subscribe: 'jt_subscribe',
        unsubscribe: 'jt_unsubscribe',
        listSubscribe: 'jt_listSubscribe',
        sign: 'jt_sign',
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
        uploadFile:'sw_uploadFile',
        downloadFile:'sw_downloadFile',
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
    },
    //endregion

    swtConsts:{
        oneSwt: 1000000,
        totalSwt: 100000000,
        totalFee: 100000000000000,
    },

    versions:{
        '20201105': 'v0.5.1-dev',
        '20201114': 'v0.5.2-dev',
        '20201120': 'v0.5.3-dev',
        '20201123': 'v0.5.3-dev',
        '20201124': 'v0.5.3-dev',
        '20201126': 'v0.5.3-dev',
        '20201130': 'v0.5.3-dev',
        '20201205': 'v0.5.3-dev',
        '20201208': 'v0.5.3-dev',
        '20201209': 'v0.5.3-dev',
        '20201210': 'v0.5.3 dev-20201210-194c2505539ab9c905afaa72f622eb947e1c7aa3',
        '20201210b': {
            "checksum": "13609a6bc8b38d85f0f2e2824dae6714819b5233",
            "time": "20201210",
            "version": "v0.5.3-dev"
        },
        '20201214':{
            "checksum": "9a4534fab8c03280fb2ff7792b1aa5a9c6d600ed",
            "time": "20201214",
            "version": "v0.5.3-dev"
        },
        '20201216':{
            "checksum": "9f304bafe8618c2609901034a670797ad8962723",
            "time": "20201216",
            "version": "v0.5.3-dev"
        }
    },

    walletTypes:{
        ECDSA: "ECDSA",
        Ed25519: "Ed25519",
        SM2: "SM2",
        default: "",
    },

    sendTxType:{
        Normal: 'Noraml',
        InOneRequest: 'InOneRequest',
        InOneRequestQuickly: 'InOneRequestQuickly',
        default: '',
    },

    defaultIssuer: 'jjjjjjjjjjjjjjjjjjjjjhoLvTp',
    defaultNativeCoin: 'SWT',
}

