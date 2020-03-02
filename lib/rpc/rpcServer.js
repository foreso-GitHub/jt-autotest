//region require
let querystring = require('querystring')
let request = require('request')
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
//endregion

const PARSER_TEXT_JSON = 'application/json'
const PARSER_NAME_URLENCODED = 'urlencoded'
const PARSER_TEXT_URLENCODED = 'application/x-www-form-urlencoded'

function rpcServer() {

    this.id = 1

    // region send http request
    this.send_request_get = function (url, callback) {
        this.sendRequest(url, 'GET', PARSER_TEXT_JSON, null, null, null, callback)
    },

    this.send_request_post = function (url, data, callback) {
        this.sendRequest(url, 'POST', PARSER_TEXT_JSON, data, null, null, callback)
    },

    this.sendRequest = function (url, method, parser, rawData, username, password) {
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
            request(options, function (error, response, body) {
                // logger.debug("request return: " + JSON.stringify(response))
                if (error) {
                    reject(error)
                } else if (response.statusCode !== 200) {
                    resolve(response)
                } else {
                    try {
                        resolve(JSON.parse(body))
                    } catch (e) {
                        resolve(body)
                    }
                }
            })
        })
    },

    this.RPC_POST = function (url, method, params, callback) {
        if(url == null || url.isEmpty){
            callback("Error: RPC URL hasn't been set!")
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
        logger.debug(JSON.stringify(data))
        return this.sendRequest(url, requestMethod, parserText, data, username, password)
    }
    // endregion
}

module.exports = rpcServer