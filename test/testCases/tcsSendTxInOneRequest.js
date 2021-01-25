//region require
//region mocha
const chai = require('chai')
chai.use(require('chai-json-schema'))
const expect = chai.expect
//endregion
//region logger
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
//endregion
//region test framework
const framework = require('../framework/framework')
const schema = require('../framework/schema')
const { responseStatus,  serviceType,  interfaceType,  testMode,  restrictedLevel, } = require("../framework/enums")
const consts = require('../framework/consts')
let utility = require('../framework/testUtility')
const { token, } = require("../testData/testData")
//endregion
//endregion

module.exports = tcsSendTxInOneRequest = {

    testForSendTxs: function(server, describeTitle, txFunctionName, actionCount, txCount, needResetSequence, timeout, needCheck, ){
        let testScripts = []
        let testCaseCode
        let scriptCode

        testCaseCode = 'UNK_UNKNOWN_000000'
        scriptCode = '000100_tcsSendTxInOneRequest_' + actionCount + '个请求，各执行' + txCount + '个交易'

        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        for(let j = 0; j < actionCount; j++){
            let txParams = framework.createTxParamsForTransfer(server)
            let txTemplate = txParams[0]
            let expectResults = []
            for(let i = 1; i < txCount; i++){
                txParams.push(utility.deepClone(txTemplate))
                expectResults.push(framework.createExpecteResult({needPass: true}))
            }
            framework.pushTestActionForSendAndSign(testScript, txFunctionName, txParams)
            if(txFunctionName == consts.rpcFunctions.sendTx){
                let action = testScript.actions[j]
                action.needResetSequence = needResetSequence
                action.timeout = timeout
                action.expectedResults = testScript.actions[0].expectedResults.concat(expectResults)
                if(needCheck != undefined && needCheck == false){
                    action.checkFunction = null
                }
            }
            else if(txFunctionName == consts.rpcFunctions.signTx){
                let action_sign = testScript.actions[j * 2]
                let action_sendRaw = testScript.actions[j * 2 + 1]
                action_sign.needResetSequence = needResetSequence
                action_sign.expectedResults = testScript.actions[0].expectedResults.concat(expectResults)
                action_sendRaw.timeout = timeout
                action_sendRaw.expectedResults = testScript.actions[0].expectedResults.concat(expectResults)
                if(needCheck != undefined && needCheck == false){
                    action_sign.checkFunction = null
                    action_sendRaw.checkFunction = null
                }
            }
        }

        testScripts.push(testScript)
        framework.testTestScripts(server, describeTitle, testScripts)
    },

}
