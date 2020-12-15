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
const consts = require('./consts')
const { chainDatas } = require("../testData/chainDatas")
let { modeAccounts } = require('../testData/accounts')
const AccountsDealer = require('../utility/init/accountsDealer')
const { responseStatus,  serviceType,  interfaceType,  testMode,  restrictedLevel, } = require("./enums")
const testModeEnums = testMode
const { allModes, } = require("../config/config")
//endregion

//region global fields
const HASH_LENGTH = 64
const IPFS_HASH_LENGTH = 46
let _SequenceMap = new HashMap()
let _FullTestCaseList = []
let accountsDealer = new AccountsDealer()
let START
let END
let NEED_CHECK_ExpectedResult = true
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
        testCaseParams.txParams = utility.deepClone(txParams)
        testCaseParams.otherParams = {}
        testCaseParams.executeFunction = framework.executeTestCaseOfSendTx
        testCaseParams.checkFunction = framework.checkTestCaseOfSendTx
        testCaseParams.expectedResult = framework.createExpecteResult(true)
        testCaseParams.testCase = {}
        // testCaseParams.symbol = testCaseParams.txParams[0].symbol
        // testCaseParams.showSymbol = (testCaseParams.txParams[0].showSymbol) ? testCaseParams.txParams[0].showSymbol : ''
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

    updateTokenInTestCaseParams: function(testCaseParams){
        let token = utility.getDynamicTokenName()
        testCaseParams.txParams[0].symbol = token.symbol
        testCaseParams.txParams[0].name = token.name
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
        // 参考“发起底层币无效交易”的测试用例
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
        // tokenParams[0].symbol = symbol
        // tokenParams[0].issuer = issuer
        tokenParams[0].value = '1' + utility.getShowSymbol(symbol, issuer)
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
        testCaseParams.txParams = utility.deepClone(testCaseParams.originalTxParams)
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
        testCaseParams.txParams = utility.deepClone(testCaseParams.originalTxParams)
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
        testCaseParams.txParams = utility.deepClone(testCaseParams.originalTxParams)
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
        return new Promise(async function(resolve){
            let server = testCase.server
            let count = 0
            let totalCount = testCase.txParams.length
            testCase.balanceBeforeExecutionList = []

            let sequence
            for(let i = 0; i < totalCount; i++){
                let data = testCase.txParams[i]
                let from = data.from

                if(testCase.sendType &&
                    (testCase.sendType == consts.sendTxType.InOneRequestQuickly || testCase.sendType == consts.sendTxType.InOneRequest)
                    && i != 0){
                    sequence++
                }else{
                    sequence = await framework.getSequence(server, from)
                }

                if(data.sequence == null){  //有时data.sequence已经设定，此时不要再修改
                    data.sequence = isNaN(sequence) ? 1 : sequence
                }

                if(testCase.sendType != consts.sendTxType.InOneRequestQuickly){
                    let balanceBeforeExecution = await server.getBalance(server, data.from, data.symbol)
                    testCase.balanceBeforeExecution = (balanceBeforeExecution && balanceBeforeExecution.value) ? balanceBeforeExecution.value : 0  //todo 只是暂时为了保持兼容而保留，应该使用下面的balanceBeforeExecutionList
                    testCase.balanceBeforeExecutionList.push(testCase.balanceBeforeExecution)
                }

                count ++
                if(count == testCase.txParams.length){
                    // logger.debug("balanceBeforeExecution:" + JSON.stringify(testCase.balanceBeforeExecution))
                    let response = await framework.executeTxByTestCase(testCase)
                    specialExecuteFunction(testCase, response, resolve)
                }
            }
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
            testCase.actualResult.push(responseOfSign)
            if(utility.isResponseStatusSuccess(responseOfSign)){
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
        if(utility.isResponseStatusSuccess(response)){
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
                let hashCount = 0
                for(let i =0; i < responseOfSendTx.result.length; i++){
                    let result = responseOfSendTx.result[i]
                    if(result && utility.isHex(result)){
                        let hash = result
                        hashCount ++
                        // expect(responseOfSendTx).to.be.jsonSchema(schema.SENDTX_SCHEMA)
                        // let hash = responseOfSendTx.result[0]
                        // let hash = responseOfSendTx.result.tx_json.hash  //for swtclib
                        let responseOfGetTx = await utility.getTxByHash(testCase.server, hash, 0)
                        framework.checkResponse(true, responseOfGetTx)
                        expect(responseOfGetTx.result.hash).to.be.equal(hash)
                        await checkFunction(testCase, txParams, responseOfGetTx.result)
                    }
                    else{
                        expect('Not a hash!').to.be.ok
                    }
                }
                expect(hashCount).to.be.equal(testCase.txParams.length)
            }
            else{
                framework.checkResponseError(testCase, responseOfSendTx.message, testCase.expectedResult.expectedError)
            }
        }
        else{
            if(testCase.expectedResult.needPass){
                expect(responseOfSendTx).to.be.jsonSchema(schema.SENDTX_SCHEMA)
                let hash = responseOfSendTx.result.hash  //for swtclib
                await utility.getTxByHash(testCase.server, hash, 0).then(async function(responseOfGetTx){
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
            let params = framework.findTxByFromAndSequence(txParams, tx.Account, tx.Sequence)
            // logger.debug('checkResponseOfTransfer: ' + tx.Sequence)
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

    findTxByFromAndSequence: function(txs, from, sequence){
        for(let i = 0; i < txs.length; i++){
            let tx = txs[i]
            if(tx.from == from && tx.sequence == sequence){
                return tx
            }
        }
        return null
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
            let balanceAfterExecution = (await testCase.server.getBalance(testCase.server, params.from, params.symbol)).value
            testCase.balanceAfterExecution = balanceAfterExecution
            let oldBalance = framework.getBalanceValue(testCase.balanceBeforeExecution)
            let newBalance = balanceAfterExecution
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
            // expect(true).to.be.ok
        })
    },

    compareActualTxWithTxParams: function(txParams, tx, mode){
        return new Promise(function(resolve){
            expect(tx.Account).to.be.equals(txParams.from)
            expect(tx.Destination).to.be.equals(txParams.to)

            let expectedFee = (mode.service == serviceType.oldChain) ?
                mode.defaultFee : ((txParams.fee) ? txParams.fee : mode.defaultFee)
            expect(tx.Fee).to.be.equals(expectedFee.toString())

            //check value
            if(txParams.type == consts.rpcParamConsts.issueCoin){
                expect(tx.Name).to.be.equals(txParams.name)
                expect(tx.Decimals).to.be.equals(Number(txParams.decimals))
                expect(tx.TotalSupply.value).to.be.equals(txParams.total_supply)
                expect(tx.TotalSupply.currency).to.be.equals(txParams.symbol)
                expect(tx.TotalSupply.issuer).to.be.equals((txParams.local) ? txParams.from : mode.addresses.defaultIssuer.address)
                if(mode.restrictedLevel >= restrictedLevel.L5) expect(tx.Flags).to.be.equals(txParams.flags)  //todo need restore
            }
            else{
                let realValue = utility.parseShowValue(txParams.value)
                // if(realValue.symbol != consts.defaultNativeCoin){
                //     expect(tx.Amount.currency).to.be.equals(realValue.symbol)
                //     expect(tx.Amount.value + "/" + tx.Amount.currency + "/" + tx.Amount.issuer).to.be.equals(txParams.value)
                // }else{
                //     let expectedValue = (mode.service == serviceType.oldChain) ?
                //         utility.valueToAmount(Number(txParams.value)) : utility.getRealValue(txParams.value)
                //     expect(Number(tx.Amount)).to.be.equals(expectedValue)
                // }

                if(mode.service == serviceType.oldChain){
                    expect(Number(tx.Amount)).to.be.equals(utility.valueToAmount(Number(txParams.value)))
                }
                else{
                    expect(tx.Amount.currency).to.be.equals(realValue.symbol)
                    if(realValue.symbol == consts.defaultNativeCoin){

                        if(txParams.value.indexOf(consts.defaultNativeCoin) != -1){//expected '1000000' to equal '1/SWT'
                            expect(tx.Amount.value).to.be.equals((realValue.amount * consts.swtConsts.oneSwt).toString())
                        }
                        else{
                            expect(tx.Amount.value).to.be.equals(txParams.value)
                        }
                    }
                    else{
                        expect(tx.Amount.value + "/" + tx.Amount.currency + "/" + tx.Amount.issuer).to.be.equals(txParams.value)
                    }

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
            framework.checkResponseError(testCase, responseOfSendTx.message, testCase.expectedResult.expectedError)
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
        describeTitle = '【' + describeTitle + '】'
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
        logger.info("======Start testing!======")
        START = new Date()
        END = new Date()
        logger.info("Start time: " + START.toTimeString())
        //endregion
    },

    closeTest: function(testCase){
        //region ===record start time===
        logger.info("======End testing!======")
        END = new Date()
        logger.info("Start time: " + START.toTimeString())
        logger.info("End time: " + END.toTimeString())
        let time = utility.duration2Time(START, END)
        logger.info("Consume time: " + (END - START) / 1000 + 's, equals to ' + utility.printTime(time) + '!')
        logger.info('Closing server ...')
        testCase.server.close()
        //endregion
    },
    //endregion

    printTestCaseInfo: function(testCase){
        logger.debug('---check title: ' + testCase.title)      //important logger
        logger.debug('---function: ' + testCase.txFunctionName)
        logger.debug('---paraments: ' + JSON.stringify(testCase.txParams))
        logger.debug('---supportedServices: ' + JSON.stringify(testCase.supportedServices))
        logger.debug('---supportedInterfaces: ' + JSON.stringify(testCase.supportedInterfaces))
        logger.debug('---restrictedLevel: ' + JSON.stringify(testCase.restrictedLevel))
        logger.debug('---hasExecuted: ' + testCase.hasExecuted)
        for(let i = 0; i < testCase.actualResult.length; i++){
            logger.debug('---result[' +i + ']: ' + JSON.stringify(testCase.actualResult[i]))    }
        if(testCase.subTestCases != null && testCase.subTestCases.length > 0) {
            logger.debug('---subTestCases result: ' + JSON.stringify(testCase.subTestCases[0].actualResult[0]))
        }
        if(testCase.checks != null && testCase.checks.length > 0) {
            for(let i = 0; i < testCase.checks.length; i++){
                logger.debug('---check[' + i + ']: ' + JSON.stringify(testCase.checks[i]))
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

    //region check balance change
    //swt example:
    // { id: 38,
    //     jsonrpc: '2.0',
    //     result: { balance: '1798498811047' },
    //   status: 'success' }
    //token example:
    checkBalanceChange: async function(server, from, symbol, expectedBalance){
        if(symbol){ //token
            let balance = (await server.getBalance(server, from, symbol)).value
            expect(Number(balance.value)).to.be.equal(Number(expectedBalance))
            return balance
        }
        else{ //swt
            let balance = (await server.getBalance(server, from)).value
            expect(Number(balance)).to.be.equal(Number(expectedBalance))
            return balance
        }
    },
    //endregion

    //region normal response check

    compareTx: function(tx1, tx2){
        expect(tx1.Account).to.be.equals(tx2.Account)
        expect(tx1.Destination).to.be.equals(tx2.Destination)
        expect(tx1.Fee).to.be.equals(tx2.Fee)
        // expect(tx1.Amount).to.be.equals(tx2.Amount)
        expect(tx1.Amount.value).to.be.equals(tx2.Amount.value)
        expect(tx1.Amount.currency).to.be.equals(tx2.Amount.currency)
        expect(tx1.Amount.issuer).to.be.equals(tx2.Amount.issuer)
        expect(JSON.stringify(tx1.Memos)).to.be.equals(JSON.stringify(tx2.Memos))
        expect(tx1.Sequence).to.be.equals(tx2.Sequence)
        expect(tx1.inLedger).to.be.equals(tx2.inLedger)
        expect(tx1.date).to.be.equals(tx2.date)
    },

    checkResponse: function(isSuccess, value){
        expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
        // expect(value.status).to.equal(isSuccess ? status.success: status.error)
        expect(utility.isResponseStatusSuccess(value)).to.equal(isSuccess)
    },

    //region check response error
    checkResponseError: function(testCase, message, expectedError){
        if(NEED_CHECK_ExpectedResult
            && testCase.server.mode.restrictedLevel >= restrictedLevel.L3){
            expect(message).to.contains(expectedError)
            // expect(message.result[0].error).to.contains(expectedError)
        }
    },

    checkResponseError_2: function(testCase, actualError, expectedError){
        if(NEED_CHECK_ExpectedResult
            && testCase.server.mode.restrictedLevel >= restrictedLevel.L3){
            expect(actualError).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(message).to.contains(expectedError)
            // expect(message.result[0].error).to.contains(expectedError)
        }
    },
    //endregion

    //endregion

    //region common functions

    //region process sequence

    //region getSequence v1
    // getSequence: function(server, from){
    //     return new Promise(function (resolve){
    //         // let key = from + '@' + server.getName()
    //         let key = from
    //         if(_SequenceMap.has(key)){
    //             logger.debug("===get sequence from map:" + _SequenceMap.get(key))
    //             resolve(_SequenceMap.get(key))
    //         }
    //         else{
    //             Promise.resolve(server.responseGetAccount(server, from)).then(function (accountInfo) {
    //                 let sequence = Number(accountInfo.result.Sequence)
    //                 framework.setSequence(server.getName(), from, sequence)
    //                 logger.debug("===get sequence from accountInfo:" + JSON.stringify(accountInfo))
    //                 resolve(sequence)
    //             }).catch(function (error){
    //                 logger.debug("Error!!! " + error)
    //             })
    //         }
    //     })
    // },
    //endregion

    //region getSequence v2
    getSequence: function(server, from){
        return new Promise(function (resolve){
            // let key = from + '@' + server.getName()
            let key = from
            let local_sequence = -1
            let remote_sequence = -1
            let sequence = -1

            if(_SequenceMap.has(key)){
                local_sequence = _SequenceMap.get(key)
                logger.debug("===get sequence from map: " + local_sequence)
            }

            Promise.resolve(server.responseGetAccount(server, from)).then(function (accountInfo) {
                remote_sequence = Number(accountInfo.result.Sequence)
                logger.debug("===get sequence from accountInfo: " + remote_sequence)
                sequence = (local_sequence > remote_sequence) ? local_sequence : remote_sequence
                framework.setSequence(server.getName(), from, sequence)
                logger.debug("===final sequence: " + sequence)
                resolve(sequence)
            }).catch(function (error){
                logger.debug("Error!!! " + error)
            })
        })
    },

    getSequenceByChain: function(server, from){
        return new Promise(function (resolve){
            let key = from
            Promise.resolve(server.responseGetAccount(server, from)).then(function (accountInfo) {
                // logger.debug("---sequence   accountInfo:" + JSON.stringify(accountInfo))
                let sequence = Number(accountInfo.result.Sequence)
                framework.setSequence(server.getName(), from, sequence)
                resolve(sequence)
            }).catch(function (error){
                logger.debug("Error!!! " + error)
            })
        })
    },

    setSequence: function(serverName, from, sequence){
        // let key = from + '@' + serverName
        let key = from
        _SequenceMap.set(key, sequence)
    },
    //endregion

    //endregion

    //endregion

    // endregion

    //region execute and check for batch sub cases

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

    createSubCase: function(from, secret, to, value, fee, memos, txFunctionName, count, shouldSuccessCount){
        let subCase = {}
        if(from != null) subCase.from = from
        if(secret != null) subCase.secret = secret
        if(to != null) subCase.to = to
        if(value != null) subCase.value = value
        // if(value != null) {
        //     if(!utility.isJSON(value)){
        //         subCase.value = value
        //     }else{
        //         let amount = value.amount
        //         let symbol = value.symbol
        //         let issuer = value.issuer
        //         subCase.value = utility.getShowValue(amount, symbol, issuer)
        //     }
        // }
        if(fee != null) subCase.fee = fee
        if(memos != null) subCase.memos = memos
        if(txFunctionName != null) subCase.txFunctionName = txFunctionName
        if(count != null) subCase.count = count
        if(shouldSuccessCount != null) subCase.shouldSuccessCount = shouldSuccessCount
        return subCase
    },

    //to compare balance of account1 and account2, then decide send from account1 to account2, or from account2 to account1.
    //normally, should send from bigger balance to smaller balance
    createSubCases: async function(server, account1, account2, currency, txFunction, txCount, moreActionsFunction){
        let subCases = []
        let balance1 = parseInt((await server.getBalance(server, account1.address, currency.symbol)).value)
        let balance2 = parseInt((await server.getBalance(server, account2.address, currency.symbol)).value)

        if(balance1 < 100 && balance2 < 100){
            expect('Accounts balance is not enough!').to.be.not.ok
        }
        else{
            let sender = balance1 >= balance2 ? account1 : account2
            let receiver = balance1 >= balance2 ? account2 : account1
            let balance = balance1 >= balance2 ? balance1 : balance2
            // let receiverBalance = balance1 >= balance2 ? balance1 : balance2

            let value
            let amount = 3
            let fee = 0.00001
            let restBalance

            value = {}
            value.amount = amount
            value.symbol = currency.symbol
            value.issuer = currency.issuer
            restBalance = balance - amount * txCount

            //todo need split every sub case out!!!  one sub case, one position, with special sequence.
            subCases.push(framework.createSubCase(sender.address, sender.secret, receiver.address,
                value, fee, null, txFunction, txCount, txCount))

            if(moreActionsFunction){
                moreActionsFunction(subCases, sender, receiver, currency, balance, restBalance, txFunction)
            }
        }
        return subCases
    },

    //region normal sub cases

    createTestCaseForSubCases: function(server, title, executeFunction, checkFunction, caseRestrictedLevel, subCaseFunctionParams){
        let testCase = framework.createTestCase(title, server, null, '', null,
            executeFunction, checkFunction, null, caseRestrictedLevel, [serviceType.newChain])

        testCase.otherParams = {}
        testCase.otherParams.executeBothSignAndSend = true
        testCase.otherParams.subCaseFunctionParamsList = []
        testCase.otherParams.subCaseFunctionParamsList.push(subCaseFunctionParams)
        testCase.otherParams.servers = [testCase.server]
        return testCase
    },

    //execute sub cases by multiple servers, accounts
    executeSubCases: function(testCase){
        testCase.hasExecuted = true
        return new Promise(async (resolve, reject) => {
            let servers = testCase.otherParams.servers
            let serverCount = servers.length
            let server = servers[0]
            // let index = utility.getRand(0, serverCount - 1)
            // let server = servers[index]
            let subCases = testCase.otherParams.subCases
            let totalCount = testCase.otherParams.totalCount
            let executeCount = 0
            let totalShouldSuccessCount = 0
            let totalShouldFailCount = 0
            let totalSuccessCount = 0
            let totalFailCount = 0
            testCase.otherParams.successResults = []
            testCase.otherParams.failResults = []
            if(totalCount == 0){
                resolve(null)
            }else{
                for(let i = 0; i < subCases.length; i++){
                    let accountParam = subCases[i]

                    let count = accountParam.count
                    let txFunctionName = accountParam.txFunctionName

                    //get sequence
                    let currentSequence = await framework.getSequence(server, accountParam.from)
                    currentSequence = isNaN(currentSequence) ? 1 : currentSequence
                    let sequence = currentSequence

                    accountParam.results = []
                    accountParam.successCount = 0
                    accountParam.failCount = 0

                    totalShouldSuccessCount += accountParam.shouldSuccessCount
                    totalShouldFailCount += accountParam.count - accountParam.shouldSuccessCount

                    //transfer
                    for(let i = 0; i < count; i++){
                        let index = i % serverCount
                        server = servers[index]
                        let params = server.createTransferParams(accountParam.from, accountParam.secret, sequence,
                            accountParam.to, accountParam.value, accountParam.fee, accountParam.memos)
                        let result = await server.getResponse(server, txFunctionName, params)
                        if (testCase.otherParams.executeBothSignAndSend && txFunctionName == consts.rpcFunctions.signTx && utility.isResponseStatusSuccess(result)){
                            result = await server.getResponse(server, consts.rpcFunctions.sendRawTx, [result.result[0]])
                        }
                        executeCount++
                        accountParam.results.push(result)
                        if(utility.isResponseStatusSuccess(result)) {
                            sequence++
                            framework.setSequence(server.getName(), accountParam.from, sequence)
                            testCase.otherParams.successResults.push(result)
                            accountParam.successCount++
                            totalSuccessCount++

                            //print wrong failed/success tx
                            //todo need be remove when such jingtum bug (invalid tx will be success in pressure test) is fixed
                            if(accountParam.shouldSuccessCount < accountParam.count){
                                logger.debug('===attention===')
                                logger.debug(JSON.stringify(accountParam))
                                logger.debug('sequence: ' + (sequence - 1))
                                logger.debug(JSON.stringify(result))
                            }

                        }else{
                            // logger.debug('---+++ isResponseStatusSuccess faile: ' + JSON.stringify(result))
                            testCase.otherParams.failResults.push(result)
                            accountParam.failCount++
                            totalFailCount++
                        }

                        // logger.info('[' + executeCount.toString() + '/' + totalSuccessCount + '] - [' + accountParam.from + ']: '
                        //     + JSON.stringify(result))

                        if(executeCount == totalCount){
                            testCase.otherParams.executeCount = executeCount
                            testCase.otherParams.totalSuccessCount = totalSuccessCount
                            testCase.otherParams.totalFailCount = totalFailCount
                            testCase.otherParams.totalShouldSuccessCount = totalShouldSuccessCount
                            testCase.otherParams.totalShouldFailCount = totalShouldFailCount
                            resolve(testCase.otherParams)
                        }
                    }
                }
            }
        })
    },

    checkSubCases: async function(testCase){
        framework.printTps(testCase)

        let totalCount = testCase.otherParams.totalCount
        let totalSuccessCount = testCase.otherParams.totalSuccessCount
        let totalFailCount = testCase.otherParams.totalFailCount
        expect(totalSuccessCount + totalFailCount).to.be.equal(totalCount)
        expect(totalSuccessCount).to.be.equal(testCase.otherParams.totalShouldSuccessCount)
        expect(totalFailCount).to.be.equal(testCase.otherParams.totalShouldFailCount)
    },

    printTps: async function(testCase){
        let server = testCase.server
        let blockTime = server.mode.defaultBlockTime / 1000

        let startTxHash = testCase.otherParams.successResults[0].result[0]
        let startTx = await utility.getTxByHash(server, startTxHash)
        let startBlockNumber = startTx.result.ledger_index

        let endTxHash = testCase.otherParams.successResults[testCase.otherParams.successResults.length - 1].result[0]
        // logger.info("------endTxHash: " + endTxHash)
        let endTx = await utility.getTxByHash(server, endTxHash)
        let endBlockNumber = endTx.result.ledger_index
        // logger.info("------endTx: " + JSON.stringify(endTx))

        let blocksInfo = await framework.getBlocksInfo(server, startBlockNumber, endBlockNumber)
        let blockCount = blocksInfo.txBlockCount

        let totalCount = testCase.otherParams.totalCount
        let totalSuccessCount = testCase.otherParams.totalSuccessCount
        let totalFailCount = testCase.otherParams.totalFailCount
        let tps1 = totalSuccessCount / blockCount / blockTime
        logger.info("totalSuccessCount: " + totalSuccessCount)
        logger.info("totalFailCount: " + totalFailCount)
        logger.info("Success tx tps: " + tps1)
    },

    //endregion

    //region fast performance

    executeSubCasesWithoutResponse: function(testCase){
        testCase.hasExecuted = true
        let txNumber = 1
        return new Promise(async (resolve, reject) => {
            let servers = testCase.otherParams.servers
            let server = servers[0]
            let serverCount = servers.length
            let subCases = testCase.otherParams.subCases
            let totalCount = testCase.otherParams.totalCount
            let executedCount = 0
            let totalShouldSuccessCount = 0
            let totalShouldFailCount = 0
            let totalFailCount = 0
            let startBlockNumber = await server.getBlockNumber(server)
            if(startBlockNumber < 0){
                expect().to.be.not.ok
            }
            else{
                testCase.otherParams.startBlockNumber = startBlockNumber + 1
            }
            testCase.otherParams.successResults = []
            testCase.otherParams.failResults = []
            for(let i = 0; i < subCases.length; i++){
                let accountParam = subCases[i]

                let count = accountParam.count
                let txFunctionName = accountParam.txFunctionName

                //get sequence
                let currentSequence = await framework.getSequence(server, accountParam.from)
                currentSequence = isNaN(currentSequence) ? 1 : currentSequence
                let sequence = currentSequence

                accountParam.results = []
                accountParam.successCount = 0
                accountParam.failCount = 0

                totalShouldSuccessCount += accountParam.shouldSuccessCount
                totalShouldFailCount += accountParam.count - accountParam.shouldSuccessCount

                //transfer
                for(let i = 0; i < count; i++){
                    let index = i % serverCount
                    server = servers[index]
                    logger.debug('---[' + (txNumber++).toString() + '/' + totalCount + ']. ') //important logger
                    let params = server.createTransferParams(accountParam.from, accountParam.secret, sequence,
                        accountParam.to, accountParam.value, accountParam.fee, accountParam.memos)
                    let result = server.getResponse(server, txFunctionName, params)
                    executedCount++
                    sequence++
                    framework.setSequence(server.getName(), accountParam.from, sequence)

                    if(executedCount == totalCount){
                        testCase.otherParams.executedCount = executedCount
                        testCase.otherParams.totalSuccessCount = executedCount
                        testCase.otherParams.totalFailCount = totalFailCount
                        testCase.otherParams.totalShouldSuccessCount = totalShouldSuccessCount
                        testCase.otherParams.totalShouldFailCount = totalShouldFailCount
                        resolve(testCase.otherParams)
                    }
                }
            }
        })
    },

    checkSubCasesWithoutResponse: async function(testCase){
        let totalCount = testCase.otherParams.totalCount
        let totalSuccessCount = testCase.otherParams.totalSuccessCount
        let totalFailCount = testCase.otherParams.totalFailCount

        //check tps
        let server = testCase.server
        let blockTime = server.mode.defaultBlockTime / 1000
        let supportedTps = 15
        let startBlockNumber = testCase.otherParams.startBlockNumber
        let endBlockNumber = startBlockNumber + Math.floor(totalCount / supportedTps / blockTime)
        // let endBlockNumber = startBlockNumber + 20
        let waitTime = (endBlockNumber - startBlockNumber + 1) * blockTime * 1000
        logger.info("startBlockNumber: " + startBlockNumber)
        logger.info("endBlockNumber: " + endBlockNumber)
        logger.info("waitTime: " + waitTime)
        await utility.timeout(waitTime)

        let blocksInfo = await framework.getBlocksInfo(server, startBlockNumber, endBlockNumber)
        let blockCount = blocksInfo.txBlockCount

        let tps1 = totalSuccessCount / blockCount / blockTime
        logger.info("totalCount: " + totalCount)
        logger.info("totalSuccessCount: " + totalSuccessCount)
        logger.info("totalFailCount: " + totalFailCount)
        logger.info("Success tx tps: " + tps1)

        expect(totalSuccessCount + totalFailCount).to.be.equal(totalCount)
    },

    //endregion

    //region common
    getBlocksInfo: async function(server, startBlockNumber, endBlockNumber){
        return new Promise(async (resolve, reject) => {
            let blockTime = server.mode.defaultBlockTime / 1000
            let blockTpsInfoList = []
            let blockWhichHasTxList = []
            for(let i = startBlockNumber; i <= endBlockNumber; i++){
                let blockResponse = await server.getResponse(server, consts.rpcFunctions.getBlockByNumber, [i.toString(), false])
                let block = blockResponse.result
                let blockTpsInfo = {}
                blockTpsInfo.blockNumber = block.ledger_index
                blockTpsInfo.txCount = block.transactions ? block.transactions.length : 0
                blockTpsInfo.tps = blockTpsInfo.txCount / blockTime
                blockTpsInfoList.push(blockTpsInfo)
                if(blockTpsInfo.txCount > 0){
                    blockWhichHasTxList.push(blockTpsInfo)
                }
            }

            let txCountInBlocks = 0
            let maxBlock = null
            let maxCount = -1
            for(let blockTpsInfo of blockTpsInfoList){
                if(blockTpsInfo.txCount > 0){
                    logger.info('------ block tps status ------')
                    logger.info("blockNumber: " + blockTpsInfo.blockNumber)
                    logger.info("txCount: " + blockTpsInfo.txCount)
                    logger.info("tps: " + blockTpsInfo.tps)
                    txCountInBlocks += blockTpsInfo.txCount
                    if(blockTpsInfo.txCount > maxCount){
                        maxCount = blockTpsInfo.txCount
                        maxBlock = blockTpsInfo
                    }
                }
            }

            let blockCount = endBlockNumber - startBlockNumber + 1
            let tps = txCountInBlocks / blockCount / blockTime
            logger.info("======== tps status ========")
            logger.info("Start BlockNumber: " + startBlockNumber)
            logger.info("End BlockNumber: " + endBlockNumber)
            logger.info("Block Count: " + blockCount)
            logger.info("Tx Count: " + txCountInBlocks)
            logger.info("Block Tps: " + tps)
            logger.info("Max Count Block: " + (maxBlock == null ? -1 : maxBlock.blockNumber))
            logger.info("Max Count : " + maxCount)

            let blockWhichHasTxCount = blockWhichHasTxList.length
            logger.info("Tx Block Count: " + blockWhichHasTxCount)
            logger.info("Tx Block Average Tps: " + txCountInBlocks / blockWhichHasTxCount / blockTime)

            let blocksInfo = {}
            blocksInfo.blockTpsInfoList = blockTpsInfoList
            blocksInfo.txBlockCount = blockCount
            resolve(blocksInfo)
        })

    },
    //endregion

    //endregion

    //region active server
    activeServer: function(mode){
        let server = mode.server
        mode.server.init(mode)
        if(mode.service == serviceType.newChain || mode.service == serviceType.oldChain){
            mode.addresses = accountsDealer.getAddressesByMode(modeAccounts, mode)
            mode.txs = utility.findChainData(chainDatas, mode.chainDataName)
        }
        return server
    },

    activeAllRpcServers: function(){
        let servers = []

        // servers.push(framework.activeServer(allModes[0]))
        // servers.push(framework.activeServer(allModes[1]))
        // servers.push(framework.activeServer(allModes[2]))
        // servers.push(framework.activeServer(allModes[3]))
        // servers.push(framework.activeServer(allModes[4]))

        for(let i = 0; i < allModes.length; i++){
            let mode = allModes[i]
            if(mode.name.indexOf('rpc') != -1){
                servers.push(framework.activeServer(mode))
            }
        }

        return servers
    },

    createServers: function(allServers, count){
        let servers = []
        for(let i = 0; i < count; i++){
            servers.push(allServers[i])
        }
        return servers
    },

    //endregion
}

