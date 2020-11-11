//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const fs = require('fs')
const { commonPaths } = require("../config/basicConfig")
const {responseStatus,  serviceType,  interfaceType,  testMode,  restrictedLevel,} = require('./enums')
const consts = require('./lib/base/consts')
//endregion

let _LastDynamicalTimeSeed = 0
let lastSeed

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
                + moduleName + '_backup_' + testUtility.getNowDateTimeString() + '.js'
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
    loadJsonFile: function(file, ){
        return new Promise((resolve, reject) => {
            fs.readFile( file, 'utf8', function (err, data) {
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
            let destFilePath = filePath + fileName + '_' + testUtility.getNowDateTimeString() + '.json'
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
            newArray.push(testUtility.isArray(item) ? testUtility.cloneArray(item) : item)
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

    ifArrayHas2: function(array, item){
        return testUtility.indexOf(array, item) != -1
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

    indexOf: function(array, item){
        let index = -1
        for(let i = 0; i < array.length; i++){
            if(array[i] == item){
                index = i
                break;
            }
        }
        return index
    },

    remove: function(array, item){
        let result = false
        let index = testUtility.indexOf(array, item)
        if(index != -1){
            array.splice(index, 1)
            result = true
        }
        return result
    },

    // cloneArray: function(array){
    //     let cloneArray = []
    //     array.forEach((item) => {
    //         cloneArray.push(item)
    //     })
    //     return cloneArray
    // },

    isArray: function(object){
        return Object.prototype.toString.apply(object) === '[object Array]'
    },
    //endregion

    //region rand number
    //region 伪随机数算法
    //
    // 　　伪随机数产生的方法有个逼格挺高的名字---伪随机数发生器。伪随机数产生器中最最最基础的思想是均匀分布(当然这不是唯一的思路)。一般来说，只敢说"一般来说"，因为我也不敢百分百肯定，如今主流的编程语言中使用的随机数函数基本采用这种均匀分布思想，而其中最常用的算法就是"线性同余法"（有着很多的别名，不过我喜欢用这个名字，原因你懂的→_→）。不BB别的算法，直接介绍线性同余法。
    //
    // 　　1. 什么是线性同余法？
    // 　　对于计算机科学专业的学生来说，八成会接触一门课，叫作《离散数学》。里面有一章专门介绍初等数论，而线性同余法作为产生均匀型伪随机数的算法，有大概一页的论述（真是一个悲剧(-_-メ)）。当然，可能很多人在初中或者之后的数学竞赛中学过初等数论，线性同余法当然也一定是有过接触的。
    // 　　线性同余法基于如下线性同余方程组
    //      aX+bY=m
    // 　　用于产生均匀型伪随机数的线性同余产生器（与上面的方程符号没有对应关系）
    //      X[n]=(aX[n-1]+b)mod(m)              　
    //
    // 　　其中，a为"乘数"，b为"增量"，m为"模数",x0为"种子数"。
    // 　　如果产生的是区间实在(0,1)之间的，则只需要每个数都除以m即可，即取
    //         γ[n]=X[n]/m
    // 　　
    // 　　2. 线性同余法产生均匀型伪随机数需要注意什么？
    //
    // 　　　2.1）种子数是在计算时随机给出的。比如C语言中用srand(time(NULL))函数进行随机数种子初始化。
    //
    // 　　   2.2）决定伪随机数质量的是其余的三个参数，即a,b,m决定生成伪随机数的质量（质量指的是伪随机数序列的周期性）
    //
    // 　　   2.3）一般b不为0。如果b为零，线性同余法变成了乘同余法，也是最常用的均匀型伪随机数发生器。
    //
    // 　　3. 高性能线性同余法参数取值要求？
    //
    // 　　　3.1）一般选取方法：乘数a满足a=4p+1；增量b满足b=2q+1。其中p，q为正整数。 PS:不要问我为什么，我只是搬运工，没有深入研究过这个问题。
    //
    // 　　   3.2）m值得话最好是选择大的，因为m值直接影响伪随机数序列的周期长短。记得Java中是取得32位2进制数吧。
    //
    // 　　   3.3）a和b的值越大，产生的伪随机数越均匀
    //
    // 　　　3.4）a和m如果互质，产生随机数效果比不互质好。
    //endregion
    getRand: function(min, max){
        const a = 401  // a = 4p + 1
        const b = 301  // b = 2q + 1
        const m = 123456789
        if(lastSeed == undefined) lastSeed = new Date().getTime()
        let seed2 = (a * lastSeed + b) % m
        lastSeed = seed2
        let gap = max - min + 1
        let rawRand = seed2 % gap
        let rand = rawRand + min
        return rand
    },

    //count: the count of return rand numbers.
    //canBeSame: if the rand numbers can be same.
    //solution: digest the big rand (time) to generate a new rand.
    getRandList: function(min, max, count, canBeSame){
        let rands = []
        if(canBeSame){
            for(let i = 0; i < count; i++){
                rands.push(testUtility.getRand(min, max))
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

    //region clone json
    cloneJson: function(json) {
        return JSON.parse(JSON.stringify(json))
    },

    deepClone: function (obj) {
        let objToStr = JSON.stringify(obj)
        //return JSON.parse(objToStr)
        return eval("(" + objToStr+ ")")
    },
    //endregion

    //region get now
    getNowDateTimeString: function(){
        let date = new Date()
        return date.toISOString().replace(/:/g, '-')
    },
    //endregion

    //region get real value
    getRealValue: function(value){
        valueString = value.toLowerCase()
        let index = valueString.indexOf('/swt')
        if(index != -1){
            return testUtility.valueToAmount(Number(valueString.substring(0, index)))
        }
        else{
            return Number(value)
        }
    },

    valueToAmount: function(value){
        return value * consts.swtConsts.oneSwt
    },
    //endregion
}

