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

module.exports = tcsSendAndSignTx = {

    //region tx test case

    testForSendTxAndSignTx: function(server, describeTitle){
        describe(describeTitle, function (){
            let categoryName = ''
            let txFunctionName = ''
            let txParams = {}
            let testCases = []

            //region basic test

            categoryName = '原生币swt'
            txFunctionName = consts.rpcFunctions.sendTx
            txParams = framework.createTxParamsForTransfer(server)
            describe(categoryName + '测试：' + txFunctionName, async function () {
                tcsSendAndSignTx.testForTransfer(server, categoryName, txFunctionName, txParams)
            })

            txFunctionName = consts.rpcFunctions.signTx
            txParams = framework.createTxParamsForTransfer(server)
            describe(categoryName + '测试：' + txFunctionName, async function () {
                tcsSendAndSignTx.testForTransfer(server, categoryName, txFunctionName, txParams)
            })

            //endregion

            //region token test

            if(server.mode.service == serviceType.newChain
                && server.mode.restrictedLevel >= restrictedLevel.L4 //todo need reset to L3 when create token function restore
            ){

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

    createTestCasesForBasicTransaction: function(server, categoryName, txFunctionName, txParams){
        let testCases = []
        let testCaseParams = framework.createTestCaseParams(server, categoryName, txFunctionName, txParams)
        if(txFunctionName == consts.rpcFunctions.sendTx) testCaseParams.supportedServices.push(serviceType.oldChain)

        //region test cases for basic transfer
        testCaseParams.title = '0010\t发起' + testCaseParams.categoryName + '有效交易_01'
        {
            let testCase = framework.createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0020\t发起' + categoryName + '有效交易_02: 交易额填"' + testCaseParams.txParams[0].value + '"等'
        {
            let testCase = framework.createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].value = "123/swt"
            })
            //only test when send swt
            if(testCaseParams.txParams[0].symbol == null) {
                framework.addTestCase(testCases, testCase)
            }
        }

        testCaseParams.title = '0030\t发起' + categoryName + '无效交易_01: 没有秘钥'
        {
            let testCase = framework.createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].secret = null
                // testCaseParams.expectedResult = framework.createExpecteResult(false, true, 'No secret found for')
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    server.mode.service == serviceType.newChain ? 'No secret found for' : consts.engineResults.temINVALID_SECRET)
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0030\t发起' + categoryName + '无效交易_01: 错误的秘钥1'
        {
            let testCase = framework.createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].secret = '错误的秘钥'
                // testCaseParams.expectedResult = framework.createExpecteResult(false, true, 'Bad Base58 string')
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    server.mode.service == serviceType.newChain ? 'Bad Base58 string' : consts.engineResults.temMALFORMED)
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0030\t发起' + categoryName + '无效交易_01: 错误的秘钥2'
        {
            let testCase = framework.createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].secret = testCaseParams.txParams[0].secret + '1'
                // testCaseParams.expectedResult = framework.createExpecteResult(false, true, 'Bad Base58 checksum')
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    server.mode.service == serviceType.newChain ? 'Bad Base58 checksum' : consts.engineResults.temMALFORMED)
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0040\t发起' + categoryName + '无效交易_02: 错误的发起钱包地址（乱码字符串）'
        {
            let testCase = framework.createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].from = testCaseParams.txParams[0].from + '1'
                // testCaseParams.expectedResult = framework.createExpecteResult(false, true, 'Bad account address:')
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    server.mode.service == serviceType.newChain ? 'Bad account address:' : consts.engineResults.temINVALID_FROM_ADDRESS)
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0050\t发起' + categoryName + '无效交易_03: 错误的接收钱包地址（乱码字符串）'
        {
            let testCase = framework.createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].to = testCaseParams.txParams[0].to + '1'
                // testCaseParams.expectedResult = framework.createExpecteResult(false, true, 'Bad account address:')
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    server.mode.service == serviceType.newChain ? 'Bad account address:' : consts.engineResults.temINVALID_TO_ADDRESS)
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0060\t发起' + categoryName + '无效交易_04: 交易额超过发起钱包余额'
        {
            let testCase = framework.createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].value = "999999999999999" + testCaseParams.showSymbol
                // testCaseParams.expectedResult = framework.createExpecteResult(false, false, 'telINSUF_FEE_P Fee insufficient')
                // testCaseParams.expectedResult = framework.createExpecteResult(false, true, 'telINSUF_FEE_P Fee insufficient')
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    server.mode.service == serviceType.newChain ? 'telINSUF_FEE_P Fee insufficient' : consts.engineResults.temBAD_AMOUNT)
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0070\t发起' + categoryName + '无效交易_05: 交易额为负数'
        {
            let testCase = framework.createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].value = "-100" + testCaseParams.showSymbol
                // testCaseParams.expectedResult = framework.createExpecteResult(false, false,
                //     'temBAD_AMOUNT Can only send positive amounts')
                // testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                //     'temBAD_AMOUNT Can only send positive amounts')
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    server.mode.service == serviceType.newChain ? 'value must be integer type and >= 0' : consts.engineResults.temBAD_AMOUNT)
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0080\t发起' + categoryName + '无效交易_06: 交易额为空'
        {
            let testCase = framework.createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].value = null
                // testCaseParams.expectedResult = framework.createExpecteResult(false, true, 'Invalid Number')
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    server.mode.service == serviceType.newChain ? 'Invalid Number' : consts.engineResults.temBAD_AMOUNT)
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0080\t发起' + categoryName + '无效交易_06: 交易额为字符串'
        {
            let testCase = framework.createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].value = "aawrwfsfs"
                // testCaseParams.expectedResult = framework.createExpecteResult(false, true, 'Invalid Number')
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    server.mode.service == serviceType.newChain ? 'Invalid Number' : consts.engineResults.temBAD_AMOUNT)
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0090\t发起' + categoryName + '无效交易_07: 交易额为小于0.000001(最小数额)的正小数'
        {
            let testCase = framework.createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].value = "0.0000001" + testCaseParams.showSymbol
                // testCaseParams.expectedResult = framework.createExpecteResult(false, true, 'value must be integer type')
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    server.mode.service == serviceType.newChain ? 'value must be integer type' : consts.engineResults.temBAD_AMOUNT)
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0100\t发起' + categoryName + '无效交易_08: 交易额为大于0.000001(最小数额)的小数'
        {
            let testCase = framework.createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].value = "0.0000011" + testCaseParams.showSymbol
                // testCaseParams.expectedResult = framework.createExpecteResult(false, true, 'value must be integer type')
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    server.mode.service == serviceType.newChain ? 'value must be integer type' : consts.engineResults.temBAD_AMOUNT)
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0110\t发起' + categoryName + '无效交易_09: 交易额为负小数：-0.1、-1.23等'
        {
            let testCase = framework.createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].value = "-0.1" + testCaseParams.showSymbol
                // testCaseParams.expectedResult = framework.createExpecteResult(false, true, 'value must be integer type')
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    server.mode.service == serviceType.newChain ? 'value must be integer type' : consts.engineResults.temBAD_AMOUNT)
            })
            framework.addTestCase(testCases, testCase)
        }

        //endregion

        return testCases
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
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0120\t发起带有效memo的交易_01: memo格式为奇数长度数字字串："memos":["12345"]'
        {
            let testCase = framework.createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].memos = ["12345"]
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0120\t发起带有效memo的交易_01: memo格式为偶数长度数字字串："memos":["123456"]'
        {
            let testCase = framework.createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].memos = ["123456"]
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0120\t发起带有效memo的交易_01: memo格式为字串："memos":["E5A4A7E5AEB6E5A5BDff"]'
        {
            let testCase = framework.createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].memos = ["E5A4A7E5AEB6E5A5BDff"]
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0130\t发起带有效memo的交易_02: memo格式为： "memos":[{"type":"ok","format":"utf8","data":"E5A4A7E5AEB6E5A5BD"}]'
        {
            let testCase = framework.createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].memos = [{"type":"ok","format":"utf8","data":"E5A4A7E5AEB6E5A5BD"}]
            })
            framework.addTestCase(testCases, testCase)
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
            framework.addTestCase(testCases, testCase)
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
            framework.addTestCase(testCases, testCase)
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
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0160\t发起带有效fee的交易_01: fee为null'
        {
            let testCase = framework.createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0170\t发起带有效fee的交易_02: fee比12小，但是足以发起成功的交易，fee=10'
        {
            let testCase = framework.createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].fee = "10"
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0180\t发起带有效fee的交易_03: fee比12大但小于钱包余额'
        {
            let testCase = framework.createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].fee = "110"
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0190\t发起带无效fee的交易_01: fee比12小（比如5），但是不足以发起成功的交易，fee=9'
        {
            let testCase = framework.createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].fee = "9"
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    'tecINSUFF_FEE Insufficient balance to pay fee')
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0200\t发起带无效fee的交易_02: fee为0'
        {
            let testCase = framework.createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].fee = "0"
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    'tecINSUFF_FEE Insufficient balance to pay fee')
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0210\t发起带无效fee的交易_03: fee为大于0的小数，比如12.5、5.5'
        {
            let testCase = framework.createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].fee = "12.5"
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    'tecINSUFF_FEE Insufficient balance to pay fee')
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0220\t发起带无效fee的交易_04: fee为大于发起钱包' + categoryName + '余额的整数'
        {
            let testCase = framework.createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].fee = "999999999999999"
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    'telINSUF_FEE_P Fee insufficient')
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0230\t发起带无效fee的交易_05: fee为负数，比如-3.5、-555等'
        {
            let testCase = framework.createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].fee = "-35"
                // testCaseParams.expectedResult = framework.createExpecteResult(false, false,
                //     'tecINSUFF_FEE Insufficient balance to pay fee')
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    'tecINSUFF_FEE Insufficient balance to pay fee')
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0240\t发起带无效fee的交易_06: fee为数字'
        {
            let testCase = framework.createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
                testCaseParams.txParams[0].fee = 35
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    'interface conversion: interface {} is float64, not string')
            })
            framework.addTestCase(testCases, testCase)
        }
        //endregion

        return testCases
    },

    //endregion

    //region issue token tx

    createTestCasesForCreateToken: function(server, categoryName, txFunctionName, txParams){
        let testCases = []
        let testCaseParams = framework.createTestCaseParams(server, categoryName, txFunctionName, txParams)
        testCaseParams.restrictedLevel = restrictedLevel.L3

        //region test cases

        testCaseParams.title = '0270\t发行' + testCaseParams.categoryName
        {
            let testCase = framework.createTestCaseWhenSignPassAndSendRawTxPassForIssueToken(testCaseParams, function(){
                testCaseParams.expectedResult.expectedBalance = txParams[0].total_supply
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0290\t发行' + testCaseParams.categoryName + '_无效的type参数'
        {
            let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
                testCaseParams.txParams[0].type = "issuecoin"
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    'Invalid Number:  Reason: strconv.ParseUint: parsing "": invalid syntax')
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0300\t发行' + testCaseParams.categoryName + '_无效的from参数'
        {
            let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
                testCaseParams.txParams[0].from = "from.address"
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    'Bad account address: from.address: Bad Base58 string: from.address')
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0310\t发行' + testCaseParams.categoryName + '_无效的name参数:很长的字符串'
        {
            let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
                testCaseParams.txParams[0].name = "tokenName.name12345678901234567890tokenName.name12345678901234567890tokenName.name12345678901234567890" +
                    "tokenName.name12345678901234567890tokenName.name12345678901234567890tokenName.name12345678901234567890"
                testCaseParams.txParams[0].symbol = utility.getDynamicTokenName().symbol
                // testCaseParams.expectedResult = framework.createExpecteResult(false, false,
                //     'failed to submit transaction')
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    'failed to submit transaction')
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0310\t发行' + testCaseParams.categoryName + '_无效的name参数:被已有代币使用过的name'
        {
            let testCase = framework.createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
                testCaseParams.txParams[0].name = token.existToken.name
                // testCaseParams.expectedResult = framework.createExpecteResult(false, false,
                //         //     'failed to submit transaction')
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    'failed to submit transaction')
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0320\t发行' + testCaseParams.categoryName + '_无效的symbol参数:很长的字符串'
        {
            let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
                testCaseParams.txParams[0].symbol = "tokenName.symbolymboltokenN"
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    'symbol must be the characters with alphas[a-zA-Z], numbers[0-9], chinese characters[一-龥] and underscores[_]')
            })
            framework.addTestCase(testCases, testCase)
        }

        //todo it will cause no response, looks like no response from server.request
        testCaseParams.title = '0320\t发行' + testCaseParams.categoryName + '_无效的symbol参数:被已有代币使用过的symbol'
        {
            let testCase = framework.createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
                testCaseParams.txParams[0].symbol = token.existToken.symbol
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    'tefNO_PERMISSION_ISSUE No permission issue')
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0330\t发行' + testCaseParams.categoryName + '_无效的decimals参数:字符串'
        {
            let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
                testCaseParams.txParams[0].decimals = "config.decimals"
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    'decimals must be integer type(string) and in range [0, 18]')
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0330\t发行' + testCaseParams.categoryName + '_无效的decimals参数:负数'
        {
            let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
                testCaseParams.txParams[0].decimals = -8
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    'decimals must be integer type(string) and in range [0, 18]')
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0330\t发行' + testCaseParams.categoryName + '_无效的decimals参数:小数'
        {
            let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
                testCaseParams.txParams[0].decimals = 11.64
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    'decimals must be integer type(string) and in range [0, 18]')
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0340\t发行' + testCaseParams.categoryName + '_无效的total_supply参数:字符串'
        {
            let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
                testCaseParams.txParams[0].total_supply = "config.total_supply"
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    'total_supply must be integer type')
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0340\t发行' + testCaseParams.categoryName + '_无效的total_supply参数:负数'
        {
            let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
                testCaseParams.txParams[0].total_supply = -10000000
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    'invalid syntax')
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0340\t发行' + testCaseParams.categoryName + '_无效的total_supply参数:小数'
        {
            let testCase = framework.createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
                testCaseParams.txParams[0].total_supply = 10000.12345678
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    'strconv.ParseInt: parsing')
            })
            framework.addTestCase(testCases, testCase)
        }

        //endregion

        return testCases
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
                    testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                        'tefNO_PERMISSION_ISSUE No permission issue')
                })
            framework.addTestCase(testCases, testCase)
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
                    testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                        'tefNO_PERMISSION_ISSUE No permission issue')
                })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0420\t无效地销毁：销毁数量大于发行数量' + testCaseParams.categoryName
        {
            testCaseParams.otherParams.oldBalance = '49382716041'
            let testCase = framework.createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
                testCaseParams.txParams[0].total_supply = '-98765432100000000'
                let burnable = tcsSendAndSignTx.canBurn(testCaseParams.txParams[0].flags)
                testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                    burnable ? 'telINSUF_FUND Fund insufficient' : 'tefNO_PERMISSION_ISSUE No permission issue')
            })
            framework.addTestCase(testCases, testCase)
        }

        testCaseParams.title = '0380\t销毁所有' + testCaseParams.categoryName
        {
            let testCase = tcsSendAndSignTx.canBurn(testCaseParams.txParams[0].flags) ?
                framework.createTestCaseWhenSignPassAndSendRawTxPassForIssueToken(testCaseParams, function(){
                    if(testCaseParams.txParams[0].flags == consts.flags.burnable){
                        testCaseParams.txParams[0].total_supply = '-9876543191'
                    }
                    else if(testCaseParams.txParams[0].flags == consts.flags.both){  //it minted 9 more in above test case, so need add it.
                        // testCaseParams.txParams[0].total_supply =  '-9876543219'
                        testCaseParams.txParams[0].total_supply =  '-19753086410'
                    }
                    // testCaseParams.txParams[0].total_supply =  '-9876543191'

                    // let data = testCaseParams.txParams[0]
                    // let server = testCaseParams.server
                    // // logger.debug('++++' + JSON.stringify(data))
                    // server.getBalance(data.from, data.symbol).then(function(balance){
                    //   logger.debug('++++' + JSON.stringify(balance))
                    //   testCaseParams.txParams[0].total_supply = '-' + balance.value
                    // })

                    testCaseParams.expectedResult = framework.createExpecteResult(true)
                    testCaseParams.expectedResult.expectedBalance = 0
                })
                :
                framework.createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
                    testCaseParams.txParams[0].total_supply =  '-49382716041'
                    testCaseParams.expectedResult = framework.createExpecteResult(false, true,
                        'tefNO_PERMISSION_ISSUE No permission issue')
                })
            framework.addTestCase(testCases, testCase)
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

        testName = '测试交易memo'
        describeTitle = testName + '-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
        testCases = tcsSendAndSignTx.createTestCasesForTransactionWithMemo(server, categoryName, txFunctionName, txParams)
        framework.testTestCases(server, describeTitle, testCases)

        testName = '测试交易Fee'
        describeTitle = testName + '-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
        testCases = tcsSendAndSignTx.createTestCasesForTransactionWithFee(server, categoryName, txFunctionName, txParams)
        framework.testTestCases(server, describeTitle, testCases)
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

        //set created token properties
        // let tokenName = testCases[0].txParams[0].name
        // let tokenSymbol = testCases[0].txParams[0].symbol
        // let issuer = testCases[0].txParams[0].local ? testCases[0].txParams[0].from : addresses.defaultIssuer.address
        let txParam = txParams[0]
        let tokenName = txParam.name
        let tokenSymbol = txParam.symbol
        let issuer = txParam.local ? txParam.from : server.mode.addresses.defaultIssuer.address
        logger.debug("===create token: " + tokenSymbol)

        //token transfer
        let transferTxParams = framework.createTxParamsForTokenTransfer(server, account, tokenSymbol, issuer)
        describeTitle = '测试基本交易-[币种:' + transferTxParams[0].symbol + '] [方式:' + txFunctionName + ']'
        tcsSendAndSignTx.testForTransfer(server, categoryName, txFunctionName, transferTxParams)

        //mint token
        let mintTxParams = framework.createTxParamsForMintToken(server, account, configToken, tokenName, tokenSymbol)
        describeTitle = '测试增发-[币种:' + mintTxParams[0].symbol + '] [方式:' + txFunctionName + ']'
        testCases = tcsSendAndSignTx.createTestCasesForMintToken(server, categoryName, txFunctionName, mintTxParams)
        framework.testTestCases(server, describeTitle, testCases)

        //burn token
        describeTitle = '测试销毁-[币种:' + mintTxParams[0].symbol + '] [方式:' + txFunctionName + ']'
        testCases = tcsSendAndSignTx.createTestCasesForBurnToken(server, categoryName, txFunctionName, mintTxParams)
        framework.testTestCases(server, describeTitle, testCases)
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
        describeTitle = '测试增发-[币种:' + mintTxParams[0].symbol + '] [方式:' + txFunctionName + ']'
        testCases = tcsSendAndSignTx.createTestCasesForMintToken(server, categoryName, txFunctionName, mintTxParams)
        framework.testTestCases(server, describeTitle, testCases)

        //burn token
        describeTitle = '测试销毁-[币种:' + mintTxParams[0].symbol + '] [方式:' + txFunctionName + ']'
        testCases = tcsSendAndSignTx.createTestCasesForBurnToken(server, categoryName, txFunctionName, mintTxParams)
        framework.testTestCases(server, describeTitle, testCases)
    },

    testForIssueTokenInComplexMode: function(server, txFunctionName){
        let account = server.mode.addresses.sender3

        let configToken = token.config_normal
        describe(configToken.testName + '测试：' + txFunctionName, async function () {
            tcsSendAndSignTx.testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
        })

        configToken = token.config_mintable
        describe(configToken.testName + '测试：' + txFunctionName, async function () {
            tcsSendAndSignTx.testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
        })

        configToken = token.config_burnable
        describe(configToken.testName + '测试：' + txFunctionName, async function () {
            tcsSendAndSignTx.testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
        })

        configToken = token.config_mint_burn
        describe(configToken.testName + '测试：' + txFunctionName, async function () {
            tcsSendAndSignTx.testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
        })

        configToken = token.config_issuer_normal
        describe(configToken.testName + '测试：' + txFunctionName, async function () {
            tcsSendAndSignTx.testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
        })

        configToken = token.config_issuer_mintable
        describe(configToken.testName + '测试：' + txFunctionName, async function () {
            tcsSendAndSignTx.testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
        })

        configToken = token.config_issuer_burnable
        describe(configToken.testName + '测试：' + txFunctionName, async function () {
            tcsSendAndSignTx.testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
        })

        configToken = token.config_issuer_mint_burn
        describe(configToken.testName + '测试：' + txFunctionName, async function () {
            tcsSendAndSignTx.testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
        })

        configToken = token.CNYT
        describe(configToken.testName + '测试：' + txFunctionName, async function () {
            tcsSendAndSignTx.testForGlobalToken(server, configToken.testName, txFunctionName,
                server.mode.addresses.sender1, configToken)
        })

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