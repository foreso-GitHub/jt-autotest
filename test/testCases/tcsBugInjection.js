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
        let testCases = []
        let title
        let otherParams
        let testCase

        describe(describeTitle, async function () {

            afterEach(async function() {
                netStatusTool.resetNetAll()
                netStatusTool.resetTcAll()
                logger.debug('Reset network!')
            })

            //region 网络丢包测试

            testCases = []

            title = '0110\t网络丢包测试_01:每个节点Loss30%，然后恢复'
            otherParams = {}
            otherParams.initNodeCount = 5
            otherParams.execNodeCount = 5
            otherParams.execCmdsFunc = tcsBugInjection.loss30
            testCase = tcsBugInjection.createTestCaseForTcCmds(server, title, otherParams)
            framework.addTestCase(testCases, testCase)

            title = '0120\t网络丢包测试_02:单个节点Loss30%，然后恢复'
            otherParams = {}
            otherParams.initNodeCount = 5
            otherParams.execNodeCount = 1
            otherParams.execCmdsFunc = tcsBugInjection.loss30
            testCase = tcsBugInjection.createTestCaseForTcCmds(server, title, otherParams)
            framework.addTestCase(testCases, testCase)

            framework.testTestCases(server, describeTitle + '_网络丢包测试', testCases)  //node operation will conflict.  so one case, one test.

            //endregion

            //region 网络包重复测试

            testCases = []

            title = '0130\t网络包重复测试_01:每个节点Duplicate30%，然后恢复'
            otherParams = {}
            otherParams.initNodeCount = 5
            otherParams.execNodeCount = 5
            otherParams.execCmdsFunc = tcsBugInjection.duplicate30
            testCase = tcsBugInjection.createTestCaseForTcCmds(server, title, otherParams)
            framework.addTestCase(testCases, testCase)

            title = '0140\t网络包重复测试_02:单个节点Duplicate30%，然后恢复'
            otherParams = {}
            otherParams.initNodeCount = 5
            otherParams.execNodeCount = 1
            otherParams.execCmdsFunc = tcsBugInjection.duplicate30
            testCase = tcsBugInjection.createTestCaseForTcCmds(server, title, otherParams)
            framework.addTestCase(testCases, testCase)

            framework.testTestCases(server, describeTitle + '_网络包重复测试', testCases)  //node operation will conflict.  so one case, one test.

            //endregion

            //region 网络包损坏测试

            testCases = []

            title = '0150\t网络包损坏测试_01:每个节点Corrupt30%，然后恢复'
            otherParams = {}
            otherParams.initNodeCount = 5
            otherParams.execNodeCount = 5
            otherParams.execCmdsFunc = tcsBugInjection.corrupt30
            testCase = tcsBugInjection.createTestCaseForTcCmds(server, title, otherParams)
            framework.addTestCase(testCases, testCase)

            title = '0160\t网络包损坏测试_02:单个节点Corrupt30%，然后恢复'
            otherParams = {}
            otherParams.initNodeCount = 5
            otherParams.execNodeCount = 1
            otherParams.execCmdsFunc = tcsBugInjection.corrupt30
            testCase = tcsBugInjection.createTestCaseForTcCmds(server, title, otherParams)
            framework.addTestCase(testCases, testCase)

            framework.testTestCases(server, describeTitle + '_网络包损坏测试', testCases)  //node operation will conflict.  so one case, one test.

            //endregion

            //region 网络包乱序测试

            testCases = []

            title = '0170\t网络包乱序测试_01:每个节点Reorder30%，然后恢复'
            otherParams = {}
            otherParams.initNodeCount = 5
            otherParams.execNodeCount = 5
            otherParams.execCmdsFunc = tcsBugInjection.reorder30
            testCase = tcsBugInjection.createTestCaseForTcCmds(server, title, otherParams)
            framework.addTestCase(testCases, testCase)

            title = '0180\t网络包乱序测试_02:单个节点Reorder30%，然后恢复'
            otherParams = {}
            otherParams.initNodeCount = 5
            otherParams.execNodeCount = 1
            otherParams.execCmdsFunc = tcsBugInjection.reorder30
            // otherParams.execNode = jtNodes[3]  //指定执行的node，不然会随机选择
            testCase = tcsBugInjection.createTestCaseForTcCmds(server, title, otherParams)
            framework.addTestCase(testCases, testCase)

            framework.testTestCases(server, describeTitle + '_网络包乱序测试', testCases)  //node operation will conflict.  so one case, one test.

            //endregion

            //region 网络延时测试

            testCases = []

            title = '0090\t网络延时测试_01:每个节点5%概率延迟1s，然后恢复'
            otherParams = {}
            otherParams.initNodeCount = 5
            otherParams.execNodeCount = 5
            otherParams.execCmdsFunc = tcsBugInjection.delay0_1_5
            otherParams.timeAfterResetCmds = 60000  //確保网络延时测试需要60s來恢復
            testCase = tcsBugInjection.createTestCaseForTcCmds(server, title, otherParams)
            framework.addTestCase(testCases, testCase)

            title = '0100\t网络延时测试_02:单个节点5%概率延迟1s，然后恢复'
            otherParams = {}
            otherParams.initNodeCount = 5
            otherParams.execNodeCount = 1
            otherParams.execCmdsFunc = tcsBugInjection.delay0_1_5
            otherParams.timeAfterResetCmds = 60000  //確保网络延时测试需要60s來恢復
            // otherParams.execNode = jtNodes[0]  //指定执行的node为bd，不然会随机选择
            testCase = tcsBugInjection.createTestCaseForTcCmds(server, title, otherParams)
            framework.addTestCase(testCases, testCase)

            framework.testTestCases(server, describeTitle + '_网络延时测试', testCases)  //node operation will conflict.  so one case, one test.

            //endregion

            //region 断网测试

            testCases = []

            title = '0010\t共识节点故障测试_01：至少5个共识节点，断开一个共识节点的网络'
            otherParams = {}
            otherParams.initNodeCount = 5
            otherParams.execNodeCount = 1
            testCase = tcsBugInjection.createTestCase(server, title, otherParams)
            framework.addTestCase(testCases, testCase)
            framework.testTestCases(server, describeTitle + '_断网测试', testCases)  //node operation will conflict.  so one case, one test.

            for(let i = 1; i <= 5; i++){
                testCases = []
                title = i + '. ' + '0011\t共识节点故障测试_01：多次断开一个共识节点的网络，第' + i + '次'
                otherParams = {}
                otherParams.initNodeCount = 5
                otherParams.execNodeCount = 1
                testCase = tcsBugInjection.createTestCase(server, title, otherParams)
                testCase.restrictedLevel = restrictedLevel.L3
                framework.addTestCase(testCases, testCase)
                framework.testTestCases(server, describeTitle + '_断网测试_' + title, testCases)  //node operation will conflict.  so one case, one test.
            }

            //endregion

        })
    },

    //region exec/check p2p
    createTestCase: function(server, title, otherParams){
        let testCase = framework.createTestCase(
            title,
            server,
            null,
            null,
            otherParams,
            tcsBugInjection.execCloseP2P,
            tcsBugInjection.checkCloseP2P,
            null,
            restrictedLevel.L3,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )
        testCase.otherParams.timeAfterExecCmds = 60000
        testCase.otherParams.timeAfterResetCmds = 90000
        return testCase
    },

    execCloseP2P: function(testCase){
        testCase.hasExecuted = true
        return new Promise(async (resolve, reject) => {
            let netSync = await monitor.checkSync(jtNodes)
            monitor.printNetSync(netSync)
            testCase.actualResult.push(netSync)

            let initNodeCount = testCase.otherParams.initNodeCount
            if(netSync.syncCount != initNodeCount){
                reject("init node count is not " + initNodeCount)
            }
            else{
                let execNodeCount = testCase.otherParams.execNodeCount
                let nodes = []
                let rands = testUtility.getRandList(0, initNodeCount - 1, execNodeCount, false)

                for (let i = 0; i < execNodeCount; i++){
                    nodes.push(jtNodes[rands[i]])
                    logger.debug('===selected service: ' + jtNodes[rands[i]].name)
                }

                tcsBugInjection.execByNodes(nodes, tcsBugInjection.closeP2P)
                await utility.timeout(testCase.otherParams.timeAfterExecCmds)
                netSync = await monitor.checkSync(jtNodes)
                monitor.printNetSync(netSync)
                testCase.actualResult.push(netSync)

                tcsBugInjection.execByNodes(nodes, tcsBugInjection.resetNet)
                await utility.timeout(testCase.otherParams.timeAfterResetCmds)
                netSync = await monitor.checkSync(jtNodes)
                monitor.printNetSync(netSync)
                testCase.actualResult.push(netSync)

                resolve(testCase)
            }
        })
    },

    checkCloseP2P: function(testCase){
        let initNodeCount = testCase.otherParams.initNodeCount
        let netSyncList = testCase.actualResult
        let execNodeCount = testCase.otherParams.execNodeCount
        expect(netSyncList[0].syncCount).to.be.equals(initNodeCount)
        expect(netSyncList[1].syncCount).to.be.equals(initNodeCount - execNodeCount)
        expect(netSyncList[1].blockNumber > netSyncList[0].blockNumber).to.be.ok
        expect(netSyncList[2].syncCount).to.be.equals(initNodeCount)
        expect(netSyncList[2].blockNumber > netSyncList[1].blockNumber).to.be.ok
    },
    //endregion

    //region exec/check tc
    createTestCaseForTcCmds: function(server, title, otherParams){
        let testCase = framework.createTestCase(
            title,
            server,
            null,
            null,
            otherParams,
            tcsBugInjection.execTcCmds,
            tcsBugInjection.checkTcCmds,
            null,
            restrictedLevel.L3,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )
        testCase.otherParams.timeAfterExecCmds = 60000
        testCase.otherParams.resetCmdsFunc = tcsBugInjection.resetTc
        testCase.otherParams.timeAfterResetCmds = 60000
        testCase.otherParams.allNodes = jtNodes
        return testCase
    },

    execTcCmds: function(testCase){
        testCase.hasExecuted = true
        return new Promise(async (resolve, reject) => {
            let allNodes = testCase.otherParams.allNodes
            let netSync = await monitor.checkSync(allNodes)
            monitor.printNetSync(netSync)
            testCase.actualResult.push(netSync)

            let initNodeCount = testCase.otherParams.initNodeCount
            if(netSync.syncCount != initNodeCount){
                reject("init node count is not " + initNodeCount)
            }
            else{
                let execNodeCount = testCase.otherParams.execNodeCount
                let nodes = []
                if(testCase.otherParams.execNode){
                    nodes.push(testCase.otherParams.execNode)
                    logger.debug('===selected service: ' + testCase.otherParams.execNode.name)
                }else{
                    let rands = testUtility.getRandList(0, initNodeCount - 1, execNodeCount, false)
                    for (let i = 0; i < execNodeCount; i++){
                        nodes.push(allNodes[rands[i]])
                        logger.debug('===selected service: ' + allNodes[rands[i]].name)
                    }
                }

                tcsBugInjection.execByNodes(nodes, testCase.otherParams.execCmdsFunc)
                await utility.timeout(testCase.otherParams.timeAfterExecCmds)
                // netSync = await monitor.checkSync(allNodes)
                // monitor.printNetSync(netSync)
                // testCase.actualResult.push(netSync)

                tcsBugInjection.execByNodes(nodes, testCase.otherParams.resetCmdsFunc)
                await utility.timeout(testCase.otherParams.timeAfterResetCmds)
                netSync = await monitor.checkSync(allNodes)
                monitor.printNetSync(netSync)
                testCase.actualResult.push(netSync)

                resolve(testCase)
            }
        })
    },

    checkTcCmds: function(testCase){
        let initNodeCount = testCase.otherParams.initNodeCount
        let netSyncList = testCase.actualResult
        // let execNodeCount = testCase.otherParams.execNodeCount
        expect(netSyncList[0].syncCount).to.be.equals(initNodeCount)
        expect(netSyncList[1].syncCount).to.be.equals(initNodeCount)
        expect(netSyncList[1].blockNumber > netSyncList[0].blockNumber).to.be.ok
        // expect(netSyncList[2].syncCount).to.be.equals(initNodeCount)
        // expect(netSyncList[2].blockNumber > netSyncList[1].blockNumber).to.be.ok
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

    execByNodes: function(services, execFunc){
        services.forEach(service =>{
            execFunc(service)
        })
    },

    //endregion

//endregion

}