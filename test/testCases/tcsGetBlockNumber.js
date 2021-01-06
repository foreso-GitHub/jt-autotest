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
        let testCases = []
        let testCase = {}
    
        let title = '0010\t查询最新区块号：发起查询请求，等待5秒或10秒（同步时间），再次发起查询请求'
        {
            testCase = framework.createTestCase(
                title,
                server,
                consts.rpcFunctions.getBlockNumber,
                null,
                null,
                function (testCase) {  //execute function
                    testCase.hasExecuted = true
                    return tcsGetBlockNumber.get2BlockNumber(server).then(function (compareResult) {
                        // testCase.hasExecuted = true
                        testCase.actualResult.push(compareResult)
                    }, function (error) {
                        logger.debug(error)
                        expect(false).to.be.ok
                    })
                },
                function (testCase) {  //check function
                    let value = testCase.actualResult[0]
                    expect(value.blockNumber2 - value.blockNumber1).to.be.most(2)
                    expect(value.blockNumber2 - value.blockNumber1).to.be.least(1)
                },
                null,
                restrictedLevel.L2,
                [serviceType.newChain, serviceType.oldChain],
                [],//[interfaceType.rpc, interfaceType.websocket]
            )
        }
        framework.addTestScript(testCases, testCase)
    
        title = '0010\t查询最新区块号'
        {
            testCase = framework.createTestCase(
                title,
                server,
                consts.rpcFunctions.getBlockNumber,
                null,
                null,
                framework.executeTestActionForGet,
                this.checkBlockNumber,
                null,
                restrictedLevel.L2,
                [serviceType.newChain, serviceType.oldChain],
                [],//[interfaceType.rpc, interfaceType.websocket]
            )
        }
        framework.addTestScript(testCases, testCase)
        framework.testTestScripts(server, describeTitle, testCases)
    },
    
    checkBlockNumber: function(testCase){
        let response = testCase.actualResult[0]
        framework.checkResponse(true, response)
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
