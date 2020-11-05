//region require
let querystring = require('querystring')
let request = require('request')
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let fs = require('fs')
let enums = require('../../enums')
const { rpcSettings } = require("../../../config/basicConfig")
//endregion

const PARSER_TEXT_JSON = 'application/json'
const PARSER_NAME_URLENCODED = 'urlencoded'
const PARSER_TEXT_URLENCODED = 'application/x-www-form-urlencoded'

function rpcServer() {

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

        return new Promise((resolve, reject) => {
            let requestTimer
            if(rpcSettings.request_timeout > 0){
                requestTimer = setTimeout(function () {
                    req.abort();
                    let result = {}
                    result.status = enums.responseStatus.error
                    result.error = 'Error: Request Timeout'
                    reject(result)
                    logger.debug('===Request Timeout: ' + url + ' | ' + JSON.stringify(rawData))
                }, rpcSettings.request_timeout)
            }

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

    this.RPC_POST = function (url, data) {
        if(url == null || url.isEmpty){
            return new Promise((resolve, reject) => {
                let result = {}
                result.status = enums.responseStatus.error
                result.error = 'Error: RPC URL hasn\'t been set!'
                reject(result)
            })
        }
        let requestMethod = 'POST'
        let username = null
        let password = null
        let parserText = PARSER_TEXT_JSON
        logger.debug('---Params: ' + JSON.stringify(data))  //important logger
        return this.sendRequest(url, requestMethod, parserText, data, username, password)
    }
    // endregion

    //region upload file
    this.RPC_UPLOAD = async function (url, fileName, callback) {
        if(url == null || url.isEmpty){
            callback("Error: RPC URL hasn't been set!")
        }
        fs.stat(fileName,function(err,stats){
            if(err){
                callback("Error: File [" + fileName + "] doesn't exist!")
            }
            if(!stats.isFile()){
                callback("Error: File [" + fileName + "] doesn't exist!")
            }
        })

        let formData = {
            file: fs.createReadStream(fileName),
        }
        let options = {
            url: url,
            method: 'POST',
            formData : formData
        }
        return new Promise((resolve, reject) => {
            request(options, function (error, response, body) {
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
    }
    //endregion
}

module.exports = rpcServer