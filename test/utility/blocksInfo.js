//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
// let utility = require("../framework/testUtility")
const { modes, } = require("../config/config")
const framekwork = require('../framework/framework')
//endregion

getAllTxBlock()

async function getAllTxBlock(){
    let server = framework.activeServer(modes[0])
    let startBlock = 27000
    // let endBlock = 100
    let endBlock = 27800
    let blocksInfo = await framework.getBlocksInfo(server, startBlock, endBlock)
}
