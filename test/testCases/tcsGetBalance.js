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
            tcsGetBalance.testForGetBalanceByAllTags(server, describeTitle, consts.coinCategory.native, null)
            tcsGetBalance.testForGetBalanceByAllTags(server, describeTitle, consts.coinCategory.global, server.mode.coins[0].symbol, null)
            tcsGetBalance.testForGetBalanceByAllTags(server, describeTitle, consts.coinCategory.local, server.mode.coins[1].symbol,
                server.mode.coins[1].issuer)

        })
    },

    testForGetBalanceByAllTags: function(server, describeTitle, coinType, symbol, issuer){

        tcsGetBalance.testForGetBalanceBySymbolAndTag(server, describeTitle, coinType, symbol, issuer, null)
        tcsGetBalance.testForGetBalanceBySymbolAndTag(server, describeTitle, coinType, symbol, issuer, consts.tags.current)
        tcsGetBalance.testForGetBalanceBySymbolAndTag(server, describeTitle, coinType, symbol, issuer, consts.tags.validated)

        //todo need restore when these tags are supported.
        // tcsGetBalance.testForGetBalanceBySymbolAndTag(server, symbol, issuer, 'earliest')
        // tcsGetBalance.testForGetBalanceBySymbolAndTag(server, symbol, issuer, 'latest')
        // tcsGetBalance.testForGetBalanceBySymbolAndTag(server, symbol, issuer, 'pending')
        // let chainData = testUtility.findItem(chainDatas, server.mode.chainDataName, function(chainData){
        //     return chainData.chainDataName
        // })
        // tcsGetBalance.testForGetBalanceBySymbolAndTag(server, symbol, issuer, chainData.block.blockNumber)  //block number
        // tcsGetBalance.testForGetBalanceBySymbolAndTag(server, symbol, issuer, chainData.block.blockHash)  //block hash

    },

    testForGetBalanceBySymbolAndTag: function(server, describeTitle, coinType, symbol, issuer, tag){

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

        testCaseCode = 'FCJT_getBalance_000010'
        scriptCode = defaultScriptCode + (symbol ? '_' + symbol : '') + (tag ? '_' + tag : '')
            + '_查询有效的地址_01:地址内有底层币和代币'
        {
            let addressOrName = server.mode.addresses.balanceAccount.address
            let testScript = tcsGetAccount.createTestScript(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, tag)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getBalance_000030'
        scriptCode = defaultScriptCode + (symbol ? '_' + symbol : '') + (tag ? '_' + tag : '')
            + '_查询有效的地址_01:地址内有底层币和代币'
        {
            let addressOrName = server.mode.addresses.balanceAccount.nickname
            let testScript = tcsGetAccount.createTestScript(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, tag)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getBalance_000020'
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

        testCaseCode = 'FCJT_getBalance_000040'
        scriptCode = defaultScriptCode + (symbol ? '_' + symbol : '') + (tag ? '_' + tag : '')
            + '_查询未激活的昵称_01:地址内没有有底层币和代币'
        {
            let addressOrName = server.mode.addresses.inactiveAccount1.nickname
            let testScript = tcsGetAccount.createTestScript(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, tag)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-96, 'Bad account address'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getBalance_000050'
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

        testCaseCode = 'FCJT_getBalance_000060'
        scriptCode = defaultScriptCode + (symbol ? '_' + symbol : '') + (tag ? '_' + tag : '')
            + '_查询无效的地址_01:查询不存在的昵称'
        {
            let addressOrName = server.mode.addresses.wrongFormatAccount1.nickname
            let testScript = tcsGetAccount.createTestScript(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, tag)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-96, 'Bad account address'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle, testScripts)
    },

    createTestScript: function(server, testCaseCode, scriptCode, addressOrName, symbol, issuer, tag){

        let functionName = consts.rpcFunctions.getBalance
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
            framework.executeTestActionForGet, tcsGetBalance.checkGetBalance, [{needPass:true}])
        testScript.actions.push(action)
        return testScript

    },

    checkGetBalance: function(action){
        let response = action.actualResult
        let needPass = action.expectedResults[0].needPass
        framework.checkGetResponse(response)
        if(needPass){
            expect(response.result).to.be.jsonSchema(schema.BALANCE_SCHEMA)
            expect(Number(response.result.balance.value)).to.be.above(0)
        }
        else{
            framework.checkResponseError(action.expectedResults[0], response)
        }
    },

}
