//region require
let WebSocket = require('ws')
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let HashMap = require('hashmap')
let util = require('util')
let baseInterface = require('../base/baseInterface')
let utility = require('../../testUtility')
let basicConfig = require('../../../config/basicConfig')
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
                if(basicConfig.printImportantLog){  //important logger
                    logger.info('---Result: ', JSON.stringify(data))
                    if(data.error){
                        logger.error('---error: ', JSON.stringify(data.error))
                    }
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
                // logger.dubug('[ws-' + ws.index +'] open')
                ws.send(content)
            })

            ws.on('message', function incoming(data) {
                let result = JSON.parse(data)
                resolve(result)
                ws.close()
            })

            ws.on('close', function close() {
                // logger.dubug('[ws-' + ws.index +'] disconnected')
            })
        })

    }

    websocketInterface.prototype.valueToAmount = function (value) {
        return (utility.valueToAmount(value)).toString()
    }

    //endregion

    //region subscribe methods
    let all_outputs = new HashMap()
    let sub_outputs = new HashMap()
    let openLogger = basicConfig.printWsLog
    let ws_index = 0

    websocketInterface.prototype.newWebSocket = function(server) {
        let ws = new WebSocket(server.url)
        ws.index = ws_index++
        all_outputs.set(ws.index, [])
        sub_outputs.set(ws.index, [])
        let index = 0

        ws.on('open', async function open() {
            if(openLogger) logger.info('[ws-' + ws.index +'] open!')  //important logger
        })

        ws.on('message', function incoming(data) {
            let message = JSON.parse(data)
            message.outputIndex = index ++
            all_outputs.get(ws.index).push(message)
            sub_outputs.get(ws.index).push(message)
            if(openLogger) logger.info('[ws-' + ws.index +'] message: ' + data)  //important logger
        })

        ws.on('close', function close() {
            if(openLogger) logger.info('[ws-' + ws.index +'] disconnected!')  //important logger
        })
        return ws
    }

    websocketInterface.prototype.closeWebSocket = function(ws) {
        if(openLogger) {
            logger.debug('sub_outputs: ')
            websocketInterface.prototype.printOutputs(ws.index, sub_outputs)
            logger.debug('all_outputs: ')
            websocketInterface.prototype.printOutputs(ws.index, all_outputs)
        }
        ws.close()
        return new Promise((resolve, reject)=>{
            resolve(websocketInterface.prototype.createOutputs(sub_outputs, all_outputs))
        })
    }

    websocketInterface.prototype.subscribe = function (ws, methodName, params) {
        let requestContent = JSON.stringify(baseInterface.prototype.createJsonRpcRequestContent(this.id++, methodName, params))
        if(openLogger) logger.info('[ws-' + ws.index +'].send: ' + requestContent) //important logger
        return websocketInterface.prototype.subscribeResponse(ws, requestContent)
    }

    websocketInterface.prototype.subscribeResponse = function(ws, content){
        if(openLogger) {
            logger.debug('sub_outputs: ')
            websocketInterface.prototype.printOutputs(ws.index, sub_outputs)
        }
        websocketInterface.prototype.clearSub(ws.index)
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
                logger.debug('[ws-' + ws.index +'].readyState: ' + ws.readyState)
            }
            resolve(websocketInterface.prototype.createOutputs(sub_outputs, all_outputs))
        })
    }

    //region outputs

    websocketInterface.prototype.clearSub = function(index){
        sub_outputs.get(index).length = 0
    }

    websocketInterface.prototype.getOutputs = function(){
        return websocketInterface.prototype.createOutputs(sub_outputs, all_outputs)
    }

    websocketInterface.prototype.createOutputs = function(sub_outputs, all_outputs){
        return {sub: sub_outputs, all: all_outputs}
    }

    websocketInterface.prototype.printOutputs = function(ws_index, outputs_map){
        let outputs = outputs_map.get(ws_index)
        for(let i = 0; i < outputs.length; i++){
            let output = outputs[i]
            logger.debug(output.outputIndex + '. ' + JSON.stringify(output))
        }
    }

    //endregion

    //endregion

}

module.exports = websocketInterface
