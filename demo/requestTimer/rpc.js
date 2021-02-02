//region require
let querystring = require('querystring')
let request = require('request')
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const consts = require('../../test/framework/consts')
let enums = require('../../test/framework/enums')
//endregion

const PARSER_TEXT_JSON = 'application/json'
const PARSER_NAME_URLENCODED = 'urlencoded'
const PARSER_TEXT_URLENCODED = 'application/x-www-form-urlencoded'



module.exports = rpc = {

    sendRequest: function(url, method, parser, rawData, username, password) {
        let data = JSON.stringify(rawData)
        let parserText = PARSER_TEXT_JSON // default is JSON
        if (parser === PARSER_NAME_URLENCODED) {
            data = querystring.stringify(rawData)
            parserText = PARSER_TEXT_URLENCODED
        }
        let options = {
            url: url,
            method: method,
            headers: {
                'content-type': parserText,
                Accept: parserText
            }
        }
        if (rawData) {
            options.body = data
        }
        if (username && password) {
            options.headers.Authorization = 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
        }

        // logger.debug("sendRequest: " + JSON.stringify(options))

        return new Promise((resolve, reject) => {
            // logger.debug("sendRequest2: " + JSON.stringify(options))
            let requestTimer = setTimeout(function () {
                req.abort();
                reject(rpc.createError('Request Timeout'))
                logger.debug('......Request Timeout......')
            },3000)

            let req = request(options, function (error, response, body) {
                // logger.debug("request return: " + JSON.stringify(response))
                clearTimeout(requestTimer)
                if (error) {
                    logger.debug("request error: " + JSON.stringify(error))
                    logger.debug("request options: " + JSON.stringify(options))
                    reject(error)
                } else if (response.statusCode !== 200) {
                    resolve(response)
                } else {
                    try {
                        resolve(JSON.parse(body))
                    } catch (e) {
                        logger.debug("request exception: " + JSON.stringify(e))
                        resolve(body)
                    }
                }
            })
        })
    },

    RPC_POST: function (url, method, params) {
        if(url == null || url.isEmpty){
            return new Promise((resolve, reject) => {
                reject(rpc.createError('Error: RPC URL hasn\'t been set!'))
            })
        }
        let requestMethod = 'POST'
        let username = null
        let password = null
        let parserText = PARSER_TEXT_JSON
        let data = {}
        data.jsonrpc = '2.0'
        data.id = this.id++
        data.method = method
        data.params = params
        logger.debug('---Params: ' + JSON.stringify(data))
        return this.sendRequest(url, requestMethod, parserText, data, username, password)
    },

    getResponse: function (server, methodName, params) {
        return new Promise((resolve, reject) => {
            logger.debug('url: ' + server.url)
            this.RPC_POST(server.url, methodName, params).then(function(data){
                if (data != null && JSON.stringify(data.result) !== '{}'){
                    logger.debug('---Result: ', JSON.stringify(data))
                    if(data.error){
                        logger.debug('---error: ', JSON.stringify(data.error))
                    }
                    resolve(data)
                }
                else{
                    resolve(data)
                }
            }, function (error) {
                resolve(error)
            })
        })
    },

    responseGetTxByHash: function (server, hash) {
        let params = []
        params.push(hash)
        return this.getResponse(server, consts.rpcFunctions.getTransactionByHash, params)
    },

    responseBlockNumber: function(server, ) {
        let params = []
        return this.getResponse(server, consts.rpcFunctions.getBlockNumber, params)
    },

    createError: function(error){
        let result = {}
        result.status = enums.responseStatus.error
        result.error = error
        return result
    },
}




