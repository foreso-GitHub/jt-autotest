var rpc = require('./rpc.js')
// var ws = require('./ws.js')

var jingtum = module.exports = {

  // region get block number
  getBlockNumber: function () {
    return rpc.getBlockNumber()
  },

  getBlockNumber2: function () {
    console.log('Trying to get block number!')

    return new Promise((resolve, reject) => {
      var params = []
      rpc.RPC_POST('jt_blockNumber', params, function (error, data) {
        if (!error) {
          var result = {}
          if (data != null && JSON.stringify(data) !== '{}') {
            result = data + 1000
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

  getBlockNumberByRPC: function () {
    return jingtum.getBlockNumber()
  },

  getBlockNumberByAPI: function () {
    return jingtum.getBlockNumber2()
  },

  getBlockNumberByWS: function () {
    return jingtum.getBlockNumber2()
  },

  getBlockDiff: function (mode) {
    if (mode === 'rpc') {
      return jingtum.getBlockNumberByRPC()
    } else if (mode === 'api') {
      return jingtum.getBlockNumberByAPI()
    } else if (mode === 'ws') {
      return jingtum.getBlockNumberByWS()
    } else {
      return jingtum.getBlockNumber()
    }
  },
  // endregion

  // region get balance
  getBalanceByRPC: function (address) {
    return rpc.getBalance(address)
  }
  // endregion
}
