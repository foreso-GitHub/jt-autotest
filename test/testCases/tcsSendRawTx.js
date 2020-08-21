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
const consts = require('../framework/lib/base/consts')
let utility = require('../framework/testUtility')
const { token, } = require("../testData/testData")
//endregion
//endregion


module.exports = tcsSendRawTx = {
    testForSendRawTx: function(server, describeTitle){
        let title
        let testCase
        let testCases = []
        let subCaseFunctionParams
        let caseRestrictedLevel = restrictedLevel.L2
        let needPass = true
        let expectedError = ''

        let addresses = server.mode.addresses
        let account1= addresses.sender3
        let account2= addresses.receiver3
        let account3= addresses.sender2
        let account4= addresses.receiver2
        let currency = {symbol:'swt', issuer:''}
        let txFunction = consts.rpcFunctions.signTx
        let successCount = 1
        let failCount = 0

        title = '0010\t有效的单个交易数据\n'
        {
            successCount = 1
            failCount = 0
            subCaseFunctionParams = tcsSendRawTx.createSubCasesParams(server, account1, account2, currency,
                txFunction, successCount, failCount, tcsSendRawTx.createSubCases)
            testCase = tcsSendRawTx.createTestCase(server, title, tcsSendRawTx.executeForSendRawTxs, tcsSendRawTx.checkForSendRawTxs,
                caseRestrictedLevel, subCaseFunctionParams)
            framework.addTestCase(testCases, testCase)
        }

        //todo add more error raw tx like not_enough_fund, bad_format_tx, etc
        title = '0020\t无效的单个交易数据\n'
        {
            successCount = 0
            failCount = 1
            subCaseFunctionParams = tcsSendRawTx.createSubCasesParams(server, account1, account2, currency,
                txFunction, successCount, failCount, tcsSendRawTx.createSubCases)
            testCase = tcsSendRawTx.createTestCase(server, title, tcsSendRawTx.executeForSendRawTxs, tcsSendRawTx.checkForSendRawTxs,
                caseRestrictedLevel, subCaseFunctionParams)
            framework.addTestCase(testCases, testCase)
        }

        title = '0030\t多个有效的交易数据\n'
        {
            successCount = 10
            failCount = 0
            subCaseFunctionParams = tcsSendRawTx.createSubCasesParams(server, account1, account2, currency,
                txFunction, successCount, failCount, tcsSendRawTx.createSubCases)
            testCase = tcsSendRawTx.createTestCase(server, title, tcsSendRawTx.executeForSendRawTxs, tcsSendRawTx.checkForSendRawTxs,
                caseRestrictedLevel, subCaseFunctionParams)
            framework.addTestCase(testCases, testCase)
        }

        title = '0040\t多个无效的交易数据'
        {
            successCount = 0
            failCount = 10
            subCaseFunctionParams = tcsSendRawTx.createSubCasesParams(server, account1, account2, currency,
                txFunction, successCount, failCount, tcsSendRawTx.createSubCases)
            testCase = tcsSendRawTx.createTestCase(server, title, tcsSendRawTx.executeForSendRawTxs, tcsSendRawTx.checkForSendRawTxs,
                caseRestrictedLevel, subCaseFunctionParams)
            framework.addTestCase(testCases, testCase)
        }

        title = '0050\t多个交易数据，部分有效部分无效\n'
        {
            successCount = 10
            failCount = 10
            subCaseFunctionParams = tcsSendRawTx.createSubCasesParams(server, account1, account2, currency,
                txFunction, successCount, failCount, tcsSendRawTx.createSubCases)
            testCase = tcsSendRawTx.createTestCase(server, title, tcsSendRawTx.executeForSendRawTxs, tcsSendRawTx.checkForSendRawTxs,
                caseRestrictedLevel, subCaseFunctionParams)
            framework.addTestCase(testCases, testCase)
        }

        title = '0060\t大量交易数据测试_01：输入上千、上万个有效的交易数据，测试大量交易数据是否有上限\n'
        {
            successCount = 50
            failCount = 0
            subCaseFunctionParams = tcsSendRawTx.createSubCasesParams(server, account1, account2, currency,
                txFunction, successCount, failCount, tcsSendRawTx.createSubCases)
            testCase = tcsSendRawTx.createTestCase(server, title, tcsSendRawTx.executeForSendRawTxs, tcsSendRawTx.checkForSendRawTxs,
                caseRestrictedLevel, subCaseFunctionParams)
            framework.addTestCase(testCases, testCase)
        }

        title = '0070\t大量交易数据测试_02：输入上万、几十万个无效的交易数据\n'
        {
            successCount = 0
            failCount = 1000
            subCaseFunctionParams = tcsSendRawTx.createSubCasesParams(server, account1, account2, currency,
                txFunction, successCount, failCount, tcsSendRawTx.createSubCases)
            testCase = tcsSendRawTx.createTestCase(server, title, tcsSendRawTx.executeForSendRawTxs, tcsSendRawTx.checkForSendRawTxs,
                caseRestrictedLevel, subCaseFunctionParams)
            framework.addTestCase(testCases, testCase)
        }

        framework.testTestCases(server, describeTitle, testCases)
    },

    //1. single exec
    // params, sequence,  sign result
    //2. sendraw
    //3. send result

    //region common  todo need combine in framework
    createSubCasesParams: function(server, account1, account2, currency, txFunction, successCount, failCount, createSubCasesFunction){
        let subCaseFunctionParams = {}
        subCaseFunctionParams.server = server
        subCaseFunctionParams.account1 = account1
        subCaseFunctionParams.account2 = account2
        subCaseFunctionParams.currency = currency
        subCaseFunctionParams.txFunction = txFunction
        subCaseFunctionParams.successCount = successCount
        subCaseFunctionParams.failCount = failCount
        subCaseFunctionParams.createSubCasesFunction = createSubCasesFunction
        return subCaseFunctionParams
    },

    //to compare balance of account1 and account2, then decide send from account1 to account2, or from account2 to account1.
    //normally, should send from bigger balance to smaller balance
    createSubCases: async function(server, account1, account2, currency, txFunction, txCount, moreActionsFunction){
        let symbol
        let balance1
        let balance2

        let isSwt = currency.symbol == 'swt'
        if(isSwt){
            symbol = null
            balance1 = parseInt(await server.getBalance(server, account1.address, symbol))
            balance2 = parseInt(await server.getBalance(server, account2.address, symbol))
        }else{
            symbol = currency.symbol
            let balanceResult = await server.getBalance(server, account1.address, symbol)
            balance1 = parseInt(balanceResult.value)
            balanceResult = await server.getBalance(server, account2.address, symbol)
            balance2 = parseInt(balanceResult.value)
        }

        let subCases = []
        if(balance1 < 100 && balance2 < 100){
            expect('Accounts balance is not enough!').to.be.not.ok
        }
        else{
            let sender = balance1 >= balance2 ? account1 : account2
            let receiver = balance1 >= balance2 ? account2 : account1
            let balance = balance1 >= balance2 ? balance1 : balance2

            let value
            let amount = 1
            let fee = 0.00001
            let restBalance
            if(isSwt){
                value = amount
                restBalance = balance - (amount + fee) * txCount
            }else{
                value = {}
                value.amount = amount
                value.symbol = currency.symbol
                value.issuer = currency.issuer
                restBalance = balance - amount * txCount
            }

            //todo need split every sub case out!!!  one sub case, one position, with special sequence.
            subCases.push(framework.createSubCase(sender.address, sender.secret, receiver.address,
                value, fee, null, txFunction, txCount, txCount))

            if(moreActionsFunction){
                moreActionsFunction(subCases, sender, receiver, currency, balance, restBalance, txFunction)
            }
        }
        return subCases
    },

    createTestCase: function(server, title, executeFunction, checkFunction, caseRestrictedLevel, subCaseFunctionParams){
        let testCase = framework.createTestCase(title, server, null, '', null,
            executeFunction, checkFunction, null, caseRestrictedLevel, [serviceType.newChain])

        testCase.otherParams = {}
        testCase.otherParams.subCaseFunctionParamsList = []
        testCase.otherParams.subCaseFunctionParamsList.push(subCaseFunctionParams)
        return testCase
    },
    //endregion

    executeForSendRawTxs: async function(testCase){
        let failSignedTx = '1200002280000000240000099761400000000000000168400000000000000a732102064d6800ea3fb2de01804f4d7257088eeec355c516548ec8c029ea9c6fc98b927446304402201b28ce06c536141010a0b3819cff70f0687bc8d8087506eef4405cb7b86ee2510220319930cc252a1cc42550ea854b1bec81f0a22ac45dfd22b4c85f8e4387ca84488114e7dbc7c57517887e4c17c81e083d2ca0df6945a083144ea5258eb18f44b05e135a3833df5fc8efc466ecf9ea7d084141414141414141e1f1'
        let subCaseFunctionParamsList = testCase.otherParams.subCaseFunctionParamsList
        let totalCount = 0
        testCase.otherParams.servers = [testCase.server]
        testCase.otherParams.subCases = []
        for(let i = 0; i < subCaseFunctionParamsList.length; i++){
            let subCaseFunctionParams = subCaseFunctionParamsList[i]
            let createSubCasesFunction = subCaseFunctionParams.createSubCasesFunction
            let subCases = await createSubCasesFunction(subCaseFunctionParams.server, subCaseFunctionParams.account1,
                subCaseFunctionParams.account2, subCaseFunctionParams.currency, subCaseFunctionParams.txFunction, subCaseFunctionParams.successCount)
            for (let subCase of subCases){
                totalCount += subCase.count
            }
            testCase.otherParams.subCases = testCase.otherParams.subCases.concat(subCases)
        }
        testCase.otherParams.totalCount = totalCount

        testCase.otherParams.executeBothSignAndSend = false
        await framework.executeSubCases(testCase)

        let signedTxs = []
        for(let i = 0; i < testCase.otherParams.subCases.length; i++){
            let subCase = testCase.otherParams.subCases[i]
            for(let j = 0; j < (subCase.results ? subCase.results.length : 0); j++){
                signedTxs.push(testCase.otherParams.subCases[i].results[j].result[0])
            }
        }
        for (let i = 0; i < testCase.otherParams.subCaseFunctionParamsList[0].failCount; i++){
            signedTxs.push(failSignedTx)
            failSignedTx = failSignedTx + '1'
        }
        testCase.otherParams.signedTxs = signedTxs

        let result = await testCase.server.getResponse(testCase.server, consts.rpcFunctions.sendRawTx, signedTxs)
        testCase.otherParams.sendRawTxResult = result
    },

    checkForSendRawTxs: async function(testCase){
        let successCount = testCase.otherParams.subCaseFunctionParamsList[0].successCount
        let failCount = testCase.otherParams.subCaseFunctionParamsList[0].failCount
        let response = testCase.otherParams.sendRawTxResult

        if(failCount > 0){
            expect(response.status).to.be.equal(-278)
            expect(response.message).to.contains('Sequence is not in the past')

            // expect(response.status).to.be.equal(-189)
            // expect(response.message).to.contains('runtime error: invalid memory address or nil pointer dereference')
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
                expect(response.status).to.be.equal(undefined)
                let tx = response.result
                expect(tx.Account).to.be.equal(from)
                expect(tx.Destination).to.be.equal(to)
                // expect(value).to.be.equal(tx.Amount)
            }
        }
    },


}