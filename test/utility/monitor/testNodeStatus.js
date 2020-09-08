//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const nodeMonitor = require('./monitor')
let monitor = new nodeMonitor()
let sshCmd = require('./sshCmd')
let utility = require("../../framework/testUtility.js")
const { jtNodes, } = require("../../config/config")
//endregion

//region set services
let services = jtNodes

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

resetNode('bd')
// stopJt(getNode('bd', jtNodes)))
// startJt(getNode('ty', jtNodes))
// startJt(jt_node_al)
// stopJt(jt_node_al)

// resetNodes()
// stopNodes()
// startNodes()
testMonitor()


//region functions
async function test(){
    let netSync = await monitor.checkSync(services)
    monitor.printNetSync(netSync)

    stopJt(jt_node_bd)
    await utility.timeout(10000)
    netSync = await monitor.checkSync(services)
    monitor.printNetSync(netSync)

    startJt(jt_node_bd)
    await utility.timeout(60000)
    netSync = await monitor.checkSync(services)
    monitor.printNetSync(netSync)
}

async function testMonitor(){
    let netSync = await monitor.checkSync(services)
    monitor.printNetSync(netSync)
}

function testSshCmd(){
    let services = []
    services.push(sshCmd.setCmd(jt_node_al, 'echo hello ali'))
    services.push(sshCmd.setCmd(jt_node_bd, cmd_stop_jt))

    sshCmd.execCmd(servers, function(error, results){
        results.forEach(result=>{
            logger.debug('service name:' + result.service.name)
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

function stopNodes(){
    for(let i = 0; i < jtNodes.length; i++){
        stopJt(jtNodes[i])
    }
}

function startNodes(){
    for(let i = 0; i < jtNodes.length; i++){
        startJt(jtNodes[i])
    }
}



async function resetNode(name){
    let service = getNode(name, jtNodes)
    stopJt(service)
    await utility.timeout(5000)
    startJt(service)
}

function startJt(service){
    let servers = []
    servers.push(sshCmd.setCmd(service, service.cmds.start))
    sshCmd.execCmd(servers, function(error, results){
        results.forEach(result=>{
            logger.debug('service name:' + result.service.name)
            logger.debug('cmd result:' + result.cmdResult)
        })
    })
}

function stopJt(service){
    let servers = []
    servers.push(sshCmd.setCmd(service, service.cmds.stop))
    sshCmd.execCmd(servers, function(error, results){
        results.forEach(result=>{
            logger.debug('service name:' + result.service.name)
            logger.debug('cmd result:' + result.cmdResult)
        })
    })
}

function getNode(name, services){
    let service = null
    for(let i = 0; i < services.length; i++){
        if(services[i].name == name){
            service = services[i]
            break;
        }
    }
    return service
}

//endregion

