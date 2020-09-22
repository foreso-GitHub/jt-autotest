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
const consts = require('../framework/lib/base/consts')
let utility = require('../framework/testUtility')
//endregion
const nodeMonitor = require('../utility/monitor/monitor')
let monitor = new nodeMonitor()
let sshCmd = require('../framework/sshCmd')
const { jtNodes, } = require("../config/config")
//endregion

module.exports = tcsBugInjection = {

    //region tx receipt check

    test: function(server, describeTitle){
        let testCases = []
        let title
        let otherParams
        let testCase
        let titleIndex = 1

        describe(describeTitle, async function () {

            title = '0010\t共识节点故障测试_01：至少5个共识节点，断开一个共识节点的网络'
            otherParams = {}
            otherParams.initNodeCount = 5
            otherParams.execNodeCount = 1
            testCase = tcsBugInjection.createTestCase(server, title, otherParams)
            framework.addTestCase(testCases, testCase)
            framework.testTestCases(server, describeTitle + '_' + titleIndex++, testCases)  //node operation will conflict.  so one case, one test.

            for(let i = 1; i <= 5; i++){
                testCases = []
                title = i + '. ' + '0011\t共识节点故障测试_01：多次断开一个共识节点的网络，第' + i + '次'
                otherParams = {}
                otherParams.initNodeCount = 5
                otherParams.execNodeCount = 1
                testCase = tcsBugInjection.createTestCase(server, title, otherParams)
                framework.addTestCase(testCases, testCase)
                framework.testTestCases(server, describeTitle + '_' + title, testCases)  //node operation will conflict.  so one case, one test.
            }

            testCases = []
            title = '0130\t网络包重复测试_01:每个节点Duplicate30%'
            otherParams = {}
            otherParams.initNodeCount = 5
            otherParams.execNodeCount = 5
            testCase = tcsBugInjection.createTestCase(server, title, otherParams)
            testCase.executeFunction = tcsBugInjection.exec
            testCase.checkFunction = tcsBugInjection.checkTcCmds
            testCase.execCmdsFunc = tcsBugInjection.duplicate30
            testCase.timeAfterExecCmds = 60000
            testCase.resetCmdsFunc = tcsBugInjection.resetTc
            testCase.timeAfterResetCmds = 20000
            framework.addTestCase(testCases, testCase)

            title = '0140\t网络包重复测试_02:单个节点Duplicate30%'
            otherParams = {}
            otherParams.initNodeCount = 5
            otherParams.execNodeCount = 1
            testCase = tcsBugInjection.createTestCase(server, title, otherParams)
            testCase.executeFunction = tcsBugInjection.exec
            testCase.checkFunction = tcsBugInjection.checkTcCmds
            testCase.execCmdsFunc = tcsBugInjection.duplicate30
            testCase.timeAfterExecCmds = 60000
            testCase.resetCmdsFunc = tcsBugInjection.resetTc
            testCase.timeAfterResetCmds = 20000
            framework.addTestCase(testCases, testCase)
            framework.testTestCases(server, describeTitle + '_' + titleIndex++, testCases)  //node operation will conflict.  so one case, one test.

        })

    },

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
        return testCase
    },

    //region exec/check p2p
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
                await utility.timeout(60000)
                netSync = await monitor.checkSync(jtNodes)
                monitor.printNetSync(netSync)
                testCase.actualResult.push(netSync)

                tcsBugInjection.execByNodes(nodes, tcsBugInjection.resetNet)
                await utility.timeout(60000)
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

    exec: function(testCase){
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

                tcsBugInjection.execByNodes(nodes, testCase.execCmdsFunc)
                await utility.timeout(testCase.timeAfterExecCmds)
                // netSync = await monitor.checkSync(jtNodes)
                // monitor.printNetSync(netSync)
                // testCase.actualResult.push(netSync)

                tcsBugInjection.execByNodes(nodes, testCase.resetCmdsFunc)
                await utility.timeout(testCase.timeAfterResetCmds)
                netSync = await monitor.checkSync(jtNodes)
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
    duplicate30: function(service){
        sshCmd.execSshCmd(service, service.cmds.duplicate30)
    },

    resetTc: function(service){
        sshCmd.execSshCmd(service, service.cmds.resetTc)
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