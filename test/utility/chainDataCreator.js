//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const fs = require('fs');
const { modes, allModes, configCommons } = require("../config")
const consts = require("../../lib/base/consts.js")
let { chainDatas } = require("../testData/chainDatas")
const utility = require("./testUtility.js")
//endregion


function chainDataCreator(){

    chainDataCreator.prototype.create = async function(modes){
        return new Promise((resolve, reject) =>{
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
                        for(let i = 0; i < modesNeedCreateChainData.length; i++) {
                            let createMode = modesNeedCreateChainData[i]
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
        chainData.modeName = mode.name
        let txResults = []
        let server = mode.server
        server.init(mode)
        let root = mode.root
        const to = "j9h2qmiAP1efVoTZQeH2DGmByQVZbmmCdT"

        //get sequence
        let response = await server.responseGetAccount(server, root.address)
        let sequence = response.result.Sequence

        //normal swtc tx
        let params = server.createTxParams(root.address, root.secret, sequence++, to, '1', null, null,
            null, null, null, null, null, null, null)
        let result = await server.responseSendTx(server, params)
        txResults.push(result)

        //memo swtc tx

        //issue token

        //token tx

        //batch txs

        //wait 10s and then get tx and block
        await utility.timeout(1000)


        return chainData
    }

}

module.exports = chainDataCreator