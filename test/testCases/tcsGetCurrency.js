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

module.exports = tcsGetCurrency = {

    //region get currency
    testForGetCurrency: function(server, describeTitle){
        tcsGetCurrency.testForGetCurrencyByTag(server, describeTitle, null)
        tcsGetCurrency.testForGetCurrencyByTag(server, describeTitle, 'validated')
        tcsGetCurrency.testForGetCurrencyByTag(server, describeTitle, 'current')
        tcsGetCurrency.testForGetCurrencyByTag(server, describeTitle, 'closed')
    },

    testForGetCurrencyByTag: function(server, describeTitle, tag){
        let globalCoin = server.mode.coins[0]
        let localCoin = server.mode.coins[1]
        let testCases = []
        describeTitle = describeTitle + '， tag为' + tag

        describe(describeTitle, function () {

            let title = '0010\t查询有效的全局代币，不带issuer'
            let needPass = true
            let expectedError = ''
            let testCase = tcsGetCurrency.createSingleTestCaseForGetCurrency(server, title,
                globalCoin.symbol, null, tag, needPass, expectedError)
            framework.addTestCase(testCases, testCase)

            title = '0011\t查询有效的本地代币'
            testCase = tcsGetCurrency.createSingleTestCaseForGetCurrency(server, title,
                globalCoin.symbol, globalCoin.issuer, tag, needPass, expectedError)
            framework.addTestCase(testCases, testCase)

            title = '0020\t查询有效的本地代币'
            testCase = tcsGetCurrency.createSingleTestCaseForGetCurrency(server, title,
                localCoin.symbol, localCoin.issuer, tag, needPass, expectedError)
            framework.addTestCase(testCases, testCase)

            title = '0030\t查询无效的代币，代币不存在'
            let symbol = 'NoCoin_1'
            needPass = false
            expectedError = 'can\'t find currency'
            testCase = tcsGetCurrency.createSingleTestCaseForGetCurrency(server, title,
                symbol, null, tag, needPass, expectedError)
            framework.addTestCase(testCases, testCase)

            title = '0031\t查询无效的代币，代币名过长'
            symbol = 'CoinNotExists'
            expectedError = 'Bad Currency'
            testCase = tcsGetCurrency.createSingleTestCaseForGetCurrency(server, title,
                symbol, null, tag, needPass, expectedError)
            framework.addTestCase(testCases, testCase)

            title = '0040\t查询无效的全局代币，错误的issuer'
            expectedError = 'can\'t find currency'
            let wrongAddress = 'jskmdWGNuDA63aNJn3yWjdoDf2NwtS8FoJ'
            testCase = tcsGetCurrency.createSingleTestCaseForGetCurrency(server, title,
                globalCoin.symbol, wrongAddress, tag, needPass, expectedError)
            framework.addTestCase(testCases, testCase)

            title = '0041\t查询无效的全局代币，错误格式的issuer'
            expectedError = 'can\'t find currency'
            testCase = tcsGetCurrency.createSingleTestCaseForGetCurrency(server, title,
                globalCoin.symbol, globalCoin.issuer + 'a', tag, needPass, expectedError)
            framework.addTestCase(testCases, testCase)

            title = '0050\t查询无效的本地代币，错误的issuer'
            expectedError = 'can\'t find currency'
            testCase = tcsGetCurrency.createSingleTestCaseForGetCurrency(server, title,
                localCoin.symbol, wrongAddress, tag, needPass, expectedError)
            framework.addTestCase(testCases, testCase)

            title = '0051\t查询无效的本地代币，错误格式的issuer'
            expectedError = 'can\'t find currency'
            testCase = tcsGetCurrency.createSingleTestCaseForGetCurrency(server, title,
                localCoin.symbol, localCoin.issuer + 'a', tag, needPass, expectedError)
            framework.addTestCase(testCases, testCase)

            framework.testTestCases(server, describeTitle, testCases)
        })
    },

    createSingleTestCaseForGetCurrency: function(server, title, symbol, issuer, tag, needPass, expectedError){
        let functionName = consts.rpcFunctions.getCurrency
        let txParams = []
        txParams.push(symbol)
        if(issuer != null) txParams.push(issuer)
        if(tag != null) txParams.push(tag)
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
            tcsGetCurrency.checkGetCurrency,
            expectedResult,
            restrictedLevel.L2,
            [serviceType.newChain,],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        return testCase
    },

    checkGetCurrency: function(testCase){
        let response = testCase.actualResult[0]
        let needPass = testCase.expectedResult.needPass
        framework.checkResponse(needPass, response)
        if(needPass){
            expect(response.result.TotalSupply.currency).to.equals(testCase.txParams[0])
        }
        else{
            framework.checkResponseError(testCase, response.message, testCase.expectedResult.expectedError)
        }
    },
//endregion

}