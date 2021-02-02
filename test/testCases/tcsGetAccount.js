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
        tcsGetAccount.testForGetAccountByLedger(server, describeTitle, consts.coinCategory.native, null, null)
        tcsGetAccount.testForGetAccountByLedger(server, describeTitle, consts.coinCategory.global, globalCoin.symbol, null)
        tcsGetAccount.testForGetAccountByLedger(server, describeTitle, consts.coinCategory.local, localCoin.symbol, localCoin.issuer)
    },

    testForGetAccountByLedger: function(server, describeTitle, coinType, symbol, issuer){
        describe(describeTitle, function () {
            tcsGetAccount.testForGetAccountByParams(server, describeTitle, coinType, symbol, issuer, null)
            tcsGetAccount.testForGetAccountByParams(server, describeTitle, coinType, symbol, issuer, consts.ledgers.validated)
            tcsGetAccount.testForGetAccountByParams(server, describeTitle, coinType, symbol, issuer, consts.ledgers.current)

            //todo need restore when these ledgers are supported.
            // tcsGetAccount.testForGetAccountByParams(server, describeTitle, coinType, symbol, issuer, consts.ledgers.closed)
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

    testForGetAccountByParams: function(server, describeTitle, coinType, symbol, issuer, ledger){

        //region fields

        describeTitle = describeTitle + '，coinType为' + coinType + '，ledger为' + ledger

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
        scriptCode = defaultScriptCode + (symbol ? '_' + symbol : '') + (ledger ? '_' + ledger : '')
            + '_查询有效的地址_01:地址内有底层币和代币'
        {
            let addressOrName = server.mode.addresses.balanceAccount.address
            let testScript = tcsGetAccount.createTestScript(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, ledger)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getAccount_000030'
        scriptCode = defaultScriptCode + (symbol ? '_' + symbol : '') + (ledger ? '_' + ledger : '')
            + '_查询有效的昵称_01:地址内有底层币和代币'
        {
            let addressOrName = server.mode.addresses.balanceAccount.nickname
            let testScript = tcsGetAccount.createTestScript(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, ledger)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getAccount_000020'
        scriptCode = defaultScriptCode + (symbol ? '_' + symbol : '') + (ledger ? '_' + ledger : '')
            + '_查询未激活的地址_01:地址内没有有底层币和代币'
        {
            let addressOrName = server.mode.addresses.inactiveAccount1.address
            let testScript = tcsGetAccount.createTestScript(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, ledger)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-96, 'no such account'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getAccount_000040'
        scriptCode = defaultScriptCode + (symbol ? '_' + symbol : '') + (ledger ? '_' + ledger : '')
            + '_查询未激活的昵称_01:地址内没有有底层币和代币'
        {
            let addressOrName = server.mode.addresses.inactiveAccount1.nickname
            let testScript = tcsGetAccount.createTestScript(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, ledger)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-96, 'Bad account address'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getAccount_000050'
        scriptCode = defaultScriptCode + (symbol ? '_' + symbol : '') + (ledger ? '_' + ledger : '')
            + '_查询无效的地址_01:查询不存在的地址'
        {
            let addressOrName = server.mode.addresses.wrongFormatAccount1.address
            let testScript = tcsGetAccount.createTestScript(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, ledger)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-96, 'Bad account address'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getAccount_000060'
        scriptCode = defaultScriptCode + (symbol ? '_' + symbol : '') + (ledger ? '_' + ledger : '')
            + '_查询无效的昵称_01:查询不存在的昵称'
        {
            let addressOrName = server.mode.addresses.wrongFormatAccount1.nickname
            let testScript = tcsGetAccount.createTestScript(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, ledger)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-96, 'Bad account address'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle, testScripts)
    },

    createTestScript: function(server, testCaseCode, scriptCode, addressOrName, currency, issuer, ledger){

        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        let action = framework.createTestActionForGet(testScript, consts.rpcFunctions.getAccount)
        let param = server.createParamGetAccount(addressOrName, currency, issuer, ledger)
        if(ledger != null) {
            if(currency == null){
                param.currency = consts.default.nativeCoin  //使用ledger，必须要有token
            }
            if(issuer == null){
                param.issuer = consts.default.issuer  //使用ledger，必须要有issuer
            }
        }
        action.txParams = [param]
        action.checkForPassResult = tcsGetAccount.checkForPassResult
        testScript.actions.push(action)
        return testScript

    },

    checkForPassResult: function(action, param, expected, actual){
        let account = actual.result
        expect(account).to.be.jsonSchema(schema.ACCOUNT_SCHEMA)
        let valueString = testUtility.isJSON(account.Balance) ? account.Balance.value : account.Balance
        expect(Number(valueString)).to.be.above(0)
    },

//endregion

}
