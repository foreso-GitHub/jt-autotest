//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const { modes, allModes, } = require("../../config/config")
const { commonPaths } = require("../../config/basicConfig")
const consts = require('../../framework/consts')
let { chainDatas } = require("../../testData/chainDatas")
const utility = require("../../framework/testUtility.js")
const AccountsDealer = require('./accountsDealer')
let accountsDealer = new AccountsDealer()
const Charger = require('./charger')
let charger = new Charger()
//endregion


function chainDataCreator(){

    chainDataCreator.prototype.create = async function(modes, modeAccounts, forceCreate){
        logger.info('===start chainDataCreator===')
        return new Promise((resolve, reject) =>{
            if(forceCreate == null){
                forceCreate = false
            }

            if(!modes){
                modes = allModes
            }

            if(forceCreate || !chainDatas){
                chainDatas = []
            }
            let modesNeedCreateChainData = []
            let checkedCount = 0
            modes.forEach(async mode => {
                let chainData = utility.findChainData(chainDatas, mode.chainDataName)
                if (utility.findChainData(chainDatas, mode.chainDataName) == null) {
                    if(utility.findChainData(modesNeedCreateChainData, mode.chainDataName) == null){
                        modesNeedCreateChainData.push(mode)
                    }
                }
                checkedCount++
                if(checkedCount == modes.length){
                    if(modesNeedCreateChainData.length==0){
                        resolve(chainDatas)
                    }
                    else{
                        let createCount = 0
                        if(forceCreate){
                            modesNeedCreateChainData = modes  //force to create chain data for all modes
                        }
                        for(let i = 0; i < modesNeedCreateChainData.length; i++) {
                            let createMode = modesNeedCreateChainData[i]
                            createMode.addresses = accountsDealer.getAddressesByMode(modeAccounts, createMode)
                            let newChainData = await createChainData(createMode)
                            chainDatas.push(newChainData)
                            createCount++
                            if(createCount == modesNeedCreateChainData.length) {
                                await utility.saveJsFile("chainDatas", chainDatas, commonPaths.chain_data_js_file_path)
                                resolve(chainDatas)
                            }
                        }
                    }
                }
            })
        })

    }

    async function createChainData(mode){
        let chainData = {}
        chainData.chainDataName = mode.chainDataName
        let txResults = []
        let server = mode.server
        server.init(mode)
        let root = mode.addresses.rootAccount
        let sender = mode.addresses.sender1
        let sequence3 = mode.addresses.sequence3
        const to = mode.addresses.receiver1.address
        let globalCoin = mode.coins[0]
        let localCoin = mode.coins[1]
        let globalSameCoin = mode.coins[2]
        let localSameCoin1 = mode.coins[3]
        let params
        let result

        let rootResponse = await server.responseGetAccount(server, root.address)
        let rootSequence = rootResponse.result.Sequence

        //send more swt to sender accounts
        let senders = [mode.addresses.sender1, mode.addresses.sender2, mode.addresses.sender3]
        await charger.chargeAccounts(server, root, senders, 10000)

        rootSequence += 3

        //region issue coin

        //region global coin (without issuer)
        result = await issueCoin(server, root, rootSequence++, globalCoin, false, consts.flags.both)
        if(result){
            txResults.push(result)
            // logger.debug('-------------create: globalCoin')
        }
        //endregion

        //region local coin (with issuer)
        result = await issueCoin(server, root, rootSequence++, localCoin, true, consts.flags.both)
        if(result){
            txResults.push(result)
            // logger.debug('-------------create: localCoin')
        }
        //endregion

        //region coins with same symbol
        result = await issueCoin(server, root, rootSequence++, globalSameCoin, false, consts.flags.both)
        if(result){
            txResults.push(result)
            // logger.debug('-------------create: globalSameCoin')
        }

        result = await issueCoin(server, root, rootSequence++, localSameCoin1, true, consts.flags.both)
        if(result){
            txResults.push(result)
            // logger.debug('-------------create: localSameCoin1')
        }

        let senderResponse = await server.responseGetAccount(server, sender.address)
        let senderSequence = senderResponse.result.Sequence
        let localSameCoin2 = utility.deepClone(localSameCoin1)
        localSameCoin2.name = 'TestCoin_same_local_2'
        localSameCoin2.issuer = sender.address
        result = await issueCoin(server, sender, senderSequence++, localSameCoin2, true, consts.flags.both)
        if(result){
            txResults.push(result)
            // logger.debug('-------------create: localSameCoin2')
        }

        chainData.sameSymbolCoins = {
            glabol: globalSameCoin,
            local1: localSameCoin1,
            local2: localSameCoin2,
        }
        //endregion

        //endregion

        //region send coin
        logger.info('Wait for 6 seconds, issuing coins ...')
        await utility.timeout(6000)

        result = await chargeCoin(server, root.address, root.secret, rootSequence++, mode.addresses.balanceAccount.address, globalCoin)
        txResults.push(result)

        //batch charge coin
        rootSequence = await batchChargeCoin(server, root, rootSequence, globalCoin)
        rootSequence = await batchChargeCoin(server, root, rootSequence, localCoin)
        rootSequence = await batchChargeCoin(server, root, rootSequence, globalSameCoin)
        rootSequence = await batchChargeCoin(server, root, rootSequence, localSameCoin1)
        let sequence = await batchChargeCoin(server, sender, senderSequence, localSameCoin2)
        //endregion

        //get sequence
        // await utility.timeout(6000)
        // let response = await server.responseGetAccount(server, sender.address)
        // let sequence = response.result.Sequence

        //normal swtc tx
        params = server.createTxParams(sender.address, sender.secret, sequence++, to, '1', null, null,
            null, null, null, null, null, null, null)
        result = await server.responseSendTx(server, params)
        txResults.push(result)

        //memo swtc tx
        params = server.createTxParams(sender.address, sender.secret, sequence++, to, '1', null,
            ['create test chain data for ' + mode.name + ' at ' + (new Date()).toISOString()],
            null, null, null, null, null, null, null)
        result = await server.responseSendTx(server, params)
        txResults.push(result)

        //batch txs
        for(let i = 0; i < 20; i++){
            //swt txs
            params = server.createTxParams(sender.address, sender.secret, sequence++, to, '1', null,
                ['create test chain data for ' + mode.name + ' at ' + (new Date()).toISOString()],
                null, null, null, null, null, null, null)
            result = await server.responseSendTx(server, params)
            txResults.push(result)
        }

        //make a tx for sequence3 account, to make 0650 case work
        response = await server.responseGetAccount(server, sequence3.address)
        sequence = response.result.Sequence
        params = server.createTxParams(sequence3.address, sequence3.secret, sequence, to, '1',
            null, null,null, null, null, null, null, null, null)
        result = await server.responseSendTx(server, params)
        txResults.push(result)

        //wait 10s and then get tx and block
        let txs = []
        for(let result of txResults){
            let hash = result.result[0]
            let tx = await utility.getTxByHash(server, hash, 0)
            txs.push(tx.result)
        }

        // chainData.tx_token_CNYT = txs[0]
        // chainData.tx_issue_token = txs[1]
        chainData.tx_token = txs[0]
        chainData.tx_global_coin = txs[0]
        chainData.tx_local_coin = txs[1]
        chainData.charge_coin_tx = txs[2]
        chainData.tx1 = txs[3]
        chainData.tx_memo = txs[4]

        let blockNumber = chainData.tx1.ledger_index
        let blockResult = await server.responseGetBlockByNumber(server, blockNumber.toString(), false)
        let block = blockResult.result
        chainData.block = {}
        chainData.block.blockNumber = block.ledger_index
        chainData.block.blockHash = block.ledger_hash
        chainData.block.txCountInBlock = block.transactions.length

        return chainData
    }

    async function issueCoin(server, sender, sequence, coin, local, flag){
        let params = server.createIssueTokenParams(sender.address, sender.secret, sequence,
            coin.name, coin.symbol, '8', '99999999', local, flag, '0.00001')
        let result = await server.responseSendTx(server, params)
        return result
    }

    async function batchChargeCoin(server, sender, sequence, coin){
        result = await chargeCoin(server, sender.address, sender.secret, sequence++, server.mode.addresses.balanceAccount.address, coin)
        result = await chargeCoin(server, sender.address, sender.secret, sequence++, server.mode.addresses.sender1.address, coin)
        result = await chargeCoin(server, sender.address, sender.secret, sequence++, server.mode.addresses.sender2.address, coin)
        result = await chargeCoin(server, sender.address, sender.secret, sequence++, server.mode.addresses.sender3.address, coin)
        result = await chargeCoin(server, sender.address, sender.secret, sequence++, server.mode.addresses.receiver1.address, coin)
        result = await chargeCoin(server, sender.address, sender.secret, sequence++, server.mode.addresses.receiver2.address, coin)
        result = await chargeCoin(server, sender.address, sender.secret, sequence++, server.mode.addresses.receiver3.address, coin)
        return sequence
    }

    async function chargeCoin(server, from, secret, sequence, to, coin){
        let count = '999998'
        let symbol = coin.symbol
        let issuer = coin.issuer
        // let value = cnytCount + '/' + cnytSymbol + '/' + cnytIssuer
        let value = utility.getShowValue(count, symbol, issuer)
        let params = server.createTxParams(from, secret, sequence, to, '1', null, null,
            null, null, null, null, null, null, null)
        params[0].value = value
        let result = await server.responseSendTx(server, params)
        return result
    }

}

module.exports = chainDataCreator