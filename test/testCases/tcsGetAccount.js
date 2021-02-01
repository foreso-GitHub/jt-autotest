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
let testUtility = require('../framework/testUtility')
//endregion
const chainDatas = require('../testData/chainDatas').chainDatas
//endregion

module.exports = tcsGetAccount = {

    //region get account
    testForGetAccount: function(server, describeTitle){
        let globalCoin = server.mode.coins[0]
        let localCoin = server.mode.coins[1]
        tcsGetAccount.testForGetAccountByTag(server, describeTitle, consts.coinCategory.native, null, null)
        tcsGetAccount.testForGetAccountByTag(server, describeTitle, consts.coinCategory.global, globalCoin.symbol, null)
        tcsGetAccount.testForGetAccountByTag(server, describeTitle, consts.coinCategory.local, localCoin.symbol, localCoin.issuer)
    },

    testForGetAccountByTag: function(server, describeTitle, coinType, symbol, issuer){
        describe(describeTitle, function () {
            tcsGetAccount.testForGetAccountByParams(server, describeTitle, coinType, symbol, issuer, null)
            tcsGetAccount.testForGetAccountByParams(server, describeTitle, coinType, symbol, issuer, consts.tags.validated)
            tcsGetAccount.testForGetAccountByParams(server, describeTitle, coinType, symbol, issuer, consts.tags.current)

            //todo need restore when these tags are supported.
            // tcsGetAccount.testForGetAccountByParams(server, describeTitle, coinType, symbol, issuer, consts.tags.closed)
            // tcsGetAccount.testForGetAccountByParams(server, describeTitle, symbol, issuer, 'earliest')
            // tcsGetAccount.testForGetAccountByParams(server, describeTitle, symbol, issuer, 'latest')
            // tcsGetAccount.testForGetAccountByParams(server, describeTitle, symbol, issuer, 'pending')
            // let chainData = testUtility.findItem(chainDatas, server.mode.chainDataName, function(chainData){
            //     return chainData.chainDataName
            // })
            // tcsGetAccount.testForGetAccountByParams(server, describeTitle, symbol, issuer, chainData.block.blockNumber)  //block number
            // tcsGetAccount.testForGetAccountByParams(server, describeTitle, symbol, issuer, chainData.block.blockHash)  //block hash

        })
    },

    testForGetAccountByParams: function(server, describeTitle, coinType, symbol, issuer, tag){

        //region fields

        describeTitle = describeTitle + '，coinType为' + coinType + '，tag为' + tag

        let testScripts = []
        let testCaseCode
        let defaultScriptCode = '000100'
        let scriptCode

        if(coinType == consts.coinCategory.native){
            defaultScriptCode = '000100'
        }
        else if(coinType == consts.coinCategory.global){
            defaultScriptCode = '000200'
        }
        else if(coinType == consts.coinCategory.local){
            defaultScriptCode = '000300'
        }
        else{
            defaultScriptCode = '000100'
        }

        //endregion

        testCaseCode = 'FCJT_getAccount_000010'
        scriptCode = defaultScriptCode + (symbol ? '_' + symbol : '') + (tag ? '_' + tag : '')
            + '_查询有效的地址_01:地址内有底层币和代币'
        {
            let addressOrName = server.mode.addresses.balanceAccount.address
            let testScript = tcsGetAccount.createTestScript(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, tag)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getAccount_000030'
        scriptCode = defaultScriptCode + (symbol ? '_' + symbol : '') + (tag ? '_' + tag : '')
            + '_查询有效的昵称_01:地址内有底层币和代币'
        {
            let addressOrName = server.mode.addresses.balanceAccount.nickName
            let testScript = tcsGetAccount.createTestScript(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, tag)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getAccount_000020'
        scriptCode = defaultScriptCode + (symbol ? '_' + symbol : '') + (tag ? '_' + tag : '')
            + '_查询未激活的地址_01:地址内没有有底层币和代币'
        {
            let addressOrName = server.mode.addresses.inactiveAccount1.address
            let testScript = tcsGetAccount.createTestScript(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, tag)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-96, 'no such account'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getAccount_000040'
        scriptCode = defaultScriptCode + (symbol ? '_' + symbol : '') + (tag ? '_' + tag : '')
            + '_查询未激活的昵称_01:地址内没有有底层币和代币'
        {
            let addressOrName = server.mode.addresses.inactiveAccount1.nickName
            let testScript = tcsGetAccount.createTestScript(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, tag)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-96, 'Bad account address'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getAccount_000050'
        scriptCode = defaultScriptCode + (symbol ? '_' + symbol : '') + (tag ? '_' + tag : '')
            + '_查询无效的地址_01:查询不存在的地址'
        {
            let addressOrName = server.mode.addresses.wrongFormatAccount1.address
            let testScript = tcsGetAccount.createTestScript(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, tag)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-96, 'Bad account address'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getAccount_000060'
        scriptCode = defaultScriptCode + (symbol ? '_' + symbol : '') + (tag ? '_' + tag : '')
            + '_查询无效的昵称_01:查询不存在的昵称'
        {
            let addressOrName = server.mode.addresses.wrongFormatAccount1.nickName
            let testScript = tcsGetAccount.createTestScript(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, tag)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-96, 'Bad account address'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle, testScripts)
    },

    createTestScript: function(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, tag){

        let functionName = consts.rpcFunctions.getAccount
        let txParams = []
        txParams.push(addressOrName)
        if(symbol != null) txParams.push(symbol)
        if(issuer != null) txParams.push(issuer)
        if(tag != null) {
            if(symbol == null){
                txParams.push(consts.default.nativeCoin)  //使用tag，必须要有token
            }
            if(issuer == null){
                txParams.push(consts.default.issuer)  //使用tag，必须要有issuer
            }
            txParams.push(tag)
        }

        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )
        let action = framework.createTestAction(testScript, functionName, txParams,
            framework.executeTestActionForGet, tcsGetAccount.checkGetAccount, [{needPass:true}])
        testScript.actions.push(action)
        return testScript

    },

    checkGetAccount: function(action){
        let response = action.actualResult
        let needPass = action.expectedResults[0].needPass
        framework.checkGetResponse(response)
        if(needPass){
            // expect(response.result).to.be.jsonSchema(schema.BALANCE_SCHEMA)  //todo: add account schema
            let valueString = testUtility.isJSON(response.result.Balance) ? response.result.Balance.value: response.result.Balance
            expect(Number(valueString)).to.be.above(0)
        }
        else{
            framework.checkResponseError(action.expectedResults[0], response)
        }
    },
//endregion

}
