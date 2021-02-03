//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let utility = require("../../framework/testUtility")
const { modes, } = require("../../config/config")
const framekwork = require('../../framework/framework')
//endregion

//region done
// checkInLedgerByBlocks(0, 1000)
// checkInLedgerByBlocks(90001, 100000)
// checkInLedgerByBlocks(100000, 103700)
// checkInLedgerByBlocks(89001, 90000)
// checkInLedgerByBlocks(103701, 105000)
// checkInLedgerByBlocks(105001, 110000)
// checkInLedgerByBlocks(110001, 112000)
// checkInLedgerByBlocks(112001, 120000)
// checkInLedgerByBlocks(120001, 125000)
// checkInLedgerByBlocks(125001, 126000)
// checkInLedgerByBlocks(126001, 126500)
//endregion

checkInLedgerByBlocks(126466, 126500)

async function checkInLedgerByBlocks(startBlock, endBlock){
    let server = framework.activeServer(modes[0])
    let checkResult = await checkBlocks(server, startBlock, endBlock)
    logger.debug('Total tx count: ' + checkResult.txCount + ', fail txs count: ' + checkResult.failTxs.length)
    for(let i = 0; i < checkResult.failTxs.length; i++){
        logger.debug((i+1).toString() + '. ' + failTxs[i])
    }
}

async function checkBlocks(server, startBlock, endBlock){
    let checkResult = {}
    checkResult.failTxs = []
    checkResult.txCount = 0
    for(let i = startBlock; i <= endBlock; i++){
        let subResult = await checkBlock(server, i)
        checkResult.failTxs = checkResult.failTxs.concat(subResult.failTxs)
        checkResult.txCount += subResult.count
        logger.debug('Block ' + i + ' has checked, total ' + subResult.count
            + ' txs, found ' + checkResult.failTxs.length + ' failed tx! '
            + 'Total block count: ' + (i - startBlock + 1)
            + ', tx count: ' + checkResult.txCount
            + ', failed tx count:' + checkResult.failTxs.length
        )
    }
    checkResult.blockCount = endBlock - startBlock + 1
    return checkResult
}

async function checkBlock(server, blockNumber){
    let block = await server.getBlockByNumber(server, blockNumber, false)
    if(block){
        let txs = block.transactions
        let checkResult = {}
        checkResult.failTxs = []
        checkResult.count = txs.length

        for(let i = 0; i < checkResult.count; i++){
            let hash = txs[i]
            let tx = await server.getTx(server, hash)
            let result = checkTx(blockNumber, tx)
            if(!result){
                checkResult.failTxs.push(hash)
            }
        }

        return checkResult
    }
    return null
}

function checkTx(blockNumber, tx){
    if(tx.inLedger != blockNumber || tx.inLedger != blockNumber){
        logger.debug('block: ' + blockNumber.toString() + ', tx: ' + tx.hash
            + ', inLedger: ' + tx.inLedger  + ', ledger_index: ' + tx.ledger_index)
        return false
    }
    return true
}
