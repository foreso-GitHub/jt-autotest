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
//endregion
//endregion

module.exports = tcsGetTxCount = {

    //region tx count check

    testForGetBlockTransactionCountByHash: function(server, describeTitle){
        let testCases = []
        let functionName = consts.rpcFunctions.getBlockTransactionCountByHash

        let title = '0010\t查询有效区块哈希'
        let hash = server.mode.txs.block.blockHash
        let needPass = true
        let expectedError = ''
        let testCase = tcsGetTxCount.createSingleTestCaseForGetBlockTransactionCount(server, title, functionName, hash, needPass, expectedError)
        framework.addTestScript(testCases, testCase)

        title = '0020\t无效交易哈希：不存在的hash'
        hash = 'B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A'
        needPass = false
        expectedError = framework.getError(140, 't find block')
        testCase = tcsGetTxCount.createSingleTestCaseForGetBlockTransactionCount(server, title, functionName, hash, needPass, expectedError)
        framework.addTestScript(testCases, testCase)

        title = '0020\t无效交易哈希：hash长度超过标准'
        hash = 'B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A1F'
        needPass = false
        expectedError = framework.getError(-189, 'index out of range')
        testCase = tcsGetTxCount.createSingleTestCaseForGetBlockTransactionCount(server, title, functionName, hash, needPass, expectedError)
        framework.addTestScript(testCases, testCase)

        framework.testTestScripts(server, describeTitle, testScripts)
    },

    testForGetBlockTransactionCountByNumber: function(server, describeTitle){
        let testCases = []
        let functionName = consts.rpcFunctions.getBlockTransactionCountByNumber

        let title = '0010\t查询有效区块编号'
        let blockNumber = server.mode.txs.block.blockNumber
        let needPass = true
        let expectedError = ''
        let testCase = tcsGetTxCount.createSingleTestCaseForGetBlockTransactionCount(server, title, functionName, blockNumber, needPass, expectedError)
        framework.addTestScript(testCases, testCase)

        title = '0020\t无效交易编号：9999999'
        blockNumber = '999999999'
        needPass = false
        expectedError = framework.getError(140, 't find block')
        testCase = tcsGetTxCount.createSingleTestCaseForGetBlockTransactionCount(server, title, functionName, blockNumber, needPass, expectedError)
        framework.addTestScript(testCases, testCase)

        title = '0020\t无效交易编号：负数'
        blockNumber = '-100'
        needPass = false
        expectedError = framework.getError(140, 'invalid syntax')
        testCase = tcsGetTxCount.createSingleTestCaseForGetBlockTransactionCount(server, title, functionName, blockNumber, needPass, expectedError)
        framework.addTestScript(testCases, testCase)

        title = '0020\t无效交易编号：乱码'
        blockNumber = 'addeew'
        needPass = false
        expectedError = framework.getError(140, 'invalid syntax')
        testCase = tcsGetTxCount.createSingleTestCaseForGetBlockTransactionCount(server, title, functionName, blockNumber, needPass, expectedError)
        framework.addTestScript(testCases, testCase)

        framework.testTestScripts(server, describeTitle, testScripts)
    },

    createSingleTestCaseForGetBlockTransactionCount: function(server, title, functionName, hashOrNumber, needPass, expectedError){

        let txParams = []
        txParams.push(hashOrNumber)

        let expectedResult = {}
        expectedResult.needPass = needPass
        expectedResult.isErrorInResult = true
        expectedResult.expectedError = expectedError

        let testCase = framework.createTestCase(
            title,
            server,
            functionName,
            txParams,
            null,
            framework.executeTestActionForGet,
            tcsGetTxCount.checkBlockTransactionCount,
            expectedResult,
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        return testCase
    },

    checkBlockTransactionCount: function(testCase){
        let response = action.actualResult
        let needPass = testCase.expectedResult.needPass
        framework.checkResponse(response)
        if(needPass){
            let txCount = testCase.server.mode.txs.block.txCountInBlock
            expect(txCount).to.equal(response.result)
        }
        else{
            framework.checkResponseError(action, action.expectedResults[0], response)
        }
    },

    //endregion

    //region jt_getTransactionCount

    testForGetTransactionCount: function(server, describeTitle){
        let testCases = []
        let from = server.mode.addresses.nickNameSender
        let to = server.mode.addresses.nickNameReceiver
        let tag = null

        tcsGetTxCount.testGroupForGetTransactionCount(server, describeTitle + '_无区块参数', from, to, tag)
        // tcsGetTxCount.testGroupForGetTransactionCount(server, describeTitle + '_区块参数:100', from, to, 100)

        framework.testTestScripts(server, describeTitle, testScripts)
    },

    testGroupForGetTransactionCount: function(server, describeTitle, from, to, tag){
        let testCases = []
        let addressOrName = from.address

        let title = '0010\t查询有效地址'
        {
            addressOrName = from.address
            let needSendTx = true
            let needPass = true
            let expectedError = ''
            let testCase = tcsGetTxCount.createSingleTestCaseForGetTransactionCount(server, title, addressOrName, tag, needSendTx, needPass, expectedError)
            testCase.from = addressOrName
            testCase.secret = from.secret
            testCase.to = to.address
            testCase.subCheck = function(testCase){
                expect(testCase.actualResult[0].result).to.least(1)
                expect(testCase.countAfterSend).to.equal(testCase.countBeforeSend + 1)
            }
            testCases.push(testCase)
        }

        title = '0011\t查询有效地址: 未激活的地址'
        {
            addressOrName = server.mode.addresses.inactiveAccount1.address
            needSendTx = false
            needPass = true
            expectedError = ''
            testCase = tcsGetTxCount.createSingleTestCaseForGetTransactionCount(server, title, addressOrName, tag, needSendTx, needPass, expectedError)
            testCases.push(testCase)
            testCase.subCheck = function(testCase){
                expect(testCase.actualResult[0].result).to.equal(1)
            }
        }

        title = '0020\t查询有效昵称'
        {
            addressOrName = from.nickName
            needSendTx = true
            needPass = true
            expectedError = ''
            testCase = tcsGetTxCount.createSingleTestCaseForGetTransactionCount(server, title, addressOrName, tag, needSendTx, needPass, expectedError)
            testCase.from = addressOrName
            testCase.secret = from.secret
            testCase.to = to.address
            testCase.needSendTx = true
            testCase.subCheck = function(testCase){
                expect(testCase.actualResult[0].result).to.least(1)
                expect(testCase.countAfterSend).to.equal(testCase.countBeforeSend + 1)
            }
            testCases.push(testCase)
        }

        title = '0030\t查询无效地址: 过短的地址'
        {
            addressOrName = 'jnZ7CDuqmj6Pe1KGMdiacfh4aeuXSDj'
            needSendTx = false
            needPass = false
            expectedError = framework.getError(-96, 'Bad account address')
            testCase = tcsGetTxCount.createSingleTestCaseForGetTransactionCount(server, title, addressOrName, tag, needSendTx, needPass, expectedError)
            testCases.push(testCase)
        }

        title = '0031\t查询无效地址: 过长的地址'
        {
            addressOrName = from.address + 'a'
            needPass = false
            expectedError = framework.getError(-96, 'Bad account address')
            testCase = tcsGetTxCount.createSingleTestCaseForGetTransactionCount(server, title, addressOrName, tag, needSendTx, needPass, expectedError)
            testCases.push(testCase)
        }

        title = '0032\t查询无效地址: 格式错误的地址'
        {
            addressOrName = server.mode.addresses.wrongFormatAccount1.address
            needPass = false
            expectedError = framework.getError(-96, 'Bad account address')
            testCase = tcsGetTxCount.createSingleTestCaseForGetTransactionCount(server, title, addressOrName, tag, needSendTx, needPass, expectedError)
            testCases.push(testCase)
        }

        title = '0040\t查询无效昵称: 不存在的昵称'
        {
            addressOrName = server.mode.addresses.inactiveAccount1.nickName
            needPass = false
            expectedError = framework.getError(-96, 'Bad account address')
            testCase = tcsGetTxCount.createSingleTestCaseForGetTransactionCount(server, title, addressOrName, tag, needSendTx, needPass, expectedError)
            testCases.push(testCase)
        }

        framework.testTestScripts(server, describeTitle, testScripts)
    },

    createSingleTestCaseForGetTransactionCount: function(server, title, addressOrName, tag, needSendTx, needPass, expectedError){

        let txParams = []
        txParams.push(addressOrName)
        if(tag) txParams.push(tag)

        let expectedResult = {}
        expectedResult.needPass = needPass
        expectedResult.isErrorInResult = true
        expectedResult.expectedError = expectedError

        let testCase = framework.createTestCase(
            title,
            server,
            consts.rpcFunctions.getTransactionCount,
            txParams,
            null,
            (needSendTx) ? tcsGetTxCount.executeGetTransactionCount : framework.executeTestActionForGet,
            tcsGetTxCount.checkGetTransactionCount,
            expectedResult,
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        return testCase
    },

    executeGetTransactionCount: function(testCase){
        testCase.hasExecuted = true
        return new Promise(async (resolve, reject) => {
            let server = testCase.server
            let response = await server.getResponse(server, consts.rpcFunctions.getTransactionCount, testCase.txParams)
            testCase.countBeforeSend = response.result

            let txParams = await utility.createTxParams(server, testCase.from, testCase.secret, testCase.to, '1')
            await utility.sendTxs(server, txParams, 1)
            await utility.timeout(6000)

            response = await server.getResponse(server, consts.rpcFunctions.getTransactionCount, testCase.txParams)
            testCase.countAfterSend = response.result
            testCase.actualResult.push(response)
            resolve('done')
        })
    },

    checkGetTransactionCount: function(testCase){
        let response = action.actualResult
        let needPass = testCase.expectedResult.needPass
        framework.checkResponse(response)
        if(needPass){
            // let txCount = 1
            // expect(response.result).to.equal(txCount)
            // expect(testCase.countAfterSend).to.equal(testCase.countBeforeSend + 1)
            testCase.subCheck(testCase)
        }
        else{
            framework.checkResponseError(action, action.expectedResults[0], response)
        }
    },
    //endregion

}
