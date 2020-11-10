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

module.exports = tcsGetAccount = {

    //region get account
    testForGetAccount: function(server, describeTitle){
        let globalCoin = server.mode.coins[0]
        let localCoin = server.mode.coins[1]
        tcsGetAccount.testForGetAccountByTag(server, describeTitle + '， 原生币', null, null)
        tcsGetAccount.testForGetAccountByTag(server, describeTitle + '， global coin', globalCoin.symbol, null)
        tcsGetAccount.testForGetAccountByTag(server, describeTitle + '， local coin', localCoin.symbol, localCoin.issuer)
    },

    testForGetAccountByTag: function(server, describeTitle, symbol, issuer){
        describe(describeTitle, function () {
            tcsGetAccount.testForGetAccountByParams(server, describeTitle, symbol, issuer, null)
            tcsGetAccount.testForGetAccountByParams(server, describeTitle, symbol, issuer,'validated')
            tcsGetAccount.testForGetAccountByParams(server, describeTitle, symbol, issuer,'current')
            tcsGetAccount.testForGetAccountByParams(server, describeTitle, symbol, issuer,'closed')
        })
    },

    testForGetAccountByParams: function(server, describeTitle, symbol, issuer, tag){
        let testCases = []

        describeTitle = describeTitle + '， tag为' + tag

        let title = '0010\t查询有效的地址_01:地址内有底层币和代币'
        let addressOrName = server.mode.addresses.balanceAccount.address
        let needPass = true
        let expectedError = ''
        let testCase = tcsGetAccount.createSingleTestCaseForGetAccount(server, title, addressOrName, symbol, issuer, tag, needPass, expectedError)
        testCase.supportedServices.push(serviceType.oldChain)
        framework.addTestCase(testCases, testCase)

        title = '0010\t查询有效的昵称_01:地址内有底层币和代币'
        addressOrName = server.mode.addresses.balanceAccount.nickName
        testCase = tcsGetAccount.createSingleTestCaseForGetAccount(server, title, addressOrName, symbol, issuer, tag, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0010\t查询未激活的地址_01:地址内没有有底层币和代币'
        addressOrName = server.mode.addresses.inactiveAccount1.address
        needPass = false
        //expectedError = 'no such account'
        expectedError = 'Account not found.'
        testCase = tcsGetAccount.createSingleTestCaseForGetAccount(server, title, addressOrName, symbol, issuer, tag, needPass, expectedError)
        testCase.supportedServices.push(serviceType.oldChain)
        framework.addTestCase(testCases, testCase)

        title = '0010\t查询未激活的昵称_01:地址内没有有底层币和代币'
        addressOrName = server.mode.addresses.inactiveAccount1.nickName
        //expectedError = 'Bad account address:'
        expectedError = 'invalid account'
        testCase = tcsGetAccount.createSingleTestCaseForGetAccount(server, title, addressOrName, symbol, issuer, tag, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0010\t查询无效的地址_01:地址内没有有底层币和代币'
        addressOrName = server.mode.addresses.wrongFormatAccount1.address
        testCase = tcsGetAccount.createSingleTestCaseForGetAccount(server, title, addressOrName, symbol, issuer, tag, needPass, expectedError)
        testCase.supportedServices.push(serviceType.oldChain)
        framework.addTestCase(testCases, testCase)

        title = '0010\t查询无效的昵称_01:地址内没有有底层币和代币'
        addressOrName = server.mode.addresses.wrongFormatAccount1.nickName
        testCase = tcsGetAccount.createSingleTestCaseForGetAccount(server, title, addressOrName, symbol, issuer, tag, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        framework.testTestCases(server, describeTitle, testCases)
    },

    createSingleTestCaseForGetAccount: function(server, title, addressOrName, symbol, issuer, tag, needPass, expectedError){

        let functionName = consts.rpcFunctions.getAccount
        let txParams = []
        txParams.push(addressOrName)
        if(symbol != null) txParams.push(symbol)
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
            tcsGetAccount.checkGetAccount,
            expectedResult,
            restrictedLevel.L2,
            [serviceType.newChain,],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        return testCase
    },

    checkGetAccount: function(testCase){
        let response = testCase.actualResult[0]
        let needPass = testCase.expectedResult.needPass
        framework.checkResponse(needPass, response)
        if(needPass){
            // expect(response.result).to.be.jsonSchema(schema.BALANCE_SCHEMA)  //todo: add account schema
            let valueString = utility.isJSON(response.result.Balance) ? response.result.Balance.value: response.result.Balance
            expect(Number(valueString)).to.be.above(0)
        }
        else{
            framework.checkResponseError(testCase, response.message, testCase.expectedResult.expectedError)
        }
    },
//endregion

}