//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let sshCmd = require('../../framework/sshCmd')
let utility = require("../../framework/testUtility.js")
const { jtNodes, } = require("../../config/config")
//endregion

let services = jtNodes

showTcAll()
// resetTcAll()
// showNetAll()
// resetNetAll()

//region traffic control
function showTcAll(){
    execByNodes(services, showTc)
}

function resetTcAll(){
    execByNodes(services, resetTc)
}

function showTc(service){
    sshCmd.execSshCmd(service, service.cmds.showTc)
}

function resetTc(service){
    sshCmd.execSshCmd(service, service.cmds.resetTc)
}
//endregion

//region iptables
function showNetAll(){
    execByNodes(services, showNet)
}

function resetNetAll(){
    execByNodes(services, resetNet)
}

function showNet(service){
    sshCmd.execSshCmd(service, service.cmds.showNet)
}

function resetNet(service){
    sshCmd.execSshCmd(service, service.cmds.resetNet)
}
//endregion

//region common
function execByNodes(services, execFunc){
    services.forEach(service =>{
        execFunc(service)
    })
}
//endregion