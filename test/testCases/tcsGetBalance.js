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
const chainDatas = require('../testData/chainDatas').chainDatas
const testUtility = require('../framework/testUtility')
//endregion
//endregion

module.exports = tcsGetBalance = {

    //注意：一般而言，初始化使用al-01节点的rpc接口，因此初始化时的nickname只存在于al-01节点。
    // 因此getBalance检查nickname的case只有在al-01节点才能通过。

    testForGetBalance: function(server, describeTitle){
        describe(describeTitle, function () {
            tcsGetBalance.testForGetBalanceByAllledgers(server, describeTitle, consts.coinCategory.native, null)
            tcsGetBalance.testForGetBalanceByAllledgers(server, describeTitle, consts.coinCategory.global, server.mode.coins[0].symbol, null)
            tcsGetBalance.testForGetBalanceByAllledgers(server, describeTitle, consts.coinCategory.local, server.mode.coins[1].symbol,
                server.mode.coins[1].issuer)
        })
    },

    testForGetBalanceByAllledgers: function(server, describeTitle, coinType, symbol, issuer){

        tcsGetBalance.testForGetBalanceBySymbolAndledger(server, describeTitle, coinType, symbol, issuer, null)
        tcsGetBalance.testForGetBalanceBySymbolAndledger(server, describeTitle, coinType, symbol, issuer, consts.ledgers.current)
        tcsGetBalance.testForGetBalanceBySymbolAndledger(server, describeTitle, coinType, symbol, issuer, consts.ledgers.validated)

        //todo need restore when these ledgers are supported.
        // tcsGetBalance.testForGetBalanceBySymbolAndledger(server, symbol, issuer, 'earliest')
        // tcsGetBalance.testForGetBalanceBySymbolAndledger(server, symbol, issuer, 'latest')
        // tcsGetBalance.testForGetBalanceBySymbolAndledger(server, symbol, issuer, 'pending')
        // let chainData = testUtility.findItem(chainDatas, server.mode.chainDataName, function(chainData){
        //     return chainData.chainDataName
        // })
        // tcsGetBalance.testForGetBalanceBySymbolAndledger(server, symbol, issuer, chainData.block.blockNumber)  //block number
        // tcsGetBalance.testForGetBalanceBySymbolAndledger(server, symbol, issuer, chainData.block.blockHash)  //block hash

    },

    testForGetBalanceBySymbolAndledger: function(server, describeTitle, coinType, symbol, issuer, ledger){

        //region fields

        describeTitle = describeTitle + '，coinType为' + coinType + '，ledger为' + ledger

        let testScripts = []
        let testCaseCode
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

        testCaseCode = 'FCJT_getBalance_000010'
        scriptCode = defaultScriptCode + (symbol ? '_' + symbol : '') + (ledger ? '_' + ledger : '')
            + '_查询有效的地址_01:地址内有底层币和代币'
        {
            let addressOrName = server.mode.addresses.balanceAccount.address
            let testScript = tcsGetBalance.createTestScript(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, ledger)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getBalance_000030'
        scriptCode = defaultScriptCode + (symbol ? '_' + symbol : '') + (ledger ? '_' + ledger : '')
            + '_查询有效的地址_01:地址内有底层币和代币'
        {
            let addressOrName = server.mode.addresses.balanceAccount.nickname
            let testScript = tcsGetBalance.createTestScript(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, ledger)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getBalance_000020'
        scriptCode = defaultScriptCode + (symbol ? '_' + symbol : '') + (ledger ? '_' + ledger : '')
            + '_查询未激活的地址_01:地址内没有有底层币和代币'
        {
            let addressOrName = server.mode.addresses.inactiveAccount1.address
            let testScript = tcsGetBalance.createTestScript(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, ledger)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-96, ledger == consts.ledgers.current ? 'no such account info' : 't find account'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getBalance_000040'
        scriptCode = defaultScriptCode + (symbol ? '_' + symbol : '') + (ledger ? '_' + ledger : '')
            + '_查询未激活的昵称_01:地址内没有有底层币和代币'
        {
            let addressOrName = server.mode.addresses.inactiveAccount1.nickname
            let testScript = tcsGetBalance.createTestScript(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, ledger)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-96, 'Bad account address'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getBalance_000050'
        scriptCode = defaultScriptCode + (symbol ? '_' + symbol : '') + (ledger ? '_' + ledger : '')
            + '_查询无效的地址_01:查询不存在的地址'
        {
            let addressOrName = server.mode.addresses.wrongFormatAccount1.address
            let testScript = tcsGetBalance.createTestScript(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, ledger)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-96, 'Bad account address'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getBalance_000060'
        scriptCode = defaultScriptCode + (symbol ? '_' + symbol : '') + (ledger ? '_' + ledger : '')
            + '_查询无效的地址_01:查询不存在的昵称'
        {
            let addressOrName = server.mode.addresses.wrongFormatAccount1.nickname
            let testScript = tcsGetBalance.createTestScript(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, ledger)
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

        let action = framework.createTestActionForGet(testScript, consts.rpcFunctions.getBalance)
        let param = server.createParamGetBalance(addressOrName, currency, issuer, ledger)
        if(ledger != null) {
            if(currency == null){
                param.currency = consts.default.nativeCoin  //使用ledger，必须要有token
            }
            if(issuer == null){
                param.issuer = consts.default.issuer  //使用ledger，必须要有issuer
            }
        }
        action.txParams = [param]
        action.checkForPassResult = tcsGetBalance.checkForPassResult
        testScript.actions.push(action)
        return testScript

    },

    checkForPassResult: function(action, param, expected, actual){
        let result = actual.result
        expect(result).to.be.jsonSchema(schema.BALANCE_SCHEMA)
        let balance = result.balance
        expect(Number(balance.value)).to.be.above(0)
    },

}
