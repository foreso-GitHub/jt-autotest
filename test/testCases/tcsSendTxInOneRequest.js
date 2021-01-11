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

    testForSendTxs: function(server, describeTitle, txCount){
        let testScripts = []
        let testCaseCode
        let scriptCode

        testCaseCode = 'UNK_UNKNOWN_000000'
        scriptCode = '000100_一个请求执行' + txCount + '个交易'
        let txParams = framework.createTxParamsForTransfer(server)
        let txTemplate = txParams[0]
        let expectResults = []
        for(let i = 1; i < txCount; i++){
            txParams.push(utility.deepClone(txTemplate))
            expectResults.push(framework.createExpecteResult({needPass: true}))
        }
        let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, consts.rpcFunctions.sendTx, txParams)
        testScript.actions[0].expectedResults = testScript.actions[0].expectedResults.concat(expectResults)
        testScripts.push(testScript)
        framework.testTestScripts(server, describeTitle, testScripts)
    },

    //endregion

}
