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

    createTestScriptsForGetBlock: function(server, functionName, numberOrHash){
        let testScripts = []
        let testCaseCodePrefix = (functionName === consts.rpcFunctions.getBlockByNumber)
            ? 'FCJT_getBlockByNumber_' : 'FCJT_getBlockByHash_'
        let testCaseCode
        let defaultScriptCode = '000100'
        let scriptCode
        let showFullTx = true
        let tag

        testCaseCode = testCaseCodePrefix + '000010'
        scriptCode = defaultScriptCode
        {
            showFullTx = true
            let testScript = tcsGetBlock.createTestScript(server, testCaseCode, scriptCode, functionName, numberOrHash, showFullTx, tag)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = testCaseCodePrefix + '000020'
        scriptCode = defaultScriptCode
        {
            showFullTx = false
            let testScript = tcsGetBlock.createTestScript(server, testCaseCode, scriptCode, functionName, numberOrHash, showFullTx, tag)
            framework.addTestScript(testScripts, testScript)
        }

        // testNumber = '0020'
        // showFullTx = true
        // testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        // testCase.supportedServices.push(serviceType.oldChain)
        // framework.addTestScript(testCases, testCase)
        //
        // if(functionName == consts.rpcFunctions.getBlockByNumber){
        //     testNumber = '0030'
        //     numberOrHash = 'earliest'
        //     showFullTx = true
        //     testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        //     testCase.restrictedLevel = restrictedLevel.L4
        //     framework.addTestScript(testCases, testCase)
        //
        //     testNumber = '0040'
        //     numberOrHash = 'earliest'
        //     showFullTx = false
        //     testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        //     testCase.restrictedLevel = restrictedLevel.L4
        //     framework.addTestScript(testCases, testCase)
        //
        //     testNumber = '0050'
        //     numberOrHash = 'latest'
        //     showFullTx = true
        //     testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        //     testCase.restrictedLevel = restrictedLevel.L4
        //     framework.addTestScript(testCases, testCase)
        //
        //     testNumber = '0060'
        //     numberOrHash = 'latest'
        //     showFullTx = false
        //     testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        //     testCase.restrictedLevel = restrictedLevel.L4
        //     framework.addTestScript(testCases, testCase)
        //
        //     testNumber = '0090'
        //     numberOrHash = 'pending'
        //     showFullTx = true
        //     testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        //     testCase.restrictedLevel = restrictedLevel.L4
        //     framework.addTestScript(testCases, testCase)
        //
        //     testNumber = '0100'
        //     numberOrHash = 'pending'
        //     showFullTx = false
        //     testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        //     testCase.restrictedLevel = restrictedLevel.L4
        //     framework.addTestScript(testCases, testCase)
        // }
        //
        // testNumber = '0110_0001'
        // {
        //     numberOrHash = validNumberOrHash
        //     showFullTx = 'wrwerwre'
        //     needPass = false
        //     expectedError = framework.getError(-269, 'full is not boolean')
        //     testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        //     testCase.title = testNumber + '\t有效区块编号，无效Boolean参数：showFullTx是字符串'
        //     testCase.supportedServices.push(serviceType.oldChain)
        //     framework.addTestScript(testCases, testCase)
        // }

        // testNumber = '0110_0002'
        // numberOrHash = validNumberOrHash
        // showFullTx = 123123
        // needPass = false
        // expectedError = framework.getError(-269, 'full is not boolean')
        // testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        // testCase.title = testNumber + '\t有效区块编号，无效Boolean参数：showFullTx是数字'
        // testCase.supportedServices.push(serviceType.oldChain)
        // framework.addTestScript(testCases, testCase)
        //
        // testNumber = '0110_0003'
        // numberOrHash = validNumberOrHash
        // showFullTx = null
        // needPass = false
        // expectedError = framework.getError(-269, 'full is null')
        // testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        // testCase.title = testNumber + '\t有效区块编号，无效Boolean参数：showFullTx是空值'
        // testCase.supportedServices.push(serviceType.oldChain)
        // framework.addTestScript(testCases, testCase)
        //
        // testNumber = '0120_0001'
        // numberOrHash = '9990000000'
        // showFullTx = false
        // needPass = false
        // expectedError = (functionName == consts.rpcFunctions.getBlockByNumber)
        //     ? framework.getError(140, 'value out of range')
        //     : framework.getError(-269, 'NewHash256: Wrong length')
        // testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        // // testCase.supportedServices.push(serviceType.oldChain)  //old chain not support huge block number, it will cause test hook more than 20s
        // framework.addTestScript(testCases, testCase)
        //
        // testNumber = '0120_0002'
        // numberOrHash = '99900000'
        // showFullTx = false
        // needPass = false
        // expectedError = (functionName == consts.rpcFunctions.getBlockByNumber)
        //     ? framework.getError(140, 't find block')
        //     : framework.getError(-269, 'NewHash256: Wrong length')
        // testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        // if(functionName == consts.rpcFunctions.getBlockByNumber) testCase.supportedServices.push(serviceType.oldChain)
        // framework.addTestScript(testCases, testCase)
        //
        // testNumber = '0120_0003'
        // numberOrHash = '-1000'
        // showFullTx = false
        // needPass = false
        // expectedError = (functionName == consts.rpcFunctions.getBlockByNumber)
        //     ? framework.getError(140, 'invalid syntax')
        //     : framework.getError(-269, 'encoding/hex: invalid byte')
        // testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        // if(functionName == consts.rpcFunctions.getBlockByNumber) testCase.supportedServices.push(serviceType.oldChain)
        // framework.addTestScript(testCases, testCase)
        //
        // testNumber = '0120_0004'
        // numberOrHash = 'abcdefg'
        // showFullTx = false
        // needPass = false
        // expectedError = (functionName == consts.rpcFunctions.getBlockByNumber)
        //     ? framework.getError(140, 'invalid syntax')
        //     : framework.getError(-269, 'encoding/hex: invalid byte')
        // testCase = tcsGetBlock.createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        // if(functionName == consts.rpcFunctions.getBlockByNumber) testCase.supportedServices.push(serviceType.oldChain)
        // framework.addTestScript(testCases, testCase)

        return testScripts
    },

    createTestScript: function(server, testCaseCode, scriptCode, functionName, numberOrHash, showFullTx, tag){
        let txParams = []
        txParams.push(numberOrHash)
        if(showFullTx != undefined) txParams.push(showFullTx)
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
        framework.checkResponse(response)
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
            framework.checkResponseError(action, response, action.expectedResult.expectedError)
        }
    },

//endregion

}
