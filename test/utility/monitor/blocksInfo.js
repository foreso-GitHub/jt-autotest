//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let utility = require("../../framework/testUtility")
const { modes, } = require("../../config/config")
const framekwork = require('../../framework/framework')
//endregion

getAllTxBlock()

async function getAllTxBlock(){
    let server = framework.activeServer(modes[0])
    let startBlock = 89700
    let endBlock = 89710
    let blocksInfo = await framework.getBlocksInfo(server, startBlock, endBlock)
    printTps(blocksInfo)
}

function printTps(blocksInfo){
    let list = blocksInfo.blockTpsInfoList
    for (let i = 0; i < list.length; i++){
        let block = list[i]
        let bar = printBar(block.tps)
        logger.debug(block.blockNumber.toString() + '(' + utility.toDecimal2(block.tps) + '): ' + bar)
    }
}

function printBar(tps){
    let bar = ''
    for(let i = 0; i < tps; i++){
        bar += '[]'
    }
    return bar
}
