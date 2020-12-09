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
        let existedCoin = mode.coins[4]
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
        result = await issueCoin(server, root, rootSequence, globalCoin, false, consts.flags.both)
        if(result){
            chainData.tx_global_coin_hash = result.result[0]
            rootSequence++
        }
        else{
            logger.debug('=== Issue global coin failed!')
        }
        //endregion

        //region local coin (with issuer)
        result = await issueCoin(server, root, rootSequence, localCoin, true, consts.flags.both)
        if(result){
            chainData.tx_local_coin_hash = result.result[0]
            rootSequence++
        }
        else{
            logger.debug('=== Issue local coin failed!')
        }
        //endregion

        //region create existed coin for case 0322
        let currenyResponse = await server.responseGetCurrency(server, existedCoin.symbol, existedCoin.issuer)  // 这个代币有可能已经存在。如不存在，再发行。
        if(!(currenyResponse.result
            && currenyResponse.result.TotalSupply
            && currenyResponse.result.TotalSupply.currency == existedCoin.symbol)){

            result = await issueCoin(server, root, rootSequence, existedCoin, true, consts.flags.normal)
            if(result && result[0] && utility.isHex(result[0])){  // 判断是否交易成功，然后sequence再++
                chainData.tx_existed_coin_hash = result.result[0]
                chainData.tx_existed_coin = existedCoin
                rootSequence++
            }
            else{
                logger.debug('=== Issue local coin failed!')
            }
        }
        else{
            chainData.tx_existed_coin = existedCoin
        }
        //endregion

        //region coins with same symbol
        result = await issueCoin(server, root, rootSequence++, globalSameCoin, false, consts.flags.both)
        result = await issueCoin(server, root, rootSequence++, localSameCoin1, true, consts.flags.both)

        let senderResponse = await server.responseGetAccount(server, sender.address)
        let senderSequence = senderResponse.result.Sequence
        let localSameCoin2 = utility.deepClone(localSameCoin1)
        localSameCoin2.name = 'TestCoin_same_local_2'
        localSameCoin2.issuer = sender.address
        result = await issueCoin(server, sender, senderSequence++, localSameCoin2, true, consts.flags.both)

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

        result = await chargeCoin(server, root.address, root.secret, rootSequence, mode.addresses.balanceAccount.address, globalCoin)
        if(result){
            chainData.charge_coin_tx_hash = result.result[0]
            rootSequence++
        }
        else{
            logger.debug('=== Charge coin failed!')
        }

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
        if(result){
            chainData.tx1_hash = result.result[0]
        }
        else{
            logger.debug('=== Send tx1 failed!')
        }

        //memo swtc tx
        params = server.createTxParams(sender.address, sender.secret, sequence++, to, '1', null,
            ['create test chain data for ' + mode.name + ' at ' + (new Date()).toISOString()],
            null, null, null, null, null, null, null)
        result = await server.responseSendTx(server, params)
        if(result){
            chainData.tx_memo_hash = result.result[0]
        }
        else{
            logger.debug('=== Send memo tx failed!')
        }

        //batch txs
        for(let i = 0; i < 20; i++){
            //swt txs
            params = server.createTxParams(sender.address, sender.secret, sequence++, to, '1', null,
                ['create test chain data for ' + mode.name + ' at ' + (new Date()).toISOString()],
                null, null, null, null, null, null, null)
            result = await server.responseSendTx(server, params)
        }

        //make a tx for sequence3 account, to make 0650 case work
        response = await server.responseGetAccount(server, sequence3.address)
        sequence = response.result.Sequence
        params = server.createTxParams(sequence3.address, sequence3.secret, sequence, to, '1',
            null, null,null, null, null, null, null, null, null)
        result = await server.responseSendTx(server, params)

        logger.info('Wait for 6 seconds, sending txs ...')
        await utility.timeout(6000)

        chainData.tx_token = await getTxByHash(server, chainData.tx_global_coin_hash)
        chainData.tx_global_coin = chainData.tx_token
        chainData.tx_local_coin = await getTxByHash(server, chainData.tx_local_coin_hash)
        chainData.charge_coin_tx = await getTxByHash(server, chainData.charge_coin_tx_hash)
        chainData.tx1 = await getTxByHash(server, chainData.tx1_hash)
        chainData.tx_memo = await getTxByHash(server, chainData.tx_memo_hash)

        let blockNumber = chainData.tx1.ledger_index
        let blockResult = await server.responseGetBlockByNumber(server, blockNumber.toString(), false)
        let block = blockResult.result
        chainData.block = {}
        chainData.block.blockNumber = block.ledger_index
        chainData.block.blockHash = block.ledger_hash
        chainData.block.txCountInBlock = block.transactions.length

        return chainData
    }

    async function getTxByHash(server, hash){
        let tx = await utility.getTxByHash(server, hash)
        return tx.result
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