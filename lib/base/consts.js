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

}

module.exports = consts