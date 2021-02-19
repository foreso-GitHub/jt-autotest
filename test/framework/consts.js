module.exports = consts = {

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

    //region ledgers
    ledgers: {
        null: undefined,
        current: 'current',
        validated: 'validated',
        latest: 'latest',
        earliest: 'earliest',
        pending: 'pending',
        closed: 'closed',
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
    // 增加快速交易标志位，标志位为0x40000000，也即1073741824
    flags:{
        normal: 0,
        mintable: 65536,
        burnable: 131072,
        both: 196608,
        quick: 1073741824,
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

    //region wallet type
    walletTypes:{
        ECDSA: "ECDSA",
        Ed25519: "Ed25519",
        SM2: "SM2",
        default: "",
    },
    //endregion

    //region coin type

    coinCategory: {
        native: 'SWT',
        global: 'GlobalCoin',
        local: 'LocalCoin'
    },

    coinTypes:{
        global_normal: "不可增发不可销毁的全局代币",
        global_mintable: "可增发的全局代币",
        global_burnable: "可销毁的全局代币",
        global_both: "既可增发又可销毁的全局代币",
        local_normal: "不可增发不可销毁的本地代币",
        local_mintable: "可增发的本地代币",
        local_burnable: "可销毁的本地代币",
        local_both: "既可增发又可销毁的本地代币",
    },

    //endregion

    //region swt
    swtConsts:{
        oneSwt: 1000000,
        totalSwt: 100000000,
        totalFee: 100000000000000,
    },

    sendTxType:{
        Normal: 'Noraml',
        InOneRequest: 'InOneRequest',
        InOneRequestQuickly: 'InOneRequestQuickly',
        default: '',
    },

    // defaultIssuer: 'jjjjjjjjjjjjjjjjjjjjjhoLvTp',
    // defaultNativeCoin: 'SWT',
    default:{
        issuer: 'jjjjjjjjjjjjjjjjjjjjjhoLvTp',
        nativeCoin: 'SWT',
        nativeCoinDecimals: 6,
        tokenDecimals: 8,
        maxAmount: 90000000000,
        fee: 10
        // maxAmount: Math.pow(2, 63),
        // maxAmount:9223372036854775000,  //其實應該是9223372036854775807，2的63次方，但這樣nodejs會自動進位爲9223372036854776000，溢出了。
    },
    //endregion

    //region markdown
    markdownTypes: {
        text: "text",
        softbreak: "softbreak",
        linebreak: "linebreak",
        emph: "emph",
        strong: "strong",
        html_inline: "html_inline",
        link: "link",
        image: "image",
        text: "text",
        code: "code",
        text: "text",
        document: "document",
        paragraph: "paragraph",
        block_quote: "block_quote",
        item: "item",
        list: "list",
        heading: "heading",
        code_block: "code_block",
        html_block: "html_block",
        thematic_break: "thematic_break",
    },
    //endregion

}

