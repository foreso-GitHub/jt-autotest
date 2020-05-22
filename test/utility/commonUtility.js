//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const fs = require('fs')
const { configCommons } = require("../config")
//endregion

function commonUtility(){

    commonUtility.prototype.findMode = function (modes, modeName) {
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
    }

    commonUtility.prototype.saveJsFile = function(moduleName, jsonObject, filePath){
        return new Promise(async (resolve, reject) =>{
            let destFilePath = configCommons.test_data_backup_path
                + moduleName + '_backup_' + (new Date()).toDateString() + '_' + (new Date()).getTime() + '.js'
            await copyFile(filePath, destFilePath)  //backup
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
    }

    function copyFile(srcFilePath, destFilePath){
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
    }

}

module.exports = commonUtility
