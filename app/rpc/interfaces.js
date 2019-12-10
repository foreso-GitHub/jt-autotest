var server = require('./server.js')

var log4js = require('log4js')
log4js.configure('./log4js.json')
var logger = log4js.getLogger('default');

var rpc = module.exports = {

    getName: function(){
        return "rpc@" + server.getUrl()
    },

    setUrl: function(url){
        server.setUrl(url)
    },

    //region interfaces

    //region block number
    getBlockNumber: async function(){
        var response = await rpc.responseBlockNumber()
        return response.result
    },

    processBlockNumberResponse: function(response){
        return response.result
    },

    responseBlockNumber: function () {
        logger.debug('Trying to get block number!')
        return new Promise((resolve, reject) => {
            var params = []
            server.RPC_POST('jt_blockNumber', params, function (error, data) {
                rpc.processResponse(error, data,resolve, reject)
            })
        })
    },
    //endregion

    //region balance
    getBalance: async function (address) {
        var response = await rpc.responseBalance(address)
        return response.result.balance
    },

    processBalanceResponse: function(response){
        return response.result.balance
    },

    responseBalance: function (address) {
        logger.debug('Trying to get balance for ' + address)
        return new Promise((resolve, reject) => {
            var params = []
            params.push(address)
            server.RPC_POST('jt_getBalance', params, function (error, data) {
                rpc.processResponse(error, data,resolve, reject)
            })
        })
    },

    //endregion

    //region new wallet
    createWallet: async function(){
        var response = await rpc.responseCreateWallet()
        return response.result
    },

    responseCreateWallet: function () {
        logger.debug('Trying to create a new wallet!')
        return new Promise((resolve, reject) => {
            var params = []
            server.RPC_POST('jt_createWallet', params, function (error, data) {
                rpc.processResponse(error, data,resolve, reject)
            })
        })
    },
    //endregion

    //region get tx
    getTx: async function (hash) {
        var response = await rpc.responseGetTx(hash)
        return response.result.balance
    },

    responseGetTx: function (hash) {
        logger.debug('Trying to get tx for ' + hash)
        return new Promise((resolve, reject) => {
            var params = []
            params.push(hash)
            server.RPC_POST('jt_getTransactionByHash', params, function (error, data) {
                rpc.processResponse(error, data,resolve, reject)
            })
        })
    },
    //endregion

    //region send tx
    sendTx: async function (hash) {
        var response = await rpc.responseTx(hash)
        return response.result.balance
    },

    responseSendTx: function (from, secret, to, value, memo) {
        logger.debug('Trying to send tx from ' + from)
        return new Promise((resolve, reject) => {

            var data = {}
            data.from = from
            data.secret = secret
            data.to = to
            data.value = value
            data.memo = memo

            var params = []
            params.push(data)

            server.RPC_POST('jt_sendTransaction', params, function (error, data) {
                rpc.processResponse(error, data,resolve, reject)
            })
        })
    },
    //endregion
    //endregion

    //region common methods
    processResponse: function(error, data,resolve, reject){
        if (!error) {
            if (data != null ) {
                if(JSON.stringify(data.result) !== '{}'){
                    logger.debug('result: ', data)
                    resolve(data)
                }
            }
        } else {
            logger.debug('error: ', error)
            reject(error)
        }
    }
    //endregion

}
