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
const { allModes, } = require("../config/config")
//endregion
//endregion

const _FEE = 0.00001

module.exports = tcsInteractiveTest = {

    //region interactive test

    //pure pressure test means just send tx or send rawtx, whithout checking balance, getting tx, etc checks.
    testForPerformanceTest: function(server, describeTitle){
        let caseRestrictedLevel = restrictedLevel.L2
        let addresses = server.mode.addresses
        let account1= addresses.sender3
        let account2= addresses.receiver3

        let currency = {symbol:'swt', issuer:''}
        let txFunction = consts.rpcFunctions.sendTx
        let title
        let testCase
        let testCases = []
        let subCaseFunctionParams

        describe(describeTitle, async function () {

            title = '0010\t同时发起多个底层币发送交易_余额足够（通过jt_sendTransaction测试）'
            {
                currency = {symbol:'swt', issuer:''}
                txFunction = consts.rpcFunctions.sendTx
                subCaseFunctionParams = tcsInteractiveTest.createSubCasesParams(server, account1, account2, currency,
                    txFunction, tcsInteractiveTest.createSubCasesForEnough)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            title = '0020\t同时发起多个底层币发送交易_余额足够（通过jt_signTransaction测试）'
            {
                currency = {symbol:'swt', issuer:''}
                txFunction = consts.rpcFunctions.signTx
                subCaseFunctionParams = tcsInteractiveTest.createSubCasesParams(server, account1, account2, currency,
                    txFunction, tcsInteractiveTest.createSubCasesForEnough)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            title = '0030\t同时发起多个底层币发送交易_余额不够（通过jt_sendTransaction测试）'
            {
                currency = {symbol:'swt', issuer:''}
                txFunction = consts.rpcFunctions.sendTx
                subCaseFunctionParams = tcsInteractiveTest.createSubCasesParams(server, account1, account2, currency,
                    txFunction, tcsInteractiveTest.createSubCasesForTotalNotEnough)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            title = '0040\t同时发起多个底层币发送交易_余额不够（通过jt_signTransaction测试）'
            {
                currency = {symbol:'swt', issuer:''}
                txFunction = consts.rpcFunctions.signTx
                subCaseFunctionParams = tcsInteractiveTest.createSubCasesParams(server, account1, account2, currency,
                    txFunction, tcsInteractiveTest.createSubCasesForTotalNotEnough)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            title = '0050\t同时发起多个代币发送交易_余额足够（通过jt_sendTransaction测试）'
            {
                currency = {symbol:'CNYT', issuer:'jjjjjjjjjjjjjjjjjjjjjhoLvTp'}
                txFunction = consts.rpcFunctions.sendTx
                subCaseFunctionParams = tcsInteractiveTest.createSubCasesParams(server, account1, account2, currency,
                    txFunction, tcsInteractiveTest.createSubCasesForEnough)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            title = '0060\t同时发起多个代币发送交易_余额足够（通过jt_signTransaction测试）'
            {
                currency = {symbol:'CNYT', issuer:'jjjjjjjjjjjjjjjjjjjjjhoLvTp'}
                txFunction = consts.rpcFunctions.signTx
                subCaseFunctionParams = tcsInteractiveTest.createSubCasesParams(server, account1, account2, currency,
                    txFunction, tcsInteractiveTest.createSubCasesForEnough)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            title = '0070\t同时发起多个代币发送交易_余额不够（通过jt_sendTransaction测试）'
            {
                currency = {symbol:'CNYT', issuer:'jjjjjjjjjjjjjjjjjjjjjhoLvTp'}
                txFunction = consts.rpcFunctions.sendTx
                subCaseFunctionParams = tcsInteractiveTest.createSubCasesParams(server, account1, account2, currency,
                    txFunction, tcsInteractiveTest.createSubCasesForTotalNotEnough)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            title = '0080\t同时发起多个代币发送交易_余额不够（通过jt_signTransaction测试）'
            {
                currency = {symbol:'CNYT', issuer:'jjjjjjjjjjjjjjjjjjjjjhoLvTp'}
                txFunction = consts.rpcFunctions.signTx
                subCaseFunctionParams = tcsInteractiveTest.createSubCasesParams(server, account1, account2, currency,
                    txFunction, tcsInteractiveTest.createSubCasesForTotalNotEnough)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            framework.testTestCases(server, '发送底层币/代币的交互性测试', testCases)
        })

        //endregion

    },

    createTestCase: function(server, title, caseRestrictedLevel, subCaseFunctionParams){
        let testCase = framework.createTestCase(title, server,
            null, '', null,
            tcsInteractiveTest.executeTest, framework.checkSubCases, null,
            caseRestrictedLevel, [serviceType.newChain])

        testCase.otherParams = {}
        testCase.otherParams.subCaseFunctionParams = subCaseFunctionParams
        return testCase
    },

    executeTest: async function(testCase){
        let subCaseFunctionParams = testCase.otherParams.subCaseFunctionParams
        let createSubCasesFunction = subCaseFunctionParams.createSubCasesFunction
        let subCases = await createSubCasesFunction(subCaseFunctionParams.server, subCaseFunctionParams.account1,
            subCaseFunctionParams.account2, subCaseFunctionParams.currency, subCaseFunctionParams.txFunction)

        let totalCount = 0
        for (let subCase of subCases){
            totalCount += subCase.count
        }
        testCase.otherParams.subCases = subCases
        testCase.otherParams.totalCount = totalCount
        testCase.otherParams.servers = [testCase.server]

        await framework.executeSubCases(testCase)
    },

    //region create sub cases

    createSubCasesParams: function(server, account1, account2, currency, txFunction, createSubCasesFunction){
        let subCaseFunctionParams = {}
        subCaseFunctionParams.server = server
        subCaseFunctionParams.account1 = account1
        subCaseFunctionParams.account2 = account2
        subCaseFunctionParams.currency = currency
        subCaseFunctionParams.txFunction = txFunction
        subCaseFunctionParams.createSubCasesFunction = createSubCasesFunction
        return subCaseFunctionParams
    },

    createSubCases: async function(server, account1, account2, currency, txFunction, moreActionsFunction){
        let isSwt = currency.symbol == 'swt'
        let symbol
        let balance1
        let balance2

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
            let fee = _FEE
            let txCount = 5
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

            subCases.push(framework.createSubCase(sender.address, sender.secret, receiver.address,
                value, fee, null, txFunction, txCount, txCount))

            if(moreActionsFunction){
                moreActionsFunction(subCases, sender, receiver, currency, balance, restBalance)
            }
        }
        return subCases
    },

    //在生成区块的间隔，某钱包同时发起多个底层币发送交易，每个交易的交易额都小于发起钱包的余额，总交易额也小于发起钱包的余额
    createSubCasesForEnough: async function(server, account1, account2, currency, txFunction){
        return tcsInteractiveTest.createSubCases(server, account1, account2, currency, txFunction)
    },

    //在生成区块的间隔，某钱包同时发起多个底层币发送交易，每个交易的交易额都小于发起钱包的余额，但是总交易额大于发起钱包的余额
    createSubCasesForTotalNotEnough: async function(server, account1, account2, currency, txFunction){
        let moreActionsFunction = function(subCases, sender, receiver, currency, balance, restBalance){
            let isSwt = currency.symbol == 'swt'
            let amount = restBalance + 1
            expect(amount < balance).to.be.ok
            let value
            if(isSwt){
                value = amount
            }else{
                value = {}
                value.amount = amount
                value.symbol = currency.symbol
                value.issuer = currency.issuer
            }
            let fee = _FEE
            subCases.push(framework.createSubCase(sender.address, sender.secret, receiver.address,
                value, fee, null, txFunction, 1, 0))
        }
        return tcsInteractiveTest.createSubCases(server, account1, account2, currency, txFunction, moreActionsFunction)
    },

    //endregion

    //endregion


}