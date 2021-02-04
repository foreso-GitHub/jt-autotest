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
        describe(describeTitle, async function () {
            tcsCreateAccount.testByTypes(server, describeTitle, null)
            tcsCreateAccount.testByTypes(server, describeTitle, consts.walletTypes.ECDSA)
            tcsCreateAccount.testByTypes(server, describeTitle, consts.walletTypes.Ed25519)
            tcsCreateAccount.testByTypes(server, describeTitle, consts.walletTypes.SM2)
        })
    },

    testByTypes: function(server, describeTitle, type){

        let prefixCode = '000'
        if(type){
            if(type == consts.walletTypes.ECDSA){
                prefixCode = '001'
            }
            else if(type == consts.walletTypes.Ed25519){
                prefixCode = '002'
            }
            else if(type == consts.walletTypes.SM2){
                prefixCode = '003'
            }
        }

        let testScripts = []
        let testCaseCode
        let scriptCode

        testCaseCode = 'FCJT_createAccount_000010'
        scriptCode = prefixCode + '100' + '_创建有效的账户'
        {
            let nickname = utility.getDynamicTokenName().symbol
            let testScript = tcsCreateAccount.createTestScript(server, testCaseCode, scriptCode, nickname, type)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_createAccount_000020'
        scriptCode = prefixCode + '100' + '_创建无效的账户，重复的名字'
        {
            let nickname = server.mode.addresses.balanceAccount.nickname
            let testScript = tcsCreateAccount.createTestScript(server, testCaseCode, scriptCode, nickname, type)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'the nickname already exists'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_createAccount_000020'
        scriptCode = prefixCode + '200' + '_创建无效的账户，超过长度的字符串数字'
        {
            let nickname = utility.getDynamicTokenName().name + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字'
                + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字'
                + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字'
                + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字'
            let testScript = tcsCreateAccount.createTestScript(server, testCaseCode, scriptCode, nickname, type)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'the length of the nickname must be in the range (0,256]'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle + ', type: ' + type, testScripts)
    },

    createTestScript: function(server, testCaseCode, scriptCode, nickname, type){

        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        let action = framework.createTestActionForGet(testScript, consts.rpcFunctions.createAccount)
        action.txParams = [server.createParamCreateAccount(nickname, type)]
        action.checkForPassResult = tcsCreateAccount.checkForPassResult
        testScript.actions.push(action)
        return testScript

    },

    checkForPassResult: function(action, param, expected, actual){
        let account = actual.result
        let nickname = param.nick
        let type = param.type
        expect(account).to.be.jsonSchema(schema.WALLET_SCHEMA)
        expect(account.address).to.match(/^j/)
        expect(account.secret).to.match(/^s/)
        if(!type || type == ''){
            expect(account.type).to.match(/\bECDSA|\bEd25519|\bSM2/)
        }
        else{
            expect(account.type.toUpperCase()).to.equal(type.toUpperCase())
        }
        expect(account.nickname).to.equal(nickname)
    },

    //endregion

}
