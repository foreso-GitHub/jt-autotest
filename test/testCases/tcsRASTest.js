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
//endregion

module.exports = tcsRASTest = {

    //region tx receipt check

    testChangeNodeCount: function(server, describeTitle){

        let testScripts = []
        let testCaseCode
        let defaultScriptCode = '000100'
        let scriptCode

        describe(describeTitle, async function () {

            testCaseCode = 'ERR_RAS_000030'
            scriptCode = defaultScriptCode + '_减少共识节点，5个节点减少1个'
            {
                let txParams = {}
                txParams.initNodeCount = 5
                txParams.reduceCount = 1
                let testScript = tcsRASTest.createTestScript(server, testCaseCode, scriptCode, txParams)
                framework.addTestScript(testScripts, testScript)
            }

            scriptCode = '000200' + '_减少共识节点，5个节点减少2个'
            {
                let txParams = {}
                txParams.initNodeCount = 5
                txParams.reduceCount = 2
                let testScript = tcsRASTest.createTestScript(server, testCaseCode, scriptCode, txParams)
                framework.addTestScript(testScripts, testScript)
            }

            framework.testTestScripts(server, describeTitle, testScripts)  //node operation will conflict.  so one case, one test.

        })

    },

    createTestScript: function(server, testCaseCode, scriptCode, txParams){

        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L3,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        let action = framework.createTestAction(testScript, 'RAS', txParams,
            tcsRASTest.execReduceNode,
            tcsRASTest.checkChangeNodeCount,
            [{needPass: true}])
        action.actualResult = []
        testScript.actions.push(action)

        return testScript
    },

    execReduceNode: function(action){
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
                let reduceCount = action.txParams.reduceCount
                let nodes = []
                let rands = testUtility.getRandList(0, initNodeCount - 1, reduceCount, false)

                for (let i = 0; i < reduceCount; i++){
                    nodes.push(jtNodes[rands[i]])
                }

                tcsRASTest.stopJtByNodes(nodes)
                await utility.timeout(10000)
                netSync = await monitor.checkSync(jtNodes)
                monitor.printNetSync(netSync)
                action.actualResult.push(netSync)

                tcsRASTest.startJtByNodes(nodes)
                await utility.timeout(60000)
                netSync = await monitor.checkSync(jtNodes)
                monitor.printNetSync(netSync)
                action.actualResult.push(netSync)

                resolve(action)
            }
        })
    },

    checkChangeNodeCount: function(action){
        let initNodeCount = action.txParams.initNodeCount
        let netSyncList = action.actualResult
        let reduceCount = action.txParams.reduceCount
        expect(netSyncList[0].syncCount).to.be.equals(initNodeCount)
        expect(netSyncList[1].syncCount).to.be.equals(initNodeCount - reduceCount)
        expect(netSyncList[1].blockNumber > netSyncList[0].blockNumber).to.be.ok
        expect(netSyncList[2].syncCount).to.be.equals(initNodeCount)
        expect(netSyncList[2].blockNumber > netSyncList[1].blockNumber).to.be.ok
    },

    //region ssh cmd
    startJt: function(service){
        sshCmd.execSshCmd(service, service.cmds.start)
    },

    stopJt: function(service){
        sshCmd.execSshCmd(service, service.cmds.stop)
    },

    startJtByNodes: function(services){
        services.forEach(service =>{
            tcsRASTest.startJt(service)
        })
    },

    stopJtByNodes: function(services){
        services.forEach(service =>{
            tcsRASTest.stopJt(service)
        })
    },
    //endregion

//endregion

}
