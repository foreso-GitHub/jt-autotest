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

module.exports = tcsCreateWallet = {

    //region create account
    testForCreateWallet: function(server, describeTitle){

        let testScripts = []
        let testCaseCode
        let defaultScriptCode = '000100'
        let scriptCode
        let functionName = consts.rpcFunctions.createWallet

        //region 参数为空

        testCaseCode = 'FCJT_createWallet_000010'
        scriptCode = defaultScriptCode + '_参数为空'
        {
            let testScript = tcsCreateWallet.createTestScript(server, testCaseCode, scriptCode, functionName, null)
            testScript.actions[0].txParams = []
            framework.addTestScript(testScripts, testScript)
        }

        //endregion

        //region ECDSA

        testCaseCode = 'FCJT_createWallet_000020'
        scriptCode = defaultScriptCode + '_参数为ECDSA'
        {
            let type = consts.walletTypes.ECDSA
            let testScript = tcsCreateWallet.createTestScript(server, testCaseCode, scriptCode, functionName, type)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_createWallet_000020'
        scriptCode = '000200' + '_参数为ecdsa'
        {
            let type = 'ecdsa'
            let testScript = tcsCreateWallet.createTestScript(server, testCaseCode, scriptCode, functionName, type)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_createWallet_000020'
        scriptCode = '000300' + '_参数为Ecdsa'
        {
            let type = 'Ecdsa'
            let testScript = tcsCreateWallet.createTestScript(server, testCaseCode, scriptCode, functionName, type)
            framework.addTestScript(testScripts, testScript)
        }

        //endregion

        //region Ed25519

        testCaseCode = 'FCJT_createWallet_000030'
        scriptCode = defaultScriptCode + '_参数为Ed25519'
        {
            let type = consts.walletTypes.Ed25519
            let testScript = tcsCreateWallet.createTestScript(server, testCaseCode, scriptCode, functionName, type)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_createWallet_000030'
        scriptCode = '000200' + '_参数为ed25519'
        {
            let type = 'ed25519'
            let testScript = tcsCreateWallet.createTestScript(server, testCaseCode, scriptCode, functionName, type)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_createWallet_000030'
        scriptCode = '000300' + '_参数为ED25519'
        {
            let type = 'ED25519'
            let testScript = tcsCreateWallet.createTestScript(server, testCaseCode, scriptCode, functionName, type)
            framework.addTestScript(testScripts, testScript)
        }

        //endregion

        //region SM2

        testCaseCode = 'FCJT_createWallet_000040'
        scriptCode = defaultScriptCode + '_参数为SM2'
        {
            let type = consts.walletTypes.SM2
            let testScript = tcsCreateWallet.createTestScript(server, testCaseCode, scriptCode, functionName, type)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_createWallet_000040'
        scriptCode = '000200' + '_参数为sm2'
        {
            let type = 'sm2'
            let testScript = tcsCreateWallet.createTestScript(server, testCaseCode, scriptCode, functionName, type)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_createWallet_000040'
        scriptCode = '000300' + '_参数为Sm2'
        {
            let type = 'Sm2'
            let testScript = tcsCreateWallet.createTestScript(server, testCaseCode, scriptCode, functionName, type)
            framework.addTestScript(testScripts, testScript)
        }

        //endregion

        //region 无效的参数

        testCaseCode = 'FCJT_createWallet_000050'
        scriptCode = defaultScriptCode + '_无效的参数,数字'
        {
            let type = 123123
            let testScript = tcsCreateWallet.createTestScript(server, testCaseCode, scriptCode, functionName, type)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'null key type'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_createWallet_000050'
        scriptCode = '000200' + '_无效的参数,非ECDSA/Ed25519/SM2'
        {
            let type = '123123'
            let testScript = tcsCreateWallet.createTestScript(server, testCaseCode, scriptCode, functionName, type)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'unknown key type'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_createWallet_000050'
        scriptCode = '000300' + '_无效的参数,空格'
        {
            let type = "   "
            let testScript = tcsCreateWallet.createTestScript(server, testCaseCode, scriptCode, functionName, type)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'unknown key type'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_createWallet_000050'
        scriptCode = '000400' + '_无效的参数,空格SM2'
        {
            let type = "  SM2"
            let testScript = tcsCreateWallet.createTestScript(server, testCaseCode, scriptCode, functionName, type)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'unknown key type'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_createWallet_000050'
        scriptCode = '000500' + '_无效的参数,""'
        {
            let type = ""
            let testScript = tcsCreateWallet.createTestScript(server, testCaseCode, scriptCode, functionName, type)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'null key type'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        //endregion

        framework.testTestScripts(server, describeTitle, testScripts)
    },

    createTestScript: function(server, testCaseCode, scriptCode, functionName, type){

        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        let action = framework.createTestActionForGet(testScript, consts.rpcFunctions.createWallet)
        action.txParams = [server.createParamCreateWallet(type)]
        action.checkForGetByNoneArrayParams = tcsCreateWallet.checkForGetByNoneArrayParams
        action.checkForPassResult = tcsCreateWallet.checkForPassResult
        testScript.actions.push(action)
        return testScript
    },

    checkForGetByNoneArrayParams: function(action){
        let account = action.actualResult.result
        let type = consts.walletTypes.ECDSA
        tcsCreateWallet.checkPass(account, type)
    },

    checkForPassResult: function(action, param, expected, actual){
        let type = param.type
        let account = actual.result
        tcsCreateWallet.checkPass(account, type)
    },

    checkPass: function(account, type){
        expect(account).to.be.jsonSchema(schema.WALLET_SCHEMA)
        expect(account.address).to.match(/^j/)
        expect(account.secret).to.match(/^s/)
        if(!type || type == ''){
            expect(account.type).to.match(/\bECDSA|\bEd25519|\bSM2/)
        }
        else{
            expect(account.type.toUpperCase()).to.equal(type.toUpperCase())
        }
    },
    //endregion

}
