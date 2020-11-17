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

module.exports = tcsCreateWallet = {

    //region create account
    testForCreateWallet: function(server, describeTitle){
        let testCases = []

        //region 参数为空
        let title = '0010\t创建账户-参数为空'
        let needPass = true
        let expectedError = ''
        let type = null
        let testCase = tcsCreateWallet.createSingleTestCaseForCreateWallet(server, title, type, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0011\t创建账户-参数为""'
        type = ''
        testCase = tcsCreateWallet.createSingleTestCaseForCreateWallet(server, title, type, needPass, expectedError)
        framework.addTestCase(testCases, testCase)
        //endregion

        //region ECDSA
        title = '0020\t创建账户-参数为ECDSA'
        type = consts.walletTypes.ECDSA
        testCase = tcsCreateWallet.createSingleTestCaseForCreateWallet(server, title, type, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0021\t创建账户-参数为ecdsa'
        type = 'ecdsa'
        testCase = tcsCreateWallet.createSingleTestCaseForCreateWallet(server, title, type, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0022\t创建账户-参数为Ecdsa'
        type = 'Ecdsa'
        testCase = tcsCreateWallet.createSingleTestCaseForCreateWallet(server, title, type, needPass, expectedError)
        framework.addTestCase(testCases, testCase)
        //endregion

        //region Ed25519
        title = '0020\t创建账户-参数为ECDSA'
        type = consts.walletTypes.Ed25519
        testCase = tcsCreateWallet.createSingleTestCaseForCreateWallet(server, title, type, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0021\t创建账户-参数为ed25519'
        type = 'ed25519'
        testCase = tcsCreateWallet.createSingleTestCaseForCreateWallet(server, title, type, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0022\t创建账户-参数为ED25519'
        type = 'ED25519'
        testCase = tcsCreateWallet.createSingleTestCaseForCreateWallet(server, title, type, needPass, expectedError)
        framework.addTestCase(testCases, testCase)
        //endregion

        //region SM2
        title = '0020\t创建账户-参数为SM2'
        type = consts.walletTypes.SM2
        testCase = tcsCreateWallet.createSingleTestCaseForCreateWallet(server, title, type, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0021\t创建账户-参数为sm2'
        type = 'sm2'
        testCase = tcsCreateWallet.createSingleTestCaseForCreateWallet(server, title, type, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0022\t创建账户-参数为Sm2'
        type = 'Sm2'
        testCase = tcsCreateWallet.createSingleTestCaseForCreateWallet(server, title, type, needPass, expectedError)
        framework.addTestCase(testCases, testCase)
        //endregion

        //region 无效的参数
        title = '0050\t创建账户-无效的参数: 数字'
        type = 123123
        needPass = false
        expectedError = 'key type is not string'
        testCase = tcsCreateWallet.createSingleTestCaseForCreateWallet(server, title, type, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0051\t创建账户-无效的参数: 非ECDSA/Ed25519/SM2'
        type = "123123"
        needPass = false
        expectedError = 'key type is not string'
        testCase = tcsCreateWallet.createSingleTestCaseForCreateWallet(server, title, type, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0052\t创建账户-无效的参数: 空格'
        type = "   "
        needPass = false
        expectedError = 'key type is not string'
        testCase = tcsCreateWallet.createSingleTestCaseForCreateWallet(server, title, type, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0053\t创建账户-无效的参数: 空格SM2'
        type = "  SM2"
        needPass = false
        expectedError = 'key type is not string'
        testCase = tcsCreateWallet.createSingleTestCaseForCreateWallet(server, title, type, needPass, expectedError)
        framework.addTestCase(testCases, testCase)
        //endregion

        framework.testTestCases(server, describeTitle, testCases)
    },

    createSingleTestCaseForCreateWallet: function(server, title, type, needPass, expectedError){

        let functionName = consts.rpcFunctions.createWallet
        let txParams = []
        txParams.push(type)
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
            tcsCreateWallet.checkCreateWallet,
            expectedResult,
            restrictedLevel.L2,
            [serviceType.newChain],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        return testCase
    },

    checkCreateWallet: function(testCase){
        let response = testCase.actualResult[0]
        let needPass = testCase.expectedResult.needPass
        let type = testCase.txParams[0]
        framework.checkResponse(needPass, response)
        if(needPass){
            let account = response.result[0]
            expect(account).to.be.jsonSchema(schema.WALLET_SCHEMA)
            expect(account.address).to.match(/^j/)
            expect(account.secret).to.match(/^s/)
            if(!type || type == ''){
                expect(account.type).to.match(/\bECDSA|\bEd25519|\bSM2/)
            }
            else{
                expect(account.type.toUpperCase()).to.equal(type.toUpperCase())
            }

        }
        else{
            framework.checkResponseError(testCase, response.message, testCase.expectedResult.expectedError)
        }
    },
    //endregion

}