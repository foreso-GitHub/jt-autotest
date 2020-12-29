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
//endregion
//endregion

module.exports = tcsGetBlock = {

    //region block check

    testForGetBlockByNumber: function(server, describeTitle){
        let functionName = consts.rpcFunctions.getBlockByNumber
        let blockNumber = server.mode.txs.block.blockNumber
        let testCases = tcsGetBlock.createTestCasesForGetBlock(server, functionName, blockNumber)
        framework.testTestCases(server, describeTitle, testCases)
    },

    testForGetBlockByHash: function(server, describeTitle){
        let functionName = consts.rpcFunctions.getBlockByHash
        let blockHash = server.mode.txs.block.blockHash
        let testCases = tcsGetBlock.createTestCasesForGetBlock(server, functionName, blockHash)
        framework.testTestCases(server, describeTitle, testCases)
    },

    createTestCasesForGetBlock: function(server, functionName, numberOrHash){
        let testCases = []
        let validNumberOrHash = numberOrHash
        let testNumber = '0010'
        let showFullTx = false
        let needPass = true
        let expectedError = {"error":"full is not boolean","status":-269,"type":"temBAD_PARAMETER"}
        let testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        testCase.supportedServices.push(serviceType.oldChain)
        framework.addTestCase(testCases, testCase)

        testNumber = '0020'
        showFullTx = true
        testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        testCase.supportedServices.push(serviceType.oldChain)
        framework.addTestCase(testCases, testCase)

        if(functionName == consts.rpcFunctions.getBlockByNumber){
            testNumber = '0030'
            numberOrHash = 'earliest'
            showFullTx = true
            testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
            testCase.restrictedLevel = restrictedLevel.L4
            framework.addTestCase(testCases, testCase)

            testNumber = '0040'
            numberOrHash = 'earliest'
            showFullTx = false
            testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
            testCase.restrictedLevel = restrictedLevel.L4
            framework.addTestCase(testCases, testCase)

            testNumber = '0050'
            numberOrHash = 'latest'
            showFullTx = true
            testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
            testCase.restrictedLevel = restrictedLevel.L4
            framework.addTestCase(testCases, testCase)

            testNumber = '0060'
            numberOrHash = 'latest'
            showFullTx = false
            testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
            testCase.restrictedLevel = restrictedLevel.L4
            framework.addTestCase(testCases, testCase)

            testNumber = '0090'
            numberOrHash = 'pending'
            showFullTx = true
            testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
            testCase.restrictedLevel = restrictedLevel.L4
            framework.addTestCase(testCases, testCase)

            testNumber = '0100'
            numberOrHash = 'pending'
            showFullTx = false
            testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
            testCase.restrictedLevel = restrictedLevel.L4
            framework.addTestCase(testCases, testCase)
        }

        testNumber = '0110_0001'
        numberOrHash = validNumberOrHash
        showFullTx = 'wrwerwre'
        needPass = false
        expectedError = framework.getError(-269)
        testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        testCase.title = testNumber + '\t有效区块编号，无效Boolean参数：showFullTx是字符串'
        testCase.supportedServices.push(serviceType.oldChain)
        framework.addTestCase(testCases, testCase)

        testNumber = '0110_0002'
        numberOrHash = validNumberOrHash
        showFullTx = 123123
        needPass = false
        expectedError = framework.getError(-269)
        testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        testCase.title = testNumber + '\t有效区块编号，无效Boolean参数：showFullTx是数字'
        testCase.supportedServices.push(serviceType.oldChain)
        framework.addTestCase(testCases, testCase)

        testNumber = '0110_0003'
        numberOrHash = validNumberOrHash
        showFullTx = null
        needPass = false
        expectedError = framework.getError(-269)
        testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        testCase.title = testNumber + '\t有效区块编号，无效Boolean参数：showFullTx是空值'
        testCase.supportedServices.push(serviceType.oldChain)
        framework.addTestCase(testCases, testCase)

        testNumber = '0120_0001'
        numberOrHash = '9990000000'
        showFullTx = false
        needPass = false
        expectedError = framework.getError(functionName == consts.rpcFunctions.getBlockByNumber ? 140 : -269)
        testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        // testCase.supportedServices.push(serviceType.oldChain)  //old chain not support huge block number, it will cause test hook more than 20s
        framework.addTestCase(testCases, testCase)

        testNumber = '0120_0002'
        numberOrHash = '99900000'
        showFullTx = false
        needPass = false
        expectedError = framework.getError(functionName == consts.rpcFunctions.getBlockByNumber ? 140 : -269)
        testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        if(functionName == consts.rpcFunctions.getBlockByNumber) testCase.supportedServices.push(serviceType.oldChain)
        framework.addTestCase(testCases, testCase)

        testNumber = '0120_0003'
        numberOrHash = '-1000'
        showFullTx = false
        needPass = false
        expectedError = framework.getError(functionName == consts.rpcFunctions.getBlockByNumber ? 140 : -269)
        testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        if(functionName == consts.rpcFunctions.getBlockByNumber) testCase.supportedServices.push(serviceType.oldChain)
        framework.addTestCase(testCases, testCase)

        testNumber = '0120_0004'
        numberOrHash = 'abcdefg'
        showFullTx = false
        needPass = false
        expectedError = framework.getError(functionName == consts.rpcFunctions.getBlockByNumber ? 140 : -269)
        testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        if(functionName == consts.rpcFunctions.getBlockByNumber) testCase.supportedServices.push(serviceType.oldChain)
        framework.addTestCase(testCases, testCase)

        return testCases
    },

    createSingleTestCaseForGetBlockByNumber: function(server, testNumber, functionName, numberOrHash,
                                                               showFullTx, needPass, expectedError){

        let txParams = []
        txParams.push(numberOrHash)
        txParams.push(showFullTx)

        let expectedResult = {}
        expectedResult.needPass = needPass
        expectedResult.expectedError = expectedError

        let title = testNumber + '\t'+ (needPass ? '有' : '无') + '效区块编号，' + (showFullTx ? '' : '不') + '需要返回所有交易详情'

        let testCase = framework.createTestCase(
            title,
            server,
            functionName,
            txParams,
            null,
            framework.executeTestCaseForGet,
            tcsGetBlock.checkBlock,
            expectedResult,
            restrictedLevel.L2,
            [serviceType.newChain,],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        return testCase
    },

    checkBlock: function(testCase){
        let response = testCase.actualResult[0]
        let needPass = testCase.expectedResult.needPass
        framework.checkResponse(needPass, response)
        if(needPass){
            expect(response.result).to.be.jsonSchema(schema.LEDGER_SCHEMA)   //todo need add full block schema
            let functionName = testCase.txFunctionName
            let blockNumberOrHash = testCase.txParams[0]
            expect((functionName === consts.rpcFunctions.getBlockByNumber) ? response.result.ledger_index : response.result.ledger_hash)
                .to.be.equals(blockNumberOrHash)
            let server = testCase.server
            expect(response.result.transactions.length).to.be.equals(server.mode.txs.block.txCountInBlock)
            let showFullTx = testCase.txParams[1]
            if(showFullTx != null){
                let tx = response.result.transactions[0]
                expect(typeof tx == 'object' || utility.isJSON(tx)).to.be.equals(showFullTx)
            }
        }
        else{
            framework.checkResponseError(testCase, response, testCase.expectedResult.expectedError)
        }
    },

//endregion

}
