//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default');
const consts = require("../consts")
const Remote = require('swtc-lib').Remote
//endregion

// let address = 'jpmKEm2sUevfpFjS7QHdT8Sx7ZGoEXTJAz'
// let secret = 'ssiUDhUpUZ5JDPWZ9Twt27Ckq6k4C'
// let to = 'j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd'
// let memo = 'test'

function swtclib() {
    let remote = new Remote()
    let server = this
    let _Url = ''
    let _Mode

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

    this.responseBlockNumber = function () {
        let params = []
        return this.getResponse(consts.rpcFunctions.getBlockNumber, params)
    }

    this.getBlockNumber = async function(){
        let response = await this.responseBlockNumber()
        return response.result
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

    this.responseGetBlockByNumber = function (blockNumber, showFullTx) {
        let params = []
        params.push(blockNumber)
        if(showFullTx != null) params.push(showFullTx)
        return this.getResponse(consts.rpcFunctions.getBlockByNumber, params)
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

    this.responseGetBlockByHash = function (blockNumber, showFullTx) {
        let params = []
        params.push(blockNumber)
        if(showFullTx != null) params.push(showFullTx)
        return this.getResponse(consts.rpcFunctions.getBlockByHash, params)
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

    this.responseGetTxByHash = function (hash) {
        let params = []
        params.push(hash)
        return this.getResponse(consts.rpcFunctions.getTransactionByHash, params)
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

    this.responseGetAccount = function (address, symbol, tag) {
        let params = []
        params.push(address)
        if(symbol) params.push(symbol)
        if(tag) params.push(tag)
        return this.getResponse(consts.rpcFunctions.getAccount, params)
    }
    //endregion

    //region balance
    this.getBalance = async function (address, symbol) {
        let response = await this.responseBalance(address, symbol)
        return response.result.balance
    }

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

    this.responseBalance = function (address, symbol, tag) {
        let params = []
        params.push(address)
        if(symbol) params.push(symbol)
        if(tag) params.push(tag)
        return this.getResponse(consts.rpcFunctions.getBalance, params)
    }
    //endregion

    //region send tx
    this.createTxParams = function (from, secret, sequence, to, value, fee, memos, type, name, symbol, decimals, total_supply, local, flags){
        let data = {}
        if(from != null) data.from = from
        if(secret != null) data.secret = secret
        if(sequence != null) data.sequence = sequence
        if(to != null) data.to = to
        if(value != null) data.value = value
        if(fee != null) data.fee = fee
        if(memos != null) data.memos = memos
        if(type != null) data.type = type
        if(name != null) data.name = name
        if(symbol != null) data.symbol = symbol
        if(decimals != null) data.decimals = decimals
        if(total_supply) data.total_supply = total_supply
        if(local != null) data.local = local
        if(flags != null) data.flags = flags
        let params = []
        params.push(data)
        return params
    }

    this.createTransferParams = function (from, secret, sequence, to, value, fee, memos){
        return this.createTxParams(from, secret, sequence, to, value, fee, memos)
    }

    this.submitPromise_SendTx = function (params, resolve, reject) {
        let data = params[0]
        let options = {}
        if(data.from) options.source = data.from
        if(data.to) options.to = data.to
        if(data.value) options.amount = remote.makeAmount(data.value)
        if(data.sequence) options.sequence = data.sequence
        let secret = data.secret
        let memo = data.memos
        remote.buildPaymentTx(options).submitPromise(secret, memo)
            .then((data)=>{
                logger.debug(data)
                let response = server.createResponse(data)
                resolve(response)
            })
            .catch((error)=>{server.processError(error, resolve, server)})
    }

    this.responseSendTx = function (params){
        return this.getResponse(consts.rpcFunctions.sendTx, params)
    }
    //endregion

    //region common methods

    this.getResponse = function (methodName, params) {
        logger.debug('Trying to invoke ' + methodName + '!')
        logger.debug('Params: ' + JSON.stringify(params))
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

            // remote.connectPromise().then(function(){
            //     if(methodName === consts.rpcFunctions.getBlockNumber){
            //         server.submitPromise_BlockNumber(resolve, reject)
            //     }
            //     // remote.disconnect()
            // }).catch((error)=>{server.processError(error, resolve, server)})

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

    this.createError = function(code, message){
        let response = this.createEmptyResponse()
        response.status = 'error'
        response.result = message
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
    this.processError = function(error, resolve, server){
        logger.debug('Request rpc error:' + error)
        resolve(server.createError(0, error))
        remote.disconnect()
    }
    //endregion

    //region connect
    this.connect = function(){
        logger.debug("Connecting ...")
        return new Promise(async (resolve, reject) => {
            remote.connectPromise().then(function(){
                logger.debug("Connected at " + _Url + "!")
                resolve('Connected!')
            }).catch((error)=>{server.processError(error, resolve, server)})
        })
    }

    this.disconnect = function(){
        remote.disconnect()
    }
    //endregion

    //region init

    this.init = function(mode){
        _Mode = mode
        _Url = mode.initParams.url
        remote = new (require('swtc-lib').Remote)({server: mode.initParams.url, issuer: mode.initParams.issuer})
    }

    this.getName = function(){
        return "swtc-lib@" + _Url
    }

    this.getMode = function(){
        return _Mode
    }

    //endregion

    //endregion

    //endregion

}

module.exports = swtclib