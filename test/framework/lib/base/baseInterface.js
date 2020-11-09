//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const consts = require('./consts')
const utility = require('../../testUtility')
let enums = require('../../enums')
//endregion

function baseInterface() {

    this.id = 1

    //region constructor
    baseInterface.prototype.className = "baseInterface"
    baseInterface.prototype.mode = null

    if (!(this instanceof baseInterface)) {
        return new baseInterface()
    }

    baseInterface.prototype.printClassName = function(){
        console.log(this.className);
    }
    //endregion

    //region init and close

    this.init = function(mode){
        this.mode = mode
        this.url = mode.initParams.url
    }

    //endregion

    //region interfaces

    //region block number
    baseInterface.prototype.getBlockNumber = async function(server, ){
        // let response = await this.responseBlockNumber(server, )
        // return response.result
        return new Promise((resolve, reject) => {
            this.responseBlockNumber(server).then(function(response){
                resolve(response.result)
            }, function (err) {
                resolve(-1000)
            })
        })
    }

    baseInterface.prototype.responseBlockNumber = function(server, ) {
        let params = []
        return this.getResponse(server, consts.rpcFunctions.getBlockNumber, params)
    }
    //endregion

    //region balance
    baseInterface.prototype.getBalance = async function (server, address, symbol) {
        let response = await this.responseBalance(server, address, symbol)
        let balance = response.result ? response.result.balance : null
        return balance
    }

    baseInterface.prototype.processBalanceResponse = function(response){
        return response.result.balance
    }

    baseInterface.prototype.responseBalance = function (server, address, symbol, tag) {
        let params = []
        params.push(address)
        if(symbol) params.push(symbol)
        if(tag) params.push(tag)
        return this.getResponse(server, consts.rpcFunctions.getBalance, params)
    }
    //endregion

    //region new wallet
    baseInterface.prototype.createWallet = async function(){
        let response = await this.responseCreateWallet()
        return response.result
    }

    baseInterface.prototype.responseCreateWallet = function (server, ) {
        let params = []
        return this.getResponse(server, 'jt_createWallet', params)
    }
    //endregion

    //region account
    baseInterface.prototype.responseCreateAccount = function (server, nickName) {
        let params = []
        params.push(nickName)
        return this.getResponse(server, consts.rpcFunctions.createAccount, params)
    }

    baseInterface.prototype.responseGetAccount = function (server, address, symbol, tag) {
        let params = []
        params.push(address)
        if(symbol) params.push(symbol)
        if(tag) params.push(tag)
        return this.getResponse(server, consts.rpcFunctions.getAccount, params)
    }

    baseInterface.prototype.responseGetAccounts = function (server, ) {
        let params = []
        return this.getResponse(server, consts.rpcFunctions.getAccounts, params)
    }
    //endregion

    //region currency
    baseInterface.prototype.responseGetCurrency = function (server, currency) {
        let params = []
        params.push(currency)
        return this.getResponse(server, consts.rpcFunctions.getCurrency, params)
    }
    //endregion

    //region get tx
    baseInterface.prototype.getTx = async function (hash) {
        let response = await this.responseGetTxByHash(hash)
        return response.result.balance
    }

    baseInterface.prototype.responseGetTxByHash = function (server, hash) {
        let params = []
        params.push(hash)
        return this.getResponse(server, consts.rpcFunctions.getTransactionByHash, params)
    }

    baseInterface.prototype.responseGetTxByBlockNumberAndIndex = function (server, blockNumber, index) {
        let params = []
        params.push(blockNumber)
        params.push(index)
        return this.getResponse(server, consts.rpcFunctions.getTransactionByBlockNumberAndIndex, params)
    }

    baseInterface.prototype.responseGetTxByBlockHashAndIndex = function (server, blockHash, index) {
        let params = []
        params.push(blockHash)
        params.push(index)
        return this.getResponse(server, consts.rpcFunctions.getTransactionByBlockHashAndIndex, params)
    }

    baseInterface.prototype.responseGetTxCountByBlockNumber = function (server, blockNumber) {
        let params = []
        params.push(blockNumber)
        return this.getResponse(server, consts.rpcFunctions.getBlockTransactionCountByNumber, params)
    }

    baseInterface.prototype.responseGetTxCountByHash = function (server, blockHash) {
        let params = []
        params.push(blockHash)
        return this.getResponse(server, consts.rpcFunctions.getBlockTransactionCountByHash, params)
    }
    //endregion

    //region get receipt
    baseInterface.prototype.responseGetTransactionReceipt = function (server, blockHash) {
        let params = []
        params.push(blockHash)
        return this.getResponse(server, consts.rpcFunctions.getTransactionReceipt, params)
    }
    //endregion

    //region get block
    baseInterface.prototype.responseGetBlockByNumber = function (server, blockNumber, showFullTx) {
        let params = []
        params.push(blockNumber)
        if(showFullTx != null) params.push(showFullTx)
        return this.getResponse(server, consts.rpcFunctions.getBlockByNumber, params)
    }

    baseInterface.prototype.responseGetBlockByHash = function (server, blockHash, showFullTx) {
        let params = []
        params.push(blockHash)
        if(showFullTx != null) params.push(showFullTx)
        return this.getResponse(consts.rpcFunctions.getBlockByHash, params)
    }

    baseInterface.prototype.createParams_GetBlock = function (numberOrHash, showFullTx){
        let params = []
        params.push(numberOrHash)
        if(showFullTx != null) params.push(showFullTx)
        return params
    }
    //endregion

    //region send tx

    baseInterface.prototype.createTxParams = function (from, secret, sequence, to, value, fee, memos, type, name, symbol, decimals, total_supply, local, flags){
        let data = {}
        if(from != null) data.from = from
        if(secret != null) data.secret = secret
        if(sequence != null) data.sequence = sequence
        if(to != null) data.to = to
        if(value != null) {
            if(!utility.isJSON(value)){
                data.value = this.valueToAmount(value)
            }else{
                let amount = value.amount
                let symbol = value.symbol
                let issuer = value.issuer
                data.value = utility.getShowValue(amount, symbol, issuer)
            }
        }
        if(fee != null) data.fee = this.valueToAmount(fee)
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

    baseInterface.prototype.createTransferParams = function (from, secret, sequence, to, value, fee, memos){
        return this.createTxParams(from, secret, sequence, to, value, fee, memos)
    }

    baseInterface.prototype.createIssueTokenParams = function (from, secret, sequence, name, symbol, decimals, total_supply, local, flags, fee){
        return this.createTxParams(from, secret, sequence, null, null, fee, null,
            'IssueCoin', name, symbol, decimals, total_supply, local, flags)
    }

    baseInterface.prototype.responseSendTx = function (server, params){
        return this.getResponse(server, consts.rpcFunctions.sendTx, params)
    }

    //endregion

    // endregion

    //region common methods
    baseInterface.prototype.getResponse = function (server, methodName, params) {
        logger.debug('---Trying to invoke ' + methodName + '!')     //important logger
        // logger.debug('---Params: ' + JSON.stringify(params))   //important logger
    }

    baseInterface.prototype.createError = function(error){
        let result = {}
        result.status = enums.responseStatus.error
        result.error = error
        return result
    }

    //convert value, because in old chain and new chain, value is different.  in old chain, value decimals is 6. in new chain, value must be integer.
    //todo: may be it is a bug.
    baseInterface.prototype.valueToAmount = function (value) {
        return value
    }

    baseInterface.prototype.createJsonRpcRequestContent = function(id, method, params){
        let data = {}
        data.jsonrpc = '2.0'
        data.id = id
        data.method = method
        data.params = params
        return data
    }
    //endregion

}

module.exports = baseInterface