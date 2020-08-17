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
const chainDatas = require('../testData/chainDatas').chainDatas[0]
//endregion
//endregion

module.exports = tcsGetBalance = {

//region balance check

    testForGetBalance: function(server, describeTitle){
        describe(describeTitle, function () {
            let symbol = null //swtc
            tcsGetBalance.testForGetBalanceByAllTags(server, symbol)
            if(server.mode.service == serviceType.newChain){
                symbol = 'CNYT'   //token without issuer
                tcsGetBalance.testForGetBalanceByAllTags(server, symbol)
                //todo need make symbol dynamic, generated in init prog.
                symbol = '5e69b0cc'   //token without issuer
                tcsGetBalance.testForGetBalanceByAllTags(server, symbol)
                symbol = '5e69b0d4'   //token with issuer
                tcsGetBalance.testForGetBalanceByAllTags(server, symbol)
            }
        })
    },

    testForGetBalanceByAllTags: function(server, symbol){
        tcsGetBalance.testForGetBalanceBySymbolAndTag(server, symbol, null)
        tcsGetBalance.testForGetBalanceBySymbolAndTag(server, symbol, 'current')
        tcsGetBalance.testForGetBalanceBySymbolAndTag(server, symbol, 'validated')
        tcsGetBalance.testForGetBalanceBySymbolAndTag(server, symbol, 'closed')
        tcsGetBalance.testForGetBalanceBySymbolAndTag(server, symbol, chainDatas.block.blockNumber)  //block number
        tcsGetBalance.testForGetBalanceBySymbolAndTag(server, symbol, chainDatas.block.blockHash)  //block hash
    },

    testForGetBalanceBySymbolAndTag: function(server, symbol, tag){

        let testCases = []
        let showSymbol = symbol == null ? 'swtc' : symbol
        let describeTitle = '测试jt_getBalance， Token为' + showSymbol + '，tag为' + tag

        let title = '0010\t查询有效的地址_01:地址内有底层币和代币'
        let addressOrName = server.mode.addresses.balanceAccount.address
        let needPass = true
        let expectedError = ''
        let testCase = tcsGetBalance.createSingleTestCaseForGetBalance(server, title, addressOrName, symbol, tag, needPass, expectedError)
        if(tag == null) testCase.supportedServices.push(serviceType.oldChain)
        framework.addTestCase(testCases, testCase)

        title = '0010\t查询有效的昵称_01:地址内有底层币和代币'
        addressOrName = server.mode.addresses.balanceAccount.nickName
        testCase = tcsGetBalance.createSingleTestCaseForGetBalance(server, title, addressOrName, symbol, tag, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0010\t查询未激活的地址_01:地址内没有有底层币和代币'
        addressOrName = server.mode.addresses.inactiveAccount1.address
        needPass = false
        //expectedError = 'no such account'
        expectedError = 'Account not found.'
        testCase = tcsGetBalance.createSingleTestCaseForGetBalance(server, title, addressOrName, symbol, tag, needPass, expectedError)
        if(tag == null) testCase.supportedServices.push(serviceType.oldChain)
        framework.addTestCase(testCases, testCase)

        title = '0010\t查询未激活的昵称_01:地址内没有有底层币和代币'
        addressOrName = server.mode.addresses.inactiveAccount1.nickName
        //expectedError = 'Bad account address:'
        expectedError = 'invalid account'
        testCase = tcsGetBalance.createSingleTestCaseForGetBalance(server, title, addressOrName, symbol, tag, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0010\t查询无效的地址_01:地址内没有有底层币和代币'
        addressOrName = server.mode.addresses.wrongFormatAccount1.address
        testCase = tcsGetBalance.createSingleTestCaseForGetBalance(server, title, addressOrName, symbol, tag, needPass, expectedError)
        if(tag == null) testCase.supportedServices.push(serviceType.oldChain)
        framework.addTestCase(testCases, testCase)

        title = '0010\t查询无效的昵称_01:地址内没有有底层币和代币'
        addressOrName = server.mode.addresses.wrongFormatAccount1.nickName
        testCase = tcsGetBalance.createSingleTestCaseForGetBalance(server, title, addressOrName, symbol, tag, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        framework.testTestCases(server, describeTitle, testCases)
    },

    createSingleTestCaseForGetBalance: function(server, title, addressOrName, symbol, tag, needPass, expectedError){

        let functionName = consts.rpcFunctions.getBalance
        let txParams = []
        txParams.push(addressOrName)
        txParams.push(symbol != null ? symbol : '')
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
            tcsGetBalance.checkGetBalance,
            expectedResult,
            restrictedLevel.L2,
            [serviceType.newChain,],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        return testCase
    },

    checkGetBalance: function(testCase){
        let response = testCase.actualResult[0]
        let needPass = testCase.expectedResult.needPass
        framework.checkResponse(needPass, response)
        if(needPass){
            let symbol = testCase.txParams[1]
            if(symbol == ''){  //todo suppose it is swtc, in fact, maybe not.  the better way is formats of balance of swtc and token are the same.
                expect(response.result).to.be.jsonSchema(schema.BALANCE_SCHEMA)
                expect(Number(response.result.balance)).to.be.above(0)
            }
            else{ //suppose it is token
                expect(response.result).to.be.jsonSchema(schema.BALANCE_TOKEN_SCHEMA)
                expect(Number(response.result.balance.value)).to.be.above(0)
            }

        }
        else{
            framework.checkResponseError(testCase, response.message, testCase.expectedResult.expectedError)
        }
    },

//endregion

}