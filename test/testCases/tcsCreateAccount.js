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

module.exports = tcsCreateAccount = {

    //region create account
    testForCreateAccount: function(server, describeTitle){

        let testScripts = []
        let testCaseCode
        let defaultScriptCode = '000100'
        let scriptCode

        testCaseCode = 'FCJT_createAccount_000010'
        scriptCode = defaultScriptCode + '_创建有效的账户'
        {
            let nickName = utility.getDynamicTokenName().symbol
            let testScript = tcsCreateAccount.createTestScript(server, testCaseCode, scriptCode, nickName)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_createAccount_000020'
        scriptCode = defaultScriptCode + '_创建无效的账户，重复的名字'
        {
            let nickName = server.mode.addresses.balanceAccount.nickName
            let testScript = tcsCreateAccount.createTestScript(server, testCaseCode, scriptCode, nickName)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-191, 'the nickname already exists'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_createAccount_000020'
        scriptCode = '000200' + '_创建无效的账户，超过长度的字符串数字'
        {
            let nickName = utility.getDynamicTokenName().name + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字'
                + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字'
                + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字'
                + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字'
            let testScript = tcsCreateAccount.createTestScript(server, testCaseCode, scriptCode, nickName)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-278, 'the length of the nickname must be in the range (0,256]'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle, testScripts)

    },

    createTestScript: function(server, testCaseCode, scriptCode, nickName,){

        let functionName = consts.rpcFunctions.createAccount
        let txParams = []
        txParams.push(nickName)

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
            framework.executeTestActionForGet, tcsCreateAccount.checkCreateWallet, [{needPass:true}])
        testScript.actions.push(action)
        return testScript

    },

    checkCreateAccount: function(action){
        let response = action.actualResult
        let needPass = action.expectedResults[0].needPass
        framework.checkResponse(response)
        if(needPass){
            let account = response.result[0]
            let nickName = action.txParams[0]
            expect(account).to.be.jsonSchema(schema.WALLET_SCHEMA)
            expect(account.address).to.match(/^j/)
            expect(account.secret).to.match(/^s/)
            expect(account.nickname).to.equal(nickName)
        }
        else{
            framework.checkResponseError(action, action.expectedResults[0], response)
        }
    },

    //endregion

}
