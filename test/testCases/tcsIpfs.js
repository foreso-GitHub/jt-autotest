//region require
//region mocha
const chai = require('chai')
chai.use(require('chai-json-schema'))
const expect = chai.expect
//endregion
//region logger
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
//endregion
//region test framework
const framework = require('../framework/framework')
const schema = require('../framework/schema')
const { responseStatus,  serviceType,  interfaceType,  testMode,  restrictedLevel, } = require("../framework/enums")
const consts = require('../framework/consts')
let utility = require('../framework/testUtility')
const { token, } = require("../testData/testData")
//endregion
//endregion

module.exports = tcsIpfs = {

    //region ipfs test
    testForIpfsTest: function(server, describeTitle){
        describe(describeTitle, function(){
            let testCases

            testCases = tcsIpfs.testForNodeInfo(server)
            framework.testTestCases(server, consts.ipfsFunctions.getNodeInfo, testCases)

            // testCases = tcsIpfs.testForUploadData(server)
            // framework.testTestCases(server, consts.ipfsFunctions.uploadData, testCases)
            //
            // testCases = tcsIpfs.testForDownloadData(server)
            // framework.testTestCases(server, consts.ipfsFunctions.downloadData, testCases)
            //
            // testCases = tcsIpfs.testForRemoveData(server)
            // framework.testTestCases(server, consts.ipfsFunctions.removeData, testCases)
            //
            // testCases = tcsIpfs.testForPinData(server)
            // framework.testTestCases(server, consts.ipfsFunctions.pinData, testCases)
            //
            // testCases = tcsIpfs.testForUnpinData(server)
            // framework.testTestCases(server, consts.ipfsFunctions.unpinData, testCases)
            //
            // testCases = tcsIpfs.testForUploadFile(server)
            // framework.testTestCases(server, consts.ipfsFunctions.uploadFile, testCases)
            //
            // testCases = tcsIpfs.testForDownloadFile(server)
            // framework.testTestCases(server, consts.ipfsFunctions.downloadFile, testCases)
            //
            // testCases = tcsIpfs.testForFullProcess(server)
            // framework.testTestCases(server, 'ipfs全流程测试', testCases)
            //
            // testCases = tcsIpfs.pressureTestForUploadData(server)
            // framework.testTestCases(server, 'ipfs上传压力测试，多个case', testCases)
            //
            // testCases = tcsIpfs.pressureTestForUploadDataInOneCase(server)
            // framework.testTestCases(server, 'ipfs上传压力测试，单个case', testCases)
            //
            // testCases = tcsIpfs.pressureTestForFullProcess(server)
            // framework.testTestCases(server, 'ipfs全流程压力测试，多个case', testCases)
            //
            // testCases = tcsIpfs.pressureTestForFullProcessInOneCase(server)
            // framework.testTestCases(server, 'ipfs全流程压力测试，单个case', testCases)
        })
    },

    createTestCaseForIpfsTest: function(server, title, txFunctionName, txParams){
        let executeFunction
        if(txFunctionName == consts.ipfsFunctions.getNodeInfo){
            executeFunction = tcsIpfs.executeForNodeInfo
        }
        else if(txFunctionName == consts.ipfsFunctions.uploadData){
            executeFunction = tcsIpfs.executeForUploadData
        }
        else if(txFunctionName == consts.ipfsFunctions.downloadData){
            executeFunction = tcsIpfs.executeForDownloadData
        }
        else if(txFunctionName == consts.ipfsFunctions.removeData){
            executeFunction = tcsIpfs.executeForRemoveData
        }
        else if(txFunctionName == consts.ipfsFunctions.pinData){
            executeFunction = tcsIpfs.executeForPinData
        }
        else if(txFunctionName == consts.ipfsFunctions.unpinData){
            executeFunction = tcsIpfs.executeForUnpinData
        }
        else if(txFunctionName == consts.ipfsFunctions.uploadFile){
            executeFunction = tcsIpfs.executeForUploadFile
        }
        else if(txFunctionName == consts.ipfsFunctions.downloadFile){
            executeFunction = tcsIpfs.executeForDownloadFile
        }
        else {
            throw new Error('Interface ' + txFunctionName + ' doesn\'t exist!')
        }

        let testCase = framework.createTestCase(title, server,
            txFunctionName, txParams, null,
            executeFunction, framework.checkTestCase, framework.createExpecteResult(true),
            restrictedLevel.L2, [serviceType.ipfs])
        return testCase
    },

    //region common execute

    operateData: function(testCase, functionName, params, rawDatas, expectedResult, checkFunction){
        return new Promise(async function(resolve){
            let response = await testCase.server.getResponse(testCase.server, functionName, params)
            let check = {
                title: 'ipfs ' + functionName + ' data result',
                params: params,
                rawDatas: rawDatas,
                expectedResult: expectedResult,
                actualResult: response,
                checkFunction: checkFunction
            }
            testCase.checks.push(check)
            resolve(check)
        })
    },

    getNodeInfoBase: function(testCase, params, expectedResult){
        return tcsIpfs.operateData(testCase, consts.ipfsFunctions.getNodeInfo, params, null, expectedResult, tcsIpfs.checkNodeInfo)
    },

    uploadDataBase: function(testCase, params, expectedResult){
        return tcsIpfs.operateData(testCase, consts.ipfsFunctions.uploadData, params, null, expectedResult, checkUploadData)
    },

    downloadDataBase: function(testCase, params, rawDatas, expectedResult){
        return tcsIpfs.operateData(testCase, consts.ipfsFunctions.downloadData, params, rawDatas, expectedResult, checkDownloadData)
    },

    removeDataBase: function(testCase, params, expectedResult){
        return tcsIpfs.operateData(testCase, consts.ipfsFunctions.removeData, params, null, expectedResult, checkRemoveData)
    },

    pinDataBase: function(testCase, params, expectedResult){
        return tcsIpfs.operateData(testCase, consts.ipfsFunctions.pinData, params, null, expectedResult, checkPinData)
    },

    unpinDataBase: function(testCase, params, expectedResult){
        return tcsIpfs.operateData(testCase, consts.ipfsFunctions.unpinData, params, null, expectedResult, checkUnpinData)
    },

    uploadFileBase: function(testCase, params, expectedResult){
        return new Promise(async function(resolve){
            let url = testCase.url
            let fileName = params
            let rawDatas = testCase.rawDatas
            let response = await testCase.server.uploadFile(url, fileName)
            let check = {
                title: 'ipfs ' + consts.ipfsFunctions.uploadFile + ' result',
                params: params,
                rawDatas: rawDatas,
                expectedResult: expectedResult,
                actualResult: response,
                checkFunction: checkUploadFile
            }
            testCase.checks.push(check)
            resolve(check)
        })
    },

    downloadFileBase: function(testCase, params, rawDatas, expectedResult){
        return tcsIpfs.operateData(testCase, consts.ipfsFunctions.downloadFile, params, rawDatas, expectedResult, checkDownloadFile)
    },

    //endregion

    //region node info

    testForNodeInfo: function(server){
        let testCases = []
        let testCase = {}
        let title = ''
        let txFunctionName = consts.ipfsFunctions.getNodeInfo

        title = '0010\t显示节点状态'
        {
            let txParams = []
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.executeFunction = tcsIpfs.executeForNodeInfo
            framework.addTestCase(testCases, testCase)
        }

        return testCases
    },

    executeForNodeInfo: function(testCase){
        return new Promise(async function(resolve){
            testCase.hasExecuted = true
            let check = await tcsIpfs.getNodeInfoBase(testCase, testCase.txParams, testCase.expectedResult)
            testCase.actualResult.push(check.actualResult)
            resolve(testCase)
        })
    },

    checkNodeInfo: function(testCase, check){
        let needPass = check.expectedResult.needPass
        let response = check.actualResult
        framework.checkResponse(needPass, response)
        if(needPass){
            expect(response).to.be.jsonSchema(schema.NODEINFO_SCHEMA)
            let max = response.result.max
            let usage = response.result.usage
            expect(max >= usage).to.be.ok
        }
        else{
            framework.checkResponseError(testCase, response.message, check.expectedResult.expectedError)
        }
    },

    //endregion

    //region upload data

    testForUploadData: function(server){
        let testCases = []
        let testCase = {}
        let title = ''
        let txFunctionName = consts.ipfsFunctions.uploadData
        let dataArray = []
        // let validData = ipfs_data.data_unpin

        //region 0010	有效的单个字符串
        title = '0010\t有效的单个字符串：上传十六进制字符串'
        {
            dataArray = ['QmUuVfJrQ2mb7F223fUhvpkQ6bjFFM4FaPKnKLLBWMEpBW']
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
            framework.addTestCase(testCases, testCase)
        }

        title = '0010\t有效的单个字符串：上传一般字符串'
        {
            dataArray = ['Hello jingtum\t!\r\n']
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
            framework.addTestCase(testCases, testCase)
        }

        title = '0010\t有效的单个字符串：上传纯数字'
        {
            dataArray = ['1234567890']
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
            framework.addTestCase(testCases, testCase)
        }

        title = '0010\t有效的单个字符串：上传空格'
        {
            dataArray = [' ']
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
            framework.addTestCase(testCases, testCase)
        }

        title = '0010\t有效的单个字符串：上传中文'
        {
            dataArray = ['你好井通']
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
            framework.addTestCase(testCases, testCase)
        }
        //endregion

        //region 0020	有效的多个字符串
        title = '0020\t有效的多个字符串：上传多个十六进制字符串'
        {
            dataArray = ['QmUuVfJrQ2mb7F223fUhvpkQ6bjFFM4FaPKnKLLBWMEpBW', 'QmXGoXxdRBYjXE3Wj95NBLHqg8hEG1W8xXHF99aH3q921b']
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
            framework.addTestCase(testCases, testCase)
        }

        title = '0020\t有效的多个字符串：上传多个一般字符串'
        {
            dataArray = ['Hello jingtum!', 'Make jingtum great!']
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
            framework.addTestCase(testCases, testCase)
        }

        title = '0020\t有效的多个字符串：上传多个纯数字字符串'
        {
            dataArray = ['1234567890', '9876543210']
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
            framework.addTestCase(testCases, testCase)
        }

        title = '0020\t有效的多个字符串：上传多个空格'
        {
            dataArray = [' ', ' ']
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
            framework.addTestCase(testCases, testCase)
        }

        title = '0020\t有效的多个字符串：上传多个中文'
        {
            dataArray = ['你好井通！', '我很好，你呢？']
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
            framework.addTestCase(testCases, testCase)
        }
        //endregion

        //region 0030	无效字符测试
        title = '0030\t无效字符测试：上传的数据为空'
        {
            dataArray = []
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
            testCase.expectedResult = createExpecteResult(false, true, 'no hash')
            framework.addTestCase(testCases, testCase)
        }

        title = '0030\t无效字符测试：上传的数据为数字'
        {
            dataArray = [123]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
            testCase.expectedResult = createExpecteResult(false, true, 'only string allowed')
            framework.addTestCase(testCases, testCase)
        }

        title = '0030\t无效字符测试：上传的数据为单引号字符串'  //cannot input 单引号字符串 by js
        //endregion

        //region 0040	多个无效数据测试
        title = '0040\t多个无效数据测试：上传多个十六进制字符串'
        {
            dataArray = [123, 456, 789]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
            testCase.expectedResult = createExpecteResult(false, true, 'only string allowed')
            framework.addTestCase(testCases, testCase)
        }

        title = '0050\t多个有效无效数据混合测试'
        {
            dataArray = ['QmUuVfJrQ2mb7F223fUhvpkQ6bjFFM4FaPKnKLLBWMEpBW', 456, 789]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
            testCase.expectedResult = createExpecteResult(false, true, 'only string allowed')
            framework.addTestCase(testCases, testCase)
        }

        title = '0050\t多个有效无效数据混合测试'
        {
            dataArray = ['QmUuVfJrQ2mb7F223fUhvpkQ6bjFFM4FaPKnKLLBWMEpBW', 456, '789']
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
            testCase.expectedResult = createExpecteResult(false, true, 'only string allowed')
            framework.addTestCase(testCases, testCase)
        }

        title = '0050\t多个有效无效数据混合测试'
        {
            dataArray = ['QmUuVfJrQ2mb7F223fUhvpkQ6bjFFM4FaPKnKLLBWMEpBW', '456', 789]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
            testCase.expectedResult = createExpecteResult(false, true, 'only string allowed')
            framework.addTestCase(testCases, testCase)
        }
        //endregion

        //region 0070	字符串最多个数测试

        title = '0060\t单个字符串最大长度测试：上传一个很长的十六进制字符串（可逐渐加长），测试字符串是否有长度上限'
        {
            let count = 10
            let txt = (new Date()).toTimeString()
            for(let i = 0; i < count; i++){
                txt = txt + txt
            }
            logger.debug('===txt length: ' + txt.length)
            let dataArray = [txt]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
            framework.addTestCase(testCases, testCase)
        }

        title = '0070\t字符串最多个数测试：上传多个十六进制字符串测试（个数可逐渐增加），测试字符串个数是否有上限'
        {
            let count = 30
            let dataArray = []
            let txt = (new Date()).toTimeString()
            for(let i = 0; i < count; i++){
                dataArray.push(i.toString() + '. ' + txt)
            }
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
            framework.addTestCase(testCases, testCase)
        }

        title = '0080\t存储相同的数据'
        {
            let dataArray = ['QmUuVfJrQ2mb7F223fUhvpkQ6bjFFM4FaPKnKLLBWMEpBW','QmUuVfJrQ2mb7F223fUhvpkQ6bjFFM4FaPKnKLLBWMEpBW']
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
            testCase.executeFunction = function(testCase){
                return new Promise(async (resolve)=>{
                    testCase.hasExecuted = true
                    let uploadCheck = await tcsIpfs.uploadDataBase(testCase, testCase.txParams, testCase.expectedResult)
                    let uploadResponse = uploadCheck.actualResult
                    let check = {
                        title: 'ipfs upload same data result',
                        expectedResult: testCase.expectedResult,
                        actualResult: uploadResponse,
                        checkFunction: function(testCase, check){
                            let results = check.actualResult.result
                            let ipfs_hash_1 = results[0].ipfs_hash
                            let ipfs_hash_2 = results[1].ipfs_hash
                            expect(ipfs_hash_2).to.be.equal(ipfs_hash_1)
                        }
                    }
                    testCase.checks.push(check)
                    resolve(testCase)
                })
            }
            framework.addTestCase(testCases, testCase)
        }

        //endregion

        return testCases
    },

    executeForUploadData: function(testCase){
        return new Promise(async function(resolve){
            testCase.hasExecuted = true
            let uploadCheck = await tcsIpfs.uploadDataBase(testCase, testCase.txParams, testCase.expectedResult)
            testCase.actualResult.push(uploadCheck.actualResult)
            if(testCase.expectedResult.needPass){
                let uploadResponse = uploadCheck.actualResult
                let hashAarray = []
                uploadResponse.result.forEach((result)=>{
                    hashAarray.push(result.ipfs_hash)
                })
                let rawDatas = testCase.txParams
                let downloadCheck = await tcsIpfs.downloadDataBase(testCase, hashAarray, rawDatas, createExpecteResult(true))
                testCase.actualResult.push(downloadCheck.actualResult)
            }
            resolve(testCase)
        })
    },

    executeForpressureTestForUploadData: function(testCase){
        return new Promise(async function(resolve){
            testCase.hasExecuted = true
            let count = testCase.testCount
            count = count != null ? count : 1
            let doneCount = 0;
            for(let i = 0; i < count; i++){
                let data = i.toString() + '. ' +  testCase.txParams[0]
                let uploadCheck = await tcsIpfs.uploadDataBase(testCase, [data], testCase.expectedResult)
                testCase.actualResult.push(uploadCheck.actualResult)
                if(testCase.expectedResult.needPass){
                    let uploadResponse = uploadCheck.actualResult
                    let hashAarray = []
                    uploadResponse.result.forEach((result)=>{
                        hashAarray.push(result.ipfs_hash)
                    })
                    let rawDatas = [data]
                    let downloadCheck = await tcsIpfs.downloadDataBase(testCase, hashAarray, rawDatas, createExpecteResult(true))
                    testCase.actualResult.push(downloadCheck.actualResult)
                    doneCount++

                    if(doneCount == count){
                        resolve(testCase)
                    }
                }
            }
        })
    },

    checkUploadData: function(testCase, check){
        let needPass = check.expectedResult.needPass
        let response = check.actualResult
        framework.checkResponse(needPass, response)
        if(needPass){
            expect(response).to.be.jsonSchema(schema.UPLOAD_DATA_SCHEMA)
            //check size
            let results = response.result
            let rawParams = check.params
            expect(results.length).to.be.equal(rawParams.length)
            let count = rawParams.length
            for(let i = 0; i < count; i++){
                expect(results[i].size >= rawParams[i].length).to.be.ok
                expect(isHex(results[i].data_hash)).to.be.ok
                expect(results[i].data_hash.length).to.be.equal(HASH_LENGTH)
                expect(results[i].ipfs_hash.length).to.be.equal(IPFS_HASH_LENGTH)
            }
        }
        else{
            framework.checkResponseError(testCase, response.message, check.expectedResult.expectedError)
        }
    },

    //endregion

    //region download data

    testForDownloadData: function(server){
        let testCases = []
        let testCase = {}
        let title = ''
        let txFunctionName = consts.ipfsFunctions.downloadData
        let validData = ipfs_data.data_download

        title = '0010\t单个有效的哈希参数'
        {
            let txParams = [validData.ipfs_hash]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.rawDatas = [validData.raw_data]
            framework.addTestCase(testCases, testCase)
        }

        title = '0020\t单个无效的哈希参数_01：哈希长度不够'
        {
            let txParams = [ipfs_data.bad_data_1.ipfs_hash_too_short]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
            framework.addTestCase(testCases, testCase)
        }

        title = '0020\t单个无效的哈希参数_01：哈希长度过长'
        {
            let txParams = [ipfs_data.bad_data_1.ipfs_hash_too_long]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
            framework.addTestCase(testCases, testCase)
        }

        title = '0030\t单个无效的哈希参数_02：哈希长度没问题，但没有对应的原始数据'
        {
            let txParams = [ipfs_data.deleted_data_1.ipfs_hash]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
            // framework.addTestCase(testCases, testCase)  //todo: this case will cause getting response for long long time.  it is a bug. need be restore after fix.
        }

        title = '0040\t有效和无效混合的哈希参数_01：输入多个哈希参数，其中部分是长度不够或过长的哈希参数，部分是有效的哈希参数'
        {
            let txParams = [validData.ipfs_hash, ipfs_data.bad_data_1.ipfs_hash_too_short, ipfs_data.bad_data_1.ipfs_hash_too_long]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
            framework.addTestCase(testCases, testCase)
        }

        title = '0050\t有效和无效混合的哈希参数_02：输入多个哈希参数，其中部分是没有对应原始数据的哈希参数，部分是有效的哈希参数'
        {
            let txParams = [validData.ipfs_hash, ipfs_data.deleted_data_1.ipfs_hash]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
            // framework.addTestCase(testCases, testCase) //todo: this case will cause getting response for long long time.  it is a bug. need be restore after fix.
        }

        title = '0060\t哈希参数最多个数测试：输入多个有效的哈希参数（个数可逐渐增加），测试哈希参数的个数是否有上限'
        {
            let count = 100
            let txParams = []
            let data = validData
            for(let i = 0; i < count; i++){
                txParams.push(data.ipfs_hash)
            }
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.rawDatas = []
            for(let i = 0; i < count; i++){
                testCase.rawDatas.push(data.raw_data)
            }
            framework.addTestCase(testCases, testCase)
        }

        title = '0070\t多个有效的哈希参数：输入多个有效的哈希参数'
        {
            let txParams = []
            let poem = ipfs_data.poem_1
            poem.forEach((data)=>{
                txParams.push(data.ipfs_hash)
            })
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.rawDatas = []
            poem.forEach((data)=>{
                testCase.rawDatas.push(data.raw_data)
            })
            framework.addTestCase(testCases, testCase)
        }

        title = '0070\t多个有效的哈希参数：输入多个有效但重复的哈希参数'
        {
            let txParams = [validData.ipfs_hash, validData.ipfs_hash, validData.ipfs_hash, ]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.expectedResult = createExpecteResult(true)
            testCase.rawDatas = [validData.raw_data, validData.raw_data, validData.raw_data,]
            framework.addTestCase(testCases, testCase)
        }

        return testCases
    },

    executeForDownloadData: function(testCase){
        return new Promise(async function(resolve){
            testCase.hasExecuted = true
            let downloadCheck = await tcsIpfs.downloadDataBase(testCase, testCase.txParams, testCase.rawDatas, testCase.expectedResult)
            testCase.actualResult.push(downloadCheck.actualResult)
            resolve(testCase)
        })
    },

    checkDownloadData: function(testCase, check){
        let needPass = check.expectedResult.needPass
        let response = check.actualResult
        framework.checkResponse(needPass, response)
        if(needPass){
            expect(response).to.be.jsonSchema(schema.DOWNLOAD_DATA_SCHEMA)
            //compare data
            let rawDatas = check.rawDatas
            let results = response.result
            expect(results.length).to.be.equal(rawDatas.length)
            let count = rawDatas.length
            logger.debug('Total ' + count + ' datas need be checked!')
            for(let i = 0; i < count; i++){
                let asc2 = hex2Ascii(results[i])
                if(asc2 != rawDatas[i]){
                    let utf8 = hex2Utf8(results[i])
                    expect(utf8 == rawDatas[i]).to.be.ok
                }
                // expect(hex2Ascii(results[i])).to.be.equal(rawDatas[i])
            }
        }
        else{
            framework.checkResponseError(testCase, response.message, check.expectedResult.expectedError)
        }
    },

    //endregion

    //region remove data

    testForRemoveData: function(server){
        let testCases = []
        let testCase = {}
        let title = ''
        let txFunctionName = consts.ipfsFunctions.removeData
        let validData = ipfs_data.data_remove

        title = '0010\t单个有效的哈希参数'
        {
            let txParams = [validData.ipfs_hash]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.uploadParams = [validData.raw_data]
            testCase.executeFunction = executeForRemoveDataWithPreparation
            framework.addTestCase(testCases, testCase)
        }

        title = '0020\t单个无效的哈希参数_01：哈希长度不够'
        {
            let txParams = [ipfs_data.bad_data_1.ipfs_hash_too_short]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
            framework.addTestCase(testCases, testCase)
        }

        title = '0020\t单个无效的哈希参数_01：哈希长度过长'
        {
            let txParams = [ipfs_data.bad_data_1.ipfs_hash_too_long]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
            framework.addTestCase(testCases, testCase)
        }

        title = '0030\t单个无效的哈希参数_02：哈希长度没问题，但没有对应的原始数据'
        {
            let txParams = [ipfs_data.deleted_data_1.ipfs_hash]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.expectedResult = createExpecteResult(false, true, 'blockstore: block not found')
            framework.addTestCase(testCases, testCase)
        }

        title = '0040\t有效和无效混合的哈希参数_01：输入多个哈希参数，其中部分是长度不够或过长的哈希参数，部分是有效的哈希参数'
        {
            let txParams = [validData.ipfs_hash, ipfs_data.bad_data_1.ipfs_hash_too_short, ipfs_data.bad_data_1.ipfs_hash_too_long]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.uploadParams = [validData.raw_data]
            testCase.executeFunction = executeForRemoveDataWithPreparation
            testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
            framework.addTestCase(testCases, testCase)
        }

        title = '0050\t有效和无效混合的哈希参数_02：输入多个哈希参数，其中部分是没有对应原始数据的哈希参数，部分是有效的哈希参数'
        {
            let txParams = [validData.ipfs_hash, ipfs_data.deleted_data_1.ipfs_hash]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.uploadParams = [validData.raw_data]
            testCase.executeFunction = executeForRemoveDataWithPreparation
            testCase.expectedResult = createExpecteResult(false, true, 'blockstore: block not found')
            framework.addTestCase(testCases, testCase)
        }

        title = '0060\t有效和无效混合的哈希参数_03：输入多个哈希参数，其中部分哈希参数重复'
        {
            let txParams = [validData.ipfs_hash, validData.ipfs_hash]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.uploadParams = [validData.raw_data]
            testCase.executeFunction = executeForRemoveDataWithPreparation
            testCase.expectedResult = createExpecteResult(false, true, 'blockstore: block not found')
            framework.addTestCase(testCases, testCase)
        }

        title = '0070\t哈希参数最多个数测试：输入多个有效的哈希参数（个数可逐渐增加），测试哈希参数的个数是否有上限'
        {
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, null)
            testCase.testCount = 30
            testCase.executeFunction = executeForRemoveDataInBatch
            framework.addTestCase(testCases, testCase)
        }

        title = '0080\t多个有效的哈希参数：输入多个有效的哈希参数'
        {
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, null)
            testCase.testCount = 10
            testCase.executeFunction = executeForRemoveDataInBatch
            framework.addTestCase(testCases, testCase)
        }

        return testCases
    },

    executeForRemoveDataWithPreparation: function(testCase){  //upload data to make sure there is data can be removed.
        return new Promise(async function(resolve){
            testCase.hasExecuted = true
            let uploadCheck = await tcsIpfs.uploadDataBase(testCase, testCase.uploadParams, createExpecteResult(true))
            testCase.actualResult.push(uploadCheck.actualResult)
            let uploadResponse = uploadCheck.actualResult
            let hashAarray = []
            uploadResponse.result.forEach((result)=>{
                hashAarray.push(result.ipfs_hash)
            })
            let removeCheck = await tcsIpfs.removeDataBase(testCase, testCase.txParams, testCase.expectedResult)
            testCase.actualResult.push(removeCheck.actualResult)
            resolve(testCase)
        })
    },

    executeForRemoveDataInBatch: function(testCase){
        return new Promise(async function(resolve){
            testCase.hasExecuted = true
            let count = testCase.testCount
            let dataArray = []
            let txt = (new Date()).toTimeString()
            for(let i = 0; i < count; i++){
                dataArray.push(i.toString() + '. ' + txt)
            }
            let uploadCheck = await tcsIpfs.uploadDataBase(testCase, dataArray, createExpecteResult(true))
            testCase.actualResult.push(uploadCheck.actualResult)
            let uploadResponse = uploadCheck.actualResult
            testCase.txParams = []
            uploadResponse.result.forEach((result)=>{
                testCase.txParams.push(result.ipfs_hash)
            })
            let removeCheck = await tcsIpfs.removeDataBase(testCase, testCase.txParams, testCase.expectedResult)
            testCase.actualResult.push(removeCheck.actualResult)
            resolve(testCase)
        })
    },

    executeForRemoveData: function(testCase){
        return new Promise(async function(resolve){
            testCase.hasExecuted = true
            let removeCheck = await tcsIpfs.removeDataBase(testCase, testCase.txParams, testCase.expectedResult)
            testCase.actualResult.push(removeCheck.actualResult)
            resolve(testCase)
        })
    },

    checkRemoveData: function(testCase, check){
        let needPass = check.expectedResult.needPass
        let response = check.actualResult
        framework.checkResponse(needPass, response)
        if(needPass){
            expect(response).to.be.jsonSchema(schema.REMOVE_DATA_SCHEMA)
            //compare data
            let hashes = check.params
            let results = response.result
            expect(results.length).to.be.equal(hashes.length)
            let count = hashes.length
            logger.debug('Total ' + count + ' hashes need be checked!')
            for(let i = 0; i < count; i++){
                expect(results[i]).to.be.equal(hashes[i])
                expect(results[i].length).to.be.equal(IPFS_HASH_LENGTH)
            }
        }
        else{
            framework.checkResponseError(testCase, response.message, check.expectedResult.expectedError)
        }
    },

    //endregion

    //region pin data

    testForPinData: function(server){
        let testCases = []
        let testCase = {}
        let title = ''
        let txFunctionName = consts.ipfsFunctions.pinData
        let validData = ipfs_data.data_pin

        title = '0010\t单个有效的哈希参数'
        {
            let txParams = [validData.ipfs_hash]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.uploadParams = [validData.raw_data]
            testCase.executeFunction = executeForPinDataWithPreparation
            framework.addTestCase(testCases, testCase)
        }

        title = '0020\t单个无效的哈希参数_01：哈希长度不够'
        {
            let txParams = [ipfs_data.bad_data_1.ipfs_hash_too_short]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
            framework.addTestCase(testCases, testCase)
        }

        title = '0020\t单个无效的哈希参数_01：哈希长度过长'
        {
            let txParams = [ipfs_data.bad_data_1.ipfs_hash_too_long]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
            framework.addTestCase(testCases, testCase)
        }

        title = '0030\t单个无效的哈希参数_02：哈希长度没问题，但没有对应的原始数据'
        {
            let txParams = [ipfs_data.deleted_data_1.ipfs_hash]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.expectedResult = createExpecteResult(false, true, 'blockstore: block not found')
            //framework.addTestCase(testCases, testCase)  //todo: this case will cause getting response for long long time.  it is a bug. need be restore after fix.
        }

        title = '0040\t有效和无效混合的哈希参数_01：输入多个哈希参数，其中部分是长度不够或过长的哈希参数，部分是有效的哈希参数'
        {
            let txParams = [validData.ipfs_hash, ipfs_data.bad_data_1.ipfs_hash_too_short, ipfs_data.bad_data_1.ipfs_hash_too_long]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.uploadParams = [validData.raw_data]
            testCase.executeFunction = executeForPinDataWithPreparation
            testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
            framework.addTestCase(testCases, testCase)
        }

        title = '0050\t有效和无效混合的哈希参数_02：输入多个哈希参数，其中部分是没有对应原始数据的哈希参数，部分是有效的哈希参数'
        {
            let txParams = [validData.ipfs_hash, ipfs_data.deleted_data_1.ipfs_hash]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.uploadParams = [validData.raw_data]
            testCase.executeFunction = executeForPinDataWithPreparation
            testCase.expectedResult = createExpecteResult(false, true, 'blockstore: block not found')
            // framework.addTestCase(testCases, testCase)  //todo: this case will cause getting response for long long time.  it is a bug. need be restore after fix.
        }

        title = '0060\t哈希参数最多个数测试：输入多个有效的哈希参数（个数可逐渐增加），测试哈希参数的个数是否有上限'
        {
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, null)
            testCase.testCount = 30
            testCase.executeFunction = executeForRemoveDataInBatch
            framework.addTestCase(testCases, testCase)
        }

        title = '0070\t多个有效的哈希参数：输入多个有效的哈希参数'
        {
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, null)
            testCase.testCount = 10
            testCase.executeFunction = executeForRemoveDataInBatch
            framework.addTestCase(testCases, testCase)
        }

        title = '0070\t有效和无效混合的哈希参数_03：输入多个哈希参数，其中部分哈希参数重复'
        {
            let txParams = [validData.ipfs_hash, validData.ipfs_hash]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.uploadParams = [validData.raw_data, validData.raw_data]
            testCase.executeFunction = executeForPinDataWithPreparation
            framework.addTestCase(testCases, testCase)
        }

        return testCases
    },

    executeForPinDataWithPreparation: function(testCase){
        return new Promise(async function(resolve){
            testCase.hasExecuted = true
            let uploadCheck = await tcsIpfs.uploadDataBase(testCase, testCase.uploadParams, createExpecteResult(true))
            testCase.actualResult.push(uploadCheck.actualResult)
            let uploadResponse = uploadCheck.actualResult
            let hashAarray = []
            uploadResponse.result.forEach((result)=>{
                hashAarray.push(result.ipfs_hash)
            })
            let pinCheck = await tcsIpfs.pinDataBase(testCase, testCase.txParams, testCase.expectedResult)
            testCase.actualResult.push(pinCheck.actualResult)
            resolve(testCase)
        })
    },

    executeForRemoveDataInBatch: function(testCase){
        return new Promise(async function(resolve){
            testCase.hasExecuted = true
            let count = testCase.testCount
            let dataArray = []
            let txt = (new Date()).toTimeString()
            for(let i = 0; i < count; i++){
                dataArray.push(i.toString() + '. ' + txt)
            }
            let uploadCheck = await tcsIpfs.uploadDataBase(testCase, dataArray, createExpecteResult(true))
            testCase.actualResult.push(uploadCheck.actualResult)
            let uploadResponse = uploadCheck.actualResult
            testCase.txParams = []
            uploadResponse.result.forEach((result)=>{
                testCase.txParams.push(result.ipfs_hash)
            })
            let pinCheck = await tcsIpfs.pinDataBase(testCase, testCase.txParams, testCase.expectedResult)
            testCase.actualResult.push(pinCheck.actualResult)
            resolve(testCase)
        })
    },

    executeForPinData: function(testCase){
        testCase.hasExecuted = true
        return tcsIpfs.pinDataBase(testCase, testCase.txParams, testCase.expectedResult)
    },

    checkPinData: function(testCase, check){
        checkRemoveData(testCase, check)
    },

    //endregion

    //region unpin data

    testForUnpinData: function(server){
        let testCases = []
        let testCase = {}
        let title = ''
        let txFunctionName = consts.ipfsFunctions.unpinData
        let validData = ipfs_data.data_unpin

        title = '0010\t单个有效的哈希参数'
        {
            let txParams = [validData.ipfs_hash]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.uploadParams = [validData.raw_data]
            testCase.executeFunction = executeForUnpinDataWithPreparation
            framework.addTestCase(testCases, testCase)
        }

        title = '0020\t单个无效的哈希参数_01：哈希长度不够'
        {
            let txParams = [ipfs_data.bad_data_1.ipfs_hash_too_short]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
            framework.addTestCase(testCases, testCase)
        }

        title = '0020\t单个无效的哈希参数_01：哈希长度过长'
        {
            let txParams = [ipfs_data.bad_data_1.ipfs_hash_too_long]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
            framework.addTestCase(testCases, testCase)
        }

        title = '0030\t单个无效的哈希参数_02：哈希长度没问题，但没有对应的原始数据'
        {
            let txParams = [ipfs_data.deleted_data_1.ipfs_hash]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.expectedResult = createExpecteResult(false, true, 'blockstore: block not found')
            //framework.addTestCase(testCases, testCase)  //todo: this case will cause getting response for long long time.  it is a bug. need be restore after fix.
        }

        title = '0040\t有效和无效混合的哈希参数_01：输入多个哈希参数，其中部分是长度不够或过长的哈希参数，部分是有效的哈希参数'
        {
            let txParams = [validData.ipfs_hash, ipfs_data.bad_data_1.ipfs_hash_too_short, ipfs_data.bad_data_1.ipfs_hash_too_long]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.uploadParams = [validData.raw_data]
            testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
            testCase.executeFunction = executeForUnpinDataWithPreparation
            framework.addTestCase(testCases, testCase)
        }

        title = '0050\t有效和无效混合的哈希参数_02：输入多个哈希参数，其中部分是没有对应原始数据的哈希参数，部分是有效的哈希参数'
        {
            let txParams = [validData.ipfs_hash, ipfs_data.deleted_data_1.ipfs_hash]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.uploadParams = [validData.raw_data]
            testCase.expectedResult = createExpecteResult(false, true, 'blockstore: block not found')
            testCase.executeFunction = executeForUnpinDataWithPreparation
            // framework.addTestCase(testCases, testCase)  //todo: this case will cause getting response for long long time.  it is a bug. need be restore after fix.
        }

        title = '0060\t哈希参数最多个数测试：输入多个有效的哈希参数（个数可逐渐增加），测试哈希参数的个数是否有上限'
        {
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, null)
            testCase.testCount = 30
            testCase.executeFunction = executeForUnpinDataInBatch
            framework.addTestCase(testCases, testCase)
        }

        title = '0070\t多个有效的哈希参数：输入多个有效的哈希参数'
        {
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, null)
            testCase.testCount = 10
            testCase.executeFunction = executeForUnpinDataInBatch
            framework.addTestCase(testCases, testCase)
        }

        return testCases
    },

    executeForUnpinDataWithPreparation: function(testCase){
        return new Promise(async function(resolve){
            testCase.hasExecuted = true
            let uploadCheck = await tcsIpfs.uploadDataBase(testCase, testCase.uploadParams, createExpecteResult(true))
            testCase.actualResult.push(uploadCheck.actualResult)
            let uploadResponse = uploadCheck.actualResult
            let hashAarray = []
            uploadResponse.result.forEach((result)=>{
                hashAarray.push(result.ipfs_hash)
            })
            let pinCheck = await tcsIpfs.pinDataBase(testCase, hashAarray, createExpecteResult(true))
            testCase.actualResult.push(pinCheck.actualResult)
            let unpinCheck = await tcsIpfs.unpinDataBase(testCase, testCase.txParams, testCase.expectedResult)
            testCase.actualResult.push(unpinCheck.actualResult)
            resolve(testCase)
        })
    },

    executeForUnpinDataInBatch: function(testCase){
        return new Promise(async function(resolve){
            testCase.hasExecuted = true
            let count = testCase.testCount
            let dataArray = []
            let txt = testCase.title + ' - ' + (new Date()).toTimeString()
            for(let i = 0; i < count; i++){
                dataArray.push(i.toString() + '. ' + txt)
            }
            let uploadCheck = await tcsIpfs.uploadDataBase(testCase, dataArray, createExpecteResult(true))
            let uploadResponse = uploadCheck.actualResult
            let hashAarray = []
            uploadResponse.result.forEach((result)=>{
                hashAarray.push(result.ipfs_hash)
            })
            let pinCheck = await tcsIpfs.pinDataBase(testCase, hashAarray, createExpecteResult(true))
            let unpinCheck = await tcsIpfs.unpinDataBase(testCase, hashAarray, testCase.expectedResult)
            testCase.actualResult.push(uploadCheck.actualResult)
            testCase.actualResult.push(pinCheck.actualResult)
            testCase.actualResult.push(unpinCheck.actualResult)
            resolve(testCase)
        })
    },

    executeForUnpinData: function(testCase){
        testCase.hasExecuted = true
        return tcsIpfs.unpinDataBase(testCase, testCase.txParams, testCase.expectedResult)
    },

    checkUnpinData: function(testCase, check){
        checkRemoveData(testCase, check)
    },

    //endregion

    //region upload file

    testForUploadFile: function(server){
        let testCases = []
        let testCase = {}
        let title = ''
        let txFunctionName = consts.ipfsFunctions.uploadFile
        let url = server.mode.initParams.url + '/' + consts.ipfsFunctions.uploadFile
        let testFilePath = commonPaths.ipfs_test_files_path

        title = '0010\t上传存在的文件：通过API接口上传文件，指定的文件存在'
        {
            let testFile = ipfs_data.uploadFile_1
            let fileName = testFilePath + testFile.name
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, fileName)
            testCase.url = url
            testCase.rawDatas = testFile
            framework.addTestCase(testCases, testCase)
        }

        title = '0030\t不同文件类型上传测试：上传不同类型的文件'
        {
            let testFile = ipfs_data.uploadImage_1
            let fileName = testFilePath + testFile.name
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, fileName)
            testCase.url = url
            testCase.rawDatas = testFile
            framework.addTestCase(testCases, testCase)
        }

        return testCases
    },

    executeForUploadFile: function(testCase){
        return new Promise(async function(resolve){
            testCase.hasExecuted = true
            let check = await tcsIpfs.uploadFileBase(testCase, testCase.txParams, testCase.expectedResult)
            testCase.actualResult.push(check.actualResult)
            resolve(testCase)
        })
    },

    checkUploadFile: function(testCase, check){
        let needPass = check.expectedResult.needPass
        let response = check.actualResult
        framework.checkResponse(needPass, response)
        if(needPass){
            expect(response).to.be.jsonSchema(schema.UPLOAD_FILE_SCHEMA)
            let rawFileName = testCase.txParams
            let file = response.result[0]
            expect(rawFileName).to.contains(file.name)
            let rawFile = testCase.rawDatas
            expect(file.data_hash).to.be.equal(rawFile.data_hash)
            expect(file.ipfs_hash).to.be.equal(rawFile.ipfs_hash)
            expect(file.name).to.be.equal(rawFile.name)
            expect(file.size).to.be.equal(rawFile.size)
        }
        else{
            framework.checkResponseError(testCase, response.message, check.expectedResult.expectedError)
        }
    },

    //endregion

    //region download file

    testForDownloadFile: function(server){
        let testCases = []
        let testCase = {}
        let title = ''
        let txFunctionName = consts.ipfsFunctions.downloadFile
        let validData = ipfs_data.data_download

        title = '0010\t有效的哈希参数：哈希参数有效，有对应的数据'
        {
            let txParams = [validData.ipfs_hash]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.rawDatas = validData.raw_data
            framework.addTestCase(testCases, testCase)
        }

        title = '0020\t单个无效的哈希参数_01：哈希长度不够'
        {
            let txParams = [ipfs_data.bad_data_1.ipfs_hash_too_short]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.expectedResult = createExpecteResult(false, false, 'selected encoding not supported')
            framework.addTestCase(testCases, testCase)
        }

        title = '0020\t单个无效的哈希参数_01：哈希长度过长'
        {
            let txParams = [ipfs_data.bad_data_1.ipfs_hash_too_long]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.expectedResult = createExpecteResult(false, false, 'selected encoding not supported')
            framework.addTestCase(testCases, testCase)
        }

        title = '0030\t单个无效的哈希参数_02：哈希长度没问题，但没有对应的原始数据'
        {
            let txParams = [ipfs_data.deleted_data_1.ipfs_hash]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
            testCase.expectedResult = createExpecteResult(false, false, 'selected encoding not supported')
            // framework.addTestCase(testCases, testCase)  //todo: this case will cause getting response for long long time.  it is a bug. need be restore after fix.
        }

        return testCases
    },

    executeForDownloadFile: function(testCase){
        return new Promise(async function(resolve){
            testCase.hasExecuted = true
            let check = await tcsIpfs.downloadFileBase(testCase, testCase.txParams, testCase.rawDatas, testCase.expectedResult)
            testCase.actualResult.push(check.actualResult)
            resolve(testCase)
        })
    },

    checkDownloadFile: function(testCase, check){
        let needPass = check.expectedResult.needPass
        let response = check.actualResult
        // framework.checkResponse(needPass, response)  //download file response is not json
        if(needPass){
            expect(response).to.be.jsonSchema(schema.DOWNLOAD_FILE_SCHEMA)
            //compare data
            let rawContent = check.rawDatas
            let content = response
            expect(content).to.be.equal(rawContent)
        }
        else{
            framework.checkResponseError(testCase, response.message, check.expectedResult.expectedError)
        }
    },

    //endregion

    //region full process of ipfs

    testForFullProcess: function(server){
        let testCases = []
        let testCase = {}
        let title = ''
        let txFunctionName = consts.ipfsFunctions.uploadData
        let dataArray = []

        title = '0010\t上传数据'
        {
            txFunctionName = consts.ipfsFunctions.uploadData
            dataArray = ['QmUuVfJrQ2mb7F223fUhvpkQ6bjFFM4FaPKnKLLBWMEpBW']
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
            testCase.rawDatas = dataArray
            testCase.rawDownloadDatas = dataArray
            testCase.executeFunction = executeForFullProcessForUploadData
            framework.addTestCase(testCases, testCase)
        }

        title = '0020\t上传文件'
        {
            txFunctionName = consts.ipfsFunctions.uploadFile
            let url = server.mode.initParams.url + '/' + consts.ipfsFunctions.uploadFile
            // let testFilePath = '.\\test\\testData\\testFiles\\'
            let testFilePath = commonPaths.ipfs_test_files_path
            let testFile = ipfs_data.uploadFile_1
            let fileName = testFilePath + testFile.name
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, fileName)
            testCase.url = url
            testCase.rawDatas = testFile
            testCase.rawDownloadDatas = [testFile.raw_data]
            testCase.executeFunction = executeForFullProcessForUploadFile
            framework.addTestCase(testCases, testCase)
        }

        return testCases
    },

    //region steps
    //1.1 upload (data or file)
    //1.2 download (data and file)
    //2.1 upin (should fail)
    //2.2 pin
    //2.3 download (data and file)
    //2.4 remove (should fail)
    //2.5 download (data and file)
    //3.1 unpin
    //3.2 download (data and file)
    //4.1 remove (should success)
    //4.2 remove (should fail)
    //endregion

    executeForFullProcessForUploadData: function(testCase){
        return new Promise(async function(resolve){
            testCase.hasExecuted = true

            //step1.1 upload
            let check = await tcsIpfs.uploadDataBase(testCase, testCase.txParams, createExpecteResult(true))
            check.title = 'Step1.1: upload data successfully'
            testCase.actualResult.push(check.actualResult)

            await executeForFullProcess(testCase)

            resolve(testCase)
        })
    },

    executeForFullProcessForUploadDataInOneCase: function(testCase){
        return new Promise(async function(resolve){
            testCase.hasExecuted = true
            let count = testCase.testCount
            count = count != null ? count : 1
            let doneCount = 0;
            for(let i = 0; i < count; i++){
                //step1.1 upload
                let check = await tcsIpfs.uploadDataBase(testCase, testCase.txParams, createExpecteResult(true))
                check.title = 'Step1.1: upload data successfully'
                testCase.actualResult.push(check.actualResult)
                await executeForFullProcess(testCase)
                doneCount++
                if(doneCount == count){
                    resolve(testCase)
                }
            }
        })
    },

    executeForFullProcessForUploadFile: function(testCase){
        return new Promise(async function(resolve){
            testCase.hasExecuted = true

            //step1.1 upload
            let check = await tcsIpfs.uploadFileBase(testCase, testCase.txParams, createExpecteResult(true))
            check.title = 'Step1.1: upload file successfully'
            testCase.actualResult.push(check.actualResult)

            await executeForFullProcess(testCase)

            resolve(testCase)
        })
    },

    executeForFullProcess: function(testCase){
        return new Promise(async function(resolve){
            let check

            //prepare
            let uploadCheck = testCase.checks[0]
            let uploadResponse = uploadCheck.actualResult
            let hashAarray = []
            uploadResponse.result.forEach((result)=>{
                hashAarray.push(result.ipfs_hash)
            })
            let rawDatas = testCase.rawDownloadDatas

            //step1.2 download
            await executeForDownloads(testCase, hashAarray, rawDatas, createExpecteResult(true), 'Step1.2')

            //step2.1 unpin
            check = await tcsIpfs.unpinDataBase(testCase, hashAarray, createExpecteResult(false, true, 'not pinned'))
            check.title = 'Step2.1: unpin data failed before pin'
            testCase.actualResult.push(check.actualResult)

            //step2.2 pin
            check = await tcsIpfs.pinDataBase(testCase, hashAarray, createExpecteResult(true))
            check.title = 'Step2.2: pin data successfully'
            testCase.actualResult.push(check.actualResult)

            //step2.3 download
            await executeForDownloads(testCase, hashAarray, rawDatas, createExpecteResult(true), 'Step2.3')

            //step2.4 fail to remove
            check = await tcsIpfs.removeDataBase(testCase, hashAarray, createExpecteResult(false, true, 'pinned: direct'))
            check.title = 'Step2.4: fail to remove data'
            testCase.actualResult.push(check.actualResult)

            //step2.5 download
            await executeForDownloads(testCase, hashAarray, rawDatas, createExpecteResult(true), 'Step2.5')

            //step3.1 unpin
            check = await tcsIpfs.unpinDataBase(testCase, hashAarray, createExpecteResult(true))
            check.title = 'Step2.2: unpin data successfully'
            testCase.actualResult.push(check.actualResult)

            //step3.2 download
            await executeForDownloads(testCase, hashAarray, rawDatas, createExpecteResult(true), 'Step3.2')

            //step4.1 remove successfully
            check = await tcsIpfs.removeDataBase(testCase, hashAarray, createExpecteResult(true))
            check.title = 'Step4.1: remove data successfully'
            testCase.actualResult.push(check.actualResult)

            //step4.2 fail to remove
            check = await tcsIpfs.removeDataBase(testCase, hashAarray, createExpecteResult(false, true, 'blockstore: block not found'))
            check.title = 'Step4.2: fail to remove data'
            testCase.actualResult.push(check.actualResult)

            resolve(testCase)
        })
    },

    executeForDownloads: function(testCase, hashAarray, rawDatas, expectedResult, stepNumber){
        return new Promise(async(resolve)=>{
            let check

            check = await tcsIpfs.downloadDataBase(testCase, hashAarray, rawDatas, expectedResult)
            check.title = stepNumber + ': download data successfully after upload'
            testCase.actualResult.push(check.actualResult)

            let count = hashAarray.length
            let doneCount = 0
            for(let i = 0; i < count; i++){
                check = await tcsIpfs.downloadFileBase(testCase, [hashAarray[i]], rawDatas[i], expectedResult)
                check.title = stepNumber + ': download file successfully after upload for data[' + i + ']'
                testCase.actualResult.push(check.actualResult)
                doneCount++
                if(doneCount == count){
                    resolve(testCase)
                }
            }
        })
    },

    //endregion

    //region pressure test
    pressureTestForUploadData: function(server){
        let testCases = []
        let testCase = {}
        let title = ''
        let txFunctionName = consts.ipfsFunctions.uploadData
        let count = 60

        let txt = (new Date()).toTimeString()
        for(let i = 1; i <= count; i++){
            let data = i.toString() + '. ' + txt
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, [data])
            testCase.title = '0010\t测试UploadData: ' + i + '/' + count
            framework.addTestCase(testCases, testCase)
        }

        return testCases
    },

    pressureTestForUploadDataInOneCase: function(server){
        let testCases = []
        let testCase = {}
        let title = ''
        let txFunctionName = consts.ipfsFunctions.uploadData

        let dataArray = [(new Date()).toTimeString()]
        testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
        testCase.executeFunction = executeForpressureTestForUploadData
        testCase.testCount = 100
        testCase.title = '0020\t测试' + testCase.testCount + '个uploadData，在单个case内执行'
        framework.addTestCase(testCases, testCase)
        return testCases
    },

    pressureTestForFullProcess: function(server){
        let testCases = []
        let testCase = {}
        let title = ''
        let txFunctionName = consts.ipfsFunctions.uploadData
        let count = 30

        let txt = (new Date()).toTimeString()
        for(let i = 1; i <= count; i++){
            let dataArray = [i.toString() + '. ' + txt]
            testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
            testCase.rawDatas = dataArray
            testCase.rawDownloadDatas = dataArray
            testCase.executeFunction = executeForFullProcessForUploadData
            testCase.title = '0010\t测试FullProcess: ' + i + '/' + count
            framework.addTestCase(testCases, testCase)
        }

        return testCases
    },

    pressureTestForFullProcessInOneCase: function(server){
        let testCases = []
        let testCase = {}
        let title = ''
        let txFunctionName = consts.ipfsFunctions.uploadData

        let dataArray = ['QmUuVfJrQ2mb7F223fUhvpkQ6bjFFM4FaPKnKLLBWMEpBW']
        testCase = tcsIpfs.createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
        testCase.rawDatas = dataArray
        testCase.rawDownloadDatas = dataArray
        testCase.executeFunction = executeForFullProcessForUploadDataInOneCase
        testCase.testCount = 50
        testCase.title = '0010\t测试' + testCase.testCount + '个FullProcess，在单个case内执行'
        framework.addTestCase(testCases, testCase)

        return testCases
    },
    //endregion

//endregion

}