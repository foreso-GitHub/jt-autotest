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
const Subscribe_Timeout = 1000
const If_Check_Error = true

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

    createSingleTestCase: function(server, title, actions, needPass, expectedError){
        let testCase = framework.createTestCase(
            title,
            server,
            null,
            null,
            null,
            tcsSubscribe.executeForSubscribe,
            tcsSubscribe.checkForSubscribe,
            {needPass: needPass, isErrorInResult: true, expectedError: expectedError},
            restrictedLevel.L2,
            [serviceType.newChain],
            [interfaceType.websocket],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        testCase.actions = actions

        return testCase
    },

    executeForSubscribe: async function(testCase){
        testCase.hasExecuted = true
        return new Promise(async (resolve, reject) => {
            logger.debug('=== ' + testCase.title)

            //new ws
            let ws = testCase.server.newWebSocket(testCase.server)

            //execute actions
            for(let i = 0; i < testCase.actions.length; i++){

                // 执行本次action
                let action = testCase.actions[i]
                logger.debug('=== Executing action ' + i + '. ' + action.type)
                if(action.type == actionTypes.sendTx
                    || action.type == actionTypes.signTx
                    || action.type == actionTypes.sendRawTx){  // send txs
                    testCase.server.clearSub() //因为sendTx不走subscribe，因此必须在这里执行清空上一次sub的动作。
                    // logger.debug('testCase.server.getOutputs().sub: ' + testCase.server.getOutputs().sub.length)
                    let server = testCase.server

                    let txParams = await utility.updateSequenceInTxParams(server, action.txParams, )
                    if(action.type == actionTypes.sendTx){
                        action.hashes = await utility.sendTxs(server, txParams, action.txCount)
                    }
                    else if (action.type == actionTypes.signTx || action.type == actionTypes.sendRawTx){
                        let rawTxResponse = await server.getResponse(server, consts.rpcFunctions.signTx, txParams)
                        let rawTx = rawTxResponse.result[0]
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
                        testCase.realHashes = action.hashes
                    }
                    else{
                        testCase.fakeHashes = action.hashes
                    }
                }else {  // execute subscribe/unsubscribe/listsubscribe
                    await testCase.server.subscribe(ws, action.type, action.txParams)
                }

                // 执行timeout
                logger.debug('=== Waiting for ' + action.timeout + '!')
                await utility.timeout(action.timeout)

                //保存这个action的执行结果
                logger.debug(JSON.stringify(testCase.server.getOutputs()))
                action.output = utility.deepClone(testCase.server.getOutputs().sub)  //必须现在调用getOutputs()获取最新的output，不能用变量
            }

            //close ws
            let outputs = await testCase.server.closeWebSocket(ws)
            // if(testCase.actions.length > 0){
            //     testCase.actions[testCase.actions.length - 1].output = outputs.sub
            // }
            testCase.actualResult.push(outputs.all)
            resolve(testCase)
        })
    },

    checkForSubscribe: function(testCase){
        for(let i = 0; i < testCase.actions.length; i++){
            let action = testCase.actions[i]
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
                total_supply: "99999901",
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

    findTxParam: function(txParams, type, sequence){

    },

    //endregion

    //endregion

    //region common check

    checkForResult: function(action, successTx){
        let messages = tcsSubscribe.filterSubscribeMessages(action.output)

        if(action.expectedResult.needPass){
            let results = messages.results
            expect(results[0].result).to.be.equals(action.txParams[0] + ' ' + successTx)
        }
        else{
            //{"id":4,"jsonrpc":"2.0","message":"invalid parameters","result":"","status":-278,"outputIndex":0}
            let errors = messages.errors
            if(If_Check_Error){
                expect(errors.length).to.be.least(1)
                expect(errors[0].status).to.be.equals(action.expectedResult.expectedError.status)
                expect(errors[0].message).to.contains(action.expectedResult.expectedError.message)
                expect(errors[0].result).to.be.equals(action.expectedResult.expectedError.result)
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
                    expect(receivedHashes).to.be.contains(realHash)
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

    testForSubscribe_2: function(server, describeTitle){


    },

    testForSubscribe: function(server, describeTitle){

        //region fields
        let titlePrefix = consts.rpcFunctions.subscribe + '_'
        let title
        let testCase
        let testCases = []
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

        title = titlePrefix + '0010\t订阅区块'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0011\t订阅区块，带无效的订阅参数'
        {
            actions = []
            actions.push({type: actionTypes.subscribe,
                txParams: ['block', 'abcd'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })
            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0012\t重复订阅区块'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        framework.testTestCases(server, describeTitle + '_订阅block', testCases)

        //endregion

        //region tx

        testCases = []

        title = titlePrefix + '0020\t订阅交易'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0021\t订阅交易，带无效的订阅参数'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['tx', 'abcd'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0022\t重复订阅交易'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0024_001\t订阅交易，signTx'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0024_002\t订阅交易，signTx并且sendRawTx'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        framework.testTestCases(server, describeTitle + '_订阅tx', testCases)

        //endregion

        //region not work

        testCases = []

        title = titlePrefix + '0030\t订阅-无效的内容：参数为\'abcd\''
        {
            actions = []
            actions.push({type: actionTypes.subscribe,
                txParams: ['abcd'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"no such topic ",result:"",status:-278}},
            })


            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0031\t订阅-无效的内容：参数为\'\''
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: [''],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"no such topic ",result:"",status:-278}},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0032\t订阅-无效的内容：参数为超长字符串'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['12312312313212312312313131adfasdfaskdfajsfoieurowarolkdjasfldjf'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"no such topic ",result:"",status:-278}},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0040\t订阅-内容为空'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: [],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"no parameters",result:"",status:-269}},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        framework.testTestCases(server, describeTitle + '_无效订阅', testCases)

        //endregion

        //region block + tx

        testCases = []

        title = titlePrefix + '0050\t已订阅区块时再订阅交易'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0060\t已订阅交易时再订阅区块'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        framework.testTestCases(server, describeTitle + '_多个订阅', testCases)

        //endregion

        //region token

        testCases = []

        title = titlePrefix + '0070\t订阅token，不带参数'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0080\t订阅token，带有效参数（全局token），参数不带issuer'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0080_001\t订阅token，带有效参数（全局token），参数带issuer'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0090\t订阅token，带有效参数（本地token）'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0100\t订阅token，带无效参数: token名字超过12字节'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0101\t订阅token，带无效参数: token名字正确但issuer地址非法'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', localCoin.symbol + '/jU4iU135deFRwUEG5guBSkpRKe6H8YZanR_1'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
            })

            action = tcsSubscribe.createRealTxAction(server)
            action.txParams[0].value = utility.getTokenShowValue(1, localCoin)
            action.receiveBlock = false
            action.receiveTx = false
            actions.push(action)

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0110\t订阅token，参数为空: 订阅内容为token，订阅参数为空字符串'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0120\t重复订阅相同的token'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0130\t订阅不同的token'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0140\t订阅多个同名的token，issuer不同，包括全局的'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        framework.testTestCases(server, describeTitle + '_订阅token', testCases)

        //endregion

        //region account

        testCases = []

        title = titlePrefix + '0150\t订阅account，不带参数'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0160\t订阅account，带有效参数_01： 发送方地址'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0161\t订阅account，带有效参数_02： 接收方地址'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0180\t订阅account，带无效参数: 未激活地址'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0181\t订阅account，带无效参数: 地址格式错误'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0190\t订阅account，参数为空'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0200\t重复订阅相同的account'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0210\t订阅不同的account'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        framework.testTestCases(server, describeTitle + '_订阅account', testCases)

        //endregion

        //region special

        testCases = []

        //region tx
        token = utility.getDynamicTokenName()
        token.issuer = sender.address

        title = titlePrefix + '0023_0011\t订阅tx，发行token，全局token'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0023_0012\t订阅tx，发送token，全局token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['tx'],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTxAction(sender, receiver, true)
            action.txParams[0].value = utility.getShowValue(1, token.symbol, consts.defaultIssuer)
            actions.push(action)

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0023_0013\t订阅tx，增发token，全局token'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0023_0014\t订阅tx，销毁token，全局token'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0023_0021\t订阅tx，发行token，本地token'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0023_0022\t订阅tx，发送token，本地token'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0023_0023\t订阅tx，增发token，本地token'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0023_0024\t订阅tx，销毁token，本地token'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }
        //endregion

        //region token
        token = utility.getDynamicTokenName()
        token.issuer = sender.address

        title = titlePrefix + '0081_0001\t订阅token，发行token，全局token'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0081_0002\t订阅token，发送token，全局token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['token', token.symbol],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTxAction(sender, receiver, true)
            action.txParams[0].value = utility.getShowValue(1, token.symbol, consts.defaultIssuer)
            actions.push(action)

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0081_0003\t订阅token，增发token，全局token'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0081_0004\t订阅token，销毁token，全局token'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0091_0001\t订阅token，发行token，本地token'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0091_0002\t订阅token，发送token，本地token'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0091_0003\t订阅token，增发token，本地token'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0091_0004\t订阅token，销毁token，本地token'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }
        //endregion

        //region account
        token = utility.getDynamicTokenName()
        token.issuer = sender.address

        title = titlePrefix + '0162_0001\t订阅account，发行token，全局token'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0160_0001\t订阅account，发送token，全局token'
        {
            actions = []

            actions.push({type: actionTypes.subscribe,
                txParams: ['account', sender.address],
                timeout: Subscribe_Timeout,
                checkFunction: tcsSubscribe.checkForSubscribeResult,
                expectedResult: {needPass: true, expectedError: ''},
            })

            action = tcsSubscribe.createTxAction(sender, receiver, true)
            action.txParams[0].value = utility.getShowValue(1, token.symbol, consts.defaultIssuer)
            actions.push(action)

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0163_0001\t订阅account，增发token，全局token'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0164_0001\t订阅account，销毁token，全局token'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0162_0002\t订阅account，发行token，本地token'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0160_0002\t订阅account，发送token，本地token'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0163_0002\t订阅account，增发token，本地token'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0164_0002\t订阅account，销毁token，本地token'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }
        //endregion

        framework.testTestCases(server, describeTitle + '_订阅发币', testCases)

        //endregion

        //region mixed

        testCases = []

        title = titlePrefix + '0220\t订阅不同的内容，包括tx'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0221\t订阅不同的内容，不包括tx'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        framework.testTestCases(server, describeTitle + '_混合订阅', testCases)

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
        let title
        let testCase
        let testCases = []
        let needPass = true
        let expectedError = ''

        let from = server.mode.addresses.sender1
        let to = server.mode.addresses.receiver1
        let globalCoin = server.mode.coins[0]
        let localCoin = server.mode.coins[1]

        //region block

        testCases = []

        title = '0010\t取消订阅区块block_01: 已订阅区块，取消订阅区块，订阅内容为block，无订阅参数'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = '0011\t取消订阅区块block_02: 无订阅区块'
        {
            actions = []

            actions.push({type: actionTypes.unsubscribe,
                txParams: ['block'],
                timeout: 6000,
                checkFunction: tcsSubscribe.checkForUnsubscribeBlock,
                expectedResult: {needPass: false, expectedError: {message:"invalid parameters",result:"",status:-278}},
                receiveBlock: false,
            })

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = '0012\t取消订阅区块block_03: 已订阅区块，取消订阅区块，订阅内容为block，订阅参数为任意值'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        framework.testTestCases(server, describeTitle + '_退订block', testCases)

        //endregion

        //region tx

        testCases = []

        title = '0020\t取消订阅交易tx_01: 已订阅交易，取消订阅交易，订阅内容为tx，无订阅参数'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = '0021\t取消订阅交易tx_02: 无订阅交易，client没有订阅交易，但是发送取消订阅交易tx请求'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = '0022\t取消订阅交易tx_03: 已订阅区块，取消订阅交易，订阅内容为tx，订阅参数为任意值'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        framework.testTestCases(server, describeTitle + '_退订tx', testCases)

        //endregion
        
        //region token

        //endregion

        //region account

        //endregion

        //region mixed

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
        let titlePrefix = consts.rpcFunctions.subscribe + '_'
        let title
        let testCase
        let testCases = []
        let needPass = true
        let expectedError = ''
        let actions = []

        //region 列表

        testCases = []

        title = titlePrefix + '0010\t参数为空_01: client订阅了block、tx、多个token（全局和带issuer的都有）、多个account'
        {
            actions = []

            actions.push({type: actionTypes.subscribe, txParams: ['block'], timeout: 100})
            actions.push({type: actionTypes.subscribe, txParams: ['tx'], timeout: 100})

            action = tcsSubscribe.createRealTxAction(server)
            action.receiveBlock = true
            action.receiveTx = true
            actions.push(action)

            actions.push({type: actionTypes.list,
                txParams: [],
                checkParams: ['block', 'tx'],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: true, expectedError: ''},
            })

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0020\t参数为空_02: client没有订阅任何信息'
        {
            actions = []
            actions.push({type: actionTypes.list,
                txParams: [],
                checkParams: [],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: true, expectedError: ''},
            })

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0030\t参数为block_01: client订阅了block,参数列表为["block"]'
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

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0040\t参数为block_02: client没有订阅block,参数列表为["block"]'
        {
            actions = []
            actions.push({type: actionTypes.list,
                txParams: ['block'],
                checkParams: [],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: true, expectedError: ''},
            })

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        //endregion

        framework.testTestCases(server, describeTitle, testCases)
    },

    checkForListSubscribe: function(action){
        // logger.debug('checkForListSubscribe: ' + JSON.stringify(testCase.actualResult[0]))
        let messages = tcsSubscribe.filterSubscribeMessages(action.output)
        let results = messages.results

        if(action.expectedResult.needPass){
            expect(results[0].result.length).to.be.equals(action.checkParams.length)
            for(let i = 0;  i < action.checkParams.length; i++){
                expect(results[0].result[i]).to.be.equals(action.checkParams[i])
            }
        }
        else{
            // expect(results[0].result).to.be.equals(testCase.actions[2].txParams[0] + ' unsubscribed')
            // expect(blocks.length).to.be.equals(0)
        }
    },

    //endregion

}