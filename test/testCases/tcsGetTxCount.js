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
const consts = require('../framework/lib/base/consts')
let utility = require('../utility/testUtility')
//endregion
//endregion

module.exports = tcsGetTxCount = {

    //region tx count check

    testForGetBlockTransactionCountByHash: function(server, describeTitle){
        let testCases = []
        let functionName = consts.rpcFunctions.getBlockTransactionCountByHash

        let title = '0010\t查询有效区块哈希'
        let hash = server.mode.txs.block.blockHash
        let needPass = true
        let expectedError = ''
        let testCase = tcsGetTxCount.createSingleTestCaseForGetBlockTransactionCount(server, title, functionName, hash, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0020\t无效交易哈希：不存在的hash'
        hash = 'B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A'
        needPass = false
        expectedError = 'can\'t find block'
        testCase = tcsGetTxCount.createSingleTestCaseForGetBlockTransactionCount(server, title, functionName, hash, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0020\t无效交易哈希：hash长度超过标准'
        hash = 'B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A1F'
        needPass = false
        expectedError = 'index out of range'
        testCase = tcsGetTxCount.createSingleTestCaseForGetBlockTransactionCount(server, title, functionName, hash, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        framework.testTestCases(server, describeTitle, testCases)
    },

    testForGetBlockTransactionCountByNumber: function(server, describeTitle){
        let testCases = []
        let functionName = consts.rpcFunctions.getBlockTransactionCountByNumber

        let title = '0010\t查询有效区块编号'
        let blockNumber = server.mode.txs.block.blockNumber
        let needPass = true
        let expectedError = ''
        let testCase = tcsGetTxCount.createSingleTestCaseForGetBlockTransactionCount(server, title, functionName, blockNumber, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0020\t无效交易编号：9999999'
        blockNumber = '999999999'
        needPass = false
        expectedError = 'can\'t find block'
        testCase = tcsGetTxCount.createSingleTestCaseForGetBlockTransactionCount(server, title, functionName, blockNumber, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0020\t无效交易编号：负数'
        blockNumber = '-100'
        needPass = false
        expectedError = 'invalid syntax'
        testCase = tcsGetTxCount.createSingleTestCaseForGetBlockTransactionCount(server, title, functionName, blockNumber, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0020\t无效交易编号：乱码'
        blockNumber = 'addeew'
        needPass = false
        expectedError = 'invalid syntax'
        testCase = tcsGetTxCount.createSingleTestCaseForGetBlockTransactionCount(server, title, functionName, blockNumber, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        framework.testTestCases(server, describeTitle, testCases)
    },

    createSingleTestCaseForGetBlockTransactionCount: function(server, title, functionName, hashOrNumber, needPass, expectedError){

        let txParams = []
        txParams.push(hashOrNumber)

        let expectedResult = {}
        expectedResult.needPass = needPass
        expectedResult.isErrorInResult = true
        expectedResult.expectedError = expectedError

        let testCase = framework.createTestCase(
            title,
            server,
            functionName,
            txParams,
            null,
            framework.executeTestCaseForGet,
            tcsGetTxCount.checkBlockTransactionCount,
            expectedResult,
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        return testCase
    },

    checkBlockTransactionCount: function(testCase){
        let response = testCase.actualResult[0]
        let needPass = testCase.expectedResult.needPass
        framework.checkResponse(needPass, response)
        if(needPass){
            let txCount = testCase.server.mode.txs.block.txCountInBlock
            expect(txCount).to.equal(response.result)
        }
        else{
            expect(response.result).to.contains(testCase.expectedResult.expectedError)
        }
    },

    //endregion

}