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
        let testScripts = []
        let testCaseCode
        let scriptCode = '000100'

        testCaseCode = 'FCJT_version_000010'
        scriptCode = '000100_参数空数组'
        {
            let testScript = tcsGetVersion.createTestScript(server, testCaseCode, scriptCode)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_version_000020'
        scriptCode = '000100_参数json'
        {
            let testScript = tcsGetVersion.createTestScript(server, testCaseCode, scriptCode)
            testScript.actions[0].txParams = ['json']
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_version_000030'
        scriptCode = '000100_参数空字符串'
        {
            let testScript = tcsGetVersion.createTestScript(server, testCaseCode, scriptCode)
            testScript.actions[0].txParams = [""]
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_version_000030'
        scriptCode = '000200_参数123'
        {
            let testScript = tcsGetVersion.createTestScript(server, testCaseCode, scriptCode)
            testScript.actions[0].txParams = ['123']
            testScript.actions[0].expectedResults = [framework.createExpecteResult(false,
                framework.getError(-269, 'error parameter'))]
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_version_000030'
        scriptCode = '000300_参数abc'
        {
            let testScript = tcsGetVersion.createTestScript(server, testCaseCode, scriptCode)
            testScript.actions[0].txParams = ['abc']
            testScript.actions[0].expectedResults = [framework.createExpecteResult(false,
                framework.getError(-269, 'error parameter'))]
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
        let action = framework.createTestAction(testScript, consts.rpcFunctions.getVersion, [],
            framework.executeTestActionForGet, tcsGetVersion.checkGetVersion, [{needPass:true}])
        testScript.actions.push(action)
        return testScript
    },

    checkGetVersion: function(action){
        let expectedResult = action.expectedResults[0]
        let actualResult = action.actualResult
        framework.checkResponse(actualResult)
        if(expectedResult.needPass){
            let version = actualResult.result
            if(utility.isJSON(version)){
                expect(version).to.be.jsonSchema(schema.VERSION_SCHEMA)
            }
            else{
                // expect(version).to.be.equal(utility.combineVersionInfo(consts.versions[jtVersion]))
                version = utility.parseVersionInfo(version)
            }
            expect(utility.combineVersionInfo(version)).to.be.equal(utility.combineVersionInfo(consts.versions[jtVersion]))
        }
        else{
            framework.checkResponseError(action, expectedResult, actualResult)
        }
        action.testResult = true
    },
//endregion

}
