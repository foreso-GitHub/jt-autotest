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

module.exports = tcsGetBlock = {

    //region block check

    testForGetBlockByNumber: function(server, describeTitle){
        let functionName = consts.rpcFunctions.getBlockByNumber
        let blockNumber = server.mode.txs.block.blockNumber
        let testScripts = tcsGetBlock.createTestScriptsForGetBlock(server, functionName, blockNumber)
        framework.testTestScripts(server, describeTitle, testScripts)
    },

    testForGetBlockByHash: function(server, describeTitle){
        let functionName = consts.rpcFunctions.getBlockByHash
        let blockHash = server.mode.txs.block.blockHash
        let testScripts = tcsGetBlock.createTestScriptsForGetBlock(server, functionName, blockHash)
        framework.testTestScripts(server, describeTitle, testScripts)
    },

    createTestScriptsForGetBlock: function(server, functionName, numberOrHash, ledger){
        let testScripts = []
        let testCaseCodePrefix = (functionName === consts.rpcFunctions.getBlockByNumber)
            ? 'FCJT_getBlockByNumber_' : 'FCJT_getBlockByHash_'
        let testCaseCode
        let defaultScriptCode = '000100'
        let scriptCode
        let full = true
        let rawNumberOrHash = numberOrHash

        testCaseCode = testCaseCodePrefix + '000010'
        scriptCode = defaultScriptCode + '_有效区块编号或哈希，showFullTx为ture' + (ledger ? '_' + ledger : '')
        {
            full = true
            let testScript = tcsGetBlock.createTestScript(server, testCaseCode, scriptCode, functionName, numberOrHash, full, ledger)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = testCaseCodePrefix + '000020'
        scriptCode = defaultScriptCode + '_有效区块编号或哈希，showFullTx为false' + (ledger ? '_' + ledger : '')
        {
            full = false
            let testScript = tcsGetBlock.createTestScript(server, testCaseCode, scriptCode, functionName, numberOrHash, full, ledger)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = testCaseCodePrefix + '000030'
        scriptCode = defaultScriptCode + '_有效区块编号或哈希，showFullTx为字符串' + (ledger ? '_' + ledger : '')
        {
            full = 'wrwerwre'
            let testScript = tcsGetBlock.createTestScript(server, testCaseCode, scriptCode, functionName, numberOrHash, full, ledger)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'full is not boolean'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = testCaseCodePrefix + '000030'
        scriptCode = '000200' + '_有效区块编号或哈希，showFullTx为数字' + (ledger ? '_' + ledger : '')
        {
            full = 123123
            let testScript = tcsGetBlock.createTestScript(server, testCaseCode, scriptCode, functionName, numberOrHash, full, ledger)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'full is not boolean'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = testCaseCodePrefix + '000030'
        scriptCode = '000300' + '_有效区块编号或哈希，showFullTx为null' + (ledger ? '_' + ledger : '')
        {
            full = null
            let testScript = tcsGetBlock.createTestScript(server, testCaseCode, scriptCode, functionName, numberOrHash, full, ledger)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'full is null'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = testCaseCodePrefix + '000040'
        scriptCode = defaultScriptCode + '_无效区块编号或哈希9990000000，' + (ledger ? '_' + ledger : '')
        {
            numberOrHash = '9990000000'
            full = false
            let testScript = tcsGetBlock.createTestScript(server, testCaseCode, scriptCode, functionName, numberOrHash, full, ledger)
            let expectedResult = framework.createExpecteResult(false,
                functionName == consts.rpcFunctions.getBlockByNumber
                    ? framework.getError(140, 'value out of range')
                    : framework.getError(-269, 'NewHash256: Wrong length') )
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = testCaseCodePrefix + '000040'
        scriptCode = '000200' + '_无效区块编号或哈希99900000，' + (ledger ? '_' + ledger : '')
        {
            numberOrHash = '99900000'
            full = false
            let testScript = tcsGetBlock.createTestScript(server, testCaseCode, scriptCode, functionName, numberOrHash, full, ledger)
            let expectedResult = framework.createExpecteResult(false,
                functionName == consts.rpcFunctions.getBlockByNumber
                    ? framework.getError(140, 't find block')
                    : framework.getError(-269, 'NewHash256: Wrong length') )
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = testCaseCodePrefix + '000040'
        scriptCode = '000300' + '_无效区块编号或哈希-100，' + (ledger ? '_' + ledger : '')
        {
            numberOrHash = '-100'
            full = false
            let testScript = tcsGetBlock.createTestScript(server, testCaseCode, scriptCode, functionName, numberOrHash, full, ledger)
            let expectedResult = framework.createExpecteResult(false,
                functionName == consts.rpcFunctions.getBlockByNumber
                    ? framework.getError(-269, 'invalid block number')
                    : framework.getError(-269, 'NewHash256: Wrong length') )
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = testCaseCodePrefix + '000040'
        scriptCode = '000400' + '_无效区块编号或哈希abcdefg，' + (ledger ? '_' + ledger : '')
        {
            numberOrHash = 'abcdefg'
            full = false
            let testScript = tcsGetBlock.createTestScript(server, testCaseCode, scriptCode, functionName, numberOrHash, full, ledger)
            let expectedResult = framework.createExpecteResult(false,
                functionName == consts.rpcFunctions.getBlockByNumber
                    ? framework.getError(-269, 'invalid block number')
                    : framework.getError(-269, 'NewHash256: Wrong length') )
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = testCaseCodePrefix + '000040'
        scriptCode = '000500' + '_多個參數混合，' + (ledger ? '_' + ledger : '')
        {
            numberOrHash = rawNumberOrHash
            full = false
            let testScript = tcsGetBlock.createTestScript(server, testCaseCode, scriptCode, functionName, numberOrHash, full, ledger)

            let action = framework.createTestAction(testScript, functionName,
                [tcsGetBlock.createTxParam(server, functionName, numberOrHash, true, ledger)],
                framework.executeTestActionForGet, tcsGetBlock.checkBlock, [{needPass:true}])
            testScript.actions.push(action)

            action = framework.createTestAction(testScript, functionName,
                [tcsGetBlock.createTxParam(server, functionName, numberOrHash, null, ledger)],
                framework.executeTestActionForGet, tcsGetBlock.checkBlock,
                [framework.createExpecteResult(false,
                    framework.getError(-269, 'full is null'))])
            testScript.actions.push(action)

            framework.addTestScript(testScripts, testScript)
        }

        return testScripts

    },

    createTestScript: function(server, testCaseCode, scriptCode, functionName, numberOrHash, full, ledger){

        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        let txParam = tcsGetBlock.createTxParam(server, functionName, numberOrHash, full, ledger)
        let action = framework.createTestActionForGet(testScript, functionName)
        action.txParams = [txParam]
        action.checkForPassResult = tcsGetBlock.checkForPassResult
        testScript.actions.push(action)

        return testScript
    },

    createTxParam: function(server, functionName, numberOrHash, full, ledger){
        let txParam = {}
        if(functionName == consts.rpcFunctions.getBlockByNumber){
            txParam = server.createParamGetBlockByNumber(numberOrHash, full, ledger)
        }
        else{
            txParam = server.createParamGetBlockByHash(numberOrHash, full, ledger)
        }
        return txParam
    },

    checkForPassResult: function(action, param, expected, actual){
        let functionName = action.txFunctionName
        let server = action.server
        let block = actual.result
        expect(block).to.be.jsonSchema(schema.LEDGER_SCHEMA)   //todo need add full block schema

        if(functionName === consts.rpcFunctions.getBlockByNumber){
            expect(block.ledger_index).to.be.equals(param.number)
        }
        else{
            expect(block.ledger_hash).to.be.equals(param.hash)
        }

        expect(block.transactions.length).to.be.equals(server.mode.txs.block.txCountInBlock)

        let full = param[1]
        if(full != null){
            let tx = block.transactions[0]
            expect(typeof tx == 'object' || utility.isJSON(tx)).to.be.equals(full)
        }
    },

    //endregion

}
