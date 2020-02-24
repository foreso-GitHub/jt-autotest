let Server = require('./server.js')
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default');
const consts = require("../consts")

let _Mode

function rpc() {

    //region init
    let server = new Server()

    this.getName = function(){
        return "rpc@" + server._url
    }

    this.setUrl = function(url){
        server._url = url
    }

    this.getMode = function(){
        return _Mode
    }

    this.init = function(mode){
        _Mode = mode
        server._url = mode.initParams.url
    }

    this.connect = function(){

    }
    //endregion

    //region interfaces

    //region block number
    this.getBlockNumber = async function(){
        let response = await this.responseBlockNumber()
        return response.result
    }

    this.processBlockNumberResponse = function(response){
        return response.result
    }

    this.responseBlockNumber = function () {
        let params = []
        return this.getResponse(consts.rpcFunctions.getBlockNumber, params)
    }
    //endregion

    //region balance
    this.getBalance = async function (address, symbol) {
        let response = await this.responseBalance(address, symbol)
        return response.result.balance
    }

    this.processBalanceResponse = function(response){
        return response.result.balance
    }

    this.responseBalance = function (address, symbol, tag) {
        let params = []
        params.push(address)
        if(symbol) params.push(symbol)
        if(tag) params.push(tag)
        return this.getResponse(consts.rpcFunctions.getBalance, params)
    }
    //endregion

    //region new wallet
    this.createWallet = async function(){
        let response = await this.responseCreateWallet()
        return response.result
    }

    this.responseCreateWallet = function () {
        let params = []
        return this.getResponse('jt_createWallet', params)
    }
    //endregion

    //region account
    this.responseCreateAccount = function (nickName) {
        let params = []
        params.push(nickName)
        return this.getResponse(consts.rpcFunctions.createAccount, params)
    }

    this.responseGetAccount = function (address, symbol, tag) {
        let params = []
        params.push(address)
        if(symbol) params.push(symbol)
        if(tag) params.push(tag)
        return this.getResponse(consts.rpcFunctions.getAccount, params)
    }

    this.responseGetAccounts = function () {
        let params = []
        return this.getResponse(consts.rpcFunctions.getAccounts, params)
    }
    //endregion

    //region get tx
    this.getTx = async function (hash) {
        let response = await this.responseGetTxByHash(hash)
        return response.result.balance
    }

    this.responseGetTxByHash = function (hash) {
        let params = []
        params.push(hash)
        return this.getResponse(consts.rpcFunctions.getTransactionByHash, params)
    }

    this.responseGetTxByBlockNumberAndIndex = function (blockNumber, index) {
        let params = []
        params.push(blockNumber)
        params.push(index)
        return this.getResponse(consts.rpcFunctions.getTransactionByBlockNumberAndIndex, params)
    }

    this.responseGetTxByBlockHashAndIndex = function (blockHash, index) {
        let params = []
        params.push(blockHash)
        params.push(index)
        return this.getResponse(consts.rpcFunctions.getTransactionByBlockHashAndIndex, params)
    }

    this.responseGetTxCountByBlockNumber = function (blockNumber) {
        let params = []
        params.push(blockNumber)
        return this.getResponse(consts.rpcFunctions.getBlockTransactionCountByNumber, params)
    }

    this.responseGetTxCountByHash = function (blockHash) {
        let params = []
        params.push(blockHash)
        return this.getResponse(consts.rpcFunctions.getBlockTransactionCountByHash, params)
    }
    //endregion

    //region get receipt
    this.responseGetTransactionReceipt = function (blockHash) {
        let params = []
        params.push(blockHash)
        return this.getResponse(consts.rpcFunctions.getTransactionReceipt, params)
    }
    //endregion

    //region get block
    this.responseGetBlockByNumber = function (blockNumber, showFullTx) {
        let params = []
        params.push(blockNumber)
        if(showFullTx != null) params.push(showFullTx)
        return this.getResponse(consts.rpcFunctions.getBlockByNumber, params)
    }

    this.responseGetBlockByHash = function (blockHash, showFullTx) {
        let params = []
        params.push(blockHash)
        if(showFullTx != null) params.push(showFullTx)
        return this.getResponse(consts.rpcFunctions.getBlockByHash, params)
    }

    this.createParams_GetBlock = function (numberOrHash, showFullTx){
        let params = []
        params.push(numberOrHash)
        if(showFullTx != null) params.push(showFullTx)
        return params
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

    this.createIssueTokenParams = function (from, secret, sequence, name, symbol, decimals, total_supply, local, flags, fee){
        return this.createTxParams(from, secret, sequence, null, null, fee, null,
            'IssueCoin', name, symbol, decimals, total_supply, local, flags)
    }

    this.responseSendTx = function (params){
        return this.getResponse(consts.rpcFunctions.sendTx, params)
    }

    this.responseSignTx = function(params){
        return this.getResponse(consts.rpcFunctions.signTx, params)
    }

    this.responseSendRawTx = function (rawTx) {
        let params = []
        params.push(rawTx)
        return this.getResponse(consts.rpcFunctions.sendRawTx, params)
    }

    //endregion

    // endregion

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