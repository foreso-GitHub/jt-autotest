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

    //region block tag
    tags: {
        null: undefined,
        current: 'current',
        validated: 'validated',
        latest: 'latest',
        earliest: 'earliest',
        pending: 'pending',
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

    //region wallet type
    walletTypes:{
        ECDSA: "ECDSA",
        Ed25519: "Ed25519",
        SM2: "SM2",
        default: "",
    },
    //endregion

    //region versions
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
        },
        '20201218':{
            "checksum": "5e33e78601f0e714aaaffdfa527c74bfd553f107",
            "time": "20201218",
            "version": "v0.5.3-dev"
        },
        '20201219':{
            "checksum": "49d38d4b40e8ddaaac5f2f37a4e738a6fd75837a",
            "time": "20201219",
            "version": "v0.5.3-dev"
        },
        '20201220':{
            "checksum": "1ca4d11e354ca988b4087eb9275355b4ec105d0c",
            "time": "20201220",
            "version": "v0.5.3-dev"
        },
        '20201222':{
            "checksum": "4d79cede520d8eb6752703f588cd4a9b83370d91",
            "time": "20201222",
            "version": "v0.5.3-dev"
        },
        '20201223':{
            "checksum": "c6da505c43c4adaf54df46aa26d97c96ed095d34",
            "time": "20201223",
            "version": "v0.5.3-dev"
        },
        '20201224':{
            "checksum": "093513d2273e16f9916ac9c9084bb41f9370ca48",
            "time": "20201224",
            "version": "v0.5.3-dev"
        },
        '20201225':{
            "checksum": "45cd1e2dfcd6417e45aaa7b8033fd9ca8b46031c",
            "time": "20201225",
            "version": "v0.5.3-dev"
        },
        '20201227':{
            "checksum": "902249ad93c1a02566ff6551ff39df60b2eaf7e1",
            "time": "20201227",
            "version": "v0.5.3-dev"
        },
        '20201228':{
            "checksum": "2d55b2941a775a8c090b9039d57ef805dba3c516",
            "time": "20201228",
            "version": "v0.5.3-dev"
        },
        '20201229':{
            "checksum": "549e506fdf4556bc9bfd675559fd201421bd3036",
            "time": "20201229",
            "version": "v0.5.3-dev"
        },
        '20201229b':{
            "checksum": "e6b44577a82873fc39752544df05f0d922af079f",
            "time": "20201229",
            "version": "v0.5.3-dev"
        },
        '20201230':{
            "checksum": "a4d79e9198c743015b3b0ba55282915316d70d72",
            "time": "20201230",
            "version": "v0.5.3-dev"
        },
        '20201231':{
            "checksum": "72973ab08899c404ac4998f2e79c8b5fac0e199e",
            "time": "20201231",
            "version": "v0.5.3-dev"
        },
        '20210102':{
            "checksum": "c85d82ae7cb89316bf2190fcd7450f635d5eaf98",
            "time": "20210102",
            "version": "v0.5.3-dev"
        },
        '20210102b':{
            "checksum": "bcc6a93d716c6b4916bf52f55df8fb591ab54965",
            "time": "20210103",
            "version": "v0.5.3-dev"
        },
        '20210105b':{
            "checksum": "90245c2115345d5b23c28d32bd1c74b980dac99a",
            "time": "20210105",
            "version": "v0.5.3-dev"
        }

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
    }
    //endregion
}

