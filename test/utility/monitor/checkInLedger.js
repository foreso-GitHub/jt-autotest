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
// checkInLedgerByBlocks(126501, 128000)
// checkInLedgerByBlocks(128001, 145600) [2021-02-05T00:14:52.650] [DEBUG] default - Check from block [128001] to block [145600], total 17600 blocks, total tx count: 7360, fail txs count: 0
// checkInLedgerByBlocks(145601, 181443)
//[2021-02-08T00:18:05.223] [WARN] default - Block 181443 has checked, total 16 txs, found 0 failed tx! Total block count: 35843, tx count: 56484, failed tx count:0
// checkInLedgerByBlocks(181443, 185713)
// [2021-02-08T11:35:21.037] [WARN] default - Block 185713 has checked, total 29 txs, found 0 failed tx! Total block count: 4271, tx count: 57112, failed tx count:0
// checkInLedgerByBlocks(185713, 200000)
// [2021-02-08T13:11:49.521] [WARN] default - Check from block [185713] to block [200000], total 14288 blocks, total tx count: 11018, fail txs count: 0

//endregion

checkInLedgerByBlocks(200001, 205000)

async function checkInLedgerByBlocks(startBlock, endBlock){
    let server = framework.activeServer(modes[0])
    let checkResult = await checkBlocks(server, startBlock, endBlock)
    logger.warn('Check from block [' + startBlock + '] to block [' + endBlock + '], total '
        + (endBlock - startBlock + 1) + ' blocks, total tx count: ' + checkResult.txCount + ', fail txs count: ' + checkResult.failTxs.length)
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
        logger.warn('Block ' + i + ' has checked, total ' + subResult.count
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
            let tx = await server.getTx(server, hash, true)
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
        logger.warn('block: ' + blockNumber.toString() + ', tx: ' + tx.hash
            + ', inLedger: ' + tx.inLedger  + ', ledger_index: ' + tx.ledger_index)
        return false
    }
    return true
}
