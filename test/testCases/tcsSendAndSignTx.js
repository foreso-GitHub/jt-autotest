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

const NativeCoinTest = '原生币SWT'

module.exports = tcsSendAndSignTx = {

    testForSendTxAndSignTx: function(server, describeTitle){
        describe(describeTitle, function (){
            let categoryName = ''
            let txFunctionName = ''
            let txParams = {}

            //region basic test

            categoryName = NativeCoinTest

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

    //region test for tx

    testForTransfer: function(server, categoryName, txFunctionName, txParams){
        let testName = ''
        let describeTitle = ''
        let testScripts = []

        testName = '测试基本交易'
        describeTitle = testName + '-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
        testScripts = tcsSendAndSignTx.createTestScriptsForBasicTransaction(server, categoryName, txFunctionName, txParams)
        framework.testTestScripts(server, describeTitle, testScripts)

        testName = '测试交易memo'
        describeTitle = testName + '-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
        testScripts = tcsSendAndSignTx.createTestScriptsForTransactionWithMemo(server, categoryName, txFunctionName, txParams)
        framework.testTestScripts(server, describeTitle, testScripts)

        testName = '测试交易Fee'
        describeTitle = testName + '-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
        testScripts = tcsSendAndSignTx.createTestScriptsForTransactionWithFee(server, categoryName, txFunctionName, txParams)
        framework.testTestScripts(server, describeTitle, testScripts)
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

    },

    testForIssueToken: function(server, categoryName, txFunctionName, account, configToken){
        let testName = ''
        let describeTitle = ''
        let testScripts = []
        let txParams = {}

        //create token
        testName = '测试创建token'
        describeTitle = testName + '-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
        txParams = framework.createTxParamsForIssueToken(server, account, configToken)
        testScripts = tcsSendAndSignTx.createTestScriptsForCreateToken(server, categoryName, txFunctionName, txParams)
        framework.testTestScripts(server, describeTitle, testScripts)

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
        let mintTxParams = framework.createTxParamsForMintToken(server, account, configToken, tokenName, tokenSymbol)
        let testScriptsList = tcsSendAndSignTx.createTestScriptsForMintToken(server, categoryName, txFunctionName, mintTxParams)
        //分成3部分，分別完成成功的增發交易，互相不干擾結果
        describeTitle = '测试增发1-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
        framework.testTestScripts(server, describeTitle, testScriptsList[0])
        describeTitle = '测试增发2-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
        framework.testTestScripts(server, describeTitle, testScriptsList[1])
        describeTitle = '测试增发3-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
        framework.testTestScripts(server, describeTitle, testScriptsList[2])

        //burn token
        describeTitle = '测试销毁-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
        testScripts = tcsSendAndSignTx.createTestScriptsForBurnToken(server, categoryName, txFunctionName, mintTxParams)
        framework.testTestScripts(server, describeTitle, testScripts)

        //burn all
        describeTitle = '测试销毁所有代币-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
        testScripts = tcsSendAndSignTx.createTestScriptsForBurnAll(server, categoryName, txFunctionName, mintTxParams)
        framework.testTestScripts(server, describeTitle, testScripts)
    },

    //endregion

    //region transfer tx

    createTestScriptsForBasicTransaction: function(server, type, txFunctionName, txParams){
        let testScripts = []
        let testCaseCode
        let scriptType = txFunctionName + '_' + type
        let defaultScriptCode = '000100_' + scriptType
        let scriptCode

        //region test cases for basic transfer

        testCaseCode = 'FCJT_sendTransaction_010010'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010020'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_1/SWT'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].value = "1/SWT"
            if(type == NativeCoinTest) framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010020'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000200_' + scriptType + '_1/swt'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].value = "1/swt"
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 't find currency'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            if(type == NativeCoinTest) framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010020'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000300_' + scriptType + '_1/Swt'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].value = "1/Swt"
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 't find currency'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            if(type == NativeCoinTest) framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010030'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].secret = null
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'No secret found for'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010030'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000200_' + scriptType + '_错误的秘钥1'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].secret = '错误的秘钥'
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'Unknown secret format'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010030'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000300_' + scriptType + '_错误的秘钥2'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].secret = testScript.actions[0].txParams[0].secret + '1'
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'Bad Base58 checksum'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010030'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000400_' + scriptType + '_不匹配的秘钥'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].secret = server.mode.addresses.walletAccount.secret
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'secret doesn\'t match with address'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010040'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_错误的发起钱包地址'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].from = testScript.actions[0].txParams[0].from + '1'
            testScript.actions[0].txParams[0].sequence = 1
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'Bad account address'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010050'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_错误的接收钱包地址'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].to = testScript.actions[0].txParams[0].to + '1'
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'Bad account address'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010060'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_交易额超过发起钱包余额'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            let rawValue = utility.parseShowValue(testScript.actions[0].txParams[0].value)
            let showValue = utility.getFullCurrency('12345678901' ,rawValue.symbol, rawValue.issuer)
            testScript.actions[0].txParams[0].value = showValue
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(rawValue.symbol == consts.default.nativeCoin ? -394 : -386,
                    rawValue.symbol == consts.default.nativeCoin ? 'Fee insufficient.' : 'Fund insufficient.'))
            framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010060'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000200_' + scriptType + '_交易额超过最大值'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            let rawValue = utility.parseShowValue(testScript.actions[0].txParams[0].value)
            let showValue = utility.getFullCurrency((consts.default.maxAmount + 1).toString() ,rawValue.symbol, rawValue.issuer)
            testScript.actions[0].txParams[0].value = showValue
            if(type == NativeCoinTest){
                let expectedResult = framework.createExpectedResult(false,
                    framework.getError(-394, 'Fee insufficient.'))
                framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)
            }
            else{
                let expectedResult = framework.createExpectedResult(false,
                    framework.getError(-278, 'error value, out of range'))
                framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            }
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010070'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            let rawValue = utility.parseShowValue(testScript.actions[0].txParams[0].value)
            let showSymbol = utility.getShowSymbol(rawValue.symbol, rawValue.issuer)
            testScript.actions[0].txParams[0].value = "-100" + showSymbol
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'value must be >= 0'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010080'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_交易额为空'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].value = null
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'value must be integer type'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010080'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000200_' + scriptType + '_交易额为字符串'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].value = "aawrwfsfs"
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'value must be integer type'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010090'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_不带currency，交易额为小于1(最小数额)的正小数'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].value = "0.0000001"
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'value must be integer type'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            if(type == NativeCoinTest) framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010090'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000200_' + scriptType + '_带currency，交易额为小于1的正小数'
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

        testCaseCode = 'FCJT_sendTransaction_010090'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000300_' + scriptType + '_带currency，交易额为小于最小数额的正小数'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            let rawValue = utility.parseShowValue(testScript.actions[0].txParams[0].value)
            let showSymbol = (rawValue.symbol != consts.default.nativeCoin)
                ? utility.getShowSymbol(rawValue.symbol, rawValue.issuer) : '/' + rawValue.symbol
            let decimals = ((rawValue.symbol == consts.default.nativeCoin)
                ? consts.default.nativeCoinDecimals : consts.default.tokenDecimals) + 1
            let showValue = Math.pow(0.1, decimals).toFixed(decimals)
            testScript.actions[0].txParams[0].value = showValue.toString() + showSymbol
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'error value'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)

        }

        testCaseCode = 'FCJT_sendTransaction_010100'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_不带currency，交易额为大于1(最小数额)的小数'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].value = "1.0000011"
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'value must be integer type'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            if(type == NativeCoinTest) framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010100'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000200_' + scriptType + '_带currency，交易额为大于1的小数'
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

        testCaseCode = 'FCJT_sendTransaction_010100'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000300_' + scriptType + '_带currency，交易额为10.000001/SWT或者10.00000001/Coin'
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

        testCaseCode = 'FCJT_sendTransaction_010110'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_交易额为负小数：-0.1、-1.23等'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            let rawValue = utility.parseShowValue(testScript.actions[0].txParams[0].value)
            let showSymbol = utility.getShowSymbol(rawValue.symbol, rawValue.issuer)
            testScript.actions[0].txParams[0].value = "-0.1" + showSymbol
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278,
                    rawValue.symbol == undefined || rawValue.symbol == 'SWT'
                        ? 'value must be integer type'
                        : 'value must be >= 0'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        //endregion

        return testScripts
    },

    createTestScriptsForTransactionWithMemo: function(server, type, txFunctionName, txParams){
        let testScripts = []
        let testCaseCode
        let scriptType = txFunctionName + '_' + type
        let defaultScriptCode = '000100_' + scriptType
        let scriptCode
        // if(txFunctionName == consts.rpcFunctions.sendTx) testCaseParams.supportedServices.push(serviceType.oldChain)

        //region test cases

        testCaseCode = 'FCJT_sendTransaction_010310'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_memo格式为："memos":["大家好"]'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].memos = ["大家好"]
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010310'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000200_' + scriptType + '_memo格式为奇数长度数字字串："memos":["12345"]'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].memos = ["12345"]
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010310'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000300_' + scriptType + '_memo格式为偶数长度数字字串："memos":["123456"]'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].memos = ["123456"]
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010310'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000400_' + scriptType + '_memo格式为字串："memos":["E5A4A7E5AEB6E5A5BDff"]'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].memos = ["E5A4A7E5AEB6E5A5BDff"]
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010320'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_memo格式为： "memos":[{"type":"ok","format":"utf8","data":"E5A4A7E5AEB6E5A5BD"}]'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].memos = [{"type":"ok","format":"utf8","data":"E5A4A7E5AEB6E5A5BD"}]
            framework.addTestScript(testScripts, testScript)
        }

        let memos_10k = utility.createMemosWithSpecialLength(10 * Math.pow(2, 10))
        let memos_900k = utility.createMemosWithSpecialLength(921600)
        let memos_901k = utility.createMemosWithSpecialLength(901 * Math.pow(2, 10))

        testCaseCode = 'FCJT_sendTransaction_010330'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_memo内容使整个交易内容正好900K'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].memos = memos_900k
            testScript.restrictedLevel = restrictedLevel.L5
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010330'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000200_' + scriptType  + '_memo内容使整个交易内容超过900K'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].memos = memos_901k
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'too large memo'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010330'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000300_' + scriptType  + '_memo内容使整个交易内容正好10K'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].memos = memos_10k
            testScript.restrictedLevel = restrictedLevel.L4
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010340'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_memo内容使整个交易内容正好900K'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)

            testScript.actions[0].txParams[0].memos = [{"type":"ok","format":"utf8","data":memos_900k[0]}]
            testScript.restrictedLevel = restrictedLevel.L5
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010340'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000200_' + scriptType  + '_memo内容使整个交易内容超过900K'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].memos = [{"type":"ok","format":"utf8","data":memos_901k[0]}]
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'too large memo'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010340'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000300_' + scriptType  + '_memo内容使整个交易内容正好10K'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].memos = [{"type":"ok","format":"utf8","data":memos_10k[0]}]
            testScript.restrictedLevel = restrictedLevel.L4
            framework.addTestScript(testScripts, testScript)
        }

        // endregion

        return testScripts
    },

    createTestScriptsForTransactionWithFee: function(server, type, txFunctionName, txParams){
        let testScripts = []
        let testCaseCode
        let scriptType = txFunctionName + '_' + type
        let defaultScriptCode = '000100_' + scriptType
        let scriptCode

        //region test cases

        testCaseCode = 'FCJT_sendTransaction_010510'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_fee为默认值10'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].fee = consts.default.fee.toString()
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010510'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000200_' + scriptType + '_不设fee,默认值10'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010520'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_fee比12小，但是足以发起成功的交易，fee=10'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].fee = "10"
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010530'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_fee比12大但小于钱包余额'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].fee = "20"
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010540'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_fee比10小（比如5），但是不足以发起成功的交易，fee=9'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].fee = "9"
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(136, 'Insufficient balance to pay fee.'))
            framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010550'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_fee为0'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].fee = "0"
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(136, 'Insufficient balance to pay fee.'))
            framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010560'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_fee为大于0的小数，比如12.5、5.5'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].fee = "12.5"
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'strconv.ParseUint'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010570'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_fee为大于发起钱包' + scriptType + '余额的整数'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].fee = consts.default.maxAmount.toString()
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-394, 'Fee insufficient.'))
            framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010580'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_fee为负数，比如-3.5、-555等'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].fee = "-35"
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'strconv.ParseUint'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010590'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_fee为字符串'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].fee = 'sdfahkdfjaskjf'
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'strconv.ParseUint'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_010590'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000200_' + scriptType + '_fee为数字'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].fee = 35
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'strconv.ParseUint'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        //endregion

        return testScripts
    },

    //endregion

    //region issue token tx

    createTestScriptsForCreateToken: function(server, type, txFunctionName, txParams){

        let testScripts = []
        let testCaseCode
        let scriptType = txFunctionName + '_' + type
        let defaultScriptCode = '000100_' + scriptType
        let scriptCode
        let symbolPostFix = 0
        let existToken = server.mode.coins[4]
        let from = txParams[0].from
        let total_supply = txParams[0].total_supply
        let symbol = txParams[0].symbol
        let issuer = txParams[0].local ? txParams[0].from : consts.default.issuer

        //region test cases

        testCaseCode = 'FCJT_sendTransaction_021010'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].expectedResults[0].expectedBalances =
                [{address: from, value: total_supply, symbol: symbol, issuer: issuer}]
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021020'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + scriptType + '_发行量为正小数，小数位数小于等于decimals'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + symbolPostFix++
            let newTotalSupply = 54321 + Math.pow(0.1, Number(testScript.actions[0].txParams[0].decimals))
            testScript.actions[0].txParams[0].total_supply = newTotalSupply.toString() + '/' + testScript.actions[0].txParams[0].symbol
            testScript.actions[0].expectedResults[0].expectedBalances =
                [{address: from, value: total_supply, symbol: symbol, issuer: issuer}]
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021030'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + scriptType + '_发行量为正小数，小数位数大于decimals'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + symbolPostFix++
            let newTotalSupply = 54321 + Math.pow(0.1, Number(testScript.actions[0].txParams[0].decimals) + 1)
            testScript.actions[0].txParams[0].total_supply = newTotalSupply.toString() + '/' + testScript.actions[0].txParams[0].symbol
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'error total_supply'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021040'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000200_' + scriptType + '_发行量是负数'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + symbolPostFix++
            testScript.actions[0].txParams[0].total_supply = '-1234567890'
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-175, 'No permission issue.'))
            framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021050'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + scriptType + 'total_supply格式与symbol不一致'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + symbolPostFix++
            let newTotalSupply = 54321 + Math.pow(0.1, Number(testScript.actions[0].txParams[0].decimals))
            testScript.actions[0].txParams[0].total_supply = newTotalSupply.toString() + '/NullCoin'
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'currency in total_supply is not matched with symbol,'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021060'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + scriptType + 'from参数为一个不存在的账户'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + symbolPostFix++
            testScript.actions[0].txParams[0].from = "from.address"
            testScript.actions[0].txParams[0].sequence = "1"
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-284, 'sequence must be positive integer'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021070'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_无效的name参数:很长的字符串，超过256字节'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + symbolPostFix++
            testScript.actions[0].txParams[0].name = utility.createMemosWithSpecialLength(257)[0]
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'The length of the name should be <= 256'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021070'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000200_' + scriptType + '_有效的name参数:很长的字符串，正好256字节'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + symbolPostFix++
            testScript.actions[0].txParams[0].name = utility.createMemosWithSpecialLength(256)[0]
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021070'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000300_' + scriptType + '_有效的name参数:被已有代币使用过的name'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + symbolPostFix++
            testScript.actions[0].txParams[0].name = existToken.name
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021080'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_无效的symbol参数:长度超过12字节'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + utility.createMemosWithSpecialLength(5)
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'the length of the symbol must be in the range [3,12]'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021080'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000200_' + scriptType + '_无效的symbol参数:被已有代币使用过的symbol'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            let root = server.mode.addresses.rootAccount
            testScript.actions[0].txParams[0].from = root.address
            testScript.actions[0].txParams[0].secret = root.secret
            testScript.actions[0].txParams[0].symbol = existToken.symbol
            testScript.actions[0].txParams[0].local = true
            testScript.actions[0].txParams[0].flag = consts.flags.normal
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'invalid parameter flag'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021080'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000300_' + scriptType + '_有效的symbol参数:长度正好12字节'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + utility.createMemosWithSpecialLength(4)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021090'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_无效的decimals参数:字符串'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + symbolPostFix++
            testScript.actions[0].txParams[0].decimals = "config.decimals"
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'decimals must be integer type(string) and in range [0, 18]'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021090'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000200_' + scriptType + '_无效的decimals参数:负数'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + symbolPostFix++
            testScript.actions[0].txParams[0].decimals = -8
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'decimals must be integer type(string) and in range [0, 18]'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021090'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000300_' + scriptType + '_无效的decimals参数:负数字符串'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + symbolPostFix++
            testScript.actions[0].txParams[0].decimals = '-8'
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'decimals must be integer type and in range [0, 18]'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021090'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000400_' + scriptType + '_无效的decimals参数:小数'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + symbolPostFix++
            testScript.actions[0].txParams[0].decimals = 11.64
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'decimals must be integer type(string) and in range [0, 18]'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021090'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000500_' + scriptType + '_无效的decimals参数:小数字符串'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + symbolPostFix++
            testScript.actions[0].txParams[0].decimals = '11.64'
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'decimals must be integer type(string) and in range [0, 18]'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021100'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_无效的total_supply参数:非数字字符串'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + symbolPostFix++
            testScript.actions[0].txParams[0].total_supply = "config.total_supply"
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'total_supply must be string type'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021100'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000200_' + scriptType + '_无效的total_supply参数:负数'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + symbolPostFix++
            testScript.actions[0].txParams[0].total_supply = -10000000
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'total_supply must be string type'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021100'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000300_' + scriptType + '_无效的total_supply参数:负数字符串'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + symbolPostFix++
            testScript.actions[0].txParams[0].total_supply = '-10000000'
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-175, 'No permission issue.'))
            framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021100'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000400_' + scriptType + '_无效的total_supply参数:小数'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + symbolPostFix++
            testScript.actions[0].txParams[0].total_supply = 10000.12345678
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'total_supply must be string type'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021100'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000500_' + scriptType + '_有效的total_supply参数:小数字符串'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + symbolPostFix++
            testScript.actions[0].txParams[0].total_supply = '10000.12345678'
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'total_supply must be string type'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021110'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000100_' + scriptType + '_total_supply正好900兆'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + symbolPostFix++
            testScript.actions[0].txParams[0].total_supply = '9000000000000000000'
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021110'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000200_' + scriptType + '_total_supply超过900兆'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + symbolPostFix++
            testScript.actions[0].txParams[0].total_supply = '9000000000000000001'
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'error total_supply, out of range'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_021120'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + scriptType + '_type参数为非IssueCoin'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].symbol = txParams[0].symbol + symbolPostFix++
            testScript.actions[0].txParams[0].type = "issuecoin"
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'error type issuecoin'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        //endregion

        return testScripts
    },

    createTestScriptsForMintToken: function(server, type, txFunctionName, txParams){

        let testScriptsList = []
        let testScripts = []
        let testCaseCode
        let scriptType = txFunctionName + '_' + type
        let defaultScriptCode = '000100_' + scriptType
        let scriptCode

        //region test cases

        //region list 1

        testCaseCode = 'FCJT_sendTransaction_022010'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            let param = testScript.actions[0].txParams[0]
            param.total_supply = '9'
            if(tcsSendAndSignTx.canMint(param.flags)){
                testScript.actions[0].expectedResults[0].expectedBalances =
                    [{address: param.from, value: '987654318900000006', symbol: param.symbol,
                    issuer: param.local ? param.from : consts.default.issuer}]
            }
            else{
                let expectedResult = framework.createExpectedResult(false,
                    framework.getError(-175, 'No permission issue.'))
                framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)
            }
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_022020'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_decimal不一致'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].total_supply = '9'
            testScript.actions[0].txParams[0].decimals = '9'
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'Invalid.'))
            framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_022020'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000200_' + scriptType + '_name不一致'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].total_supply = '9'
            testScript.actions[0].txParams[0].name = 'TestCoin_StrangeName'
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'Invalid.'))
            framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_022020'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000300_' + scriptType + '_非法flag'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].total_supply = '9'
            testScript.actions[0].txParams[0].flag = 1
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'invalid parameter flag'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_022020'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000400_' + scriptType + '_flag不一致'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].total_supply = '9'
            let flags = testScript.actions[0].txParams[0].flag
            testScript.actions[0].txParams[0].flag = flags == consts.flags.normal ? consts.flags.both : consts.flags.normal
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'invalid parameter flag'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testScriptsList.push(testScripts)

        //endregion

        //region list 2

        testScripts = []

        testCaseCode = 'FCJT_sendTransaction_022030'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_格式为100.5/USD，小数位数小于等于decimals'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            let param = testScript.actions[0].txParams[0]
            let issuer = param.local ? param.from : consts.default.issuer
            param.total_supply = '100.5/' + param.symbol
            if(tcsSendAndSignTx.canMint(param.flags)){
                testScript.actions[0].expectedResults[0].expectedBalances =
                    [{address: param.from, value: '987654328950000006', symbol: param.symbol, issuer: issuer}]
            }
            else{
                let expectedResult = framework.createExpectedResult(false,
                    framework.getError(-175, 'No permission issue.'))
                framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)
            }
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_022040'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_格式为100.5/USD，小数位数大于decimals'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            let param = testScript.actions[0].txParams[0]
            param.total_supply = '100.000000005/' + param.symbol
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'error total_supply'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_022050'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_symbol不一致'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            let param = testScript.actions[0].txParams[0]
            param.total_supply = '1/nosymbol'
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'currency in total_supply is not matched with symbol'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_022060'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_增发量可使代币总量超过900兆'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            let param = testScript.actions[0].txParams[0]
            param.total_supply = '9000000000000000000'
            if(param.flags != consts.flags.normal){
                let expectedResult = framework.createExpectedResult(false,
                    framework.getError(-385, 'Cannot exceed the maximum total supply number.'))
                framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)
            }
            else{
                let expectedResult = framework.createExpectedResult(false,
                    framework.getError(-175, 'No permission issue.'))
                framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)
            }
            framework.addTestScript(testScripts, testScript)
        }

        testScriptsList.push(testScripts)

        //endregion

        //region list 3

        testScripts = []

        testCaseCode = 'FCJT_sendTransaction_022070'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_flags为增发参数'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            let param = testScript.actions[0].txParams[0]
            let issuer = param.local ? param.from : consts.default.issuer
            param.total_supply = '1'
            param.flags = consts.flags.mintable
            if(type == consts.coinTypes.local_mintable || type == consts.coinTypes.global_mintable){
                testScript.actions[0].expectedResults[0].expectedBalances =
                    [{address: param.from, value: '987654328950000007', symbol: param.symbol, issuer: issuer}]
            }
            else{
                let expectedResult = framework.createExpectedResult(false,
                    framework.getError(-277, 'The transaction has an invalid flag.'))
                framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)
            }
            framework.addTestScript(testScripts, testScript)
        }

        testScriptsList.push(testScripts)

        //endregion

        //endregion

        return testScriptsList
    },

    createTestScriptsForBurnToken: function(server, type, txFunctionName, txParams){

        let testScripts = []
        let testCaseCode
        let scriptType = txFunctionName + '_' + type
        let defaultScriptCode = '000100_' + scriptType
        let scriptCode

        //region test cases

        testCaseCode = 'FCJT_sendTransaction_023010'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_销毁代币'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].total_supply = '-9'
            if(!tcsSendAndSignTx.canBurn(testScript.actions[0].txParams[0].flags)){
                let expectedResult = framework.createExpectedResult(false,
                    framework.getError(-175, 'No permission issue.'))
                framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)
            }
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_023020'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_销毁代币,格式是"-100/USD"'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].total_supply = '-9/' + testScript.actions[0].txParams[0].symbol
            if(!tcsSendAndSignTx.canBurn(testScript.actions[0].txParams[0].flags)){
                let expectedResult = framework.createExpectedResult(false,
                    framework.getError(-175, 'No permission issue.'))
                framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)
            }
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_023030'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000200_' + scriptType + '_销毁代币:decimal不一致'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].total_supply = '-9'
            testScript.actions[0].txParams[0].decimals = '9'
            let expectedResult
            if(tcsSendAndSignTx.canBurn(testScript.actions[0].txParams[0].flags)){
                expectedResult = framework.createExpectedResult(false,
                    framework.getError(-278, 'Invalid.'))
            }
            else{
                expectedResult = framework.createExpectedResult(false,
                    framework.getError(-175, 'No permission issue.'))
            }
            framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_023030'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000300_' + scriptType + '_销毁代币:name不一致'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].total_supply = '-9'
            testScript.actions[0].txParams[0].name = 'TestCoin_StrangeName'
            let expectedResult
            if(tcsSendAndSignTx.canBurn(testScript.actions[0].txParams[0].flags)){
                expectedResult = framework.createExpectedResult(false,
                    framework.getError(-278, 'Invalid.'))
            }
            else{
                expectedResult = framework.createExpectedResult(false,
                    framework.getError(-175, 'No permission issue.'))
            }
            framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_023030'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000400_' + scriptType + '_销毁代币:flag不一致'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].total_supply = '-9'
            testScript.actions[0].txParams[0].flag = 1
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'invalid parameter flag'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_023040'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000100_' + scriptType + '_销毁代币:小数位数小于等于decimals'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].total_supply = '-9.00000001/' + testScript.actions[0].txParams[0].symbol
            let expectedResult
            if(!tcsSendAndSignTx.canBurn(testScript.actions[0].txParams[0].flags)){
                expectedResult = framework.createExpectedResult(false,
                    framework.getError(-175, 'No permission issue.'))
                framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)
            }
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_023050'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000100_' + scriptType + '_销毁代币:小数位数小于等于decimals'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].total_supply = '-9.000000001/' + testScript.actions[0].txParams[0].symbol
            let expectedResult
            expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'error total_supply'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_023060'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000100_' + scriptType + '_销毁代币:symbol不一致'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].total_supply = '-9/nosymbol'
            let expectedResult
            expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'currency in total_supply is not matched with symbol'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_023070'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_无效地销毁：销毁数量大于发行数量'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].otherParams.oldBalance = '49382716041'
            testScript.actions[0].txParams[0].total_supply = '-997654319900000000'
            let expectedResult
            if(tcsSendAndSignTx.canBurn(testScript.actions[0].txParams[0].flags)){
                expectedResult = framework.createExpectedResult(false,
                    framework.getError(-228, 'Insufficient total supply to burn.'))
            }
            else{
                expectedResult = framework.createExpectedResult(false,
                    framework.getError(-175, 'No permission issue.'))
            }
            framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_023080'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = '000200_' + scriptType + '_销毁代币:无效的type参数'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].txParams[0].total_supply = '-9'
            testScript.actions[0].txParams[0].type = 'issuecoin'
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-278, 'error type issuecoin'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        //endregion

        return testScripts
    },

    createTestScriptsForBurnAll: function(server, type, txFunctionName, txParams){

        let testScripts = []
        let testCaseCode
        let scriptType = txFunctionName + '_' + type
        let defaultScriptCode = '000100_' + scriptType
        let scriptCode

        //region test cases

        testCaseCode = 'FCJT_sendTransaction_023070'
        testCaseCode = tcsSendAndSignTx.processTestCaseCode(testCaseCode, type)
        scriptCode = defaultScriptCode + '_销毁所有'
        {
            let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams)
            testScript.actions[0].executeFunction = tcsSendAndSignTx.executeBurnAllOfSendTx
            if(!tcsSendAndSignTx.canBurn(testScript.actions[0].txParams[0].flags)){
                let expectedResult = framework.createExpectedResult(false,
                    framework.getError(-175, 'No permission issue.'))
                framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)
            }
            else{
                testScript.actions[0].expectedResults[0].expectedBalances =
                    [{address: txParams[0].from, value: '0', symbol: txParams[0].symbol,
                        issuer: txParams[0].local ? txParams[0].from : consts.default.issuer}]
            }
            framework.addTestScript(testScripts, testScript)
        }

        //endregion

        return testScripts
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

    beforeBurnAll: async function(action){
        let param = action.txParams[0]
        let balance = await action.server.getBalance(action.server, param.from, param.symbol,
            param.local ? param.from : consts.default.issuer)
        action.txParams[0].total_supply = '-' + balance.value.toString()
    },

    executeBurnAllOfSendTx: function(action){
        return framework.executeTestActionOfTx(action, tcsSendAndSignTx.beforeBurnAll)
    },

    //endregion

    //region process test case code

    createTestScriptForTx: function(server, testCaseCode, scriptCode, txFunctionName, txParams){

    },

    processTestCaseCode: function(testCaseCode, coinType){
        let prefix
        if(coinType == consts.coinTypes.global_normal){
            prefix = 'FCJT_sendTransaction_02'
        }
        else if(coinType == consts.coinTypes.global_mintable){
            prefix = 'FCJT_sendTransaction_03'
        }
        else if(coinType == consts.coinTypes.global_burnable){
            prefix = 'FCJT_sendTransaction_04'
        }
        else if(coinType == consts.coinTypes.global_both){
            prefix = 'FCJT_sendTransaction_05'
        }
        else if(coinType == consts.coinTypes.local_normal){
            prefix = 'FCJT_sendTransaction_06'
        }
        else if(coinType == consts.coinTypes.local_mintable){
            prefix = 'FCJT_sendTransaction_07'
        }
        else if(coinType == consts.coinTypes.local_burnable){
            prefix = 'FCJT_sendTransaction_08'
        }
        else if(coinType == consts.coinTypes.local_both){
            prefix = 'FCJT_sendTransaction_09'
        }
        else{
            prefix = 'FCJT_sendTransaction_01'
            // throw Error('No such coin type! ' + coinType)
        }

        let newCode = testCaseCode
            .replace('FCJT_sendTransaction_01', prefix)
            .replace('FCJT_sendTransaction_02', prefix)

        return newCode
    }

    //endregion

}
