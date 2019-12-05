var querystring = require('querystring')
var request = require('request')

const PARSER_TEXT_JSON = 'application/json'
// const PARSER_NAME_JSON = 'json'
const PARSER_NAME_URLENCODED = 'urlencoded'
const PARSER_TEXT_URLENCODED = 'application/x-www-form-urlencoded'
// const RPC_URL = "http://139.198.177.59:9545";
const RPC_URL = 'http://139.198.191.254:7545/v1/jsonrpc'

var rpc = module.exports = {
  getBlockNumber: function () {
    console.log('Trying to get block number!')
    return new Promise((resolve, reject) => {
      var params = []
      rpc.RPC_POST('jt_blockNumber', params, function (error, data) {
        if (!error) {
          var result = {}
          if (data != null && JSON.stringify(data) !== '{}') {
            result = data
            console.log('result: ', result)
            resolve(result)
          }
        } else {
          console.log('error: ', error)
          reject(error)
        }
      })
    })
  },

  getBalance: function (address) {
    console.log('Trying to get balance for ' + address)
    return new Promise((resolve, reject) => {
      var params = []
      params.push(address)
      rpc.RPC_POST('jt_getBalance', params, function (error, data) {
        if (!error) {
          var result = {}
          if (data != null && JSON.stringify(data) !== '{}') {
            console.log('result: ', data)
            result = Number(data.balance)
            resolve(result)
          }
        } else {
          console.log('error: ', error)
          reject(error)
        }
      })
    })
  },

  // region send http request

  send_request_get: function (url, callback) {
    rpc.sendRequest(url, 'GET', PARSER_TEXT_JSON, null, null, null, callback)
  },

  send_request_post: function (url, data, callback) {
    rpc.sendRequest(url, 'POST', PARSER_TEXT_JSON, data, null, null, callback)
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
        Accept: parserText // add by foreso on 20190327, for moac subchain rpc.
      }
      // body: data
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
        // callback(null, body);
      }
    })
  },

  RPC_POST: function (method, params, callback) {
    var requestMethod = 'POST'
    // username = config.get("btcf.username"),
    // password = config.get("btcf.password"),
    var url = RPC_URL
    var parserText = PARSER_TEXT_JSON
    var data = {}
    data.jsonrpc = '2.0'
    data.id = 1
    data.method = method
    data.params = params

    rpc.sendRequest(url, requestMethod, parserText, data, null, null, function (error, res) {
      var result = {}
      if (res) {
        result = JSON.parse(res).result
      }
      callback(error, result)
    })
  }
  // endregion
}
