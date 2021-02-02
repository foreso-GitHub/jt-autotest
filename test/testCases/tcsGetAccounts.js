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
        action.checkForGetByNoneArrayParams = tcsGetAccounts.checkForGetByNoneArrayParams
        testScript.actions.push(action)

        return testScript

    },

    checkForGetByNoneArrayParams: function(action){
        let accounts = action.actualResult.result
        expect(accounts).to.be.jsonSchema(schema.ACCOUNTS_SCHEMA)
        let rootAccount = 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh:root'
        expect(accounts.length).to.be.above(0)
        expect(accounts).to.be.contains(rootAccount)
    },

    //endregion

}
