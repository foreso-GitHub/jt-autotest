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
//endregion
//endregion

let rpcServers = framework.activeAllRpcServers()
let wsServers = framework.activeAllWsServers()

module.exports = tcsPerformanceTest = {

    //region design

    // 直接发送交易，每个请求发送txCount个交易，发送actionCount轮，可选是否检查
    // 1. sendTx，signTx+sendRawTx.x
    // 2. 多帐号发送 【帐号list】.x
    // 3. 不同memo内容    【memo的list】.x
    // 4. 多节点轮流发送交易 【节点list】.x
    // 5. 增加发送间隔.x
    // 6. 可以设定每次发送是否需要重取sequence.x

    //endregion

    //region create PerformanceTest Param

    createPerformanceTestParam: function(txFunctionName, actionCount, txCount, serverTypes, serverCount, fromCount, toCount,
                                         memoSize, timeout, needResetSequence, needCheck, quickTx){
        let param = {}
        param.txFunctionName = txFunctionName           // sendTx or signTx+sendRaw
        param.actionCount = actionCount                 // total count of actions in this test
        param.txCount = txCount                         // tx count will be sent in per action
        param.serverTypes = serverTypes                 // the server types, rpc or ws now
        param.serverCount = serverCount                 // send txs through different server
        param.fromCount = fromCount                     // send txs by different from addresses
        param.toCount = toCount                         // send txs by different to addresses
        param.memoSize = memoSize                       // send txs with special size memos
        param.timeout = timeout                         // time out between 2 actions.
        param.needResetSequence = needResetSequence     // if need get sequence from chain on beginning, so avoid to be frozen in skipped sequence
        param.needCheck = needCheck                     // if need check test result. some performance test need not check result.
        param.quickTx = quickTx                         // flags='0x40000000'
        return param
    },

    //region template

    // let param = {}
    // param.txFunctionName = txFunctionName
    // param.actionCount = actionCount
    // param.txCount = txCount
    // param.serverTypes = serverTypes
    // param.serverCount = serverCount
    // param.fromCount = fromCount
    // param.toCount = toCount
    // param.memoSize = memoSize
    // param.timeout = timeout
    // param.needResetSequence = needResetSequence
    // param.needCheck = needCheck
    // param.quickTx = quickTx
    // return param

    //endregion

    //endregion

    //region test

    test: function(server, describeTitle){
        describe(describeTitle, function () {
            tcsPerformanceTest.testForPerformance(server, describeTitle, consts.rpcFunctions.sendTx)
            tcsPerformanceTest.testForPerformance(server, describeTitle, consts.rpcFunctions.signTx)
        })
    },

    testForPerformance: function(server, describeTitle, txFunctionName){

        let testScripts = []
        let ptParam
        let testCaseCode
        let scriptCodePrefix = txFunctionName == consts.rpcFunctions.sendTx ? '000100_' : '000200_'
        let scriptCode
        let actionCount = 3
        let txCount = 5

        //region 同一账户

        testCaseCode = 'PFMC_SameHW_000010'
        scriptCode = scriptCodePrefix + '同一账户向同一节点连续发送交易（不带memo）测试性能上限'
        {
            ptParam = tcsPerformanceTest.createPerformanceTestParam(txFunctionName, actionCount, txCount,
                [interfaceType.rpc, interfaceType.websocket], 18, 1, 1, 0,
                5000, true, true, false)
            let testScript = tcsPerformanceTest.createTestScript(server, '一个请求执行多个交易',
                testCaseCode, scriptCode, ptParam)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'PFMC_SameHW_000020'
        scriptCode = scriptCodePrefix + '同一账户向2个不同的节点连续发送交易（不带memo）测试性能上限'
        {
            ptParam = tcsPerformanceTest.createPerformanceTestParam(txFunctionName, actionCount, txCount,
                [interfaceType.rpc, interfaceType.websocket], 18, 1, 2, 0,
                5000, true, true, false)
            let testScript = tcsPerformanceTest.createTestScript(server, '一个请求执行多个交易',
                testCaseCode, scriptCode, ptParam)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'PFMC_SameHW_000030'
        scriptCode = scriptCodePrefix + '同一账户向3个不同的节点连续发送交易（不带memo）测试性能上限'
        {
            ptParam = tcsPerformanceTest.createPerformanceTestParam(txFunctionName, actionCount, txCount,
                [interfaceType.rpc, interfaceType.websocket], 18, 1, 3, 0,
                5000, true, true, false)
            let testScript = tcsPerformanceTest.createTestScript(server, '一个请求执行多个交易',
                testCaseCode, scriptCode, ptParam)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'PFMC_SameHW_000040'
        scriptCode = scriptCodePrefix + '同一账户向4个不同的节点连续发送交易（不带memo）测试性能上限'
        {
            ptParam = tcsPerformanceTest.createPerformanceTestParam(txFunctionName, actionCount, txCount,
                [interfaceType.rpc, interfaceType.websocket], 18, 1, 4, 0,
                5000, true, true, false)
            let testScript = tcsPerformanceTest.createTestScript(server, '一个请求执行多个交易',
                testCaseCode, scriptCode, ptParam)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'PFMC_SameHW_000050'
        scriptCode = scriptCodePrefix + '同一账户向5个不同的节点连续发送交易（不带memo）测试性能上限'
        {
            ptParam = tcsPerformanceTest.createPerformanceTestParam(txFunctionName, actionCount, txCount,
                [interfaceType.rpc, interfaceType.websocket], 18, 1, 5, 0,
                5000, true, true, false)
            let testScript = tcsPerformanceTest.createTestScript(server, '一个请求执行多个交易',
                testCaseCode, scriptCode, ptParam)
            framework.addTestScript(testScripts, testScript)
        }

        //endregion

        //region 不同账户

        testCaseCode = 'PFMC_SameHW_000060'
        scriptCode = scriptCodePrefix + '不同账户向同一节点连续发送交易（不带memo）测试性能上限'
        {
            ptParam = tcsPerformanceTest.createPerformanceTestParam(txFunctionName, actionCount, txCount,
                [interfaceType.rpc, interfaceType.websocket], 18, 5, 1, 0,
                5000, true, true, false)
            let testScript = tcsPerformanceTest.createTestScript(server, '一个请求执行多个交易',
                testCaseCode, scriptCode, ptParam)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'PFMC_SameHW_000070'
        scriptCode = scriptCodePrefix + '不同账户向2个不同的节点连续发送交易（不带memo）测试性能上限'
        {
            ptParam = tcsPerformanceTest.createPerformanceTestParam(txFunctionName, actionCount, txCount,
                [interfaceType.rpc, interfaceType.websocket], 18, 5, 1, 0,
                5000, true, true, false)
            let testScript = tcsPerformanceTest.createTestScript(server, '一个请求执行多个交易',
                testCaseCode, scriptCode, ptParam)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'PFMC_SameHW_000080'
        scriptCode = scriptCodePrefix + '不同账户向3个不同的节点连续发送交易（不带memo）测试性能上限'
        {
            ptParam = tcsPerformanceTest.createPerformanceTestParam(txFunctionName, actionCount, txCount,
                [interfaceType.rpc, interfaceType.websocket], 18, 5, 1, 0,
                5000, true, true, false)
            let testScript = tcsPerformanceTest.createTestScript(server, '一个请求执行多个交易',
                testCaseCode, scriptCode, ptParam)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'PFMC_SameHW_000090'
        scriptCode = scriptCodePrefix + '不同账户向4个不同的节点连续发送交易（不带memo）测试性能上限'
        {
            ptParam = tcsPerformanceTest.createPerformanceTestParam(txFunctionName, actionCount, txCount,
                [interfaceType.rpc, interfaceType.websocket], 18, 5, 1, 0,
                5000, true, true, false)
            let testScript = tcsPerformanceTest.createTestScript(server, '一个请求执行多个交易',
                testCaseCode, scriptCode, ptParam)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'PFMC_SameHW_000100'
        scriptCode = scriptCodePrefix + '不同账户向5个不同的节点连续发送交易（不带memo）测试性能上限'
        {
            ptParam = tcsPerformanceTest.createPerformanceTestParam(txFunctionName, actionCount, txCount,
                [interfaceType.rpc, interfaceType.websocket], 18, 5, 1, 0,
                5000, true, true, false)
            let testScript = tcsPerformanceTest.createTestScript(server, '一个请求执行多个交易',
                testCaseCode, scriptCode, ptParam)
            framework.addTestScript(testScripts, testScript)
        }

        //endregion

        //region 带8字节memo

        testCaseCode = 'PFMC_SameHW_000110'
        scriptCode = scriptCodePrefix + '同一账户向同一节点连续发送交易（带8字节memo）测试性能上限'
        {
            ptParam = tcsPerformanceTest.createPerformanceTestParam(txFunctionName, actionCount, txCount,
                [interfaceType.rpc, interfaceType.websocket], 18, 1, 1, 8,
                5000, true, true, false)
            let testScript = tcsPerformanceTest.createTestScript(server, '一个请求执行多个交易',
                testCaseCode, scriptCode, ptParam)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'PFMC_SameHW_000120'
        scriptCode = scriptCodePrefix + '不同账户向5个不同的节点连续发送交易（带8字节memo）测试性能上限'
        {
            ptParam = tcsPerformanceTest.createPerformanceTestParam(txFunctionName, actionCount, txCount,
                [interfaceType.rpc, interfaceType.websocket], 18, 5, 5, 8,
                5000, true, true, false)
            let testScript = tcsPerformanceTest.createTestScript(server, '一个请求执行多个交易',
                testCaseCode, scriptCode, ptParam)
            framework.addTestScript(testScripts, testScript)
        }

        //endregion

        //region 带64字节memo

        testCaseCode = 'PFMC_SameHW_000130'
        scriptCode = scriptCodePrefix + '同一账户向同一节点连续发送交易（带64字节memo）测试性能上限'
        {
            ptParam = tcsPerformanceTest.createPerformanceTestParam(txFunctionName, actionCount, txCount,
                [interfaceType.rpc, interfaceType.websocket], 18, 1, 1, 64,
                5000, true, true, false)
            let testScript = tcsPerformanceTest.createTestScript(server, '一个请求执行多个交易',
                testCaseCode, scriptCode, ptParam)
            testScript.restrictedLevel = restrictedLevel.L3
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'PFMC_SameHW_000140'
        scriptCode = scriptCodePrefix + '不同账户向5个不同的节点连续发送交易（带64字节memo）测试性能上限'
        {
            ptParam = tcsPerformanceTest.createPerformanceTestParam(txFunctionName, actionCount, txCount,
                [interfaceType.rpc, interfaceType.websocket], 18, 5, 5, 64,
                5000, true, true, false)
            let testScript = tcsPerformanceTest.createTestScript(server, '一个请求执行多个交易',
                testCaseCode, scriptCode, ptParam)
            testScript.restrictedLevel = restrictedLevel.L3
            framework.addTestScript(testScripts, testScript)
        }

        //endregion

        //region 带512字节memo

        testCaseCode = 'PFMC_SameHW_000150'
        scriptCode = scriptCodePrefix + '同一账户向同一节点连续发送交易（带512字节memo）测试性能上限'
        {
            ptParam = tcsPerformanceTest.createPerformanceTestParam(txFunctionName, actionCount, txCount,
                [interfaceType.rpc, interfaceType.websocket], 18, 1, 1, 512,
                5000, true, true, false)
            let testScript = tcsPerformanceTest.createTestScript(server, '一个请求执行多个交易',
                testCaseCode, scriptCode, ptParam)
            testScript.restrictedLevel = restrictedLevel.L4
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'PFMC_SameHW_000160'
        scriptCode = scriptCodePrefix + '不同账户向5个不同的节点连续发送交易（带512字节memo）测试性能上限'
        {
            ptParam = tcsPerformanceTest.createPerformanceTestParam(txFunctionName, actionCount, txCount,
                [interfaceType.rpc, interfaceType.websocket], 18, 5, 5, 512,
                5000, true, true, false)
            let testScript = tcsPerformanceTest.createTestScript(server, '一个请求执行多个交易',
                testCaseCode, scriptCode, ptParam)
            testScript.restrictedLevel = restrictedLevel.L4
            framework.addTestScript(testScripts, testScript)
        }

        //endregion

        //region 带4096字节memo

        testCaseCode = 'PFMC_SameHW_000170'
        scriptCode = scriptCodePrefix + '同一账户向同一节点连续发送交易（带4096字节memo）测试性能上限'
        {
            ptParam = tcsPerformanceTest.createPerformanceTestParam(txFunctionName, actionCount, txCount,
                [interfaceType.rpc, interfaceType.websocket], 18, 1, 1, 4096,
                5000, true, true, false)
            let testScript = tcsPerformanceTest.createTestScript(server, '一个请求执行多个交易',
                testCaseCode, scriptCode, ptParam)
            testScript.restrictedLevel = restrictedLevel.L4
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'PFMC_SameHW_000180'
        scriptCode = scriptCodePrefix + '不同账户向5个不同的节点连续发送交易（带4096字节memo）测试性能上限'
        {
            ptParam = tcsPerformanceTest.createPerformanceTestParam(txFunctionName, actionCount, txCount,
                [interfaceType.rpc, interfaceType.websocket], 18, 5, 5, 4096,
                5000, true, true, false)
            let testScript = tcsPerformanceTest.createTestScript(server, '一个请求执行多个交易',
                testCaseCode, scriptCode, ptParam)
            testScript.restrictedLevel = restrictedLevel.L4
            framework.addTestScript(testScripts, testScript)
        }

        //endregion

        //region 带32768字节memo

        testCaseCode = 'PFMC_SameHW_000190'
        scriptCode = scriptCodePrefix + '同一账户向同一节点连续发送交易（带32768字节memo）测试性能上限'
        {
            ptParam = tcsPerformanceTest.createPerformanceTestParam(txFunctionName, actionCount, txCount,
                [interfaceType.rpc, interfaceType.websocket], 18, 1, 1, 32768,
                5000, true, true, false)
            let testScript = tcsPerformanceTest.createTestScript(server, '一个请求执行多个交易',
                testCaseCode, scriptCode, ptParam)
            testScript.restrictedLevel = restrictedLevel.L5
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'PFMC_SameHW_000200'
        scriptCode = scriptCodePrefix + '不同账户向5个不同的节点连续发送交易（带32768字节memo）测试性能上限'
        {
            ptParam = tcsPerformanceTest.createPerformanceTestParam(txFunctionName, actionCount, txCount,
                [interfaceType.rpc, interfaceType.websocket], 18, 5, 5, 32768,
                5000, true, true, false)
            let testScript = tcsPerformanceTest.createTestScript(server, '一个请求执行多个交易',
                testCaseCode, scriptCode, ptParam)
            testScript.restrictedLevel = restrictedLevel.L5
            framework.addTestScript(testScripts, testScript)
        }

        //endregion

        //region 无效交易

        testCaseCode = 'PFMC_SameHW_000210'
        scriptCode = scriptCodePrefix + '性能测试时加入无效交易'
        {
            ptParam = tcsPerformanceTest.createPerformanceTestParam(txFunctionName, 1, 2,
                [interfaceType.rpc, interfaceType.websocket], 18, 5, 5, 0,
                5000, true, true, false)
            ptParam.failTxCount = 1
            let testScript = tcsPerformanceTest.createTestScript(server, '一个请求执行多个交易',
                testCaseCode, scriptCode, ptParam)
            framework.addTestScript(testScripts, testScript)
        }

        //endregion

        framework.testTestScripts(server, describeTitle + '_' + txFunctionName, testScripts)

    },

    testForPurePerformance: function(server, describeTitle, txFunctionName, actionCount, txCount){
        let testScripts = []
        let ptParam
        let testCaseCode
        let scriptCode
        testCaseCode = 'UNK_UNKNOWN_000000'
        {
            ptParam = tcsPerformanceTest.createPerformanceTestParam(txFunctionName, actionCount, txCount,
                [interfaceType.rpc, interfaceType.websocket], 18, 20, 20, 0,
                5000, true, false, false)
            let testScript = tcsPerformanceTest.createTestScript(server, '一个请求执行多个交易',
                testCaseCode, scriptCode, ptParam)
            framework.addTestScript(testScripts, testScript)
        }
        framework.testTestScripts(server, describeTitle, testScripts)
    },

    createTestScript: function(server, describeTitle, testCaseCode, scriptCode, ptParam){

        if(!testCaseCode) testCaseCode = 'UNK_UNKNOWN_000000'
        let scriptCodePrefix = ptParam.txFunctionName == consts.rpcFunctions.sendTx ? '000100_' : '000200_'
        if(!scriptCode) scriptCode = scriptCodePrefix + '_tcsSendTxInOneRequest_'
            + ptParam.actionCount + '个请求，各执行' + ptParam.txCount + '个交易'

        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],
        )

        //region select server in server list, then change action.server
        let servers = tcsPerformanceTest.createServerList(ptParam.serverTypes, ptParam.serverCount, ptParam.actionCount)
        //endregion

        //region memos
        let memos
        if(ptParam.memoSize){
            memos = utility.createMemosWithSpecialLength(ptParam.memoSize)
        }
        else{
            memos = []
        }
        //endregion

        //region accounts

        let accounts = server.mode.addresses
        let fromAccounts = [accounts.pressureAccount1, accounts.pressureAccount2,  accounts.pressureAccount3, accounts.pressureAccount4,
            accounts.pressureAccount5, accounts.pressureAccount6,  accounts.pressureAccount7, accounts.pressureAccount8,
            accounts.pressureAccount9, accounts.pressureAccount10,  accounts.pressureAccount11, accounts.pressureAccount12,
            accounts.pressureAccount13, accounts.pressureAccount14, accounts.pressureAccount15, accounts.pressureAccount16,
            accounts.pressureAccount17, accounts.pressureAccount18, accounts.pressureAccount19, accounts.pressureAccount20,]
        let toAccounts = [accounts.rootAccount, accounts.fixedSender1,  accounts.fixedSender2, accounts.fixedSender3,
            accounts.sender1, accounts.receiver1,  accounts.sender2, accounts.receiver2,
            accounts.sender3, accounts.receiver3,  accounts.balanceAccount, accounts.sequence1,
            accounts.sequence2, accounts.sequence3, accounts.sequence4, accounts.sequence5,
            accounts.walletAccount, accounts.fixedReceiver1, accounts.fixedReceiver2, accounts.fixedReceiver3,]

        //select from address in address list, then change param.from
        let fromList
        if(ptParam.fromCount && ptParam.fromCount > 1){
            fromList = tcsPerformanceTest.createAccountList(fromAccounts, ptParam.fromCount, ptParam.actionCount)
        }

        //select to address in address list, then change param.to
        let toList
        if(ptParam.toCount && ptParam.toCount > 1){
            toList = tcsPerformanceTest.createAccountList(toAccounts, ptParam.toCount, ptParam.actionCount)
        }

        //endregion

        //region fail tx
        let failTxs
        let txCount = ptParam.txCount
        if(ptParam.failTxCount && ptParam.failTxCount > 0){
            failTxs = tcsPerformanceTest.createFailTxList(server, ptParam.txCount, ptParam.failTxCount,)
            txCount = ptParam.txCount - ptParam.failTxCount
        }
        //endregion

        for(let j = 0; j < ptParam.actionCount; j++){
            let txTemplate = framework.createTxParamsForTransfer(server)[0]
            if(ptParam.quickTx) txTemplate.flags = consts.flags.quick
            let expectResults = []
            let txParams = []

            for(let i = 0; i < txCount; i++){
                let txParam = utility.deepClone(txTemplate)
                expectResults.push(framework.createExpectedResult({needPass: true}))

                if(fromList){
                    txParam.from = fromList[j].address
                    txParam.secret = fromList[j].secret
                }

                if(toList){
                    txParam.to = toList[j].address
                }

                if(memos){
                    txParam.memos = memos
                }

                txParams.push(txParam)
            }

            if(failTxs){
                for(let k = 0; k < failTxs.length; k++){
                    let failTx = failTxs[k]
                    let txParam = failTx.param
                    expectResults.push(framework.createExpectedResult(false,
                        framework.getError(failTx.error.code, failTx.error.info)))
                    txParams.push(txParam)
                }
            }

            framework.pushTestActionForSendAndSign(testScript, ptParam.txFunctionName, txParams)
            if(ptParam.txFunctionName == consts.rpcFunctions.sendTx){
                let action = testScript.actions[j]
                action.server = servers[j]
                action.needResetSequence = ptParam.needResetSequence
                action.timeout = ptParam.timeout
                // action.expectedResults = testScript.actions[0].expectedResults.concat(expectResults)
                action.expectedResults = expectResults
                if(ptParam.needCheck != undefined && ptParam.needCheck == false){
                    action.checkFunction = null
                }
            }
            else if(ptParam.txFunctionName == consts.rpcFunctions.signTx){
                let action_sign = testScript.actions[j * 2]
                let action_sendRaw = testScript.actions[j * 2 + 1]
                action_sign.server = servers[j]
                action_sendRaw.server = servers[j]
                action_sign.needResetSequence = ptParam.needResetSequence
                // action_sign.expectedResults = testScript.actions[0].expectedResults.concat(expectResults)
                action_sign.expectedResults = expectResults
                action_sendRaw.timeout = ptParam.timeout
                // action_sendRaw.expectedResults = testScript.actions[0].expectedResults.concat(expectResults)
                action_sendRaw.expectedResults = []
                for(let k = 0; k < expectResults.length; k++){
                    action_sendRaw.expectedResults.push(utility.deepClone(expectResults[k]))
                    if(!action_sendRaw.expectedResults[k].needPass){
                        action_sendRaw.expectedResults[k] = framework.createExpectedResult(false,
                            framework.getError(-278, 'empty raw transaction'))
                    }
                }
                 if(ptParam.needCheck != undefined && ptParam.needCheck == false){
                    action_sign.checkFunction = null
                    action_sendRaw.checkFunction = null
                }
            }
        }

        return testScript

    },

    //endregion

    //region create rand list

    //region accounts
    createAccountList: function(accounts, allowAccountsCount, returnAccountsCount){
        let list = []
        let max = Math.min(allowAccountsCount - 1, accounts.length - 1)
        let rands = utility.getRandList(0, max, returnAccountsCount, true)
        for(let i = 0; i < returnAccountsCount; i++){
            list.push(accounts[rands[i]])
        }
        return list
    },
    //endregion

    //region servers
    createServerList: function(serverTypes, serverCount, requestCount){
        let allServers = tcsPerformanceTest.selectServers(serverTypes, serverCount)
        let servers = []
        let rands = utility.getRandList(0, serverCount - 1, requestCount, true)
        for(let i = 0; i < requestCount; i++){
            servers.push(allServers[rands[i]])
        }
        return servers
    },

    selectServers: function(serverTypes, serverCount){
        let allServers = []
        if(utility.ifArrayHas(serverTypes, interfaceType.rpc)){
            allServers = allServers.concat(rpcServers)
        }
        if(utility.ifArrayHas(serverTypes, interfaceType.websocket)){
            allServers = allServers.concat(wsServers)
        }
        let max = Math.min(serverCount - 1, allServers.length - 1)
        let servers = []
        let rands = utility.getRandList(0, max, serverCount, false)
        for(let i = 0; i < serverCount; i++){
            servers.push(allServers[rands[i]])
        }
        return servers
    },
    //endregion

    //region fail txs
    createFailTxList: function(server, txCount, failTxCount){
        let allFailTxs = tcsPerformanceTest.getFixedFailTxs(server)
        let txIndexList = utility.getRandList(0, txCount - 1, failTxCount, false)
        let failTxIndexList = utility.getRandList(0, allFailTxs.length - 1, failTxCount, true)
        let failTxs = []
        for(let i = 0; i < failTxCount; i++){
            let failTx = utility.deepClone(allFailTxs[failTxIndexList[i]])
            failTx.index = txIndexList[i]
            failTxs.push(failTx)
        }
        return failTxs
    },

    getFixedFailTxs: function(server){
        let failTxs = {}
        let allFailTxs = []

        failTxs.wrongFrom = tcsPerformanceTest.createFailTx(server)
        failTxs.wrongFrom.param.from = server.mode.addresses.walletAccount.address + '1'
        failTxs.wrongFrom.param.secret = server.mode.addresses.walletAccount.secret
        failTxs.wrongFrom.param.sequence = 1
        failTxs.wrongFrom.error.code = -278
        failTxs.wrongFrom.error.info = 'Bad account address'
        allFailTxs.push(failTxs.wrongFrom)

        failTxs.wrongSecret = tcsPerformanceTest.createFailTx(server)
        failTxs.wrongSecret.param.from = server.mode.addresses.walletAccount.address
        failTxs.wrongSecret.param.secret = server.mode.addresses.balanceAccount.secret
        failTxs.wrongSecret.param.sequence = 1
        failTxs.wrongSecret.error.code = -278
        failTxs.wrongSecret.error.info = 'secret doesn\'t match with address'
        allFailTxs.push(failTxs.wrongSecret)

        failTxs.wrongTo = tcsPerformanceTest.createFailTx(server)
        failTxs.wrongTo.param.to = server.mode.addresses.balanceAccount.address + '1'
        failTxs.wrongTo.param.sequence = 1
        failTxs.wrongTo.error.code = -278
        failTxs.wrongTo.error.info = 'Bad account address'
        allFailTxs.push(failTxs.wrongTo)

        // failTxs.wrongSequence = tcsPerformanceTest.createFailTx(server)
        // failTxs.wrongSequence.param.sequence = 0
        // failTxs.wrongSequence.error.code = -278
        // failTxs.wrongSequence.error.info = 'sequence must be positive integer'
        // allFailTxs.push(failTxs.wrongSequence)

        failTxs.wrongValue = tcsPerformanceTest.createFailTx(server)
        failTxs.wrongValue.param.value = '99999999999999999999999999'
        failTxs.wrongValue.param.sequence = 1
        failTxs.wrongValue.error.code = -278
        failTxs.wrongValue.error.info = 'out of range'
        allFailTxs.push(failTxs.wrongValue)

        failTxs.wrongFee = tcsPerformanceTest.createFailTx(server)
        failTxs.wrongFee.param.fee = '99999999999999999999999999'
        failTxs.wrongFee.param.sequence = 1
        failTxs.wrongFee.error.code = -278
        failTxs.wrongFee.error.info = 'out of range'
        allFailTxs.push(failTxs.wrongFee)

        return allFailTxs
    },

    createFailTx: function(server){
        let failTx = {}
        failTx.name
        failTx.index
        failTx.error = {}
        failTx.error.code
        failTx.error.info
        failTx.param = {}
        failTx.param.from = server.mode.addresses.walletAccount.address
        failTx.param.secret = server.mode.addresses.walletAccount.secret
        failTx.param.to = server.mode.addresses.balanceAccount.address
        failTx.param.sequence
        failTx.param.value = '1'
        failTx.param.fee = '10'
        return failTx
    },

    // updateTxParamWithFailTx(txParam, failTx){
    //     if(failTx.param.from) txParam.from = failTx.param.from
    //     if(failTx.param.secret) txParam.secret = failTx.param.secret
    //     if(failTx.param.to) txParam.to = failTx.param.to
    //     if(failTx.param.sequence) txParam.sequence = failTx.param.sequence
    //     if(failTx.param.value) txParam.value = failTx.param.value
    //     if(failTx.param.fee) txParam.fee = failTx.param.fee
    // },
    //
    // getExpectedResultByFailTx(failTx){
    //     return framework.createExpectedResult(false, framework.getError(failTx.error.code, failTx.error.info))
    // },

    //endregion

    //endregion

}
