//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let utility = require("../../framework/testUtility")
const { modes, } = require("../../config/config")
const framekwork = require('../../framework/framework')
//endregion

// checkInLedgerByBlocks(0, 1000)
// checkInLedgerByBlocks(1001, 10000)
checkInLedgerByBlocks(103001, 103599)

async function checkInLedgerByBlocks(startBlock, endBlock){
    let server = framework.activeServer(modes[0])
    let failTxs = await checkBlocks(server, startBlock, endBlock)
    logger.debug('Total fail txs count: ' + failTxs.length)
    for(let i = 0; i < failTxs.length; i++){
        logger.debug((i+1).toString() + '. ' + failTxs[i])
    }
}

async function checkBlocks(server, startBlock, endBlock){
    let failTxs = []
    for(let i = startBlock; i <= endBlock; i++){
        let subFailTxs = await checkBlock(server, i)
        failTxs = failTxs.concat(subFailTxs)
    }
    return failTxs
}

async function checkBlock(server, blockNumber){
    let block = await server.getBlockByNumber(server, blockNumber, false)
    if(block){
        let txs = block.transactions
        let failTxs = []
        txs.forEach(async hash => {
            let tx = await server.getTx(server, hash)
            let result = checkTx(blockNumber, tx)
            if(!result){
                failTxs.push(hash)
            }
        })
        logger.debug('Block ' + blockNumber + ' has checked!')
        if(failTxs.length > 0){
            logger.debug('Block ' + blockNumber + ' has ' + failTxs.length + ' failed tx!')
        }
        return failTxs
    }
}

function checkTx(blockNumber, tx){
    if(tx.inLedger != blockNumber || tx.inLedger != blockNumber){
        logger.debug('block: ' + blockNumber.toString() + ', tx: ' + tx.hash
            + ', inLedger: ' + tx.inLedger  + ', ledger_index: ' + tx.ledger_index)
        return false
    }
    return true
}
