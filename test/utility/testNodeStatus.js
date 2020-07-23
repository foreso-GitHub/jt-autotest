//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const nodeMonitor = require('./monitor')
let monitor = new nodeMonitor()
const { sshCmd, createNode, createServer} = require('./sshCmd')
let utility = require("../framework/testUtility.js")
const { jtNodes, } = require("../config/config")
//endregion

//region set nodes
let nodes = jtNodes

// let jt_node_bd = jtNodes[0]
// let jt_node_tx = jtNodes[1]
// let jt_node_hw = jtNodes[2]
// let jt_node_ty = jtNodes[3]
// let jt_node_al = jtNodes[4]
//endregion

//region set cmd
const cmd_start_jt = 'sudo /root/start.sh'
const cmd_stop_jt = 'sudo /root/stop.sh'
//endregion

// resetNode('bd')
// stopJt(getNode('bd', jtNodes)))
// startJt(getNode('ty', jtNodes))
// startJt(jt_node_al)
// stopJt(jt_node_al)

// resetNodes()
testMonitor()


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

async function resetNodes(){
    for(let i = 0; i < jtNodes.length; i++){
        stopJt(jtNodes[i])
    }

    await utility.timeout(5000)

    for(let i = 0; i < jtNodes.length; i++){
        startJt(jtNodes[i])
    }
}

function resetNode(name){
    let node = getNode(name, jtNodes)
    stopJt(node)
    startJt(node)
}

function startJt(node){
    let servers = []
    servers.push(createServer(node, node.cmds.start))
    sshCmd(servers, function(error, results){
        results.forEach(result=>{
            logger.debug('node name:' + result.node.name)
            logger.debug('cmd result:' + result.cmdResult)
        })
    })
}

function stopJt(node){
    let servers = []
    servers.push(createServer(node, node.cmds.stop))
    sshCmd(servers, function(error, results){
        results.forEach(result=>{
            logger.debug('node name:' + result.node.name)
            logger.debug('cmd result:' + result.cmdResult)
        })
    })
}

function getNode(name, nodes){
    let node = null
    for(let i = 0; i < nodes.length; i++){
        if(nodes[i].name == name){
            node = nodes[i]
            break;
        }
    }
    return node
}

//endregion

