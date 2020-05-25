//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const fs = require('fs')
const { configCommons } = require("../config")
//endregion

let _LastDynamicalTimeSeed = 0

module.exports = testUtility = {

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
        return new Promise(async function(resolve, reject){
            server.responseGetTxByHash(server, hash)
                .then(async function (value) {
                    //retry
                    if(retryCount < server.mode.retryMaxCount && (value.result.toString().indexOf('can\'t find transaction') != -1
                        || value.result.toString().indexOf('no such transaction') != -1)){
                        retryCount++
                        logger.debug("===Try responseGetTxByHash again! The " + retryCount + " retry!===")
                        await testUtility.timeout(server.mode.retryPauseTime)
                        resolve(await testUtility.getTxByHash(server, hash, retryCount))
                    }
                    else{
                        resolve(value)
                    }
                })
                .catch(function(error){
                    logger.debug(error)
                    reject(error)
                })
        })
    },

    //endregion

    //region issue token
    getDynamicTokenName: function(){
        let timeSeed = (_LastDynamicalTimeSeed) ? _LastDynamicalTimeSeed : Math.round(new Date().getTime()/1000)
        _LastDynamicalTimeSeed = ++timeSeed
        let result = {}
        result.name = "TestCoin" + timeSeed
        result.symbol = timeSeed.toString(16)
        logger.debug("getDynamicName: " + JSON.stringify(result))
        return result
    },

    getShowSymbol: function(symbol, issuer){
        return (!symbol || symbol == null || symbol == 'swt' || symbol == 'SWT') ? '' : ('/' + symbol + '/' + issuer)
    },
    //endregion

    //region hex relative

    //example
    // hex: 516d557556664a7251326d62374632323366556876706b5136626a46464d344661504b6e4b4c4c42574d45704257
    // ascii: QmUuVfJrQ2mb7F223fUhvpkQ6bjFFM4FaPKnKLLBWMEpBW
    // base64: UW1VdVZmSnJRMm1iN0YyMjNmVWh2cGtRNmJqRkZNNEZhUEtuS0xMQldNRXBCVw==

    hex2Utf8: function(hex){
        return new Buffer.from(hex.toString(), 'hex').toString('utf8')
    },

    utf82Hex: function(hex){
        return new Buffer.from(string, 'utf8').toString('hex')
    },

    hex2Base64: function(hex){
        // return new Buffer.from(hex.toString(), 'hex').toString('utf8')
        return new Buffer.from(hex.toString(), 'hex').toString('base64')
    },

    base642Hex: function(string){
        // return new Buffer.from(string, 'utf8').toString('hex')
        return new Buffer.from(string, 'base64').toString('hex')
    },

    hex2Ascii: function(hex){
        return new Buffer.from(hex.toString(), 'hex').toString('ascii')
    },

    ascii2Hex: function(string){
        return new Buffer.from(string, 'ascii').toString('hex')
    },

    isHex: function(context){
        let context2 = utility.hex2Base64(context)
        let hex = utility.base642Hex(context2)
        return context.toUpperCase() === hex.toUpperCase()
    },

    //endregion

    //region array operation
    cloneArray: function(originalArray){
        let newArray = []
        originalArray.forEach((item) => {
            newArray.push(item)
        })
        return newArray
    },

    ifArrayHas: function(array, specialItem){
        let result = false
        array.forEach((item) => {
            if(item == specialItem){
                result = true
            }
        })

        return result
    },

    addItemInEmptyArray: function(item){
        let array = []
        array.push(item)
        return array
    },

    addItemInArray: function(array, item){
        array.push(item)
        return array
    },
    //endregion

}

