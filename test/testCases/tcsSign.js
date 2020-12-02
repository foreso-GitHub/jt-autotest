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

module.exports = tcsSign = {

    //region create account
    testForSign: function(server, describeTitle){
        let testCases = []
        let sender = server.mode.addresses.sender1
        let message = '0x1234567890abcde0'

        let title = '0010\t有效的地址参数'
        {
            let needPass = true
            let expectedError = ''
            let txParam = {from: sender.address, secret: sender.secret, message: message}
            let expectedSignedTxs = ['0x3044022021A965D2E9AB744A054A90A1A4CF7C9EAB148349D51B1A346A72DA0AF891EEBC02205A7172D77E7C0782B60C9D4CED0429B2961DA38ADF154F4B78D4FA76A2DA904F']
            let testCase = tcsSign.createSingleTestCase(server, title, [txParam], expectedSignedTxs, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = '0020\t无效的地址参数： 没有秘钥'
        {
            needPass = false
            expectedError = 'null from key'
            txParam = {from: sender.address, message: message}
            expectedSignedTxs = []
            testCase = tcsSign.createSingleTestCase(server, title, [txParam], expectedSignedTxs, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = '0021\t无效的地址参数： 错误的秘钥1'
        {
            needPass = false
            expectedError = 'Unknown secret format'
            txParam = {from: sender.address, secret: '错误的秘钥', message: message}
            expectedSignedTxs = []
            testCase = tcsSign.createSingleTestCase(server, title, [txParam], expectedSignedTxs, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = '0022\t无效的地址参数： 错误的秘钥2'
        {
            needPass = false
            expectedError = 'Bad Base58 checksum'
            txParam = {from: sender.address, secret: sender.secret + '1', message: message}
            expectedSignedTxs = []
            testCase = tcsSign.createSingleTestCase(server, title, [txParam], expectedSignedTxs, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = '0023\t无效的地址参数： 错误的发起钱包地址（乱码字符串）'
        {
            needPass = false
            expectedError = 'Bad account address'
            txParam = {from: sender.address + '1', secret: sender.secret, message: message}
            expectedSignedTxs = []
            expectedSignedTxs = ['0x304402204EDF7F9B3039663A89B50F1254EE8F3094BED8F23DA733DBDB166DA63C7B363C02203D220EB6B80BC629142462740B0990816749191C6B664AA4F3C80736DB27A740']
            testCase = tcsSign.createSingleTestCase(server, title, [txParam], expectedSignedTxs, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = '0030\t过长的签名消息：32k消息'
        {
            needPass = true
            expectedError = ''
            message = '0x' + utility.createMemosWithSpecialLength(32768)[0]  //32k hex
            txParam = {from: sender.address, secret: sender.secret, message: message}
            expectedSignedTxs = ['0x304402204EDF7F9B3039663A89B50F1254EE8F3094BED8F23DA733DBDB166DA63C7B363C02203D220EB6B80BC629142462740B0990816749191C6B664AA4F3C80736DB27A740']
            testCase = tcsSign.createSingleTestCase(server, title, [txParam], expectedSignedTxs, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        framework.testTestCases(server, describeTitle, testCases)
    },

    createSingleTestCase: function(server, title, txParams, expectedSignedTxs, needPass, expectedError){

        let functionName = consts.rpcFunctions.sign
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
            tcsSign.checkSign,
            expectedResult,
            restrictedLevel.L2,
            [serviceType.newChain],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )
        testCase.expectedSignedTxs = expectedSignedTxs
        return testCase
    },

    checkSign: function(testCase){
        let response = testCase.actualResult[0]
        let needPass = testCase.expectedResult.needPass
        let type = testCase.txParams[0]
        framework.checkResponse(needPass, response)
        if(needPass){
            let signedTxs = testCase.expectedSignedTxs
            let results = response.result
            expect(results.length).to.be.equals(signedTxs.length)
            for(let i = 0; i < results.length; i++){
                expect(results[i]).to.be.equals(signedTxs[i])
            }
        }
        else{
            framework.checkResponseError(testCase, response.message, testCase.expectedResult.expectedError)
        }
    },
    //endregion

}