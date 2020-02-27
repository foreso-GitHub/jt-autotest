//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const consts = require("./consts")
//endregion

function baseInterface() {

    //region constructor
    baseInterface.prototype.className = "baseInterface"
    baseInterface.prototype.mode = null
    baseInterface.prototype.url = ''

    if (!(this instanceof baseInterface)) {
        return new baseInterface()
    }

    baseInterface.prototype.printClassName = function(){
        console.log(this.className);
    }
    //endregion

    //region init and close
    baseInterface.prototype.init = function(mode){
        this.mode = mode
        this.url  = mode.initParams.url
    }

    baseInterface.prototype.connect = function(){}

    baseInterface.prototype.close = function(){}

    baseInterface.prototype.getName = function(){
        return this.url
    }
    //endregion

    //region interfaces

    //region block number
    baseInterface.prototype.getBlockNumber = async function(){
        let response = await this.responseBlockNumber()
        return response.result
    }

    baseInterface.prototype.responseBlockNumber = function () {
        let params = []
        return this.getResponse(consts.rpcFunctions.getBlockNumber, params)
    }
    //endregion

    //region balance
    baseInterface.prototype.getBalance = async function (address, symbol) {
        let response = await this.responseBalance(address, symbol)
        return response.result.balance
    }

    baseInterface.prototype.processBalanceResponse = function(response){
        return response.result.balance
    }

    baseInterface.prototype.responseBalance = function (address, symbol, tag) {
        let params = []
        params.push(address)
        if(symbol) params.push(symbol)
        if(tag) params.push(tag)
        return this.getResponse(consts.rpcFunctions.getBalance, params)
    }
    //endregion

    //region new wallet
    baseInterface.prototype.createWallet = async function(){
        let response = await this.responseCreateWallet()
        return response.result
    }

    baseInterface.prototype.responseCreateWallet = function () {
        let params = []
        return this.getResponse('jt_createWallet', params)
    }
    //endregion

    //region account
    baseInterface.prototype.responseCreateAccount = function (nickName) {
        let params = []
        params.push(nickName)
        return this.getResponse(consts.rpcFunctions.createAccount, params)
    }

    baseInterface.prototype.responseGetAccount = function (address, symbol, tag) {
        let params = []
        params.push(address)
        if(symbol) params.push(symbol)
        if(tag) params.push(tag)
        return this.getResponse(consts.rpcFunctions.getAccount, params)
    }

    baseInterface.prototype.responseGetAccounts = function () {
        let params = []
        return this.getResponse(consts.rpcFunctions.getAccounts, params)
    }
    //endregion

    //region get tx
    baseInterface.prototype.getTx = async function (hash) {
        let response = await this.responseGetTxByHash(hash)
        return response.result.balance
    }

    baseInterface.prototype.responseGetTxByHash = function (hash) {
        let params = []
        params.push(hash)
        return this.getResponse(consts.rpcFunctions.getTransactionByHash, params)
    }

    baseInterface.prototype.responseGetTxByBlockNumberAndIndex = function (blockNumber, index) {
        let params = []
        params.push(blockNumber)
        params.push(index)
        return this.getResponse(consts.rpcFunctions.getTransactionByBlockNumberAndIndex, params)
    }

    baseInterface.prototype.responseGetTxByBlockHashAndIndex = function (blockHash, index) {
        let params = []
        params.push(blockHash)
        params.push(index)
        return this.getResponse(consts.rpcFunctions.getTransactionByBlockHashAndIndex, params)
    }

    baseInterface.prototype.responseGetTxCountByBlockNumber = function (blockNumber) {
        let params = []
        params.push(blockNumber)
        return this.getResponse(consts.rpcFunctions.getBlockTransactionCountByNumber, params)
    }

    baseInterface.prototype.responseGetTxCountByHash = function (blockHash) {
        let params = []
        params.push(blockHash)
        return this.getResponse(consts.rpcFunctions.getBlockTransactionCountByHash, params)
    }
    //endregion

    //region get receipt
    baseInterface.prototype.responseGetTransactionReceipt = function (blockHash) {
        let params = []
        params.push(blockHash)
        return this.getResponse(consts.rpcFunctions.getTransactionReceipt, params)
    }
    //endregion

    //region get block
    baseInterface.prototype.responseGetBlockByNumber = function (blockNumber, showFullTx) {
        let params = []
        params.push(blockNumber)
        if(showFullTx != null) params.push(showFullTx)
        return this.getResponse(consts.rpcFunctions.getBlockByNumber, params)
    }

    baseInterface.prototype.responseGetBlockByHash = function (blockHash, showFullTx) {
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
        if(value != null) data.value = this.valueToAmount(value)
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

    baseInterface.prototype.createTransferParams = function (from, secret, sequence, to, value, fee, memos){
        return this.createTxParams(from, secret, sequence, to, value, fee, memos)
    }

    baseInterface.prototype.createIssueTokenParams = function (from, secret, sequence, name, symbol, decimals, total_supply, local, flags, fee){
        return this.createTxParams(from, secret, sequence, null, null, fee, null,
            'IssueCoin', name, symbol, decimals, total_supply, local, flags)
    }

    baseInterface.prototype.responseSendTx = function (params){
        return this.getResponse(consts.rpcFunctions.sendTx, params)
    }

    //endregion

    // endregion

    //region common methods
    baseInterface.prototype.getResponse = function (methodName, params) {
        logger.debug('Trying to invoke ' + methodName + '!')
        logger.debug('Params: ' + JSON.stringify(params))
    }

    //convert value, because in old chain and new chain, value is different.  in old chain, value decimals is 6. in new chain, value must be integer.
    //todo: may be it is a bug.
    baseInterface.prototype.valueToAmount = function (value) {
        return value
    }
    //endregion

}

module.exports = baseInterface