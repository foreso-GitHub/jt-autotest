//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let rpc = require('../../framework/lib/rpc/rpcInterface.js')
//endregion

function nodeMonitor(){

    nodeMonitor.prototype.checkSync = function(nodes){
        return new Promise(async (resolve, reject) => {
            let netSync = {}
            let doneNodes = []
            nodes.forEach(async (node) => {
                let server = new rpc()
                server.url = node.url
                node.server = server
                node.blockNumber = await server.getBlockNumber(server)
                doneNodes.push(node)
                logger.debug(server.getName())

                if(doneNodes.length == nodes.length){
                    netSync = getNetSyncStatus(nodes)
                    // logger.debug(JSON.stringify(netSync))
                    resolve(netSync)
                }
            })
        })

    }

    nodeMonitor.prototype.printNetSync = function(netSync){
        logger.debug('=== jt net sync status ===')
        logger.debug('status: ' + netSync.status)
        logger.debug('syncCount: ' + netSync.syncCount)
        logger.debug('blockNumber: ' + netSync.blockNumber)
        let index = 1;
        netSync.syncNodes.forEach(node=>{
            logger.debug('node_' + index++ + ': ' + node.name)
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
        netSync.syncNodes = mainBlockStatus.nodes
        netSync.syncCount = mainBlockStatus.nodes.length
        netSync.blockStatusList = blockStatusList

        //井通网络一般由3f+1个节点组成。这时，最小节点数为2f+1。低于2f+1，无法共识，无法出块。
        let f = Math.floor(count / 3)
        let backup = count - f * 3

        if(netSync.syncCount == count){
            netSync.status = 'fullSync'
        }
        else if(netSync.syncCount >= 3 * f + 1){
            netSync.status = 'safeSync'
        }
        else if(netSync.syncCount >= 2 * f + 1){
            netSync.status = 'justSync'
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