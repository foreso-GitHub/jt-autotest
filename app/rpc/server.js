var querystring = require('querystring')
var request = require('request')

const PARSER_TEXT_JSON = 'application/json'
// const PARSER_NAME_JSON = 'json'
const PARSER_NAME_URLENCODED = 'urlencoded'
const PARSER_TEXT_URLENCODED = 'application/x-www-form-urlencoded'

var _url
var _id = 1;

var server = module.exports = {

    setUrl: function(url){
        _url = url
    },

    getUrl: function(){
        return _url
    },

    // region send http request

    send_request_get: function (url, callback) {
        server.sendRequest(url, 'GET', PARSER_TEXT_JSON, null, null, null, callback)
    },

    send_request_post: function (url, data, callback) {
        server.sendRequest(url, 'POST', PARSER_TEXT_JSON, data, null, null, callback)
    },

    sendRequest: function (url, method, parser, rawData, username, password, callback) {
        // default is JSON
        var data = JSON.stringify(rawData)
        var parserText = PARSER_TEXT_JSON

        if (parser === PARSER_NAME_URLENCODED) {
            data = querystring.stringify(rawData)
            parserText = PARSER_TEXT_URLENCODED
        }

        var options = {
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

    RPC_POST: function (method, params, callback) {
        if(!_url){
            callback("Error: RPC URL hasn't been set!")
        }

        var requestMethod = 'POST'
        var username = null
        var password = null
        var url = _url
        var parserText = PARSER_TEXT_JSON
        var data = {}
        data.jsonrpc = '2.0'
        data.id = _id++
        data.method = method
        data.params = params

        console.log(JSON.stringify(data))

        server.sendRequest(url, requestMethod, parserText, data, username, password, function (error, res) {
            callback(error, res)
        })
    }
    // endregion
}
