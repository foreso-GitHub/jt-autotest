//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const fs = require('fs')
const { commonPaths } = require("../config/basicConfig")
const {responseStatus,  serviceType,  interfaceType,  testMode,  restrictedLevel,} = require('./enums')

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
        let obj
        if (typeof str == 'string') {
            try {
                obj = JSON.parse(str)
            } catch(e) {
                // console.log('error：'+str+'!!!'+e)
                return false
            }
        }else{
            if(typeof str == 'object'){
                obj = str
            }
        }

        if(typeof obj == 'object' && obj ){
            return true
        }else{
            return false
        }

        // console.log('It is not a string!')
        return false
    },
    //endregion

    //region find mode/object

    findItem: function(items, itemName, getPropertyName) {
        let result = null
        let count = 0
        for(i = 0; i < items.length; i++){
            let item = items[i]
            if(getPropertyName(item) == itemName){
                result = item
            }
            count++
            if(items.length == count){
                return result
            }
        }
    },

    findMode: function(modes, modeName) {
        return testUtility.findItem(modes, modeName, function(mode){
            return mode.modeName
        })
    },

    findChainData: function(modes, chainDataName) {
        return testUtility.findItem(modes, chainDataName, function(mode){
            return mode.chainDataName
        })
    },

    findAccounts: function(modes, accountsName) {
        return testUtility.findItem(modes, accountsName, function(mode){
            return mode.accountsName
        })
    },

    //endregion

    //region save js file
    saveJsFile: function(moduleName, jsonObject, filePath){
        return new Promise(async (resolve, reject) =>{
            let destFilePath = commonPaths.test_data_backup_path
                + moduleName + '_backup_' + (new Date()).toDateString() + '_' + (new Date()).getTime() + '.js'
            await testUtility.copyFile(filePath, destFilePath)  //backup
            let fileString = 'let ' + moduleName + ' = '
                + JSON.stringify(jsonObject)
                + '\r\nmodule.exports = { ' + moduleName +' }'
            fs.writeFile(filePath, fileString, function (err) {
                if (err) {
                    logger.info(err)
                    reject(err)
                } else {
                    logger.info('Accounts js saved: ' + filePath)
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

    //region load/save json file
    loadJsonFile: function(filePath, fileName, ){
        return new Promise((resolve, reject) => {
            fs.readFile( filePath + fileName, 'utf8', function (err, data) {
                if (err) {
                    throw err
                }
                let reportJson = JSON.parse(data)
                resolve(reportJson)
            })
        })
    },

    saveJsonFile: function(filePath, fileName, jsonObject){
        return new Promise(async (resolve, reject) =>{
            let destFilePath = filePath + fileName + '_' + (new Date()).toDateString() + '_' + (new Date()).getTime() + '.json'
            let fileString = JSON.stringify(jsonObject)
            fs.writeFile(destFilePath, fileString, function (err) {
                if (err) {
                    throw err
                } else {
                    logger.info('Json saved: ' + destFilePath)
                    resolve(fileString)
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

    getTxByHash: function(server, hash, retriedCount){
        if(retriedCount == null){
            retriedCount = 0
        }
        return new Promise(async function(resolve, reject){
            server.responseGetTxByHash(server, hash)
                .then(async function (response) {
                    //retry
                    // if(retriedCount < server.mode.retryMaxCount && (response.result.toString().indexOf('can\'t find transaction') != -1
                    //     || response.result.toString().indexOf('no such transaction') != -1)){
                    if(retriedCount < server.mode.retryMaxCount && !testUtility.isResponseStatusSuccess(response)){
                        retriedCount++
                        logger.debug("===Try responseGetTxByHash again! The " + retriedCount + " retry!===")
                        await testUtility.timeout(server.mode.retryPauseTime)
                        resolve(await testUtility.getTxByHash(server, hash, retriedCount))
                    }
                    else{
                        resolve(response)
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

    getShowValue: function(value, symbol, issuer){
        return value + this.getShowSymbol(symbol, issuer)
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
        let context2 = testUtility.hex2Base64(context)
        let hex = testUtility.base642Hex(context2)
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

    //region rand number
    getRand: function(min, max){
        let time = new Date().getTime()
        let gap = max - min + 1
        let rawRand = time % gap
        let rand = rawRand + min
        return rand
    },

    //count: the count of return rand numbers.
    //canBeSame: if the rand numbers can be same.
    //todo the second rand is always 1 larger than the first rand.  because 2nd is calculated just behind 1st.
    //solution: digest the big rand (time) to generate a new rand.
    getRandList: function(min, max, count, canBeSame){
        let rands = []
        if(canBeSame){
            for(let i = 0; i < count; i++){
                rands.push[testUtility.getRand(min, max)]
            }
        }
        else{
            let i = 0
            while(i < count){
                let rand = testUtility.getRand(min, max)
                if(!testUtility.ifArrayHas(rands, rand)){
                    rands.push(rand)
                    i++
                }
            }
        }
        return rands
    },

    //endregion

    //region create memos with special length
    createMemosWithSpecialLength: function(length){
        let memos = []
        let content = ''
        for(let i = 0; i < length; i++){
            content += 'A'
        }
        memos.push(content)
        return memos
    },
    //endregion

    //region is response status success
    isResponseStatusSuccess: function(response){
        if(!response)
            return false
        return !response.status || response.status == responseStatus.success
    },
    //endregion

    //region duration to time
    duration2Time: function(start, end){
        let span = end - start
        return testUtility.span2Time(span)
    },

    span2Time: function(span){
        let time = {}
        let hour = Math.floor(span / 1000 / 60 / 60)
        span = span - hour * 1000 * 60 * 60
        let minute = Math.floor(span / 1000 / 60 )
        span = span - minute * 1000 * 60
        let second = Math.floor(span / 1000 )
        time.hour = hour
        time.minute = minute
        time.second = second
        return time
    },

    printTime: function(time){
      return time.hour + ':' + time.minute + ':' + time.second
    },
    //endregion
}

