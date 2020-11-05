//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let util = require('util')
let baseInterface = require('../base/baseInterface')
let enums = require('../../enums')
//endregion


function websocketInterface() {

    //region constructor
    //inherits
    if (!(this instanceof websocketInterface)) {
        return new websocketInterface()
    }
    baseInterface.call(this)
    util.inherits(websocketInterface, baseInterface)

    //set new value for prototype, must after inherits
    baseInterface.prototype.className = "websocketInterface"

    this.init = function(mode){
        this.mode = mode
        this.url = mode.initParams.url
    }

    this.getName = function(){
        return "ws@" + this.url
    }

    this.close = function(){
        logger.debug('All done!')
    }
    //endregion

    //region common methods
    websocketInterface.prototype.getResponse = function (server, methodName, params) {
        baseInterface.prototype.getResponse(server, methodName, params)
        return new Promise((resolve, reject) => {
            this.server.RPC_POST(this.url, methodName, params).then(function(data){
                if (data != null && JSON.stringify(data.result) !== '{}'){
                    logger.debug('---Result: ', data)  //important logger
                    if(data.message){
                        logger.debug('---message.result: ', JSON.stringify(data.message.result))
                    }
                    resolve(data)
                }
                else{
                    resolve(baseInterface.prototype.createError(data))
                }
            }, function (error) {
                resolve(baseInterface.prototype.createError(error))
            })
        })
    }

    websocketInterface.prototype.valueToAmount = function (value) {
        return (value * 1000000).toString()
    }

    //endregion

}

module.exports = websocketInterface