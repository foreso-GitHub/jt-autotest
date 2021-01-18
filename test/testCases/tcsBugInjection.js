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
const nodeMonitor = require('../utility/monitor/monitor')
let monitor = new nodeMonitor()
let sshCmd = require('../framework/sshCmd')
const { jtNodes, } = require("../config/config")
const netStatusTool = require("../utility/monitor/netStatusTool")
//endregion

module.exports = tcsBugInjection = {

    //region tx receipt check

    test: function(server, describeTitle){

        let testScripts = []
        let testCaseCode
        let defaultScriptCode = '000100'
        let scriptCode
        let txParams = {}

        describe(describeTitle, async function () {

            afterEach(async function() {
                netStatusTool.resetNetAll()
                netStatusTool.resetTcAll()
                logger.debug('Reset network!')
            })

            //region 网络丢包测试

            testScripts = []

            testCaseCode = 'ERR_Inject_000110'
            scriptCode = defaultScriptCode + '_网络丢包测试_01:每个节点Loss30%，然后恢复'
            {
                let txParams = {}
                txParams.initNodeCount = 5
                txParams.execNodeCount = 5
                txParams.execCmdsFunc = tcsBugInjection.loss30
                let testScript = tcsBugInjection.createTestScriptForTcCmds(server, testCaseCode, scriptCode, 'Bug_Inject', txParams)
                framework.addTestScript(testScripts, testScript)
            }

            testCaseCode = 'ERR_Inject_000120'
            scriptCode = defaultScriptCode + '_网络丢包测试_02:单个节点Loss30%，然后恢复'
            {
                let txParams = {}
                txParams.initNodeCount = 5
                txParams.execNodeCount = 1
                txParams.execCmdsFunc = tcsBugInjection.loss30
                let testScript = tcsBugInjection.createTestScriptForTcCmds(server, testCaseCode, scriptCode, 'Bug_Inject', txParams)
                framework.addTestScript(testScripts, testScript)
            }

            framework.testTestScripts(server, describeTitle, testScripts)

            //endregion

            //region 网络包重复测试

            // testCases = []
            //
            // title = '0130\t网络包重复测试_01:每个节点Duplicate30%，然后恢复'
            // txParams = {}
            // txParams.initNodeCount = 5
            // txParams.execNodeCount = 5
            // txParams.execCmdsFunc = tcsBugInjection.duplicate30
            // testCase = tcsBugInjection.createTestCaseForTcCmds(server, title, txParams)
            // framework.addTestScript(testCases, testCase)
            //
            // title = '0140\t网络包重复测试_02:单个节点Duplicate30%，然后恢复'
            // txParams = {}
            // txParams.initNodeCount = 5
            // txParams.execNodeCount = 1
            // txParams.execCmdsFunc = tcsBugInjection.duplicate30
            // testCase = tcsBugInjection.createTestCaseForTcCmds(server, title, txParams)
            // framework.addTestScript(testCases, testCase)
            //
            // framework.testTestScripts(server, describeTitle + '_网络包重复测试', testCases)  //node operation will conflict.  so one case, one test.

            testCaseCode = 'ERR_Inject_000130'
            scriptCode = defaultScriptCode + '_网络丢包测试_01:每个节点Duplicate30%，然后恢复'
            {
                let txParams = {}
                txParams.initNodeCount = 5
                txParams.execNodeCount = 5
                txParams.execCmdsFunc = tcsBugInjection.duplicate30
                let testScript = tcsBugInjection.createTestScriptForTcCmds(server, testCaseCode, scriptCode, 'Bug_Inject', txParams)
                framework.addTestScript(testScripts, testScript)
            }

            testCaseCode = 'ERR_Inject_000140'
            scriptCode = defaultScriptCode + '_网络丢包测试_02:单个节点Duplicate30%，然后恢复'
            {
                let txParams = {}
                txParams.initNodeCount = 5
                txParams.execNodeCount = 1
                txParams.execCmdsFunc = tcsBugInjection.duplicate30
                let testScript = tcsBugInjection.createTestScriptForTcCmds(server, testCaseCode, scriptCode, 'Bug_Inject', txParams)
                framework.addTestScript(testScripts, testScript)
            }

            //endregion

            //region 网络包损坏测试

            // testCases = []
            //
            // title = '0150\t网络包损坏测试_01:每个节点Corrupt30%，然后恢复'
            // txParams = {}
            // txParams.initNodeCount = 5
            // txParams.execNodeCount = 5
            // txParams.execCmdsFunc = tcsBugInjection.corrupt30
            // testCase = tcsBugInjection.createTestCaseForTcCmds(server, title, txParams)
            // framework.addTestScript(testCases, testCase)
            //
            // title = '0160\t网络包损坏测试_02:单个节点Corrupt30%，然后恢复'
            // txParams = {}
            // txParams.initNodeCount = 5
            // txParams.execNodeCount = 1
            // txParams.execCmdsFunc = tcsBugInjection.corrupt30
            // testCase = tcsBugInjection.createTestCaseForTcCmds(server, title, txParams)
            // framework.addTestScript(testCases, testCase)
            //
            // framework.testTestScripts(server, describeTitle + '_网络包损坏测试', testCases)  //node operation will conflict.  so one case, one test.

            testCaseCode = 'ERR_Inject_000150'
            scriptCode = defaultScriptCode + '_网络丢包测试_01:每个节点Corrupt30%，然后恢复'
            {
                let txParams = {}
                txParams.initNodeCount = 5
                txParams.execNodeCount = 5
                txParams.execCmdsFunc = tcsBugInjection.corrupt30
                let testScript = tcsBugInjection.createTestScriptForTcCmds(server, testCaseCode, scriptCode, 'Bug_Inject', txParams)
                framework.addTestScript(testScripts, testScript)
            }

            testCaseCode = 'ERR_Inject_000160'
            scriptCode = defaultScriptCode + '_网络丢包测试_02:单个节点Corrupt30%，然后恢复'
            {
                let txParams = {}
                txParams.initNodeCount = 5
                txParams.execNodeCount = 1
                txParams.execCmdsFunc = tcsBugInjection.corrupt30
                let testScript = tcsBugInjection.createTestScriptForTcCmds(server, testCaseCode, scriptCode, 'Bug_Inject', txParams)
                framework.addTestScript(testScripts, testScript)
            }

            //endregion

            //region 网络包乱序测试

            // testCases = []
            //
            // title = '0170\t网络包乱序测试_01:每个节点Reorder30%，然后恢复'
            // txParams = {}
            // txParams.initNodeCount = 5
            // txParams.execNodeCount = 5
            // txParams.execCmdsFunc = tcsBugInjection.reorder30
            // testCase = tcsBugInjection.createTestCaseForTcCmds(server, title, txParams)
            // framework.addTestScript(testCases, testCase)
            //
            // title = '0180\t网络包乱序测试_02:单个节点Reorder30%，然后恢复'
            // txParams = {}
            // txParams.initNodeCount = 5
            // txParams.execNodeCount = 1
            // txParams.execCmdsFunc = tcsBugInjection.reorder30
            // // txParams.execNode = jtNodes[3]  //指定执行的node，不然会随机选择
            // testCase = tcsBugInjection.createTestCaseForTcCmds(server, title, txParams)
            // framework.addTestScript(testCases, testCase)
            //
            // framework.testTestScripts(server, describeTitle + '_网络包乱序测试', testCases)  //node operation will conflict.  so one case, one test.

            testCaseCode = 'ERR_Inject_000170'
            scriptCode = defaultScriptCode + '_网络丢包测试_01:每个节点Reorder30%，然后恢复'
            {
                let txParams = {}
                txParams.initNodeCount = 5
                txParams.execNodeCount = 5
                txParams.execCmdsFunc = tcsBugInjection.reorder30
                let testScript = tcsBugInjection.createTestScriptForTcCmds(server, testCaseCode, scriptCode, 'Bug_Inject', txParams)
                framework.addTestScript(testScripts, testScript)
            }

            testCaseCode = 'ERR_Inject_000180'
            scriptCode = defaultScriptCode + '_网络丢包测试_02:单个节点Reorder30%，然后恢复'
            {
                let txParams = {}
                txParams.initNodeCount = 5
                txParams.execNodeCount = 1
                txParams.execCmdsFunc = tcsBugInjection.reorder30
                // txParams.execNode = jtNodes[3]  //指定执行的node，不然会随机选择
                let testScript = tcsBugInjection.createTestScriptForTcCmds(server, testCaseCode, scriptCode, 'Bug_Inject', txParams)
                framework.addTestScript(testScripts, testScript)
            }

            //endregion

            //region 网络延时测试

            // testCases = []
            //
            // title = '0090\t网络延时测试_01:每个节点5%概率延迟1s，然后恢复'
            // txParams = {}
            // txParams.initNodeCount = 5
            // txParams.execNodeCount = 5
            // txParams.execCmdsFunc = tcsBugInjection.delay0_1_5
            // txParams.timeAfterResetCmds = 60000  //確保网络延时测试需要60s來恢復
            // testCase = tcsBugInjection.createTestCaseForTcCmds(server, title, txParams)
            // framework.addTestScript(testCases, testCase)
            //
            // title = '0100\t网络延时测试_02:单个节点5%概率延迟1s，然后恢复'
            // txParams = {}
            // txParams.initNodeCount = 5
            // txParams.execNodeCount = 1
            // txParams.execCmdsFunc = tcsBugInjection.delay0_1_5
            // txParams.timeAfterResetCmds = 60000  //確保网络延时测试需要60s來恢復
            // // txParams.execNode = jtNodes[0]  //指定执行的node为bd，不然会随机选择
            // testCase = tcsBugInjection.createTestCaseForTcCmds(server, title, txParams)
            // framework.addTestScript(testCases, testCase)
            //
            // framework.testTestScripts(server, describeTitle + '_网络延时测试', testCases)  //node operation will conflict.  so one case, one test.

            testCaseCode = 'ERR_Inject_000090'
            scriptCode = defaultScriptCode + '_网络丢包测试_01:每个节点5%概率延迟1s，然后恢复'
            {
                let txParams = {}
                txParams.initNodeCount = 5
                txParams.execNodeCount = 5
                txParams.execCmdsFunc = tcsBugInjection.delay0_1_5
                let testScript = tcsBugInjection.createTestScriptForTcCmds(server, testCaseCode, scriptCode, 'Bug_Inject', txParams)
                framework.addTestScript(testScripts, testScript)
            }

            testCaseCode = 'ERR_Inject_000100'
            scriptCode = defaultScriptCode + '_网络丢包测试_02:单个节点5%概率延迟1s，然后恢复'
            {
                let txParams = {}
                txParams.initNodeCount = 5
                txParams.execNodeCount = 1
                txParams.execCmdsFunc = tcsBugInjection.delay0_1_5
                // txParams.execNode = jtNodes[0]  //指定执行的node为bd，不然会随机选择
                let testScript = tcsBugInjection.createTestScriptForTcCmds(server, testCaseCode, scriptCode, 'Bug_Inject', txParams)
                framework.addTestScript(testScripts, testScript)
            }

            //endregion

            //region 断网测试

            // testScripts = []
            //
            // testCaseCode = 'ERR_Inject_000010'
            // scriptCode = defaultScriptCode + '_断开一个共识节点的网络'
            // {
            //     let txParams = {}
            //     txParams.initNodeCount = 5
            //     txParams.execNodeCount = 1
            //     let testScript = tcsBugInjection.createTestScriptForCloseP2P(server, testCaseCode, scriptCode, 'Bug_Inject', txParams)
            //     framework.addTestScript(testScripts, testScript)
            //     framework.testTestScripts(server, describeTitle, testScripts)
            // }
            //
            // testCaseCode = 'ERR_Inject_000010'
            // {
            //     for(let i = 1; i <= 5; i++){
            //         testScripts = []
            //         scriptCode = '000200' + '_多次断开一个共识节点的网络，第' + i + '次'
            //         let txParams = {}
            //         txParams.initNodeCount = 5
            //         txParams.execNodeCount = 1
            //         let testScript = tcsBugInjection.createTestScriptForCloseP2P(server, testCaseCode, scriptCode, 'Bug_Inject', txParams)
            //         framework.addTestScript(testScripts, testScript)
            //         // framework.testTestScripts(server, describeTitle, testScripts)
            //     }
            // }

            //endregion

        })
    },

    //region exec/check p2p

    createTestScript: function(server, testCaseCode, scriptCode, txFunctionName, txParams){

        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L3,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        let action = framework.createTestAction(testScript, txFunctionName, txParams,
            tcsBugInjection.execTcCmds,
            tcsBugInjection.checkTcCmds,
            [{needPass: true}])
        action.txParams = txParams  //必须加上，因为 createTestAction中 txParams会被deepclone后赋值给originalTxParams，丢失functions
        action.actualResult = []
        action.txParams.allNodes = jtNodes
        action.txParams.timeAfterExecCmds = 60000
        action.txParams.timeAfterResetCmds = 60000
        testScript.actions.push(action)

        return testScript
    },

    createTestScriptForCloseP2P: function(server, testCaseCode, scriptCode, txFunctionName, txParams){

        let testScript = tcsBugInjection.createTestScript(server, testCaseCode, scriptCode, txFunctionName, txParams)
        let action = testScript.actions[0]
        action.txParams.execCmdsFunc = tcsBugInjection.closeP2P
        action.txParams.resetCmdsFunc = tcsBugInjection.resetNet
        action.txParams.needCheck2ndNetSync = true

        return testScript
    },

    createTestScriptForTcCmds: function(server, testCaseCode, scriptCode, txFunctionName, txParams){

        let testScript = tcsBugInjection.createTestScript(server, testCaseCode, scriptCode, txFunctionName, txParams)
        let action = testScript.actions[0]
        action.txParams.resetCmdsFunc = tcsBugInjection.resetTc
        action.txParams.needCheck2ndNetSync = false

        return testScript
    },

    execTcCmds: function(action){
        action.hasExecuted = true
        return new Promise(async (resolve, reject) => {
            let allNodes = action.txParams.allNodes
            let netSync = await monitor.checkSync(allNodes)
            monitor.printNetSync(netSync)
            action.actualResult.push(netSync)

            let initNodeCount = action.txParams.initNodeCount
            if(netSync.syncCount != initNodeCount){
                reject("init node count is not " + initNodeCount)
            }
            else{
                let execNodeCount = action.txParams.execNodeCount
                let nodes = []
                if(action.txParams.execNode){
                    nodes.push(action.txParams.execNode)
                    logger.debug('===selected service: ' + action.txParams.execNode.name)
                }else{
                    let rands = testUtility.getRandList(0, initNodeCount - 1, execNodeCount, false)
                    for (let i = 0; i < execNodeCount; i++){
                        nodes.push(allNodes[rands[i]])
                        logger.debug('===selected service: ' + allNodes[rands[i]].name)
                    }
                }

                tcsBugInjection.execByNodes(nodes, action.txParams.execCmdsFunc)
                await utility.timeout(action.txParams.timeAfterExecCmds)
                if(action.txParams.needCheck2ndNetSync){
                    netSync = await monitor.checkSync(allNodes)
                    monitor.printNetSync(netSync)
                }
                else{
                    netSync = {}
                }
                action.actualResult.push(netSync)

                tcsBugInjection.execByNodes(nodes, action.txParams.resetCmdsFunc)
                await utility.timeout(action.txParams.timeAfterResetCmds)
                netSync = await monitor.checkSync(allNodes)
                monitor.printNetSync(netSync)
                action.actualResult.push(netSync)

                resolve(action)
            }
        })
    },

    checkTcCmds: function(action){

        let initNodeCount = action.txParams.initNodeCount
        let netSyncList = action.actualResult
        let execNodeCount = action.txParams.execNodeCount
        expect(netSyncList[0].syncCount).to.be.equals(initNodeCount)
        if(action.txParams.needCheck2ndNetSync){
            expect(netSyncList[1].syncCount).to.be.equals(initNodeCount - execNodeCount)
            expect(netSyncList[1].blockNumber > netSyncList[0].blockNumber).to.be.ok
            expect(netSyncList[2].syncCount).to.be.equals(initNodeCount)
            expect(netSyncList[2].blockNumber > netSyncList[1].blockNumber).to.be.ok
        }
        else{
            expect(netSyncList[2].syncCount).to.be.equals(initNodeCount)
            expect(netSyncList[2].blockNumber > netSyncList[0].blockNumber).to.be.ok
        }

    },

    execCloseP2P: function(action){
        action.hasExecuted = true
        return new Promise(async (resolve, reject) => {
            let netSync = await monitor.checkSync(jtNodes)
            monitor.printNetSync(netSync)
            action.actualResult.push(netSync)

            let initNodeCount = action.txParams.initNodeCount
            if(netSync.syncCount != initNodeCount){
                reject("init node count is not " + initNodeCount)
            }
            else{
                let execNodeCount = action.txParams.execNodeCount
                let nodes = []
                let rands = testUtility.getRandList(0, initNodeCount - 1, execNodeCount, false)

                for (let i = 0; i < execNodeCount; i++){
                    nodes.push(jtNodes[rands[i]])
                    logger.debug('===selected service: ' + jtNodes[rands[i]].name)
                }

                tcsBugInjection.execByNodes(nodes, tcsBugInjection.closeP2P)
                await utility.timeout(action.txParams.timeAfterExecCmds)
                netSync = await monitor.checkSync(jtNodes)
                monitor.printNetSync(netSync)
                action.actualResult.push(netSync)

                tcsBugInjection.execByNodes(nodes, tcsBugInjection.resetNet)
                await utility.timeout(action.txParams.timeAfterResetCmds)
                netSync = await monitor.checkSync(jtNodes)
                monitor.printNetSync(netSync)
                action.actualResult.push(netSync)

                resolve(action)
            }
        })
    },

    checkCloseP2P: function(action){
        let initNodeCount = action.txParams.initNodeCount
        let netSyncList = action.actualResult
        let execNodeCount = action.txParams.execNodeCount
        expect(netSyncList[0].syncCount).to.be.equals(initNodeCount)
        expect(netSyncList[1].syncCount).to.be.equals(initNodeCount - execNodeCount)
        expect(netSyncList[1].blockNumber > netSyncList[0].blockNumber).to.be.ok
        expect(netSyncList[2].syncCount).to.be.equals(initNodeCount)
        expect(netSyncList[2].blockNumber > netSyncList[1].blockNumber).to.be.ok
    },

    //endregion

    //region exec/check tc

    // createTestCaseForTcCmds: function(server, title, txParams){
    //     let testCase = framework.createTestCase(
    //         title,
    //         server,
    //         null,
    //         null,
    //         txParams,
    //         tcsBugInjection.execTcCmds,
    //         tcsBugInjection.checkTcCmds,
    //         null,
    //         restrictedLevel.L3,
    //         [serviceType.newChain, ],
    //         [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
    //     )
    //     testCase.txParams.timeAfterExecCmds = 60000
    //     testCase.txParams.resetCmdsFunc = tcsBugInjection.resetTc
    //     testCase.txParams.timeAfterResetCmds = 60000
    //     testCase.txParams.allNodes = jtNodes
    //     return testCase
    // },

    // createTestScriptForTcCmds: function(server, testCaseCode, scriptCode, txFunctionName, txParams){
    //
    //     let testScript = framework.createTestScript(
    //         server,
    //         testCaseCode,
    //         scriptCode,
    //         [],
    //         restrictedLevel.L3,
    //         [serviceType.newChain, ],
    //         [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
    //     )
    //
    //     let action = framework.createTestAction(testScript, txFunctionName, txParams,
    //         tcsBugInjection.execTcCmds,
    //         tcsBugInjection.checkTcCmds,
    //         [{needPass: true}])
    //     action.txParams.timeAfterExecCmds = 60000
    //     action.txParams.timeAfterResetCmds = 60000
    //     action.actualResult = []
    //     testScript.actions.push(action)
    //
    //     return testScript
    // },


    //endregion

    //region ssh cmd

    //region P2P
    closeP2P: function(service){
        sshCmd.execSshCmd(service, service.cmds.closeP2P)
    },

    openP2P: function(service){
        sshCmd.execSshCmd(service, service.cmds.openP2P)
    },

    resetNet: function(service){
        sshCmd.execSshCmd(service, service.cmds.resetNet)
    },
    //endregion

    //region tc
    resetTc: function(service){
        sshCmd.execSshCmd(service, service.cmds.resetTc)
    },

    duplicate30: function(service){
        sshCmd.execSshCmd(service, service.cmds.duplicate30)
    },

    loss30: function(service){
        sshCmd.execSshCmd(service, service.cmds.loss30)
    },

    corrupt30: function(service){
        sshCmd.execSshCmd(service, service.cmds.corrupt30)
    },

    reorder30: function(service){
        sshCmd.execSshCmd(service, service.cmds.reorder30)
    },

    delay0_1_5: function(service){
        sshCmd.execSshCmd(service, service.cmds.delay0_1_5)
    },

    delay1s: function(service){
        sshCmd.execSshCmd(service, service.cmds.delay1s)
    },

    delay6s: function(service){
        sshCmd.execSshCmd(service, service.cmds.delay6s)
    },

    //endregion

    execByNodes: function(services, execFunc){
        services.forEach(service =>{
            execFunc(service)
        })
    },

    //endregion

//endregion

}
