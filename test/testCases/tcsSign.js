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

module.exports = tcsSign = {

    //region create account
    testForSign: function(server, describeTitle){

        let testScripts = []
        let testCaseCode
        let defaultScriptCode = '000100'
        let scriptCode
        let sender = server.mode.addresses.rootAccount
        let message = '0x1234567890abcde0'

        testCaseCode = 'FCJT_sign_000010'
        scriptCode = defaultScriptCode + '_单个有效的参数'
        {
            let txParam = {from: sender.address, secret: sender.secret, message: message}
            let txParams = [txParam]
            let expectedSignedTx = '0x30450221009C5F37C5E5DE954C90D3A7FD74CB598A8E212E3A44214DC9844F2A619B156734022018363E760D2561DC15AFB746CFA07B62DF6EBC2F96C8F5F3CA0DB66CE157CF67'
            let expectedSignedTxs = [expectedSignedTx]
            let testScript = tcsSign.createTestScript(server, testCaseCode, scriptCode, txParams, expectedSignedTxs)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sign_000010'
        scriptCode = '000200' + '_多个有效的参数'
        {
            let txParam = {from: sender.address, secret: sender.secret, message: message}
            let txParams = [txParam, txParam, txParam]
            let expectedSignedTx = '0x30450221009C5F37C5E5DE954C90D3A7FD74CB598A8E212E3A44214DC9844F2A619B156734022018363E760D2561DC15AFB746CFA07B62DF6EBC2F96C8F5F3CA0DB66CE157CF67'
            let expectedSignedTxs = [expectedSignedTx, expectedSignedTx, expectedSignedTx]
            let testScript = tcsSign.createTestScript(server, testCaseCode, scriptCode, txParams, expectedSignedTxs)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sign_000020'
        scriptCode = defaultScriptCode + '_单个无效的参数,没有秘钥'
        {
            let txParam = {from: server.mode.addresses.sender1.address, message: message}
            let txParams = [txParam]
            let expectedSignedTxs = []
            let testScript = tcsSign.createTestScript(server, testCaseCode, scriptCode, txParams, expectedSignedTxs)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(140, 'null from key'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sign_000020'
        scriptCode = '000200' + '_单个无效的参数,错误的秘钥1'
        {
            let txParam = {from: sender.address, secret: '错误的秘钥', message: message}
            let txParams = [txParam]
            let expectedSignedTxs = []
            let testScript = tcsSign.createTestScript(server, testCaseCode, scriptCode, txParams, expectedSignedTxs)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-191, 'Unknown secret format'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sign_000020'
        scriptCode = '000300' + '_单个无效的参数,错误的秘钥2'
        {
            let txParam = {from: sender.address, secret: sender.secret + '1', message: message}
            let txParams = [txParam]
            let expectedSignedTxs = []
            let testScript = tcsSign.createTestScript(server, testCaseCode, scriptCode, txParams, expectedSignedTxs)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-191, 'Bad Base58 checksum'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sign_000020'
        scriptCode = '000400' + '_单个无效的参数,错误的发起钱包地址（乱码字符串）'
        {
            let txParam = {from: sender.address + '1', secret: sender.secret, message: message}
            let txParams = [txParam]
            let expectedSignedTxs = []
            let testScript = tcsSign.createTestScript(server, testCaseCode, scriptCode, txParams, expectedSignedTxs)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-96, 'Bad account address'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sign_000020'
        scriptCode = '000500' + '_多个无效的参数'
        {
            let txParam = {from: sender.address + '1', secret: sender.secret, message: message}
            let txParams = [
                {from: server.mode.addresses.sender1.address, message: message},
                {from: sender.address, secret: '错误的秘钥', message: message},
                {from: sender.address, secret: sender.secret + '1', message: message},
                {from: sender.address + '1', secret: sender.secret, message: message},
            ]
            let expectedSignedTxs = []
            let testScript = tcsSign.createTestScript(server, testCaseCode, scriptCode, txParams, expectedSignedTxs)

            let expectedResult = framework.createExpecteResult(false,
                framework.getError(140, 'null from key'))
            framework.changeExpectedResult(testScript, expectedResult)

            expectedResult = framework.createExpecteResult(false,
                framework.getError(-191, 'Unknown secret format'))
            framework.changeExpectedResult(testScript, expectedResult)

            expectedResult = framework.createExpecteResult(false,
                framework.getError(-191, 'Bad Base58 checksum'))
            framework.changeExpectedResult(testScript, expectedResult)

            expectedResult = framework.createExpecteResult(false,
                framework.getError(-96, 'Bad account address'))
            framework.changeExpectedResult(testScript, expectedResult)

            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sign_000020'
        scriptCode = '000600' + '_多个有效无效的参数混合'
        {
            let txParam = {from: sender.address + '1', secret: sender.secret, message: message}
            let txParams = [
                {from: sender.address, secret: sender.secret, message: message},
                {from: server.mode.addresses.sender1.address, message: message},
                {from: sender.address, secret: '错误的秘钥', message: message},
                {from: sender.address, secret: sender.secret + '1', message: message},
                {from: sender.address + '1', secret: sender.secret, message: message},
            ]
            let expectedSignedTx = '0x30450221009C5F37C5E5DE954C90D3A7FD74CB598A8E212E3A44214DC9844F2A619B156734022018363E760D2561DC15AFB746CFA07B62DF6EBC2F96C8F5F3CA0DB66CE157CF67'
            let expectedSignedTxs = [expectedSignedTx]

            let testScript = tcsSign.createTestScript(server, testCaseCode, scriptCode, txParams, expectedSignedTxs)

            let expectedResult = framework.createExpecteResult(false,
                framework.getError(140, 'null from key'))
            framework.changeExpectedResult(testScript, expectedResult)

            expectedResult = framework.createExpecteResult(false,
                framework.getError(-191, 'Unknown secret format'))
            framework.changeExpectedResult(testScript, expectedResult)

            expectedResult = framework.createExpecteResult(false,
                framework.getError(-191, 'Bad Base58 checksum'))
            framework.changeExpectedResult(testScript, expectedResult)

            expectedResult = framework.createExpecteResult(false,
                framework.getError(-96, 'Bad account address'))
            framework.changeExpectedResult(testScript, expectedResult)

            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sign_000030'
        scriptCode = defaultScriptCode + '_过长的签名消息'
        {
            let message = '0x' + utility.createMemosWithSpecialLength(32768)[0]  //32k hex
            let txParam = {from: sender.address, secret: sender.secret, message: message}
            let txParams = [txParam]
            let expectedSignedTx = '0x3045022100AA1BFE79EAFCBB86F3C978A797B53749F8F5EC904EE3DAAB937998B90E3747F002201B3DF017B51509134765CC50A4E54D773466C2A4A4DB463DCD1E6E352E4536AD'
            let expectedSignedTxs = [expectedSignedTx]
            let testScript = tcsSign.createTestScript(server, testCaseCode, scriptCode, txParams, expectedSignedTxs)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle, testScripts)
    },

    createTestScript: function(server, testCaseCode, scriptCode, txParams, expectedSignedTxs,){

        let functionName = consts.rpcFunctions.sign

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
            framework.executeTestActionForGet, tcsSign.checkSign, [{needPass:true}])
        action.expectedSignedTxs = expectedSignedTxs
        testScript.actions.push(action)
        return testScript

    },

    checkSign: function(action){
        let response = action.actualResult
        let needPass = action.expectedResults[0].needPass
        framework.checkGetResponse(response)
        if(needPass){
            let signedTxs = action.expectedSignedTxs
            let results = response.result
            expect(results.length).to.be.equals(signedTxs.length)
            for(let i = 0; i < results.length; i++){
                expect(results[i].result).to.be.equals(signedTxs[i])
            }
        }
        else{
            framework.checkResponseError(action, action.expectedResults[0], response)
        }
    },
    //endregion

}
