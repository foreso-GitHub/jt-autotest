let querystring = require('querystring')
let request = require('request')
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default');

const PARSER_TEXT_JSON = 'application/json'
const PARSER_NAME_URLENCODED = 'urlencoded'
const PARSER_TEXT_URLENCODED = 'application/x-www-form-urlencoded'

function server() {

    this._url = ""
    this._id = 1

    // region send http request
    this.send_request_get = function (url, callback) {
        this.sendRequest(url, 'GET', PARSER_TEXT_JSON, null, null, null, callback)
    },

    this.send_request_post = function (url, data, callback) {
        this.sendRequest(url, 'POST', PARSER_TEXT_JSON, data, null, null, callback)
    },

    this.sendRequest = function (url, method, parser, rawData, username, password, callback) {
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
        request(options, function (error, response, body) {
            if (error) {
                callback(error)
            } else if (response.statusCode !== 200) {
                callback(response)
            } else {
                try {
                    callback(null, JSON.parse(body))
                } catch (e) {
                    callback(null, body)
                }
            }
        })
    },

    this.RPC_POST = function (method, params, callback) {
        if(!this._url){
            callback("Error: RPC URL hasn't been set!")
        }
        let requestMethod = 'POST'
        let username = null
        let password = null
        let url = this._url
        let parserText = PARSER_TEXT_JSON
        let data = {}
        data.jsonrpc = '2.0'
        data.id = this._id++
        data.method = method
        data.params = params
        logger.debug(JSON.stringify(data))
        this.sendRequest(url, requestMethod, parserText, data, username, password, function (error, res) {
            callback(error, res)
        })
    }
    // endregion
}

module.exports = server