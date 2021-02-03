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

    createPerformanceTestParam: function(txFunctionName, actionCount, txCount, serverCount, fromCount, toCount,
                                         timeout, needResetSequence, needCheck, quickTx){
        let param = {}
        param.txFunctionName = txFunctionName           // sendTx or signTx+sendRaw
        param.actionCount = actionCount                 // total count of actions in this test
        param.txCount = txCount                         // tx count will be sent in per action
        param.serverCount = serverCount                 // send txs through different server
        param.fromCount = fromCount                     // send txs by different addresses
        param.toCount = toCount                         // send txs by different addresses
        param.timeout = timeout                         // time out between 2 actions.
        param.needResetSequence = needResetSequence     // if need get sequence from chain on beginning, so avoid to be frozen in skipped sequence
        param.needCheck = needCheck                     // if need check test result. some performance test need not check result.
        param.quickTx = quickTx                         // flags='0x40000000'
        return param
    },

    testForSendTxs: function(server, describeTitle, txFunctionName, actionCount, txCount, needResetSequence, timeout, needCheck, quickTx){
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
            if(quickTx) txParams[0].flags = consts.flags.quick
            let txTemplate = txParams[0]
            let expectResults = []

            //select server in server list, then change action.server

            for(let i = 1; i < txCount; i++){
                txParams.push(utility.deepClone(txTemplate))

                //select from address in address list, then change param.from

                //select to address in address list, then change param.to

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
