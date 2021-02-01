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

module.exports = tcsGetBlockNumber = {

    //region blockNumber test case
    
    testForGetBlockNumber: function(server, describeTitle) {
        let testScripts = []
        let testCaseCode
        let defaultScriptCode = '000100'
        let scriptCode

        testCaseCode = 'FCJT_blockNumber_000010'
        scriptCode = defaultScriptCode + '_查询最新区块号'
        {
            let testScript = tcsGetBlockNumber.createTestScript(server, testCaseCode, scriptCode)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_blockNumber_000010'
        scriptCode = '000200' + '_查询最新区块号：发起查询请求，等待5秒或10秒（同步时间），再次发起查询请求'
        {
            let testScript = tcsGetBlockNumber.createTestScript(server, testCaseCode, scriptCode)
            testScript.actions[0].executeFunction = function (action) {  //execute function
                action.hasExecuted = true
                return tcsGetBlockNumber.get2BlockNumber(server).then(function (compareResult) {
                    // testCase.hasExecuted = true
                    action.actualResult = compareResult
                }, function (error) {
                    logger.debug(error)
                    expect(false).to.be.ok
                })
            }
            testScript.actions[0].checkFunction = function (action) {  //check function
                let value = action.actualResult
                expect(value.blockNumber2 - value.blockNumber1).to.be.most(2)
                expect(value.blockNumber2 - value.blockNumber1).to.be.least(1)
            }
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_blockNumber_000020'
        scriptCode = defaultScriptCode + '_type参数为number'
        {
            let testScript = tcsGetBlockNumber.createTestScript(server, testCaseCode, scriptCode)
            testScript.actions[0].txParams = [{"type": "number"}]
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_blockNumber_000030'
        scriptCode = defaultScriptCode + '_type参数为info'
        {
            let testScript = tcsGetBlockNumber.createTestScript(server, testCaseCode, scriptCode)
            testScript.actions[0].txParams = [{"type": "info"}]
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_blockNumber_000030'
        scriptCode = '000200' + '_type参数为"123"'
        {
            let testScript = tcsGetBlockNumber.createTestScript(server, testCaseCode, scriptCode)
            testScript.actions[0].txParams = [{"type": "123"}]
            testScript.actions[0].expectedResults = [framework.createExpecteResult(false,
                framework.getError(-269, 'error parameter'))]
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_blockNumber_000030'
        scriptCode = '000300' + '_type参数为空字符串'
        {
            let testScript = tcsGetBlockNumber.createTestScript(server, testCaseCode, scriptCode)
            testScript.actions[0].txParams = [{"type": ""}]
            testScript.actions[0].expectedResults = [framework.createExpecteResult(false,
                framework.getError(-269, 'error parameter'))]
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_blockNumber_000030'
        scriptCode = '000400' + '_多個參數混合'
        {
            let testScript = tcsGetBlockNumber.createTestScript(server, testCaseCode, scriptCode)
            testScript.actions[0].txParams = [{"type": ""}]
            testScript.actions[0].expectedResults = [framework.createExpecteResult(false,
                framework.getError(-269, 'error parameter'))]

            let action = framework.createTestAction(testScript, consts.rpcFunctions.getBlockNumber, [{type: 'number'}],
                framework.executeTestActionForGet, tcsGetBlockNumber.checkBlockNumber, [{needPass:true}])
            testScript.actions.push(action)

            action = framework.createTestAction(testScript, consts.rpcFunctions.getBlockNumber, [{type: 'info'}],
                framework.executeTestActionForGet, tcsGetBlockNumber.checkBlockNumber, [{needPass:true}])
            testScript.actions.push(action)

            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle, testScripts)
    },

    createTestScript: function(server, testCaseCode, scriptCode){
        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )
        let action = framework.createTestAction(testScript, consts.rpcFunctions.getBlockNumber, [],
            framework.executeTestActionForGet, tcsGetBlockNumber.checkBlockNumber, [{needPass:true}])
        testScript.actions.push(action)
        return testScript
    },
    
    checkBlockNumber: function(action){
        framework.checkGetResponse(action.actualResult)

        let params = action.txParams
        let expectedResults = action.expectedResults
        let actualResults = action.actualResult.result

        if(params.length == 0){
            expect(action.actualResult.result).to.be.jsonSchema(schema.BLOCKNUMBER_NUMBER_SCHEMA)
            expect(action.actualResult.result).to.be.above(10)
        }
        else{
            for(let i = 0; i < params.length; i++) {
                let param = params[i]
                let expected = expectedResults[i]
                let actual = actualResults[i]

                if(expected.needPass){
                    let result = actual.result
                    if(param.type && param.type == 'number'){
                        expect(result).to.be.jsonSchema(schema.BLOCKNUMBER_NUMBER_SCHEMA)
                        expect(result).to.be.above(10)
                    }
                    else if (param.type && param.type == 'info'){
                        expect(result).to.be.jsonSchema(schema.BLOCKNUMBER_INFO_SCHEMA)
                        expect(result[0]).to.be.above(10)
                        expect(result[1]).to.be.least(0)
                    }
                    else{
                        expect('param error ' + JSON.stringify(param)).to.be.not.ok
                    }
                }
                else{
                    framework.checkResponseError(expected, actual)
                }
            }
        }
    },

    get2BlockNumber: async function(server) {
        return new Promise(async (resolve, reject) => {
            if(!server) reject("Server cannot be null!")
            let result = {}
            result.blockNumber1 = await server.getBlockNumber(server, 'number')
            //logger.debug("defaultBlockTime: " + server.mode.defaultBlockTime)
            await utility.timeout(server.mode.defaultBlockTime)
            result.blockNumber2 = await server.getBlockNumber(server, 'number')
            resolve(result)
        })
    },
    
    //endregion

}
