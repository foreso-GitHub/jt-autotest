//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const fs = require('fs');
const { modes, allModes, configCommons } = require("../config")
const consts = require("../../lib/base/consts.js")
let { chainDatas } = require("../testData/chainDatas")
const CommonUtility = require("./commonUtility")
let utilty = new CommonUtility()
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
                let chainData = utilty.findMode(chainDatas, mode.modeName)
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
                                await utilty.saveJsFile("chainDatas", chainDatas, configCommons.chain_data_js_file_path)
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
        //normal swtc tx

        //memo swtc tx

        //issue token

        //token tx

        //batch txs

        return chainData
    }

}

module.exports = chainDataCreator