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

    testForBugInjection: function(server, describeTitle){

        let testScripts = []
        let testCaseCode
        let defaultScriptCode = '000100'
        let scriptCode
        let txFunctionName = 'Bug_Inject'

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
                let testScript = tcsBugInjection.createTestScriptForTcCmds(server, testCaseCode, scriptCode, txFunctionName, txParams)
                framework.addTestScript(testScripts, testScript)
            }

            testCaseCode = 'ERR_Inject_000120'
            scriptCode = defaultScriptCode + '_网络丢包测试_02:单个节点Loss30%，然后恢复'
            {
                let txParams = {}
                txParams.initNodeCount = 5
                txParams.execNodeCount = 1
                txParams.execCmdsFunc = tcsBugInjection.loss30
                let testScript = tcsBugInjection.createTestScriptForTcCmds(server, testCaseCode, scriptCode, txFunctionName, txParams)
                framework.addTestScript(testScripts, testScript)
            }

            framework.testTestScripts(server, describeTitle + '_网络丢包测试', testScripts)

            //endregion

            //region 网络包重复测试

            testScripts = []

            testCaseCode = 'ERR_Inject_000130'
            scriptCode = defaultScriptCode + '_网络丢包测试_01:每个节点Duplicate30%，然后恢复'
            {
                let txParams = {}
                txParams.initNodeCount = 5
                txParams.execNodeCount = 5
                txParams.execCmdsFunc = tcsBugInjection.duplicate30
                let testScript = tcsBugInjection.createTestScriptForTcCmds(server, testCaseCode, scriptCode, txFunctionName, txParams)
                framework.addTestScript(testScripts, testScript)
            }

            testCaseCode = 'ERR_Inject_000140'
            scriptCode = defaultScriptCode + '_网络丢包测试_02:单个节点Duplicate30%，然后恢复'
            {
                let txParams = {}
                txParams.initNodeCount = 5
                txParams.execNodeCount = 1
                txParams.execCmdsFunc = tcsBugInjection.duplicate30
                let testScript = tcsBugInjection.createTestScriptForTcCmds(server, testCaseCode, scriptCode, txFunctionName, txParams)
                framework.addTestScript(testScripts, testScript)
            }

            framework.testTestScripts(server, describeTitle + '_网络包重复测试', testScripts)

            //endregion

            //region 网络包损坏测试

            testScripts = []

            testCaseCode = 'ERR_Inject_000150'
            scriptCode = defaultScriptCode + '_网络丢包测试_01:每个节点Corrupt30%，然后恢复'
            {
                let txParams = {}
                txParams.initNodeCount = 5
                txParams.execNodeCount = 5
                txParams.execCmdsFunc = tcsBugInjection.corrupt30
                let testScript = tcsBugInjection.createTestScriptForTcCmds(server, testCaseCode, scriptCode, txFunctionName, txParams)
                framework.addTestScript(testScripts, testScript)
            }

            testCaseCode = 'ERR_Inject_000160'
            scriptCode = defaultScriptCode + '_网络丢包测试_02:单个节点Corrupt30%，然后恢复'
            {
                let txParams = {}
                txParams.initNodeCount = 5
                txParams.execNodeCount = 1
                txParams.execCmdsFunc = tcsBugInjection.corrupt30
                let testScript = tcsBugInjection.createTestScriptForTcCmds(server, testCaseCode, scriptCode, txFunctionName, txParams)
                framework.addTestScript(testScripts, testScript)
            }

            framework.testTestScripts(server, describeTitle + '_网络包损坏测试', testScripts)

            //endregion

            //region 网络包乱序测试

            testScripts = []

            testCaseCode = 'ERR_Inject_000170'
            scriptCode = defaultScriptCode + '_网络丢包测试_01:每个节点Reorder30%，然后恢复'
            {
                let txParams = {}
                txParams.initNodeCount = 5
                txParams.execNodeCount = 5
                txParams.execCmdsFunc = tcsBugInjection.reorder30
                let testScript = tcsBugInjection.createTestScriptForTcCmds(server, testCaseCode, scriptCode, txFunctionName, txParams)
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
                let testScript = tcsBugInjection.createTestScriptForTcCmds(server, testCaseCode, scriptCode, txFunctionName, txParams)
                framework.addTestScript(testScripts, testScript)
            }

            framework.testTestScripts(server, describeTitle + '_网络包乱序测试', testScripts)

            //endregion

            //region 网络延时测试

            testScripts = []

            testCaseCode = 'ERR_Inject_000090'
            scriptCode = defaultScriptCode + '_网络丢包测试_01:每个节点5%概率延迟1s，然后恢复'
            {
                let txParams = {}
                txParams.initNodeCount = 5
                txParams.execNodeCount = 5
                txParams.execCmdsFunc = tcsBugInjection.delay0_1_5
                let testScript = tcsBugInjection.createTestScriptForTcCmds(server, testCaseCode, scriptCode, txFunctionName, txParams)
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
                let testScript = tcsBugInjection.createTestScriptForTcCmds(server, testCaseCode, scriptCode, txFunctionName, txParams)
                framework.addTestScript(testScripts, testScript)
            }

            framework.testTestScripts(server, describeTitle + '_网络延时测试', testScripts)

            //endregion

            //region 断网测试

            testScripts = []

            testCaseCode = 'ERR_Inject_000010'
            scriptCode = defaultScriptCode + '_断开一个共识节点的网络'
            {
                let txParams = {}
                txParams.initNodeCount = 5
                txParams.execNodeCount = 1
                let testScript = tcsBugInjection.createTestScriptForCloseP2P(server, testCaseCode, scriptCode, txFunctionName, txParams)
                framework.addTestScript(testScripts, testScript)
                framework.testTestScripts(server, describeTitle + '_单次断网测试', testScripts)
            }

            testCaseCode = 'ERR_Inject_000010'
            {
                for(let i = 1; i <= 5; i++){
                    testScripts = []
                    scriptCode = '000200' + '_多次断开一个共识节点的网络，第' + i + '次'
                    let txParams = {}
                    txParams.initNodeCount = 5
                    txParams.execNodeCount = 1
                    let testScript = tcsBugInjection.createTestScriptForCloseP2P(server, testCaseCode, scriptCode, txFunctionName, txParams)
                    framework.addTestScript(testScripts, testScript)
                    framework.testTestScripts(server, describeTitle + '_多次网络断网测试，第' + i + '次', testScripts)
                }
            }

            //endregion

        })
    },

    testForRAS: function(server, describeTitle){

        let testScripts = []
        let testCaseCode
        let defaultScriptCode = '000100'
        let scriptCode
        let txFunctionName = 'RAS'

        describe(describeTitle, async function () {

            testCaseCode = 'ERR_RAS_000030'
            scriptCode = defaultScriptCode + '_减少共识节点，5个节点减少1个'
            {
                let txParams = {}
                txParams.initNodeCount = 5
                txParams.execNodeCount = 1
                let testScript = tcsBugInjection.createTestScriptForRestartNodes(server, testCaseCode, scriptCode, txFunctionName, txParams)
                framework.addTestScript(testScripts, testScript)
            }

            scriptCode = '000200' + '_减少共识节点，5个节点减少2个'
            {
                let txParams = {}
                txParams.initNodeCount = 5
                txParams.execNodeCount = 2
                let testScript = tcsBugInjection.createTestScriptForRestartNodes(server, testCaseCode, scriptCode, txFunctionName, txParams)
                framework.addTestScript(testScripts, testScript)
            }

            framework.testTestScripts(server, describeTitle, testScripts)

        })

    },

    //region exec/check

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
        action.txParams.allNodes = jtNodes
        action.txParams.timeAfterExecCmds = 60000
        action.txParams.timeAfterResetCmds = 60000
        testScript.actions.push(action)

        return testScript
    },

    createTestScriptForRestartNodes: function(server, testCaseCode, scriptCode, txFunctionName, txParams){

        let testScript = tcsBugInjection.createTestScript(server, testCaseCode, scriptCode, txFunctionName, txParams)
        let action = testScript.actions[0]
        action.txParams.timeAfterExecCmds = 10000
        action.txParams.execCmdsFunc = tcsBugInjection.stopJt
        action.txParams.resetCmdsFunc = tcsBugInjection.startJt
        action.txParams.needCheck2ndNetSync = true

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

    //region jt node

    startJt: function(service){
        sshCmd.execSshCmd(service, service.cmds.start)
    },

    stopJt: function(service){
        sshCmd.execSshCmd(service, service.cmds.stop)
    },

    //endregion

    execByNodes: function(services, execFunc){
        services.forEach(service =>{
            execFunc(service)
        })
    },

    //endregion

}
