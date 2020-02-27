//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let util = require('util')
let RpcServer = require('./rpcServer.js')
let baseInterface = require('../base/baseInterface')
//endregion


function rpcInterface() {

    //region constructor
    //inherits
    if (!(this instanceof rpcInterface)) {
        return new rpcInterface()
    }
    baseInterface.call(this)
    util.inherits(rpcInterface, baseInterface)

    //set new value for prototype, must after inherits
    this.server = new RpcServer()
    baseInterface.prototype.className = "rpcInterface"

    rpcInterface.prototype.getName = function(){
        return "rpc@" + this.url
    }
    //endregion

    //region common methods
    rpcInterface.prototype.getResponse = function (methodName, params) {
        baseInterface.prototype.getResponse(methodName, params)
        return new Promise((resolve, reject) => {
            this.server.RPC_POST(this.url, methodName, params).then(function(data){
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

module.exports = rpcInterface