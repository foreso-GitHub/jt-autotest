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
let errorsDoc = require('../testData/errors').errors
let mdTool = require('../utility/markdown/markdownTool')
let testCasesDoc = require('../testData/testCase').fullTestCases
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

    //region design

    // 结构：
    // TestCase => TestScript => Action => TxParam/ExpectedResult/ActualResult
    // 执行模式：
    // Batch: 数组中所有的TestScript都执行完后再检查，好处是节省时间
    // Single: 数组中所有的TestScript都一个个单独执行，执行一个就检查一个，时间消耗比较高
    // TestScript包含多个action，每个action是一个rpc的request，顺序执行

    //sendRawTx
    // 在sendRawTx的action中，有signTxActions，这样可以把前置的signTx的action的执行结果（signedTx）作为参数引用
    // 等离线的签名功能完成，可以不再关联signTxActions，直接本地签名，生成signedTx todo

    //endregion

    //region auto test framework

    //region 0. init

    init: function(){
        framework.startWork()
        framework.loadErrors()
        framework.loadTestCases()
    },

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

    //region load errors
    loadErrors: function(){
        let map = mdTool.errors2Map(errorsDoc)
        framework.errors = map
    },

    getError: function(code, information){
        let error = utility.deepClone(framework.errors.get(code))
        if(information) {
            error.information = information
        }
        return error
    },
    //endregion

    //region load testCases
    loadTestCases: function(){
        let map = mdTool.testCases2Map(testCasesDoc)
        framework.testCases = map
    },

    getTestCase: function(code){
        let testCase = framework.testCases.get(code)
        return testCase
    },
    //endregion

    //endregion

    //region 1. create test cases

    //region may need to be removed

    createTestCaseByParams: function(testCaseParams){
        return framework.createTestCase(testCaseParams.title, testCaseParams.server,
            testCaseParams.txFunctionName, testCaseParams.txParams, testCaseParams.otherParams,
            testCaseParams.executeFunction, testCaseParams.checkFunction, testCaseParams.expectedResult,
            testCaseParams.restrictedLevel, testCaseParams.supportedServices, testCaseParams.supportedInterfaces)
    },

    //endregion

    //region txParams

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

    //endregion

    //region create testScript and testAction

    createTestScript: function(server, testCaseCode, scriptCode, actions, restrictedLv, supportedServices, supportedInterfaces){
        let testScript = {}
        testScript.type = "it"
        let testCase = framework.getTestCase(testCaseCode)
        testScript.testCase = testCase
        testCase.scripts.push(testScript)
        testScript.scriptCode = scriptCode
        testScript.title = testScript.testCase.code + '-' + testScript.scriptCode + ': ' + testScript.testCase.title
        if(server) testScript.server = server
        if(actions) testScript.actions = actions
        testScript.otherParams = null
        testScript.restrictedLevel = (restrictedLv != null) ? restrictedLv : restrictedLevel.L2
        testScript.supportedServices = (supportedServices) ? utility.cloneArray(supportedServices) : []
        testScript.supportedInterfaces = (supportedInterfaces) ? utility.cloneArray(supportedInterfaces) : []
        testScript.hasExecuted = false
        testScript.testResult = false
        return testScript
    },

    createTestAction: function(testScript, txFunctionName, txParams, executeFunction, checkFunction, expectedResults){
        let testAction = {}
        testAction.testScript = testScript
        testAction.server = testScript.server
        testAction.txFunctionName = txFunctionName
        if(txParams) {
            testAction.originalTxParams = txParams
            testAction.txParams = utility.deepClone(txParams)
        }
        testAction.executeFunction = executeFunction
        testAction.checkFunction = checkFunction
        testAction.expectedResults = expectedResults
        testAction.actualResult = null
        testAction.testResult = false
        testAction.hasExecuted = false
        testAction.otherParams = {}
        return testAction
    },

    createTestScriptForTx: function(server, testCaseCode, scriptCode, txFunctionName, txParams){

        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        if(txFunctionName === consts.rpcFunctions.sendTx) {
            let sendTxAction = framework.createTestAction(testScript, txFunctionName, txParams,
                framework.executeTestActionOfSendTx,
                framework.checkTestActionOfSendTx,
                [{needPass: true}])
            testScript.actions.push(sendTxAction)
        }
        else if(txFunctionName === consts.rpcFunctions.signTx){
            let signTxAction = framework.createTestAction(testScript, txFunctionName, txParams,
                framework.executeTestActionOfSendTx,
                framework.checkTestActionOfSignTx,
                [{needPass: true}])
            testScript.actions.push(signTxAction)
            let sendRawTxAction = framework.createTestAction(testScript, consts.rpcFunctions.sendRawTx, [],
                framework.executeTestActionOfSendRawTx,
                framework.checkTestActionOfSendTx,
                [{needPass: true}])
            framework.addSignTxAction(sendRawTxAction, signTxAction)
            testScript.actions.push(sendRawTxAction)
        }
        else if(txFunctionName === consts.rpcFunctions.sendRawTx){
            //do nothing
        }
        else{
            throw new Error('txFunctionName doesn\'t exist!')
        }

        return testScript
    },

    addSignTxAction: function(sendRawTxAction, signTxAction){
        if(!sendRawTxAction.signTxActions) sendRawTxAction.signTxActions = []
        if(!sendRawTxAction.signTxParams) sendRawTxAction.signTxParams = []
        sendRawTxAction.signTxActions.push(signTxAction)
        sendRawTxAction.signTxParams = sendRawTxAction.signTxParams.concat(signTxAction.txParams)
    },

    //当jt_sendTransaction和jt_signTransaction都通不过测试时
    changeExpectedResultWhenSignFail: function(testScript, expectedResult){
        testScript.actions[0].expectedResults = [expectedResult]
        if(testScript.actions[0].txFunctionName === consts.rpcFunctions.signTx){
            testScript.actions[1].expectedResults = [framework.createExpecteResult(false,
                framework.getError(-278, 'empty raw transaction'))]  //when signTx fail, sendRawTx will send empty string.
        }
    },

    //当jt_signTransaction，sign可以通过，但sendRawTx会出错的情况的处理：这时sendRawTx的期望出错结果和jt_sendTransaction的期望出错结果一致。
    changeExpectedResultWhenSignPassButSendRawTxFail: function(testScript, expectedResult){
        if(testScript.actions[0].txFunctionName === consts.rpcFunctions.sendTx){
            testScript.actions[0].expectedResults = [expectedResult]
        }else{
            testScript.actions[1].expectedResults = [expectedResult]
        }
    },

    addTestScript: function(testScripts, testScript){
        if(framework.ifNeedExecuteOrCheck(testScript)){
            testScripts.push(testScript)
            _FullTestCaseList.push(testScript)
            // logger.debug('====== _FullTestCaseList Count ======')
            // logger.debug(_FullTestCaseList.length)
        }
    },

    createExpecteResult: function(needPass, expectedError){
        let expectedResult = {}
        expectedResult.needPass = needPass
        expectedResult.expectedError = expectedError
        return expectedResult
    },

    //endregion

    //endregion

    //region 2. execute test actions

    executeTestActionForGet: function(action){
        return new Promise(async (resolve, reject) => {
            action.hasExecuted = true
            framework.executeTxByTestAction(action).then(function(response){
                action.actualResult = response
                resolve(action)
            }, function (error) {
                logger.debug(error)
                expect(false).to.be.ok
                reject(error)
            })
        })
    },

    executeTestActionOfTx: function(action, beforeExecution, afterExecution){
        return new Promise(async function(resolve){
            let server = action.server
            let totalCount = action.txParams.length
            action.balanceBeforeExecutionList = []
            action.hasExecuted = true

            if(beforeExecution) await beforeExecution(action)

            let sequence
            for(let i = 0; i < totalCount; i++){
                let data = action.txParams[i]
                if(data){
                    if(!data.sequence){
                        // if(i != 0 && action.sendType &&
                        //     (action.sendType == consts.sendTxType.InOneRequestQuickly
                        //     || action.sendType == consts.sendTxType.InOneRequest)){
                        if(totalCount > 1 && i != 0){
                            sequence++
                        }else{
                            sequence = await framework.getSequence(server, data.from)
                            if(data.sequence == null){  //有时data.sequence已经设定，此时不要再修改
                                data.sequence = isNaN(sequence) ? 1 : sequence
                            }
                        }
                        if(action.txFunctionName !== consts.rpcFunctions.sendRawTx){
                            data.sequence = sequence
                        }
                    }

                    if(!action.sendType || action.sendType != consts.sendTxType.InOneRequestQuickly){
                        let balanceBeforeExecution = await server.getBalance(server, data.from, data.symbol)
                        action.balanceBeforeExecutionList.push(balanceBeforeExecution)
                    }
                }
            }

            // let balance = await action.server.responseBalance(action.server, action.txParams[0].from, action.txParams[0].symbol, action.txParams[0].issuer)
            // logger.debug("===here: " + action.txParams[0].symbol + JSON.stringify(balance))

            let response = await framework.executeTxByTestAction(action)
            action.actualResult = response
            framework.addSequenceAfterResponseSuccess(action)

            if(afterExecution) await afterExecution(action)

            resolve(action)
        })
    },

    //region send

    executeTestActionOfSendTx: function(action){
        return framework.executeTestActionOfTx(action, )
    },

    beforeSendRawTx: function(action){
        if(action.signTxActions){
            for(let j = 0; j < action.signTxActions.length; j++){
                let signTxResults = action.signTxActions[j].actualResult.result
                for(let i = 0; i < signTxResults.length; i++){
                    let signResult = signTxResults[i].result
                    let signTx = utility.isResponseStatusSuccess(signResult) ? signResult : ''  //如果sign失败，用空字符串做signTx
                    action.txParams.push(signTx)
                }
            }
        }
    },

    executeTestActionOfSendRawTx: function(action){
        return framework.executeTestActionOfTx(action, framework.beforeSendRawTx)
    },

    //endregion

    //if send tx successfully, then sequence need plus 1
    addSequenceAfterResponseSuccess: function(action){
        if(action.txFunctionName == consts.rpcFunctions.sendTx || action.txFunctionName == consts.rpcFunctions.sendRawTx){
            let results = action.actualResult.result
            if(results){
                let lastSuccessIndex = -1
                for(let i = results.length - 1; i >= 0; i--){
                    if(utility.isResponseStatusSuccess(results[i])){
                        lastSuccessIndex = i
                        i = -1
                    }
                }
                if(lastSuccessIndex >= 0){
                    let data = action.txFunctionName == consts.rpcFunctions.sendRawTx
                        ? action.signTxParams[lastSuccessIndex]
                        : action.txParams[lastSuccessIndex]
                    framework.setSequence(null, data.from, data.sequence + 1)  //if send tx successfully, then sequence need plus 1
                }
            }
        }
    },

    executeTxByTestAction: function(testAction){
        logger.debug(testAction.title)
        return testAction.server.getResponse(testAction.server, testAction.txFunctionName, testAction.txParams)
    },

    //endregion

    //region 3. check test actions

    //region check send tx result

    checkTestActionOfSignTx: async function(action){
        framework.checkResponseOfCommon(action)

        //check sign result
        let results = action.actualResult.result
        for(let i = 0; i < results.length; i++){
            let expectedResult = action.expectedResults[i]
            let actualResult = results[i]
            if(expectedResult.needPass){
                let signedTx = actualResult.result
                expect(typeof(signedTx) === 'string').to.be.ok
                expect(utility.isHex(signedTx)).to.be.ok
            }
            else{
                framework.checkResponseError(action, expectedResult, actualResult)
            }
        }
        action.testResult = true
    },

    checkTestActionOfSendTx: async function(action){
        await framework.checkResponseOfTx(action)
    },

    checkResponseOfTx: async function(action){
        //common check, response
        framework.checkResponseOfCommon(action)
        expect(action.actualResult).to.be.jsonSchema(schema.SENDTX_SCHEMA)  //todo tx目前返回多个结果。以后查询也会返回多个结果，这个检查应加入framework.checkResponse

        //every result
        let params = []
        let k = 0
        if(action.txFunctionName === consts.rpcFunctions.sendRawTx && action.signTxActions){
            for(let i = 0; i < action.signTxActions.length; i++){
                let signTxAction = action.signTxActions[i]
                params = params.concat(signTxAction.txParams)
                for(let j = 0; j < signTxAction.expectedResults.length; j++){
                    if(signTxAction.expectedResults[j].expectedBalance != undefined){
                        action.expectedResults[k].expectedBalance = signTxAction.expectedResults[j].expectedBalance
                    }
                    k++
                }
            }
        }
        else{
            params = action.txParams
        }
        let actualResults = action.actualResult.result
        let actualLength = actualResults ? actualResults.length : 0
        expect(actualLength).to.be.equals(params.length)

        for(let i = 0; i < action.txParams.length; i++){
            //result match param
            let param = params[i]
            let expectedResult = action.expectedResults[i]
            let actualResult = actualResults[i]
            if(expectedResult.needPass){
                if(actualResult && actualResult.result && utility.isHex(actualResult.result) && !actualResult.error){
                    let hash = actualResult.result
                    let tx = (await utility.getTxByHash(action.server, hash, 0)).result
                    expect(tx.hash).to.be.equal(hash)
                    await framework.compareParamAndTx(param, tx)

                    // if(action.server.mode.restrictedLevel >= restrictedLevel.L5)
                    {
                        let expectedBalance = expectedResult.expectedBalance
                        if(expectedBalance != undefined){
                            let server = action.server
                            let from = param.from
                            let symbol = param.symbol
                            let issuer = param.local ? from : consts.default.issuer
                            await framework.checkBalanceChange(server, from, symbol, issuer, expectedBalance)
                        }
                    }
                }
                else{
                    expect('Not a hash!').to.be.not.ok
                }
            }
            else{
                framework.checkResponseError(action, expectedResult, actualResult)
            }
            action.testResult = true
        }
    },

    checkResponseOfCommon: function(action){
        framework.checkResponse(action.actualResult)
        let params = action.txParams
        let actualResults = action.actualResult.result
        let actualLength = actualResults ? actualResults.length : 0
        expect(actualLength).to.be.equals(params.length)
    },

    // checkSingleResponseOfCommonOneByOne: async function(testCase, txParams, checkFunction, index){
    //     await framework.checkSingleResponseOfCommon(testCase, testCase.actualResult[index], txParams, checkFunction)
    //     index++
    //     if(index < testCase.actualResult.length){
    //         await framework.checkSingleResponseOfCommonOneByOne(testCase, txParams, checkFunction, index)
    //     }
    // },

    // checkSingleResponseOfCommon: async function(testCase, responseOfSendTx, txParams, checkFunction){
    //     framework.checkResponse(testCase.expectedResult.needPass, responseOfSendTx)
    //
    //     //todo need remove OLD_SENDTX_SCHEMA when new chain updates its sendTx response
    //     if(testCase.server.mode.service == serviceType.newChain){
    //
    //         // if(testCase.expectedResult.needPass){
    //         //     expect(responseOfSendTx).to.be.jsonSchema(schema.OLD_SENDTX_SCHEMA)
    //         //     let hashCount = 0
    //         //     for(let i =0; i < responseOfSendTx.result.length; i++){
    //         //         let result = responseOfSendTx.result[i]
    //         //         if(result && utility.isHex(result)){
    //         //             let hash = result
    //         //             hashCount ++
    //         //             // expect(responseOfSendTx).to.be.jsonSchema(schema.SENDTX_SCHEMA)
    //         //             // let hash = responseOfSendTx.result[0]
    //         //             // let hash = responseOfSendTx.result.tx_json.hash  //for swtclib
    //         //             let responseOfGetTx = await utility.getTxByHash(testCase.server, hash, 0)
    //         //             framework.checkResponse(true, responseOfGetTx)
    //         //             expect(responseOfGetTx.result.hash).to.be.equal(hash)
    //         //             await checkFunction(testCase, txParams, responseOfGetTx.result)
    //         //         }
    //         //         else{
    //         //             expect('Not a hash!').to.be.ok
    //         //         }
    //         //     }
    //         //     expect(hashCount).to.be.equal(testCase.txParams.length)
    //         // }
    //         // else{
    //         //     framework.checkResponseError(testCase, responseOfSendTx.message, testCase.expectedResult.expectedError)
    //         // }
    //
    //         if(testCase.expectedResult.needPass){
    //             expect(responseOfSendTx).to.be.jsonSchema(schema.OLD_SENDTX_SCHEMA)
    //             let hashCount = 0
    //             for(let i =0; i < responseOfSendTx.result.length; i++){
    //                 let result = responseOfSendTx.result[i].result
    //                 if(result && utility.isHex(result)){
    //                     let hash = result
    //                     hashCount ++
    //                     // expect(responseOfSendTx).to.be.jsonSchema(schema.SENDTX_SCHEMA)
    //                     // let hash = responseOfSendTx.result[0]
    //                     // let hash = responseOfSendTx.result.tx_json.hash  //for swtclib
    //                     let responseOfGetTx = await utility.getTxByHash(testCase.server, hash, 0)
    //                     framework.checkResponse(true, responseOfGetTx)
    //                     expect(responseOfGetTx.result.hash).to.be.equal(hash)
    //                     await checkFunction(testCase, txParams, responseOfGetTx.result)
    //                 }
    //                 else{
    //                     expect('Not a hash!').to.be.ok
    //                 }
    //             }
    //             expect(hashCount).to.be.equal(testCase.txParams.length)
    //         }
    //         else{
    //             framework.checkResponseError(testCase, responseOfSendTx, testCase.expectedResult.expectedError)
    //         }
    //     }
    //     else{
    //         if(testCase.expectedResult.needPass){
    //             expect(responseOfSendTx).to.be.jsonSchema(schema.SENDTX_SCHEMA)
    //             let hash = responseOfSendTx.result.hash  //for swtclib
    //             await utility.getTxByHash(testCase.server, hash, 0).then(async function(responseOfGetTx){
    //                 framework.checkResponse(true, responseOfGetTx)
    //                 // expect(responseOfGetTx.result).to.be.jsonSchema(schema.TX_SCHEMA)
    //                 expect(responseOfGetTx.result.hash).to.be.equal(hash)
    //                 await checkFunction(testCase, txParams, responseOfGetTx.result)
    //             }, function (err) {
    //                 expect(err).to.be.ok
    //             })
    //         }
    //         else{
    //             expect(responseOfSendTx).to.be.jsonSchema(schema.SENDTX_SCHEMA)
    //             let expectedResult = testCase.expectedResult.expectedError
    //             framework.compareEngineResults(expectedResult, responseOfSendTx.result)
    //         }
    //     }
    // },

    // compareEngineResults: function(result1, result2){
    //     expect(result2.engine_result).to.equals(result1.engine_result)
    //     expect(result2.engine_result_code).to.equals(result1.engine_result_code)
    //     expect(result2.engine_result_message).to.equals(result1.engine_result_message)
    // },

    // getBalanceValue: function(balanceObject){
    //     if(balanceObject){
    //         if(balanceObject.value){
    //             return Number(balanceObject.value.toString())
    //         }
    //         else{
    //             return Number(balanceObject.toString())
    //         }
    //     }
    //     else{
    //         return 0
    //     }
    // },

    // checkTestCaseOfMintOrBurn: async function(testCase){
    //     await framework.checkResponseOfCommon(testCase, testCase.txParams, async function(testCase, txParams, tx){
    //         let params = txParams[0]
    //         let balanceAfterExecution = (await testCase.server.getBalance(testCase.server, params.from, params.symbol)).value
    //         testCase.balanceAfterExecution = balanceAfterExecution
    //         let oldBalance = framework.getBalanceValue(testCase.balanceBeforeExecution)
    //         let newBalance = balanceAfterExecution
    //         if(params.type === consts.rpcParamConsts.issueCoin){
    //             expect(newBalance).to.be.equals(newBalance + Number(params.total_supply))
    //         }
    //         else{
    //             expect(newBalance).to.be.equals(newBalance + Number(params.value))
    //         }
    //
    //         logger.debug("balanceAfterExecution:" + JSON.stringify(testCase))
    //         logger.debug("balanceAfterExecution, symbol:" + params.symbol)
    //         logger.debug("balanceAfterExecution:" + JSON.stringify(balanceAfterExecution))
    //
    //         expect(false).to.be.ok
    //         // expect(true).to.be.ok
    //     })
    // },

    //endregion

    //region common check system for sequence and ipfs test
    checkTestCase: async function(testCase){
        await framework.checkTestCaseOneByOne(testCase, 0)
    },

    checkTestCaseOneByOne: async function(testCase, index){
        let check = testCase.checks[index]
        if(check.title) logger.debug('Checking ' + check.title + ' ...')
        if(check.checkFunction) await check.checkFunction(testCase, check)
        if(check.title) logger.debug('Check ' + check.title + ' done!')
        index++
        if(index < testCase.checks.length) {
            await framework.checkTestCaseOneByOne(testCase, index)
        }
    },
    //endregion

    //endregion

    //region 4. test scripts

    testTestScripts: function(server, describeTitle, testScripts) {
        describeTitle = '【' + describeTitle + '】'
        let testMode = server.mode.testMode
        if(!testMode || testMode == testModeEnums.batchMode){
            framework.testOnBatchMode(server, describeTitle, testScripts)
        }
        else if (testMode == testModeEnums.singleMode) {
            framework.testOnSingleMode(server, describeTitle, testScripts)
        }
        else{
            logger.debug("No special test mode!")
        }
    },

    //region batch mode

    testOnBatchMode: function(server, describeTitle, testScripts){
        describe(describeTitle, async function () {

            before(async function() {
                await framework.execEachTestScript(testScripts, 0)  //NOTICE!!! the execute method must RETURN a promise, then batch mode can work!!!
            })

            testScripts.forEach(async function(testScript){
                it(testScript.title, async function () {
                    try{
                        let testResult = true
                        for(let i = 0; i < testScript.actions.length; i++){
                            let action = testScript.actions[i]
                            // logger.debug('===before checkFunction')
                            // logger.debug('hasExecuted: ' + testScript.hasExecuted)
                            if(action.checkFunction) await action.checkFunction(action)
                            // logger.debug('===after checkFunction')
                            if(action.testResult != undefined && !action.testResult) {
                                testResult = false
                            }
                        }
                        testScript.testResult = testResult
                        framework.afterTestFinish(testScript)
                    }
                    catch(ex){
                        framework.afterTestFinish(testScript)
                        throw ex
                    }
                })
            })

        })
    },

    execEachTestScript: async function(testScripts, index){
        if(index < testScripts.length){
            let testScript = testScripts[index]
            // logger.debug("===1. index: " + index )
            // logger.debug('=== before executeFunction')
            testScript.hasExecuted = true
            for(let i = 0; i < testScript.actions.length; i++){
                let action = testScript.actions[i]
                if(action.executeFunction) await action.executeFunction(action)
            }
            // logger.debug('=== after executeFunction')
            // logger.debug("===2. index: " + index )
            index++
            await framework.execEachTestScript(testScripts, index)
            // logger.debug("===3. index: " + index )
        }
    },

    //endregion

    //region single mode

    testOnSingleMode: function(server, describeTitle, testScripts) {
        describe(describeTitle, async function () {
            testScripts.forEach(async function(testScript){
                it(testScript.title, async function () {
                    try{
                        let testResult = true
                        for(let i = 0; i < testScript.actions.length; i++){
                            let action = testScript.actions[i]
                            if(action.executeFunction) await action.executeFunction(action)
                            if(action.checkFunction) await action.checkFunction(action)
                            if(action.testResult != undefined && !action.testResult) {
                                testResult = false
                            }
                        }
                        testScript.testResult = testResult
                        framework.afterTestFinish(testScript)
                    }
                    catch(ex){
                        framework.afterTestFinish(testScript)
                        throw ex
                    }
                })
            })
        })
    },

    //endregion

    //region common

    afterTestFinish: function(testScript){
        if(framework.checkIfAllTestHasBeenExecuted(_FullTestCaseList)){
            framework.closeTest(testScript)
        }
        framework.printTestScript(testScript)
    },

    checkIfAllTestHasBeenExecuted: function(testScripts){
        let result = true
        // let hasExecutedCount = 0
        // let clearCount = 0
        // let clearList = []
        testScripts.forEach((testScript)=>{
            if(!testScript.hasExecuted){
                result = false
                // clearCount++
                // clearList.push(testScript)
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

    printTestScript: function(testScript){
        logger.debug('---script title: ' + testScript.title)      //important logger
        logger.debug('---test precondition: ' + testScript.testCase.precondition)
        logger.debug('---test input: ' + testScript.testCase.input)
        logger.debug('---test expectedOutput: ' + testScript.testCase.expectedOutput)
        logger.debug('---supportedServices: ' + JSON.stringify(testScript.supportedServices))
        logger.debug('---supportedInterfaces: ' + JSON.stringify(testScript.supportedInterfaces))
        logger.debug('---restrictedLevel: ' + JSON.stringify(testScript.restrictedLevel))
        // logger.debug('---hasExecuted: ' + testScript.hasExecuted)
        logger.debug('---testResult: ' + testScript.testResult)
        for(let i = 0; i < testScript.actions.length; i++){
            let action = testScript.actions[i]
            logger.debug('---txFunctionName[' +i + ']: ' + JSON.stringify(action.txFunctionName))
            logger.debug('---txParams[' +i + ']: ' + JSON.stringify(action.txParams))
            logger.debug('---result[' +i + ']: ' + JSON.stringify(action.actualResult))
            logger.debug('---testResult[' +i + ']: ' + action.testResult)
        }
    },

    ifNeedExecuteOrCheck: function(testScript){
        if(!testScript){
            logger.debug("Error: test case doesn't exist!")
        }
        if(testScript.server.mode.restrictedLevel < testScript.restrictedLevel){
            return false
        }
        else if(!(!testScript.supportedServices || testScript.supportedServices.length == 0)
            && !utility.ifArrayHas(testScript.supportedServices, testScript.server.mode.service)){
            return false
        }
        else if(!(!testScript.supportedInterfaces || testScript.supportedInterfaces.length == 0)
            && !utility.ifArrayHas(testScript.supportedInterfaces, testScript.server.mode.interface)){
            return false
        }
        else if(testScript.txFunctionName == consts.rpcFunctions.signTx
            && testScript.server.mode.service == serviceType.oldChain){
            return false
        }
        else{
            return true
        }
    },

    startWork: function(){
        //region ===record start time===
        logger.info("======Start testing!======")
        START = new Date()
        END = new Date()
        logger.info("Start time: " + START.toTimeString())
        //endregion
    },

    stoptWork: function(testScript){
        //region ===record stop time===
        if(testScript){
            logger.info("---Test script done!")
        }
        else{
            logger.info("======End testing!======")
        }

        END = new Date()
        logger.info("Start time: " + START.toTimeString())
        logger.info("End time: " + END.toTimeString())
        let time = utility.duration2Time(START, END)
        logger.info("Consume time: " + (END - START) / 1000 + 's, equals to ' + utility.printTime(time) + '!')
        logger.info('Closing server ...')
        //endregion
    },

    closeTest: function(testScript){
        testScript.server.close()
        framework.stoptWork(testScript)
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
    checkBalanceChange: async function(server, from, symbol, issuer, expectedBalance){
        let balanceResponse = await server.responseBalance(server, from, symbol, issuer)
        let balance = balanceResponse.result.balance
        let actualValue = balance.value
        let paramValueObject = utility.parseShowValue(expectedBalance)
        let expectedValue

        if(!symbol || symbol == consts.default.nativeCoin){
            if(expectedBalance.indexOf(consts.default.nativeCoin) != -1){ //contains "SWT"
                expectedValue = (Number(paramValueObject.amount) * Math.pow(10, consts.default.nativeCoinDecimals)).toFixed()
            }
            else{
                expectedValue = paramValueObject.amount.toString()
            }
        }
        else{
            if(expectedBalance.indexOf(symbol) != -1){
                expectedValue = (Number(paramValueObject.amount) * Math.pow(10, consts.default.tokenDecimals)).toFixed()
            }
            else{
                expectedValue = paramValueObject.amount.toString()
            }
        }

        logger.debug('---checkBalanceChange, balance: ' + actualValue + ' | expectedBalance: ' + expectedValue)
        expect(actualValue).to.be.equal(expectedValue)
    },
    //endregion

    //region normal response check

    //region compare
    compareTxs: function(tx1, tx2){
        expect(tx1.Account).to.be.equals(tx2.Account)
        expect(tx1.Destination).to.be.equals(tx2.Destination)
        expect(tx1.Fee).to.be.equals(tx2.Fee)
        expect(tx1.Amount.value).to.be.equals(tx2.Amount.value)
        expect(tx1.Amount.currency).to.be.equals(tx2.Amount.currency)
        expect(tx1.Amount.issuer).to.be.equals(tx2.Amount.issuer)
        expect(JSON.stringify(tx1.Memos)).to.be.equals(JSON.stringify(tx2.Memos))
        expect(tx1.Sequence).to.be.equals(tx2.Sequence)
        expect(tx1.inLedger).to.be.equals(tx2.inLedger)
        expect(tx1.date).to.be.equals(tx2.date)
        expect(tx1.hash).to.be.equals(tx2.hash)
        expect(tx1.TransactionType).to.be.equals(tx2.TransactionType)
        if(tx1.TransactionType == consts.rpcParamConsts.issueCoin){
            expect(tx1.Name).to.be.equals(tx2.Name)
            expect(tx1.Decimals).to.be.equals(Number(tx2.Decimals))
            expect(tx1.TotalSupply.value).to.be.equals(tx2.TotalSupply.value)
            expect(tx1.TotalSupply.currency).to.be.equals(tx2.TotalSupply.currency)
            expect(tx1.TotalSupply.issuer).to.be.equals(tx2.TotalSupply.issuer)
            expect(tx1.Flags).to.be.equals(tx2.Flags)
        }
    },

    compareParamAndTx: function(param, tx){
        expect(tx.Account).to.be.equals(param.from)
        expect(tx.Destination).to.be.equals(param.to)
        expect(tx.Fee).to.be.equals(param.fee ? param.fee : consts.default.fee.toString())
        expect(tx.Sequence).to.be.equals(param.sequence)

        //region check value
        if(tx.Amount){
            framework.compareValueByParamAndTx(param.value, tx.Amount)
        }
        //endregion

        if(param.memos) expect(utility.compareMemos(param.memos, tx.Memos)).to.be.ok
        if(param.type) expect(tx.TransactionType).to.be.equals(param.type)
        if(param.type == consts.rpcParamConsts.issueCoin){
            expect(tx.Name).to.be.equals(param.name)
            expect(tx.Decimals).to.be.equals(Number(param.decimals))
            let symbolStart = param.total_supply.indexOf('/')
            if(symbolStart != -1){
                let paramTotalSupply = Number(param.total_supply.substring(0, symbolStart)) * Math.pow(10, Number(param.decimals))
                expect(tx.TotalSupply.value).to.be.equals(paramTotalSupply.toString())
            }
            else{
                expect(tx.TotalSupply.value).to.be.equals(param.total_supply)
            }
            expect(tx.TotalSupply.currency).to.be.equals(param.symbol)
            expect(tx.TotalSupply.issuer).to.be.equals((param.local) ? param.from : consts.default.issuer)
            expect(tx.Flags).to.be.equals(param.flags)  //todo need restore after bug fixing
        }
    },

    compareValueByParamAndTx(paramValue, txAmount){
        let paramValueObject = utility.parseShowValue(paramValue)
        if(paramValueObject.symbol == consts.default.nativeCoin){
            if(paramValue.indexOf(consts.default.nativeCoin) != -1){ //contains "SWT"
                expect(txAmount.value).to.be.equals(
                    (Number(paramValueObject.amount) * Math.pow(10, consts.default.nativeCoinDecimals)).toFixed(0)
                )
            }
            else{
                expect(Number(txAmount.value)).to.be.equals(Number(paramValueObject.amount))
            }
            expect(txAmount.issuer).to.be.equals(consts.default.issuer)
        }
        else{
            expect(txAmount.value).to.be.equals((Number(paramValueObject.amount)
                * Math.pow(10, consts.default.tokenDecimals)).toFixed())
        }
        expect(txAmount.currency).to.be.equals(paramValueObject.symbol)
    },

    //todo to be removed
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
                // if(realValue.symbol != consts.default.nativeCoin){
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
                    if(realValue.symbol == consts.default.nativeCoin){
                        if(txParams.value.indexOf(consts.default.nativeCoin) != -1){//expected '1000000' to equal '1/SWT'
                            expect(tx.Amount.value).to.be.equals((realValue.amount * consts.swtConsts.oneSwt).toFixed(0))
                        }
                        else{
                            expect(tx.Amount.value).to.be.equals(txParams.value)
                        }
                    }
                    else{
                        expect(tx.Amount.value).to.be.equals((realValue.amount * Math.pow(10, consts.default.tokenDecimals)).toFixed(0))
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

    //region check response

    checkResponse: function(actualResult){
        expect(actualResult).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
        // expect(value.status).to.equal(isSuccess ? status.success: status.error)
        // expect(utility.isResponseStatusSuccess(action.actualResult)).to.equal(isSuccess)
    },

    checkResponseError: function(action, expectedResult, actualResult){
        if(NEED_CHECK_ExpectedResult
            && action.server.mode.restrictedLevel >= restrictedLevel.L3){
            expect(action.actualResult).to.be.jsonSchema(schema.ERROR_SCHEMA)
            framework.checkError(expectedResult.expectedError, actualResult)
        }
    },

    checkError: function(expectedError, actualError){
        expect(actualError).to.be.jsonSchema(schema.ERROR_SCHEMA)
        if(actualError.result){  //if actualResult is the outside result
            let compoundError = framework.getError(1000)
            expect(actualError.status).to.equals(compoundError.status)
            expect(actualError.type.toLowerCase()).to.equals(compoundError.type.toLowerCase())
            let results = actualError.result
            if(results){
                for(let i = 0; i < results.length; i++){
                    let result = results[i]
                    framework.compareErrorResult(expectedError, result)
                }
            }
        }
        else{
            framework.compareErrorResult(expectedError, actualError)
        }
    },

    compareErrorResult: function(expectedError, actualError){
        expect(actualError).to.be.jsonSchema(schema.ERROR_SCHEMA)
        expect(actualError.status).to.equals(expectedError.status)
        expect(actualError.type.toLowerCase()).to.equals(expectedError.type.toLowerCase())
        expect(actualError.error.description).to.equals(expectedError.description)
        expect(actualError.error.information).to.contains(expectedError.information)
    },

    //endregion

    //endregion

    //region common functions

    //region process sequence

    //region getSequence
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
                remote_sequence = accountInfo.result ? Number(accountInfo.result.Sequence) : -1
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

            if(testCase.resetSequence){
                await utility.timeout(6000)
                for(let i = 0; i < subCases.length; i++){
                    framework.setSequence(server, subCases[i].from, -1)
                }
            }

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
                            result = await server.getResponse(server, consts.rpcFunctions.sendRawTx, [result.result[0].result])
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

        let startTxHash = testCase.otherParams.successResults[0].result[0].result
        let startTx = await utility.getTxByHash(server, startTxHash)
        let startBlockNumber = startTx.result.ledger_index

        let endTxHash = testCase.otherParams.successResults[testCase.otherParams.successResults.length - 1].result[0].result
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

            if(testCase.resetSequence){
                await utility.timeout(6000)
                for(let i = 0; i < subCases.length; i++){
                    framework.setSequence(server, subCases[i].from, -1)
                }
            }

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
        expect(totalSuccessCount + totalFailCount).to.be.equal(totalCount)

        if(!testCase.resetSequence){
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
        }
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
                logger.debug("=== block " + i + " done!")
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

}

