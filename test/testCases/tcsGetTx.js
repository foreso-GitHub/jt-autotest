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

module.exports = tcsGetTx = {

    //region get tx check

    //region get tx by hash

    testForGetTransaction: function(server, describeTitle){

        //region fields

        let testScripts = []
        let testCaseCode
        let defaultScriptCode = '000100'
        let scriptCode

        let txs = server.mode.txs

        //endregion

        testCaseCode = 'FCJT_getTransactionByHash_000010'
        scriptCode = defaultScriptCode + '_查询有效交易哈希-底层币'
        {
            let hash = txs.tx1.hash
            let testScript = tcsGetTx.createTestScriptForGetTransaction(server, testCaseCode, scriptCode, hash)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByHash_000020'
        scriptCode = defaultScriptCode + '_查询有效交易哈希-token'
        {
            let hash = txs.tx_token.hash
            let testScript = tcsGetTx.createTestScriptForGetTransaction(server, testCaseCode, scriptCode, hash)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByHash_000030'
        scriptCode = defaultScriptCode + '_查询有效交易哈希-memos'
        {
            let hash = txs.tx_memo.hash
            let testScript = tcsGetTx.createTestScriptForGetTransaction(server, testCaseCode, scriptCode, hash)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByHash_000040'
        scriptCode = defaultScriptCode + '_查询无效交易哈希:数字'
        {
            let hash = 1231111
            let testScript = tcsGetTx.createTestScriptForGetTransaction(server, testCaseCode, scriptCode, hash)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'hash is not string'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByHash_000040'
        scriptCode = '000200' + '_查询无效交易哈希:字符串'
        {
            let hash = 'data.tx1.hash'
            let testScript = tcsGetTx.createTestScriptForGetTransaction(server, testCaseCode, scriptCode, hash)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'invalid byte'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByHash_000040'
        scriptCode = '000300' + '_查询无效交易哈希:参数为空'
        {
            let hash = null
            let testScript = tcsGetTx.createTestScriptForGetTransaction(server, testCaseCode, scriptCode, hash)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'hash is null'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByHash_000040'
        scriptCode = '000400' + '_无效交易哈希：不存在的hash'
        {
            let hash = 'B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A'
            let testScript = tcsGetTx.createTestScriptForGetTransaction(server, testCaseCode, scriptCode, hash)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(140, 't find transaction'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByHash_000040'
        scriptCode = '000500' + '_无效交易哈希：hash长度超过标准'
        {
            let hash = 'B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A1F'
            let testScript = tcsGetTx.createTestScriptForGetTransaction(server, testCaseCode, scriptCode, hash)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-189, 'index out of range'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle, testScripts)
    },

    createTestScriptForGetTransaction: function(server, testCaseCode, scriptCode, hash,){

        let functionName = consts.rpcFunctions.getTransactionByHash
        let txParams = []
        txParams.push(hash)

        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )
        let action = framework.createTestAction(testScript, functionName, txParams,
            framework.executeTestActionForGet, tcsGetTx.checkTransaction, [{needPass:true}])
        testScript.actions.push(action)
        return testScript

    },

    checkTransaction: function(action){
        let response = action.actualResult
        let needPass = action.expectedResults[0].needPass
        framework.checkGetResponse(response)
        if(needPass){
            expect(response.result).to.be.jsonSchema(schema.TX_SCHEMA)
            let hash = action.txParams[0]
            // let hash = action.checkParams.hash
            expect(response.result.hash).to.be.equal(hash)
        }
        else{
            framework.checkResponseError(action, action.expectedResults[0], response)
        }
    },

    //endregion

    //region get tx by index

    testForGetTransactionByIndex: function(server, describeTitle){

        //region fields

        let testScripts = []
        let testCaseCode
        let defaultScriptCode = '000100'
        let scriptCode

        let txs = server.mode.txs
        let tx = txs.tx1
        let from = tx.Account
        let index = tx.Sequence

        //endregion

        testCaseCode = 'FCJT_getTransactionByIndex_000010'
        scriptCode = defaultScriptCode + '_token tx,有效的地址，有效的sequence'
        {
            tx = txs.tx_token
            from = tx.Account
            index = tx.Sequence
            let testScript = tcsGetTx.createTestScriptForGetTransactionByIndex(server, testCaseCode, scriptCode, from, index,)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByIndex_000010'
        scriptCode = '000200' + '_swt tx,有效的地址，有效的sequence'
        {
            tx = txs.tx1
            from = tx.Account
            index = tx.Sequence
            let testScript = tcsGetTx.createTestScriptForGetTransactionByIndex(server, testCaseCode, scriptCode, from, index,)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByIndex_000010'
        scriptCode = '000300' + '_swt tx,有效的地址，有效的sequence'
        {
            tx = txs.tx1
            from = tx.Account
            let lastIndex = 10

            let testScript = framework.createTestScript(
                server,
                testCaseCode,
                scriptCode,
                [],
                restrictedLevel.L2,
                [serviceType.newChain, ],
                [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
            )

            for(let i = 1; i <= lastIndex; i++){
                index = i
                let functionName = consts.rpcFunctions.getTransactionByIndex
                let txParams = []
                txParams.push(from)
                txParams.push(index)
                let action = framework.createTestAction(testScript, functionName, txParams,
                    framework.executeTestActionForGet, tcsGetTx.checkTransactionByIndex, [{needPass:true}])
                testScript.actions.push(action)
            }

            framework.addTestScript(testScripts, testScript)

        }

        testCaseCode = 'FCJT_getTransactionByIndex_000020'
        scriptCode = defaultScriptCode + '_有效的地址，无效的sequence,很大的数值'
        {
            tx = txs.tx1
            from = tx.Account
            index = 99999999
            let testScript = tcsGetTx.createTestScriptForGetTransactionByIndex(server, testCaseCode, scriptCode, from, index,)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(140, 't find transaction'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByIndex_000020'
        scriptCode = '000200' + '_有效的地址，无效的sequence,0'
        {
            tx = txs.tx1
            from = tx.Account
            index = 0
            let testScript = tcsGetTx.createTestScriptForGetTransactionByIndex(server, testCaseCode, scriptCode, from, index,)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(140, 't find transaction'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByIndex_000020'
        scriptCode = '000300' + '_有效的地址，无效的sequence,负数'
        {
            tx = txs.tx1
            from = tx.Account
            index = -1
            let testScript = tcsGetTx.createTestScriptForGetTransactionByIndex(server, testCaseCode, scriptCode, from, index,)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'index or sequence should be >= 0'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByIndex_000020'
        scriptCode = '000400' + '_有效的地址，无效的sequence,小数'
        {
            tx = txs.tx1
            from = tx.Account
            index = 5.87
            let testScript = tcsGetTx.createTestScriptForGetTransactionByIndex(server, testCaseCode, scriptCode, from, index,)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'index or sequence is not integer'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByIndex_000020'
        scriptCode = '000500' + '_有效的地址，无效的sequence,乱码字符串'
        {
            tx = txs.tx1
            from = tx.Account
            index = 'sjdflsajf32241kjksd'
            let testScript = tcsGetTx.createTestScriptForGetTransactionByIndex(server, testCaseCode, scriptCode, from, index,)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'index or sequence is not integer'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByIndex_000030'
        scriptCode = defaultScriptCode + '_无效的地址参数_01：地址长度不够'
        {
            from = 'jpRhBgu4KZAyW9pMv4ckrxVYSvgG9ZuSV'
            index = 1
            let testScript = tcsGetTx.createTestScriptForGetTransactionByIndex(server, testCaseCode, scriptCode, from, index,)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-96, 'Bad account address'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByIndex_000030'
        scriptCode = '000200' + '_无效的地址参数_01：地址长度过长'
        {
            from = 'jpRhBgu4KZAyW9pMv4ckrxVYSvgG9ZuSVm1'
            index = 1
            let testScript = tcsGetTx.createTestScriptForGetTransactionByIndex(server, testCaseCode, scriptCode, from, index,)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-96, 'Bad account address'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByIndex_000030'
        scriptCode = '000200' + '_无效的地址参数_01：地址不以j开头'
        {
            from = 'tpRhBgu4KZAyW9pMv4ckrxVYSvgG9ZuSVm'
            index = 1
            let testScript = tcsGetTx.createTestScriptForGetTransactionByIndex(server, testCaseCode, scriptCode, from, index,)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-96, 'Bad account address'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByIndex_000040'
        scriptCode = defaultScriptCode + '_无效的地址参数_02：未激活的地址'
        {
            from = server.mode.addresses.inactiveAccount1.address
            index = 1
            let testScript = tcsGetTx.createTestScriptForGetTransactionByIndex(server, testCaseCode, scriptCode, from, index,)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(140, 't find transaction'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle, testScripts)
    },

    createTestScriptForGetTransactionByIndex: function(server, testCaseCode, scriptCode, from, index){

        let functionName = consts.rpcFunctions.getTransactionByIndex
        let txParams = []
        txParams.push(from)
        txParams.push(index)

        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )
        let action = framework.createTestAction(testScript, functionName, txParams,
            framework.executeTestActionForGet, tcsGetTx.checkTransactionByIndex, [{needPass:true}])
        testScript.actions.push(action)
        return testScript

    },

    checkTransactionByIndex: function(action){
        let response = action.actualResult
        let needPass = action.expectedResults[0].needPass
        framework.checkGetResponse(response)
        if(needPass){
            expect(response.result).to.be.jsonSchema(schema.TX_SCHEMA)
            let from = action.txParams[0]
            let index = action.txParams[1]
            expect(response.result.Account).to.be.equal(from)
            expect(response.result.Sequence).to.be.equal(index)
        }
        else{
            framework.checkResponseError(action, action.expectedResults[0], response)
        }
    },

    //endregion

    //region get tx by block and index

    testForGetTransactionByBlockHashAndIndex: function(server, describeTitle){

        //region fields

        let testScripts = []
        let testCaseCode
        let defaultScriptCode = '000100'
        let scriptCode

        let txs = server.mode.txs
        let functionName = consts.rpcFunctions.getTransactionByBlockHashAndIndex

        //endregion

        testCaseCode = 'FCJT_getTransactionByBlockHashAndIndex_000010'
        scriptCode = defaultScriptCode + '_有效区块哈希，有效交易索引'
        {
            let hash = txs.block.blockHash
            let index = txs.tx1.meta.TransactionIndex.toString()
            let testScript = tcsGetTx.createTestScriptForGetTransactionByBlockAndIndex(server, testCaseCode, scriptCode, functionName, hash, index,)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByBlockHashAndIndex_000010'
        scriptCode = '000200' + '_有效区块哈希，有效交易索引:查询有效区块编号，遍历所有有效交易索引'
        {

            let hash = txs.block.blockHash
            let count = 16

            let testScript = framework.createTestScript(
                server,
                testCaseCode,
                scriptCode,
                [],
                restrictedLevel.L2,
                [serviceType.newChain, ],
                [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
            )

            let action = framework.createTestAction(testScript, consts.rpcFunctions.getBlockTransactionCountByHash, [hash],
                async function(){
                    await framework.executeTestActionForGet(action)
                    let count = action.actualResult.result
                    for(let i = 0; i < count; i++){
                        let txParams = []
                        txParams.push(hash)
                        txParams.push(i)
                        let newAction = framework.createTestAction(action.testScript, functionName, txParams,
                            framework.executeTestActionForGet, tcsGetTx.checkTransactionForGoThrough, [{needPass:true}])
                        testScript.actions.push(newAction)
                    }
                },
                null, [{needPass:true}])
            testScript.actions.push(action)

            framework.addTestScript(testScripts, testScript)

        }

        testCaseCode = 'FCJT_getTransactionByBlockHashAndIndex_000020'
        scriptCode = defaultScriptCode + '_有效区块哈希，无效交易索引无效交易索引:999999'
        {
            let hash = txs.block.blockHash
            let index = '999999'
            let testScript = tcsGetTx.createTestScriptForGetTransactionByBlockAndIndex(server, testCaseCode, scriptCode, functionName, hash, index,)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(140, 'no such transaction in block'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByBlockHashAndIndex_000020'
        scriptCode = '000200' + '_有效区块哈希，无效交易索引无效交易索引:负数'
        {
            let hash = txs.block.blockHash
            let index = '-1'
            let testScript = tcsGetTx.createTestScriptForGetTransactionByBlockAndIndex(server, testCaseCode, scriptCode, functionName, hash, index,)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-189, 'index out of range'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByBlockHashAndIndex_000020'
        scriptCode = '000200' + '_有效区块哈希，无效交易索引无效交易索引:乱码'
        {
            let hash = txs.block.blockHash
            let index = 'asdf'
            let testScript = tcsGetTx.createTestScriptForGetTransactionByBlockAndIndex(server, testCaseCode, scriptCode, functionName, hash, index,)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'index is not integer'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByBlockHashAndIndex_000030'
        scriptCode = defaultScriptCode + '_无效区块哈希'
        {
            let hash = 'B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A'
            let index = '0'
            let testScript = tcsGetTx.createTestScriptForGetTransactionByBlockAndIndex(server, testCaseCode, scriptCode, functionName, hash, index,)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(140, 't find block'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle, testScripts)
    },

    testForGetTransactionByBlockNumberAndIndex: function(server, describeTitle){

        //region fields

        let testScripts = []
        let testCaseCode
        let defaultScriptCode = '000100'
        let scriptCode

        let txs = server.mode.txs
        let functionName = consts.rpcFunctions.getTransactionByBlockNumberAndIndex

        //endregion

        testCaseCode = 'FCJT_getTransactionByBlockNumberAndIndex_000010'
        scriptCode = defaultScriptCode + '_有效区块编号，有效交易索引'
        {
            let tx = txs.tx1
            let blockNumber = tx.ledger_index.toString()
            let index = tx.meta.TransactionIndex.toString()
            let testScript = tcsGetTx.createTestScriptForGetTransactionByBlockAndIndex(server, testCaseCode, scriptCode, functionName, blockNumber, index,)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByBlockNumberAndIndex_000010'
        scriptCode = '000200' + '_有效区块编号，有效交易索引:查询有效区块编号，遍历所有有效交易索引'
        {

            let blockNumber = txs.block.blockNumber
            let count = 16

            let testScript = framework.createTestScript(
                server,
                testCaseCode,
                scriptCode,
                [],
                restrictedLevel.L2,
                [serviceType.newChain, ],
                [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
            )

            // for(let i = 0; i < count; i++){
            //     let txParams = []
            //     txParams.push(blockNumber)
            //     txParams.push(i)
            //     let action = framework.createTestAction(testScript, functionName, txParams,
            //         framework.executeTestActionForGet, tcsGetTx.checkTransactionForGoThrough, [{needPass:true}])
            //     testScript.actions.push(action)
            // }

            let action = framework.createTestAction(testScript, consts.rpcFunctions.getBlockTransactionCountByNumber, [blockNumber],
                async function(){
                    await framework.executeTestActionForGet(action)
                    let count = action.actualResult.result
                    for(let i = 0; i < count; i++){
                        let txParams = []
                        txParams.push(blockNumber)
                        txParams.push(i)
                        let newAction = framework.createTestAction(action.testScript, functionName, txParams,
                            framework.executeTestActionForGet, tcsGetTx.checkTransactionForGoThrough, [{needPass:true}])
                        testScript.actions.push(newAction)
                    }
                },
                null, [{needPass:true}])
            testScript.actions.push(action)

            framework.addTestScript(testScripts, testScript)

        }

        testCaseCode = 'FCJT_getTransactionByBlockNumberAndIndex_000020'
        scriptCode = defaultScriptCode + '_有效区块编号，无效交易索引无效交易索引:999999'
        {
            let tx = txs.tx1
            let blockNumber = tx.ledger_index.toString()
            let index = '999999'
            let testScript = tcsGetTx.createTestScriptForGetTransactionByBlockAndIndex(server, testCaseCode, scriptCode, functionName, blockNumber, index,)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(140, 'no such transaction in block'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByBlockNumberAndIndex_000020'
        scriptCode = '000200' + '_有效区块编号，无效交易索引无效交易索引:负数'
        {
            let tx = txs.tx1
            let blockNumber = tx.ledger_index.toString()
            let index = '-1'
            let testScript = tcsGetTx.createTestScriptForGetTransactionByBlockAndIndex(server, testCaseCode, scriptCode, functionName, blockNumber, index,)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-189, 'index out of range'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByBlockNumberAndIndex_000020'
        scriptCode = '000300' + '_有效区块编号，无效交易索引无效交易索引:乱码'
        {
            let tx = txs.tx1
            let blockNumber = tx.ledger_index.toString()
            let index = 'asdf'
            let testScript = tcsGetTx.createTestScriptForGetTransactionByBlockAndIndex(server, testCaseCode, scriptCode, functionName, blockNumber, index,)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-269, 'index is not integer'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByBlockNumberAndIndex_000030'
        scriptCode = defaultScriptCode + '_无效区块编号'
        {
            let blockNumber = '999999999'
            let index = '0'
            let testScript = tcsGetTx.createTestScriptForGetTransactionByBlockAndIndex(server, testCaseCode, scriptCode, functionName, blockNumber, index,)
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(140, 't find block'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle, testScripts)
    },

    createTestScriptForGetTransactionByBlockAndIndex: function(server, testCaseCode, scriptCode, functionName, hashOrNumber, index,){

        let txParams = []
        txParams.push(hashOrNumber)
        txParams.push(index)

        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )
        let action = framework.createTestAction(testScript, functionName, txParams,
            framework.executeTestActionForGet, tcsGetTx.checkTransactionByBlockHashAndIndex, [{needPass:true}])
        testScript.actions.push(action)
        return testScript

    },

    checkTransactionByBlockHashAndIndex: function(action){
        let response = action.actualResult
        let needPass = action.expectedResults[0].needPass
        framework.checkGetResponse(response)
        if(needPass){
            expect(response.result).to.be.jsonSchema(schema.TX_SCHEMA)
            let tx1 = action.server.mode.txs.tx1
            framework.compareTxs(response.result, tx1)
        }
        else{
            framework.checkResponseError(action, action.expectedResults[0], response)
        }
    },

    checkTransactionForGoThrough: function(action){
        let response = action.actualResult
        let needPass = action.expectedResults[0].needPass
        framework.checkGetResponse(response)
        if(needPass){
            expect(response.result).to.be.jsonSchema(schema.TX_SCHEMA)
        }
        else{
            framework.checkResponseError(action, action.expectedResults[0], response)
        }
    },

    //endregion

    //endregion

}
