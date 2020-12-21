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
const { token, } = require("../testData/testData")
//endregion
//endregion

//this is root account send to 'jBykxUHVDccTYtquCSCsFVgem1zt3FFe71' in sequence = 1
let _FailRawTx_UsedSequence = {tx: '1200002280000000240000000161400000000000000168400000000000000a73210330e7fc9d56bb25d6893ba3f317ae5bcf33b3291bd63db32654a313222f7fd02074473045022100cee4e73d4cf94ae60603bef1a5cdd3c9338c5a594d01435c211bde4da48001f0022067d2a508f40a74e1fbafec6af8e1a5a4bf3f0eacf02a145bfbc0daf40b85eb478114b5f762798a53d543a014caf8b297cff8f2f937e88314786d3d9ca227fda827d80519ecbb959323cb54df',
    code: -278, message: 'temBAD_SEQUENCE Malformed: Sequence is not in the past.'}
let _FailRawTx_InactiveAccount = {tx: '1200002280000000240000000161400000000000000168400000000000000a732102e082405d139f369b49c17c248981f09aad269bc9ca6e9a163870e24fd80cd42174473045022100cba484fb47b3f87f3c0bd78839c61c7ea89df0626be455b4f55e44a09525b6b4022050254bd30ec8d0384b3305760ad8cb518128ad91e360d4b5d1872b5d8a27ed518114ce5c4f04da35752b9323442fc8c731a3672ff3e483144ea5258eb18f44b05e135a3833df5fc8efc466ecf9ea7d084141414141414141e1f1',
    code: -278, message: 'terNO_ACCOUNT The source account does not exist.'}
let _FailRawTx_LessFund = {tx: '120000228000000024000f24cb61400009184e729fff68400000000000000a732102064d6800ea3fb2de01804f4d7257088eeec355c516548ec8c029ea9c6fc98b927446304402201617e755869b46252cdcaf0d1647b05029b55a67abe80ef877b796b765527da102205acf91905badfe2163a8ce7b64a360b69327399b04d1f21aafe863f684bd22fd8114e7dbc7c57517887e4c17c81e083d2ca0df6945a083144ea5258eb18f44b05e135a3833df5fc8efc466ecf9ea7d084141414141414141e1f1',
    code: -278, message: 'telINSUF_FEE_P Fee insufficient.'}
let _FailRawTx_EmptyRawTx = {tx: '',
    code: -278, message: 'empty raw transaction'}
let _FailRawTx_WrongFormat_1 = {tx: '120000228000000024000f24cb61400009184e729fff68400000000000000a732102064d6800ea3fb2de01804f4d7257088eeec355c516548ec8c029ea9c6fc98b927446304402201617e755869b46252cdcaf0d1647b05029b55a67abe80ef877b796b765527da102205acf91905badfe2163a8ce7b64a360b69327399b04d1f21aafe863f684bd22fd8114e7dbc7c57517887e4c17c81e083d2ca0df6945a083144ea5258eb18f44b05e135a3833df5fc8efc466ecf9ea7d084141414141414141e1f1a',
    code: -278, message: 'runtime error: invalid memory address or nil pointer dereference'}
let _FailRawTx_WrongFormat_2 = {tx: '120000228000000024000f24cb61400009184e729fff68400000000000000a732102064d6800ea3fb2de01804f4d7257088eeec355c516548ec8c029ea9c6fc98b927446304402201617e755869b46252cdcaf0d1647b05029b55a67abe80ef877b796b765527da102205acf91905badfe2163a8ce7b64a360b69327399b04d1f21aafe863f684bd22fd8114e7dbc7c57517887e4c17c81e083d2ca0df6945a083144ea5258eb18f44b05e135a3833df5fc8efc466ecf9ea7d084141414141414141e1fa',
    code: 0, message: ''}
let _FailRawTx_WrongFormat_3 = {tx: 123123,
    code: -189, message: 'interface conversion: interface {} is float64, not string'}
let _FailRawTx_WrongFormat_4 = {tx: null,
    code: -189, message: 'interface conversion: interface {} is nil, not string'}
// let _FailRawTxs = []
// _FailRawTxs.push()

module.exports = tcsSendRawTx = {

    //region normal send raw tx
    testForSendRawTx: function(server, describeTitle){
        let title
        let testCase
        let testCases = []
        let subCaseFunctionParams
        let caseRestrictedLevel = restrictedLevel.L2
        // let needPass = true
        // let expectedError = ''

        let addresses = server.mode.addresses
        let account1= addresses.sender3
        let account2= addresses.receiver3
        let account3= addresses.sender2
        let account4= addresses.receiver2
        let currency = {symbol: consts.defaultNativeCoin, issuer:''}
        let txFunction = consts.rpcFunctions.signTx
        let successCount = 1
        let failRawTxs = []

        title = '0010\t有效的单个交易数据\n'
        {
            successCount = 1
            failRawTxs = []
            subCaseFunctionParams = tcsSendRawTx.createSubCasesParams(server, account1, account2, currency,
                txFunction, successCount, failRawTxs, framework.createSubCases)
            testCase = framework.createTestCaseForSubCases(server, title, tcsSendRawTx.executeForSendRawTxs, tcsSendRawTx.checkForSendRawTxs,
                caseRestrictedLevel, subCaseFunctionParams)
            framework.addTestCase(testCases, testCase)
        }

        //region different error raw tx like not_enough_fund, bad_format_tx, etc

        title = '0020\t无效的单个交易数据：使用过的sequence'
        {
            successCount = 0
            failRawTxs = tcsSendRawTx.createFailRawTxs(_FailRawTx_UsedSequence, 1)
            subCaseFunctionParams = tcsSendRawTx.createSubCasesParams(server, account1, account2, currency,
                txFunction, successCount, failRawTxs, framework.createSubCases)
            testCase = framework.createTestCaseForSubCases(server, title, tcsSendRawTx.executeForSendRawTxs, tcsSendRawTx.checkForSendRawTxs,
                caseRestrictedLevel, subCaseFunctionParams)
            framework.addTestCase(testCases, testCase)
        }

        title = '0021\t无效的单个交易数据：未激活的发送帐号'
        {
            successCount = 0
            failRawTxs = tcsSendRawTx.createFailRawTxs(_FailRawTx_InactiveAccount, 1)
            subCaseFunctionParams = tcsSendRawTx.createSubCasesParams(server, account1, account2, currency,
                txFunction, successCount, failRawTxs, framework.createSubCases)
            testCase = framework.createTestCaseForSubCases(server, title, tcsSendRawTx.executeForSendRawTxs, tcsSendRawTx.checkForSendRawTxs,
                caseRestrictedLevel, subCaseFunctionParams)
            framework.addTestCase(testCases, testCase)
        }

        title = '0022\t无效的单个交易数据：余额不足'
        {
            successCount = 0
            failRawTxs = tcsSendRawTx.createFailRawTxs(_FailRawTx_LessFund, 1)
            subCaseFunctionParams = tcsSendRawTx.createSubCasesParams(server, account1, account2, currency,
                txFunction, successCount, failRawTxs, framework.createSubCases)
            testCase = framework.createTestCaseForSubCases(server, title, tcsSendRawTx.executeForSendRawTxs, tcsSendRawTx.checkForSendRawTxs,
                caseRestrictedLevel, subCaseFunctionParams)
            framework.addTestCase(testCases, testCase)
        }

        title = '0023\t无效的单个交易数据：空交易'
        {
            successCount = 0
            failRawTxs = tcsSendRawTx.createFailRawTxs(_FailRawTx_EmptyRawTx, 1)
            subCaseFunctionParams = tcsSendRawTx.createSubCasesParams(server, account1, account2, currency,
                txFunction, successCount, failRawTxs, framework.createSubCases)
            testCase = framework.createTestCaseForSubCases(server, title, tcsSendRawTx.executeForSendRawTxs, tcsSendRawTx.checkForSendRawTxs,
                caseRestrictedLevel, subCaseFunctionParams)
            framework.addTestCase(testCases, testCase)
        }

        title = '0024\t无效的单个交易数据：参数为空数组'
        {
            successCount = 0
            failRawTxs = []
            subCaseFunctionParams = tcsSendRawTx.createSubCasesParams(server, account1, account2, currency,
                txFunction, successCount, failRawTxs, framework.createSubCases)
            testCase = framework.createTestCaseForSubCases(server, title, tcsSendRawTx.executeForSendRawTxs, tcsSendRawTx.checkForSendRawTxs,
                caseRestrictedLevel, subCaseFunctionParams)
            framework.addTestCase(testCases, testCase)
        }

        title = '0025\t无效的单个交易数据：错误的rawTx格式1'
        {
            successCount = 0
            failRawTxs = tcsSendRawTx.createFailRawTxs(_FailRawTx_WrongFormat_1, 1)
            subCaseFunctionParams = tcsSendRawTx.createSubCasesParams(server, account1, account2, currency,
                txFunction, successCount, failRawTxs, framework.createSubCases)
            testCase = framework.createTestCaseForSubCases(server, title, tcsSendRawTx.executeForSendRawTxs, tcsSendRawTx.checkForSendRawTxs,
                caseRestrictedLevel, subCaseFunctionParams)
            framework.addTestCase(testCases, testCase)
        }

        // title = '0026\t无效的单个交易数据：错误的rawTx格式2'  //todo need add
        // {
        //     successCount = 0
        //     failRawTxs = tcsSendRawTx.createFailRawTxs(_FailRawTx_WrongFormat_2, 1)
        //     subCaseFunctionParams = tcsSendRawTx.createSubCasesParams(server, account1, account2, currency,
        //         txFunction, successCount, failRawTxs, framework.createSubCases)
        //     testCase = framework.createTestCaseForSubCases(server, title, tcsSendRawTx.executeForSendRawTxs, tcsSendRawTx.checkForSendRawTxs,
        //         caseRestrictedLevel, subCaseFunctionParams)
        //     framework.addTestCase(testCases, testCase)
        // }

        title = '0027\t无效的单个交易数据：错误的rawTx格式3'
        {
            successCount = 0
            failRawTxs = tcsSendRawTx.createFailRawTxs(_FailRawTx_WrongFormat_3, 1)
            subCaseFunctionParams = tcsSendRawTx.createSubCasesParams(server, account1, account2, currency,
                txFunction, successCount, failRawTxs, framework.createSubCases)
            testCase = framework.createTestCaseForSubCases(server, title, tcsSendRawTx.executeForSendRawTxs, tcsSendRawTx.checkForSendRawTxs,
                caseRestrictedLevel, subCaseFunctionParams)
            framework.addTestCase(testCases, testCase)
        }

        title = '0028\t无效的单个交易数据：错误的rawTx格式4'
        {
            successCount = 0
            failRawTxs = tcsSendRawTx.createFailRawTxs(_FailRawTx_WrongFormat_4, 1)
            subCaseFunctionParams = tcsSendRawTx.createSubCasesParams(server, account1, account2, currency,
                txFunction, successCount, failRawTxs, framework.createSubCases)
            testCase = framework.createTestCaseForSubCases(server, title, tcsSendRawTx.executeForSendRawTxs, tcsSendRawTx.checkForSendRawTxs,
                caseRestrictedLevel, subCaseFunctionParams)
            framework.addTestCase(testCases, testCase)
        }

        //endregion

        title = '0030\t多个有效的交易数据\n'
        {
            successCount = 10
            failRawTxs = []
            subCaseFunctionParams = tcsSendRawTx.createSubCasesParams(server, account1, account2, currency,
                txFunction, successCount, failRawTxs, framework.createSubCases)
            testCase = framework.createTestCaseForSubCases(server, title, tcsSendRawTx.executeForSendRawTxs, tcsSendRawTx.checkForSendRawTxs,
                caseRestrictedLevel, subCaseFunctionParams)
            framework.addTestCase(testCases, testCase)
        }

        title = '0040\t多个无效的交易数据'
        {
            successCount = 0
            failRawTxs = tcsSendRawTx.createFailRawTxs(_FailRawTx_UsedSequence, 10)
            subCaseFunctionParams = tcsSendRawTx.createSubCasesParams(server, account1, account2, currency,
                txFunction, successCount, failRawTxs, framework.createSubCases)
            testCase = framework.createTestCaseForSubCases(server, title, tcsSendRawTx.executeForSendRawTxs, tcsSendRawTx.checkForSendRawTxs,
                caseRestrictedLevel, subCaseFunctionParams)
            framework.addTestCase(testCases, testCase)
        }

        title = '0050\t多个交易数据，部分有效部分无效\n'
        {
            successCount = 10
            failRawTxs = tcsSendRawTx.createFailRawTxs(_FailRawTx_UsedSequence, 10)
            subCaseFunctionParams = tcsSendRawTx.createSubCasesParams(server, account1, account2, currency,
                txFunction, successCount, failRawTxs, framework.createSubCases)
            testCase = framework.createTestCaseForSubCases(server, title, tcsSendRawTx.executeForSendRawTxs, tcsSendRawTx.checkForSendRawTxs,
                caseRestrictedLevel, subCaseFunctionParams)
            framework.addTestCase(testCases, testCase)
        }

        title = '0060\t大量交易数据测试_01：输入上千、上万个有效的交易数据，测试大量交易数据是否有上限\n'
        {
            successCount = 20
            failRawTxs = []
            subCaseFunctionParams = tcsSendRawTx.createSubCasesParams(server, account1, account2, currency,
                txFunction, successCount, failRawTxs, framework.createSubCases)
            testCase = framework.createTestCaseForSubCases(server, title, tcsSendRawTx.executeForSendRawTxs, tcsSendRawTx.checkForSendRawTxs,
                caseRestrictedLevel, subCaseFunctionParams)
            framework.addTestCase(testCases, testCase)
        }

        title = '0070\t大量交易数据测试_02：输入上万、几十万个无效的交易数据\n'
        {
            successCount = 0
            failRawTxs = tcsSendRawTx.createFailRawTxs(_FailRawTx_UsedSequence, 1000)
            subCaseFunctionParams = tcsSendRawTx.createSubCasesParams(server, account1, account2, currency,
                txFunction, successCount, failRawTxs, framework.createSubCases)
            testCase = framework.createTestCaseForSubCases(server, title, tcsSendRawTx.executeForSendRawTxs, tcsSendRawTx.checkForSendRawTxs,
                caseRestrictedLevel, subCaseFunctionParams)
            framework.addTestCase(testCases, testCase)
        }

        framework.testTestCases(server, describeTitle, testCases)
    },

    createFailRawTxs: function(failRawTx, count){
        let failRawTxs = []
        let newTx = tcsSendRawTx.cloneRawTx(failRawTx)
        for(let i = 0; i < count; i++){
            failRawTxs.push(newTx)
            newTx = tcsSendRawTx.cloneRawTx(newTx)
            newTx.tx += '1'
        }
        return failRawTxs
    },

    cloneRawTx: function(rawTx){
        let newRawTx = {}
        newRawTx.tx = rawTx.tx
        newRawTx.code = rawTx.code
        newRawTx.message = rawTx.message
        return newRawTx
    },

    createSubCasesParams: function(server, account1, account2, currency, txFunction, successCount, failRawTxs, createSubCasesFunction){
        let subCaseFunctionParams = framework.createSubCasesParams(server, account1, account2, currency, txFunction, createSubCasesFunction)
        subCaseFunctionParams.successCount = successCount
        subCaseFunctionParams.failRawTxs = failRawTxs
        return subCaseFunctionParams
    },

    executeForSendRawTxs: async function(testCase){
        let subCaseFunctionParamsList = testCase.otherParams.subCaseFunctionParamsList
        let totalCount = 0
        testCase.otherParams.servers = [testCase.server]
        testCase.otherParams.subCases = []
        for(let i = 0; i < subCaseFunctionParamsList.length; i++){
            let subCaseFunctionParams = subCaseFunctionParamsList[i]
            let createSubCasesFunction = subCaseFunctionParams.createSubCasesFunction
            let subCases = await createSubCasesFunction(subCaseFunctionParams.server, subCaseFunctionParams.account1,
                subCaseFunctionParams.account2, subCaseFunctionParams.currency,
                subCaseFunctionParams.txFunction, subCaseFunctionParams.successCount)
            for (let subCase of subCases){
                totalCount += subCase.count
            }
            testCase.otherParams.subCases = testCase.otherParams.subCases.concat(subCases)
        }
        testCase.otherParams.totalCount = totalCount

        testCase.otherParams.executeBothSignAndSend = false
        await framework.executeSubCases(testCase)

        let signedTxs = []
        //create success raw tx
        for(let i = 0; i < testCase.otherParams.subCases.length; i++){
            let subCase = testCase.otherParams.subCases[i]
            for(let j = 0; j < (subCase.results ? subCase.results.length : 0); j++){
                signedTxs.push(testCase.otherParams.subCases[i].results[j].result[0])
            }
        }

        //create fail raw tx
        let failRawTxs = testCase.otherParams.subCaseFunctionParamsList[0].failRawTxs
        if(failRawTxs && failRawTxs.length > 0){
            for(let i = 0; i < failRawTxs.length; i++){
                signedTxs.push(failRawTxs[i].tx)
            }
        }
        testCase.otherParams.signedTxs = signedTxs

        let result = await testCase.server.getResponse(testCase.server, consts.rpcFunctions.sendRawTx, signedTxs)
        testCase.otherParams.sendRawTxResult = result
    },

    checkForSendRawTxs: async function(testCase){
        let successCount = testCase.otherParams.subCaseFunctionParamsList[0].successCount
        let failRawTxs = testCase.otherParams.subCaseFunctionParamsList[0].failRawTxs
        let failCount = failRawTxs.length
        let response = testCase.otherParams.sendRawTxResult

        if(framework.NEED_CHECK_ExpectedResult && failCount > 0){
            let expectedStatus = failRawTxs[0].code
            let expectedMessage = failRawTxs[0].message
            expect(response.status).to.be.equal(expectedStatus)
            framework.checkResponseError(testCase, response.message, expectedMessage)
        }

        if(successCount > 0){
            let results = response.result
            expect(results.length).to.be.equal(successCount)
            let from = testCase.otherParams.subCases[0].from
            let to = testCase.otherParams.subCases[0].to
            let value = testCase.otherParams.subCases[0].value
            for(let i = 0; i < successCount; i++){
                let hash = results[i]
                let response = await utility.getTxByHash(testCase.server, hash, 0)
                // expect(response.status).to.be.equal(140)
                let tx = response.result
                expect(tx.Account).to.be.equal(from)
                expect(tx.Destination).to.be.equal(to)
                // expect(value).to.be.equal(tx.Amount)
            }
        }
    },
    //endregion

    //region performance test by sign and sendRaw
    testForPerformanceTestBySendRaw: function(server, describeTitle, testCountOfPerRound, testRound){
        let title
        let testCase
        let testCases = []
        let subCaseFunctionParams
        let caseRestrictedLevel = restrictedLevel.L2
        let allServers = framework.activeAllRpcServers()
        let serverCount = allServers.length

        let addresses = server.mode.addresses
        let account1= addresses.sender3
        let account2= addresses.receiver3
        let currency = {symbol:consts.defaultNativeCoin, issuer:''}
        let txFunction = consts.rpcFunctions.signTx
        let successCount = testCountOfPerRound
        let failRawTxs = []

        title = '1000\t性能测试，sendRaw，多个有效交易数据：' + successCount
        {
            subCaseFunctionParams = tcsSendRawTx.createSubCasesParams(server, account1, account2, currency,
                txFunction, successCount, failRawTxs, framework.createSubCases)
            let executeFunc = tcsSendRawTx.executeForPerformanceBySendRawTxs
            let checkFunc = function(testCase){}
            // let checkFunc = tcsSendRawTx.checkForSendRawTxs
            for(let i = 0; i < testRound; i++){
                let index = i % serverCount
                let runServer = allServers[index]
                testCase = framework.createTestCaseForSubCases(runServer, title, executeFunc, checkFunc,
                    caseRestrictedLevel, subCaseFunctionParams)
                testCases = []
                framework.addTestCase(testCases, testCase)
                framework.testTestCases(runServer, describeTitle + "_" + (i + 1), testCases)
            }
        }

        // framework.testTestCases(server, describeTitle, testCases)
    },

    executeForPerformanceBySendRawTxs: async function(testCase){
        await tcsSendRawTx.executeForSendRawTxs(testCase)
        await utility.timeout(6000)
        //reset sequence of from account
        for(let i = 0; i < testCase.otherParams.subCases.length; i++){
            let from = testCase.otherParams.subCases[i].from
            let sequence = await framework.getSequenceByChain(testCase.server, from)
            framework.setSequence(testCase.server.getName(), from, sequence)
            logger.info("===Current chain sequence: " + sequence)
        }
    },

    //endregion

}