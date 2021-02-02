//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const consts = require('../../consts')
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
        logger.debug(this.className)
    }
    //endregion

    //region init and close

    baseInterface.prototype.init = function(mode){
        this.mode = mode
        this.name = mode.name
        this.url = mode.initParams.url
    }

    baseInterface.prototype.getName = function(){
        return this.name + '@' + this.url
    }

    //endregion

    //region interfaces

    //region block number

    baseInterface.prototype.getBlockNumber = async function(server, type){
        let response = await this.responseBlockNumber(server, type)
        let number
        if(type == 'number'){
            number = response.result[0].result
        }
        else if (type == 'info'){
            number = response.result[0].result[0]
        }
        return number
    }

    baseInterface.prototype.responseBlockNumber = function(server, type) {
        let param = this.createParamBlockNumber(type)
        return this.getResponse(server, consts.rpcFunctions.getBlockNumber, [param])
    }

    baseInterface.prototype.createParamBlockNumber = function(type) {
        let param = {}
        param.type = type
        return param
    }

    //endregion

    //region balance

    baseInterface.prototype.getBalance = async function (server, address, currency, issuer, ledger) {
        let balance = null
        let response = await this.responseGetBalance(server, address, currency, issuer, ledger)
        if(response.result && response.result[0] && response.result[0].result){
            balance = response.result[0].result.balance
        }
        return balance
    }

    baseInterface.prototype.responseGetBalance = function (server, address, currency, issuer, ledger) {
        let param = this.createParamGetBalance(address, currency, issuer, ledger)
        return this.getResponse(server, consts.rpcFunctions.getBalance, [param])
    }

    baseInterface.prototype.createParamGetBalance = function(address, currency, issuer, ledger) {
        let param = {}
        param.address = address
        if(currency) param.currency = currency
        if(issuer) param.issuer = issuer
        if(ledger) param.ledger = ledger
        return param
    }

    //endregion

    //region new wallet

    baseInterface.prototype.createWallet = async function(server, type){
        let response = await this.responseCreateWallet(server, type)
        return response.result[0].result
    }

    baseInterface.prototype.responseCreateWallet = function (server, type) {
        let param = this.createParamCreateWallet(type)
        return this.getResponse(server, 'jt_createWallet', [param])
    }

    baseInterface.prototype.createParamCreateWallet = function(type) {
        let param = {}
        param.type = type
        return param
    }

    //endregion

    //region account

    //region createAccount

    baseInterface.prototype.createAccount = async function(server, nickName, type){
        let response = await this.responseCreateAccount(server, nickName, type)
        return response.result[0].result
    }

    baseInterface.prototype.responseCreateAccount = function (server, nickName, type) {
        let param = this.createParamCreateAccount(nickName, type)
        return this.getResponse(server, consts.rpcFunctions.createAccount, [param])
    }

    baseInterface.prototype.createParamCreateAccount = function(nickName, type) {
        let param = {}
        param.nick = nickName
        param.type = type
        return param
    }

    //endregion

    //region GetAccount

    baseInterface.prototype.createParamGetAccount = function(address, currency, issuer, ledger) {
        let param = {}
        param.address = address
        if(currency) param.currency = currency
        if(issuer) param.issuer = issuer
        if(ledger) param.ledger = ledger
        return param
    }

    baseInterface.prototype.responseGetAccount = function (server, address, currency, issuer, ledger) {
        let param = this.createParamGetAccount(address, currency, issuer, ledger)
        return this.getResponse(server, consts.rpcFunctions.getAccount, [param])
    }

    baseInterface.prototype.getAccount = async function (server, address, currency, issuer, ledger) {
        let response = await this.responseGetAccount(server, address, currency, issuer, ledger)
        let account
        if(response && response.result && response.result[0] && response.result[0].result && response.result[0].result){
            account = response.result[0].result
        }
        return account
    }

    baseInterface.prototype.getSequence = async function (server, address, currency, issuer, ledger) {
        let account = await this.getAccount(server, address, currency, issuer, ledger)
        let sequence
        if(account && account.Sequence){
            sequence = account.Sequence
        }
        else{
            sequence = -1
        }
        return sequence
    }

    //endregion

    //region GetAccounts

    baseInterface.prototype.responseGetAccounts = function (server, ) {
        let params = []
        return this.getResponse(server, consts.rpcFunctions.getAccounts, params)
    }

    //endregion

    //endregion

    //region currency
    baseInterface.prototype.responseGetCurrency = function (server, currency, issuer) {
        let params = []
        params.push(currency)
        if(issuer) params.push(issuer)
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

    //region by number

    baseInterface.prototype.createParamGetBlockByNumber = function(blockNumber, showFullTx, ledger) {
        let param = {}
        param.number = blockNumber
        if(showFullTx != undefined) param.full = showFullTx
        if(ledger) param.ledger = ledger
        return param
    }

    baseInterface.prototype.responseGetBlockByNumber = function (server, blockNumber, showFullTx, ledger) {
        let param = this.createParamGetBlockByNumber(blockNumber, showFullTx, ledger)
        return this.getResponse(server, consts.rpcFunctions.getBlockByNumber, [param])
    }

    baseInterface.prototype.getBlockByNumber = async function (server, blockNumber, showFullTx, ledger) {
        let response = await this.responseGetBlockByNumber(server, blockNumber, showFullTx, ledger)
        let block
        if(!response.error){
            block = response.result[0].result
        }
        return block
    }

    //endregion

    //region by hash

    baseInterface.prototype.createParamGetBlockByHash = function(blockHash, showFullTx, ledger) {
        let param = {}
        param.hash = blockHash
        if(showFullTx != undefined) param.full = showFullTx
        if(ledger) param.ledger = ledger
        return param
    }

    baseInterface.prototype.responseGetBlockByHash = function (server, blockHash, showFullTx, ledger) {
        let param = this.createParamGetBlockByHash(blockHash, showFullTx, ledger)
        return this.getResponse(server, consts.rpcFunctions.getBlockByNumber, [param])
    }

    baseInterface.prototype.getBlockByHash = async function (server, blockHash, showFullTx, ledger) {
        let response = await this.responseGetBlockByHash(server, blockHash, showFullTx, ledger)
        let block
        if(!response.error){
            block = response.result[0].result
        }
        return block
    }

    //endregion

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
        logger.debug('---Trying to invoke ' + methodName + ', by ' + server.getName() + '!')     //important logger
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
