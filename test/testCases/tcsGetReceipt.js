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
let utility = require('../framework/testUtility')
//endregion
//endregion

module.exports = tcsGetReceipt = {

    //region tx receipt check

    testForGetTransactionReceipt: function(server, describeTitle){
        let testCases = []

        let title = '0010\t有效交易哈希'
        let hash = server.mode.txs.tx1.hash
        let needPass = true
        let expectedError = ''
        let testCase = tcsGetReceipt.createSingleTestCaseForGetTransactionReceipt(server, title, hash, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0020\t无效交易哈希：不存在的交易哈希'
        needPass = false
        hash = 'B9A45BD943EE1F3AB8F505A61F6EE38F251DA723ECA084CBCDAB5076C60F84E8'
        expectedError = 'can\'t find transaction'
        testCase = tcsGetReceipt.createSingleTestCaseForGetTransactionReceipt(server, title, hash, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0020\t无效交易哈希：数字'
        hash = '100093'
        expectedError = 'NewHash256: Wrong length'
        testCase = tcsGetReceipt.createSingleTestCaseForGetTransactionReceipt(server, title, hash, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0020\t无效交易哈希：字符串乱码'
        hash = '1231dsfafwrwerwer'
        expectedError = 'invalid byte'
        testCase = tcsGetReceipt.createSingleTestCaseForGetTransactionReceipt(server, title, hash, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        framework.testTestCases(server, describeTitle, testCases)
    },

    createSingleTestCaseForGetTransactionReceipt: function(server, title, hash, needPass, expectedError){

        let functionName = consts.rpcFunctions.getTransactionReceipt
        let txParams = []
        txParams.push(hash)

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
            tcsGetReceipt.checkTransactionReceipt,
            expectedResult,
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        return testCase
    },

    checkTransactionReceipt: function(testCase){
        let response = testCase.actualResult[0]
        let needPass = testCase.expectedResult.needPass
        framework.checkResponse(needPass, response)
        if(needPass){
            // expect(response.result).to.be.jsonSchema(schema.LEDGER_SCHEMA)   //todo need add full block schema
            let affectedNodes = response.result.AffectedNodes
            let from = affectedNodes[1].ModifiedNode.FinalFields.Account
            let to = affectedNodes[2].ModifiedNode.FinalFields.Account
            expect(from).to.be.equals(testCase.server.mode.txs.tx1.Account)
            expect(to).to.be.equals(testCase.server.mode.txs.tx1.Destination)
        }
        else{
            framework.checkResponseError(testCase, response.message, testCase.expectedResult.expectedError)
        }
    },

//endregion

}