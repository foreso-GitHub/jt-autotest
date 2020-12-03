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
        let sender = server.mode.addresses.rootAccount
        let message = '0x1234567890abcde0'

        let title = '0010\t有效的地址参数'
        {
            let needPass = true
            let expectedError = ''
            let txParam = {from: sender.address, secret: sender.secret, message: message}
            let expectedSignedTxs = ['0x30450221009C5F37C5E5DE954C90D3A7FD74CB598A8E212E3A44214DC9844F2A619B156734022018363E760D2561DC15AFB746CFA07B62DF6EBC2F96C8F5F3CA0DB66CE157CF67']
            let testCase = tcsSign.createSingleTestCase(server, title, [txParam], expectedSignedTxs, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = '0020\t无效的地址参数： 没有秘钥'
        {
            needPass = false
            expectedError = 'null from key'
            txParam = {from: server.mode.addresses.sender1.address, message: message}
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
            expectedSignedTxs = ['0x3045022100AA1BFE79EAFCBB86F3C978A797B53749F8F5EC904EE3DAAB937998B90E3747F002201B3DF017B51509134765CC50A4E54D773466C2A4A4DB463DCD1E6E352E4536AD']
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