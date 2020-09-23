//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let sshCmd = require('../../framework/sshCmd')
let utility = require("../../framework/testUtility.js")
const { jtNodes, } = require("../../config/config")
//endregion

let services = jtNodes

module.exports = netStatusTool = {
    //region traffic control
    showTcAll: function(){
        netStatusTool.execByNodes(services, netStatusTool.showTc)
    },

    resetTcAll: function(){
        netStatusTool.execByNodes(services, netStatusTool.resetTc)
    },

    showTc: function(service){
        sshCmd.execSshCmd(service, service.cmds.showTc)
    },

    resetTc: function(service){
        sshCmd.execSshCmd(service, service.cmds.resetTc)
    },
    //endregion

    //region iptables
    showNetAll: function(){
        netStatusTool.execByNodes(services, netStatusTool.showNet)
    },

    resetNetAll: function(){
        netStatusTool.execByNodes(services, netStatusTool.resetNet)
    },

    showNet: function(service){
        sshCmd.execSshCmd(service, service.cmds.showNet)
    },

    resetNet: function(service){
        sshCmd.execSshCmd(service, service.cmds.resetNet)
    },
    //endregion

    //region common
    execByNodes: function(services, execFunc){
        services.forEach(service =>{
            execFunc(service)
        })
    },
    //endregion
}



