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

module.exports = tcsGetReceipt = {

    //region tx receipt check

    testForGetTransactionReceipt: function(server, describeTitle){

        //region fields

        let testScripts = []
        let testCaseCode
        let defaultScriptCode = '000100'
        let scriptCode

        //endregion

        let testCases = []

        testCaseCode = 'FCJT_getTransactionReceipt_000010'
        scriptCode = defaultScriptCode + '_发送币的交易'
        {
            let hash = server.mode.txs.tx1.hash
            let testScript = tcsGetReceipt.createTestScript(server, testCaseCode, scriptCode, hash)
            framework.addTestScript(testScripts, testScript)
        }

        //todo FCJT_getTransactionReceipt_000010 查询有效的交易哈希（发币的交易、发送币的交易、底层币、代币等）

        testCaseCode = 'FCJT_getTransactionReceipt_000020'
        scriptCode = defaultScriptCode + '_不存在的交易哈希'
        {
            let hash = 'B9A45BD943EE1F3AB8F505A61F6EE38F251DA723ECA084CBCDAB5076C60F84E8'
            let testScript = tcsGetReceipt.createTestScript(server, testCaseCode, scriptCode, hash)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(140, 't find transaction'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionReceipt_000020'
        scriptCode = '000200' + '_数字'
        {
            let hash = '100093'
            let testScript = tcsGetReceipt.createTestScript(server, testCaseCode, scriptCode, hash)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'NewHash256: Wrong length'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionReceipt_000020'
        scriptCode = '000300' + '_字符串乱码'
        {
            let hash = '1231dsfafwrwerwer'
            let testScript = tcsGetReceipt.createTestScript(server, testCaseCode, scriptCode, hash)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'encoding/hex: invalid byte'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle, testScripts)
    },

    createTestScript: function(server, testCaseCode, scriptCode, hash,){

        let functionName = consts.rpcFunctions.getTransactionReceipt
        let txParams = []
        txParams.push(hash)

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
            framework.executeTestActionForGet, tcsGetReceipt.checkTransactionReceipt, [{needPass:true}])
        testScript.actions.push(action)
        return testScript

    },

    checkTransactionReceipt: function(action){
        let response = action.actualResult
        let needPass = action.expectedResults[0].needPass
        framework.checkGetResponse(response)
        if(needPass){
            // expect(response.result).to.be.jsonSchema(schema.LEDGER_SCHEMA)   //todo need add full block schema
            let affectedNodes = response.result.AffectedNodes
            let from = affectedNodes[1].ModifiedNode.FinalFields.Account
            let to = affectedNodes[2].ModifiedNode.FinalFields.Account
            expect(from).to.be.equals(action.server.mode.txs.tx1.Account)
            expect(to).to.be.equals(action.server.mode.txs.tx1.Destination)
        }
        else{
            framework.checkResponseError(action, action.expectedResults[0], response)
        }
    },

//endregion

}
