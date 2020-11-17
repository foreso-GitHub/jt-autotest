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
const jtVersion = require('../config/basicConfig').jtVersion
let utility = require('../framework/testUtility')
//endregion
//endregion

module.exports = tcsGetVersion = {

    //region get accounts
    testForGetVersion: function(server, describeTitle){
        let testCases = []

        let title = '0010\tjt_version'
        let functionName = consts.rpcFunctions.getVersion
        let txParams = []
        let expectedResult = {}
        expectedResult.needPass = true

        let testCase = framework.createTestCase(
            title,
            server,
            functionName,
            txParams,
            null,
            framework.executeTestCaseForGet,
            tcsGetVersion.checkGetVersion,
            expectedResult,
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )
        framework.addTestCase(testCases, testCase)

        framework.testTestCases(server, describeTitle, testCases)
    },

    checkGetVersion: function(testCase){
        let response = testCase.actualResult[0]
        let needPass = testCase.expectedResult.needPass
        framework.checkResponse(needPass, response)
        if(needPass){
            // expect(response.result).to.be.jsonSchema(schema.BALANCE_SCHEMA)
            let version = response.result
            expect(version).to.be.equal(consts.versions[jtVersion])
        }
        else{
            framework.checkResponseError(testCase, response.message, testCase.expectedResult.expectedError)
        }
    },
//endregion

}