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
//endregion

module.exports = tcsGetTxCount = {

    //region tx count check

    testForGetBlockTransactionCountByHash: function(server, describeTitle){
        tcsGetTxCount.testForGetBlockTransactionCountByHashByLedger(server, describeTitle, null)
        tcsGetTxCount.testForGetBlockTransactionCountByHashByLedger(server, describeTitle, consts.ledgers.validated)
        tcsGetTxCount.testForGetBlockTransactionCountByHashByLedger(server, describeTitle, consts.ledgers.current)
    },

    testForGetBlockTransactionCountByHashByLedger: function(server, describeTitle, ledger){

        //region fields

        let functionName = consts.rpcFunctions.getBlockTransactionCountByHash
        let testScripts = []
        let testCaseCode
        let scriptCode
        let prefixCode = utility.getPrefixCodeForLedger(ledger)
        //endregion

        testCaseCode = 'FCJT_getBlockTransactionCountByHash_000010'
        scriptCode = prefixCode + '100' + '_查询有效区块哈希'
        {
            let hash = server.mode.txs.block.blockHash
            let testScript = tcsGetTxCount.createTestScript(server, testCaseCode, scriptCode, functionName, hash)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getBlockTransactionCountByHash_000020'
        scriptCode = prefixCode + '100' + '_无效交易哈希：不存在的hash'
        {
            let hash = 'B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A'
            let testScript = tcsGetTxCount.createTestScript(server, testCaseCode, scriptCode, functionName, hash)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(140, 't find block'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getBlockTransactionCountByHash_000020'
        scriptCode = prefixCode + '200' + '_无效交易哈希：hash长度超过标准'
        {
            let hash = 'B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A1F'
            let testScript = tcsGetTxCount.createTestScript(server, testCaseCode, scriptCode, functionName, hash)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'NewHash256: Wrong length'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle + ', ledger: ' + ledger, testScripts)
    },

    testForGetBlockTransactionCountByNumber: function(server, describeTitle){
        tcsGetTxCount.testForGetBlockTransactionCountByNumberByLedger(server, describeTitle, null)
        tcsGetTxCount.testForGetBlockTransactionCountByNumberByLedger(server, describeTitle, consts.ledgers.validated)
        tcsGetTxCount.testForGetBlockTransactionCountByNumberByLedger(server, describeTitle, consts.ledgers.current)
    },

    testForGetBlockTransactionCountByNumberByLedger: function(server, describeTitle, ledger){

        //region fields

        let functionName = consts.rpcFunctions.getBlockTransactionCountByNumber
        let testScripts = []
        let testCaseCode
        let scriptCode
        let prefixCode = utility.getPrefixCodeForLedger(ledger)

        //endregion

        testCaseCode = 'FCJT_getBlockTransactionCountByNumber_000010'
        scriptCode = prefixCode + '100' + '_查询有效区块编号'
        {
            let blockNumber = server.mode.txs.block.blockNumber
            let testScript = tcsGetTxCount.createTestScript(server, testCaseCode, scriptCode, functionName, blockNumber)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getBlockTransactionCountByNumber_000020'
        scriptCode = prefixCode + '100' + '_无效交易编号：9999999'
        {
            let blockNumber = '999999999'
            let testScript = tcsGetTxCount.createTestScript(server, testCaseCode, scriptCode, functionName, blockNumber)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(140, 't find block'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getBlockTransactionCountByNumber_000020'
        scriptCode = prefixCode + '200' + '_无效交易编号：负数'
        {
            let blockNumber = '-100'
            let testScript = tcsGetTxCount.createTestScript(server, testCaseCode, scriptCode, functionName, blockNumber)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(140, 'invalid syntax'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getBlockTransactionCountByNumber_000020'
        scriptCode = prefixCode + '300' + '_无效交易编号：乱码'
        {
            let blockNumber = 'addeew'
            let testScript = tcsGetTxCount.createTestScript(server, testCaseCode, scriptCode, functionName, blockNumber)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(140, 'invalid syntax'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle + ', ledger: ' + ledger, testScripts)
    },

    createTestScript: function(server, testCaseCode, scriptCode, functionName, hashOrNumber, ledger){

        let txParams = []
        txParams.push(hashOrNumber)

        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        let action = framework.createTestActionForGet(testScript, functionName)
        let param = server.createParamGetTxCountByBlockNumber(hashOrNumber, ledger)
        if (functionName == consts.rpcFunctions.getBlockTransactionCountByHash){
            param = server.createParamGetTxCountByHash(hashOrNumber, ledger)
        }
        action.txParams = [param]
        action.checkForPassResult = tcsGetTxCount.checkForPassResultForHashOrNumber
        testScript.actions.push(action)
        return testScript

    },

    checkForPassResultForHashOrNumber: function(action, param, expected, actual){
        let count = actual.result
        let txCount = action.server.mode.txs.block.txCountInBlock
        expect(count).to.equal(txCount)
    },

    //endregion

    //region jt_getTransactionCount

    testForGetTransactionCount: function(server, describeTitle){

        //region fields

        let from = server.mode.addresses.nickNameSender
        let to = server.mode.addresses.nickNameReceiver

        //endregion

        tcsGetTxCount.testGroupForGetTransactionCount(server, describeTitle + '_无区块参数', from, to, null)
        tcsGetTxCount.testGroupForGetTransactionCount(server, describeTitle + '_无区块参数', from, to, consts.ledgers.current)
        tcsGetTxCount.testGroupForGetTransactionCount(server, describeTitle + '_无区块参数', from, to, consts.ledgers.validated)
        // tcsGetTxCount.testGroupForGetTransactionCount(server, describeTitle + '_区块参数:100', from, to, 100)

    },

    testGroupForGetTransactionCount: function(server, describeTitle, from, to, ledger){

        //region fields

        describeTitle = describeTitle + '，ledger为' + ledger

        let testScripts = []
        let testCaseCode
        let defaultScriptCode = '000100'
        let scriptCode

        //endregion

        testCaseCode = 'FCJT_getTransactionCount_000010'
        scriptCode = defaultScriptCode + '_查询有效地址'
        {
            let addressOrName = from.address
            let needSendTx = true
            let testScript = tcsGetTxCount.createTestScriptForGetTransactionCount(server, testCaseCode, scriptCode, addressOrName, ledger, needSendTx,)
            let action = testScript.actions[0]
            action.from = from.address
            action.secret = from.secret
            action.to = to.address
            action.subCheck = function(action){
                expect(action.countAfterSend).to.equal(action.countBeforeSend + 1)
            }
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionCount_000010'
        scriptCode = '000200' + '_查询有效地址: 未激活的地址'
        {
            let addressOrName = server.mode.addresses.inactiveAccount1.address
            let needSendTx = false
            let testScript = tcsGetTxCount.createTestScriptForGetTransactionCount(server, testCaseCode, scriptCode, addressOrName, ledger, needSendTx,)
            let action = testScript.actions[0]
            action.subCheck = function(action){
            }
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionCount_000020'
        scriptCode = defaultScriptCode + '_查询有效昵称'
        {
            let addressOrName = from.nickname
            let needSendTx = true
            let testScript = tcsGetTxCount.createTestScriptForGetTransactionCount(server, testCaseCode, scriptCode, addressOrName, ledger, needSendTx,)
            let action = testScript.actions[0]
            action.from = from.address
            action.secret = from.secret
            action.to = to.address
            action.subCheck = function(action){
                expect(action.countAfterSend).to.equal(action.countBeforeSend + 1)
            }
            framework.addTestScript(testScripts, testScript)
        }


        testCaseCode = 'FCJT_getTransactionCount_000030'
        scriptCode = defaultScriptCode + '_查询无效地址: 过短的地址'
        {
            let addressOrName = 'jnZ7CDuqmj6Pe1KGMdiacfh4aeuXSDj'
            let needSendTx = false
            let testScript = tcsGetTxCount.createTestScriptForGetTransactionCount(server, testCaseCode, scriptCode, addressOrName, ledger, needSendTx,)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-96, 'Bad account address'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionCount_000030'
        scriptCode = '000200' + '_查询无效地址: 过长的地址'
        {
            let addressOrName = from.address + 'a'
            let needSendTx = false
            let testScript = tcsGetTxCount.createTestScriptForGetTransactionCount(server, testCaseCode, scriptCode, addressOrName, ledger, needSendTx,)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-96, 'Bad account address'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionCount_000030'
        scriptCode = '000300' + '_查询无效地址: 格式错误的地址'
        {
            let addressOrName = server.mode.addresses.wrongFormatAccount1.address
            let needSendTx = false
            let testScript = tcsGetTxCount.createTestScriptForGetTransactionCount(server, testCaseCode, scriptCode, addressOrName, ledger, needSendTx,)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-96, 'Bad account address'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionCount_000040'
        scriptCode = defaultScriptCode + '_查询无效昵称: 不存在的昵称'
        {
            let addressOrName = server.mode.addresses.inactiveAccount1.nickname
            let needSendTx = false
            let testScript = tcsGetTxCount.createTestScriptForGetTransactionCount(server, testCaseCode, scriptCode, addressOrName, ledger, needSendTx,)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-96, 'Bad account address'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle, testScripts)
    },

    createTestScriptForGetTransactionCount: function(server, testCaseCode, scriptCode, addressOrName, ledger, needSendTx,){

        let txParams = []
        txParams.push(addressOrName)
        if(ledger) txParams.push(ledger)

        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        let action = framework.createTestActionForGet(testScript, consts.rpcFunctions.getTransactionCount)
        let param = server.createParamGetTransactionCount(addressOrName, ledger)
        action.txParams = [param]
        action.checkForPassResult = tcsGetTxCount.checkForPassResult
        action.executeFunction = (needSendTx) ? tcsGetTxCount.executeGetTransactionCount : framework.executeTestActionForGet
        testScript.actions.push(action)
        return testScript

    },

    executeGetTransactionCount: function(action){
        action.hasExecuted = true
        return new Promise(async (resolve, reject) => {
            let server = action.server
            let response = await server.getResponse(server, consts.rpcFunctions.getTransactionCount, action.txParams)
            action.countBeforeSend = response.result[0].result

            let txParams = await utility.createTxParams(server, action.from, action.secret, action.to, '1')
            await utility.sendTxs(server, txParams, 1)
            await utility.timeout(6000)

            response = await server.getResponse(server, consts.rpcFunctions.getTransactionCount, action.txParams)
            action.countAfterSend = response.result[0].result
            action.actualResult = response
            resolve('done')
        })
    },

    checkForPassResult: function(action, param, expected, actual){
        let count = actual.result
        expect(count).to.be.least(1)
        action.subCheck(action)
    },

    //endregion

}
