//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const fs = require('fs');
const { modes, allModes, configCommons } = require("../config")
let { chainDatas } = require("../testData/chainDatas")
const consts = require("../framework/lib/base/consts.js")
const utility = require("../framework/testUtility.js")
const AccountsDealer = require('./accountsDealer')
let accountsDealer = new AccountsDealer()
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

            if(!chainDatas){
                chainDatas = []
            }
            let modesNeedCreateChainData = []
            let checkedCount = 0
            modes.forEach(async mode => {
                let chainData = utility.findMode(chainDatas, mode.modeName)
                if (chainData == null) {
                    modesNeedCreateChainData.push(mode)
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
                                await utility.saveJsFile("chainDatas", chainDatas, configCommons.chain_data_js_file_path)
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
        chainData.modeName = mode.chainDataName
        let txResults = []
        let server = mode.server
        server.init(mode)
        // let root = mode.root
        let root = mode.addresses.rootAccount
        let sender = mode.addresses.sender1
        let sequence3 = mode.addresses.sequence3
        const to = mode.addresses.receiver1.address
        let params
        let result

        //todo now only CNYT can be issue, need update here
        let rootResponse = await server.responseGetAccount(server, root.address)
        let rootSequence = rootResponse.result.Sequence
        let cnytCount = '999999'
        let cnytSymbol = 'CNYT'
        let cnytIssuer = 'jjjjjjjjjjjjjjjjjjjjjhoLvTp'
        let value = cnytCount + '/' + cnytSymbol + '/' + cnytIssuer
        params = server.createTxParams(
            root.address, root.secret, rootSequence++, mode.addresses.balanceAccount.address, '1', null, null,
            null, null, null, null, null, null, null
        )
        params[0].value = value
        result = await server.responseSendTx(server, params)
        txResults.push(result)

        //get sequence
        let response = await server.responseGetAccount(server, sender.address)
        let sequence = response.result.Sequence

        //issue token
        //todo need issue 2 tokens, with and without issuer.
        // let tokenName = utility.getDynamicTokenName()
        // params = server.createIssueTokenParams(sender.address, sender.secret, sequence++,
        //     tokenName.name, tokenName.symbol, '8', '99999999', false, consts.flags.normal, '0.00001')
        // result = await server.responseSendTx(server, params)
        // txResults.push(result)

        //token tx
        //todo now only CNYT can be issue, need update here
        // let hash = result.result[0]
        // await utility.getTxByHash(server, hash, 0) //wait for issue token done
        // let showSymbol = utility.getShowSymbol(tokenName.symbol, 'jjjjjjjjjjjjjjjjjjjjjhoLvTp')
        // params = server.createTxParams(sender.address, sender.secret, sequence++, to, '1', null, null,
        //     null, null, null, null, null, null, null)
        // params[0].value = '1' + showSymbol
        // result = await server.responseSendTx(server, params)
        // txResults.push(result)

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
            params = server.createTxParams(sender.address, sender.secret, sequence++, to, '1', null,
                ['create test chain data for ' + mode.name + ' at ' + (new Date()).toISOString()],
                null, null, null, null, null, null, null)
            result = await server.responseSendTx(server, params)
            txResults.push(result)
        }

        //make a tx for sequence3 account, to make 0650 case work
        params = server.createTxParams(sequence3.address, sequence3.secret, 1, to, '1',
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

        chainData.tx_token_CNYT = txs[0]
        // chainData.tx_issue_token = txs[1]
        chainData.tx_token = txs[0]  //todo need be replaced by real issued token
        chainData.tx1 = txs[1]
        chainData.tx_memo = txs[2]

        let blockNumber = chainData.tx1.ledger_index
        let blockResult = await server.responseGetBlockByNumber(server, blockNumber.toString(), false)
        let block = blockResult.result
        chainData.block = {}
        chainData.block.blockNumber = block.ledger_index
        chainData.block.blockHash = block.ledger_hash
        chainData.block.txCountInBlock = block.transactions.length

        return chainData
    }

}

module.exports = chainDataCreator