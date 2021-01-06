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
const { chainDatas } = require("../testData/chainDatas")
//endregion
//endregion

const NativeCoinTest = '原生币swt'

module.exports = tcsSendAndSignTx = {

    //region tx test case

    testForSendTxAndSignTx: function(server, describeTitle){
        describe(describeTitle, function (){
            let categoryName = ''
            let txFunctionName = ''
            let txParams = {}

            //region basic test

            categoryName = NativeCoinTest

            // txFunctionName = consts.rpcFunctions.sendTx
            // txParams = framework.createTxParamsForTransfer(server)
            // describe(categoryName + '测试：' + txFunctionName, async function () {
            //     tcsSendAndSignTx.testForTransfer(server, categoryName, txFunctionName, txParams)
            // })
            //
            // txFunctionName = consts.rpcFunctions.signTx
            // txParams = framework.createTxParamsForTransfer(server)
            // describe(categoryName + '测试：' + txFunctionName, async function () {
            //     tcsSendAndSignTx.testForTransfer(server, categoryName, txFunctionName, txParams)
            // })

            //endregion

            //region token test

            if(server.mode.service == serviceType.newChain && server.mode.restrictedLevel >= restrictedLevel.L3){

                txFunctionName = consts.rpcFunctions.sendTx
                describe('代币测试：' + txFunctionName, async function () {
                    tcsSendAndSignTx.testForIssueTokenInComplexMode(server, txFunctionName)
                })

                txFunctionName = consts.rpcFunctions.signTx
                describe('代币测试：' + txFunctionName, async function () {
                    tcsSendAndSignTx.testForIssueTokenInComplexMode(server, txFunctionName)
                })

            }

            //endregion

        })
    },

    //region transfer tx

    createTestCasesForBasicTransaction: function(server, type, txFunctionName, txParams){
        let testScripts = []
        let testCaseCode
        let defaultScriptCode = '000100_' + type
        let scriptCode

        //region test cases for basic transfer

        // testCaseCode = 'FCJT_sendTransaction_000010'
        // scriptCode = defaultScriptCode
        // {
        //     let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
        //     framework.addTestScript(testScripts, testScript)
        // }
        //
        // testCaseCode = 'FCJT_sendTransaction_000020'
        // scriptCode = defaultScriptCode + '_1/SWT'
        // {
        //     let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
        //     testScript.actions[0].txParams[0].value = "1/SWT"
        //     if(type == NativeCoinTest) framework.addTestScript(testScripts, testScript)
        // }
        //
        // testCaseCode = 'FCJT_sendTransaction_000020'
        // scriptCode = '000200_' + type + '_1/swt'
        // {
        //     let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
        //     testScript.actions[0].txParams[0].value = "1/swt"
        //     let expectedResult = framework.createExpecteResult(false,
        //         framework.getError(-278, 't find currency'))
        //     framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
        //     if(type == NativeCoinTest) framework.addTestScript(testScripts, testScript)
        // }
        //
        // testCaseCode = 'FCJT_sendTransaction_000020'
        // scriptCode = '000300_' + type + '_1/Swt'
        // {
        //     let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
        //     testScript.actions[0].txParams[0].value = "1/Swt"
        //     let expectedResult = framework.createExpecteResult(false,
        //         framework.getError(-278, 't find currency'))
        //     framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
        //     if(type == NativeCoinTest) framework.addTestScript(testScripts, testScript)
        // }
        //
        // testCaseCode = 'FCJT_sendTransaction_000030'
        // scriptCode = defaultScriptCode
        // {
        //     let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
        //     testScript.actions[0].txParams[0].secret = null
        //     let expectedResult = framework.createExpecteResult(false,
        //         framework.getError(-278, 'No secret found for'))
        //     framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
        //     framework.addTestScript(testScripts, testScript)
        // }
        //
        // testCaseCode = 'FCJT_sendTransaction_000030'
        // scriptCode = '000200_' + type + '_错误的秘钥1'
        // {
        //     let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
        //     testScript.actions[0].txParams[0].secret = '错误的秘钥'
        //     let expectedResult = framework.createExpecteResult(false,
        //         framework.getError(-278, 'Unknown secret format'))
        //     framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
        //     framework.addTestScript(testScripts, testScript)
        // }
        //
        // testCaseCode = 'FCJT_sendTransaction_000030'
        // scriptCode = '000300_' + type + '_错误的秘钥2'
        // {
        //     let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
        //     testScript.actions[0].txParams[0].secret = testScript.actions[0].txParams[0].secret + '1'
        //     let expectedResult = framework.createExpecteResult(false,
        //         framework.getError(-278, 'Bad Base58 checksum'))
        //     framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
        //     framework.addTestScript(testScripts, testScript)
        // }
        //
        // testCaseCode = 'FCJT_sendTransaction_000040'
        // scriptCode = defaultScriptCode
        // {
        //     let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
        //     testScript.actions[0].txParams[0].from = testScript.actions[0].txParams[0].from + '1'
        //     testScript.actions[0].txParams[0].sequence = 1
        //     let expectedResult = framework.createExpecteResult(false,
        //         framework.getError(-278, 'Bad account address'))
        //     framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
        //     framework.addTestScript(testScripts, testScript)
        // }
        //
        // testCaseCode = 'FCJT_sendTransaction_000050'
        // scriptCode = defaultScriptCode
        // {
        //     let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
        //     testScript.actions[0].txParams[0].to = testScript.actions[0].txParams[0].to + '1'
        //     let expectedResult = framework.createExpecteResult(false,
        //         framework.getError(-278, 'Bad account address'))
        //     framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
        //     framework.addTestScript(testScripts, testScript)
        // }
        //
        // testCaseCode = 'FCJT_sendTransaction_000060'
        // scriptCode = defaultScriptCode + '_交易额超过发起钱包余额'
        // {
        //     let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
        //     let rawValue = utility.parseShowValue(testScript.actions[0].txParams[0].value)
        //     let showValue = utility.getFullCurrency('12345678901' ,rawValue.symbol, rawValue.issuer)
        //     testScript.actions[0].txParams[0].value = showValue
        //     let expectedResult = framework.createExpecteResult(false,
        //         framework.getError(rawValue.symbol == consts.default.nativeCoin ? -394 : -386,
        //             rawValue.symbol == consts.default.nativeCoin ? 'Fee insufficient.' : 'Fund insufficient.'))
        //     framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)
        //     framework.addTestScript(testScripts, testScript)
        // }

        testCaseCode = 'FCJT_sendTransaction_000060'
        scriptCode = '000200_' + type + '_交易额超过最大值'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            let rawValue = utility.parseShowValue(testScript.actions[0].txParams[0].value)
            let showValue = utility.getFullCurrency((consts.default.maxAmount + 1).toString() ,rawValue.symbol, rawValue.issuer)
            testScript.actions[0].txParams[0].value = showValue
            if(type == NativeCoinTest){
                let expectedResult = framework.createExpecteResult(false,
                    framework.getError(-394, 'Fee insufficient.'))
                framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)
            }
            else{
                let expectedResult = framework.createExpecteResult(false,
                    framework.getError(-278, 'error value, out of range'))
                framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            }
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_000070'
        scriptCode = defaultScriptCode
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            let rawValue = utility.parseShowValue(testScript.actions[0].txParams[0].value)
            let showSymbol = utility.getShowSymbol(rawValue.symbol, rawValue.issuer)
            testScript.actions[0].txParams[0].value = "-100" + showSymbol
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-278, 'value must be integer type and >= 0'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_000080'
        scriptCode = defaultScriptCode + '_交易额为空'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].value = null
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-278, 'value must be integer type'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_000080'
        scriptCode = '000200_' + type + '_交易额为字符串'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].value = "aawrwfsfs"
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-278, 'value must be integer type'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_000090'
        scriptCode = defaultScriptCode + '_不带currency，交易额为小于1(最小数额)的正小数'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].value = "0.0000001"
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-278, 'value must be integer type'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            if(type == NativeCoinTest) framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_000090'
        scriptCode = '000200_' + type + '_带currency，交易额为小于1的正小数'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            let rawValue = utility.parseShowValue(testScript.actions[0].txParams[0].value)
            let showSymbol = (rawValue.symbol != consts.default.nativeCoin)
                ? utility.getShowSymbol(rawValue.symbol, rawValue.issuer) : '/' + rawValue.symbol
            let decimals = (rawValue.symbol == consts.default.nativeCoin)
                ? consts.default.nativeCoinDecimals : consts.default.tokenDecimals
            let showValue = Math.pow(0.1, decimals).toFixed(decimals)
            testScript.actions[0].txParams[0].value = showValue.toString() + showSymbol
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_000090'
        scriptCode = '000300_' + type + '_带currency，交易额为小于最小数额的正小数'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            let rawValue = utility.parseShowValue(testScript.actions[0].txParams[0].value)
            let showSymbol = (rawValue.symbol != consts.default.nativeCoin)
                ? utility.getShowSymbol(rawValue.symbol, rawValue.issuer) : '/' + rawValue.symbol
            let decimals = ((rawValue.symbol == consts.default.nativeCoin)
                ? consts.default.nativeCoinDecimals : consts.default.tokenDecimals) + 1
            let showValue = Math.pow(0.1, decimals).toFixed(decimals)
            testScript.actions[0].txParams[0].value = showValue.toString() + showSymbol
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-278, 'error value'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)

        }

        testCaseCode = 'FCJT_sendTransaction_000100'
        scriptCode = defaultScriptCode + '_不带currency，交易额为大于1(最小数额)的小数'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].value = "1.0000011"
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-278, 'value must be integer type'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            if(type == NativeCoinTest) framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_000100'
        scriptCode = '000200_' + type + '_带currency，交易额为大于1的小数'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            let rawValue = utility.parseShowValue(testScript.actions[0].txParams[0].value)
            let showSymbol = (rawValue.symbol != consts.default.nativeCoin)
                ? utility.getShowSymbol(rawValue.symbol, rawValue.issuer) : '/' + rawValue.symbol
            let decimals = (rawValue.symbol == consts.default.nativeCoin)
                ? consts.default.nativeCoinDecimals : consts.default.tokenDecimals
            let showValue = (1 + Math.pow(0.1, decimals)).toFixed(decimals)
            testScript.actions[0].txParams[0].value = showValue.toString() + showSymbol
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_000100'
        scriptCode = '000300_' + type + '_带currency，交易额为10.000001/SWT或者10.00000001/Coin'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            let rawValue = utility.parseShowValue(testScript.actions[0].txParams[0].value)
            let showSymbol = (rawValue.symbol != consts.default.nativeCoin)
                ? utility.getShowSymbol(rawValue.symbol, rawValue.issuer) : '/' + rawValue.symbol
            let decimals = (rawValue.symbol == consts.default.nativeCoin)
                ? consts.default.nativeCoinDecimals : consts.default.tokenDecimals
            let showValue = (10 + Math.pow(0.1, decimals)).toFixed(decimals)
            testScript.actions[0].txParams[0].value = showValue.toString() + showSymbol
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_000110'
        scriptCode = defaultScriptCode + '_交易额为负小数：-0.1、-1.23等'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            let rawValue = utility.parseShowValue(testScript.actions[0].txParams[0].value)
            let showSymbol = utility.getShowSymbol(rawValue.symbol, rawValue.issuer)
            testScript.actions[0].txParams[0].value = "-0.1" + showSymbol
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-278, 'value must be integer type'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        //endregion

        return testScripts
    },

    createTestCasesForTransactionWithMemo: function(server, categoryName, txFunctionName, txParams){
        let testCases = []
        let testCaseParams = framework.createTestCaseParams(server, categoryName, txFunctionName, txParams)
        if(txFunctionName == consts.rpcFunctions.sendTx) testCaseParams.supportedServices.push(serviceType.oldChain)

        //region test cases
        testCaseParams.title = '0120\t发起带有效memo的交易_01: memo格式为："memos":["大家好"]'
        {
            let testCase = framework.createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].memos = ["大家好"]
            })
            framework.addTestScript(testCases, testCase)
        }

        testCaseParams.title = '0121\t发起带有效memo的交易_01: memo格式为奇数长度数字字串："memos":["12345"]'
        {
            let testCase = framework.createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].memos = ["12345"]
            })
            framework.addTestScript(testCases, testCase)
        }

        testCaseParams.title = '0122\t发起带有效memo的交易_01: memo格式为偶数长度数字字串："memos":["123456"]'
        {
            let testCase = framework.createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].memos = ["123456"]
            })
            framework.addTestScript(testCases, testCase)
        }

        testCaseParams.title = '0123\t发起带有效memo的交易_01: memo格式为字串："memos":["E5A4A7E5AEB6E5A5BDff"]'
        {
            let testCase = framework.createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].memos = ["E5A4A7E5AEB6E5A5BDff"]
            })
            framework.addTestScript(testCases, testCase)
        }

        testCaseParams.title = '0130\t发起带有效memo的交易_02: memo格式为： "memos":[{"type":"ok","format":"utf8","data":"E5A4A7E5AEB6E5A5BD"}]'
        {
            let testCase = framework.createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].memos = [{"type":"ok","format":"utf8","data":"E5A4A7E5AEB6E5A5BD"}]
            })
            framework.addTestScript(testCases, testCase)
        }

        testCaseParams.title = '0140\t发起带无效memo的交易_01: memo内容使整个交易内容超过900K'
        {
            let testCase = framework.createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
                let memos = "E5A4A7E5AEB6E5A5BD"
                for(let i = 0; i < 18; i++){
                    memos += memos
                }
                testCaseParams.txParams[0].memos = memos
                testCaseParams.restrictedLevel = restrictedLevel.L4
                testCaseParams.expectedResult = framework.createExpecteResult(false, true, 'memos data error')
            })
            framework.addTestScript(testCases, testCase)
        }

        testCaseParams.title = '0150\t发起带无效memo的交易_02: memo内容使整个交易内容超过900K'
        {
            let testCase = framework.createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
                let memos = "E5A4A7E5AEB6E5A5BD"
                for(let i = 0; i < 18; i++){
                    memos += memos
                }
                testCaseParams.txParams[0].memos = {"type":"ok","format":"utf8","data":memos}
                testCaseParams.restrictedLevel = restrictedLevel.L4
                testCaseParams.expectedResult = framework.createExpecteResult(false, true, 'memos data error')
            })
            framework.addTestScript(testCases, testCase)
        }
        // endregion

        return testCases
    },

    createTestCasesForTransactionWithFee: function(server, categoryName, txFunctionName, txParams){
        let testCases = []
        let testCaseParams = framework.createTestCaseParams(server, categoryName, txFunctionName, txParams)

        //region test cases
        testCaseParams.title = '0160\t发起带有效fee的交易_01: fee为默认值12'
        {
            let testCase = framework.createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].fee = server.mode.defaultFee
            })
            framework.addTestScript(testCases, testCase)
        }

        testCaseParams.title = '0161\t发起带有效fee的交易_01: fee为null'
        {
            let testCase = framework.createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
            })
            framework.addTestScript(testCases, testCase)
        }

        testCaseParams.title = '0170\t发起带有效fee的交易_02: fee比12小，但是足以发起成功的交易，fee=10'
        {
            let testCase = framework.createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].fee = "10"
            })
            framework.addTestScript(testCases, testCase)
        }

        testCaseParams.title = '0180\t发起带有效fee的交易_03: fee比12大但小于钱包余额'
        {
            let testCase = framework.createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].fee = "110"
            })
            framework.addTestScript(testCases, testCase)
        }

        testCaseParams.title = '0190\t发起带无效fee的交易_01: fee比12小（比如5），但是不足以发起成功的交易，fee=9'
        {
            let testCase = framework.createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].fee = "9"
                testCaseParams.expectedResult = framework.createExpecteResult(false,
                    framework.getError(136, 'Insufficient balance to pay fee.'))
            })
            framework.addTestScript(testCases, testCase)
        }

        testCaseParams.title = '0200\t发起带无效fee的交易_02: fee为0'
        {
            let testCase = framework.createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].fee = "0"
                testCaseParams.expectedResult = framework.createExpecteResult(false,
                    framework.getError(136, 'Insufficient balance to pay fee.'))
            })
            framework.addTestScript(testCases, testCase)
        }

        testCaseParams.title = '0210\t发起带无效fee的交易_03: fee为大于0的小数，比如12.5、5.5'
        {
            let testCase = framework.createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].fee = "12.5"
                testCaseParams.expectedResult = framework.createExpecteResult(false,
                    framework.getError(-278, 'strconv.ParseUint'))
            })
            framework.addTestScript(testCases, testCase)
        }

        testCaseParams.title = '0220\t发起带无效fee的交易_04: fee为大于发起钱包' + categoryName + '余额的整数'
        {
            let testCase = framework.createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].fee = consts.default.maxAmount.toString()
                testCaseParams.expectedResult = framework.createExpecteResult(false,
                    framework.getError(-394, 'Fee insufficient.'))
            })
            framework.addTestScript(testCases, testCase)
        }

        testCaseParams.title = '0230\t发起带无效fee的交易_05: fee为负数，比如-3.5、-555等'
        {
            let testCase = framework.createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].fee = "-35"
                // testCaseParams.expectedResult = framework.createExpecteResult(false, false,
                //     'tecINSUFF_FEE Insufficient balance to pay fee')
                testCaseParams.expectedResult = framework.createExpecteResult(false, framework.getError(-278, 'strconv.ParseUint'))
            })
            framework.addTestScript(testCases, testCase)
        }

        testCaseParams.title = '0240\t发起带无效fee的交易_06: fee为数字'
        {
            let testCase = framework.createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].fee = 35
                testCaseParams.expectedResult = framework.createExpecteResult(false, framework.getError(-278, 'strconv.ParseUint'))
            })
            framework.addTestScript(testCases, testCase)
        }
        //endregion

        return testCases
    },

    //endregion

    //region issue token tx

    createTestCasesForCreateToken: function(server, type, txFunctionName, txParams){

        let testScripts = []
        let testCaseCode
        let defaultScriptCode = '000100_' + type
        let scriptCode
        let existToken = server.mode.coins[4]

        //region test cases

        testCaseCode = 'FCJT_sendTransaction_000270'
        scriptCode = defaultScriptCode
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].expectedResult.expectedBalance = testScript.actions[0].txParams[0].total_supply
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_000271'
        scriptCode = defaultScriptCode
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + '1'
            let newTotalSupply = 54321 + Math.pow(0.1, Number(testScript.actions[0].txParams[0].decimals))
            testScript.actions[0].txParams[0].total_supply = newTotalSupply.toString() + '/' + testScript.actions[0].txParams[0].symbol
            testScript.actions[0].expectedResult.expectedBalance = testScript.actions[0].txParams[0].total_supply
            framework.addTestScript(testScripts, testScript)
        }


        // testCaseParams.title = '0271\t发行' + testCaseParams.categoryName + '_发行量是负数'
        // {
        //     let testCase = framework.createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        //         framework.updateTokenInTestCaseParams(testCaseParams)
        //         testCaseParams.txParams[0].total_supply = "-10000"
        //         testCaseParams.expectedResult = framework.createExpecteResult(false, framework.getError(-175, 'No permission issue.'))
        //     })
        //     framework.addTestScript(testCases, testCase)
        // }

        // testCaseParams.title = '0290\t发行' + testCaseParams.categoryName + '_无效的type参数'
        // {
        //     let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        //         framework.updateTokenInTestCaseParams(testCaseParams)
        //         testCaseParams.txParams[0].type = "issuecoin"
        //         testCaseParams.expectedResult = framework.createExpecteResult(false, framework.getError(-278, 'error type issuecoin'))
        //     })
        //     framework.addTestScript(testCases, testCase)
        // }
        //
        // testCaseParams.title = '0300\t发行' + testCaseParams.categoryName + '_无效的from参数'
        // {
        //     let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        //         framework.updateTokenInTestCaseParams(testCaseParams)
        //         testCaseParams.txParams[0].from = "from.address"
        //         testCaseParams.expectedResult = framework.createExpecteResult(false, framework.getError(-284, 'sequence must be positive integer'))
        //     })
        //     framework.addTestScript(testCases, testCase)
        // }
        //
        // testCaseParams.title = '0310\t发行' + testCaseParams.categoryName + '_有效的name参数:很长的字符串，正好256字节'
        // {
        //     let testCase = framework.createTestCaseWhenSignPassAndSendRawTxPassForIssueToken(testCaseParams, function(){
        //         testCaseParams.txParams[0].name = utility.createMemosWithSpecialLength(256)[0]
        //         testCaseParams.txParams[0].symbol = utility.getDynamicTokenName().symbol
        //         // testCaseParams.expectedResult = framework.createExpecteResult(false, false,
        //         //     'failed to submit transaction')
        //         testCaseParams.expectedResult = framework.createExpecteResult(true, true,
        //             '')
        //     })
        //     framework.addTestScript(testCases, testCase)
        // }
        //
        // testCaseParams.title = '0311\t发行' + testCaseParams.categoryName + '_无效的name参数:很长的字符串，超过256字节'
        // {
        //     let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        //         testCaseParams.txParams[0].name = utility.createMemosWithSpecialLength(257)[0]
        //         testCaseParams.txParams[0].symbol = utility.getDynamicTokenName().symbol
        //         // testCaseParams.expectedResult = framework.createExpecteResult(false, false,
        //         //     'failed to submit transaction')
        //         testCaseParams.expectedResult = framework.createExpecteResult(false,
        //             framework.getError(-278, 'The length of the name should be <= 256'))
        //     })
        //     framework.addTestScript(testCases, testCase)
        // }
        //
        // testCaseParams.title = '0312\t发行' + testCaseParams.categoryName + '_有效的name参数:被已有代币使用过的name'
        // {
        //     let testCase = framework.createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        //         testCaseParams.txParams[0].name = existToken.name
        //         testCaseParams.txParams[0].symbol = utility.getDynamicTokenName().symbol
        //         // testCaseParams.expectedResult = framework.createExpecteResult(false, false,
        //         //         //     'failed to submit transaction')
        //         testCaseParams.expectedResult = framework.createExpecteResult(true, true, '')
        //     })
        //     framework.addTestScript(testCases, testCase)
        // }
        //
        // testCaseParams.title = '0320\t发行' + testCaseParams.categoryName + '_无效的symbol参数:长度超过12字节'
        // {
        //     let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        //         testCaseParams.txParams[0].symbol = utility.getDynamicTokenName().symbol + utility.createMemosWithSpecialLength(5)
        //         testCaseParams.expectedResult = framework.createExpecteResult(false,
        //             framework.getError(-278, 'the length of the symbol must be in the range [3,12]'))
        //     })
        //     framework.addTestScript(testCases, testCase)
        // }
        //
        // testCaseParams.title = '0321\t发行' + testCaseParams.categoryName + '_有效的symbol参数:长度正好12字节'
        // {
        //     let testCase = framework.createTestCaseWhenSignPassAndSendRawTxPassForIssueToken(testCaseParams, function() {
        //         testCaseParams.txParams[0].symbol = utility.getDynamicTokenName().symbol + utility.createMemosWithSpecialLength(4)
        //         testCaseParams.expectedResult = framework.createExpecteResult(true, true, '')
        //     })
        //     framework.addTestScript(testCases, testCase)
        // }
        //
        // testCaseParams.title = '0322\t发行' + testCaseParams.categoryName + '_无效的symbol参数:被已有代币使用过的symbol'
        // {
        //     let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        //         let root = server.mode.addresses.rootAccount
        //         testCaseParams.txParams[0].from = root.address
        //         testCaseParams.txParams[0].secret = root.secret
        //         testCaseParams.txParams[0].symbol = existToken.symbol
        //         testCaseParams.txParams[0].local = true
        //         testCaseParams.txParams[0].flag = consts.flags.normal
        //         testCaseParams.expectedResult = framework.createExpecteResult(false,
        //             framework.getError(-278, 'invalid parameter flag'))
        //     })
        //     framework.addTestScript(testCases, testCase)
        // }
        //
        // testCaseParams.title = '0330\t发行' + testCaseParams.categoryName + '_无效的decimals参数:字符串'
        // {
        //     let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        //         framework.updateTokenInTestCaseParams(testCaseParams)
        //         testCaseParams.txParams[0].decimals = "config.decimals"
        //         testCaseParams.expectedResult = framework.createExpecteResult(false,
        //             framework.getError(-278, 'decimals must be integer type(string) and in range [0, 18]'))
        //     })
        //     framework.addTestScript(testCases, testCase)
        // }
        //
        // testCaseParams.title = '0331\t发行' + testCaseParams.categoryName + '_无效的decimals参数:负数'
        // {
        //     let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        //         framework.updateTokenInTestCaseParams(testCaseParams)
        //         testCaseParams.txParams[0].decimals = -8
        //         testCaseParams.expectedResult = framework.createExpecteResult(false,
        //             framework.getError(-278, 'decimals must be integer type(string) and in range [0, 18]'))
        //     })
        //     framework.addTestScript(testCases, testCase)
        // }
        //
        // testCaseParams.title = '0332\t发行' + testCaseParams.categoryName + '_无效的decimals参数:负数字符串'
        // {
        //     let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        //         framework.updateTokenInTestCaseParams(testCaseParams)
        //         testCaseParams.txParams[0].decimals = '-8'
        //         testCaseParams.expectedResult = framework.createExpecteResult(false,
        //             framework.getError(-278, 'decimals must be integer type and in range [0, 18]'))
        //     })
        //     framework.addTestScript(testCases, testCase)
        // }
        //
        // testCaseParams.title = '0333\t发行' + testCaseParams.categoryName + '_无效的decimals参数:小数'
        // {
        //     let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        //         framework.updateTokenInTestCaseParams(testCaseParams)
        //         testCaseParams.txParams[0].decimals = 11.64
        //         testCaseParams.expectedResult = framework.createExpecteResult(false,
        //             framework.getError(-278, 'decimals must be integer type(string) and in range [0, 18]'))
        //     })
        //     framework.addTestScript(testCases, testCase)
        // }
        //
        // testCaseParams.title = '0334\t发行' + testCaseParams.categoryName + '_无效的decimals参数:小数字符串'
        // {
        //     let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        //         framework.updateTokenInTestCaseParams(testCaseParams)
        //         testCaseParams.txParams[0].decimals = '11.64'
        //         testCaseParams.expectedResult = framework.createExpecteResult(false,
        //             framework.getError(-278, 'decimals must be integer type(string) and in range [0, 18]'))
        //     })
        //     framework.addTestScript(testCases, testCase)
        // }
        //
        // testCaseParams.title = '0340\t发行' + testCaseParams.categoryName + '_无效的total_supply参数:非数字字符串'
        // {
        //     let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        //         framework.updateTokenInTestCaseParams(testCaseParams)
        //         testCaseParams.txParams[0].total_supply = "config.total_supply"
        //         testCaseParams.expectedResult = framework.createExpecteResult(false,
        //             framework.getError(-278, 'total_supply must be integer type'))
        //     })
        //     framework.addTestScript(testCases, testCase)
        // }
        //
        // testCaseParams.title = '0341\t发行' + testCaseParams.categoryName + '_无效的total_supply参数:负数'
        // {
        //     let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        //         framework.updateTokenInTestCaseParams(testCaseParams)
        //         testCaseParams.txParams[0].total_supply = -10000000
        //         testCaseParams.expectedResult = framework.createExpecteResult(false,
        //             framework.getError(-278, 'total_supply must be integer type'))
        //     })
        //     framework.addTestScript(testCases, testCase)
        // }
        //
        // testCaseParams.title = '0342\t发行' + testCaseParams.categoryName + '_无效的total_supply参数:负数字符串'
        // {
        //     let testCase = framework.createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        //         framework.updateTokenInTestCaseParams(testCaseParams)
        //         testCaseParams.txParams[0].total_supply = '-10000000'
        //         testCaseParams.expectedResult = framework.createExpecteResult(false, framework.getError(-175, 'No permission issue.'))
        //     })
        //     framework.addTestScript(testCases, testCase)
        // }
        //
        // testCaseParams.title = '0343\t发行' + testCaseParams.categoryName + '_无效的total_supply参数:小数'
        // {
        //     let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        //         framework.updateTokenInTestCaseParams(testCaseParams)
        //         testCaseParams.txParams[0].total_supply = 10000.12345678
        //         testCaseParams.expectedResult = framework.createExpecteResult(false,
        //             framework.getError(-278, 'total_supply must be integer type'))
        //     })
        //     framework.addTestScript(testCases, testCase)
        // }
        //
        // testCaseParams.title = '0344\t发行' + testCaseParams.categoryName + '_有效的total_supply参数:小数字符串'
        // {
        //     let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        //         framework.updateTokenInTestCaseParams(testCaseParams)
        //         testCaseParams.txParams[0].total_supply = '10000.12345678'
        //         testCaseParams.expectedResult = framework.createExpecteResult(false,
        //             framework.getError(-278, 'total_supply must be integer type'))
        //     })
        //     framework.addTestScript(testCases, testCase)
        // }

        //endregion

        return testScripts
    },

    createTestCasesForMintToken: function(server, categoryName, txFunctionName, txParams){
        let testCases = []
        let testCaseParams = framework.createTestCaseParams(server, categoryName, txFunctionName, txParams)
        testCaseParams.restrictedLevel = restrictedLevel.L3

        // await utility.timeout(1)  //make sure create token done first!

        //region test cases
        testCaseParams.title = '0370\t增发可增发的代币' + testCaseParams.categoryName
        {
            let testCase = tcsSendAndSignTx.canMint(testCaseParams.txParams[0].flags) ?
                framework.createTestCaseWhenSignPassAndSendRawTxPassForIssueToken(testCaseParams, function(){
                    testCaseParams.txParams[0].total_supply = '9'
                    testCaseParams.expectedResult.expectedBalance = 19753086419
                })
                :
                framework.createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
                    testCaseParams.txParams[0].total_supply = '9'
                    testCaseParams.expectedResult = framework.createExpecteResult(false,
                        framework.getError(-175, 'No permission issue.'))
                })
            framework.addTestScript(testCases, testCase)
        }

        testCaseParams.title = '0371_0001\t增发代币' + testCaseParams.categoryName + '_decimal不一致'
        {
            let testCase = tcsSendAndSignTx.canMint(testCaseParams.txParams[0].flags) ?
                framework.createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
                    testCaseParams.txParams[0].total_supply = '9'
                    testCaseParams.txParams[0].decimals = '9'
                    testCaseParams.expectedResult = framework.createExpecteResult(false,
                        framework.getError(-278, 'The transaction is ill-formed.'))
                })
                :
                framework.createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
                    testCaseParams.txParams[0].total_supply = '9'
                    testCaseParams.txParams[0].decimals = '9'
                    testCaseParams.expectedResult = framework.createExpecteResult(false,
                        framework.getError(-278, 'The transaction is ill-formed.'))
                })
            framework.addTestScript(testCases, testCase)
        }

        testCaseParams.title = '0371_0002\t增发代币' + testCaseParams.categoryName + '_name不一致'
        {
            let testCase = tcsSendAndSignTx.canMint(testCaseParams.txParams[0].flags) ?
                framework.createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
                    testCaseParams.txParams[0].total_supply = '9'
                    testCaseParams.txParams[0].name = 'TestCoin_StrangeName'
                    testCaseParams.expectedResult = framework.createExpecteResult(false,
                        framework.getError(-278, 'The transaction is ill-formed.'))
                })
                :
                framework.createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
                    testCaseParams.txParams[0].total_supply = '9'
                    testCaseParams.txParams[0].name = 'TestCoin_StrangeName'
                    testCaseParams.expectedResult = framework.createExpecteResult(false,
                        framework.getError(-278, 'The transaction is ill-formed.'))
                })
            framework.addTestScript(testCases, testCase)
        }

        testCaseParams.title = '0371_0003\t增发代币' + testCaseParams.categoryName + '_flag不一致'
        {
            let testCase = tcsSendAndSignTx.canMint(testCaseParams.txParams[0].flags) ?
                framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
                    testCaseParams.txParams[0].total_supply = '9'
                    testCaseParams.txParams[0].flag = 1
                    testCaseParams.expectedResult = framework.createExpecteResult(false,
                        framework.getError(-278, 'invalid parameter flag'))
                })
                :
                framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
                    testCaseParams.txParams[0].total_supply = '9'
                    testCaseParams.txParams[0].flag = 1
                    testCaseParams.expectedResult = framework.createExpecteResult(false,
                        framework.getError(-278, 'invalid parameter flag'))
                })
            framework.addTestScript(testCases, testCase)
        }
        //endregion

        return testCases
    },

    createTestCasesForBurnToken: function(server, categoryName, txFunctionName, txParams){
        let testCases = []
        let testCaseParams = framework.createTestCaseParams(server, categoryName, txFunctionName, txParams)
        testCaseParams.restrictedLevel = restrictedLevel.L3

        //region test cases
        testCaseParams.title = '0380\t销毁' + testCaseParams.categoryName
        {
            let testCase = tcsSendAndSignTx.canBurn(testCaseParams.txParams[0].flags) ?
                framework.createTestCaseWhenSignPassAndSendRawTxPassForIssueToken(testCaseParams, function(){
                    testCaseParams.txParams[0].total_supply = '-9'
                })
                :
                framework.createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
                    testCaseParams.txParams[0].total_supply = '-9'
                    testCaseParams.expectedResult = framework.createExpecteResult(false,
                        framework.getError(-175, 'No permission issue.'))
                })
            framework.addTestScript(testCases, testCase)
        }

        testCaseParams.title = '0381_0001\t销毁代币' + testCaseParams.categoryName + '_decimal不一致'
        {
            let testCase = tcsSendAndSignTx.canBurn(testCaseParams.txParams[0].flags) ?
                framework.createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
                    testCaseParams.txParams[0].total_supply = '-9'
                    testCaseParams.txParams[0].decimals = '9'
                    testCaseParams.expectedResult = framework.createExpecteResult(false,
                        framework.getError(-278, 'The transaction is ill-formed.'))
                })
                :
                framework.createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
                    testCaseParams.txParams[0].total_supply = '-9'
                    testCaseParams.txParams[0].decimals = '9'
                    testCaseParams.expectedResult = framework.createExpecteResult(false,
                        framework.getError(-175, 'No permission issue.'))
                })
            framework.addTestScript(testCases, testCase)
        }

        testCaseParams.title = '0381_0002\t销毁代币' + testCaseParams.categoryName + '_name不一致'
        {
            let testCase = tcsSendAndSignTx.canBurn(testCaseParams.txParams[0].flags) ?
                framework.createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
                    testCaseParams.txParams[0].total_supply = '-9'
                    testCaseParams.txParams[0].name = 'TestCoin_StrangeName'
                    testCaseParams.expectedResult = framework.createExpecteResult(false,
                        framework.getError(-278, 'The transaction is ill-formed.'))
                })
                :
                framework.createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
                    testCaseParams.txParams[0].total_supply = '-9'
                    testCaseParams.txParams[0].name = 'TestCoin_StrangeName'
                    testCaseParams.expectedResult = framework.createExpecteResult(false,
                        framework.getError(-175, 'No permission issue.'))
                })
            framework.addTestScript(testCases, testCase)
        }

        testCaseParams.title = '0381_0003\t销毁代币' + testCaseParams.categoryName + '_flag不一致'
        {
            let testCase = tcsSendAndSignTx.canBurn(testCaseParams.txParams[0].flags) ?
                framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
                    testCaseParams.txParams[0].total_supply = '-9'
                    testCaseParams.txParams[0].flag = 1
                    testCaseParams.expectedResult = framework.createExpecteResult(false,
                        framework.getError(-278, 'invalid parameter flag'))
                })
                :
                framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
                    testCaseParams.txParams[0].total_supply = '-9'
                    testCaseParams.txParams[0].flag = 1
                    testCaseParams.expectedResult = framework.createExpecteResult(false,
                        framework.getError(-278, 'invalid parameter flag'))
                })
            framework.addTestScript(testCases, testCase)
        }

        testCaseParams.title = '0420\t无效地销毁：销毁数量大于发行数量' + testCaseParams.categoryName
        {
            testCaseParams.otherParams.oldBalance = '49382716041'
            let testCase = framework.createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
                testCaseParams.txParams[0].total_supply = '-997654319900000000'
                let burnable = tcsSendAndSignTx.canBurn(testCaseParams.txParams[0].flags)
                testCaseParams.expectedResult = framework.createExpecteResult(false,
                    burnable ?  framework.getError(-386, 'Fund insufficient.')
                    // burnable ?  framework.getError(-298, 'Can only send non-negative amounts.')
                        : framework.getError(-175, 'No permission issue.'))
            })
            framework.addTestScript(testCases, testCase)
        }

        testCaseParams.title = '0381_0004\t销毁所有' + testCaseParams.categoryName
        {
            let testCase = tcsSendAndSignTx.canBurn(testCaseParams.txParams[0].flags) ?
                framework.createTestCaseWhenSignPassAndSendRawTxPassForIssueToken(testCaseParams, function(){
                    // testCaseParams.txParams[0].total_supply =  '-987654319900000000'
                    testCaseParams.txParams[0].total_supply =
                        testCaseParams.txParams[0].flags == consts.flags.burnable ? '-987654318899999988' : '-987654318899999997'
                    testCaseParams.expectedResult = framework.createExpecteResult(true)
                    testCaseParams.expectedResult.expectedBalance = 0
                })
                :
                framework.createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
                    testCaseParams.txParams[0].total_supply =  '-49382716041'
                    testCaseParams.expectedResult = framework.createExpecteResult(false,  framework.getError(-175, 'No permission issue.'))
                })
            framework.addTestScript(testCases, testCase)
        }
        //endregion

        return testCases
    },

    //endregion

    //endregion

    //region test for tx
    testForTransfer: function(server, categoryName, txFunctionName, txParams){
        let testName = ''
        let describeTitle = ''
        let testCases = []

        testName = '测试基本交易'
        describeTitle = testName + '-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
        testCases = tcsSendAndSignTx.createTestCasesForBasicTransaction(server, categoryName, txFunctionName, txParams)
        framework.testTestCases(server, describeTitle, testCases)

        // testName = '测试交易memo'
        // describeTitle = testName + '-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
        // testCases = tcsSendAndSignTx.createTestCasesForTransactionWithMemo(server, categoryName, txFunctionName, txParams)
        // framework.testTestCases(server, describeTitle, testCases)
        //
        // testName = '测试交易Fee'
        // describeTitle = testName + '-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
        // testCases = tcsSendAndSignTx.createTestCasesForTransactionWithFee(server, categoryName, txFunctionName, txParams)
        // framework.testTestCases(server, describeTitle, testCases)
    },

    testForIssueToken: function(server, categoryName, txFunctionName, account, configToken){
        let testName = ''
        let describeTitle = ''
        let testCases = []
        let txParams = {}

        //create token
        testName = '测试创建token'
        describeTitle = testName + '-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
        txParams = framework.createTxParamsForIssueToken(server, account, configToken)
        testCases = tcsSendAndSignTx.createTestCasesForCreateToken(server, categoryName, txFunctionName, txParams)
        framework.testTestCases(server, describeTitle, testCases)

        //set token properties
        let txParam = txParams[0]
        let tokenName = txParam.name
        let tokenSymbol = txParam.symbol
        let issuer = txParam.local ? txParam.from : server.mode.addresses.defaultIssuer.address
        logger.debug("===create token: " + tokenSymbol)

        //token transfer
        let transferTxParams = framework.createTxParamsForTokenTransfer(server, account, tokenSymbol, issuer)
        describeTitle = '测试基本交易-[币种:' + transferTxParams[0].symbol + '] [方式:' + txFunctionName + ']'
        tcsSendAndSignTx.testForTransfer(server, categoryName, txFunctionName, transferTxParams)

        // //mint token
        // let mintTxParams = framework.createTxParamsForMintToken(server, account, configToken, tokenName, tokenSymbol)
        // describeTitle = '测试增发-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
        // testCases = tcsSendAndSignTx.createTestCasesForMintToken(server, categoryName, txFunctionName, mintTxParams)
        // framework.testTestCases(server, describeTitle, testCases)
        //
        // //burn token
        // describeTitle = '测试销毁-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
        // testCases = tcsSendAndSignTx.createTestCasesForBurnToken(server, categoryName, txFunctionName, mintTxParams)
        // framework.testTestCases(server, describeTitle, testCases)
    },

    testForGlobalToken: function(server, categoryName, txFunctionName, account, configToken){
        let testName = ''
        let describeTitle = ''
        let testCases = []

        let txParam = configToken
        let tokenName = txParam.name
        let tokenSymbol = txParam.symbol
        let issuer = txParam.issuer

        //token transfer
        let transferTxParams = framework.createTxParamsForTokenTransfer(server, account, tokenSymbol, issuer)
        describeTitle = '测试基本交易-[币种:' + transferTxParams[0].symbol + '] [方式:' + txFunctionName + ']'
        tcsSendAndSignTx.testForTransfer(server, categoryName, txFunctionName, transferTxParams)

        //mint token
        let mintTxParams = framework.createTxParamsForMintToken(server, account, configToken, tokenName, tokenSymbol)
        describeTitle = '测试增发-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
        testCases = tcsSendAndSignTx.createTestCasesForMintToken(server, categoryName, txFunctionName, mintTxParams)
        framework.testTestCases(server, describeTitle, testCases)

        //burn token
        describeTitle = '测试销毁-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
        testCases = tcsSendAndSignTx.createTestCasesForBurnToken(server, categoryName, txFunctionName, mintTxParams)
        framework.testTestCases(server, describeTitle, testCases)
    },

    testForIssueTokenInComplexMode: function(server, txFunctionName){
        let account = server.mode.addresses.sender3

        let configToken = token.config_normal
        describe(configToken.testName + '测试：' + txFunctionName, async function () {
            tcsSendAndSignTx.testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
        })

        // configToken = token.config_mintable
        // describe(configToken.testName + '测试：' + txFunctionName, async function () {
        //     tcsSendAndSignTx.testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
        // })
        //
        // configToken = token.config_burnable
        // describe(configToken.testName + '测试：' + txFunctionName, async function () {
        //     tcsSendAndSignTx.testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
        // })
        //
        // configToken = token.config_mint_burn
        // describe(configToken.testName + '测试：' + txFunctionName, async function () {
        //     tcsSendAndSignTx.testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
        // })
        //
        // configToken = token.config_issuer_normal
        // describe(configToken.testName + '测试：' + txFunctionName, async function () {
        //     tcsSendAndSignTx.testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
        // })
        //
        // configToken = token.config_issuer_mintable
        // describe(configToken.testName + '测试：' + txFunctionName, async function () {
        //     tcsSendAndSignTx.testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
        // })
        //
        // configToken = token.config_issuer_burnable
        // describe(configToken.testName + '测试：' + txFunctionName, async function () {
        //     tcsSendAndSignTx.testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
        // })
        //
        // configToken = token.config_issuer_mint_burn
        // describe(configToken.testName + '测试：' + txFunctionName, async function () {
        //     tcsSendAndSignTx.testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
        // })

        // configToken = token.CNYT  //todo CNYT不存在了，确定后删除
        // describe(configToken.testName + '测试：' + txFunctionName, async function () {
        //     tcsSendAndSignTx.testForGlobalToken(server, configToken.testName, txFunctionName,
        //         server.mode.addresses.sender1, configToken)
        // })

    },
    //endregion

    //region mintable and burnable

    // 参考”发起底层币无效交易“的测试用例
    // "flags":        float64(data.TxCoinMintable | data.TxCoinBurnable)
    // TxCoinMintable  TransactionFlag = 0x00010000 (65536)
    // TxCoinBurnable  TransactionFlag = 0x00020000 (131072)
    // Mintable+Burnable  TransactionFlag = 0x00030000  (196608)
    // Neither Mintable nor Burnable  TransactionFlag = 0x00000000  (0)
    // "local":true 表示发的是带issuer的币，类似这种100/CNY/jGr9kAJ1grFwK4FtQmYMm5MRnLzm93CV9C.
    // 全局幣比如CNYT，local必須是false。

    canMint: function(flags){
        if(flags === consts.flags.mintable || flags === consts.flags.both){
            return true
        }
        return false
    },

    canBurn: function(flags){
        if(flags === consts.flags.burnable || flags === consts.flags.both){
            return true
        }
        return false
    },

    //endregion

}
