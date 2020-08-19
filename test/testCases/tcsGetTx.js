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
const consts = require('../framework/lib/base/consts')
let utility = require('../framework/testUtility')
//endregion
//endregion

module.exports = tcsGetTx = {

    //region get tx check

    //region get tx by hash
    testForGetTransaction: function(server, describeTitle){
        let testCases = []

        let txs = server.mode.txs

        let title = '0010\t查询有效交易哈希-底层币'
        let hash = txs.tx1.hash
        let needPass = true
        let expectedError = ''
        let testCase = tcsGetTx.createSingleTestCaseForGetTransaction(server, title, hash, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0020\t查询有效交易哈希-token'
        hash = txs.tx_token_CNYT.hash
        testCase = tcsGetTx.createSingleTestCaseForGetTransaction(server, title, hash, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0030\t查询有效交易哈希-memos'
        hash = txs.tx_memo.hash
        testCase = tcsGetTx.createSingleTestCaseForGetTransaction(server, title, hash, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0040\t查询无效交易哈希:数字'
        hash = 1231111
        needPass = false
        //expectedError = 'interface conversion: interface {} is float64, not string'  //new chain
        expectedError = 'invalid tx hash'
        testCase = tcsGetTx.createSingleTestCaseForGetTransaction(server, title, hash, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0040\t查询无效交易哈希:字符串'
        hash = 'data.tx1.hash'
        //expectedError = 'encoding/hex: invalid byte:'
        expectedError = 'invalid tx hash'
        testCase = tcsGetTx.createSingleTestCaseForGetTransaction(server, title, hash, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0040\t查询无效交易哈希:参数为空'
        hash = null
        //expectedError = 'interface conversion: interface {} is nil, not string'
        expectedError = 'invalid tx hash'
        testCase = tcsGetTx.createSingleTestCaseForGetTransaction(server, title, hash, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0040\t无效交易哈希：不存在的hash'
        hash = 'B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A'
        //expectedError = 'can\'t find transaction'
        expectedError = 'Transaction not found.'
        testCase = tcsGetTx.createSingleTestCaseForGetTransaction(server, title, hash, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        title = '0040\t无效交易哈希：hash长度超过标准'
        hash = 'B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A1F'
        //expectedError = 'index out of range'
        expectedError = 'invalid tx hash'
        testCase = tcsGetTx.createSingleTestCaseForGetTransaction(server, title, hash, needPass, expectedError)
        framework.addTestCase(testCases, testCase)

        framework.testTestCases(server, describeTitle, testCases)
    },

    createSingleTestCaseForGetTransaction: function(server, title, hash, needPass, expectedError){

        let functionName = consts.rpcFunctions.getTransactionByHash
        let txParams = []
        txParams.push(hash)

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
            framework.executeTestCaseForGet,
            tcsGetTx.checkTransaction,
            expectedResult,
            restrictedLevel.L2,
            [serviceType.newChain, serviceType.oldChain],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        testCase.checkParams = {}
        testCase.checkParams.hash = hash;

        return testCase
    },

    checkTransaction: function(testCase){
        let response = testCase.actualResult[0]
        let needPass = testCase.expectedResult.needPass
        framework.checkResponse(needPass, response)
        if(needPass){
            // let hash = testCase.txParams[0]
            let hash = testCase.checkParams.hash
            // expect(value.result).to.be.jsonSchema(schema.TX_SCHEMA)
            expect(response.result.hash).to.be.equal(hash)
        }
        else{
            framework.checkResponseError(testCase, response.message, testCase.expectedResult.expectedError)
        }
    },
    //endregion

    //region get tx by index
    testForGetTransactionByIndex: function(server, describeTitle){
        let testCases = []

        let txs = server.mode.txs
        let tx = txs.tx1
        let hash = tx.hash
        let from = tx.Account
        let index = tx.Sequence
        let needPass = true
        let expectedError = ''
        let testCase
        let title

        title = '0010\t查询有效交易哈希-token'
        {
            tx = txs.tx_token_CNYT
            hash = tx.hash
            from = tx.Account
            index = tx.Sequence
            testCase = tcsGetTx.createSingleTestCaseForGetTransactionByIndex(server, title, hash, from, index, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = '0010\t查询有效交易哈希-底层币'
        {
            tx = txs.tx1
            hash = tx.hash
            from = tx.Account
            index = tx.Sequence
            testCase = tcsGetTx.createSingleTestCaseForGetTransactionByIndex(server, title, hash, from, index, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = '0010\t有效的地址，遍历部分有效sequence：'
        {
            tx = txs.tx1
            from = tx.Account
            let lastIndex = 10
            for(let i = 1; i <= lastIndex; i++){
                index = i
                testCase = tcsGetTx.createSingleTestCaseForGetTransactionByIndex(server, title + index,
                    hash, from, index, needPass, expectedError)
                testCase.checkFunction = tcsGetTx.checkTransactionByIndex
                framework.addTestCase(testCases, testCase)
            }
        }

        title = '0020\t有效的地址，无效的sequence：很大的数值'
        {
            index = 99999999
            needPass = false
            expectedError = 'can\'t find transaction'
            testCase = tcsGetTx.createSingleTestCaseForGetTransactionByIndex(server, title, hash, from, index, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = '0020\t有效的地址，无效的sequence：0'
        {
            index = 0
            testCase = tcsGetTx.createSingleTestCaseForGetTransactionByIndex(server, title, hash, from, index, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = '0020\t有效的地址，无效的sequence：负数'
        {
            index = -1
            testCase = tcsGetTx.createSingleTestCaseForGetTransactionByIndex(server, title, hash, from, index, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = '0020\t有效的地址，无效的sequence：小数'
        {
            index = 5.87
            testCase = tcsGetTx.createSingleTestCaseForGetTransactionByIndex(server, title, hash, from, index, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = '0020\t有效的地址，无效的sequence：乱码字符串'
        {
            index = 'sjdflsajf32241kjksd'
            testCase = tcsGetTx.createSingleTestCaseForGetTransactionByIndex(server, title, hash, from, index, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = '0030\t无效的地址参数_01：地址长度不够'
        {
            from = 'jpRhBgu4KZAyW9pMv4ckrxVYSvgG9ZuSV'
            index = 1
            needPass = false
            expectedError = 'Bad account address'
            testCase = tcsGetTx.createSingleTestCaseForGetTransactionByIndex(server, title, hash, from, index, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = '0030\t无效的地址参数_01：地址长度过长'
        {
            from = 'jpRhBgu4KZAyW9pMv4ckrxVYSvgG9ZuSVm1'
            testCase = tcsGetTx.createSingleTestCaseForGetTransactionByIndex(server, title, hash, from, index, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = '0030\t无效的地址参数_01：地址不以j开头'
        {
            from = 'tpRhBgu4KZAyW9pMv4ckrxVYSvgG9ZuSVm'
            testCase = tcsGetTx.createSingleTestCaseForGetTransactionByIndex(server, title, hash, from, index, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        title = '0040\t无效的地址参数_02：地址长度没问题且以j开头，但是一个不存在没被使用过的地址'
        {
            from = server.mode.addresses.inactiveAccount1.address
            needPass = false
            expectedError = 'can\'t find transaction'
            testCase = tcsGetTx.createSingleTestCaseForGetTransactionByIndex(server, title, hash, from, index, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        framework.testTestCases(server, describeTitle, testCases)
    },

    createSingleTestCaseForGetTransactionByIndex: function(server, title, hash, from, index, needPass, expectedError){

        let functionName = consts.rpcFunctions.getTransactionByIndex
        let txParams = []
        txParams.push(from)
        txParams.push(index)

        let expectedResult = {}
        expectedResult.needPass = needPass
        expectedResult.isErrorInResult = false
        expectedResult.expectedError = expectedError

        let testCase = framework.createTestCase(
            title,
            server,
            functionName,
            txParams,
            null,
            framework.executeTestCaseForGet,
            tcsGetTx.checkTransaction,
            expectedResult,
            restrictedLevel.L2,
            [serviceType.newChain, serviceType.oldChain],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        testCase.checkParams = {}
        testCase.checkParams.hash = hash;

        return testCase
    },

    checkTransactionByIndex: function(testCase){
        let response = testCase.actualResult[0]
        let needPass = testCase.expectedResult.needPass
        framework.checkResponse(needPass, response)
        if(needPass){
            let from = testCase.txParams[0]
            let index = testCase.txParams[1]
            // expect(value.result).to.be.jsonSchema(schema.TX_SCHEMA)
            expect(response.result.Account).to.be.equal(from)
            expect(response.result.Sequence).to.be.equal(index)
        }
        else{
            framework.checkResponseError(testCase, response.message, testCase.expectedResult.expectedError)
        }
    },
    //endregion

    //region get tx by block and index
    testForGetTransactionByBlockHashAndIndex: function(server, describeTitle){
        let txs = server.mode.txs
        let testCases = []
        let functionName = consts.rpcFunctions.getTransactionByBlockHashAndIndex

        let title = '0010\t有效区块哈希，有效交易索引'
        let hash = txs.block.blockHash
        let index = txs.tx1.meta.TransactionIndex.toString()
        let needPass = true
        let expectedError = ''
        let testCase = tcsGetTx.createSingleTestCaseForGetTransactionByBlockAndIndex(server, title, functionName, hash, index, needPass, expectedError)
        testCase.supportedServices = [serviceType.newChain,]
        framework.addTestCase(testCases, testCase)

        title = '0010\t有效区块哈希，有效交易索引:查询有效区块编号，遍历所有有效交易索引'
        hash = txs.block.blockHash
        testCase = tcsGetTx.createSingleTestCaseForGoThroughTxsInBlockByBlockHash(server, title, hash)
        testCase.supportedServices = [serviceType.newChain,]
        framework.addTestCase(testCases, testCase)

        title = '0020\t有效区块哈希，无效交易索引无效交易索引:100'
        hash = txs.block.blockHash
        index = '999999'
        needPass = false
        expectedError = 'no such transaction in block'
        testCase = tcsGetTx.createSingleTestCaseForGetTransactionByBlockAndIndex(server, title, functionName, hash, index, needPass, expectedError)
        testCase.supportedServices = [serviceType.newChain,]
        framework.addTestCase(testCases, testCase)

        title = '0020\t有效区块哈希，无效交易索引无效交易索引:负数'
        hash = txs.block.blockHash
        index = '-1'
        needPass = false
        expectedError = 'index out of range'
        testCase = tcsGetTx.createSingleTestCaseForGetTransactionByBlockAndIndex(server, title, functionName, hash, index, needPass, expectedError)
        testCase.supportedServices = [serviceType.newChain,]
        framework.addTestCase(testCases, testCase)

        title = '0020\t有效区块哈希，无效交易索引无效交易索引:乱码'
        hash = txs.block.blockHash
        index = 'asdf'
        needPass = false
        expectedError = 'invalid syntax'
        testCase = tcsGetTx.createSingleTestCaseForGetTransactionByBlockAndIndex(server, title, functionName, hash, index, needPass, expectedError)
        testCase.supportedServices = [serviceType.newChain,]
        framework.addTestCase(testCases, testCase)

        title = '0030\t无效区块哈希'
        hash = 'B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A'
        index = '0'
        needPass = false
        expectedError = 'can\'t find block'
        testCase = tcsGetTx.createSingleTestCaseForGetTransactionByBlockAndIndex(server, title, functionName, hash, index, needPass, expectedError)
        testCase.supportedServices = [serviceType.newChain,]
        framework.addTestCase(testCases, testCase)

        framework.testTestCases(server, describeTitle, testCases)
    },

    testForGetTransactionByBlockNumberAndIndex: function(server, describeTitle){
        let txs = server.mode.txs
        let testCases = []
        let functionName = consts.rpcFunctions.getTransactionByBlockNumberAndIndex

        let tx1 = txs.tx1
        let title = '0010\t有效区块哈希，有效交易索引'
        let blockNumber = tx1.ledger_index.toString()
        let index = txs.tx1.meta.TransactionIndex.toString()
        let needPass = true
        let expectedError = ''
        let testCase = tcsGetTx.createSingleTestCaseForGetTransactionByBlockAndIndex(server, title, functionName, blockNumber, index, needPass, expectedError)
        testCase.supportedServices = [serviceType.newChain,]
        framework.addTestCase(testCases, testCase)

        title = '0010\t有效区块编号，有效交易索引:查询有效区块编号，遍历所有有效交易索引'
        blockNumber = txs.block.blockNumber
        testCase = tcsGetTx.createSingleTestCaseForGoThroughTxsInBlockByBlockNumber(server, title, blockNumber)
        testCase.supportedServices = [serviceType.newChain,]
        framework.addTestCase(testCases, testCase)

        title = '0010\t有效区块编号，有效交易索引:查询有效区块编号earliest，遍历所有有效交易索引'
        blockNumber = "earliest"
        testCase = tcsGetTx.createSingleTestCaseForGoThroughTxsInBlockByBlockNumber(server, title, blockNumber)
        testCase.supportedServices = [serviceType.newChain,]
        framework.addTestCase(testCases, testCase)

        title = '0010\t有效区块编号，有效交易索引:查询有效区块编号latest，遍历所有有效交易索引'
        blockNumber = "latest"
        testCase = tcsGetTx.createSingleTestCaseForGoThroughTxsInBlockByBlockNumber(server, title, blockNumber)
        testCase.supportedServices = [serviceType.newChain,]
        framework.addTestCase(testCases, testCase)

        title = '0010\t有效区块编号，有效交易索引:查询有效区块编号pending，遍历所有有效交易索引'
        blockNumber = "pending"
        testCase = tcsGetTx.createSingleTestCaseForGoThroughTxsInBlockByBlockNumber(server, title, blockNumber)
        testCase.supportedServices = [serviceType.newChain,]
        framework.addTestCase(testCases, testCase)

        title = '0020\t有效区块编号，无效交易索引无效交易索引:100'
        blockNumber = tx1.ledger_index.toString()
        index = '100'
        needPass = false
        expectedError = 'no such transaction in block'
        testCase = tcsGetTx.createSingleTestCaseForGetTransactionByBlockAndIndex(server, title, functionName, blockNumber, index, needPass, expectedError)
        testCase.supportedServices = [serviceType.newChain,]
        framework.addTestCase(testCases, testCase)

        title = '0020\t有效区块编号，无效交易索引无效交易索引:负数'
        blockNumber = tx1.ledger_index.toString()
        index = '-1'
        needPass = false
        expectedError = 'index out of range'
        testCase = tcsGetTx.createSingleTestCaseForGetTransactionByBlockAndIndex(server, title, functionName, blockNumber, index, needPass, expectedError)
        testCase.supportedServices = [serviceType.newChain,]
        framework.addTestCase(testCases, testCase)

        title = '0020\t有效区块编号，无效交易索引无效交易索引:乱码'
        blockNumber = tx1.ledger_index.toString()
        index = 'asdf'
        needPass = false
        expectedError = 'invalid syntax'
        testCase = tcsGetTx.createSingleTestCaseForGetTransactionByBlockAndIndex(server, title, functionName, blockNumber, index, needPass, expectedError)
        testCase.supportedServices = [serviceType.newChain,]
        framework.addTestCase(testCases, testCase)

        title = '0030\t无效区块编号'
        blockNumber = '999999999'
        index = '0'
        needPass = false
        expectedError = 'can\'t find block'
        testCase = tcsGetTx.createSingleTestCaseForGetTransactionByBlockAndIndex(server, title, functionName, blockNumber, index, needPass, expectedError)
        testCase.supportedServices = [serviceType.newChain,]
        framework.addTestCase(testCases, testCase)

        framework.testTestCases(server, describeTitle, testCases)
    },

    createSingleTestCaseForGetTransactionByBlockAndIndex: function(server, title, functionName,
                                                                            hashOrNumber, index, needPass, expectedError){

        let txParams = []
        txParams.push(hashOrNumber)
        txParams.push(index)

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
            framework.executeTestCaseForGet,
            tcsGetTx.checkTransactionByBlockHashAndIndex,
            expectedResult,
            restrictedLevel.L2,
            [serviceType.newChain,],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        return testCase
    },

    checkTransactionByBlockHashAndIndex: function(testCase){
        let response = testCase.actualResult[0]
        let needPass = testCase.expectedResult.needPass
        framework.checkResponse(needPass, response)
        if(needPass){
            let tx1 = testCase.server.mode.txs.tx1
            framework.compareTx(tx1, response.result)
        }
        else{
            framework.checkResponseError(testCase, response.message, testCase.expectedResult.expectedError)
        }
    },

    createSingleTestCaseForGoThroughTxsInBlockByBlockHash: function(server, title, hash){
        // todo: need consider how to combine these 2 similar functions.
        // try to combine number and hash function but failed.
        // because use function as param will cause 'this' in function direct to other value, response function cannot be found.
        // let getCountFunc = numberOrHash.length == HASH_LENGTH ? server.responseGetTxCountByHash : server.responseGetTxCountByBlockNumber
        // let getTxFunc = numberOrHash.length == HASH_LENGTH ? server.responseGetTxByBlockHashAndIndex : server.responseGetTxByBlockNumberAndIndex

        return framework.createTestCase(
            title,
            server,
            '',
            null,
            null,
            function(testCase){
                testCase.hasExecuted = true
                return server.responseGetTxCountByHash(server, hash).then(async(countResponse)=> {
                    // testCase.hasExecuted = true
                    testCase.actualResult.push(countResponse)
                })
            },
            async function(testCase){
                let countResponse = testCase.actualResult[0]
                framework.checkResponse(true, countResponse)
                let txCount = Number(countResponse.result)
                let finishCount = 0
                for(let i = 0; i < txCount; i++){
                    await Promise.resolve(server.responseGetTxByBlockHashAndIndex(server, hash, i.toString())).then(function (response) {
                        framework.checkResponse(true, response)
                        finishCount++
                    })
                }
                if(finishCount == txCount){
                    logger.debug("遍历所有有效交易索引成功，共查询到" + txCount + "条交易!")
                }
                else{
                    logger.debug("遍历所有有效交易索引失败，应该有" + txCount + "条交易，实际查询到" + finishCount + "条交易!")
                    expect(false).to.be.ok
                }
            },
            null,
            restrictedLevel.L2,
            [serviceType.newChain,],
            [],//[interfaceType.rpc, interfaceType.websocket]
        )
    },

    createSingleTestCaseForGoThroughTxsInBlockByBlockNumber: function(server, title, number){
        // todo: need consider how to combine these 2 similar functions.
        return framework.createTestCase(
            title,
            server,
            '',
            null,
            null,
            function(testCase){  //execute function
                testCase.hasExecuted = true
                return server.responseGetTxCountByBlockNumber(server, number).then(async(countResponse)=> {
                    // testCase.hasExecuted = true
                    testCase.actualResult.push(countResponse)
                })
            },
            async function(testCase){  //check function
                let countResponse = testCase.actualResult[0]
                framework.checkResponse(true, countResponse)
                let txCount = Number(countResponse.result)
                let finishCount = 0
                for(let i = 0; i < txCount; i++){
                    await Promise.resolve(server.responseGetTxCountByBlockNumber(server, number, i.toString())).then(function (response) {
                        framework.checkResponse(true, response)
                        finishCount++
                    })
                }
                if(finishCount == txCount){
                    logger.debug("遍历所有有效交易索引成功，共查询到" + txCount + "条交易!")
                }
                else{
                    logger.debug("遍历所有有效交易索引失败，应该有" + txCount + "条交易，实际查询到" + finishCount + "条交易!")
                    expect(false).to.be.ok
                }
            },
            null,
            restrictedLevel.L2,
            [serviceType.newChain,],
            [],//[interfaceType.rpc, interfaceType.websocket]
        )
    },

    //endregion

    //endregion

}