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

    testForGetTransaction: function(server, describeTitle,){
        describe(describeTitle, async function () {
            tcsGetTx.testForGetTransactionByLedger(server, describeTitle, null)
            tcsGetTx.testForGetTransactionByLedger(server, describeTitle, consts.ledgers.current)
            tcsGetTx.testForGetTransactionByLedger(server, describeTitle, consts.ledgers.validated)
        })
    },

    testForGetTransactionByLedger: function(server, describeTitle, ledger){

        //region fields

        let testScripts = []
        let testCaseCode
        let scriptCode
        let prefixCode = utility.getPrefixCodeForLedger(ledger)
        describeTitle = describeTitle + ', ledger: ' + ledger
        let txs = server.mode.txs

        //endregion

        testCaseCode = 'FCJT_getTransactionByHash_000010'
        scriptCode = prefixCode + '100' + '_查询有效交易哈希-底层币'
        {
            let hash = txs.tx1.hash
            let testScript = tcsGetTx.createTestScriptForGetTransaction(server, testCaseCode, scriptCode, hash, ledger)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByHash_000020'
        scriptCode = prefixCode + '100' + '_查询有效交易哈希-token'
        {
            let hash = txs.tx_token.hash
            let testScript = tcsGetTx.createTestScriptForGetTransaction(server, testCaseCode, scriptCode, hash, ledger)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByHash_000030'
        scriptCode = prefixCode + '100' + '_查询有效交易哈希-memos'
        {
            let hash = txs.tx_memo.hash
            let testScript = tcsGetTx.createTestScriptForGetTransaction(server, testCaseCode, scriptCode, hash, ledger)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByHash_000040'
        scriptCode = prefixCode + '100' + '_查询无效交易哈希:数字'
        {
            let hash = 1231111
            let testScript = tcsGetTx.createTestScriptForGetTransaction(server, testCaseCode, scriptCode, hash, ledger)
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-269, 'hash is not string'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByHash_000040'
        scriptCode = prefixCode + '200' + '_查询无效交易哈希:字符串'
        {
            let hash = 'data.tx1.hash'
            let testScript = tcsGetTx.createTestScriptForGetTransaction(server, testCaseCode, scriptCode, hash, ledger)
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-269, 'NewHash256: Wrong length'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByHash_000040'
        scriptCode = prefixCode + '300' + '_查询无效交易哈希:参数为空'
        {
            let hash = null
            let testScript = tcsGetTx.createTestScriptForGetTransaction(server, testCaseCode, scriptCode, hash, ledger)
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-269, 'hash is null'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByHash_000040'
        scriptCode = prefixCode + '400' + '_无效交易哈希：不存在的hash'
        {
            let hash = 'B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A'
            let testScript = tcsGetTx.createTestScriptForGetTransaction(server, testCaseCode, scriptCode, hash, ledger)
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(140, 't find transaction'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByHash_000040'
        scriptCode = prefixCode + '500' + '_无效交易哈希：hash长度超过标准'
        {
            let hash = 'B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A1F'
            let testScript = tcsGetTx.createTestScriptForGetTransaction(server, testCaseCode, scriptCode, hash, ledger)
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-269, 'NewHash256: Wrong length'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle, testScripts)
    },

    createTestScriptForGetTransaction: function(server, testCaseCode, scriptCode, hash, ledger){

        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        let action = framework.createTestActionForGet(testScript, consts.rpcFunctions.getTransactionByHash)
        let param = server.createParamGetTxByHash(hash, true, ledger)
        action.txParams = [param]
        action.checkForPassResult = tcsGetTx.checkForPassResultForByHash
        testScript.actions.push(action)
        return testScript

    },

    checkForPassResultForByHash: function(action, param, expected, actual){
        let tx = actual.result
        expect(tx).to.be.jsonSchema(schema.TX_SCHEMA)
        let hash = param.hash
        expect(tx.hash).to.be.equal(hash)
    },

    //endregion

    //region get tx by index

    testForGetTransactionByIndex: function(server, describeTitle,){
        describe(describeTitle, async function () {
            tcsGetTx.testForGetTransactionByIndexByLedger(server, describeTitle, null)
            tcsGetTx.testForGetTransactionByIndexByLedger(server, describeTitle, consts.ledgers.current)
            tcsGetTx.testForGetTransactionByIndexByLedger(server, describeTitle, consts.ledgers.validated)
        })
    },

    testForGetTransactionByIndexByLedger: function(server, describeTitle, ledger){

        //region fields

        let testScripts = []
        let testCaseCode
        let scriptCode
        let prefixCode = utility.getPrefixCodeForLedger(ledger)
        describeTitle = describeTitle + ', ledger: ' + ledger

        let txs = server.mode.txs
        let tx = txs.tx1
        let from = tx.Account
        let index = tx.Sequence

        //endregion

        testCaseCode = 'FCJT_getTransactionByIndex_000010'
        scriptCode = prefixCode + '100' + '_token tx,有效的地址，有效的sequence'
        {
            tx = txs.tx_token
            from = tx.Account
            index = tx.Sequence
            let testScript = tcsGetTx.createTestScriptForGetTransactionByIndex(server, testCaseCode, scriptCode, from, index, ledger)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByIndex_000010'
        scriptCode = prefixCode + '200' + '_swt tx,有效的地址，有效的sequence'
        {
            tx = txs.tx1
            from = tx.Account
            index = tx.Sequence
            let testScript = tcsGetTx.createTestScriptForGetTransactionByIndex(server, testCaseCode, scriptCode, from, index, ledger)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByIndex_000010'
        scriptCode = prefixCode + '300' + '_swt tx,有效的地址，有效的sequence'
        {
            tx = txs.tx1
            let from = tx.Account
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

            let action = framework.createTestActionForGet(testScript, consts.rpcFunctions.getTransactionByIndex)
            for(let i = 1; i <= lastIndex; i++){
                let index = i
                let param = server.createParamGetTxByIndex(from, index, true, ledger)
                action.txParams.push(param)
                action.expectedResults.push({needPass:true})
            }

            testScript.actions.push(action)

            framework.addTestScript(testScripts, testScript)

        }

        testCaseCode = 'FCJT_getTransactionByIndex_000020'
        scriptCode = prefixCode + '100' + '_有效的地址，无效的sequence,很大的数值'
        {
            tx = txs.tx1
            from = tx.Account
            index = 99999999
            let testScript = tcsGetTx.createTestScriptForGetTransactionByIndex(server, testCaseCode, scriptCode, from, index, ledger)
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(140,  't find transaction'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByIndex_000020'
        scriptCode = prefixCode + '200' + '_有效的地址，无效的sequence,0'
        {
            tx = txs.tx1
            from = tx.Account
            index = 0
            let testScript = tcsGetTx.createTestScriptForGetTransactionByIndex(server, testCaseCode, scriptCode, from, index, ledger)
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(140, 't find transaction'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByIndex_000020'
        scriptCode = prefixCode + '300' + '_有效的地址，无效的sequence,负数'
        {
            tx = txs.tx1
            from = tx.Account
            index = -1
            let testScript = tcsGetTx.createTestScriptForGetTransactionByIndex(server, testCaseCode, scriptCode, from, index, ledger)
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-284, 'for sequence'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByIndex_000020'
        scriptCode = prefixCode + '400' + '_有效的地址，无效的sequence,小数'
        {
            tx = txs.tx1
            from = tx.Account
            index = 5.87
            let testScript = tcsGetTx.createTestScriptForGetTransactionByIndex(server, testCaseCode, scriptCode, from, index, ledger)
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-284, 'sequence is not a valid integer'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByIndex_000020'
        scriptCode = prefixCode + '500' + '_有效的地址，无效的sequence,乱码字符串'
        {
            tx = txs.tx1
            from = tx.Account
            index = 'sjdflsajf32241kjksd'
            let testScript = tcsGetTx.createTestScriptForGetTransactionByIndex(server, testCaseCode, scriptCode, from, index, ledger)
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-284, 'sequence is not a valid integer'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByIndex_000030'
        scriptCode = prefixCode + '100' + '_无效的地址参数_01：地址长度不够'
        {
            from = 'jpRhBgu4KZAyW9pMv4ckrxVYSvgG9ZuSV'
            index = 1
            let testScript = tcsGetTx.createTestScriptForGetTransactionByIndex(server, testCaseCode, scriptCode, from, index, ledger)
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-96, 'Bad account address'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByIndex_000030'
        scriptCode = prefixCode + '200' + '_无效的地址参数_01：地址长度过长'
        {
            from = 'jpRhBgu4KZAyW9pMv4ckrxVYSvgG9ZuSVm1'
            index = 1
            let testScript = tcsGetTx.createTestScriptForGetTransactionByIndex(server, testCaseCode, scriptCode, from, index, ledger)
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-96, 'Bad account address'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByIndex_000030'
        scriptCode = prefixCode + '200' + '_无效的地址参数_01：地址不以j开头'
        {
            from = 'tpRhBgu4KZAyW9pMv4ckrxVYSvgG9ZuSVm'
            index = 1
            let testScript = tcsGetTx.createTestScriptForGetTransactionByIndex(server, testCaseCode, scriptCode, from, index, ledger)
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-96, 'Bad account address'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByIndex_000040'
        scriptCode = prefixCode + '100' + '_无效的地址参数_02：未激活的地址'
        {
            from = server.mode.addresses.inactiveAccount1.address
            index = 1
            let testScript = tcsGetTx.createTestScriptForGetTransactionByIndex(server, testCaseCode, scriptCode, from, index, ledger)
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(140, 't find transaction'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle, testScripts)
    },

    createTestScriptForGetTransactionByIndex: function(server, testCaseCode, scriptCode, address, sequence, ledger){

        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        let action = framework.createTestActionForGet(testScript, consts.rpcFunctions.getTransactionByIndex)
        let param = server.createParamGetTxByIndex(address, sequence, true, ledger)
        action.txParams = [param]
        action.checkForPassResult = tcsGetTx.checkForPassResultForByIndex
        testScript.actions.push(action)
        return testScript

    },

    checkForPassResultForByIndex: function(action, param, expected, actual){
        let tx = actual.result
        expect(tx).to.be.jsonSchema(schema.TX_SCHEMA)
        let from = param.address
        let index = param.sequence
        expect(tx.Account).to.be.equal(from)
        expect(tx.Sequence).to.be.equal(index)
    },

    //endregion

    //region get tx by block and index

    testForGetTransactionByBlockHashAndIndex: function(server, describeTitle){
        describe(describeTitle, async function () {
            tcsGetTx.testForGetTransactionByBlockHashAndIndexByLedger(server, describeTitle, null)
            tcsGetTx.testForGetTransactionByBlockHashAndIndexByLedger(server, describeTitle, consts.ledgers.current)
            tcsGetTx.testForGetTransactionByBlockHashAndIndexByLedger(server, describeTitle, consts.ledgers.validated)
        })
    },

    testForGetTransactionByBlockHashAndIndexByLedger: function(server, describeTitle, ledger){

        //region fields

        let testScripts = []
        let testCaseCode
        let scriptCode
        let prefixCode = utility.getPrefixCodeForLedger(ledger)
        describeTitle = describeTitle + ', ledger: ' + ledger
        let txs = server.mode.txs
        let functionName = consts.rpcFunctions.getTransactionByBlockHashAndIndex

        //endregion

        testCaseCode = 'FCJT_getTransactionByBlockHashAndIndex_000010'
        scriptCode = prefixCode + '100'  + '_有效区块哈希，有效交易索引'
        {
            let hash = txs.block.blockHash
            let index = txs.tx1.meta.TransactionIndex.toString()
            let testScript = tcsGetTx.createTestScriptForGetTransactionByBlockAndIndex(server, testCaseCode, scriptCode, functionName, hash, index,)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByBlockHashAndIndex_000010'
        scriptCode = prefixCode + '200' + '_有效区块哈希，有效交易索引:查询有效区块编号，遍历所有有效交易索引'
        {
            let hash = txs.block.blockHash
            let testScript = framework.createTestScript(
                server,
                testCaseCode,
                scriptCode,
                [],
                restrictedLevel.L2,
                [serviceType.newChain, ],
                [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
            )
            let action = framework.createTestAction(testScript, consts.rpcFunctions.getBlockTransactionCountByHash,
                [hash],
                async function(){
                    await framework.executeTestActionForGet(action)
                    let server = action.server
                    let count = action.actualResult.result[0].result
                    for(let i = 0; i < count; i++){
                        let newAction = framework.createTestActionForGet(testScript, functionName)
                        let param = server.createParamGetTxByBlockHashAndIndex(hash, i, true)
                        newAction.txParams = [param]
                        newAction.checkForPassResult = tcsGetTx.checkForPassResultForGoThrough
                        testScript.actions.push(newAction)
                    }
                },
                null, [{needPass:true}])
            testScript.actions.push(action)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByBlockHashAndIndex_000020'
        scriptCode = prefixCode + '100'  + '_有效区块哈希，无效交易索引无效交易索引:999999'
        {
            let hash = txs.block.blockHash
            let index = '999999'
            let testScript = tcsGetTx.createTestScriptForGetTransactionByBlockAndIndex(server, testCaseCode, scriptCode, functionName, hash, index,)
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(140, 't find transaction'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByBlockHashAndIndex_000020'
        scriptCode = prefixCode + '200' + '_有效区块哈希，无效交易索引无效交易索引:负数'
        {
            let hash = txs.block.blockHash
            let index = '-1'
            let testScript = tcsGetTx.createTestScriptForGetTransactionByBlockAndIndex(server, testCaseCode, scriptCode, functionName, hash, index,)
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(140, 't find transaction'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByBlockHashAndIndex_000020'
        scriptCode = prefixCode + '200' + '_有效区块哈希，无效交易索引无效交易索引:乱码'
        {
            let hash = txs.block.blockHash
            let index = 'asdf'
            let testScript = tcsGetTx.createTestScriptForGetTransactionByBlockAndIndex(server, testCaseCode, scriptCode, functionName, hash, index,)
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-269, 'index is not a valid integer'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByBlockHashAndIndex_000030'
        scriptCode = prefixCode + '100'  + '_无效区块哈希'
        {
            let hash = 'B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A'
            let index = '0'
            let testScript = tcsGetTx.createTestScriptForGetTransactionByBlockAndIndex(server, testCaseCode, scriptCode, functionName, hash, index,)
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(140, 't find block'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle, testScripts)
    },

    testForGetTransactionByBlockNumberAndIndex: function(server, describeTitle){
        describe(describeTitle, async function () {
            tcsGetTx.testForGetTransactionByBlockNumberAndIndexByLedger(server, describeTitle, null)
            tcsGetTx.testForGetTransactionByBlockNumberAndIndexByLedger(server, describeTitle, consts.ledgers.current)
            tcsGetTx.testForGetTransactionByBlockNumberAndIndexByLedger(server, describeTitle, consts.ledgers.validated)
        })
    },

    testForGetTransactionByBlockNumberAndIndexByLedger: function(server, describeTitle, ledger){

        //region fields

        let testScripts = []
        let testCaseCode
        let scriptCode
        let prefixCode = utility.getPrefixCodeForLedger(ledger)
        describeTitle = describeTitle + ', ledger: ' + ledger
        let txs = server.mode.txs
        let functionName = consts.rpcFunctions.getTransactionByBlockNumberAndIndex

        //endregion

        testCaseCode = 'FCJT_getTransactionByBlockNumberAndIndex_000010'
        scriptCode = prefixCode + '100'  + '_有效区块编号，有效交易索引'
        {
            let tx = txs.tx1
            let blockNumber = tx.ledger_index.toString()
            let index = tx.meta.TransactionIndex.toString()
            let testScript = tcsGetTx.createTestScriptForGetTransactionByBlockAndIndex(server, testCaseCode, scriptCode, functionName, blockNumber, index,)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByBlockNumberAndIndex_000010'
        scriptCode = prefixCode + '200' + '_有效区块编号，有效交易索引:查询有效区块编号，遍历所有有效交易索引'
        {
            let blockNumber = txs.block.blockNumber
            let testScript = framework.createTestScript(
                server,
                testCaseCode,
                scriptCode,
                [],
                restrictedLevel.L2,
                [serviceType.newChain, ],
                [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
            )
            let action = framework.createTestAction(testScript, consts.rpcFunctions.getBlockTransactionCountByNumber,
                [blockNumber],
                async function(){
                    await framework.executeTestActionForGet(action)
                    let server = action.server
                    let count = action.actualResult.result[0].result
                    for(let i = 0; i < count; i++){
                        let newAction = framework.createTestActionForGet(testScript, functionName)
                        let param = server.createParamGetTxByBlockNumberAndIndex(blockNumber, i, true)
                        newAction.txParams = [param]
                        newAction.checkForPassResult = tcsGetTx.checkForPassResultForGoThrough
                        testScript.actions.push(newAction)
                    }
                },
                null, [{needPass:true}])
            testScript.actions.push(action)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByBlockNumberAndIndex_000020'
        scriptCode = prefixCode + '100'  + '_有效区块编号，无效交易索引无效交易索引:999999'
        {
            let tx = txs.tx1
            let blockNumber = tx.ledger_index.toString()
            let index = '999999'
            let testScript = tcsGetTx.createTestScriptForGetTransactionByBlockAndIndex(server, testCaseCode, scriptCode, functionName, blockNumber, index,)
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(140, 't find transaction'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByBlockNumberAndIndex_000020'
        scriptCode = prefixCode + '200' + '_有效区块编号，无效交易索引无效交易索引:负数'
        {
            let tx = txs.tx1
            let blockNumber = tx.ledger_index.toString()
            let index = '-1'
            let testScript = tcsGetTx.createTestScriptForGetTransactionByBlockAndIndex(server, testCaseCode, scriptCode, functionName, blockNumber, index,)
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(140, 't find transaction'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByBlockNumberAndIndex_000020'
        scriptCode = prefixCode + '300' + '_有效区块编号，无效交易索引无效交易索引:乱码'
        {
            let tx = txs.tx1
            let blockNumber = tx.ledger_index.toString()
            let index = 'asdf'
            let testScript = tcsGetTx.createTestScriptForGetTransactionByBlockAndIndex(server, testCaseCode, scriptCode, functionName, blockNumber, index,)
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(-269, 'index is not a valid integer'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_getTransactionByBlockNumberAndIndex_000030'
        scriptCode = prefixCode + '100'  + '_无效区块编号'
        {
            let blockNumber = '999999999'
            let index = '0'
            let testScript = tcsGetTx.createTestScriptForGetTransactionByBlockAndIndex(server, testCaseCode, scriptCode, functionName, blockNumber, index,)
            let expectedResult = framework.createExpectedResult(false,
                framework.getError(140, 't find block'))
            framework.changeExpectedResult(testScript, expectedResult)
            framework.addTestScript(testScripts, testScript)
        }

        framework.testTestScripts(server, describeTitle, testScripts)
    },

    createTestScriptForGetTransactionByBlockAndIndex: function(server, testCaseCode, scriptCode, functionName, hashOrNumber, index, ledger){

        let testScript = framework.createTestScript(
            server,
            testCaseCode,
            scriptCode,
            [],
            restrictedLevel.L2,
            [serviceType.newChain, ],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        let action = framework.createTestActionForGet(testScript, functionName)
        let param
        if(functionName == consts.rpcFunctions.getTransactionByBlockNumberAndIndex){
            param = server.createParamGetTxByBlockNumberAndIndex(hashOrNumber, index, true, ledger)
        }
        else if(functionName == consts.rpcFunctions.getTransactionByBlockHashAndIndex){
            param = server.createParamGetTxByBlockHashAndIndex(hashOrNumber, index, true, ledger)
        }
        action.txParams = [param]
        action.checkForPassResult = tcsGetTx.checkForPassResultForByBlockHashAndIndex
        testScript.actions.push(action)
        return testScript

    },

    checkForPassResultForByBlockHashAndIndex: function(action, param, expected, actual){
        let tx = actual.result
        expect(tx).to.be.jsonSchema(schema.TX_SCHEMA)
        let tx1 = action.server.mode.txs.tx1
        let full = param.full
        framework.compareTxs(tx, tx1, full)
    },

    checkForPassResultForGoThrough: function(action, param, expected, actual){
        let tx = actual.result
        expect(tx).to.be.jsonSchema(schema.TX_SCHEMA)
    },

    //endregion

    //endregion

}
