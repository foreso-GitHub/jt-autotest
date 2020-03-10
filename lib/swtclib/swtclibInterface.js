//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let util = require('util')
const consts = require("../base/consts")
const Remote = require('swtc-lib').Remote
let baseInterface = require('../base/baseInterface')
//endregion

function swtclibInterface() {
    let remote = new Remote()
    let server = this
    const tesSUCCESS = 'tesSUCCESS'

    //region constructor
    //inherits
    if (!(this instanceof swtclibInterface)) {
        return new swtclibInterface()
    }
    baseInterface.call(this)
    util.inherits(swtclibInterface, baseInterface)

    //set new value for prototype, must after inherits
    baseInterface.prototype.className = "swtclibInterface"

    swtclibInterface.prototype.init = function(mode){
        baseInterface.prototype.init(mode)
        remote = new Remote({server: mode.initParams.url, issuer: mode.initParams.issuer})
    }

    swtclibInterface.prototype.getName = function(){
        return "swtc-lib@" + this.url
    }

    swtclibInterface.prototype.close = function(){
        baseInterface.prototype.close()
        if(remote.isConnected()) {
            remote.disconnect()
            logger.debug(swtclibInterface.prototype.url + ' is closed!')
        }
    }
    //endregion

    //region connect
    this.connect = function(){
        logger.debug("Connecting ...")
        return new Promise(async (resolve, reject) => {
            remote.connectPromise().then(function(){
                logger.debug("Connected at " + swtclibInterface.prototype.url + "!")
                resolve('Connected!')
            }).catch((error)=>{server.processError(error, resolve, server)})
        })
    }

    this.disconnect = function(){
        remote.disconnect()
    }
    //endregion

    //region interfaces

    //region block number
    this.submitPromise_BlockNumber = function (resolve, reject) {
        remote.requestLedgerClosed().submitPromise()
            .then((data)=>{
                logger.debug(data)
                let response = server.createResponse(data.ledger_index)
                resolve(response)
            })
            .catch((error)=>{server.processError(error, resolve, server)})
    }
    //endregion

    //region block
    this.submitPromise_GetBlockByNumber = function (params, resolve, reject) {
        remote.requestLedger({
            ledger_index: params[0],
            transactions: params[1],
        }).submitPromise()
            .then((data)=>{
                logger.debug(data)
                let response = server.createResponse(data)
                resolve(response)
            })
            .catch((error)=>{server.processError(error, resolve, server)})
    }

    this.submitPromise_GetBlockByHash = function (params, resolve, reject) {
        remote.requestLedger({
            ledger_hash: params[0],
            transactions: params[1],
        }).submitPromise()
            .then((data)=>{
                logger.debug(data)
                let response = server.createResponse(data)
                resolve(response)
            })
            .catch((error)=>{server.processError(error, resolve, server)})
    }
    //endregion

    //region get tx
    this.submitPromise_GetTransactionByHash = function (params, resolve, reject) {
        remote.requestTx({
            hash: params[0],
        }).submitPromise()
            .then((data)=>{
                logger.debug(data)
                let response = server.createResponse(data)
                resolve(response)
            })
            .catch((error)=>{server.processError(error, resolve, server)})
    }
    //endregion

    //region account
    this.submitPromise_GetAccount = function (params, resolve, reject) {
        remote.requestAccountInfo({
            account: params[0],
        }).submitPromise()
            .then((data)=>{
                logger.debug(data)
                let response = server.createResponse(data.account_data)
                resolve(response)
            })
            .catch((error)=>{server.processError(error, resolve, server)})
    }
    //endregion

    //region balance
    this.submitPromise_GetBalance = function (params, resolve, reject) {
        remote.requestAccountInfo({
            account: params[0],
        }).submitPromise()
            .then((data)=>{
                logger.debug(data)
                let balance = data.account_data.Balance
                let response = server.createResponse({balance: balance})
                resolve(response)
            })
            .catch((error)=>{server.processError(error, resolve, server)})
    }
    //endregion

    //region send tx
    this.submitPromise_SendTx = function (params, resolve, reject) {
        let data = params[0]
        let options = {}
        if(data.from) options.source = data.from
        if(data.to) options.to = data.to
        if(data.value) options.amount = remote.makeAmount(data.value)
        if(data.sequence) options.sequence = data.sequence
        let secret = data.secret
        let memo = data.memos
        remote.buildPaymentTx(options)
            .submitPromise(secret, memo)
            .then((data)=>{
                logger.debug(data)
                let result = server.createSendTxResult(data)
                let success = server.checkResponse(data)
                if(success){
                    let response = server.createResponse(result)
                    resolve(response)
                }
                else{
                    server.processError(result, resolve, server)
                }
            })
            .catch((error)=>{
                server.processError(error, resolve, server)
            })
    }

    this.createSendTxResult = function(data){
        let result = {}
        result.engine_result = data.engine_result
        result.engine_result_code = data.engine_result_code
        result.engine_result_message = data.engine_result_message
        if(data.tx_json && data.tx_json.hash) result.hash = data.tx_json.hash
        return result
    }


    //endregion

    //region common methods

    swtclibInterface.prototype.getResponse = function (methodName, params) {
        baseInterface.prototype.getResponse(methodName, params)
        return new Promise((resolve, reject) => {
            if(remote.isConnected()){
                logger.debug("Remote is connected!")
                server.processRequest(methodName, params, resolve, reject)
            }
            else{
                logger.debug("Remote is not connected, trying to connect!")
                remote.connectPromise().then(function(){
                    logger.debug("Connected!")
                    server.processRequest(methodName, params, resolve, reject)
                }).catch((error)=>{server.processError(error, resolve, server)})
            }
        })
    }

    this.processRequest = function(methodName, params, resolve, reject){
        if(methodName === consts.rpcFunctions.getBlockNumber){
            server.submitPromise_BlockNumber(resolve, reject)
        }
        else if(methodName === consts.rpcFunctions.getBlockByNumber){
            server.submitPromise_GetBlockByNumber(params, resolve, reject)
        }
        else if(methodName === consts.rpcFunctions.getBlockByHash){
            server.submitPromise_GetBlockByHash(params, resolve, reject)
        }
        else if(methodName === consts.rpcFunctions.getTransactionByHash){
            server.submitPromise_GetTransactionByHash(params, resolve, reject)
        }
        else if(methodName === consts.rpcFunctions.getAccount){
            server.submitPromise_GetAccount(params, resolve, reject)
        }
        else if(methodName === consts.rpcFunctions.getBalance){
            server.submitPromise_GetBalance(params, resolve, reject)
        }
        else if(methodName === consts.rpcFunctions.sendTx){
            server.submitPromise_SendTx(params, resolve, reject)
        }
    }

    //region create response
    this.createEmptyResponse = function(){
        let response = {}
        response.id = -1
        response.jsonrpc = '2.0'
        return response
    }

    this.createResponse = function(data){
        let response = this.createEmptyResponse()
        response.status = 'success'
        response.result = data
        return response
    }
    //endregion

    //region error process
    this.checkResponse = function(response){
        return response.engine_result === tesSUCCESS && response.engine_result_code === 0
    }

    this.createError = function(code, error){
        let response = server.createEmptyResponse()
        response.status = 'error'
        response.result = server.makeupErrorInfo(error)
        return response
    }

    this.makeupErrorInfo = function(error){
        let result = {}

        if(error == 'invalid ledger_index'
            || error == 'ledgerNotFound'
            || error == 'invalid account'
            || error == 'Account not found.'
            || error == 'invalid tx hash'
            || error == 'Transaction not found.'
        ){
            return error
        }

        if(error.engine_result){
            if(error.engine_result == consts.engineResults.temBAD_AMOUNT.engine_result){
                error.engine_result_message = consts.engineResults.temBAD_AMOUNT.engine_result_message
            }
            return error
        }
        if(error == 'No secret found for'
            || error == 'a valid secret is needed to sign with'){
            result = consts.engineResults.temINVALID_SECRET
        }
        else if (error == 'invalid source address'){
            result = consts.engineResults.temINVALID_FROM_ADDRESS
        }
        else if (error == 'invalid destination address'){
            result = consts.engineResults.temINVALID_TO_ADDRESS
        }
        else if (error == 'invalid amount'
            || error == "invalid amount: amount's maximum value is 100000000000"){
            result = consts.engineResults.temBAD_AMOUNT
        }
        else{
            result = consts.engineResults.temMALFORMED
        }
        result.engine_result_raw_error = error
        return result
    }

    this.processError = function(error, resolve, server){
        logger.debug('Request swtclib error:' + error)
        resolve(server.createError(0, error))
        if(remote.isConnected()) remote.disconnect()
    }
    //endregion

    //endregion

    //endregion

}

module.exports = swtclibInterface