var server = require('./server.js')




var rpc = module.exports = {

    getName: function(){
        return "rpc mode";
    },

    setUrl: function(url){
        server.setUrl(url)
    },

    //region interfaces
    //region blockNumber
    getBlockNumber: async function(){
        var response = await rpc.responseBlockNumber()
        return response.result
    },

    responseBlockNumber: function () {
        console.log('Trying to get block number!')
        return new Promise((resolve, reject) => {
            var params = []
            server.RPC_POST('jt_blockNumber', params, function (error, data) {
                rpc.processResponse(error, data,resolve, reject)
            })
        })
    },
    //endregion

    //region balance
    getBalance: async function (address) {
        var response = await rpc.responseBalance(address)
        return response.result.balance
    },

    responseBalance: function (address) {
        console.log('Trying to get balance for ' + address)
        return new Promise((resolve, reject) => {
            var params = []
            params.push(address)
            server.RPC_POST('jt_getBalance', params, function (error, data) {
                rpc.processResponse(error, data,resolve, reject)
            })
        })
    },

    //endregion

    //endregion

    //region common methods
    processResponse: function(error, data,resolve, reject){
        if (!error) {
            if (data != null ) {
                if(JSON.stringify(data.result) !== '{}'){
                    console.log('result: ', data)
                    resolve(data)
                }
            }
        } else {
            console.log('error: ', error)
            reject(error)
        }
    }
    //endregion

}
