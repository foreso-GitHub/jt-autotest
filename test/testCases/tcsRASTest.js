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
const nodeMonitor = require('../utility/monitor')
let monitor = new nodeMonitor()
const { sshCmd, createNode, createServer} = require('../utility/sshCmd')
const { jtNodes, sshCommands } = require("../config")
//endregion

module.exports = tcsRASTest = {

    //region tx receipt check

    testChangeNodeCount: function(server, describeTitle){
        let testCases = []
        let title
        let otherParams
        let testCase
        let titleIndex = 1

        describe(describeTitle, async function () {
            title = '0030\t减少共识节点 - 5个节点减少1个'
            otherParams = {}
            otherParams.initNodeCount = 5
            otherParams.reduceCount = 1
            testCase = tcsRASTest.createTestCase(server, title, otherParams)
            framework.addTestCase(testCases, testCase)
            framework.testTestCases(server, describeTitle + '_' + titleIndex++, testCases)  //node operation will conflict.  so one case, one test.

            title = '0030\t减少共识节点 - 5个节点减少2个'
            otherParams = {}
            otherParams.initNodeCount = 5
            otherParams.reduceCount = 2
            testCase = tcsRASTest.createTestCase(server, title, otherParams)
            testCases = []
            framework.addTestCase(testCases, testCase)
            framework.testTestCases(server, describeTitle + '_' + titleIndex++, testCases)
        })


    },

    createTestCase: function(server, title, otherParams){
        let testCase = framework.createTestCase(
            title,
            server,
            null,
            null,
            otherParams,
            tcsRASTest.execReduceNode,
            tcsRASTest.checkChangeNodeCount,
            null,
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )
        return testCase
    },

    execReduceNode: function(testCase){
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
                // let rands = testUtility.getRandList(0, initNodeCount - 1, reduceCount, false)

                for (let i = 0; i < reduceCount; i++){
                    nodes.push(jtNodes[i])
                }

                tcsRASTest.stopJtByNodes(nodes)
                await utility.timeout(10000)
                netSync = await monitor.checkSync(jtNodes)
                monitor.printNetSync(netSync)
                testCase.actualResult.push(netSync)

                tcsRASTest.startJtByNodes(nodes)
                await utility.timeout(60000)
                netSync = await monitor.checkSync(jtNodes)
                monitor.printNetSync(netSync)
                testCase.actualResult.push(netSync)

                resolve(testCase)
            }
        })
    },

    checkChangeNodeCount: function(testCase){
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
    execSshCmd: function(node, cmd){
        let servers = []
        servers.push(createServer(node, cmd))
        sshCmd(servers, function(error, results){
            results.forEach(result=>{
                logger.debug('node name:' + result.node.name)
                logger.debug('cmd result:' + result.cmdResult)
            })
        })
    },

    startJt: function(node){
        tcsRASTest.execSshCmd(node, sshCommands.get('start'))
    },

    stopJt: function(node){
        tcsRASTest.execSshCmd(node, sshCommands.get('stop'))
    },

    startJtByNodes: function(nodes){
        nodes.forEach(node =>{
            tcsRASTest.startJt(node)
        })
    },

    stopJtByNodes: function(nodes){
        nodes.forEach(node =>{
            tcsRASTest.stopJt(node)
        })
    },
    //endregion

//endregion

}