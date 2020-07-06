//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let util = require('util')
const consts = require("../base/consts")
const Remote = require('swtc-lib').Remote
let baseInterface = require('../base/baseInterface')
//endregion

function websocketInterface() {
    const tesSUCCESS = 'tesSUCCESS'

    //region constructor

    //inherits
    if (!(this instanceof websocketInterface)) {
        return new websocketInterface()
    }
    baseInterface.call(this)
    util.inherits(websocketInterface, baseInterface)

    //set new value for prototype, must after inherits
    baseInterface.prototype.className = "websocketInterface"

    //endregion

    //region connect methods
    this.init = function(mode){
        this.mode = mode
        this.url = mode.initParams.url
        this.remote = new Remote({server: mode.initParams.url, issuer: mode.initParams.issuer})
    }

    this.getName = function(){
        return "swtc-lib@" + this.url
    }

    this.connect = function(){
        logger.debug("Connecting ...")
        return new Promise(async (resolve, reject) => {
            this.remote.connectPromise().then(function(){
                logger.debug("Connected at " + this.url + "!")
                resolve('Connected!')
            }).catch((error)=>{this.processError(error, resolve)})
        })
    }

    this.disconnect = function(){
        this.remote.disconnect()
    }

    this.close = function(){
        logger.debug('Trying to close at [' +this.url + ']!')
        if(this.remote.isConnected()) {
            this.remote.disconnect()
            logger.debug(this.url + ' is closed!')
        }
        logger.debug('All done!')
    }

    //endregion

    //region interfaces

    //region block number
    this.submitPromise_BlockNumber = function (resolve, reject) {
        this.remote.requestLedgerClosed().submitPromise()
            .then((data)=>{
                logger.debug(data)
                let response = this.createResponse(data.ledger_index)
                resolve(response)
            })
            .catch((error)=>{this.processError(error, resolve)})
    }
    //endregion

    //region block
    this.submitPromise_GetBlockByNumber = function (params, resolve, reject) {
        this.remote.requestLedger({
            ledger_index: params[0],
            transactions: params[1],
        }).submitPromise()
            .then((data)=>{
                logger.debug(data)
                let response = this.createResponse(data)
                resolve(response)
            })
            .catch((error)=>{this.processError(error, resolve)})
    }

    this.submitPromise_GetBlockByHash = function (params, resolve, reject) {
        this.remote.requestLedger({
            ledger_hash: params[0],
            transactions: params[1],
        }).submitPromise()
            .then((data)=>{
                logger.debug(data)
                let response = this.createResponse(data)
                resolve(response)
            })
            .catch((error)=>{this.processError(error, resolve)})
    }
    //endregion

    //region get tx
    this.submitPromise_GetTransactionByHash = function (params, resolve, reject) {
        this.remote.requestTx({
            hash: params[0],
        }).submitPromise()
            .then((data)=>{
                logger.debug(data)
                let response = this.createResponse(data)
                resolve(response)
            })
            .catch((error)=>{this.processError(error, resolve)})
    }
    //endregion

    //region account
    this.submitPromise_GetAccount = function (params, resolve, reject) {
        this.remote.requestAccountInfo({
            account: params[0],
        }).submitPromise()
            .then((data)=>{
                logger.debug(data)
                let response = this.createResponse(data.account_data)
                resolve(response)
            })
            .catch((error)=>{this.processError(error, resolve)})
    }
    //endregion

    //region balance
    this.submitPromise_GetBalance = function (params, resolve, reject) {
        this.remote.requestAccountInfo({
            account: params[0],
        }).submitPromise()
            .then((data)=>{
                logger.debug(data)
                let balance = data.account_data.Balance
                let response = this.createResponse({balance: balance})
                resolve(response)
            })
            .catch((error)=>{this.processError(error, resolve)})
    }
    //endregion

    //region send tx
    this.submitPromise_SendTx = function (params, resolve, reject) {
        let data = params[0]
        let options = {}
        if(data.from) options.source = data.from
        if(data.to) options.to = data.to
        if(data.value) options.amount = this.remote.makeAmount(data.value)
        if(data.sequence) options.sequence = data.sequence
        let secret = data.secret
        let memo = (data.memos != null && data.memos.length > 0) ? data.memos[0] : ''
        this.remote.buildPaymentTx(options)
            .submitPromise(secret, memo)
            .then((data)=>{
                logger.debug(data)
                let result = this.createSendTxResult(data)
                let success = this.checkResponse(data)
                if(success){
                    let response = this.createResponse(result)
                    resolve(response)
                }
                else{
                    this.processError(result, resolve)
                }
            })
            .catch((error)=>{
                this.processError(error, resolve)
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

    swtclibInterface.prototype.getResponse = function (server, methodName, params) {
        baseInterface.prototype.getResponse(server, methodName, params)
        return new Promise(async (resolve, reject) => {
            if(this.remote.isConnected()){
                logger.debug("Remote is connected!")
            }
            else{
                logger.debug("Remote is not connected, trying to connect at [" + server.url + "]!")
                await server.connect()
            }
            server.processRequest(methodName, params, resolve, reject)
        })
    }

    this.processRequest = function(methodName, params, resolve, reject){
        if(methodName === consts.rpcFunctions.getBlockNumber){
            this.submitPromise_BlockNumber(resolve, reject)
        }
        else if(methodName === consts.rpcFunctions.getBlockByNumber){
            this.submitPromise_GetBlockByNumber(params, resolve, reject)
        }
        else if(methodName === consts.rpcFunctions.getBlockByHash){
            this.submitPromise_GetBlockByHash(params, resolve, reject)
        }
        else if(methodName === consts.rpcFunctions.getTransactionByHash){
            this.submitPromise_GetTransactionByHash(params, resolve, reject)
        }
        else if(methodName === consts.rpcFunctions.getAccount){
            this.submitPromise_GetAccount(params, resolve, reject)
        }
        else if(methodName === consts.rpcFunctions.getBalance){
            this.submitPromise_GetBalance(params, resolve, reject)
        }
        else if(methodName === consts.rpcFunctions.sendTx){
            this.submitPromise_SendTx(params, resolve, reject)
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
        let response = this.createEmptyResponse()
        response.status = 'error'
        response.result = this.makeupErrorInfo(error)
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
        else if (error == 'invalid sequence'){
            result = consts.engineResults.temBAD_SEQUENCE
        }
        else{
            result = consts.engineResults.temMALFORMED
        }
        result.engine_result_raw_error = error
        return result
    }

    this.processError = function(error, resolve){
        logger.debug('Request swtclib error:' + JSON.stringify(error))
        resolve(this.createError(0, error))
        if(this.remote.isConnected()) this.remote.disconnect()
    }
    //endregion

    //endregion

    //endregion

}

module.exports = websocketInterface