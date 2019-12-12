let Server = require('./server.js')
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default');

function rpc() {

    //region init
    let server = new Server()

    this.getName = function(){
        return "rpc@" + server._url
    },

    this.setUrl = function(url){
        server._url = url
    },
    //endregion

    //region interfaces

    //region block number
    this.getBlockNumber = async function(){
        let response = await this.responseBlockNumber()
        return response.result
    },

    this.processBlockNumberResponse = function(response){
        return response.result
    },

    this.responseBlockNumber = function () {
        let params = []
        return this.getResponse('jt_blockNumber', params)
    },
    //endregion

    //region balance
    this.getBalance = async function (address) {
        let response = await this.responseBalance(address)
        return response.result.balance
    },

    this.processBalanceResponse = function(response){
        return response.result.balance
    },

    this.responseBalance = function (address) {
        let params = []
        params.push(address)
        return this.getResponse('jt_getBalance', params)
    },
    //endregion

    //region new wallet
    this.createWallet = async function(){
        let response = await this.responseCreateWallet()
        return response.result
    },

    this.responseCreateWallet = function () {
        let params = []
        return this.getResponse('jt_createWallet', params)
    },
    //endregion

    //region get tx
    this.getTx = async function (hash) {
        let response = await this.responseGetTx(hash)
        return response.result.balance
    },

    this.responseGetTx = function (hash) {
        let params = []
        params.push(hash)
        return this.getResponse('jt_getTransactionByHash', params)
    },
    //endregion

    //region send tx
    this.sendTx = async function (hash) {
        let response = await this.responseTx(hash)
        return response.result.balance
    },

    this.responseSendTx = function (from, secret, to, value, memo) {
        let data = {}
        data.from = from
        data.secret = secret
        data.to = to
        data.value = value
        data.memo = memo
        let params = []
        params.push(data)
        return this.getResponse('jt_sendTransaction', params)
    },
    //endregion
            //endregion

    //region common methods
    this.getResponse = function (methodName, params) {
        logger.debug('Trying to invoke ' + methodName + '!')
        return new Promise((resolve, reject) => {
            server.RPC_POST(methodName, params).then(function(data){
                if (data != null && JSON.stringify(data.result) !== '{}'){
                    logger.debug('result: ', data)
                    resolve(data)
                }
                else{
                    reject('result format is wrong: ' + data)
                }
            }, function (err) {
                reject(err)
            })
        })
    }
    //endregion

}

module.exports = rpc