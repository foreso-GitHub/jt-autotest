let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default');
const consts = require("../consts")

const Remote = require('swtc-lib').Remote
const remote = new (require('swtc-lib').Remote)({server: 'ws://139.198.19.157:5055', issuer: 'jBciDE8Q3uJjf111VeiUNM775AMKHEbBLS'})
//主链： wss://c04.jingtum.com:5020
//基金会测试链： ws://139.198.19.157:5055

// jpmKEm2sUevfpFjS7QHdT8Sx7ZGoEXTJAz
// ssiUDhUpUZ5JDPWZ9Twt27Ckq6k4C

let address = 'jpmKEm2sUevfpFjS7QHdT8Sx7ZGoEXTJAz1'
let secret = 'ssiUDhUpUZ5JDPWZ9Twt27Ckq6k4C'
let to = 'j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd'
let memo = 'test'


function swtclib() {
    let server = this

    //region interfaces

    //region block number
    this.responseBlockNumber = function (resolve, reject) {
        remote.requestLedgerClosed().submitPromise()
            .then((data)=>{
                logger.debug(data)
                let response = server.createResponse(data.ledger_index)
                resolve(response)
            })
            .catch((error)=>{server.processError(error, resolve, server)})
    }
    //endregion

    //region common methods
    this.getResponse = function (methodName, params) {
        logger.debug('Trying to invoke ' + methodName + '!')
        return new Promise((resolve, reject) => {
            remote.connectPromise().then(function(){
                if(methodName === consts.rpcFunctions.getBlockNumber){
                    server.responseBlockNumber(resolve, reject)
                }
                remote.disconnect()
            }).catch((error)=>{server.processError(error, resolve, server)})
        })
    }
    //endregion

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

    //endregion

}

module.exports = swtclib