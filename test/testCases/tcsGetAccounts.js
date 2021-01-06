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

module.exports = tcsGetAccounts = {

    //region get accounts
    testForGetAccounts: function(server, describeTitle){
        let testCases = []

        let title = '0010\tjt_accounts'
        let functionName = consts.rpcFunctions.getAccounts
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
            tcsGetAccounts.checkGetAccounts,
            expectedResult,
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )
        framework.addTestScript(testCases, testCase)

        framework.testTestScripts(server, describeTitle, testCases)
    },

    checkGetAccounts: function(testCase){
        let response = testCase.actualResult[0]
        let needPass = testCase.expectedResult.needPass
        framework.checkResponse(needPass, response)
        if(needPass){
            // expect(response.result).to.be.jsonSchema(schema.BALANCE_SCHEMA)  //todo: add account schema
            let accounts = response.result
            let rootAccount = 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh:root'
            // logger.debug(JSON.stringify(accounts))
            expect(accounts.length).to.be.above(0)
            expect(accounts).to.be.contains(rootAccount)
        }
        else{
            framework.checkResponseError(testCase, response.message, testCase.expectedResult.expectedError)
        }
    },
//endregion

}
