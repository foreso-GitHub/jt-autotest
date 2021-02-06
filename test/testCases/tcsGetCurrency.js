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
const chainDatas = require('../testData/chainDatas').chainDatas
//endregion

module.exports = tcsGetCurrency = {

    //region get currency
    testForGetCurrency: function(server, describeTitle){
        describe(describeTitle, async function () {
            tcsGetCurrency.testForGetCurrencyByLedger(server, describeTitle, null)
            tcsGetCurrency.testForGetCurrencyByLedger(server, describeTitle, consts.ledgers.validated)
            tcsGetCurrency.testForGetCurrencyByLedger(server, describeTitle, consts.ledgers.current)

            //todo need restore when these ledgers are supported.
            // tcsGetCurrency.testForGetCurrencyByLedger(server, describeTitle, 'earliest')
            // tcsGetCurrency.testForGetCurrencyByLedger(server, describeTitle, 'latest')
            // tcsGetCurrency.testForGetCurrencyByLedger(server, describeTitle, 'pending')
            // let chainData = testUtility.findItem(chainDatas, server.mode.chainDataName, function(chainData){
            //     return chainData.chainDataName
            // })
            // tcsGetCurrency.testForGetCurrencyByLedger(server, describeTitle, chainData.block.blockNumber)  //block number
            // tcsGetCurrency.testForGetCurrencyByLedger(server, describeTitle, chainData.block.blockHash)  //block hash
        })
    },

    testForGetCurrencyByLedger: function(server, describeTitle, ledger){

        //region fields

        describeTitle = describeTitle + '，ledger为' + ledger

        let testScripts = []
        let testCaseCode
        let defaultScriptCode = '000100'
        let scriptCode

        let globalCoin = server.mode.coins[0]
        let localCoin = server.mode.coins[1]

        //endregion

        describe(describeTitle, function () {

            testCaseCode = 'FCJT_getCurrency_000010'
            scriptCode = defaultScriptCode + '_查询有效的全局代币，不带issuer'
            {
                let symbol = globalCoin.symbol
                let issuer = null
                let testScript = tcsGetCurrency.createTestScript(server, testCaseCode, scriptCode, symbol, issuer, ledger,)
                framework.addTestScript(testScripts, testScript)
            }

            testCaseCode = 'FCJT_getCurrency_000010'
            scriptCode = '000200' + '_查询有效的全局代币，带issuer'
            {
                let symbol = globalCoin.symbol
                let issuer = globalCoin.issuer
                let testScript = tcsGetCurrency.createTestScript(server, testCaseCode, scriptCode, symbol, issuer, ledger,)
                framework.addTestScript(testScripts, testScript)
            }

            testCaseCode = 'FCJT_getCurrency_000020'
            scriptCode = defaultScriptCode + '_查询无效的全局代币_01,不存在的全局代币'
            {
                let symbol = 'NoCoin_1'
                let issuer = null
                let testScript = tcsGetCurrency.createTestScript(server, testCaseCode, scriptCode, symbol, issuer, ledger,)
                let expectedResult = framework.createExpectedResult(false, framework.getError(140, 't find currency'))
                framework.changeExpectedResult(testScript, expectedResult)
                framework.addTestScript(testScripts, testScript)
            }

            testCaseCode = 'FCJT_getCurrency_000020'
            scriptCode = '000200' + '_查询无效的全局代币_01,代币名过长'
            {
                let symbol = 'CoinNotExists'
                let issuer = null
                let testScript = tcsGetCurrency.createTestScript(server, testCaseCode, scriptCode, symbol, issuer, ledger,)
                let expectedResult = framework.createExpectedResult(false,
                    framework.getError(-269, 'Bad Currency'))
                framework.changeExpectedResult(testScript, expectedResult)
                framework.addTestScript(testScripts, testScript)
            }

            testCaseCode = 'FCJT_getCurrency_000030'
            scriptCode = defaultScriptCode + '_查询无效的全局代币_02,错误的issuer'
            {
                let symbol = globalCoin.symbol
                let issuer = 'jskmdWGNuDA63aNJn3yWjdoDf2NwtS8FoJ'
                let testScript = tcsGetCurrency.createTestScript(server, testCaseCode, scriptCode, symbol, issuer, ledger,)
                let expectedResult = framework.createExpectedResult(false, framework.getError(140, 't find currency'))
                framework.changeExpectedResult(testScript, expectedResult)
                framework.addTestScript(testScripts, testScript)
            }

            testCaseCode = 'FCJT_getCurrency_000030'
            scriptCode = '000200' + '_查询无效的全局代币_02,错误格式的issuer'
            {
                let symbol = globalCoin.symbol
                let issuer = globalCoin.issuer + 'a'
                let testScript = tcsGetCurrency.createTestScript(server, testCaseCode, scriptCode, symbol, issuer, ledger,)
                let expectedResult = framework.createExpectedResult(false,
                    framework.getError(-269, 'Bad Base58 checksum'))
                framework.changeExpectedResult(testScript, expectedResult)
                framework.addTestScript(testScripts, testScript)
            }

            testCaseCode = 'FCJT_getCurrency_000040'
            scriptCode = defaultScriptCode + '_查询有效的本地代币'
            {
                let symbol = localCoin.symbol
                let issuer = localCoin.issuer
                let testScript = tcsGetCurrency.createTestScript(server, testCaseCode, scriptCode, symbol, issuer, ledger,)
                framework.addTestScript(testScripts, testScript)
            }

            testCaseCode = 'FCJT_getCurrency_000050'
            scriptCode = defaultScriptCode + '_查询无效的本地代币_01,不存在的本地代币,ISSUER参数为空'
            {
                let symbol = 'NoCoin_1'
                let issuer = null
                let testScript = tcsGetCurrency.createTestScript(server, testCaseCode, scriptCode, symbol, issuer, ledger,)
                let expectedResult = framework.createExpectedResult(false, framework.getError(140, 't find currency'))
                framework.changeExpectedResult(testScript, expectedResult)
                framework.addTestScript(testScripts, testScript)
            }

            testCaseCode = 'FCJT_getCurrency_000050'
            scriptCode = '000200' + '_查询无效的本地代币_01,代币名过长'
            {
                let symbol = 'CoinNotExists'
                let issuer = null
                let testScript = tcsGetCurrency.createTestScript(server, testCaseCode, scriptCode, symbol, issuer, ledger,)
                let expectedResult = framework.createExpectedResult(false,
                    framework.getError(-269, 'Bad Currency'))
                framework.changeExpectedResult(testScript, expectedResult)
                framework.addTestScript(testScripts, testScript)
            }

            testCaseCode = 'FCJT_getCurrency_000050'
            scriptCode = '000300' + '_查询无效的本地代币_01,不存在的本地代币,ISSUER参数为有效地址'
            {
                let symbol = 'NoCoin_1'
                let issuer = localCoin.issuer
                let testScript = tcsGetCurrency.createTestScript(server, testCaseCode, scriptCode, symbol, issuer, ledger,)
                let expectedResult = framework.createExpectedResult(false, framework.getError(140, 't find currency'))
                framework.changeExpectedResult(testScript, expectedResult)
                framework.addTestScript(testScripts, testScript)
            }

            testCaseCode = 'FCJT_getCurrency_000050'
            scriptCode = '000400' + '_查询无效的本地代币_01,不存在的本地代币,ISSUER参数为任意字符串'
            {
                let symbol = 'NoCoin_1'
                let issuer = 'localCoin.issuer'
                let testScript = tcsGetCurrency.createTestScript(server, testCaseCode, scriptCode, symbol, issuer, ledger,)
                let expectedResult = framework.createExpectedResult(false,
                    framework.getError(-269, 'Bad Base58 string'))
                framework.changeExpectedResult(testScript, expectedResult)
                framework.addTestScript(testScripts, testScript)
            }

            testCaseCode = 'FCJT_getCurrency_000060'
            scriptCode = defaultScriptCode + '_查询无效的本地代币，错误的issuer'
            {
                let symbol = localCoin.symbol
                let issuer = 'jskmdWGNuDA63aNJn3yWjdoDf2NwtS8FoJ'
                let testScript = tcsGetCurrency.createTestScript(server, testCaseCode, scriptCode, symbol, issuer, ledger,)
                let expectedResult = framework.createExpectedResult(false, framework.getError(140, 't find currency'))
                framework.changeExpectedResult(testScript, expectedResult)
                framework.addTestScript(testScripts, testScript)
            }

            testCaseCode = 'FCJT_getCurrency_000060'
            scriptCode = '000200' + '_查询无效的本地代币，错误格式的issuer'
            {
                let symbol = localCoin.symbol
                let issuer = localCoin.issuer + 'a'
                let testScript = tcsGetCurrency.createTestScript(server, testCaseCode, scriptCode, symbol, issuer, ledger,)
                let expectedResult = framework.createExpectedResult(false,
                    framework.getError(-269, 'Bad Base58 checksum'))
                framework.changeExpectedResult(testScript, expectedResult)
                framework.addTestScript(testScripts, testScript)
            }

            framework.testTestScripts(server, describeTitle, testScripts)
        })
    },

    createTestScript: function(server, testCaseCode, scriptCode, currency, issuer, ledger,){

        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        let action = framework.createTestActionForGet(testScript, consts.rpcFunctions.getCurrency)
        let param = server.createParamGetCurrency(currency, issuer, ledger)
        if(ledger != null) {
            if(currency == null){
                param.currency = consts.default.nativeCoin  //使用ledger，必须要有token
            }
            if(issuer == null){
                param.issuer = consts.default.issuer  //使用ledger，必须要有issuer
            }
        }
        action.txParams = [param]
        action.checkForPassResult = tcsGetCurrency.checkForPassResult
        testScript.actions.push(action)
        return testScript

    },

    checkForPassResult: function(action, param, expected, actual){
        let currency = actual.result
        expect(currency).to.be.jsonSchema(schema.CURRENCY_SCHEMA)
        expect(currency.TotalSupply.currency).to.equals(param.currency)
    },

//endregion

}
