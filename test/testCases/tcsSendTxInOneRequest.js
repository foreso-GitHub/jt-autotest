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

module.exports = tcsSendTxInOneRequest = {

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

    testForSendTxs: function(server, describeTitle, txFunctionName, actionCount, txCount, needResetSequence, timeout, needCheck, quickTx){
        let testScripts = []
        let testCaseCode
        let scriptCode

        // let servers = allRpcServers

        testCaseCode = 'UNK_UNKNOWN_000000'
        scriptCode = '000100_tcsSendTxInOneRequest_' + actionCount + '个请求，各执行' + txCount + '个交易'

        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        for(let j = 0; j < actionCount; j++){
            let txParams = framework.createTxParamsForTransfer(server)
            if(quickTx) txParams[0].flags = consts.flags.quick
            let txTemplate = txParams[0]
            let expectResults = []

            //select server in server list, then change action.server

            for(let i = 1; i < txCount; i++){
                txParams.push(utility.deepClone(txTemplate))

                //select from address in address list, then change param.from

                //select to address in address list, then change param.to

                expectResults.push(framework.createExpecteResult({needPass: true}))
            }
            framework.pushTestActionForSendAndSign(testScript, txFunctionName, txParams)
            if(txFunctionName == consts.rpcFunctions.sendTx){
                let action = testScript.actions[j]
                action.needResetSequence = needResetSequence
                action.timeout = timeout
                action.expectedResults = testScript.actions[0].expectedResults.concat(expectResults)
                if(needCheck != undefined && needCheck == false){
                    action.checkFunction = null
                }
            }
            else if(txFunctionName == consts.rpcFunctions.signTx){
                let action_sign = testScript.actions[j * 2]
                let action_sendRaw = testScript.actions[j * 2 + 1]
                action_sign.needResetSequence = needResetSequence
                action_sign.expectedResults = testScript.actions[0].expectedResults.concat(expectResults)
                action_sendRaw.timeout = timeout
                action_sendRaw.expectedResults = testScript.actions[0].expectedResults.concat(expectResults)
                if(needCheck != undefined && needCheck == false){
                    action_sign.checkFunction = null
                    action_sendRaw.checkFunction = null
                }
            }
        }

        testScripts.push(testScript)
        framework.testTestScripts(server, describeTitle, testScripts)
    },

    testForSendTxs2: function(server, describeTitle, ptParam){
        let testScripts = []
        let testCaseCode
        let scriptCode

        // let servers = allRpcServers

        testCaseCode = 'UNK_UNKNOWN_000000'
        scriptCode = '000100_tcsSendTxInOneRequest_' + ptParam.actionCount + '个请求，各执行' + ptParam.txCount + '个交易'

        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        for(let j = 0; j < ptParam.actionCount; j++){
            let txParams = framework.createTxParamsForTransfer(server)
            if(ptParam.quickTx) txParams[0].flags = consts.flags.quick
            let txTemplate = txParams[0]
            let expectResults = []

            //select server in server list, then change action.server

            for(let i = 1; i < ptParam.txCount; i++){
                txParams.push(utility.deepClone(txTemplate))

                //select from address in address list, then change param.from

                //select to address in address list, then change param.to

                expectResults.push(framework.createExpecteResult({needPass: true}))
            }
            framework.pushTestActionForSendAndSign(testScript, ptParam.txFunctionName, txParams)
            if(ptParam.txFunctionName == consts.rpcFunctions.sendTx){
                let action = testScript.actions[j]
                action.needResetSequence = ptParam.needResetSequence
                action.timeout = ptParam.timeout
                action.expectedResults = testScript.actions[0].expectedResults.concat(expectResults)
                if(ptParam.needCheck != undefined && ptParam.needCheck == false){
                    action.checkFunction = null
                }
            }
            else if(ptParam.txFunctionName == consts.rpcFunctions.signTx){
                let action_sign = testScript.actions[j * 2]
                let action_sendRaw = testScript.actions[j * 2 + 1]
                action_sign.needResetSequence = ptParam.needResetSequence
                action_sign.expectedResults = testScript.actions[0].expectedResults.concat(expectResults)
                action_sendRaw.timeout = ptParam.timeout
                action_sendRaw.expectedResults = testScript.actions[0].expectedResults.concat(expectResults)
                if(ptParam.needCheck != undefined && ptParam.needCheck == false){
                    action_sign.checkFunction = null
                    action_sendRaw.checkFunction = null
                }
            }
        }

        testScripts.push(testScript)
        framework.testTestScripts(server, describeTitle, testScripts)
    },


    //region create rand list

    createFromList: function(count){

    },

    createFromList: function(count){

    },



    createServerList: function(serverTypes, serverCount, txCount){
        let allServers = tcsSendTxInOneRequest.selectServers(serverTypes, serverCount)
        let servers = []
        let rands = utility.getRandList(0, serverCount - 1, txCount, true)
        for(let i = 0; i < txCount; i++){
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
        let servers = []
        let rands = utility.getRandList(0, serverCount - 1, serverCount, false)
        for(let i = 0; i < serverCount; i++){
            servers.push(allServers[rands[i]])
        }
        return servers
    },

    //endregion

}
