//region require
let WebSocket = require('ws')
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let util = require('util')
let baseInterface = require('../base/baseInterface')
let utility = require('../../testUtility')
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

    this.close = function(){
        logger.debug('All done!')
    }
    //endregion

    //region common methods
    websocketInterface.prototype.getResponse = function (server, methodName, params) {
        baseInterface.prototype.getResponse(server, methodName, params)
        return new Promise(async (resolve, reject) => {
            let requestContent = JSON.stringify(baseInterface.prototype.createJsonRpcRequestContent(this.id++, methodName, params))
            let data = await websocketInterface.prototype.request(server.url, requestContent)
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
        })
    }


    websocketInterface.prototype.request = function(url, content){
        return new Promise((resolve, reject)=>{
            const ws = new WebSocket(url)

            ws.on('open', function open() {
                // console.log('open')
                ws.send(content)
            })

            ws.on('message', function incoming(data) {
                let result = JSON.parse(data)
                resolve(result)
                ws.close()
            })

            ws.on('close', function close() {
                // console.log('disconnected')
            })
        })

    }

    websocketInterface.prototype.valueToAmount = function (value) {
        return (utility.valueToAmount(value)).toString()
    }

    //endregion

    //region subscribe methods
    let all_output

    websocketInterface.prototype.newWebSocket = function(server) {
        let ws = new WebSocket(server.url)
        all_output = []
        let openLogger = false

        ws.on('open', async function open() {
            if(openLogger) logger.debug('ws open!')  //important logger
        })

        ws.on('message', function incoming(data) {
            all_output.push(JSON.parse(data))
            if(openLogger) logger.debug('ws message: ' + data)  //important logger
        })

        ws.on('close', function close() {
            if(openLogger) logger.debug('ws disconnected!')  //important logger
        })
        return ws
    }

    websocketInterface.prototype.closeWebSocket = function(ws) {
        logger.debug('all_output: ' + JSON.stringify(all_output))
        ws.close()
        return new Promise((resolve, reject)=>{
            resolve(all_output)
        })
    }

    websocketInterface.prototype.subscribe = function (ws, methodName, params) {
        let requestContent = JSON.stringify(baseInterface.prototype.createJsonRpcRequestContent(this.id++, methodName, params))
        logger.debug('ws.send: ' + requestContent) //important logger
        return websocketInterface.prototype.subscribeResponse(ws, requestContent)
    }

    websocketInterface.prototype.subscribeResponse = function(ws, content){
        return new Promise((resolve, reject)=>{
            /*
            Constant	Value	Description
            CONNECTING	0	The connection is not yet open.
            OPEN	1	The connection is open and ready to communicate.
            CLOSING	2	The connection is in the process of closing.
            CLOSED	3	The connection is closed.
             */
            if(ws.readyState == 0){
                ws.on('open', async function open() {
                    ws.send(content)
                })
            }
            else if(ws.readyState == 1){
                ws.send(content)
            }
            else{
                logger.debug('ws.readyState: ' + ws.readyState)
            }
            resolve(ws.readyState)
        })
    }


    //endregion

}

module.exports = websocketInterface