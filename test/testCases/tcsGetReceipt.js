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

module.exports = tcsGetReceipt = {

    //region tx receipt check

    testForGetTransactionReceipt: function(server, describeTitle){
        let testCases = []

        let title = '0010\t有效交易哈希'
        let hash = server.mode.txs.tx1.hash
        let needPass = true
        let expectedError = ''
        let testCase = tcsGetReceipt.createSingleTestCaseForGetTransactionReceipt(server, title, hash, needPass, expectedError)
        framework.addTestScript(testCases, testCase)

        title = '0020\t无效交易哈希：不存在的交易哈希'
        needPass = false
        hash = 'B9A45BD943EE1F3AB8F505A61F6EE38F251DA723ECA084CBCDAB5076C60F84E8'
        expectedError = framework.getError(140, 't find transaction')
        testCase = tcsGetReceipt.createSingleTestCaseForGetTransactionReceipt(server, title, hash, needPass, expectedError)
        framework.addTestScript(testCases, testCase)

        title = '0020\t无效交易哈希：数字'
        hash = '100093'
        expectedError = framework.getError(-269, 'NewHash256: Wrong length')
        testCase = tcsGetReceipt.createSingleTestCaseForGetTransactionReceipt(server, title, hash, needPass, expectedError)
        framework.addTestScript(testCases, testCase)

        title = '0020\t无效交易哈希：字符串乱码'
        hash = '1231dsfafwrwerwer'
        expectedError = framework.getError(-269, 'encoding/hex: invalid byte')
        // expectedError.description = 'invalid byte'
        testCase = tcsGetReceipt.createSingleTestCaseForGetTransactionReceipt(server, title, hash, needPass, expectedError)
        framework.addTestScript(testCases, testCase)

        framework.testTestScripts(server, describeTitle, testCases)
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
            framework.executeTestActionForGet,
            tcsGetReceipt.checkTransactionReceipt,
            expectedResult,
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        return testCase
    },

    checkTransactionReceipt: function(testCase){
        let response = action.actualResult
        let needPass = testCase.expectedResult.needPass
        framework.checkResponse(response)
        if(needPass){
            // expect(response.result).to.be.jsonSchema(schema.LEDGER_SCHEMA)   //todo need add full block schema
            let affectedNodes = response.result.AffectedNodes
            let from = affectedNodes[1].ModifiedNode.FinalFields.Account
            let to = affectedNodes[2].ModifiedNode.FinalFields.Account
            expect(from).to.be.equals(testCase.server.mode.txs.tx1.Account)
            expect(to).to.be.equals(testCase.server.mode.txs.tx1.Destination)
        }
        else{
            framework.checkResponseError(testCase, response)
        }
    },

//endregion

}
