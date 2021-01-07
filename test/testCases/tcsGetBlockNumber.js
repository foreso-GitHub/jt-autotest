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
        let response = action.actualResult
        framework.checkResponse(response)
        expect(response.result).to.be.jsonSchema(schema.BLOCKNUMBER_SCHEMA)
        expect(response.result).to.be.above(10)
    },

    get2BlockNumber: async function(server) {
        return new Promise(async (resolve, reject) => {
            if(!server) reject("Server cannot be null!")
            let result = {}
            result.blockNumber1 = await server.getBlockNumber(server)
            //logger.debug("defaultBlockTime: " + server.mode.defaultBlockTime)
            await utility.timeout(server.mode.defaultBlockTime)
            result.blockNumber2 = await server.getBlockNumber(server)
            resolve(result)
        })
    },
    
    //endregion

}
