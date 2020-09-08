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
            otherParams.reduceCount = 1
            testCase = tcsBugInjection.createTestCase(server, title, otherParams)
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
                let reduceCount = testCase.otherParams.reduceCount
                let nodes = []
                let rands = testUtility.getRandList(0, initNodeCount - 1, reduceCount, false)

                for (let i = 0; i < reduceCount; i++){
                    // nodes.push(jtNodes[rands[i]])
                    nodes.push(jtNodes[0])  //todo use fixed node (bd node) for now. need change to rand node later.
                }

                tcsBugInjection.closeP2PByNodes(nodes)
                await utility.timeout(60000)
                netSync = await monitor.checkSync(jtNodes)
                monitor.printNetSync(netSync)
                testCase.actualResult.push(netSync)

                tcsBugInjection.openP2PByNodes(nodes)
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
        let reduceCount = testCase.otherParams.reduceCount
        expect(netSyncList[0].syncCount).to.be.equals(initNodeCount)
        expect(netSyncList[1].syncCount).to.be.equals(initNodeCount - reduceCount)
        expect(netSyncList[1].blockNumber > netSyncList[0].blockNumber).to.be.ok
        expect(netSyncList[2].syncCount).to.be.equals(initNodeCount)
        expect(netSyncList[2].blockNumber > netSyncList[1].blockNumber).to.be.ok
    },

    //region ssh cmd
    closeP2P: function(service){
        sshCmd.execSshCmd(service, service.cmds.closeP2P)
    },

    openP2P: function(service){
        sshCmd.execSshCmd(service, service.cmds.openP2P)
    },

    closeP2PByNodes: function(services){
        services.forEach(service =>{
            tcsBugInjection.closeP2P(service)
        })
    },

    openP2PByNodes: function(services){
        services.forEach(service =>{
            tcsBugInjection.openP2P(service)
        })
    },
    //endregion

//endregion

}