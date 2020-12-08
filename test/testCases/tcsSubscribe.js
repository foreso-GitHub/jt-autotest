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
//endregion
//endregion

const actionTypes = {
    sendTx:consts.rpcFunctions.sendTx,
    subscribe:consts.rpcFunctions.subscribe,
    unsubscribe:consts.rpcFunctions.unsubscribe,
    list:consts.rpcFunctions.listSubscribe,
}

module.exports = tcsSubscribe = {

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
            logger.debug(testCase.title)

            //new ws
            let ws = testCase.server.newWebSocket(testCase.server)

            //execute actions
            for(let i = 0; i < testCase.actions.length; i++){
                //先保存上个action的执行结果
                let outputs = testCase.server.getOutputs()
                if(i > 0){
                    testCase.actions[i - 1].output = outputs.sub
                }

                let action = testCase.actions[i]
                if(action.type == actionTypes.sendTx){  // send txs
                    // todo sendTx走的不是subcribe的路子，因此不能直接通过promise获取上一个action的执行结果output。
                    // todo 但是可以考虑将server的all_output和sub_output公开，在执行sendTx前获取一下给上一个action。这样就比较完整。
                    let server = testCase.server
                    let txParams = await utility.createTxParams(server, action.from, action.secret, action.to, action.value)
                    action.hashes = await utility.sendTxs(server, txParams, action.txCount)
                }else {  // execute subscribe/unsubscribe/listsubscribe
                    await testCase.server.subscribe(ws, action.type, action.txParams)
                }

                await utility.timeout(action.timeout)
            }

            //close ws
            let outputs = await testCase.server.closeWebSocket(ws)
            if(testCase.actions.length > 0){
                testCase.actions[testCase.actions.length - 1].output = outputs.sub
            }
            testCase.actualResult.push(outputs.all)
            resolve(testCase)
        })
    },

    checkForSubscribe: function(testCase){
        for(let i = 0; i < testCase.actions.length; i++){
            let action = testCase.actions[i]
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

    createRealTx: function(server){
        return tcsSubscribe.createTx(server.mode.addresses.sender3, server.mode.addresses.receiver3)
    },

    createFakeTx: function(server){
        return tcsSubscribe.createTx(server.mode.addresses.sender2, server.mode.addresses.receiver2)
    },

    createTx: function(sender, receiver){
        return {type: actionTypes.sendTx,
            from: sender.address,
            secret: sender.secret,
            to: receiver.address,
            value: '1',
            txCount: 5,
            timeout: 6000,
            checkFunction: tcsSubscribe.checkForSubscribeBlock,
            expectedResult: {needPass: true, isErrorInResult: true, expectedError: ''},
        }
    },

    filterSubscribeMessages: function(messages){
        let filterMessages = {}
        filterMessages.blocks = []
        filterMessages.txs = []
        filterMessages.hashes = []
        filterMessages.results = []
        filterMessages.others = []

        for(let i = 0; i < messages.length; i++){
            let message = messages[i]
            if(message.fee_base){
                filterMessages.blocks.push(message)
            }
            else if(message.engine_result){
                filterMessages.txs.push(message)
            }
            else if(message.result){
                if(!utility.isArray(message.result) && utility.isHex(message.result)){
                    filterMessages.hashes.push(message)
                }
                else{
                    filterMessages.results.push(message)
                }
            }
            else{
                filterMessages.others.push(message)
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

    //region subscribe

    testForSubscribe: function(server, describeTitle){
        let titlePrefix = consts.rpcFunctions.subscribe + '_'
        let title
        let testCase
        let testCases = []
        let action
        let actions = []

        //region block

        title = titlePrefix + '0010\t订阅区块'
        {
            actions = []
            actions.push({type: actionTypes.subscribe, txParams: ['block'], timeout: 0})
            action = tcsSubscribe.createRealTx(server)
            action.timeout = 11000
            actions.push(action)

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0011\t订阅区块，带无效的订阅参数'
        {
            actions = []
            actions.push({type: actionTypes.subscribe, txParams: ['block', 'abcd'], timeout: 0})
            action = tcsSubscribe.createRealTx(server)
            action.expectedResult = {needPass: false, isErrorInResult: true, expectedError: ''}
            actions.push(action)

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0012\t重复订阅区块'
        {
            actions = []
            actions.push({type: actionTypes.subscribe, txParams: ['block'], timeout: 0})
            actions.push({type: actionTypes.subscribe, txParams: ['block'], timeout: 0})
            action = tcsSubscribe.createRealTx(server)
            action.timeout = 11000
            actions.push(action)

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
            framework.addTestCase(testCases, testCase)
        }

        //endregion

        //region tx

        // title = titlePrefix + '0020\t订阅交易'
        // {
        //     actions = []
        //     actions.push({type: actionTypes.subscribe, txParams: ['tx'], timeout: 0})
        //     action = tcsSubscribe.createRealTx(server)
        //     action.checkFunction = tcsSubscribe.checkForSubscribeTx
        //     actions.push(action)
        //
        //     testCase = tcsSubscribe.createSingleTestCase(server, title, actions)
        //     framework.addTestCase(testCases, testCase)
        // }

        // title = titlePrefix + '0021\t订阅交易，带无效的订阅参数'
        // {
        //     actions = []
        //     actions.push({type: actionTypes.subscribe, txParams: ['tx', 'abcd'], timeout: 0})
        //     actions.push(tcsSubscribe.createRealTx(server))
        //     testCase = tcsSubscribe.createSingleTestCase(server, title, actions, needPass, expectedError)
        //     testCase.expectedResult.needPass = false
        //     testCase.checkFunction = tcsSubscribe.checkForSubscribeTx
        //     framework.addTestCase(testCases, testCase)
        // }
        //
        // title = titlePrefix + '0022\t重复订阅交易'
        // {
        //     actions = []
        //     actions.push({type: actionTypes.subscribe, txParams: ['tx'], timeout: 0})
        //     actions.push({type: actionTypes.subscribe, txParams: ['tx'], timeout: 0})
        //     actions.push(tcsSubscribe.createRealTx(server))
        //
        //     testCase = tcsSubscribe.createSingleTestCase(server, title, actions, needPass, expectedError)
        //     testCase.checkFunction = tcsSubscribe.checkForSubscribeTx
        //     framework.addTestCase(testCases, testCase)
        // }

        //endregion

        // //region not work
        //
        // title = titlePrefix + '0030\t订阅-无效的内容：参数为\'abcd\''
        // {
        //     actions = []
        //     actions.push({type: actionTypes.subscribe, txParams: ['abcd'], timeout: 0})
        //     actions.push(tcsSubscribe.createRealTx(server))
        //
        //     testCase = tcsSubscribe.createSingleTestCase(server, title, actions, needPass, expectedError)
        //     testCase.expectedResult.needPass = false
        //     testCase.checkFunction = async function(testCase){
        //         await tcsSubscribe.checkForSubscribeBlock(testCase)
        //         await tcsSubscribe.checkForSubscribeTx(testCase)
        //     }
        //     framework.addTestCase(testCases, testCase)
        // }
        //
        // title = titlePrefix + '0031\t订阅-无效的内容：参数为\'\''
        // {
        //     actions = []
        //     actions.push({type: actionTypes.subscribe, txParams: [''], timeout: 0})
        //     actions.push(tcsSubscribe.createRealTx(server))
        //
        //     testCase = tcsSubscribe.createSingleTestCase(server, title, actions, needPass, expectedError)
        //     testCase.expectedResult.needPass = false
        //     testCase.checkFunction = async function(testCase){
        //         await tcsSubscribe.checkForSubscribeBlock(testCase)
        //         await tcsSubscribe.checkForSubscribeTx(testCase)
        //     }
        //     framework.addTestCase(testCases, testCase)
        // }
        //
        // title = titlePrefix + '0032\t订阅-无效的内容：参数为超长字符串'
        // {
        //     actions = []
        //     actions.push({type: actionTypes.subscribe, txParams: ['12312312313212312312313131adfasdfaskdfajsfoieurowarolkdjasfldjf'], timeout: 0})
        //     actions.push(tcsSubscribe.createRealTx(server))
        //
        //     testCase = tcsSubscribe.createSingleTestCase(server, title, actions, needPass, expectedError)
        //     testCase.expectedResult.needPass = false
        //     testCase.checkFunction = async function(testCase){
        //         await tcsSubscribe.checkForSubscribeBlock(testCase)
        //         await tcsSubscribe.checkForSubscribeTx(testCase)
        //     }
        //     framework.addTestCase(testCases, testCase)
        // }
        //
        // title = titlePrefix + '0040\t订阅-内容为空'
        // {
        //     actions = []
        //     actions.push({type: actionTypes.subscribe, txParams: [], timeout: 0})
        //     actions.push(tcsSubscribe.createRealTx(server))
        //
        //     testCase = tcsSubscribe.createSingleTestCase(server, title, actions, needPass, expectedError)
        //     testCase.expectedResult.needPass = false
        //     testCase.checkFunction = async function(testCase){
        //         await tcsSubscribe.checkForSubscribeBlock(testCase)
        //         await tcsSubscribe.checkForSubscribeTx(testCase)
        //     }
        //     framework.addTestCase(testCases, testCase)
        // }
        //
        // //endregion
        //
        // //region block + tx
        //
        // title = titlePrefix + '0050\t已订阅区块时再订阅交易'
        // {
        //     actions = []
        //     actions.push({type: actionTypes.subscribe, txParams: ['block'], timeout: 0})
        //     actions.push({type: actionTypes.subscribe, txParams: ['tx'], timeout: 0})
        //     actions.push(tcsSubscribe.createRealTx(server))
        //
        //     testCase = tcsSubscribe.createSingleTestCase(server, title, actions, needPass, expectedError)
        //     testCase.checkFunction = async function (testCase) {
        //         await tcsSubscribe.checkForSubscribeBlock(testCase)
        //         await tcsSubscribe.checkForSubscribeTx(testCase)
        //     }
        //     framework.addTestCase(testCases, testCase)
        // }
        //
        // title = titlePrefix + '0060\t已订阅交易时再订阅区块'
        // {
        //     actions = []
        //     actions.push({type: actionTypes.subscribe, txParams: ['tx'], timeout: 0})
        //     actions.push({type: actionTypes.subscribe, txParams: ['block'], timeout: 0})
        //     actions.push(tcsSubscribe.createRealTx(server))
        //
        //     testCase = tcsSubscribe.createSingleTestCase(server, title, actions, needPass, expectedError)
        //     testCase.checkFunction = async function (testCase) {
        //         await tcsSubscribe.checkForSubscribeBlock(testCase)
        //         await tcsSubscribe.checkForSubscribeTx(testCase)
        //     }
        //     framework.addTestCase(testCases, testCase)
        // }
        //
        // //endregion

        framework.testTestCases(server, describeTitle, testCases)
    },

    checkForSubscribeBlock: function(action){
        let messages = tcsSubscribe.filterSubscribeMessages(action.output)
        let blocks = messages.blocks
        if(action.expectedResult.needPass){
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

    checkForSubscribeTx: function(action){
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
        let realHashes = action.realHashes
        let fakeHashes = action.fakeHashes

        if(action.expectedResult.needPass){
            expect(receivedHashes.length).to.be.least(5)
            realHashes.forEach(realHash => {
                expect(receivedHashes).to.be.contains(realHash)
            })
            if(action.hasFake && action.hasFake == true){
                fakeHashes.forEach(fakeHash => {
                    expect(receivedHashes).to.not.be.contains(fakeHash)
                })
            }
        }
        else{
            expect(receivedHashes.length).to.be.equals(0)
        }

    },

    //endregion

    //region unsubscribe

    testForUnsubscribe: function(server, describeTitle){
        let title
        let testCase
        let testCases = []
        let needPass = true
        let expectedError = ''

        let from = server.mode.addresses.sender3.address
        let to = server.mode.addresses.receiver3.address
        let globalCoin = server.mode.coins[0]
        let localCoin = server.mode.coins[1]

        //region block

        title = '0010\t取消订阅区块block_01: 已订阅区块，取消订阅区块，订阅内容为block，无订阅参数'
        {
            actions = []
            actions.push({type: actionTypes.subscribe, txParams: ['block'], timeout: 0})  //subscribe没有check，因为output在下一个action（sendTxs）里
            actions.push(tcsSubscribe.createRealTx(server))
            actions.push({type: actionTypes.unsubscribe,
                txParams: ['block'],
                timeout: 6000,
                checkFunction: tcsSubscribe.checkForUnsubscribeBlock,
                expectedResult: {needPass: true, isErrorInResult: true, expectedError: ''},
            })

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = '0011\t取消订阅区块block_02：无订阅区块'
        {
            actions = []
            actions.push({type: actionTypes.unsubscribe,
                txParams: ['block'],
                timeout: 6000,
                checkFunction: tcsSubscribe.checkForUnsubscribeBlock,
                expectedResult: {needPass: true, isErrorInResult: true, expectedError: expectedError},
            })

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        //endregion

        framework.testTestCases(server, describeTitle, testCases)
    },

    checkForUnsubscribeBlock: function(action){
        let messages = tcsSubscribe.filterSubscribeMessages(action.output)
        let results = messages.results
        let blocks = messages.blocks

        if(action.expectedResult.needPass){
            expect(results[0].result).to.be.equals(action.txParams[0] + ' unsubscribed')
            // expect(blocks.length).to.be.equals(0)
        }
        else{
            // expect(results[0].result).to.be.equals(testCase.actions[2].txParams[0] + ' unsubscribed')
            // expect(blocks.length).to.be.equals(0)
        }
        expect(blocks.length).to.be.equals(0)
    },

    //{"id":1,"jsonrpc":"2.0","result":[]}
    //{"id":3,"jsonrpc":"2.0","result":["block"]}
    // {"id":5,"jsonrpc":"2.0","result":["block","tx"]}
    checkForUnsubscribeTx: function(testCase){
        tcsSubscribe.checkForSubscribeTx(testCase)
        let messages = tcsSubscribe.filterSubscribeMessages(testCase.actualResult[0])
        let results = messages.results
        expect(results[0].result).to.be.contains(testCase.txParams[0] + ' unsubscribed')
        if(testCase.txParams[1]){
            expect(results[0].result).to.be.contains(testCase.txParams[1])
        }
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
        title = titlePrefix + '0010\t参数为空_01: client订阅了block、tx、多个token（全局和带issuer的都有）、多个account'
        {
            actions = []
            actions.push({type: actionTypes.subscribe, txParams: ['block'], timeout: 0})
            actions.push({type: actionTypes.subscribe, txParams: ['tx'], timeout: 0})
            actions.push(tcsSubscribe.createRealTx(server))
            actions.push({type: actionTypes.list,
                txParams: [],
                checkParams: ['block', 'tx'],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: true, isErrorInResult: true, expectedError: ''},
            })

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0020\t参数为空_02: tclient没有订阅任何信息'
        {
            actions = []
            actions.push({type: actionTypes.list,
                txParams: [],
                checkParams: [],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: true, isErrorInResult: true, expectedError: ''},
            })

            testCase = tcsSubscribe.createSingleTestCase(server, title, actions, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = titlePrefix + '0030\t参数为block_01: client订阅了block,参数列表为["block"]'
        {
            actions = []
            actions.push({type: actionTypes.subscribe, txParams: ['block'], timeout: 6000})
            actions.push({type: actionTypes.list,
                txParams: ['block'],
                checkParams: ['block'],
                timeout: 1000,
                checkFunction: tcsSubscribe.checkForListSubscribe,
                expectedResult: {needPass: true, isErrorInResult: true, expectedError: ''},
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
                expectedResult: {needPass: true, isErrorInResult: true, expectedError: ''},
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