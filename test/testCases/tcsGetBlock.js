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

    createTestScriptsForGetBlock: function(server, functionName, numberOrHash, tag){
        let testScripts = []
        let testCaseCodePrefix = (functionName === consts.rpcFunctions.getBlockByNumber)
            ? 'FCJT_getBlockByNumber_' : 'FCJT_getBlockByHash_'
        let testCaseCode
        let defaultScriptCode = '000100'
        let scriptCode
        let showFullTx = true

        testCaseCode = testCaseCodePrefix + '000010'
        scriptCode = defaultScriptCode + '_有效区块编号或哈希，showFullTx为ture' + (tag ? '_' + tag : '')
        {
            showFullTx = true
            let testScript = tcsGetBlock.createTestScript(server, testCaseCode, scriptCode, functionName, numberOrHash, showFullTx, tag)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = testCaseCodePrefix + '000020'
        scriptCode = defaultScriptCode + '_有效区块编号或哈希，showFullTx为false' + (tag ? '_' + tag : '')
        {
            showFullTx = false
            let testScript = tcsGetBlock.createTestScript(server, testCaseCode, scriptCode, functionName, numberOrHash, showFullTx, tag)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = testCaseCodePrefix + '000030'
        scriptCode = defaultScriptCode + '_有效区块编号或哈希，showFullTx为字符串' + (tag ? '_' + tag : '')
        {
            showFullTx = 'wrwerwre'
            let testScript = tcsGetBlock.createTestScript(server, testCaseCode, scriptCode, functionName, numberOrHash, showFullTx, tag)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'full is not boolean'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = testCaseCodePrefix + '000030'
        scriptCode = '000200' + '_有效区块编号或哈希，showFullTx为数字' + (tag ? '_' + tag : '')
        {
            showFullTx = 123123
            let testScript = tcsGetBlock.createTestScript(server, testCaseCode, scriptCode, functionName, numberOrHash, showFullTx, tag)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'full is not boolean'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = testCaseCodePrefix + '000030'
        scriptCode = '000300' + '_有效区块编号或哈希，showFullTx为null' + (tag ? '_' + tag : '')
        {
            showFullTx = null
            let testScript = tcsGetBlock.createTestScript(server, testCaseCode, scriptCode, functionName, numberOrHash, showFullTx, tag)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'full is null'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = testCaseCodePrefix + '000040'
        scriptCode = defaultScriptCode + '_无效区块编号或哈希9990000000，' + (tag ? '_' + tag : '')
        {
            numberOrHash = '9990000000'
            showFullTx = false
            let testScript = tcsGetBlock.createTestScript(server, testCaseCode, scriptCode, functionName, numberOrHash, showFullTx, tag)
            let expectedResult = framework.createExpecteResult(false,
                functionName == consts.rpcFunctions.getBlockByNumber
                    ? framework.getError(140, 'value out of range')
                    : framework.getError(-269, 'NewHash256: Wrong length') )
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = testCaseCodePrefix + '000040'
        scriptCode = '000200' + '_无效区块编号或哈希99900000，' + (tag ? '_' + tag : '')
        {
            numberOrHash = '99900000'
            showFullTx = false
            let testScript = tcsGetBlock.createTestScript(server, testCaseCode, scriptCode, functionName, numberOrHash, showFullTx, tag)
            let expectedResult = framework.createExpecteResult(false,
                functionName == consts.rpcFunctions.getBlockByNumber
                    ? framework.getError(140, 't find block')
                    : framework.getError(-269, 'NewHash256: Wrong length') )
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = testCaseCodePrefix + '000040'
        scriptCode = '000300' + '_无效区块编号或哈希-100，' + (tag ? '_' + tag : '')
        {
            numberOrHash = '-100'
            showFullTx = false
            let testScript = tcsGetBlock.createTestScript(server, testCaseCode, scriptCode, functionName, numberOrHash, showFullTx, tag)
            let expectedResult = framework.createExpecteResult(false,
                functionName == consts.rpcFunctions.getBlockByNumber
                    ? framework.getError(140, 'invalid syntax')
                    : framework.getError(-269, 'encoding/hex: invalid byte') )
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = testCaseCodePrefix + '000040'
        scriptCode = '000400' + '_无效区块编号或哈希abcdefg，' + (tag ? '_' + tag : '')
        {
            numberOrHash = 'abcdefg'
            showFullTx = false
            let testScript = tcsGetBlock.createTestScript(server, testCaseCode, scriptCode, functionName, numberOrHash, showFullTx, tag)
            let expectedResult = framework.createExpecteResult(false,
                functionName == consts.rpcFunctions.getBlockByNumber
                    ? framework.getError(140, 'invalid syntax')
                    : framework.getError(-269, 'encoding/hex: invalid byte') )
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        return testScripts

    },

    createTestScript: function(server, testCaseCode, scriptCode, functionName, numberOrHash, showFullTx, tag){
        let txParams = []
        txParams.push(numberOrHash)
        txParams.push(showFullTx)
        if(tag) txParams.push(tag)

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
            framework.executeTestActionForGet, tcsGetBlock.checkBlock, [{needPass:true}])
        testScript.actions.push(action)
        return testScript
    },

    checkBlock: function(action){
        let response = action.actualResult
        let expectedResult = action.expectedResults[0]
        let needPass = expectedResult.needPass
        framework.checkGetResponse(response)
        if(needPass){
            expect(response.result).to.be.jsonSchema(schema.LEDGER_SCHEMA)   //todo need add full block schema
            let functionName = action.txFunctionName
            let blockNumberOrHash = action.txParams[0]
            expect((functionName === consts.rpcFunctions.getBlockByNumber) ? response.result.ledger_index : response.result.ledger_hash)
                .to.be.equals(blockNumberOrHash)
            let server = action.server
            expect(response.result.transactions.length).to.be.equals(server.mode.txs.block.txCountInBlock)
            let showFullTx = action.txParams[1]
            if(showFullTx != null){
                let tx = response.result.transactions[0]
                expect(typeof tx == 'object' || utility.isJSON(tx)).to.be.equals(showFullTx)
            }
        }
        else{
            framework.checkResponseError(action, expectedResult, response)
        }
    },

    //endregion

}
