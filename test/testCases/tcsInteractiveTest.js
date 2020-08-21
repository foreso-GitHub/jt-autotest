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
const { responseStatus,  serviceType,  interfaceType,  testMode,  restrictedLevel, } = require("../framework/enums")
const consts = require('../framework/lib/base/consts')
//endregion
//endregion

const _FEE = 0.00001
const _TxCount = 5

module.exports = tcsInteractiveTest = {

    //region interactive test

    //pure pressure test means just send tx or send rawtx, whithout checking balance, getting tx, etc checks.
    testForInteractiveTest: function(server, describeTitle){
        let caseRestrictedLevel = restrictedLevel.L2
        let addresses = server.mode.addresses
        let account1= addresses.sender3
        let account2= addresses.receiver3
        let account3= addresses.sender2
        let account4= addresses.receiver2

        let currency = {symbol:'swt', issuer:''}
        let txFunction = consts.rpcFunctions.sendTx
        let title
        let testCase
        let testCases = []
        let subCaseFunctionParams

        describe(describeTitle, async function () {

            //region swtc
            testCases = []

            title = '0010\t同时发起多个底层币发送交易_余额足够（通过jt_sendTransaction测试）'
            {
                currency = {symbol:'swt', issuer:''}
                txFunction = consts.rpcFunctions.sendTx
                subCaseFunctionParams = framework.createSubCasesParams(server, account1, account2, currency,
                    txFunction, tcsInteractiveTest.createSubCasesForEnough)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            title = '0020\t同时发起多个底层币发送交易_余额足够（通过jt_signTransaction测试）'
            {
                currency = {symbol:'swt', issuer:''}
                txFunction = consts.rpcFunctions.signTx
                subCaseFunctionParams = framework.createSubCasesParams(server, account1, account2, currency,
                    txFunction, tcsInteractiveTest.createSubCasesForEnough)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            title = '0030\t同时发起多个底层币发送交易_余额不够（通过jt_sendTransaction测试）'
            {
                currency = {symbol:'swt', issuer:''}
                txFunction = consts.rpcFunctions.sendTx
                subCaseFunctionParams = framework.createSubCasesParams(server, account1, account2, currency,
                    txFunction, tcsInteractiveTest.createSubCasesForTotalNotEnough)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            title = '0040\t同时发起多个底层币发送交易_余额不够（通过jt_signTransaction测试）'
            {
                currency = {symbol:'swt', issuer:''}
                txFunction = consts.rpcFunctions.signTx
                subCaseFunctionParams = framework.createSubCasesParams(server, account1, account2, currency,
                    txFunction, tcsInteractiveTest.createSubCasesForTotalNotEnough)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            framework.testTestCases(server, '发送底层币/代币的交互性测试：底层币', testCases)

            //endregion

            //region token
            testCases = []

            title = '0050\t同时发起多个代币发送交易_余额足够（通过jt_sendTransaction测试）'
            {
                currency = {symbol:'CNYT', issuer:'jjjjjjjjjjjjjjjjjjjjjhoLvTp'}
                txFunction = consts.rpcFunctions.sendTx
                subCaseFunctionParams = framework.createSubCasesParams(server, account1, account2, currency,
                    txFunction, tcsInteractiveTest.createSubCasesForEnough)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            title = '0060\t同时发起多个代币发送交易_余额足够（通过jt_signTransaction测试）'
            {
                currency = {symbol:'CNYT', issuer:'jjjjjjjjjjjjjjjjjjjjjhoLvTp'}
                txFunction = consts.rpcFunctions.signTx
                subCaseFunctionParams = framework.createSubCasesParams(server, account1, account2, currency,
                    txFunction, tcsInteractiveTest.createSubCasesForEnough)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            title = '0070\t同时发起多个代币发送交易_余额不够（通过jt_sendTransaction测试）'
            {
                currency = {symbol:'CNYT', issuer:'jjjjjjjjjjjjjjjjjjjjjhoLvTp'}
                txFunction = consts.rpcFunctions.sendTx
                subCaseFunctionParams = framework.createSubCasesParams(server, account1, account2, currency,
                    txFunction, tcsInteractiveTest.createSubCasesForTotalNotEnough)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            title = '0080\t同时发起多个代币发送交易_余额不够（通过jt_signTransaction测试）'
            {
                currency = {symbol:'CNYT', issuer:'jjjjjjjjjjjjjjjjjjjjjhoLvTp'}
                txFunction = consts.rpcFunctions.signTx
                subCaseFunctionParams = framework.createSubCasesParams(server, account1, account2, currency,
                    txFunction, tcsInteractiveTest.createSubCasesForTotalNotEnough)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            framework.testTestCases(server, '发送底层币/代币的交互性测试：代币', testCases)

            //endregion

            //region mix
            testCases = []

            title = '0090\t同时发起多个底层币、代币发送交易（通过jt_sendTransaction测试）'
            {
                //swt first
                currency = {symbol:'swt', issuer:''}
                txFunction = consts.rpcFunctions.sendTx
                subCaseFunctionParams = framework.createSubCasesParams(server, account1, account2, currency,
                    txFunction, tcsInteractiveTest.createSubCasesForTotalNotEnough)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)

                //then token
                currency = {symbol:'CNYT', issuer:'jjjjjjjjjjjjjjjjjjjjjhoLvTp'}
                subCaseFunctionParams = framework.createSubCasesParams(server, account1, account2, currency,
                    txFunction, tcsInteractiveTest.createSubCasesForTotalNotEnough)
                testCase.otherParams.subCaseFunctionParamsList.push(subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            title = '0100\t同时发起多个底层币、代币发送交易（通过jt_signTransaction测试）'
            {
                //swt first
                currency = {symbol:'swt', issuer:''}
                txFunction = consts.rpcFunctions.signTx
                subCaseFunctionParams = framework.createSubCasesParams(server, account1, account2, currency,
                    txFunction, tcsInteractiveTest.createSubCasesForTotalNotEnough)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)

                //then token
                currency = {symbol:'CNYT', issuer:'jjjjjjjjjjjjjjjjjjjjjhoLvTp'}
                subCaseFunctionParams = framework.createSubCasesParams(server, account1, account2, currency,
                    txFunction, tcsInteractiveTest.createSubCasesForTotalNotEnough)
                testCase.otherParams.subCaseFunctionParamsList.push(subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            title = '0110\t同时发送、接收底层币测试（通过jt_sendTransaction测试）'
            {
                currency = {symbol:'swt', issuer:''}
                txFunction = consts.rpcFunctions.sendTx
                subCaseFunctionParams = framework.createSubCasesParams(server, account1, account2, currency,
                    txFunction, tcsInteractiveTest.createSubCasesFor0110)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            title = '0120\t同时发送、接收底层币测试（通过jt_signTransaction测试）'
            {
                currency = {symbol:'swt', issuer:''}
                txFunction = consts.rpcFunctions.signTx
                subCaseFunctionParams = framework.createSubCasesParams(server, account3, account4, currency,
                    txFunction, tcsInteractiveTest.createSubCasesFor0110)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            title = '0130\t同时发送、接收代币测试（通过jt_sendTransaction测试）'
            {
                currency = {symbol:'CNYT', issuer:'jjjjjjjjjjjjjjjjjjjjjhoLvTp'}
                txFunction = consts.rpcFunctions.sendTx
                subCaseFunctionParams = framework.createSubCasesParams(server, account1, account2, currency,
                    txFunction, tcsInteractiveTest.createSubCasesFor0110)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            title = '0140\t同时发送、接收代币测试（通过jt_signTransaction测试）'
            {
                currency = {symbol:'CNYT', issuer:'jjjjjjjjjjjjjjjjjjjjjhoLvTp'}
                txFunction = consts.rpcFunctions.signTx
                subCaseFunctionParams = framework.createSubCasesParams(server, account3, account4, currency,
                    txFunction, tcsInteractiveTest.createSubCasesFor0110)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            title = '0150\t同时发送底层币、代币测试（通过jt_sendTransaction测试）'
            {
                currency = {symbol:'swt', issuer:''}
                txFunction = consts.rpcFunctions.sendTx
                subCaseFunctionParams = framework.createSubCasesParams(server, account1, account2, currency,
                    txFunction, tcsInteractiveTest.createSubCasesFor0150)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            title = '0160\t同时发送底层币、代币测试（通过jt_signTransaction测试）'
            {
                currency = {symbol:'swt', issuer:''}
                txFunction = consts.rpcFunctions.signTx
                subCaseFunctionParams = framework.createSubCasesParams(server, account3, account4, currency,
                    txFunction, tcsInteractiveTest.createSubCasesFor0150)
                testCase = tcsInteractiveTest.createTestCase(server, title, caseRestrictedLevel, subCaseFunctionParams)
                framework.addTestCase(testCases, testCase)
            }

            framework.testTestCases(server, '发送底层币/代币的交互性测试：混合', testCases)
            //endregion

        })

        //endregion

    },

    createTestCase: function(server, title, caseRestrictedLevel, subCaseFunctionParams){
        return framework.createTestCaseForSubCases(server, title, tcsInteractiveTest.executeTest,
            framework.checkSubCases, caseRestrictedLevel, subCaseFunctionParams)
    },

    //1. create sub cases from subCaseFunctionParams
    //2. execute sub cases by framework.executeSubCases

    executeTest: async function(testCase){
        let subCaseFunctionParamsList = testCase.otherParams.subCaseFunctionParamsList
        let totalCount = 0
        testCase.otherParams.servers = [testCase.server]
        testCase.otherParams.subCases = []
        for(let i = 0; i < subCaseFunctionParamsList.length; i++){
            let subCaseFunctionParams = subCaseFunctionParamsList[i]
            let createSubCasesFunction = subCaseFunctionParams.createSubCasesFunction
            let subCases = await createSubCasesFunction(subCaseFunctionParams.server, subCaseFunctionParams.account1,
                subCaseFunctionParams.account2, subCaseFunctionParams.currency, subCaseFunctionParams.txFunction)
            for (let subCase of subCases){
                totalCount += subCase.count
            }
            testCase.otherParams.subCases = testCase.otherParams.subCases.concat(subCases)
        }
        testCase.otherParams.totalCount = totalCount
        await framework.executeSubCases(testCase)
    },

    //region create sub cases

    //region 在生成区块的间隔，某钱包同时发起多个底层币发送交易，每个交易的交易额都小于发起钱包的余额，总交易额也小于发起钱包的余额
    createSubCasesForEnough: async function(server, account1, account2, currency, txFunction){
        return framework.createSubCases(server, account1, account2, currency, txFunction, _TxCount,)
    },
    //endregion

    //region 在生成区块的间隔，某钱包同时发起多个底层币发送交易，每个交易的交易额都小于发起钱包的余额，但是总交易额大于发起钱包的余额
    createSubCasesForTotalNotEnough: async function(server, account1, account2, currency, txFunction){
        return framework.createSubCases(server, account1, account2, currency, txFunction, _TxCount,
            tcsInteractiveTest.moreActionsFunctionFor0030)
    },

    moreActionsFunctionFor0030: function(subCases, sender, receiver, currency, balance, restBalance, txFunction){
        let amount = restBalance + 1
        expect(amount < balance).to.be.ok
        let value = tcsInteractiveTest.convertAmount2Value(amount, currency)
        let fee = _FEE
        subCases.push(framework.createSubCase(sender.address, sender.secret, receiver.address,
            value, fee, null, txFunction, 1, 0))
    },

    //endregion

    //region 在生成区块的间隔，钱包A向另外一个钱包发送底层币（交易额大于余额），同时钱包B向钱包A发送底层币（可使钱包A的余额大于前面的交易额）；上述2个操作可以试着调整先后顺序看结果是否一致

    createSubCasesFor0110: async function(server, account1, account2, currency, txFunction){
        return framework.createSubCases(server, account1, account2, currency, txFunction, _TxCount,
            tcsInteractiveTest.moreActionsFunctionFor0110)
    },

    moreActionsFunctionFor0110: function(subCases, sender, receiver, currency, balance, restBalance, txFunction){

        tcsInteractiveTest.moreActionsFunctionFor0030(subCases, sender, receiver, currency, balance, restBalance, txFunction)

        let amount = 15
        let value = tcsInteractiveTest.convertAmount2Value(amount, currency)
        let fee = _FEE
        subCases.push(framework.createSubCase(receiver.address, receiver.secret, sender.address,
            value, fee, null, txFunction, 1, 1))

        // tcsInteractiveTest.moreActionsFunctionFor0030(subCases, sender, receiver, currency, balance, restBalance, txFunction)
    },

    //endregion

    //region 在生成区块的间隔，某钱包发起一个发送底层币交易，使钱包余额不足以支付下一次的燃料；同时该钱包发起一个发送代币交易；上述2个操作可以试着调整先后顺序看结果是否一致，也可以尽量同时发起这2个交易

    createSubCasesFor0150: async function(server, account1, account2, currency, txFunction){
        return framework.createSubCases(server, account1, account2, currency, txFunction, _TxCount,
            tcsInteractiveTest.moreActionsFunctionFor0150)
    },

    moreActionsFunctionFor0150: function(subCases, sender, receiver, currency, balance, restBalance, txFunction){

        let amount = restBalance + _FEE
        expect(amount < balance).to.be.ok
        let value = tcsInteractiveTest.convertAmount2Value(amount, currency)
        let fee = _FEE
        subCases.push(framework.createSubCase(sender.address, sender.secret, receiver.address,
            value, fee, null, txFunction, 1, 0))

        amount = _FEE
        value = tcsInteractiveTest.convertAmount2Value(amount, currency)
        fee = _FEE
        subCases.push(framework.createSubCase(receiver.address, receiver.secret, sender.address,
            value, fee, null, txFunction, 1, 1))

        // tcsInteractiveTest.moreActionsFunctionFor0030(subCases, sender, receiver, currency, balance, restBalance, txFunction)
    },

    //endregion

    convertAmount2Value: function(amount, currency){
        let isSwt = currency.symbol == 'swt'
        let value
        if(isSwt){
            value = amount
        }else{
            value = {}
            value.amount = amount
            value.symbol = currency.symbol
            value.issuer = currency.issuer
        }
        return value
    }

    //endregion

    //endregion

}