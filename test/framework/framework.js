//region require
const chai = require("chai")
chai.use(require("chai-json-schema"))
const expect = chai.expect
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let HashMap = require('hashmap')
let utility = require("./testUtility.js")
const schema = require("./schema.js")
const consts = require('./lib/base/consts')
const { chains, data, token, txs, blocks, ipfs_data } = require("../testData/testData")
const { chainDatas } = require("../testData/chainDatas")
let { modeAccounts } = require('../testData/accounts')
const AccountsDealer = require('../utility/accountsDealer')
const { configCommons, modes, } = require("../config")
const { responseStatus,  serviceType,  interfaceType,  testMode,  restrictedLevel, } = require("./enums")
const status = responseStatus
const testModeEnums = testMode
//endregion

//region global fields
const HASH_LENGTH = 64
const IPFS_HASH_LENGTH = 46
let _SequenceMap = new HashMap()
let _FullTestCaseList = []
let accountsDealer = new AccountsDealer()
let START
let END
//endregion

module.exports = framework = {

    //region auto test framework

    //region 1. create test cases

    //region create txParams

    createTestCaseParams: function(server, categoryName, txFunctionName, txParams){
    let testCaseParams = {}
    testCaseParams.server = server
    testCaseParams.categoryName = categoryName
    testCaseParams.txFunctionName = txFunctionName
    testCaseParams.title = ''
    testCaseParams.originalTxParams = txParams
    testCaseParams.txParams = framework.cloneParamsAarry(txParams)
    testCaseParams.otherParams = {}
    testCaseParams.executeFunction = framework.executeTestCaseOfSendTx
    testCaseParams.checkFunction = framework.checkTestCaseOfSendTx
    testCaseParams.expectedResult = framework.createExpecteResult(true)
    testCaseParams.testCase = {}
    testCaseParams.symbol = testCaseParams.txParams[0].symbol
    testCaseParams.showSymbol = (testCaseParams.txParams[0].showSymbol) ? testCaseParams.txParams[0].showSymbol : ''
    if(txFunctionName === consts.rpcFunctions.sendTx) {
        testCaseParams.executeFunction = framework.executeTestCaseOfSendTx
        testCaseParams.checkFunction = framework.checkTestCaseOfSendTx
    }
    else if(txFunctionName === consts.rpcFunctions.signTx){
        testCaseParams.executeFunction = framework.executeTestCaseOfSignTxAndSendRawTx
        testCaseParams.checkFunction = framework.checkTestCaseOfSignTxAndSendRawTx
    }
    else{
        throw new Error('txFunctionName doesn\'t exist!')
    }
    testCaseParams.restrictedLevel = restrictedLevel.L2
    testCaseParams.supportedServices = [serviceType.newChain]
    testCaseParams.supportedInterfaces = []
    return testCaseParams
},

    createTestCase: function(title, server, txFunctionName, txParams, otherParams, executeFunction, checkFunction, expectedResult,
                            restrictedLv, supportedServices, supportedInterfaces){
        let testCase = {}
        testCase.type = "it"
        if(title) testCase.title = title
        if(server) testCase.server = server
        if(txFunctionName) testCase.txFunctionName = txFunctionName
        if(txParams) testCase.txParams = txParams
        if(otherParams) testCase.otherParams = otherParams
        if(executeFunction) testCase.executeFunction = executeFunction
        if(checkFunction) testCase.checkFunction = checkFunction
        if(expectedResult) testCase.expectedResult = expectedResult
        testCase.hasExecuted = false
        testCase.actualResult = []
        testCase.restrictedLevel = (restrictedLv != null) ? restrictedLv : restrictedLevel.L2
        testCase.supportedServices = (supportedServices) ? utility.cloneArray(supportedServices) : []
        testCase.supportedInterfaces = (supportedInterfaces) ? utility.cloneArray(supportedInterfaces) : []
        testCase.checks = []
        return testCase
    },

    createTestCaseByParams: function(testCaseParams){
        return framework.createTestCase(testCaseParams.title, testCaseParams.server,
            testCaseParams.txFunctionName, testCaseParams.txParams, testCaseParams.otherParams,
            testCaseParams.executeFunction, testCaseParams.checkFunction, testCaseParams.expectedResult,
            testCaseParams.restrictedLevel, testCaseParams.supportedServices, testCaseParams.supportedInterfaces)
    },

    createTxParamsForTransfer: function(server){
        return server.createTransferParams(server.mode.addresses.sender1.address, server.mode.addresses.sender1.secret, null,
            server.mode.addresses.receiver1.address, '0.000015', '0.00001', ['autotest: transfer test'])
    },

    createTxParamsForIssueToken: function(server, account, token){
        // 参考”发起底层币无效交易“的测试用例
        // "flags":        float64(data.TxCoinMintable | data.TxCoinBurnable)
        // TxCoinMintable  TransactionFlag = 0x00010000 (65536)
        // TxCoinBurnable  TransactionFlag = 0x00020000 (131072)
        // Mintable+Burnable  TransactionFlag = 0x00030000  (196608)
        // Neither Mintable nor Burnable  TransactionFlag = 0x00000000  (0)
        // "local":true 表示发的是带issuer的币，类似这种100/CNY/jGr9kAJ1grFwK4FtQmYMm5MRnLzm93CV9C

        let tokenName = utility.getDynamicTokenName()
        return server.createIssueTokenParams(account.address, account.secret, null,
            tokenName.name, tokenName.symbol, token.decimals, token.total_supply, token.local, token.flags)
    },

    createTxParamsForTokenTransfer: function(server, account, symbol, issuer){
        let tokenParams = server.createTransferParams(account.address, account.secret, null,
            server.mode.addresses.receiver1.address, '1', '0.00001', ['autotest: token test'])
        tokenParams[0].symbol = symbol
        tokenParams[0].issuer = issuer
        tokenParams[0].showSymbol = utility.getShowSymbol(symbol, issuer)
        tokenParams[0].value = '1' + tokenParams[0].showSymbol
        return tokenParams
    },

    // example
    // {"jsonrpc":"2.0","id":7,"method":"jt_sendTransaction","params":[{"type":"IssueCoin","from":"jPdevNK8NeYSkg3TrWZa8eT6BrSp2oteUh","secret":"ssSLJReyitmAELQ3E3zYpZti1YuRe","name":"TestCoin1578886708","symbol":"5e1be634","decimals":8,"total_supply":"9876543210","local":false,"flags":65536,"fee":"10",
    //   "sequence":5620	}]}
    createTxParamsForMintToken: function(server, account, token, tokenName, tokenSymbol){
        return server.createIssueTokenParams(account.address, account.secret, null,
            tokenName, tokenSymbol, token.decimals, token.total_supply, token.local, token.flags)
    },

    createExpecteResult: function(needPass, isErrorInResult, expectedError){
        let expectedResult = {}
        expectedResult.needPass = needPass
        expectedResult.isErrorInResult = isErrorInResult != null ? isErrorInResult : true;
        expectedResult.expectedError = expectedError
        return expectedResult
    },
    //endregion

    //region common create method for sendTx and signTx

    addTestCaseForSendRawTx: function(testCaseOfSignTx, expectedResultOfSendRawTx){
        let txFunctionName = consts.rpcFunctions.sendRawTx
        let testCaseOfSendRawTx = framework.createTestCase(testCaseOfSignTx.title + '-' + txFunctionName, testCaseOfSignTx.server,
            txFunctionName, null,null, null, null, expectedResultOfSendRawTx,
            testCaseOfSignTx.restrictedLevel, testCaseOfSignTx.supportedServices, testCaseOfSignTx.supportedInterfaces)
        testCaseOfSignTx.subTestCases = []
        testCaseOfSignTx.subTestCases.push(testCaseOfSendRawTx)
    },

    //region 当jt_sendTransaction和jt_signTransaction都通过测试时

    createTestCaseWhenSignPassAndSendRawTxPass: function(testCaseParams, updateTxParamsFunction){
        testCaseParams.txParams = framework.cloneParamsAarry(testCaseParams.originalTxParams)
        updateTxParamsFunction()
        // testCaseParams.expectedResult = framework.createExpecteResult(true)
        let testCase = framework.createTestCaseByParams(testCaseParams)
        if(testCaseParams.txFunctionName === consts.rpcFunctions.signTx) {
            let expectedResultOfSendRawTx = framework.createExpecteResult(true)
            framework.addTestCaseForSendRawTx(testCase, expectedResultOfSendRawTx)
        }
        return testCase
    },

    createTestCaseWhenSignPassAndSendRawTxPassForTransfer: function(testCaseParams, updateTxParamsFunction){
        return framework.createTestCaseWhenSignPassAndSendRawTxPass(testCaseParams, updateTxParamsFunction)
    },

    createTestCaseWhenSignPassAndSendRawTxPassForIssueToken: function(testCaseParams, updateTxParamsFunction){
        return framework.createTestCaseWhenSignPassAndSendRawTxPass(testCaseParams, updateTxParamsFunction)
    },

    //endregion

    //region 当jt_sendTransaction和jt_signTransaction都通不过测试时

    createTestCaseWhenSignFail: function(testCaseParams, updateTxParamsFunction){
        testCaseParams.txParams = framework.cloneParamsAarry(testCaseParams.originalTxParams)
        updateTxParamsFunction()
        let testCase = framework.createTestCaseByParams(testCaseParams)
        return testCase
    },

    createTestCaseWhenSignFailForTransfer: function(testCaseParams, updateTxParamsFunction){
        return framework.createTestCaseWhenSignFail(testCaseParams, updateTxParamsFunction)
    },

    createTestCaseWhenSignFailForIssueToken: function(testCaseParams, updateTxParamsFunction){
        return framework.createTestCaseWhenSignFail(testCaseParams, updateTxParamsFunction)
    },

    //endregion

    //region 当jt_signTransaction，sign可以通过，但sendRawTx会出错的情况的处理：这时sendRawTx的期望出错结果和jt_sendTransaction的期望出错结果一致。

    createTestCaseWhenSignPassButSendRawTxFail: function(testCaseParams, updateTxParamsFunction){
        testCaseParams.txParams = framework.cloneParamsAarry(testCaseParams.originalTxParams)
        updateTxParamsFunction()
        let testCase = framework.createTestCaseByParams(testCaseParams)
        if(testCaseParams.txFunctionName === consts.rpcFunctions.signTx) {
            let expectedResultOfSignTx = framework.createExpecteResult(true)
            testCase.expectedResult = expectedResultOfSignTx
            framework.addTestCaseForSendRawTx(testCase, testCaseParams.expectedResult)
        }
        return testCase
    },

    createTestCaseWhenSignPassButSendRawTxFailForTransfer: function(testCaseParams, updateTxParamsFunction){
        return framework.createTestCaseWhenSignPassButSendRawTxFail(testCaseParams, updateTxParamsFunction)
    },

    createTestCaseWhenSignPassButSendRawTxFailForIssueToken: function(testCaseParams, updateTxParamsFunction){
        return framework.createTestCaseWhenSignPassButSendRawTxFail(testCaseParams, updateTxParamsFunction)
    },

    //endregion

    //endregion

    //region common
    addTestCase: function(testCases, testCase){
        if(framework.ifNeedExecuteOrCheck(testCase)){
            testCases.push(testCase)
            _FullTestCaseList.push(testCase)
            // logger.debug('====== _FullTestCaseList Count ======')
            // logger.debug(_FullTestCaseList.length)
        }
    },
    //endregion

    //endregion

    //region 2. execute test cases

    //region for send
    executeTestCaseOfCommon: function(testCase, specialExecuteFunction){
        return new Promise(function(resolve){
            let server = testCase.server
            let data = testCase.txParams[0]
            let from = data.from
            framework.getSequence(server, from).then(function(sequence){
                if(data.sequence == null){
                    data.sequence = isNaN(sequence) ? 1 : sequence
                }
                server.getBalance(server, data.from, data.symbol).then(function(balanceBeforeExecution){
                    testCase.balanceBeforeExecution = balanceBeforeExecution ? balanceBeforeExecution : 0
                    logger.debug("balanceBeforeExecution:" + JSON.stringify(testCase.balanceBeforeExecution))
                    framework.executeTxByTestCase(testCase).then(function(response){
                        specialExecuteFunction(testCase, response, resolve)
                    })
                })
            })
        })
    },

    executeTestCaseOfSendTx: function(testCase){
        testCase.hasExecuted = true
        return framework.executeTestCaseOfCommon(testCase, function(testCase, response, resolve){
            framework.addSequenceAfterResponseSuccess(response, testCase)
            // testCase.hasExecuted = true
            testCase.actualResult.push(response)
            resolve(testCase)
        })
    },

    executeTestCaseOfSignTxAndSendRawTx: function(testCase){
        testCase.hasExecuted = true
        return framework.executeTestCaseOfCommon(testCase, function(testCase, responseOfSign, resolve){
            // testCase.hasExecuted = true
            testCase.actualResult.push(responseOfSign)
            if(responseOfSign.status === status.success){
                if(testCase.expectedResult.needPass){
                    if(!testCase.subTestCases || testCase.subTestCases.length == 0){
                        testCase.executionResult = false
                        resolve(responseOfSign)
                    }
                    else{
                        let rawTx = testCase.actualResult[0].result[0]
                        if(rawTx && rawTx.length > 0){
                            let data = []
                            data.push(rawTx)
                            let testCaseOfSendRawTx = testCase.subTestCases[0]
                            testCaseOfSendRawTx.txParams = data
                            testCaseOfSendRawTx.hasExecuted = true
                            framework.executeTestCaseOfCommonFunction(testCaseOfSendRawTx).then(function(responseOfSendRawTx){
                                // testCaseOfSendRawTx.hasExecuted = true
                                testCaseOfSendRawTx.actualResult.push(responseOfSendRawTx)
                                framework.addSequenceAfterResponseSuccess(responseOfSendRawTx, testCase)
                                resolve(responseOfSendRawTx)
                            })
                        }
                        else{
                            testCase.executionResult = false
                            resolve(responseOfSign)
                        }
                    }
                }
                else{
                    resolve(responseOfSign)
                }
            }
            else{
                resolve(responseOfSign)
            }
        })
    },

    //if send tx successfully, then sequence need plus 1
    addSequenceAfterResponseSuccess: function(response, testCase){
        let data = testCase.txParams[0]
        let serverName = testCase.server.getName()
        if(response.status === status.success){
            framework.setSequence(serverName, data.from, data.sequence + 1)  //if send tx successfully, then sequence need plus 1
        }
    },
    //endregion

    //region for get

    executeTestCaseForGet: function(testCase){
        testCase.hasExecuted = true
        return new Promise(async (resolve, reject) => {
            framework.executeTxByTestCase(testCase).then(function(response){
                // testCase.hasExecuted = true
                testCase.actualResult.push(response)
                resolve(testCase)
            }, function (error) {
                logger.debug(error)
                expect(false).to.be.ok
            })
        })
    },

    //endregion

    //region common execute

    executeTxByTestCase: function(testCase){
        logger.debug(testCase.title)
        return testCase.server.getResponse(testCase.server, testCase.txFunctionName, testCase.txParams)
    },

    //region execute the function which will NOT write block like jt_signTransaction

    executeTestCaseOfCommonFunction: function(testCase){
        testCase.hasExecuted = true
        return new Promise(function(resolve){
            framework.executeTxByTestCase(testCase).then(function(response){
                // testCase.hasExecuted = true
                testCase.actualResult.push(response)
                resolve(response)
            })
        })
    },

    //endregion,

    //endregion

    //endregion

    //region 3. check test cases

    //region check send tx result
    checkTestCaseOfSendTx: async function(testCase){
        await framework.checkResponseOfTransfer(testCase, testCase.txParams)
    },

    checkResponseOfCommon: async function(testCase, txParams, checkFunction){
        await framework.checkSingleResponseOfCommonOneByOne(testCase, txParams, checkFunction, 0)
    },

    checkSingleResponseOfCommonOneByOne: async function(testCase, txParams, checkFunction, index){
        await framework.checkSingleResponseOfCommon(testCase, testCase.actualResult[index], txParams, checkFunction)
        index++
        if(index < testCase.actualResult.length){
            await framework.checkSingleResponseOfCommonOneByOne(testCase, txParams, checkFunction, index)
        }
    },

    checkSingleResponseOfCommon: async function(testCase, responseOfSendTx, txParams, checkFunction){
        framework.checkResponse(testCase.expectedResult.needPass, responseOfSendTx)

        //todo need remove OLD_SENDTX_SCHEMA when new chain updates its sendTx response
        if(testCase.server.mode.service == serviceType.newChain){
            if(testCase.expectedResult.needPass){
                expect(responseOfSendTx).to.be.jsonSchema(schema.OLD_SENDTX_SCHEMA)
                let hash = responseOfSendTx.result[0]
                // expect(responseOfSendTx).to.be.jsonSchema(schema.SENDTX_SCHEMA)
                // let hash = responseOfSendTx.result[0]
                // let hash = responseOfSendTx.result.tx_json.hash  //for swtclib
                await framework.getTxByHash(testCase.server, hash, 0).then(async function(responseOfGetTx){
                    framework.checkResponse(true, responseOfGetTx)
                    // expect(responseOfGetTx.result).to.be.jsonSchema(schema.TX_SCHEMA)
                    expect(responseOfGetTx.result.hash).to.be.equal(hash)
                    await checkFunction(testCase, txParams, responseOfGetTx.result)
                }, function (err) {
                    expect(err).to.be.ok
                })
            }
            else{
                let expectedResult = testCase.expectedResult
                expect((expectedResult.isErrorInResult) ? responseOfSendTx.result : responseOfSendTx.message).to.contains(expectedResult.expectedError)
            }
        }
        else{
            if(testCase.expectedResult.needPass){
                expect(responseOfSendTx).to.be.jsonSchema(schema.SENDTX_SCHEMA)
                let hash = responseOfSendTx.result.hash  //for swtclib
                await framework.getTxByHash(testCase.server, hash, 0).then(async function(responseOfGetTx){
                    framework.checkResponse(true, responseOfGetTx)
                    // expect(responseOfGetTx.result).to.be.jsonSchema(schema.TX_SCHEMA)
                    expect(responseOfGetTx.result.hash).to.be.equal(hash)
                    await checkFunction(testCase, txParams, responseOfGetTx.result)
                }, function (err) {
                    expect(err).to.be.ok
                })
            }
            else{
                expect(responseOfSendTx).to.be.jsonSchema(schema.SENDTX_SCHEMA)
                let expectedResult = testCase.expectedResult.expectedError
                framework.compareEngineResults(expectedResult, responseOfSendTx.result)
            }
        }
    },

    compareEngineResults: function(result1, result2){
        expect(result2.engine_result).to.equals(result1.engine_result)
        expect(result2.engine_result_code).to.equals(result1.engine_result_code)
        expect(result2.engine_result_message).to.equals(result1.engine_result_message)
    },

    checkResponseOfTransfer: async function(testCase, txParams){
        await framework.checkResponseOfCommon(testCase, txParams, async function(testCase, txParams, tx){
            let params = txParams[0]
            await framework.compareActualTxWithTxParams(params, tx, testCase.server.mode)

            if(testCase.server.mode.restrictedLevel >= restrictedLevel.L5){
                let expectedBalance = testCase.expectedResult.expectedBalance
                if(expectedBalance){
                    let server = testCase.server
                    let from = params.from
                    let symbol = params.symbol
                    await framework.checkBalanceChange(server, from, symbol, expectedBalance)
                }
            }
        })
    },

    getBalanceValue: function(balanceObject){
        if(balanceObject){
            if(balanceObject.value){
                return Number(balanceObject.value.toString())
            }
            else{
                return Number(balanceObject.toString())
            }
        }
        else{
            return 0
        }
    },

    checkTestCaseOfMintOrBurn: async function(testCase){
        await framework.checkResponseOfCommon(testCase, testCase.txParams, async function(testCase, txParams, tx){
            let params = txParams[0]
            await testCase.server.getBalance(testCase.server, params.from, params.symbol).then(function(balanceAfterExecution){
                testCase.balanceAfterExecution = balanceAfterExecution
                oldBalance = framework.getBalanceValue(testCase.balanceBeforeExecution)
                newBalance = framework.getBalanceValue(testCase.balanceAfterExecution)
                if(params.type === consts.rpcParamConsts.issueCoin){
                    expect(newBalance).to.be.equals(newBalance + Number(params.total_supply))
                }
                else{
                    expect(newBalance).to.be.equals(newBalance + Number(params.value))
                }

                logger.debug("balanceAfterExecution:" + JSON.stringify(testCase))
                logger.debug("balanceAfterExecution, symbol:" + params.symbol)
                logger.debug("balanceAfterExecution:" + JSON.stringify(balanceAfterExecution))

                expect(false).to.be.ok
            })
            // expect(true).to.be.ok
        })
    },

    compareActualTxWithTxParams: function(txParams, tx, mode){
        return new Promise(function(resolve){
            expect(tx.Account).to.be.equals(txParams.from)
            expect(tx.Destination).to.be.equals(txParams.to)

            let expectedFee
            let expectedValue
            if(mode.service == serviceType.oldChain){
                expectedFee = mode.defaultFee
                expectedValue = Number(txParams.value) * 1000000
            }
            else
            {
                expectedFee = (txParams.fee) ? txParams.fee : mode.defaultFee
                expectedValue = Number(txParams.value)
            }

            expect(tx.Fee).to.be.equals(expectedFee.toString())
            //check value
            if(txParams.type == consts.rpcParamConsts.issueCoin){
                expect(tx.Name).to.be.equals(txParams.name)
                expect(tx.Decimals).to.be.equals(Number(txParams.decimals))
                expect(tx.TotalSupply.value).to.be.equals(txParams.total_supply)
                expect(tx.TotalSupply.currency).to.be.equals(txParams.symbol)
                expect(tx.TotalSupply.issuer).to.be.equals((txParams.local) ? txParams.from : server.mode.addresses.defaultIssuer.address)
                if(mode.restrictedLevel >= restrictedLevel.L5) expect(tx.Flags).to.be.equals(txParams.flags)  //todo need restore
            }
            else{
                if(txParams.symbol){
                    expect(tx.Amount.currency).to.be.equals(txParams.symbol)
                    expect(tx.Amount.value + "/" + tx.Amount.currency + "/" + tx.Amount.issuer).to.be.equals(txParams.value)
                }
                else{
                    // expect(Number(tx.Amount)).to.be.equals(Number(txParams.value))
                    expect(Number(tx.Amount)).to.be.equals(expectedValue)
                }
            }
            //check memos, only in new chain
            if(txParams.memos != null){
                let memos = tx.Memos
                let expectedMemos = txParams.memos
                for(let i = 0; i < expectedMemos.length; i++){
                    let expectedMemo = expectedMemos[i]
                    if(typeof expectedMemo == "string"){
                        expect(utility.hex2Utf8(memos[i].Memo.MemoData)).to.be.equals(expectedMemo)
                    }
                    else if(expectedMemo.data){
                        expect(utility.hex2Utf8(memos[i].Memo.MemoData)).to.be.equals(expectedMemo.data)
                    }
                    else{
                        expect(false).to.be.ok
                    }
                    //todo need check type and format also. need make type, format, data of memo function clear with weijia.
                }
            }
            // expect(false).to.be.ok
            resolve("done!")
        })
    },

    getTxByHash: function(server, hash, retryCount){
        return new Promise(async function(resolve, reject){
            utility.getTxByHash(server, hash, retryCount)
                .then(async function (value) {
                    resolve(value)
                })
                .catch(function(error){
                    expect(error).to.not.be.ok
                })
        })
    },

    //endregion

    //region check sign and send raw tx result
    checkTestCaseOfSignTxAndSendRawTx: async function(testCase){
        //check sign result
        let responseOfSendTx = testCase.actualResult[0]
        framework.checkResponse(testCase.expectedResult.needPass, responseOfSendTx)
        if(testCase.expectedResult.needPass){
            expect(responseOfSendTx).to.be.jsonSchema(schema.SENDTX_SCHEMA)
            let signedTx = responseOfSendTx.result[0]
            expect(typeof(signedTx) === 'string').to.be.ok
            expect(utility.isHex(signedTx)).to.be.ok

            //check send raw tx result
            let txParams = testCase.txParams
            let testCaseOfSendRawTx = testCase.subTestCases[0]
            await framework.checkResponseOfTransfer(testCaseOfSendRawTx, txParams)
        }
        else{
            let expectedResult = testCase.expectedResult
            expect((expectedResult.isErrorInResult) ? responseOfSendTx.result : responseOfSendTx.message).to.contains(expectedResult.expectedError)
        }
    },
    //endregion

    //region common check system for sequence and ipfs test
    checkTestCase: async function(testCase){
        await framework.checkTestCaseOneByOne(testCase, 0)
    },

    checkTestCaseOneByOne: async function(testCase, index){
        let check = testCase.checks[index]
        if(check.title) logger.debug('Checking ' + check.title + ' ...')
        await check.checkFunction(testCase, check)
        if(check.title) logger.debug('Check ' + check.title + ' done!')
        index++
        if(index < testCase.checks.length) {
            await framework.checkTestCaseOneByOne(testCase, index)
        }
    },
    //endregion

    //endregion

    //region 4. test test cases

    //region common

    testTestCases: function(server, describeTitle, testCases) {
        let testMode = server.mode.testMode
        if(!testMode || testMode == testModeEnums.batchMode){
            framework.testBatchTestCases(server, describeTitle, testCases)
        }
        else if (testMode == testModeEnums.singleMode) {
            framework.testSingleTestCases(server, describeTitle, testCases)
        }
        else{
            logger.debug("No special test mode!")
        }
    },

    //region batch mode

    testBatchTestCases: function(server, describeTitle, testCases){
        describe(describeTitle, async function () {

            before(async function() {
                await framework.execEachTestCase(testCases, 0)  //NOTICE!!! the execute method must RETURN a promise, then batch mode can work!!!
            })

            testCases.forEach(async function(testCase){
                it(testCase.title, async function () {
                    // await testCase.checkFunction(testCase)
                    try{
                        // logger.debug('===before checkFunction')
                        // logger.debug('hasExecuted: ' + testCase.hasExecuted)
                        framework.printTestCaseInfo(testCase)
                        await testCase.checkFunction(testCase)
                        // logger.debug('===after checkFunction')
                        framework.afterTestFinish(testCase)
                    }
                    catch(ex){
                        framework.afterTestFinish(testCase)
                        throw ex
                    }
                })
            })
        })
    },

    execEachTestCase: async function(testCases, index){
        if(index < testCases.length){
            let testCase = testCases[index]
            // logger.debug("===1. index: " + index )
            // logger.debug('=== before executeFunction')
            await testCase.executeFunction(testCase)
            // logger.debug('=== after executeFunction')
            // logger.debug("===2. index: " + index )
            index++
            await framework.execEachTestCase(testCases, index)
            // logger.debug("===3. index: " + index )
        }
    },

    //endregion

    //region single mode
    testSingleTestCases: function(server, describeTitle, testCases) {
        describe(describeTitle, async function () {
            testCases.forEach(async function(testCase){
                it(testCase.title, async function () {
                    try{
                        await testCase.executeFunction(testCase)
                        framework.printTestCaseInfo(testCase)
                        await testCase.checkFunction(testCase)
                        framework.afterTestFinish(testCase)
                    }
                    catch(ex){
                        framework.afterTestFinish(testCase)
                        throw ex
                    }
                })
            })
        })
    },
    //endregion

    //region after test
    afterTestFinish: function(testCase){
        if(framework.checkIfAllTestHasBeenExecuted(_FullTestCaseList)){
            framework.closeTest(testCase)
        }
    },

    checkIfAllTestHasBeenExecuted: function(testCases){
        let result = true
        // let hasExecutedCount = 0
        // let clearCount = 0
        // let clearList = []
        testCases.forEach((testCase)=>{
            if(!testCase.hasExecuted){
                result = false
                // clearCount++
                // clearList.push(testCase)
            }
            else{
                // hasExecutedCount++
            }
        })
        // logger.debug('====== hasExecuted Count ======')
        // logger.debug(hasExecutedCount)
        // logger.debug('====== clear Count ======')
        // logger.debug(clearCount)

        return result
    },

    startWork: function(){
        //region ===record start time===
        logger.debug("======Start testing!======")
        START = new Date()
        END = new Date()
        logger.debug("Start time: " + START.toTimeString())
        //endregion
    },

    closeTest: function(testCase){
        //region ===record start time===
        logger.debug("======End testing!======")
        END = new Date()
        logger.debug("Start time: " + START.toTimeString())
        logger.debug("End time: " + END.toTimeString())
        let span = END - START
        let hour = Math.floor(span / 1000 / 60 / 60)
        span = span - hour * 1000 * 60 * 60
        let minute = Math.floor(span / 1000 / 60 )
        span = span - minute * 1000 * 60
        let second = Math.floor(span / 1000  )
        logger.debug("Consume time: " + (END - START) / 1000 + 's, equals to ' + hour + ':' + minute + ':' + second + '!')
        logger.debug('Closing server ...')
        testCase.server.close()
        //endregion
    },
    //endregion

    printTestCaseInfo: function(testCase){
        logger.debug('check title: ' + testCase.title)
        logger.debug('function: ' + testCase.txFunctionName)
        logger.debug('paraments: ' + JSON.stringify(testCase.txParams))
        logger.debug('supportedServices: ' + JSON.stringify(testCase.supportedServices))
        logger.debug('supportedInterfaces: ' + JSON.stringify(testCase.supportedInterfaces))
        logger.debug('restrictedLevel: ' + JSON.stringify(testCase.restrictedLevel))
        logger.debug('hasExecuted: ' + testCase.hasExecuted)
        for(let i = 0; i < testCase.actualResult.length; i++){
            logger.debug('result[' +i + ']: ' + JSON.stringify(testCase.actualResult[i]))    }
        if(testCase.subTestCases != null && testCase.subTestCases.length > 0) {
            logger.debug('subTestCases result: ' + JSON.stringify(testCase.subTestCases[0].actualResult[0]))
        }
        if(testCase.checks != null && testCase.checks.length > 0) {
            for(let i = 0; i < testCase.checks.length; i++){
                logger.debug('check[' + i + ']: ' + JSON.stringify(testCase.checks[i]))
            }
        }
    },

    ifNeedExecuteOrCheck: function(testCase){
        if(!testCase){
            logger.debug("Error: test case doesn't exist!")
        }
        if(testCase.server.mode.restrictedLevel < testCase.restrictedLevel){
            return false
        }
        else if(!(!testCase.supportedServices || testCase.supportedServices.length == 0)
            && !utility.ifArrayHas(testCase.supportedServices, testCase.server.mode.service)){
            return false
        }
        else if(!(!testCase.supportedInterfaces || testCase.supportedInterfaces.length == 0)
            && !utility.ifArrayHas(testCase.supportedInterfaces, testCase.server.mode.interface)){
            return false
        }
        else if(testCase.txFunctionName == consts.rpcFunctions.signTx
            && testCase.server.mode.service == serviceType.oldChain){
            return false
        }
        else{
            return true
        }
    },

    //endregion

    //endregion

    //endregion

    // region utility methods

    //swt example:
    // { id: 38,
    //     jsonrpc: '2.0',
    //     result: { balance: '1798498811047' },
    //   status: 'success' }
    //token example:
    checkBalanceChange: async function(server, from, symbol, expectedBalance){
        if(symbol){ //token
            let balance = await server.getBalance(server, from, symbol)
            expect(Number(balance.value)).to.be.equal(Number(expectedBalance))
            return balance
        }
        else{ //swt
            let balance = await server.getBalance(server, from)
            expect(Number(balance)).to.be.equal(Number(expectedBalance))
            return balance
        }
    },

    //region normal response check

    compareTx: function(tx1, tx2){
        expect(tx1.Account).to.be.equals(tx2.Account)
        expect(tx1.Destination).to.be.equals(tx2.Destination)
        expect(tx1.Fee).to.be.equals(tx2.Fee)
        expect(tx1.Amount).to.be.equals(tx2.Amount)
        expect(JSON.stringify(tx1.Memos)).to.be.equals(JSON.stringify(tx2.Memos))
        expect(tx1.Sequence).to.be.equals(tx2.Sequence)
        expect(tx1.inLedger).to.be.equals(tx2.inLedger)
        expect(tx1.date).to.be.equals(tx2.date)
    },

    checkResponse: function(isSuccess, value){
        expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
        expect(value.status).to.equal(isSuccess ? status.success: status.error)
    },

    //endregion

    //region common functions

    //region process sequence
    getSequence: function(server, from){
        return new Promise(function (resolve){
            let key = from + '@' + server.getName()
            if(_SequenceMap.has(key)){
                logger.debug("===sequence   _SequenceMap:" + _SequenceMap.get(key))
                resolve(_SequenceMap.get(key))
            }
            else{
                Promise.resolve(server.responseGetAccount(server, from)).then(function (accountInfo) {
                    // logger.debug("---sequence   accountInfo:" + JSON.stringify(accountInfo))
                    let sequence = Number(accountInfo.result.Sequence)
                    framework.setSequence(server.getName(), from, sequence)
                    resolve(sequence)
                }).catch(function (error){
                    logger.debug("Error!!! " + error)
                })
            }
        })
    },

    setSequence: function(serverName, from, sequence){
        let key = from + '@' + serverName
        _SequenceMap.set(key, sequence)
    },
    //endregion

    //region clone params
    cloneParams: function(originalParams){
        let params = {}
        if(originalParams.from != null) params.from = originalParams.from
        if(originalParams.secret != null) params.secret = originalParams.secret
        if(originalParams.to != null) params.to = originalParams.to
        if(originalParams.value != null) params.value = originalParams.value
        if(originalParams.fee != null) params.fee = originalParams.fee
        if(originalParams.memos != null) params.memos = originalParams.memos  //todo memos is an array, may need clone, not assign
        if(originalParams.type != null) params.type = originalParams.type
        if(originalParams.name != null) params.name = originalParams.name
        if(originalParams.symbol != null) params.symbol = originalParams.symbol
        if(originalParams.decimals != null) params.decimals = originalParams.decimals
        if(originalParams.total_supply != null) params.total_supply = originalParams.total_supply
        if(originalParams.local != null) params.local = originalParams.local
        if(originalParams.flags != null) params.flags = originalParams.flags
        return params
    },

    cloneParamsAarry: function(originalParamsAarry){
        let paramsAarry = []
        paramsAarry.push(framework.cloneParams(originalParamsAarry[0]))
        return paramsAarry
    },
    //endregion

    //endregion

    // endregion
}

