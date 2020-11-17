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

module.exports = tcsCreateAccount = {

    //region create account
    testForCreateAccount: function(server, describeTitle){
        let testCases = []

        let title = '0010\t创建有效的账户'
        let nickName = utility.getDynamicTokenName().symbol
        let needPass = true
        let expectedError = ''
        let testCase = tcsCreateAccount.createSingleTestCaseForCreateAccount(server, title, nickName, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0020\t创建无效的账户:重复的名字'
        nickName = server.mode.addresses.balanceAccount.nickName
        needPass = false
        expectedError = 'the nickname already exists'
        testCase = tcsCreateAccount.createSingleTestCaseForCreateAccount(server, title, nickName, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0020\t创建无效的账户:超过长度的字符串数字'
        nickName = utility.getDynamicTokenName().name + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字'
            + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字'
            + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字'
            + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字'
        needPass = false
        expectedError = ''
        testCase = tcsCreateAccount.createSingleTestCaseForCreateAccount(server, title, nickName, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        framework.testTestCases(server, describeTitle, testCases)
    },

    createSingleTestCaseForCreateAccount: function(server, title, nickName, needPass, expectedError){

        let functionName = consts.rpcFunctions.createAccount
        let txParams = []
        txParams.push(nickName)
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
            tcsCreateAccount.checkCreateAccount,
            expectedResult,
            restrictedLevel.L2,
            [serviceType.newChain],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        return testCase
    },

    checkCreateAccount: function(testCase){
        let response = testCase.actualResult[0]
        let needPass = testCase.expectedResult.needPass
        framework.checkResponse(needPass, response)
        if(needPass){
            let account = response.result[0]
            let nickName = testCase.txParams[0]
            expect(account).to.be.jsonSchema(schema.WALLET_SCHEMA)
            expect(account.address).to.match(/^j/)
            expect(account.secret).to.match(/^s/)
            expect(account.nickname).to.equal(nickName)
        }
        else{
            framework.checkResponseError(testCase, response.message, testCase.expectedResult.expectedError)
        }
    },
    //endregion

}