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

    //region sent txs in one request

    testForSendTxs: function(server, describeTitle, txCount){
        let testCases = []

        //region push params
        let title = '0010\t一个请求执行' + txCount + '个交易'
        let txParams = framework.createTxParamsForTransfer(server)
        let txTemplate = txParams[0]
        for(let i = 1; i < txCount; i++){
            txParams.push(utility.deepClone(txTemplate))
        }
        let testCaseParams = framework.createTestCaseParams(server, '同时发送' + txCount + '个交易',
            consts.rpcFunctions.sendTx, txParams)
        let testCase = framework.createTestCaseByParams(testCaseParams)
        testCase.title = title
        testCase.sendType = consts.sendTxType.InOneRequest
        testCases.push(testCase)
        //endregion

        framework.testTestScripts(server, describeTitle, testCases)
    },

    testForSendTxsFast: function(server, describeTitle, txCount){
        let testCases = []

        //region push params
        let title = '0010\t快速执行一个请求' + txCount + '个交易'
        let txParams = framework.createTxParamsForTransfer(server)
        let txTemplate = txParams[0]
        for(let i = 1; i < txCount; i++){
            txParams.push(utility.deepClone(txTemplate))
        }
        let testCaseParams = framework.createTestCaseParams(server, '同时发送' + txCount + '个交易',
            consts.rpcFunctions.sendTx, txParams)
        let testCase = framework.createTestCaseByParams(testCaseParams)
        testCase.title = title
        testCase.sendType = consts.sendTxType.InOneRequestQuickly
        testCase.checkFunction = tcsSendTxInOneRequest.checkForSendTxsFast
        testCases.push(testCase)
        //endregion

        framework.testTestScripts(server, describeTitle, testCases)
    },

    checkForSendTxsFast: function(testCase){
        let txParamsCount = testCase.txParams.length
        let hashList= testCase.actualResult[0].result
        let hashCount = 0
        for(let i = 0; i < hashList.length; i++){
            let hash = hashList[i].result
            if(hash && utility.isHex(hash)){
                hashCount++
            }
        }
        expect(hashCount).to.be.equal(txParamsCount)
    },

    //endregion

}
