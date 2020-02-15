let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default');
const consts = require("../consts")

const Remote = require('swtc-lib').Remote
let remote = new Remote()
//const remote = new (require('swtc-lib').Remote)({server: 'ws://139.198.19.157:5055', issuer: 'jBciDE8Q3uJjf111VeiUNM775AMKHEbBLS'})
// const remote = new (require('swtc-lib').Remote)({server: 'wss://c05.jingtum.com:5020', issuer: 'jBciDE8Q3uJjf111VeiUNM775AMKHEbBLS'})

//主链： wss://c04.jingtum.com:5020
//基金会测试链： ws://139.198.19.157:5055
// jpmKEm2sUevfpFjS7QHdT8Sx7ZGoEXTJAz
// ssiUDhUpUZ5JDPWZ9Twt27Ckq6k4C

let address = 'jpmKEm2sUevfpFjS7QHdT8Sx7ZGoEXTJAz1'
let secret = 'ssiUDhUpUZ5JDPWZ9Twt27Ckq6k4C'
let to = 'j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd'
let memo = 'test'

let _Url = ''
let _Mode

function swtclib() {
    let server = this

    //region interfaces

    //region block number
    this.submitPromise_BlockNumber = function (resolve, reject) {
        remote.requestLedgerClosed().submitPromise()
            .then((data)=>{
                logger.debug(data)
                let response = server.createResponse(data.ledger_index)
                resolve(response)
            })
            .catch((error)=>{server.processError(error, resolve, server)})
    }

    this.responseBlockNumber = function () {
        let params = []
        return this.getResponse(consts.rpcFunctions.getBlockNumber, params)
    }

    this.getBlockNumber = async function(){
        let response = await this.responseBlockNumber()
        return response.result
    }
    //endregion

    //region common methods

    this.getResponse = function (methodName, params) {
        logger.debug('Trying to invoke ' + methodName + '!')
        return new Promise((resolve, reject) => {

            if(remote.isConnected()){
                logger.debug("Remote is connected!")
                server.processRequest(methodName, params, resolve, reject)
            }
            else{
                logger.debug("Remote is not connected, trying to connect!")
                remote.connectPromise().then(function(){
                    logger.debug("Connected!")
                    server.processRequest(methodName, params, resolve, reject)
                }).catch((error)=>{server.processError(error, resolve, server)})
            }

            // remote.connectPromise().then(function(){
            //     if(methodName === consts.rpcFunctions.getBlockNumber){
            //         server.submitPromise_BlockNumber(resolve, reject)
            //     }
            //     // remote.disconnect()
            // }).catch((error)=>{server.processError(error, resolve, server)})

        })
    }

    this.processRequest = function(methodName, params, resolve, reject){
        if(methodName === consts.rpcFunctions.getBlockNumber){
            server.submitPromise_BlockNumber(resolve, reject)
        }
    }

    //region create response
    this.createEmptyResponse = function(){
        let response = {}
        response.id = -1
        response.jsonrpc = '2.0'
        return response
    }

    this.createError = function(code, message){
        let response = this.createEmptyResponse()
        response.status = 'error'
        response.result = message
        return response
    }

    this.createResponse = function(data){
        let response = this.createEmptyResponse()
        response.status = 'success'
        response.result = data
        return response
    }
    //endregion

    //region error process
    this.processError = function(error, resolve, server){
        logger.debug(error)
        resolve(server.createError(0, error))
        remote.disconnect()
    }
    //endregion

    //region connect
    this.connect = function(){
        return remote.connectPromise()
    }

    this.disconnect = function(){
        remote.disconnect()
    }
    //endregion

    //region config

    this.init = function(mode){
        _Mode = mode
        _Url = mode.initParams.url
        remote = new (require('swtc-lib').Remote)({server: mode.initParams.url, issuer: mode.initParams.issuer})
    }

    this.getName = function(){
        return "swtc-lib@" + _Url
    }

    this.getMode = function(){
        return _Mode
    }

    this.getTestConfig = function(){
        return _Mode.testConfig
    }

    //endregion

    //endregion


    //endregion

}

module.exports = swtclib