//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const fs = require('fs')
const { configCommons } = require("../config")
//endregion

let testUtility = {

    //region timeout
    timeout: function(time) {
        return new Promise(async (resolve, reject) => {
            if (typeof time != 'number') reject(new Error('参数必须是number类型'));
            setTimeout(
                () => {
                    resolve('timeout done!')
                }, time)
        })
    },
    //endregion

    //region judge if json format
    isJSON: function(str) {
        if (typeof str == 'string') {
            try {
                let obj = JSON.parse(str)
                if(typeof obj == 'object' && obj ){
                    return true
                }else{
                    return false
                }
            } catch(e) {
                // console.log('error：'+str+'!!!'+e)
                return false
            }
        }
        // console.log('It is not a string!')
        return false
    },
    //endregion

    //region find mode/object
    findMode: function(modes, modeName) {
        let resultMode = null
        let count = 0
        for(i = 0; i < modes.length; i++){
            let mode = modes[i]
            if(mode.modeName == modeName){
                resultMode = mode
            }
            count++
            if(modes.length == count){
                return resultMode
            }
        }
    },
    //endregion

    //region save js file
    saveJsFile: function(moduleName, jsonObject, filePath){
        return new Promise(async (resolve, reject) =>{
            let destFilePath = configCommons.test_data_backup_path
                + moduleName + '_backup_' + (new Date()).toDateString() + '_' + (new Date()).getTime() + '.js'
            await testUtility.copyFile(filePath, destFilePath)  //backup
            let fileString = 'let ' + moduleName + ' = '
                + JSON.stringify(jsonObject)
                + '\r\nmodule.exports = { ' + moduleName +' }'
            fs.writeFile(filePath, fileString, function (err) {
                if (err) {
                    logger.debug(err)
                    reject(err)
                } else {
                    logger.debug('Accounts js saved: ' + filePath)
                    resolve(jsonObject)
                }
            })
        })
    },

    copyFile: function(srcFilePath, destFilePath){
        return new Promise((resolve, reject) =>{
            fs.copyFile(srcFilePath, destFilePath,function(err){
                if(err) {
                    console.log('Copy file error: ' + err)
                    reject(err)
                }
                else {
                    console.log('Copy file succeed! From [' + srcFilePath + '] to [' + destFilePath + ']!')
                    resolve(destFilePath)
                }
            })
        })
    },
    //endregion

    //region send tx
    sendTx: async function (server, params, waitSpan){
        return new Promise((resolve, reject) => {
            server.responseSendTx(server, params).then(async function (result) {
                logger.debug(JSON.stringify((result)))
                await utility.timeout(waitSpan)
                resolve(result)
            }).catch(function(error){
                reject(error)
            })
        })
    },
    //endregion

    //region get tx
    getTxByHash: function(server, hash, retryCount){
        return server.responseGetTxByHash(server, hash)
            .then(async function (value) {
                //retry
                if(retryCount < server.mode.retryMaxCount && (value.result.toString().indexOf('can\'t find transaction') != -1
                    || value.result.toString().indexOf('no such transaction') != -1)){
                    retryCount++
                    logger.debug("===Try responseGetTxByHash again! The " + retryCount + " retry!===")
                    await utility.timeout(server.mode.retryPauseTime)
                    return getTxByHash(server, hash, retryCount)
                }
                return value
            }).catch(function(error){
                logger.debug(error)
            })
    },
    //endregion

}
module.exports = testUtility