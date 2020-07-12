//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const nodeMonitor = require('./monitor')
let monitor = new nodeMonitor()
const { sshCmd, createNode, createServer} = require('./sshCmd')
let utility = require("../framework/testUtility.js")
//endregion

//region set nodes
let jt_node_al = createNode('al', '121.89.209.19', '22', '9545','root', 'Lianjing@123456')
let jt_node_bd = createNode('bd', '180.76.125.22', '22', '9545','root', 'Lianjing@123456')
let jt_node_tx = createNode('tx', '45.40.240.50', '22', '9545','ubuntu', 'Lianjing@123456')
let jt_node_hw = createNode('hw', '121.37.216.100', '22', '9545','root', 'Lianjing@123456')
let jt_node_ty = createNode('ty', '61.171.12.71', '22', '9545','root', 'Lianjing@13579')
let nodes = []
nodes.push(jt_node_al)
nodes.push(jt_node_bd)
nodes.push(jt_node_tx)
nodes.push(jt_node_hw)
nodes.push(jt_node_ty)
//endregion

//region set cmd
const cmd_start_jt = 'sudo /root/start.sh'
const cmd_stop_jt = 'sudo /root/stop.sh'
//endregion

// startJt(jt_node_al)
// stopJt(jt_node_al)
// test()
testMonitor()
// testSshCmd()

//region functions
async function test(){
    let netSync = await monitor.checkSync(nodes)
    monitor.printNetSync(netSync)

    stopJt(jt_node_bd)
    await utility.timeout(10000)
    netSync = await monitor.checkSync(nodes)
    monitor.printNetSync(netSync)

    startJt(jt_node_bd)
    await utility.timeout(60000)
    netSync = await monitor.checkSync(nodes)
    monitor.printNetSync(netSync)
}

async function testMonitor(){
    let netSync = await monitor.checkSync(nodes)
    monitor.printNetSync(netSync)
}

function testSshCmd(){
    let servers = []
    servers.push(createServer(jt_node_al, 'echo hello ali'))
    servers.push(createServer(jt_node_bd, cmd_stop_jt))

    sshCmd(servers, function(error, results){
        results.forEach(result=>{
            logger.debug('node name:' + result.node.name)
            logger.debug('cmd result:' + result.cmdResult)
        })
    })
}

function startJt(node){
    let servers = []
    servers.push(createServer(node, cmd_start_jt))
    sshCmd(servers, function(error, results){
        results.forEach(result=>{
            logger.debug('node name:' + result.node.name)
            logger.debug('cmd result:' + result.cmdResult)
        })
    })
}

function stopJt(node){
    let servers = []
    servers.push(createServer(node, cmd_stop_jt))
    sshCmd(servers, function(error, results){
        results.forEach(result=>{
            logger.debug('node name:' + result.node.name)
            logger.debug('cmd result:' + result.cmdResult)
        })
    })
}

//endregion

