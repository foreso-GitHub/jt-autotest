//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let rpc = require('../framework/lib/rpc/rpcInterface.js')
const { modes, allModes, configCommons } = require("../config")
const consts = require("../framework/lib/base/consts.js")
let { modeAccounts } = require("../testData/accounts")
const utility = require("../framework/testUtility.js")
//endregion

function nodeMonitor(){

    nodeMonitor.prototype.checkSync = function(nodes){
        let netSync = {}
        let doneNodes = []
        nodes.forEach(async (node) => {
            let server = new rpc()
            server.url = node.url
            node.server = server
            node.blockNumber = await server.getBlockNumber(server)
            doneNodes.push(node)

            if(doneNodes.length == nodes.length){
                netSync = getNetSyncStatus(nodes)
                logger.debug(JSON.stringify(netSync))
            }
        })
    }

    function getNetSyncStatus(nodes){
        let netSync = {}
        netSync.status = 'unknown'  //unknown, fullSync, safeSync (> 2/3), notSync, zeroSync
        netSync.blockNumber = -1
        netSync.blockStatusList = []
        // netSync.syncNodes = []
        // netSync.asyncNodes = []
        netSync.syncCount = 0

        let count = nodes.length
        let blockStatusList = []

        for(let i = 0; i < count; i++){
            addBlockStatus(blockStatusList, nodes[i])
        }

        let mainBlockStatus = findMainBlock(blockStatusList)
        netSync.blockNumber = mainBlockStatus.blockNumber
        // netSync.syncNodes = mainBlockStatus.nodes
        netSync.syncCount = mainBlockStatus.nodes.length
        // netSync.blockStatusList = blockStatusList

        if(netSync.syncCount == count){
            netSync.status = 'fullSync'
        }
        else if(netSync.syncCount >= count * 2 / 3){
            netSync.status = 'safeSync'
        }
        else{
            netSync.status = 'notSync'
        }

        return netSync
    }

    function addBlockStatus(blockStatusList, node){
        let blockStatus = findBlockStatus(blockStatusList, node)
        if(blockStatus){
            blockStatus.nodes.push(node)
        }
        else{
            blockStatus = {}
            blockStatus.nodes = []
            blockStatus.blockNumber = node.blockNumber
            blockStatus.nodes.push(node)
            blockStatusList.push(blockStatus)
        }
    }

    function findBlockStatus(blockStatusList, node){
        let blockStatus;
        for(let i = 0; i < blockStatusList.length; i++){
            if(node.blockNumber == blockStatusList[i].blockNumber){
                blockStatus = blockStatusList[i];
                break;
            }
        }
        return blockStatus;
    }

    function findMainBlock(blockStatusList){
        let index = -1;
        let maxCount = -1;
        for(let i = 0; i < blockStatusList.length; i++){
            let blockStatus = blockStatusList[i]
            if(blockStatus.nodes.length > maxCount){
                index = i;
                maxCount = blockStatus.nodes.length
            }
        }
        return blockStatusList[index]
    }

}

module.exports = nodeMonitor