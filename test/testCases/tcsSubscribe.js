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
const utility = require('../framework/testUtility')
//endregion
const chainDatas = require('../testData/chainDatas')
//endregion

const actionTypes = {
    sendTx:consts.rpcFunctions.sendTx,
    signTx:consts.rpcFunctions.signTx,
    sendRawTx:consts.rpcFunctions.sendRawTx,
    subscribe:consts.rpcFunctions.subscribe,
    unsubscribe:consts.rpcFunctions.unsubscribe,
    list:consts.rpcFunctions.listSubscribe,
}
const outputType = {
    unknown: 0,
    result: 1,
    block: 2,
    hash: 3,
    tx: 4,
    error: 5,
}
const Not_Used_Address = 'j9t5tjAawNoAxgn7FudkaKTo7GjD3HqvtH'
const Wrong_Format_Address = Not_Used_Address + '_1'
const Subscribe_Timeout = 1000
const If_Check_Error = false

module.exports = tcsSubscribe = {

    //region 说明
    // 1. subscribe测试是把一个测试script拆分成不同的子动作（action），分别执行和检查
    // 2. action主要有如下4种，参考actionTypes
    // 1) subscribe
    // 2) unsubscribe
    // 3) list
    // 4) send txs
    // 3. 一般执行一个action之前，把当前的ws的subscribe输出信息保存为上一个action的执行结果
    // 4. 一般情况下，发送交易action会同时检查block和action，通过receiveBlock和receiveTx来判断是否应该收到
    //endregion

    //region common

    //region main

    // createSingleTestCase: function(server, title, actions, needPass, expectedError){
    //     let testCase = framework.createTestCase(
    //         title,
    //         server,
    //         null,
    //         null,
    //         null,
    //         tcsSubscribe.executeForSubscribe,
    //         tcsSubscribe.checkForSubscribe,
    //         {needPass: needPass, isErrorInResult: true, expectedError: expectedError},
    //         restrictedLevel.L2,
    //         [serviceType.newChain],
    //         [interfaceType.websocket],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
    //     )
    //
    //     testCase.actions = actions
    //
    //     return testCase
    // },

    createTestScript: function(server, testCaseCode, scriptCode, txFunctionName, actions){

        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        let mainAction = framework.createTestAction(testScript, txFunctionName, [],
            tcsSubscribe.executeForSubscribe,
            tcsSubscribe.checkForSubscribe,
            [{needPass: true}])

        mainAction.actions = actions

        testScript.actions.push(mainAction)

        return testScript
    },

    executeForSubscribe: async function(mainAction){
        mainAction.hasExecuted = true
        return new Promise(async (resolve, reject) => {
            logger.debug('=== ' + mainAction.title)

            //new ws
            let ws = mainAction.server.newWebSocket(mainAction.server)

            //execute actions
            for(let i = 0; i < mainAction.actions.length; i++){

                // 执行本次action
                let action = mainAction.actions[i]
                logger.debug('=== Executing action ' + i + '. ' + action.type)
                if(action.type == actionTypes.sendTx
                    || action.type == actionTypes.signTx
                    || action.type == actionTypes.sendRawTx){  // send txs
                    mainAction.server.clearSub() //因为sendTx不走subscribe，因此必须在这里执行清空上一次sub的动作。
                    // logger.debug('mainAction.server.getOutputs().sub: ' + mainAction.server.getOutputs().sub.length)
                    let server = mainAction.server

                    let txParams = await utility.updateSequenceInTxParams(server, action.txParams, )
                    if(action.type == actionTypes.sendTx){
                        action.hashes = await utility.sendTxs(server, txParams, action.txCount)
                    }
                    else if (action.type == actionTypes.signTx || action.type == actionTypes.sendRawTx){
                        let rawTxResponse = await server.getResponse(server, consts.rpcFunctions.signTx, txParams)
                        let rawTx = rawTxResponse.result[0].result
                        if (action.type == actionTypes.signTx){
                            action.result = rawTx
                        }
                        else if (action.type == actionTypes.sendRawTx){
                            let rawParams = []
                            rawParams.push(rawTx)
                            let response = await server.getResponse(server, consts.rpcFunctions.sendRawTx, rawParams)
                            action.hashes = response.result
                        }
                    }

                    if(action.receiveTx){
                        mainAction.realHashes = action.hashes
                    }
                    else{
                        mainAction.fakeHashes = action.hashes
                    }
                }else {  // execute subscribe/unsubscribe/listsubscribe
                    await mainAction.server.subscribe(ws, action.type, action.txParams)
                }

                // 执行timeout
                logger.debug('=== Waiting for ' + action.timeout + '!')
                await utility.timeout(action.timeout)

                //保存这个action的执行结果
                logger.debug(JSON.stringify(mainAction.server.getOutputs()))
                action.output = utility.deepClone(mainAction.server.getOutputs().sub)  //必须现在调用getOutputs()获取最新的output，不能用变量
            }

            //close ws
            let outputs = await mainAction.server.closeWebSocket(ws)
            // if(mainAction.actions.length > 0){
            //     mainAction.actions[mainAction.actions.length - 1].output = outputs.sub
            // }
            mainAction.actualResult.push(outputs.all)
            resolve(mainAction)
        })
    },

    checkForSubscribe: function(mainAction){
        for(let i = 0; i < mainAction.actions.length; i++){
            let action = mainAction.actions[i]
            logger.debug('=== Checking action ' + i + '. ' + action.type)
            if(action.checkFunction){
                action.checkFunction(action)
            }
        }
    },

    //endregion

    //region utility

    getCoinFullName: function(coin){
        return tcsSubscribe.createCoinFullName(coin.symbol, coin.issuer)
    },

    createCoinFullName: function(symbol, issuer){
        return symbol + '/' + issuer
    },

    //endregion

    //region create tx action

    createRealTxAction: function(server){
        return tcsSubscribe.createTxAction(server.mode.addresses.sender1, server.mode.addresses.receiver1, true)
    },

    createFakeTxAction: function(server){
        return tcsSubscribe.createTxAction(server.mode.addresses.sender2, server.mode.addresses.receiver2, false)
    },

    createTxAction: function(sender, receiver, receiveTx){
        return {type: actionTypes.sendTx,
            txParams:[{
                from: sender.address,
                secret: sender.secret,
                to: receiver.address,
                value: '1',
            }],
            txCount: 5,
            timeout: 7000,
            // checkFunction: tcsSubscribe.checkForSubscribeBlock,
            checkFunction: function(action){
                tcsSubscribe.checkForSubscribeBlock(action)
                tcsSubscribe.checkForSubscribeTx(action)
            },
            expectedResult: {needPass: true, isErrorInResult: true, expectedError: ''},
            receiveBlock: false,
            receiveTx: receiveTx,
        }
    },

    createTokenAction: function(sender, token, local){
        return {type: actionTypes.sendTx,
            txParams:[{
                from: sender.address,
                secret: sender.secret,
                type: 'IssueCoin',
                name: token.name,
                symbol: token.symbol,
                decimals: "8",
                total_supply: "99999901/" + token.symbol,
                local: local,
                flags: consts.flags.both,
            }],
            txCount: 1,
            timeout: 7000,
            // checkFunction: tcsSubscribe.checkForSubscribeBlock,
            checkFunction: function(action){
                tcsSubscribe.checkForSubscribeBlock(action)
                tcsSubscribe.checkForSubscribeTx(action)
            },
            expectedResult: {needPass: true, isErrorInResult: true, expectedError: ''},
            receiveBlock: false,
            receiveTx: true,
        }
    },

    //endregion

    //region messages
    filterSubscribeMessages: function(messages){
        let filterMessages = {}
        filterMessages.blocks = []
        filterMessages.txs = []
        filterMessages.hashes = []
        filterMessages.results = []
        filterMessages.errors = []
        filterMessages.others = []

        for(let i = 0; i < messages.length; i++){
            let message = messages[i]
            if(message.fee_base){
                filterMessages.blocks.push(message)
                message.outputType = outputType.block
            }
            else if(message.engine_result){
                filterMessages.txs.push(message)
                message.outputType = outputType.tx
            }
            else if(message.result){
                if(!utility.isArray(message.result) && utility.isHex(message.result)){  //{"id":4,"jsonrpc":"2.0","message":"invalid parameters","result":"","status":-278,"outputIndex":0}
                    filterMessages.hashes.push(message)
                    message.outputType = outputType.hash
                }
                else{
                    filterMessages.results.push(message)
                    message.outputType = outputType.result
                }
            }
            else if(message.status){//{"id":4,"jsonrpc":"2.0","message":"invalid parameters","result":"","status":-278,"outputIndex":0}
                filterMessages.errors.push(message)
                message.outputType = outputType.error
            }
            else{
                filterMessages.others.push(message)
                message.outputType = outputType.unknown
            }
        }

        if(false){
            logger.debug('resuls: ' + JSON.stringify(filterMessages.results))
            logger.debug('hashes: ' + JSON.stringify(filterMessages.hashes))
            logger.debug('others: ' + JSON.stringify(filterMessages.others))
            logger.debug('blocks: ' + filterMessages.blocks.length)
            logger.debug('txs: ' + filterMessages.txs.length)
        }

        return filterMessages
    },

    findMessage: function(messages, type, sequence){
        for(let i = 0; i < messages.length; i++){
            let message = messages[i]
            if(type == actionTypes.subscribe && message.result.indexOf('subscribed') != -1
                || type == actionTypes.unsubscribe && message.result.indexOf('unsubscribed') != -1
            ){
                return message
            }
        }
        return null
    },

    //endregion

    //region common check

    checkForResult: function(action, successTx){
        let messages = tcsSubscribe.filterSubscribeMessages(action.output)

        if(action.expectedResult.needPass){
            let results = messages.results
            expect(results[0].result).to.be.contains(action.txParams[0] + ' ' + successTx)
        }
        else{
            //{"id":4,"jsonrpc":"2.0","message":"invalid parameters","result":"","status":-278,"outputIndex":0}
            let errors = messages.errors
            if(If_Check_Error){
                expect(errors.length).to.be.least(1)
                framework.checkError(action.expectedResult.expectedError, errors[0])
                // expect(errors[0].status).to.be.equals(action.expectedResult.expectedError.status)
                // expect(errors[0].message).to.contains(action.expectedResult.expectedError.message)
                // expect(errors[0].result).to.be.equals(action.expectedResult.expectedError.result)
            }
        }
    },

    checkForBlocks: function(action){
        let messages = tcsSubscribe.filterSubscribeMessages(action.output)
        let blocks = messages.blocks
        if(action.receiveBlock){
            let min = 1
            let max = 2
            if(action.timeout > 5000 && action.timeout <= 10000){
                min = 1
                max = 2
            }
            else if(action.timeout > 10000 && action.timeout < 15000){
                min = 2
                max = 3
            }
            else{
                expect('Action\'s timeout is not in range (5000, 15000)!').to.be.okay
            }
            expect(blocks.length).to.be.least(min)    //11s, should have 2 or 3 blocks
            expect(blocks.length).to.be.most(max)

            let start = blocks[0].ledger_index
            blocks.forEach(block => {
                expect(block.ledger_index).to.be.equals(start++)
            })
        }
        else{
            expect(blocks.length).to.be.equals(0)
        }
    },

    checkForTxs: function(action){
        let messages = tcsSubscribe.filterSubscribeMessages(action.output)
        let txs = []
        let receivedHashes = []
        txs = txs.concat(messages.txs)
        txs = txs.concat(messages.hashes)
        if(txs){
            txs.forEach(tx => {
                if(tx.result){
                    receivedHashes.push(tx.result)
                }
                else if (tx.transaction && tx.transaction.hash){
                    receivedHashes.push(tx.transaction.hash)
                }
            })
        }

        if(action.receiveTx){
            let realHashes = action.hashes
            expect(receivedHashes.length).to.be.least(action.txCount)  //有可能链上同时有其他交易在跑
            if(realHashes){
                realHashes.forEach(realHash => {
                    expect(receivedHashes).to.be.contains(realHash.result)
                })
            }
        }
        else{
            let fakeHashes = action.fakeHashes
            expect(receivedHashes.length).to.be.equals(0)
            if(fakeHashes){
                fakeHashes.forEach(fakeHash => {
                    expect(receivedHashes).to.not.be.contains(fakeHash)
                })
            }
        }
    },

    //endregion

    //endregion

    //region subscribe

    testForSubscribe: function(server, describeTitle){

        //region fields
        let testScripts = []
        let testCaseCode
        let defaultScriptCode = '000100'
        let scriptCode
        let txFunctionName = consts.rpcFunctions.subscribe
        let testScript
        let action
        let actions = []

        let globalCoin = server.mode.coins[0]
        let localCoin = server.mode.coins[1]

        let chainData = utility.findChainData(chainDatas.chainDatas, server.mode.chainDataName)
        let glabolSameCoin = chainData.sameSymbolCoins.glabol
        let localSameCoin1 = chainData.sameSymbolCoins.local1
        let localSameCoin2 = chainData.sameSymbolCoins.local2

        let from = server.mode.addresses.sender1
        let to = server.mode.addresses.receiver1

        let sender = server.mode.addresses.sender1
        let receiver = server.mode.addresses.receiver1
        let token = utility.getDynamicTokenName()
        token.issuer = sender.address
        //endregion

        //region block

        testScripts = []

        testCaseCode = 'FCJT_subscribe_000010'
        scriptCode = defaultScriptCode + '_订阅区块'
        {
            actions = []
            actions.push({type: actionTypes.subscribe,
                txParams: ['block'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            action = tcsSubscribe.createRealTxAction(server)
            action.timeout = 11000
            action.receiveBlock = true
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000011'
        scriptCode = defaultScriptCode + '_订阅区块，带无效的订阅参数'
        {
            actions = []
            actions.push({type: actionTypes.subscribe,
                txParams: ['block', 'abcd'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: framework.getError(-278, 'invalid parameters')},
            })
            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000012'
        scriptCode = defaultScriptCode + '_重复订阅区块'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['block'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['block'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.timeout = 11000
            action.receiveBlock = true
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)

        }

        framework.testTestScripts(server, describeTitle + '_订阅block', testScripts)

        //endregion

        //region tx

        testScripts = []

        testCaseCode = 'FCJT_subscribe_000020'
        scriptCode = defaultScriptCode + '_订阅交易'
        {
            actions = []
            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000021'
        scriptCode = defaultScriptCode + '_订阅交易，带无效的订阅参数'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['tx', 'abcd'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: framework.getError(-278, 'invalid parameters')},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000022'
        scriptCode = defaultScriptCode + '_重复订阅交易'
        {
            actions = []
            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000024'
        scriptCode = defaultScriptCode + '_订阅交易，signTx'
        {
            actions = []
            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.type = actionTypes.signTx
            action.txCount = 1
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000024'
        scriptCode = '000200' + '_订阅交易，signTx并且sendRawTx'
        {
            actions = []
            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.type = actionTypes.signTx
            action.txCount = 1
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            action = tcsSubscribe.createRealTxAction(server)  // 注意：不能用clone，function无法clone
            action.type = actionTypes.sendRawTx
            action.txCount = 1
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle + '_订阅tx', testScripts)

        //endregion

        //region not work

        testScripts = []

        testCaseCode = 'FCJT_subscribe_000030'
        scriptCode = defaultScriptCode + '_订阅-无效的内容：参数为\'abcd\''
        {
            actions = []
            actions.push({type: actionTypes.subscribe,
                txParams: ['abcd'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: framework.getError(-278, 'no such topic')},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000030'
        scriptCode = '000200' + '_订阅-无效的内容：参数为\'\''
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: [''],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: framework.getError(-278, 'no such topic')},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000030'
        scriptCode = '000300' + '_订阅-无效的内容：参数为超长字符串'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['12312312313212312312313131adfasdfaskdfajsfoieurowarolkdjasfldjf'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: framework.getError(-278, 'no such topic')},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000040'
        scriptCode = defaultScriptCode + '_订阅-内容为空'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: [],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: framework.getError(-269, 'no parameters')},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle + '_无效订阅', testScripts)

        //endregion

        //region multi subscribes

        testScripts = []

        testCaseCode = 'FCJT_subscribe_000050'
        scriptCode = defaultScriptCode + '_已订阅区块时再订阅交易'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['block'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = true
            action.receiveTx = true
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000060'
        scriptCode = defaultScriptCode + '_已订阅交易时再订阅区块'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['block'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = true
            action.receiveTx = true
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle + '_多个订阅', testScripts)

        //endregion

        //region token

        testScripts = []

        testCaseCode = 'FCJT_subscribe_000070'
        scriptCode = defaultScriptCode + '_订阅token，不带参数'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, globalCoin)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000080'
        scriptCode = defaultScriptCode + '_订阅token，带有效参数（全局token），参数不带issuer'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', globalCoin.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, globalCoin)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, localCoin)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000080'
        scriptCode = '000200' + '_订阅token，带有效参数（全局token），参数带issuer'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(globalCoin)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, globalCoin)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, localCoin)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000090'
        scriptCode = defaultScriptCode + '_订阅token，带有效参数（本地token）'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localCoin)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, localCoin)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, globalCoin)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000100'
        scriptCode = defaultScriptCode + '_订阅token，带无效参数: token名字超过12字节'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', utility.createMemosWithSpecialLength(13)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, localCoin)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000100'
        scriptCode = '000200' + '_订阅token，带无效参数: token名字正确但issuer地址非法'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', localCoin.symbol + '/' + Wrong_Format_Address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, localCoin)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000110'
        scriptCode = defaultScriptCode + '_订阅token，参数为空: 订阅内容为token，订阅参数为空字符串'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', ''],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, localCoin)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000120'
        scriptCode = defaultScriptCode + '_已订阅交易时再订阅区块'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localCoin)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localCoin)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, localCoin)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000130'
        scriptCode = defaultScriptCode + '_订阅不同的token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localCoin)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', globalCoin.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, localCoin)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, globalCoin)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000140'
        scriptCode = defaultScriptCode + '_已订阅交易时再订阅区块'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', glabolSameCoin.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localSameCoin1)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localSameCoin2)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, glabolSameCoin)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, localSameCoin1)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, localSameCoin2)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, globalCoin)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle + '_订阅token', testScripts)

        //endregion

        //region account

        testScripts = []

        testCaseCode = 'FCJT_subscribe_000150'
        scriptCode = defaultScriptCode + '_订阅account，不带参数'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['account'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000180'
        scriptCode = defaultScriptCode + '_订阅account，带无效参数: 未激活地址'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', server.mode.addresses.inactiveAccount1.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: null},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000180'
        scriptCode = '000200' + '_订阅account，带无效参数: 地址格式错误'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', from.address + '1'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000190'
        scriptCode = defaultScriptCode + '_订阅account，参数为空'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', ''],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000200'
        scriptCode = defaultScriptCode + '_重复订阅相同的account'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', from.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', from.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000210'
        scriptCode = defaultScriptCode + '_订阅不同的account'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', from.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', to.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].from = to.address
            action.txParams[0].secret = to.secret
            action.txParams[0].to = from.address
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            action = tcsSubscribe.createFakeTxAction(server)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle + '_订阅account', testScripts)

        //endregion

        //region issue token

        testScripts = []

        //region token tx

        token = utility.getDynamicTokenName()
        token.issuer = sender.address

        testCaseCode = 'FCJT_subscribe_000023'
        scriptCode = defaultScriptCode + '_订阅tx，发行token，全局token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTokenAction(sender, token, false)
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000023'
        scriptCode = '000200' + '_订阅tx，发送token，全局token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTxAction(sender, receiver, true)
            action.txParams[0].value = utility.getShowValue(1, token.symbol, consts.default.issuer)
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000023'
        scriptCode = '000300' + '_订阅tx，增发token，全局token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTokenAction(sender, token, false)
            action.txParams[0].total_supply = '10'
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000023'
        scriptCode = '000400' + '_订阅tx，销毁token，全局token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTokenAction(sender, token, false)
            action.txParams[0].total_supply = '-10'
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000023'
        scriptCode = '001100' + '_订阅tx，发行token，本地token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTokenAction(sender, token, true)
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000023'
        scriptCode = '001200' + '_订阅tx，发行token，本地token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTxAction(sender, receiver, true)
            action.txParams[0].value = utility.getShowValue(1, token.symbol, token.issuer)
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000023'
        scriptCode = '001300' + '_订阅tx，发行token，本地token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTokenAction(sender, token, true)
            action.txParams[0].total_supply = '10'
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000023'
        scriptCode = '001400' + '_订阅tx，发行token，本地token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTokenAction(sender, token, true)
            action.txParams[0].total_supply = '-10'
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        //endregion

        //region tx token

        token = utility.getDynamicTokenName()
        token.issuer = sender.address

        testCaseCode = 'FCJT_subscribe_000081'
        scriptCode = defaultScriptCode + '_订阅tx，发行token，全局token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', token.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTokenAction(sender, token, false)
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000081'
        scriptCode = '000200' + '_订阅token，发送token，全局token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', token.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTxAction(sender, receiver, true)
            action.txParams[0].value = utility.getShowValue(1, token.symbol, consts.default.issuer)
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000081'
        scriptCode = '000300' + '_订阅token，增发token，全局token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', token.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTokenAction(sender, token, false)
            action.txParams[0].total_supply = '10'
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000081'
        scriptCode = '000400' + '_订阅token，销毁token，全局token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', token.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTokenAction(sender, token, false)
            action.txParams[0].total_supply = '-10'
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000091'
        scriptCode = defaultScriptCode + '_订阅token，发行token，本地token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(token)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTokenAction(sender, token, true)
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000091'
        scriptCode = defaultScriptCode + '_订阅token，发送token，本地token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(token)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTxAction(sender, receiver, true)
            action.txParams[0].value = utility.getShowValue(1, token.symbol, token.issuer)
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000091'
        scriptCode = defaultScriptCode + '_订阅token，增发token，本地token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(token)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTokenAction(sender, token, true)
            action.txParams[0].total_supply = '10'
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000091'
        scriptCode = '000400' + '_订阅token，销毁token，本地token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(token)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTokenAction(sender, token, true)
            action.txParams[0].total_supply = '-10'
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        //endregion

        //region account token

        token = utility.getDynamicTokenName()
        token.issuer = sender.address

        testCaseCode = 'FCJT_subscribe_000162'
        scriptCode = defaultScriptCode + '_订阅account，发行token，全局token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', sender.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTokenAction(sender, token, false)
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000162'
        scriptCode = '000200' + '_订阅account，发行token，本地token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', sender.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTokenAction(sender, token, true)
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000160'
        scriptCode = defaultScriptCode + '_订阅account，带有效参数_01： 发送方地址'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', from.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000161'
        scriptCode = defaultScriptCode + '_订阅account，带有效参数_02： 接收方地址'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', to.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000160'
        scriptCode = '000200' + '_订阅account，发送方地址，发送token，全局token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', sender.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTxAction(sender, receiver, true)
            action.txParams[0].value = utility.getShowValue(1, token.symbol, consts.default.issuer)
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000160'
        scriptCode = '000300' + '_订阅account，发送方地址，发送token，本地token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', sender.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTxAction(sender, receiver, true)
            action.txParams[0].value = utility.getShowValue(1, token.symbol, token.issuer)
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000161'
        scriptCode = '000200' + '_订阅account，接收方地址，发送token，全局token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', receiver.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTxAction(sender, receiver, true)
            action.txParams[0].value = utility.getShowValue(1, token.symbol, consts.default.issuer)
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000161'
        scriptCode = '000300' + '_订阅account，接收方地址，发送token，本地token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', receiver.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTxAction(sender, receiver, true)
            action.txParams[0].value = utility.getShowValue(1, token.symbol, token.issuer)
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000163'
        scriptCode = defaultScriptCode + '_订阅account，增发token，全局token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', sender.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTokenAction(sender, token, false)
            action.txParams[0].total_supply = '10'
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000163'
        scriptCode = '000200' + '_订阅account，增发token，本地token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', sender.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTokenAction(sender, token, true)
            action.txParams[0].total_supply = '10'
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000164'
        scriptCode = defaultScriptCode + '_订阅account，销毁token，全局token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', sender.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTokenAction(sender, token, false)
            action.txParams[0].total_supply = '-10'
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000164'
        scriptCode = defaultScriptCode + '_订阅account，销毁token，本地token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', sender.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTokenAction(sender, token, true)
            action.txParams[0].total_supply = '-10'
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        //endregion

        framework.testTestScripts(server, describeTitle + '_订阅发币', testScripts)

        //endregion

        //region mixed

        testScripts = []

        testCaseCode = 'FCJT_subscribe_000220'
        scriptCode = defaultScriptCode + '_订阅不同的内容，包括tx'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['block'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', globalCoin.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localCoin)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['token', glabolSameCoin.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localSameCoin1)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localSameCoin2)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', from.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['account', to.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            //region block, tx
            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = true
            action.receiveTx = true
            actions.push(action)
            //endregion

            //region token
            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, globalCoin)
            action.receiveBlock = true
            action.receiveTx = true
            actions.push(action)

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, localCoin)
            action.receiveBlock = true
            action.receiveTx = true
            actions.push(action)

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, glabolSameCoin)
            action.receiveBlock = true
            action.receiveTx = true
            actions.push(action)

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, localSameCoin1)
            action.receiveBlock = true
            action.receiveTx = true
            actions.push(action)

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, localSameCoin2)
            action.receiveBlock = true
            action.receiveTx = true
            actions.push(action)
            //endregion

            //region account
            action = tcsSubscribe.createFakeTxAction(server)
            action.receiveBlock = true
            action.receiveTx = true
            actions.push(action)

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = true
            action.receiveTx = true
            actions.push(action)
            //endregion

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000220'
        scriptCode = '000200' + '_订阅不同的内容，不包括tx'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['block'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            // actions.push({type: actionTypes.subscribe,
            //     txParams: ['tx'],
            //     timeout: Subscribe_Timeout,
            //     checkFunction: tcsSubscribe.checkForSubscribeResult,
            //     expectedResult: {needPass: true, expectedError: ''},
            // })

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', globalCoin.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            // actions.push({type: actionTypes.subscribe,
            //     txParams: ['token', tcsSubscribe.getCoinFullName(localCoin)],
            //     timeout: Subscribe_Timeout,
            //     checkFunction: tcsSubscribe.checkForSubscribeResult,
            //     expectedResult: {needPass: true, expectedError: ''},
            // })
            actions.push({type: actionTypes.subscribe,
                txParams: ['token', glabolSameCoin.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localSameCoin1)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localSameCoin2)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            // actions.push({type: actionTypes.subscribe,
            //     txParams: ['account', from.address],
            //     timeout: Subscribe_Timeout,
            //     checkFunction: tcsSubscribe.checkForSubscribeResult,
            //     expectedResult: {needPass: true, expectedError: ''},
            // })
            // actions.push({type: actionTypes.subscribe,
            //     txParams: ['account', to.address],
            //     timeout: Subscribe_Timeout,
            //     checkFunction: tcsSubscribe.checkForSubscribeResult,
            //     expectedResult: {needPass: true, expectedError: ''},
            // })
            actions.push({type: actionTypes.subscribe,
                txParams: ['account', server.mode.addresses.receiver2.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            //region block, tx
            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = true
            action.receiveTx = false
            actions.push(action)
            //endregion

            //region token
            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, globalCoin)
            action.receiveBlock = true
            action.receiveTx = true
            actions.push(action)

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, localCoin)
            action.receiveBlock = true
            action.receiveTx = false
            actions.push(action)

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, glabolSameCoin)
            action.receiveBlock = true
            action.receiveTx = true
            actions.push(action)

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, localSameCoin1)
            action.receiveBlock = true
            action.receiveTx = true
            actions.push(action)

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, localSameCoin2)
            action.receiveBlock = true
            action.receiveTx = true
            actions.push(action)
            //endregion

            //region account
            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = true
            action.receiveTx = false
            actions.push(action)

            action = tcsSubscribe.createFakeTxAction(server)
            action.receiveBlock = true
            action.receiveTx = true
            actions.push(action)
            //endregion

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle + '_混合订阅', testScripts)

        //endregion

    },

    checkForSubscribeResult: function(action){
        tcsSubscribe.checkForResult(action, 'subscribed')
    },

    checkForSubscribeBlock: function(action){
        tcsSubscribe.checkForBlocks(action)
    },

    checkForSubscribeTx: function(action){
        tcsSubscribe.checkForTxs(action)
    },

    //endregion

    //region unsubscribe

    testForUnsubscribe: function(server, describeTitle){

        //region fields
        let testScripts = []
        let testCaseCode
        let defaultScriptCode = '000100'
        let scriptCode
        let txFunctionName = consts.rpcFunctions.subscribe
        let testScript
        let action
        let actions = []

        let globalCoin = server.mode.coins[0]
        let localCoin = server.mode.coins[1]
        let from = server.mode.addresses.sender1
        let to = server.mode.addresses.receiver1
        //endregion

        //region block

        testScripts = []

        testCaseCode = 'FCJT_unsubscribe_000010'
        scriptCode = defaultScriptCode + '_取消订阅区块，订阅内容为block，无订阅参数'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['block'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = true
            action.receiveTx = false
            actions.push(action)

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['block'],
                timeout: 6000,
                checkFunction: tcsSubscribe.checkForUnsubscribeBlock,
                expectedResult: {needPass: true, expectedError: ''},
                receiveBlock: false,
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000011'
        scriptCode = defaultScriptCode + '_client没有订阅区块，但是发送取消订阅区块block请求'
        {
            actions = []

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['block'],
                timeout: 6000,
                checkFunction: tcsSubscribe.checkForUnsubscribeBlock,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
                receiveBlock: false,
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_subscribe_000012'
        scriptCode = defaultScriptCode + '_取消订阅区块，订阅内容为block，订阅参数为任意值'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['block'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = true
            action.receiveTx = false
            actions.push(action)

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['block', 'abcd'],
                timeout: 6000,
                checkFunction: tcsSubscribe.checkForUnsubscribeBlock,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
                receiveBlock: true,
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle + '_退订block', testScripts)

        //endregion

        //region tx

        testScripts = []

        testCaseCode = 'FCJT_unsubscribe_000020'
        scriptCode = defaultScriptCode + '_已订阅交易，取消订阅交易，订阅内容为tx，无订阅参数'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['tx'],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_unsubscribe_000021'
        scriptCode = defaultScriptCode + '_无订阅交易，client没有订阅交易，但是发送取消订阅交易tx请求'
        {
            actions = []

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['tx'],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_unsubscribe_000022'
        scriptCode = defaultScriptCode + '_已订阅区块，取消订阅交易，订阅内容为tx，订阅参数为任意值'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['tx', 'abcd'],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_unsubscribe_000030'
        scriptCode = defaultScriptCode + '_已订阅区块，取消订阅交易，订阅内容为tx，无订阅参数'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['block'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = true
            action.receiveTx = false
            actions.push(action)

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['tx'],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: false, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = true
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle + '_退订tx', testScripts)

        //endregion

        //region not work

        testScripts = []

        testCaseCode = 'FCJT_unsubscribe_000030'
        scriptCode = '000200' + '_已订阅区块block，取消订阅交易tx:已订阅区块，取消订阅交易，订阅内容为tx，无订阅参数'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['block'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = true
            action.receiveTx = false
            actions.push(action)

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['tx'],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: false, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = true
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_unsubscribe_000040'
        scriptCode = defaultScriptCode + '_已订阅交易tx，取消订阅区块block:已订阅交易，取消订阅区块，订阅内容为block，无订阅参数'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['block'],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: false, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_unsubscribe_000050'
        scriptCode = defaultScriptCode + '_已订阅区块block，取消订阅时超长字符串数字'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['block'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = true
            action.receiveTx = false
            actions.push(action)

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['123123sddfasdfaewefsafasdff'],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: false, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = true
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_unsubscribe_000050'
        scriptCode = '000200' + '_已订阅交易tx，取消订阅时超长字符串数字'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['123123sddfasdfaewefsafasdff'],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: false, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_unsubscribe_000060'
        scriptCode = defaultScriptCode + '_取消订阅-订阅内容为空:已订阅区块或交易，取消订阅时订阅内容为空'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['block'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = true
            action.receiveTx = false
            actions.push(action)

            actions.push({type: actionTypes.unsubscribe,
                txParams: [''],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: false, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = true
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_unsubscribe_000060'
        scriptCode = '000200' + '_取消订阅-订阅内容为空:已订阅区块或交易，取消订阅时订阅内容为空'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            actions.push({type: actionTypes.unsubscribe,
                txParams: [''],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: false, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle + '_退订失败', testScripts)

        //endregion

        //region token

        testScripts = []

        testCaseCode = 'FCJT_unsubscribe_000070'
        scriptCode = defaultScriptCode + '_取消订阅token，不带参数:取消订阅内容为token，但不带参数'
        {
            actions = []

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['token'],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"no parameters",result:"",status:-269}},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_unsubscribe_000080'
        scriptCode = defaultScriptCode + '_取消订阅token，参数为空:取消订阅内容为token，但参数为空'
        {
            actions = []

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['token',''],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_unsubscribe_000090'
        scriptCode = defaultScriptCode + '_取消订阅不存在的token:取消订阅内容为token，但参数是不存在的token名字'
        {
            actions = []

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['token','badToken1111'],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"no parameters",result:"",status:-269}},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_unsubscribe_000100'
        scriptCode = defaultScriptCode + '_取消订阅全局token:有订阅的全局token，取消订阅内容为token，参数是某全局token名字'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', globalCoin.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, globalCoin)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['token', globalCoin.symbol],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, globalCoin)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_unsubscribe_000110'
        scriptCode = defaultScriptCode + '_取消订阅带issuer的token_01:有订阅的带issuer的token，取消订阅内容为token，' +
            '参数是token名字/正确的issuer地址'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localCoin)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, localCoin)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localCoin)],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, localCoin)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_unsubscribe_000120'
        scriptCode = defaultScriptCode + '_取消订阅带issuer的token_02:有订阅的带issuer的token，取消订阅内容为token，' +
            '参数是token名字/错误的issuer地址'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localCoin)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, localCoin)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['token', localCoin.symbol + '/issuer_not_existed' ],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, localCoin)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle + '_退订token', testScripts)

        //endregion

        //region account

        testScripts = []

        testCaseCode = 'FCJT_unsubscribe_000130'
        scriptCode = defaultScriptCode + '_取消订阅account，不带参数'
        {
            actions = []

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['account'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_unsubscribe_000140'
        scriptCode = defaultScriptCode + '_取消订阅account，参数为空'
        {
            actions = []

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['account',''],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_unsubscribe_000150'
        scriptCode = defaultScriptCode + '_取消订阅非法的account地址'
        {
            actions = []

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['account', Wrong_Format_Address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_unsubscribe_000150'
        scriptCode = '000200' + '_取消订阅无效的account地址'
        {
            actions = []

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['account', Not_Used_Address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_unsubscribe_000151'
        scriptCode = defaultScriptCode + '_取消订阅内容为account，参数是合法的地址，但是该地址没被订阅过'
        {
            actions = []

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['account', from.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_unsubscribe_000160'
        scriptCode = defaultScriptCode + '_取消订阅有效的account地址:client有订阅的account'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', from.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = true
            actions.push(action)

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['account', from.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle + '_退订account', testScripts)

        //endregion

        //region all

        testScripts = []

        testCaseCode = 'FCJT_unsubscribe_000170'
        scriptCode = defaultScriptCode + '_client订阅了block、tx、多个token（全局和带issuer的都有）、多个account，' +
            '取消订阅内容为all，不带参数'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['block'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', globalCoin.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localCoin)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', from.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['account', to.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['all'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_unsubscribe_000180'
        scriptCode = defaultScriptCode + '_取消所有订阅_02:client订阅了block、tx、多个token（全局和带issuer的都有）、多个account，' +
            '取消订阅内容为all，带参数，参数内容为任意值'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['block'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', globalCoin.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localCoin)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', from.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['account', to.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['all', 'abcd'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = true
            action.receiveTx = true
            actions.push(action)

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_unsubscribe_000190'
        scriptCode = defaultScriptCode + '_client没有订阅任何信息，取消订阅内容为all，不带参数'
        {
            actions = []

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['all'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForUnsubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle + '_退订all', testScripts)

        //endregion

    },

    checkForUnsubscribeResult: function(action){
        tcsSubscribe.checkForResult(action, 'unsubscribed')
    },

    checkForUnsubscribeBlock: function(action){
        tcsSubscribe.checkForResult(action, 'unsubscribed')
        tcsSubscribe.checkForBlocks(action)
    },

    //endregion

    //region list

    testForListSubscribe: function(server, describeTitle){

        //region fields
        let testScripts = []
        let testCaseCode
        let defaultScriptCode = '000100'
        let scriptCode
        let txFunctionName = consts.rpcFunctions.listSubscribe
        let testScript
        let actions = []

        let globalCoin = server.mode.coins[0]
        let localCoin = server.mode.coins[1]
        let from = server.mode.addresses.sender1
        let to = server.mode.addresses.receiver1
        //endregion

        //region normal

        testScripts = []

        testCaseCode = 'FCJT_listSubscribe_000010'
        scriptCode = defaultScriptCode + '_client订阅了block、tx、多个token（全局和带issuer的都有）、多个account'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['block'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', globalCoin.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localCoin)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', from.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['account', to.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.list,
                txParams: [],
                checkParams: ['block', 'tx',
                    'token ' + globalCoin.symbol + ',' + tcsSubscribe.getCoinFullName(localCoin),
                    'account ' + from.address + ',' + to.address],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: true, expectedError: ''},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)

        }

        testCaseCode = 'FCJT_listSubscribe_000020'
        scriptCode = defaultScriptCode + '_client没有订阅任何信息'
        {
            actions = []

            actions.push({type: actionTypes.list,
                txParams: [],
                checkParams: [],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: true, expectedError: ''},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_listSubscribe_000030'
        scriptCode = defaultScriptCode + '_client订阅了block,参数列表为["block"]'
        {
            actions = []

            actions.push({type: actionTypes.subscribe, txParams: ['block'], timeout: 1000})

            actions.push({type: actionTypes.list,
                txParams: ['block'],
                checkParams: ['block'],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: true, expectedError: ''},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_listSubscribe_000040'
        scriptCode = defaultScriptCode + '_client没有订阅block,参数列表为["block"]'
        {
            actions = []

            actions.push({type: actionTypes.list,
                txParams: ['block'],
                checkParams: [],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: true, expectedError: ''},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_listSubscribe_000050'
        scriptCode = defaultScriptCode + '_client订阅了tx,参数列表为["tx"]'
        {
            actions = []

            actions.push({type: actionTypes.subscribe, txParams: ['tx'], timeout: 1000})

            actions.push({type: actionTypes.list,
                txParams: ['tx'],
                checkParams: ['tx'],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: true, expectedError: ''},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_listSubscribe_000060'
        scriptCode = defaultScriptCode + '_client没有订阅tx,参数列表为["tx"]'
        {
            actions = []

            actions.push({type: actionTypes.list,
                txParams: ['tx'],
                checkParams: [],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: true, expectedError: ''},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_listSubscribe_000070'
        scriptCode = defaultScriptCode + '_client订阅了多个token（全局的和带issuer的都有）,参数列表为["token"]'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', globalCoin.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localCoin)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.list,
                txParams: ['token'],
                checkParams: ['token ' + globalCoin.symbol + ',' + tcsSubscribe.getCoinFullName(localCoin)],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: true, expectedError: ''},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_listSubscribe_000080'
        scriptCode = defaultScriptCode + '_client没有订阅token,参数列表为["token"]'
        {
            actions = []
            actions.push({type: actionTypes.list,
                txParams: ['token'],
                checkParams: [],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: true, expectedError: ''},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_listSubscribe_000090'
        scriptCode = defaultScriptCode + '_client订阅了多个account,参数列表为["account"]'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', from.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', to.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.list,
                txParams: ['account'],
                checkParams: ['account ' + from.address + ',' + to.address],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: true, expectedError: ''},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_listSubscribe_000100'
        scriptCode = defaultScriptCode + '_client没有订阅account,参数列表为["account"]'
        {
            actions = []
            actions.push({type: actionTypes.list,
                txParams: ['account'],
                checkParams: [],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: true, expectedError: ''},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle + '_列表normal', testScripts)

        //endregion

        //region mixed

        testScripts = []

        testCaseCode = 'FCJT_listSubscribe_000110'
        scriptCode = defaultScriptCode + '_无效的参数: 数字'
        {
            actions = []

            actions.push({type: actionTypes.list,
                txParams: ['12313123'],
                checkParams: [],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: false, expectedError: framework.getError(-278, 'invalid topic')},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_listSubscribe_000110'
        scriptCode = '000200' + '_无效的参数: 乱码字符串'
        {
            actions = []

            actions.push({type: actionTypes.list,
                txParams: ['asdfasawer awer as09 8a0 sa098 a098__9e87r09w8fASDFASDF@#$@$ eoihsafkjn'],
                checkParams: [],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: false, expectedError: framework.getError(-278, 'invalid topic')},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_listSubscribe_000120'
        scriptCode = defaultScriptCode + '_client订阅了block、tx、多个token（全局和带issuer的都有）、多个account'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['block'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', globalCoin.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localCoin)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', from.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['account', to.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.list,
                txParams: ['block', 'tx', 'token', 'account'],
                checkParams: ['block', 'tx',
                    'token ' + globalCoin.symbol + ',' + tcsSubscribe.getCoinFullName(localCoin),
                    'account ' + from.address + ',' + to.address],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: true, expectedError: ''},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_listSubscribe_000130'
        scriptCode = defaultScriptCode + '_参数包含多个内容_02:client订阅了block、tx、多个token（全局和带issuer的都有）、' +
            '多个account,参数列表为["block","token"]'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['block'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', globalCoin.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localCoin)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', from.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['account', to.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.list,
                txParams: ['block', 'token'],
                checkParams: ['block',
                    'token ' + globalCoin.symbol + ',' + tcsSubscribe.getCoinFullName(localCoin)],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: true, expectedError: ''},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_listSubscribe_000140'
        scriptCode = defaultScriptCode + '_参数包含多个内容_03:client订阅了block、tx、多个token（全局和带issuer的都有）、' +
            '多个account,参数列表为["tx", "account"]'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['block'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', globalCoin.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localCoin)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', from.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['account', to.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.list,
                txParams: ['tx', 'account'],
                checkParams: ['tx',
                    'account ' + from.address + ',' + to.address],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: true, expectedError: ''},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_listSubscribe_000150'
        scriptCode = defaultScriptCode + '_client订阅了block、tx、多个token（全局和带issuer的都有）、' +
            '多个account,参数列表包含一个有效的参数，一个无效的参数，比如["block","123"]'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['block'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', globalCoin.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localCoin)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', from.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['account', to.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.list,
                txParams: ['block', '123'],
                checkParams: ['block'],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: true, expectedError: ''},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_listSubscribe_000160'
        scriptCode = defaultScriptCode + '_参数包含多个内容_05:参数列表包含几个无效的参数，比如["abc","123"]'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['block'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', globalCoin.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localCoin)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', from.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['account', to.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.list,
                txParams: ['abc', '123'],
                checkParams: [],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: false, expectedError: framework.getError(-278, 'invalid topic')},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_listSubscribe_000170'
        scriptCode = defaultScriptCode + '_client订阅了block、tx、多个token（全局和带issuer的都有），' +
            '没有订阅account,参数列表为["block","account"]'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['block'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', globalCoin.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localCoin)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.list,
                txParams: ['block', 'account'],
                checkParams: ['block'],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: true, expectedError: ''},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_listSubscribe_000180'
        scriptCode = defaultScriptCode + '_参数包含多个内容_07:client订阅了block、多个token（全局和带issuer的都有）、' +
            '多个account，没有订阅tx,参数列表为["tx", "token"]'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['block'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', globalCoin.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['token', tcsSubscribe.getCoinFullName(localCoin)],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', from.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })
            actions.push({type: actionTypes.subscribe,
                txParams: ['account', to.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            actions.push({type: actionTypes.list,
                txParams: ['tx', 'token'],
                checkParams: ['token ' + globalCoin.symbol + ',' + tcsSubscribe.getCoinFullName(localCoin)],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: true, expectedError: ''},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_listSubscribe_000190'
        scriptCode = defaultScriptCode + '_client什么都没订阅,参数列表为["block","tx","token", "account"]'
        {
            actions = []

            actions.push({type: actionTypes.list,
                txParams: ['block', 'tx', 'token', 'account'],
                checkParams: [],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: true, expectedError: ''},
            })

            testScript = tcsSubscribe.createTestScript(server, testCaseCode, scriptCode, txFunctionName, actions)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle + '_列表mixed', testScripts)

        //endregion

    },

    checkForListSubscribe: function(action){
        // logger.debug('checkForListSubscribe: ' + JSON.stringify(testCase.actualResult[0]))
        let messages = tcsSubscribe.filterSubscribeMessages(action.output)
        let results = messages.results

        if(action.expectedResult.needPass){
            expect(results[0].result.length).to.be.equals(action.checkParams.length)
            for(let i = 0;  i < action.checkParams.length; i++){
                let expectedArray = tcsSubscribe.parseArray(action.checkParams[i])
                if(expectedArray != null){
                    let actualArray = tcsSubscribe.parseArray(results[0].result[i])
                    let compareResult = tcsSubscribe.compareArray(actualArray, expectedArray)
                    expect(compareResult).to.be.ok
                }
                else{
                    expect(results[0].result[i]).to.be.equals(action.checkParams[i])
                }
            }
        }
        else{
            let errors = messages.errors
            if(If_Check_Error){
                expect(errors.length).to.be.least(1)
                framework.checkError(action.expectedResult.expectedError, errors[0])
                // expect(errors[0].status).to.be.equals(action.expectedResult.expectedError.status)
                // expect(errors[0].type).to.be.equals(action.expectedResult.expectedError.type)
                // expect(errors[0].error).to.contains(action.expectedResult.expectedError.error)
                // expect(errors[0].result).to.be.equals(action.expectedResult.expectedError.result)
            }
        }
    },

    // Expected :token TSC_2,TSC_3/jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh
    // Actual   :token TSC_3/jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh,TSC_2
    // "account jsoV2BMd1X93izMbPmj6HtJS9sHuDPQTyD,jwiAnXkrfB8wmrocKefcxhTCBopjxtdfr1"
    parseArray: function(arrayString){
        const tokenPrefix = 'token '
        const accountPrefix = 'account '
        let pureArrayString

        if(arrayString.indexOf(tokenPrefix) == 0){
            pureArrayString = arrayString.substr(tokenPrefix.length, arrayString.length - tokenPrefix.length)
        }
        else if(arrayString.indexOf(accountPrefix) == 0){
            pureArrayString = arrayString.substr(accountPrefix.length, arrayString.length - accountPrefix.length)
        }
        else{
            return null
        }

        let array = pureArrayString.split(',')
        return array
    },

    compareArray: function(tokens1, tokens2){
        if(tokens1.length != tokens2.length){
            return false
        }

        for(let i = 0; i < tokens1.length; i++){
            if(!utility.ifArrayHas2(tokens2, tokens1[i])){
                return false
            }
        }

        return true
    },

    //endregion

}
