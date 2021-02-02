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

        let testScripts = []
        let testCaseCode
        let scriptCode

        testCaseCode = 'FCJT_accounts_000010'
        scriptCode = '000100'
        {
            let testScript = tcsGetAccounts.createTestScript(server, testCaseCode, scriptCode, )
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle, testScripts)
    },

    createTestScript: function(server, testCaseCode, scriptCode, ){

        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        let action = framework.createTestActionForGet(testScript, consts.rpcFunctions.getAccounts)
        action.txParams = []
        action.checkForPassResult = tcsGetAccounts.checkForPassResult
        testScript.actions.push(action)

        return testScript

    },

    checkForPassResult: function(action, param, expected, actual){
        // expect(response.result).to.be.jsonSchema(schema.BALANCE_SCHEMA)  //todo: add account schema
        let accounts = actual.result
        let rootAccount = 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh:root'
        expect(accounts.length).to.be.above(0)
        expect(accounts).to.be.contains(rootAccount)
    },

    //endregion

}
