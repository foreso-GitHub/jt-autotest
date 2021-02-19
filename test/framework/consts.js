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
        },
        '20210107':{
            "checksum": "780c20d1a3245c4ed02491403b15d342c3ee8635",
            "time": "20210107",
            "version": "v0.5.3-dev"
        },
        '20210111':{
            "checksum": "04c8f9a27b4f9ae2e0f7a74c592a900f7d5d8575",
            "time": "20210111",
            "version": "v0.5.3-dev"
        },
        '20210112':{
            "checksum": "40e7b904af8f335b8d615af73fcb4e2a29eb8f98",
            "time": "20210112",
            "version": "v0.5.3-dev"
        },
        '20210113':{
            "checksum": "5aa567d27f68102434021e72cbd0bad2349ae99e",
            "time": "20210113",
            "version": "v0.5.3-dev"
        },
        '20210115':{
            "checksum": "c552afbe3e28b9fbc03a884397d38562e4a77721",
            "time": "20210115",
            "version": "v0.5.3-dev"
        },
        '20210118':{
            "checksum": "56f3df80ee4942a694390c292695fe76b177ca4b",
            "time": "20210118",
            "version": "v10.5.3"
        },
        '20210120':{
            "checksum": "5da671e93e5500a66701cd86dc39d967e5a16890",
            "time": "20210120",
            "version": "v0.5.4-dev"
        },
        '20210120a':{
            "checksum": "64c60e27963e3567ef863f68ac7283cb326274ec",
            "time": "20210120",
            "version": "v0.5.4-dev"
        },
        '20210123':{
            "checksum": "88ff7726b5023cecb9713777fe480629c3dc99d4",
            "time": "20210123",
            "version": "v0.5.4-dev"
        },
        '20210126':{
            "checksum": "6ab04a308a68135003beea7dee6b363e82c0d540",
            "time": "20210126",
            "version": "v0.5.4-dev"
        },
        '20210128':{
            "checksum": "c7f86b8253d8858922fe8ed8c99547c1091cd329",
            "time": "20210128",
            "version": "v0.5.4-dev"
        },
        '20210201':{
            "checksum": "65d2d31769549d48c0d0c25ba0eb16616ac72e97",
            "time": "20210201",
            "version": "v0.5.4-dev"
        },
        '20210201b':{
            "checksum": "6b4858238af26334e68e2b4f634551a520945ae8",
            "time": "20210201",
            "version": "v0.5.4-dev"
        },
        '20210202':{
            "checksum": "5f35ae627660de5fcdc558220580c07e9d760eb3",
            "time": "20210202",
            "version": "v0.5.4-dev"
        },
        '20210202b':{
            "checksum": "95e57512b464d7595068a4dda3e2fe1cfae85d1b",
            "time": "20210202",
            "version": "v0.5.4-dev"
        },
        '20210203':{
            "checksum": "81703d5853ddae53462288d8ad202510a6d30e9b",
            "time": "20210203",
            "version": "v0.5.4-dev"
        },
        '20210204':{
            "checksum": "37b2e5247195c3f892ba503d112b74f3d75a7631",
            "time": "20210204",
            "version": "v0.5.4-dev"
        },
        '20210204b':{
            "checksum": "d083a50b96df7ad31ddd275f80e260016e992ce4",
            "time": "20210204",
            "version": "v0.5.4-dev"
        },
        '20210207':{
            "checksum": "db1bf99761871c1bbe1b67e2bd6286eba58177fc",
            "time": "20210207",
            "version": "v0.5.4-dev"
        },
        '20210208':{
            "checksum": "66f82228b3003001cb4f134e1240b58413ddf3d4",
            "time": "20210208",
            "version": "v0.5.4-dev"
        },
        '20210209':{
            "checksum": "f080e8c2b57b52cabd3cef2718439ab6305d3f46",
            "time": "20210209",
            "version": "v0.5.4-dev"
        },
        '20210218':{
            "checksum": "f79a420c94324f0e122b265a2e7be26573c78249",
            "time": "20210218",
            "version": "v0.6.4-dev"
        },
        '20210219':{
            "checksum": "296452520315a8b88ae584f9dbaf97df72b56c7e",
            "time": "20210219",
            "version": "v0.6.4-dev"
        },
        '20210219b':{
            "checksum": "ae3070493c2d87812731c2583fe3820089246ee7",
            "time": "20210219",
            "version": "v0.6.4-dev"
        }
    },
    //endregion

}

