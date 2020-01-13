const chai = require("chai")
chai.use(require("chai-json-schema"))
const expect = chai.expect
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let HashMap = require('hashmap')
var utility = require("./testUtility.js")
const { servers, chains, addresses, status, data, token, txs, blocks, modes } = require("./config")
const schema = require("./schema.js")
const consts = require('../lib/rpc/consts')

let _SequenceMap = new HashMap()
let _LastDynamicalTimeSeed = 0

describe('Jingtum测试', function () {
  this.timeout(20000)

  for(let mode of modes){

    let server = mode.server
    server.setUrl(mode.url)

    describe('测试模式: ' + server.getName(), function () {

      describe.skip('test demo', function () {

        //region common test

        it('test create wallet', function () {
          return Promise.resolve(server.responseCreateWallet()).then(function (value) {
            checkResponse(true, value)
            expect(value.result).to.be.jsonSchema(schema.WALLET_SCHEMA)
            expect(value.result.address).to.match(/^j/)
            expect(value.result.secret).to.match(/^s/)
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('test get balance', function () {
          return Promise.resolve(server.responseBalance(addresses.balanceAccount.address)).then(function (value) {
            checkResponse(true, value)
            expect(value.result).to.be.jsonSchema(schema.BLANCE_SCHEMA)
            expect(Number(value.result.balance)).to.be.above(0)
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('test get block number', function () {
          return Promise.resolve(server.responseBlockNumber()).then(function (value) {
            checkResponse(true, value)
            expect(value.result).to.be.jsonSchema(schema.BLOCKNUMBER_SCHEMA)
            expect(server.processBlockNumberResponse(value)).to.be.above(4000)
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('test 5s create a new block', function () {
          return Promise.resolve(get2BlockNumber(server)).then(function (value) {
            expect(value.blockNumber2 - value.blockNumber1).to.be.most(2)
            expect(value.blockNumber2 - value.blockNumber1).to.be.least(1)
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('test get transaction', function () {
          return Promise.resolve(server.responseGetTxByHash(mode.tx1.hash)).then(function (value) {
            checkResponse(true, value)
            expect(value.result).to.be.jsonSchema(schema.TX_SCHEMA)
            expect(value.result.Account).to.be.equal(mode.tx1.Account)
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        //endregion

      })

      describe.skip('用例测试', function () {

        describe('测试jt_getTransactionByHash', function () {

          it('0010\t查询有效交易哈希-底层币', function () {
            let tx = data.chain.tx
            return Promise.resolve(server.responseGetTxByHash(
                tx.hash,
            )).then(async function (value) {
              checkGetTxSuccess(tx, value)
            })
          })

          it('0020\t查询有效交易哈希-token', function () {
            let tx = data.tx_token
            return Promise.resolve(server.responseGetTxByHash(
                tx.hash,
            )).then(async function (value) {
              checkGetTxSuccess(tx, value)
            })
          })

          it('0030\t查询有效交易哈希-memos', function () {
            let tx = data.tx_memo
            return Promise.resolve(server.responseGetTxByHash(
                tx.hash,
            )).then(async function (value) {
              checkGetTxSuccess(tx, value)
            })
          })

          it('0040\t查询无效交易哈希:数字', function () {
            return Promise.resolve(server.responseGetTxByHash(
                1231111,
            )).then(async function (value) {
              checkResponse(false, value)
              expect(value.result).to.equal('interface conversion: interface {} is float64, not string')
            })
          })

          it('0040\t查询无效交易哈希:字符串', function () {
            return Promise.resolve(server.responseGetTxByHash(
                "data.tx1.hash",
            )).then(async function (value) {
              checkResponse(false, value)
              expect(value.result).to.contains('encoding/hex: invalid byte:')
            })
          })

          it('0040\t查询无效交易哈希:参数为空', function () {
            return Promise.resolve(server.responseGetTxByHash(
                null,
            )).then(async function (value) {
              checkResponse(false, value)
              expect(value.result).to.equal('interface conversion: interface {} is nil, not string')
            })
          })

        })

        describe('测试jt_blockNumber', function () {

          it('0010\t查询最新区块号', function () {
            return Promise.resolve(server.responseBlockNumber()).then(function (value) {
              checkResponse(true, value)
              expect(value.result).to.be.jsonSchema(schema.BLOCKNUMBER_SCHEMA)
              expect(server.processBlockNumberResponse(value)).to.be.above(100)
            }, function (err) {
              expect(err).to.be.ok
            })
          })

          it('0010\t查询最新区块号：发起查询请求，等待5秒或10秒（同步时间），再次发起查询请求', function () {
            return Promise.resolve(get2BlockNumber(server)).then(function (value) {
              expect(value.blockNumber2 - value.blockNumber1).to.be.most(2)
              expect(value.blockNumber2 - value.blockNumber1).to.be.least(1)
            }, function (err) {
              expect(err).to.be.ok
            })
          })

        })

        describe('测试jt_createAccount', function () {

          it('0010\t创建有效的账户', function () {
            let nickName = getDynamicName().symbol
            return Promise.resolve(server.responseCreateAccount(
                nickName,
            )).then(async function (value) {
              checkResponse(true, value)
              let account = value.result[0]
              // expect(value.result).to.be.jsonSchema(schema.WALLET_SCHEMA)
              expect(account.address).to.match(/^j/)
              expect(account.secret).to.match(/^s/)
              expect(account.nickname).to.equal(nickName)  //todo: bug, nickname should be nickName
            })
          })

          it('0020\t创建无效的账户:重复的名字', function () {
            let nickName = "autotest_1"

            return Promise.resolve(server.responseCreateAccount(
                nickName,
            )).then(async function (value) {
              checkResponse(false, value)
              expect(value.result).to.equal('the nickname already exists.')
            })
          })

          it('0020\t创建无效的账户:超过长度的字符串数字', function () {
            let nickName = getDynamicName().name
                + getDynamicName().name
                + getDynamicName().name
                + getDynamicName().name
                + getDynamicName().name

            return Promise.resolve(server.responseCreateAccount(
                nickName,
            )).then(async function (value) {
              checkResponse(false, value)
              // expect(value.result).to.be.jsonSchema(schema.WALLET_SCHEMA)
              // expect(value.result.address).to.match(/^j/)
              // expect(value.result.secret).to.match(/^s/)
              // expect(value.result.nickName).to.equal(nickName)
            })
          })

        })

        describe('测试jt_getAccount', function () {

          testGetAccountByTag(server, null)
          testGetAccountByTag(server, "current")
          testGetAccountByTag(server, "validated")
          testGetAccountByTag(server, "closed")
          // testGetAccountByTag(server, "4136")  //block number  //todo: always timeout, need restore
          testGetAccountByTag(server, "C0B53E636BE844AD4AD1D54391E589931A71F08D72CA7AE6E103312CB30C1D91")  //block 4136
        })

        describe('测试jt_getBalance', function () {

          testGetBalanceByTag(server, null)
          testGetBalanceByTag(server, "current")
          testGetBalanceByTag(server, "validated")
          testGetBalanceByTag(server, "closed")
          // testGetBalanceByTag(server, "4136")  //block number  //todo: always timeout, need restore
          testGetBalanceByTag(server, "C0B53E636BE844AD4AD1D54391E589931A71F08D72CA7AE6E103312CB30C1D91")  //block 4136
        })

        describe('测试jt_getTransactionByHash', function () {

          it('0010\t有效交易哈希', function () {
            let tx1 = txs.swtTx1.tx
            let hash = tx1.hash
            return Promise.resolve(server.responseGetTxByHash(hash)).then(function (response) {
              checkResponse(true, response)
              compareTx(tx1, response.result)
            })
          })

          it('0020\t无效交易哈希：不存在的hash', function () {
            let hash = "B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A"
            return Promise.resolve(server.responseGetTxByHash(hash)).then(function (response) {
              checkResponse(false, response)
              expect(response.result).to.contains('can\'t find transaction')
            })
          })

          it('0020\t无效交易哈希：hash长度超过标准', function () {
            let hash = "B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A1F"
            return Promise.resolve(server.responseGetTxByHash(hash)).then(function (response) {
              checkResponse(false, response)
              expect(response.result).to.contains('index out of range')
            })
          })

        })

        describe('测试jt_getTransactionByBlockHashAndIndex', function () {

          it('0010\t有效区块哈希，有效交易索引', function () {
            let tx1 = txs.swtTx1.tx
            let blockHash = txs.swtTx1.blockHash
            let index = tx1.meta.TransactionIndex.toString()
            return Promise.resolve(server.responseGetTxByBlockHashAndIndex(blockHash, index)).then(function (response) {
              checkResponse(true, response)
              compareTx(tx1, response.result)
            })
          })

          it('0010\t有效区块哈希，有效交易索引:查询有效区块编号，遍历所有有效交易索引', async function () {
            let blockHash = blocks.block1.hash
            await goThroughTxsInBlockByHash(server, blockHash)
          })

          it('0020\t有效区块哈希，无效交易索引无效交易索引:100', function () {
            let blockHash = txs.swtTx1.blockHash
            let index = "100"
            return Promise.resolve(server.responseGetTxByBlockHashAndIndex(blockHash, index)).then(function (response) {
              checkResponse(false, response)
              expect(response.result).to.contains('no such transaction in block')
            })
          })

          it('0020\t有效区块哈希，无效交易索引无效交易索引:负数', function () {
            let blockHash = txs.swtTx1.blockHash
            let index = "-1"
            return Promise.resolve(server.responseGetTxByBlockHashAndIndex(blockHash, index)).then(function (response) {
              checkResponse(false, response)
              expect(response.result).to.contains('index out of range')
            })
          })

          it('0020\t有效区块哈希，无效交易索引无效交易索引:乱码', function () {
            let blockHash = txs.swtTx1.blockHash
            let index = "asdf"
            return Promise.resolve(server.responseGetTxByBlockHashAndIndex(blockHash, index)).then(function (response) {
              checkResponse(false, response)
              expect(response.result).to.contains('invalid syntax')
            })
          })

          it('0030\t无效区块哈希', function () {
            let blockHash = "B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A"
            let index = "0"
            return Promise.resolve(server.responseGetTxByBlockHashAndIndex(blockHash, index)).then(function (response) {
              checkResponse(false, response)
              expect(response.result).to.contains('can\'t find block')
            })
          })

        })

        describe('测试jt_getTransactionByBlockNumberAndIndex', function () {

          it('0010\t有效区块编号，有效交易索引', function () {
            let tx1 = txs.swtTx1.tx
            let blockNumber = tx1.ledger_index.toString()
            let index = tx1.meta.TransactionIndex.toString()
            return Promise.resolve(server.responseGetTxByBlockNumberAndIndex(blockNumber, index)).then(function (response) {
              checkResponse(true, response)
              compareTx(tx1, response.result)
            })
          })

          it('0010\t有效区块编号，有效交易索引:查询有效区块编号，遍历所有有效交易索引', async function () {
            let blockNumber = blocks.block1.blockNumber
            await goThroughTxsInBlockByBlockNumber(server, blockNumber)
          })

          it('0010\t有效区块编号，有效交易索引:查询有效区块编号earliest，遍历所有有效交易索引', async function () {
            let blockNumber = "earliest"
            await goThroughTxsInBlockByBlockNumber(server, blockNumber)
          })

          it('0010\t有效区块编号，有效交易索引:查询有效区块编号latest，遍历所有有效交易索引', async function () {
            let blockNumber = "latest"
            await goThroughTxsInBlockByBlockNumber(server, blockNumber)
          })

          it('0010\t有效区块编号，有效交易索引:查询有效区块编号pending，遍历所有有效交易索引', async function () {
            let blockNumber = "pending"
            await goThroughTxsInBlockByBlockNumber(server, blockNumber)
          })

          it('0020\t有效区块编号，无效交易索引:100', function () {
            let tx1 = txs.swtTx1.tx
            let blockNumber = tx1.ledger_index.toString()
            let index = "100"
            return Promise.resolve(server.responseGetTxByBlockNumberAndIndex(blockNumber, index)).then(function (response) {
              checkResponse(false, response)
              expect(response.result).to.contains('no such transaction in block')
            })
          })

          it('0020\t有效区块编号，无效交易索引无效交易索引:负数', function () {
            let tx1 = txs.swtTx1.tx
            let blockNumber = tx1.ledger_index.toString()
            let index = "-1"
            return Promise.resolve(server.responseGetTxByBlockNumberAndIndex(blockNumber, index)).then(function (response) {
              checkResponse(false, response)
              expect(response.result).to.contains('index out of range')
            })
          })

          it('0020\t有效区块编号，无效交易索引无效交易索引:乱码', function () {
            let tx1 = txs.swtTx1.tx
            let blockNumber = tx1.ledger_index.toString()
            let index = "asdf"
            return Promise.resolve(server.responseGetTxByBlockNumberAndIndex(blockNumber, index)).then(function (response) {
              checkResponse(false, response)
              expect(response.result).to.contains('invalid syntax')
            })
          })

          it('0030\t无效区块编号', function () {
            let blockNumber = "9999999"
            let index = "0"
            return Promise.resolve(server.responseGetTxByBlockNumberAndIndex(blockNumber, index)).then(function (response) {
              checkResponse(false, response)
              expect(response.result).to.contains('can\'t find block')
            })
          })

        })

        describe('测试jt_getBlockTransactionCountByHash', function () {

          it('0010\t查询有效区块哈希', function () {
            let block = blocks.block1
            let hash = block.hash
            let txCount = block.transactionsCount
            return Promise.resolve(server.responseGetTxCountByHash(hash)).then(function (response) {
              checkResponse(true, response)
              expect(txCount).to.equal(response.result)
            })
          })

          it('0020\t无效交易哈希：不存在的hash', function () {
            let hash = "B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A"
            return Promise.resolve(server.responseGetTxCountByHash(hash)).then(function (response) {
              checkResponse(false, response)
              expect(response.result).to.contains('can\'t find block')
            })
          })

          it('0020\t无效交易哈希：hash长度超过标准', function () {
            let hash = "B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A1F"
            return Promise.resolve(server.responseGetTxCountByHash(hash)).then(function (response) {
              checkResponse(false, response)
              expect(response.result).to.contains('index out of range')
            })
          })

        })

        describe('测试jt_getBlockTransactionCountByNumber', function () {

          it('0010\t查询有效区块编号', function () {
            let block = blocks.block1
            let blockNumber = block.blockNumber
            let txCount = block.transactionsCount
            return Promise.resolve(server.responseGetTxCountByBlockNumber(blockNumber)).then(function (response) {
              checkResponse(true, response)
              expect(txCount).to.equal(response.result)
            })
          })

          it('0020\t无效交易编号：9999999', function () {
            let blockNumber = "9999999"
            return Promise.resolve(server.responseGetTxCountByBlockNumber(blockNumber)).then(function (response) {
              checkResponse(false, response)
              expect(response.result).to.contains('can\'t find block')
            })
          })

          it('0020\t无效交易编号：负数', function () {
            let blockNumber = "-100"
            return Promise.resolve(server.responseGetTxCountByBlockNumber(blockNumber)).then(function (response) {
              checkResponse(false, response)
              expect(response.result).to.contains('invalid syntax')
            })
          })

          it('0020\t无效交易编号：乱码', function () {
            let blockNumber = "addeew"
            return Promise.resolve(server.responseGetTxCountByBlockNumber(blockNumber)).then(function (response) {
              checkResponse(false, response)
              expect(response.result).to.contains('invalid syntax')
            })
          })



        })

        describe('测试jt_sendTransaction和jt_signTransaction fast mode', function (){
          let categoryName = ''
          let txFunctionName = ''
          let txParams = {}

          //region basic test

          categoryName = '原生币swt'
          txFunctionName = consts.rpcFunctions.sendTx
          txParams = createTxParamsForTransfer(server)
          describe(categoryName + '测试：' + txFunctionName, async function () {
            testForTransfer(server, categoryName, txFunctionName, txParams)
          })

          txFunctionName = consts.rpcFunctions.signTx
          txParams = createTxParamsForTransfer(server)
          describe(categoryName + '测试：' + txFunctionName, async function () {
            testForTransfer(server, categoryName, txFunctionName, txParams)
          })

          categoryName = '原生币swt压力测试'
          testCases = createTestCasesForPressureTest(server, categoryName, 20)
          testTestCases(server, categoryName, testCases)

          //endregion

          //region token test

          categoryName = '一次性代币'
          txFunctionName = consts.rpcFunctions.sendTx
          txParams = createTxParamsForIssueToken(server)
          describe(categoryName + '测试：' + txFunctionName, async function () {
            testForIssueToken(server, categoryName, txFunctionName, txParams)
          })

          txFunctionName = consts.rpcFunctions.signTx
          txParams = createTxParamsForIssueToken(server)
          describe(categoryName + '测试：' + txFunctionName, async function () {
            testForIssueToken(server, categoryName, txFunctionName, txParams)
          })

          //endregion
        })

      })

      describe('is working', function () {

        describe('测试jt_sendTransaction和jt_signTransaction fast mode', function (){
          let categoryName = ''
          let txFunctionName = ''
          let txParams = {}

          //region basic test

          categoryName = '原生币swt'
          txFunctionName = consts.rpcFunctions.sendTx
          txParams = createTxParamsForTransfer(server)
          describe(categoryName + '测试：' + txFunctionName, async function () {
            testForTransfer(server, categoryName, txFunctionName, txParams)
          })

          txFunctionName = consts.rpcFunctions.signTx
          txParams = createTxParamsForTransfer(server)
          describe(categoryName + '测试：' + txFunctionName, async function () {
            testForTransfer(server, categoryName, txFunctionName, txParams)
          })

          categoryName = '原生币swt压力测试'
          testCases = createTestCasesForPressureTest(server, categoryName, 20)
          testTestCases(server, categoryName, testCases)

          //endregion

          //region token test

          categoryName = '一次性代币'
          txFunctionName = consts.rpcFunctions.sendTx
          txParams = createTxParamsForIssueToken(server)
          describe(categoryName + '测试：' + txFunctionName, async function () {
            testForIssueToken(server, categoryName, txFunctionName, txParams)
          })

          txFunctionName = consts.rpcFunctions.signTx
          txParams = createTxParamsForIssueToken(server)
          describe(categoryName + '测试：' + txFunctionName, async function () {
            testForIssueToken(server, categoryName, txFunctionName, txParams)
          })

          //endregion
        })

      })

    })


  }

  //region fast sendTx case

  //region 1. create test cases

  let testCase = {
    type:"it",
    title:"",
    txParams:{},
    txFunction: {},
    sequence: 1,
    needPass: true,
    expecteResult: {
      needPass: true,
      errorLocation: "message", //or "result"
      errorContent: "",
    },
    hasExecuted: false,
    response: {},
  }

  //region create txParams

  function createTestCaseParams(server, categoryName, txFunctionName, txParams){
    let testCaseParams = {}
    testCaseParams.server = server
    testCaseParams.categoryName = categoryName
    testCaseParams.txFunctionName = txFunctionName
    testCaseParams.title = ''
    testCaseParams.originalTxParams = txParams
    testCaseParams.txParams = cloneParamsAarry(txParams)
    testCaseParams.otherParams = {}
    testCaseParams.executeFunction = executeTestCaseOfSendTx
    testCaseParams.checkFunction = checkTestCaseOfSendTx
    testCaseParams.expecteResult = createExpecteResult(true)
    testCaseParams.testCase = {}
    testCaseParams.symbol = testCaseParams.txParams[0].symbol
    testCaseParams.showSymbol = testCaseParams.txParams[0].showSymbol
    if(txFunctionName === consts.rpcFunctions.sendTx) {
      testCaseParams.executeFunction = executeTestCaseOfSendTx
      testCaseParams.checkFunction = checkTestCaseOfSendTx
    }
    else if(txFunctionName === consts.rpcFunctions.signTx){
      testCaseParams.executeFunction = executeTestCaseOfSignTxAndSendRawTx
      testCaseParams.checkFunction = checkTestCaseOfSignTxAndSendRawTx
    }
    else{
      throw new Error('txFunctionName doesn\'t exist!')
    }

    return testCaseParams
  }

  //endregion

  //region assistant create methods
  function createTestCase(title, server, txFunctionName, txParams, otherParams, executeFunction, checkFunction, expecteResult){
    let testCase = {}
    testCase.type = "it"
    if(title) testCase.title = title
    if(server) testCase.server = server
    if(txFunctionName) testCase.txFunctionName = txFunctionName
    if(txParams) testCase.txParams = txParams
    if(otherParams) testCase.otherParams = otherParams
    if(executeFunction) testCase.executeFunction = executeFunction
    if(checkFunction) testCase.checkFunction = checkFunction
    if(expecteResult) testCase.expecteResult = expecteResult
    testCase.hasExecuted = false
    testCase.actualResult = []
    return testCase
  }

  function createTestCaseByParams(testCaseParams){
    return createTestCase(testCaseParams.title, testCaseParams.server,
        testCaseParams.txFunctionName, testCaseParams.txParams, testCaseParams.otherParams,
        testCaseParams.executeFunction, testCaseParams.checkFunction, testCaseParams.expecteResult)
  }

  function createTxParamsForTransfer(server){
    return server.createTransferParams(addresses.sender1.address, addresses.sender1.secret, null,
        addresses.receiver1.address, "1", "10", ['autotest'])
  }

  function createTxParamsForIssueToken(server){
    // 参考”发起底层币无效交易“的测试用例
    // "flags":        float64(data.TxCoinMintable | data.TxCoinBurnable)
    // TxCoinMintable  TransactionFlag = 0x00010000 (65536)
    // TxCoinBurnable  TransactionFlag = 0x00020000 (131072)
    // Mintable+Burnable  TransactionFlag = 0x00030000  (196608)
    // Neither Mintable nor Burnable  TransactionFlag = 0x00000000  (0)
    // "local":true 表示发的是带issuer的币，类似这种100/CNY/jGr9kAJ1grFwK4FtQmYMm5MRnLzm93CV9C

    let tokenName = getDynamicName()
    return server.createIssueTokenParams(addresses.sender2.address, addresses.sender2.secret, null,
        tokenName.name, tokenName.symbol, 8, '9876543210', false, 65536)
  }

  function createTxParamsForTokenTransfer(server, symbol, issuer){
    let tokenParams = server.createTransferParams(addresses.sender2.address, addresses.sender2.secret, null,
        addresses.receiver1.address, '1', '10', ['autotest'])
    tokenParams[0].symbol = symbol
    tokenParams[0].issuer = issuer
    let showSymbol = getShowSymbol(symbol, issuer)
    tokenParams[0].showSymbol = showSymbol
    tokenParams[0].value = '1' + showSymbol
    return tokenParams
  }

  // example
  // {"jsonrpc":"2.0","id":7,"method":"jt_sendTransaction","params":[{"type":"IssueCoin","from":"jPdevNK8NeYSkg3TrWZa8eT6BrSp2oteUh","secret":"ssSLJReyitmAELQ3E3zYpZti1YuRe","name":"TestCoin1578886708","symbol":"5e1be634","decimals":8,"total_supply":"9876543210","local":false,"flags":65536,"fee":"10",
  //   "sequence":5620	}]}
  function createTxParamsForMintToken(server, name, symbol){
    return server.createIssueTokenParams(addresses.sender2.address, addresses.sender2.secret, null,
        name, symbol, 8, '9', false, 65536)
  }

  function createExpecteResult(needPass, isErrorInResult, expectedError){
    let expecteResult = {}
    expecteResult.needPass = needPass
    expecteResult.isErrorInResult = isErrorInResult
    expecteResult.expectedError = expectedError
    return expecteResult
  }
  //endregion

  //region common create method for sendTx and signTx

  function addTestCaseForSendRawTx(testCaseOfSignTx, expecteResultOfSendRawTx){
    let txFunctionName = consts.rpcFunctions.sendRawTx
    let testCaseOfSendRawTx = createTestCase(testCaseOfSignTx.title + '-' + txFunctionName, testCaseOfSignTx.server,
        txFunctionName, null,null, null, null, expecteResultOfSendRawTx)
    testCaseOfSignTx.subTestCases = []
    testCaseOfSignTx.subTestCases.push(testCaseOfSendRawTx)
  }

  //region 当jt_sendTransaction和jt_signTransaction都通过测试时

  function createTestCaseWhenSignPassAndSendRawTxPass(testCaseParams, updateTxParamsFunction){
    testCaseParams.txParams = cloneParamsAarry(testCaseParams.originalTxParams)
    updateTxParamsFunction()
    testCaseParams.expecteResult = createExpecteResult(true)
    let testCase = createTestCaseByParams(testCaseParams)
    if(testCaseParams.txFunctionName === consts.rpcFunctions.signTx) {
      let expecteResultOfSendRawTx = createExpecteResult(true)
      addTestCaseForSendRawTx(testCase, expecteResultOfSendRawTx)
    }
    return testCase
  }

  function createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, updateTxParamsFunction){
    return createTestCaseWhenSignPassAndSendRawTxPass(testCaseParams, updateTxParamsFunction)
  }

  function createTestCaseWhenSignPassAndSendRawTxPassForIssueToken(testCaseParams, updateTxParamsFunction){
    return createTestCaseWhenSignPassAndSendRawTxPass(testCaseParams, updateTxParamsFunction)
  }

  //endregion

  //region 当jt_sendTransaction和jt_signTransaction都通不过测试时

  function createTestCaseWhenSignFail(testCaseParams, updateTxParamsFunction){
    testCaseParams.txParams = cloneParamsAarry(testCaseParams.originalTxParams)
    updateTxParamsFunction()
    let testCase = createTestCaseByParams(testCaseParams)
    return testCase
  }

  function createTestCaseWhenSignFailForTransfer(testCaseParams, updateTxParamsFunction){
    return createTestCaseWhenSignFail(testCaseParams, updateTxParamsFunction)
  }

  function createTestCaseWhenSignFailForIssueToken(testCaseParams, updateTxParamsFunction){
    return createTestCaseWhenSignFail(testCaseParams, updateTxParamsFunction)
  }

  //endregion

  //region 当jt_signTransaction，sign可以通过，但sendRawTx会出错的情况的处理：这时sendRawTx的期望出错结果和jt_sendTransaction的期望出错结果一致。

  function createTestCaseWhenSignPassButSendRawTxFail(testCaseParams, updateTxParamsFunction){
    testCaseParams.txParams = cloneParamsAarry(testCaseParams.originalTxParams)
    updateTxParamsFunction()
    let testCase = createTestCaseByParams(testCaseParams)
    if(testCaseParams.txFunctionName === consts.rpcFunctions.signTx) {
      let expecteResultOfSignTx = createExpecteResult(true)
      testCase = createTestCase(testCaseParams.title, testCaseParams.server, testCaseParams.txFunctionName,
          testCaseParams.txParams, testCaseParams.executeFunction, testCaseParams.checkFunction, expecteResultOfSignTx)
      addTestCaseForSendRawTx(testCase, testCaseParams.expecteResult)
    }
    return testCase
  }

  function createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, updateTxParamsFunction){
    return createTestCaseWhenSignPassButSendRawTxFail(testCaseParams, updateTxParamsFunction)
  }

  function createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, updateTxParamsFunction){
    return createTestCaseWhenSignPassButSendRawTxFail(testCaseParams, updateTxParamsFunction)
  }

  //endregion

  //endregion

  //region main create methods

  //region transfer tx

  function createTestCasesForBasicTransaction(server, categoryName, txFunctionName, txParams){
    let testCases = []
    let testCaseParams = createTestCaseParams(server, categoryName, txFunctionName, txParams)

    //region test cases for basic transfer
    testCaseParams.title = '0010\t发起' + testCaseParams.categoryName + '有效交易_01'
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0020\t发起' + categoryName + '有效交易_02: 交易额填"' + testCaseParams.txParams[0].value + '"等'
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].value = "123/swt"
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0030\t发起' + categoryName + '无效交易_01: 没有秘钥'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].secret = null
        testCaseParams.expecteResult = createExpecteResult(false, true, 'No secret found for')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0030\t发起' + categoryName + '无效交易_01: 错误的秘钥1'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].secret = '错误的秘钥'
        testCaseParams.expecteResult = createExpecteResult(false, true, 'Bad Base58 string')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0030\t发起' + categoryName + '无效交易_01: 错误的秘钥2'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].secret = testCaseParams.txParams[0].secret + '1'
        testCaseParams.expecteResult = createExpecteResult(false, true, 'Bad Base58 checksum')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0040\t发起' + categoryName + '无效交易_02: 错误的发起钱包地址（乱码字符串）'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].from = testCaseParams.txParams[0].from + '1'
        testCaseParams.expecteResult = createExpecteResult(false, true, 'Bad account address:')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0050\t发起' + categoryName + '无效交易_03: 错误的接收钱包地址（乱码字符串）'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].to = testCaseParams.txParams[0].to + '1'
        testCaseParams.expecteResult = createExpecteResult(false, true, 'Bad account address:')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0060\t发起' + categoryName + '无效交易_04: 交易额超过发起钱包余额'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].value = "999999999999999" + testCaseParams.showSymbol
        testCaseParams.expecteResult = createExpecteResult(false, false, 'telINSUF_FEE_P Fee insufficient')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0070\t发起' + categoryName + '无效交易_05: 交易额为负数'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].value = "-100" + testCaseParams.showSymbol
        testCaseParams.expecteResult = createExpecteResult(false, false,
            'temBAD_AMOUNT Can only send positive amounts')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0080\t发起' + categoryName + '无效交易_06: 交易额为空'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].value = null
        testCaseParams.expecteResult = createExpecteResult(false, true, 'Invalid Number')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0080\t发起' + categoryName + '无效交易_06: 交易额为字符串'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].value = "aawrwfsfs"
        testCaseParams.expecteResult = createExpecteResult(false, true, 'Invalid Number')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0090\t发起' + categoryName + '无效交易_07: 交易额为小于1的正小数'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].value = "0.1" + testCaseParams.showSymbol
        testCaseParams.expecteResult = createExpecteResult(false, true, 'value must be integer type')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0100\t发起' + categoryName + '无效交易_08: 交易额为大于1的小数'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].value = "1.1" + testCaseParams.showSymbol
        testCaseParams.expecteResult = createExpecteResult(false, true, 'value must be integer type')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0110\t发起' + categoryName + '无效交易_09: 交易额为负小数：-0.1、-1.23等'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].value = "-0.1" + testCaseParams.showSymbol
        testCaseParams.expecteResult = createExpecteResult(false, true, 'value must be integer type')
      })
      testCases.push(testCase)
    }

    //endregion

    return testCases
  }

  function createTestCasesForTransactionWithMemo(server, categoryName, txFunctionName, txParams){
    let testCases = []
    let testCaseParams = createTestCaseParams(server, categoryName, txFunctionName, txParams)

    //region test cases
    testCaseParams.title = '0120\t发起带有效memo的交易_01: memo格式为："memos":["大家好"]'
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].memos = ["大家好"]
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0120\t发起带有效memo的交易_01: memo格式为奇数长度数字字串："memos":["12345"]'
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].memos = ["12345"]
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0120\t发起带有效memo的交易_01: memo格式为偶数长度数字字串："memos":["123456"]'
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].memos = ["123456"]
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0120\t发起带有效memo的交易_01: memo格式为字串："memos":["E5A4A7E5AEB6E5A5BDff"]'
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].memos = ["E5A4A7E5AEB6E5A5BDff"]
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0130\t发起带有效memo的交易_02: memo格式为： "memos":[{"type":"ok","format":"utf8","data":"E5A4A7E5AEB6E5A5BD"}]'
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].memos = [{"type":"ok","format":"utf8","data":"E5A4A7E5AEB6E5A5BD"}]
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0140\t发起带无效memo的交易_01: memo内容使整个交易内容超过900K'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        let memos = "E5A4A7E5AEB6E5A5BD"
        for(let i = 0; i < 18; i++){
          memos += memos;
        }
        testCaseParams.txParams[0].memos = memos
        testCaseParams.expecteResult = createExpecteResult(false, true, 'memos data error')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0150\t发起带无效memo的交易_02: memo内容使整个交易内容超过900K'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        let memos = "E5A4A7E5AEB6E5A5BD"
        for(let i = 0; i < 18; i++){
          memos += memos;
        }
        testCaseParams.txParams[0].memos = {"type":"ok","format":"utf8","data":memos}
        testCaseParams.expecteResult = createExpecteResult(false, true, 'memos data error')
      })
      testCases.push(testCase)
    }
    //endregion

    return testCases
  }

  function createTestCasesForTransactionWithFee(server, categoryName, txFunctionName, txParams){
    let testCases = []
    let testCaseParams = createTestCaseParams(server, categoryName, txFunctionName, txParams)

    //region test cases
    testCaseParams.title = '0160\t发起带有效fee的交易_01: fee为默认值12'
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].fee = data.defaultFee
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0160\t发起带有效fee的交易_01: fee为null'
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0170\t发起带有效fee的交易_02: fee比12小，但是足以发起成功的交易'
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].fee = "11"
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0180\t发起带有效fee的交易_03: fee比12大但小于钱包余额'
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].fee = "110"
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0190\t发起带无效fee的交易_01: fee比12小（比如5），但是不足以发起成功的交易'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].fee = "5"
        testCaseParams.expecteResult = createExpecteResult(false, false,
            'tecINSUFF_FEE Insufficient balance to pay fee')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0200\t发起带无效fee的交易_02: fee为0'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].fee = "0"
        testCaseParams.expecteResult = createExpecteResult(false, false,
            'tecINSUFF_FEE Insufficient balance to pay fee')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0210\t发起带无效fee的交易_03: fee为大于0的小数，比如12.5、5.5'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].fee = "12.5"
        testCaseParams.expecteResult = createExpecteResult(false, false,
            'tecINSUFF_FEE Insufficient balance to pay fee')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0220\t发起带无效fee的交易_04: fee为大于发起钱包' + categoryName + '余额的整数'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].fee = "999999999999999"
        testCaseParams.expecteResult = createExpecteResult(false, false,
            'telINSUF_FEE_P Fee insufficient')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0230\t发起带无效fee的交易_05: fee为负数，比如-3.5、-555等'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].fee = "-35"
        testCaseParams.expecteResult = createExpecteResult(false, false,
            'tecINSUFF_FEE Insufficient balance to pay fee')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0240\t发起带无效fee的交易_06: fee为数字'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].fee = 35
        testCaseParams.expecteResult = createExpecteResult(false, true,
            'interface conversion: interface {} is float64, not string')
      })
      testCases.push(testCase)
    }
    //endregion

    return testCases
  }

  //endregion

  //region issue token tx

  function createTestCasesForCreateToken(server, categoryName, txFunctionName, txParams){
    let testCases = []
    let testCaseParams = createTestCaseParams(server, categoryName, txFunctionName, txParams)

    //region test cases

    testCaseParams.title = '0270\t发行' + testCaseParams.categoryName
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForIssueToken(testCaseParams, function(){
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0290\t发行' + testCaseParams.categoryName + '_无效的type参数'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].type = "issuecoin"
        testCaseParams.expecteResult = createExpecteResult(false, true,
            'Invalid Number:  Reason: strconv.ParseUint: parsing "": invalid syntax')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0300\t发行' + testCaseParams.categoryName + '_无效的from参数'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].from = "from.address"
        testCaseParams.expecteResult = createExpecteResult(false, true,
            'Bad account address: from.address: Bad Base58 string: from.address')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0310\t发行' + testCaseParams.categoryName + '_无效的name参数:很长的字符串'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].name = "tokenName.name12345678901234567890"
        testCaseParams.expecteResult = createExpecteResult(false, false,
            'failed to submit transaction')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0310\t发行' + testCaseParams.categoryName + '_无效的name参数:被已有代币使用过的name'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].name = token.existToken.name
        testCaseParams.expecteResult = createExpecteResult(false, false,
            'failed to submit transaction')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0320\t发行' + testCaseParams.categoryName + '_无效的symbol参数:很长的字符串'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].symbol = "tokenName.symbolymboltokenN"
        testCaseParams.expecteResult = createExpecteResult(false, true,
            'runtime error: invalid memory address or nil pointer dereference')
      })
      testCases.push(testCase)
    }

    //todo it will cause no response, looks like no response from server.request
    testCaseParams.title = '0320\t发行' + testCaseParams.categoryName + '_无效的symbol参数:被已有代币使用过的name'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].symbol = token.existToken.symbol
        testCaseParams.expecteResult = createExpecteResult(false, true,
            'no name')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0330\t发行' + testCaseParams.categoryName + '_无效的decimals参数:字符串'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].decimals = "config.decimals"
        testCaseParams.expecteResult = createExpecteResult(false, true,
            'nterface conversion: interface {} is string, not float64')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0330\t发行' + testCaseParams.categoryName + '_无效的decimals参数:负数'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].decimals = -8
        testCaseParams.expecteResult = createExpecteResult(false, true,
            'tefNO_PERMISSION_ISSUE No permission issue')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0330\t发行' + testCaseParams.categoryName + '_无效的decimals参数:小数'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].decimals = 11.64
        testCaseParams.expecteResult = createExpecteResult(false, true,
            'tefNO_PERMISSION_ISSUE No permission issue')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0340\t发行' + testCaseParams.categoryName + '_无效的total_supply参数:字符串'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].total_supply = "config.total_supply"
        testCaseParams.expecteResult = createExpecteResult(false, true,
            'strconv.ParseInt: parsing')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0340\t发行' + testCaseParams.categoryName + '_无效的total_supply参数:字符串'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].total_supply = -10000000
        testCaseParams.expecteResult = createExpecteResult(false, true,
            'interface conversion: interface {} is float64, not string')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0340\t发行' + testCaseParams.categoryName + '_无效的total_supply参数:小数'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].total_supply = 10000.12345678
        testCaseParams.expecteResult = createExpecteResult(false, true,
            'interface conversion: interface {} is float64, not string')
      })
      testCases.push(testCase)
    }

    //endregion

    return testCases
  }

  function createTestCasesForMintToken(server, categoryName, txFunctionName, txParams){
    let testCases = []
    let testCaseParams = createTestCaseParams(server, categoryName, txFunctionName, txParams)
    testCaseParams.checkFunction = checkTestCaseOfMintOrBurn

    //region test cases
    let testAll = false
    if(testAll){

    }
    //endregion

    if(!testAll){
      testCaseParams.title = '0370\t增发可增发的代币' + testCaseParams.categoryName
      {
        testCaseParams.otherParams.oldBalance = '49382716050'
        let testCase = (testCaseParams.txParams[0].flags == 65536 ||testCaseParams.txParams[0].flags == 196608 ) ?
            createTestCaseWhenSignPassAndSendRawTxPassForIssueToken(testCaseParams, function(){
              testCaseParams.txParams[0].total_supply = '9'
            })
            :
            createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
              testCaseParams.txParams[0].total_supply = '9'
              testCaseParams.expecteResult = createExpecteResult(false, true,
                  'tefNO_PERMISSION_ISSUE No permission issue')
            })
        testCases.push(testCase)
      }
    }
    return testCases
  }

  function createTestCasesForBurnToken(server, categoryName, txFunctionName, txParams){
    let testCases = []
    let testCaseParams = createTestCaseParams(server, categoryName, txFunctionName, txParams)
    testCaseParams.checkFunction = checkTestCaseOfMintOrBurn

    //region test cases
    let testAll = false
    if(testAll){

    }
    //endregion

    if(!testAll){

      testCaseParams.title = '0380\t销毁' + testCaseParams.categoryName
      {
        testCaseParams.otherParams.oldBalance = '49382716059'
        let testCase = (testCaseParams.txParams[0].flags == 131072 ||testCaseParams.txParams[0].flags == 196608 ) ?
            createTestCaseWhenSignPassAndSendRawTxPassForIssueToken(testCaseParams, function(){
              testCaseParams.txParams[0].total_supply = '-18'
            })
            :
            createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
              testCaseParams.txParams[0].total_supply = '-18'
              testCaseParams.expecteResult = createExpecteResult(false, true,
                  'tefNO_PERMISSION_ISSUE No permission issue')
            })
        testCases.push(testCase)
      }


      testCaseParams.title = '0420\t无效地销毁' + testCaseParams.categoryName
      {
        testCaseParams.otherParams.oldBalance = '49382716041'
        let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
          testCaseParams.txParams[0].total_supply = '-9876543210000'
          testCaseParams.expecteResult = createExpecteResult(false, true,
              'tefNO_PERMISSION_ISSUE No permission issue')
        })
        testCases.push(testCase)
      }

      testCaseParams.title = '0380\t销毁所有' + testCaseParams.categoryName
      {
        testCaseParams.otherParams.oldBalance = '49382716041'
        let testCase = (testCaseParams.txParams[0].flags == 131072 ||testCaseParams.txParams[0].flags == 196608 ) ?
            createTestCaseWhenSignPassAndSendRawTxPassForIssueToken(testCaseParams, function(){
              testCaseParams.txParams[0].total_supply = '-49382716041'
            })
            :
            createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
              testCaseParams.txParams[0].total_supply = '-49382716041'
              testCaseParams.expecteResult = createExpecteResult(false, true,
                  'tefNO_PERMISSION_ISSUE No permission issue')
            })
        testCases.push(testCase)
      }

    }
    return testCases
  }



  //endregion

  //endregion

  //endregion

  //region 2. execute test cases

  //region execute the function of jt_sendTransaction

  function executeTestCaseOfSendTx(testCase){
    return new Promise(function(resolve){
      let server = testCase.server
      let data = testCase.txParams[0]
      let from = data.from
      getSequence(server, from).then(function(sequence){
        data.sequence = sequence
        executeTxByTestCase(testCase).then(function(response){
          if(response.status === status.success){
            setSequence(from, sequence + 1)  //if send tx successfully, then sequence need plus 1
          }
          testCase.hasExecuted = true
          testCase.actualResult.push(response)
          resolve(testCase)
        })
      })
    })
  }

  //endregion

  //region execute the function of jt_signTransaction

  function executeTestCaseOfSignTxAndSendRawTx(testCase){
    return new Promise(function(resolve){
      let server = testCase.server
      let data = testCase.txParams[0]
      let from = data.from
      getSequence(server, from).then(function(sequence){
        data.sequence = sequence
        executeTxByTestCase(testCase).then(function(responseOfSign){
          testCase.hasExecuted = true
          testCase.actualResult.push(responseOfSign)
          if(responseOfSign.status === status.success){
            if(testCase.expecteResult.needPass){
              if(!testCase.subTestCases || testCase.subTestCases.length == 0){
                testCase.executionResult = false
                resolve(responseOfSign)
              }
              else{
                let rawTx = testCase.actualResult[0].result[0]
                if(rawTx && rawTx.length > 0){
                  let data = []
                  data.push(rawTx)
                  let testCaseOfSendRawTx = testCase.subTestCases[0]
                  testCaseOfSendRawTx.txParams = data
                  executeTestCaseOfCommonFunction(testCaseOfSendRawTx).then(function(responseOfSendRawTx){
                    testCaseOfSendRawTx.hasExecuted = true
                    testCaseOfSendRawTx.actualResult.push(responseOfSendRawTx)
                    if(responseOfSendRawTx.status === status.success){
                      setSequence(from, sequence + 1)  //if send tx successfully, then sequence need plus 1
                    }
                    resolve(responseOfSendRawTx)
                  })
                }
                else{
                  testCase.executionResult = false
                  resolve(responseOfSign)
                }
              }
            }
            else{
              resolve(responseOfSign)
            }
          }
          else{
            resolve(responseOfSign)
          }
        })
      })
    })
  }

  //endregion

  //region common execute

  function executeTxByTestCase(testCase){
    logger.debug(testCase.title)
    return testCase.server.getResponse(testCase.txFunctionName, testCase.txParams)
  }

  //region execute the function which will NOT write block like jt_signTransaction

  function executeTestCaseOfCommonFunction(testCase){
    return new Promise(function(resolve){
      executeTxByTestCase(testCase).then(function(response){
        testCase.hasExecuted = true
        testCase.actualResult.push(response)
        resolve(response)
      })
    })
  }

  //endregion

  async function execEachTestCase(testCases, index){
    if(index < testCases.length){
      let testCase = testCases[index]
      // logger.debug("===1. index: " + index )
      await testCase.executeFunction(testCase)
      // logger.debug("===2. index: " + index )
      index++
      execEachTestCase(testCases, index)
      // logger.debug("===3. index: " + index )
    }
  }

  //endregion

  //endregion

  //region 3. check test cases

  //region check send tx result
  async function checkTestCaseOfSendTx(testCase){
    await checkResponseOfTransfer(testCase, testCase.txParams)
  }

  async function checkResponseOfCommon(testCase, txParams, checkFunction){
    let responseOfSendTx = testCase.actualResult[0]
    checkResponse(testCase.expecteResult.needPass, responseOfSendTx)
    if(testCase.expecteResult.needPass){
      expect(responseOfSendTx).to.be.jsonSchema(schema.SENDTX_SCHEMA)
      let hash = responseOfSendTx.result[0]
      let params = txParams[0]
      await getTxByHash(testCase.server, hash, 0).then(async function(responseOfGetTx){
        checkResponse(true, responseOfGetTx)
        // expect(responseOfGetTx.result).to.be.jsonSchema(schema.TX_SCHEMA)
        expect(responseOfGetTx.result.hash).to.be.equal(hash)
        await checkFunction(testCase, txParams, responseOfGetTx.result)
      }, function (err) {
        expect(err).to.be.ok
      })
    }
    else{
      let expecteResult = testCase.expecteResult
      expect((expecteResult.isErrorInResult) ? responseOfSendTx.result : responseOfSendTx.message).to.contains(expecteResult.expectedError)
    }
  }

  async function checkResponseOfTransfer(testCase, txParams){
    await checkResponseOfCommon(testCase, txParams, async function(testCase, txParams, tx){
      await compareActualTxWithTxParams(txParams[0], tx)
    })
  }

  async function checkTestCaseOfMintOrBurn(testCase){
    await checkResponseOfCommon(testCase, testCase.txParams, function(testCase, txParams, tx){
      let expectedBalance = Number(testCase.otherParams.oldBalance) + Number(txParams[0].total_supply)
      let newBalance = Number(testCase.otherParams.newBalance)
      expect(newBalance).to.be.equal(expectedBalance)
      // expect(true).to.be.ok
    })
  }

  function compareActualTxWithTxParams(txParams, tx){
    return new Promise(function(resolve){
      expect(tx.Account).to.be.equals(txParams.from)
      expect(tx.Destination).to.be.equals(txParams.to)
      expect(tx.Fee).to.be.equals(((txParams.fee) ? txParams.fee : 10).toString())
      //check value
      if(txParams.type == consts.rpcParamConsts.issueCoin){
        expect(tx.Name).to.be.equals(txParams.name)
        expect(tx.Decimals).to.be.equals(txParams.decimals)
        expect(tx.TotalSupply.value).to.be.equals(txParams.total_supply)
        expect(tx.TotalSupply.currency).to.be.equals(txParams.symbol)
        expect(tx.TotalSupply.issuer).to.be.equals((txParams.local) ? txParams.from : addresses.defaultIssuer.address)
        //expect(tx.Flags).to.be.equals(txParams.flags)  //todo need restore
      }
      else{
        if(txParams.symbol){
          expect(tx.Amount.currency).to.be.equals(txParams.symbol)
          expect(tx.Amount.value + "/" + tx.Amount.currency + "/" + tx.Amount.issuer).to.be.equals(txParams.value)
        }
        else{
          expect(tx.Amount).to.be.equals(txParams.value)
        }
      }
      //check memos
      if(tx.Memos){
        let memos = tx.Memos
        let expectedMemos = txParams.memos
        for(let i = 0; i < expectedMemos.length; i++){
          let expectedMemo = expectedMemos[i]
          if(typeof expectedMemo == "string"){
            expect(hex2Utf8(memos[i].Memo.MemoData)).to.be.equals(expectedMemo)
          }
          else if(expectedMemo.data){
            expect(hex2Utf8(memos[i].Memo.MemoData)).to.be.equals(expectedMemo.data)
          }
          else{
            expect(false).to.be.ok
          }
          //todo need check type and format also. need make type, format, data of memo function clear with weijia.
        }
      }
      // expect(false).to.be.ok
      resolve("done!")
    })
  }

  function getTxByHash(server, hash, retryCount){
    return server.responseGetTxByHash(hash)
        .then(async function (value) {
          //retry
          if(retryCount < data.retryMaxCount && (value.result.toString().indexOf('can\'t find transaction') != -1
              || value.result.toString().indexOf('no such transaction') != -1)){
            retryCount++
            logger.debug("===Try responseGetTxByHash again! The " + retryCount + " retry!===")
            await utility.timeout(data.retryPauseTime)
            return getTxByHash(server, hash, retryCount)
          }
          return value
        }).catch(function(error){
          logger.debug(error)
          expect(error).to.not.be.ok
        })
  }

  //endregion

  //region check sign and send raw tx result
  async function checkTestCaseOfSignTxAndSendRawTx(testCase){
    //check sign result
    let responseOfSendTx = testCase.actualResult[0]
    checkResponse(testCase.expecteResult.needPass, responseOfSendTx)
    if(testCase.expecteResult.needPass){
      expect(responseOfSendTx).to.be.jsonSchema(schema.SENDTX_SCHEMA)
      let signedTx = responseOfSendTx.result[0]
      expect(typeof(signedTx) === 'string').to.be.ok
      expect(isHex(signedTx)).to.be.ok

      //check send raw tx result
      let txParams = testCase.txParams
      let testCaseOfSendRawTx = testCase.subTestCases[0]
      await checkResponseOfTransfer(testCaseOfSendRawTx, txParams)
    }
    else{
      let expecteResult = testCase.expecteResult
      expect((expecteResult.isErrorInResult) ? responseOfSendTx.result : responseOfSendTx.message).to.contains(expecteResult.expectedError)
    }
  }
  //endregion

  //endregion

  //region 4. test test cases
  function testTestCases(server, describeTitle, testCases) {
    describe(describeTitle, async function () {

      before(async function() {
        execEachTestCase(testCases, 0)
        await utility.timeout(data.defaultBlockTime)
      })

      testCases.forEach(async function(testCase){
        it(testCase.title, async function () {
          await testCase.checkFunction(testCase)
        })
      })
    })
  }

  function testTestCasesByDescribes(server, describeTitle, descriptions) {

    describe(describeTitle, async function () {

      before(async function() {
        execEachTestCase(testCases, 0)
        await utility.timeout(data.defaultBlockTime)
      })

      testCases.forEach(async function(testCase){
        it(testCase.title, async function () {
          await testCase.checkFunction(testCase)
        })
      })
    })
  }

  function testForTransfer(server, categoryName, txFunctionName, txParams){
    let testName = ''
    let describeTitle = ''
    let testCases = []

    testName = '测试基本交易'
    describeTitle = testName + '-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
    testCases = createTestCasesForBasicTransaction(server, categoryName, txFunctionName, txParams)
    testTestCases(server, describeTitle, testCases)

    testName = '测试交易memo'
    describeTitle = testName + '-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
    testCases = createTestCasesForTransactionWithMemo(server, categoryName, txFunctionName, txParams)
    testTestCases(server, describeTitle, testCases)

    testName = '测试交易Fee'
    describeTitle = testName + '-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
    testCases = createTestCasesForTransactionWithFee(server, categoryName, txFunctionName, txParams)
    testTestCases(server, describeTitle, testCases)
  }

  function testForIssueToken(server, categoryName, txFunctionName, txParams){
    let testName = ''
    let describeTitle = ''
    let testCases = []

    //create token
    testName = '测试创建token'
    describeTitle = testName + '-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
    testCases = createTestCasesForCreateToken(server, categoryName, txFunctionName, txParams)
    testTestCases(server, describeTitle, testCases)

    //set created token properties
    let name = testCases[0].txParams[0].name
    let symbol = testCases[0].txParams[0].symbol
    let issuer = testCases[0].txParams[0].from
    logger.debug("===create token: " + symbol)

    //token transfer
    let transferTxParams = createTxParamsForTokenTransfer(server, symbol, issuer)
    describeTitle = '测试基本交易-[币种:' + transferTxParams[0].symbol + '] [方式:' + txFunctionName + ']'
    testCases = createTestCasesForBasicTransaction(server, categoryName, txFunctionName, transferTxParams)
    testTestCases(server, describeTitle, testCases)

    //mint token
    let mintTxParams = createTxParamsForMintToken(server, name, symbol)
    describeTitle = '测试增发-[币种:' + mintTxParams[0].symbol + '] [方式:' + txFunctionName + ']'
    testCases = createTestCasesForMintToken(server, categoryName, txFunctionName, mintTxParams)
    testTestCases(server, describeTitle, testCases)

    //burn token
    describeTitle = '测试销毁-[币种:' + mintTxParams[0].symbol + '] [方式:' + txFunctionName + ']'
    testCases = createTestCasesForBurnToken(server, categoryName, txFunctionName, mintTxParams)
    testTestCases(server, describeTitle, testCases)
  }
  //endregion

  //endregion

  //region pressure test

  function createTestCasesForPressureTest(server, categoryName, testCount){
    let testCases = []
    let txParams = createTxParamsForTransfer(server)
    let txFunctionName = consts.rpcFunctions.sendTx
    let executeFunction = executeTestCaseOfSendTx
    let checkFunction = checkTestCaseOfSendTx
    let expecteResult = createExpecteResult(true)

    for(let i = 0; i <= testCount; i++){
      let testCase = createTestCase('0010\t发起' + categoryName + '有效交易_01', server,
          txFunctionName, txParams, null,
          executeFunction, checkFunction, expecteResult)
      testCases.push(testCase)
    }
    return testCases
  }

  //endregion

  //region common test case

  //testcase

  function testGetAccountByTag(server, tag){
    describe('测试jt_getAccount, tag: ' + tag, function () {
      let address = addresses.balanceAccount.address
      let nickName = addresses.balanceAccount.nickName
      let inactiveAddress = addresses.inactiveAccount1.address
      let inactiveNickName = addresses.inactiveAccount1.nickName
      let wrongFormatAddress = addresses.wrongFormatAccount1.address
      let wrongFormatNickName = addresses.wrongFormatAccount1.nickName

      checkAccountOnActiveAccount(server, address, tag)
      checkAccountOnActiveAccount(server, nickName, tag)
      checkAccountOnInactiveAccount(server, inactiveAddress, tag)
      checkAccountOnInactiveAccount(server, inactiveNickName, tag)
      checkAccountOnWrongFormatAccount(server, wrongFormatAddress, tag)
      checkAccountOnWrongFormatAccount(server, wrongFormatNickName, tag)
    })
  }

  function testGetBalanceByTag(server, tag){
    describe('测试jt_getBalance, tag: ' + tag, function () {
      let address = addresses.balanceAccount.address
      let nickName = addresses.balanceAccount.nickName
      let inactiveAddress = addresses.inactiveAccount1.address
      let inactiveNickName = addresses.inactiveAccount1.nickName
      let wrongFormatAddress = addresses.wrongFormatAccount1.address
      let wrongFormatNickName = addresses.wrongFormatAccount1.nickName

      checkBalanceOnActiveAccount(server, address, tag)
      checkBalanceOnActiveAccount(server, nickName, tag)
      checkBalanceOnInactiveAccount(server, inactiveAddress, tag)
      checkBalanceOnInactiveAccount(server, inactiveNickName, tag)
      checkBalanceOnWrongFormatAccount(server, wrongFormatAddress, tag)
      checkBalanceOnWrongFormatAccount(server, wrongFormatNickName, tag)
    })
  }

  async function goThroughTxsInBlockByBlockNumber(server, blockNumber){
    await server.responseGetTxCountByBlockNumber(blockNumber).then(async(countResponse)=>{
      checkResponse(true, countResponse)
      let txCount = Number(countResponse.result)
      let finishCount = 0
      for(let i = 0; i < txCount; i++){
        await Promise.resolve(server.responseGetTxByBlockNumberAndIndex(blockNumber.toString(), i.toString())).then(function (response) {
          checkResponse(true, response)
          finishCount++
          if(finishCount == txCount){
            logger.debug("遍历所有有效交易索引: " + txCount + " txs done!")
            return "done!"
          }
        })
      }
    })
  }

  async function goThroughTxsInBlockByHash(server, blockHash){
    await server.responseGetTxCountByHash(blockHash).then(async(countResponse)=>{
      checkResponse(true, countResponse)
      let txCount = Number(countResponse.result)
      let finishCount = 0
      for(let i = 0; i < txCount; i++){
        await Promise.resolve(server.responseGetTxByBlockHashAndIndex(blockHash, i.toString())).then(function (response) {
          checkResponse(true, response)
          finishCount++
          if(finishCount == txCount){
            logger.debug("遍历所有有效交易索引: " + txCount + " txs done!")
            return "done!"
          }
        })
      }
    })
  }

  //endregion

  // region utility methods
  async function get2BlockNumber (server) {
    return new Promise(async (resolve, reject) => {
      if(!server) reject("Server cannot be null!")
      let result = {}
      result.blockNumber1 = await server.getBlockNumber()
      await utility.timeout(data.defaultBlockTime)
      result.blockNumber2 = await server.getBlockNumber()
      resolve(result)
    })
  }

  //region normal response check

  function compareTx(tx1, tx2){
    expect(tx1.Account).to.be.equals(tx2.Account)
    expect(tx1.Destination).to.be.equals(tx2.Destination)
    expect(tx1.Fee).to.be.equals(tx2.Fee)
    expect(tx1.Amount).to.be.equals(tx2.Amount)
    expect(JSON.stringify(tx1.Memos)).to.be.equals(JSON.stringify(tx2.Memos))
    expect(tx1.Sequence).to.be.equals(tx2.Sequence)
    expect(tx1.inLedger).to.be.equals(tx2.inLedger)
    expect(tx1.date).to.be.equals(tx2.date)
  }

  function checkResponse(isSuccess, value){
    expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
    expect(value.status).to.equal(isSuccess ? status.success: status.error)
  }

  function checkGetTxSuccess(tx, value){
    checkResponse(true, value)
    // expect(value.result).to.be.jsonSchema(schema.TX_SCHEMA)
    expect(value.result.hash).to.be.equal(tx.hash)
  }

  //endregion

  //region balance check

  async function checkBalanceChange(server, from, symbol, expectedBalance){
    let balance = await server.getBalance(from, symbol)
    expect(Number(balance.value)).to.be.equal(expectedBalance)
    return balance
  }

  function checkBalanceOnActiveAccount(server, addressOrName, tag){
    it('0010\t查询有效的地址_01:地址内有底层币和代币', function () {
      return Promise.resolve(server.responseBalance(addressOrName, null, tag)).then(function (value) {
        checkResponse(true, value)
        expect(value.result).to.be.jsonSchema(schema.BLANCE_SCHEMA)
        expect(Number(value.result.balance)).to.be.above(0)
      }, function (err) {
        expect(err).to.be.ok
      })
    })
  }

  function checkBalanceOnInactiveAccount(server, addressOrName, tag){
    it('0010\t查询有效的地址_01:地址内没有有底层币和代币', function () {
      return Promise.resolve(server.responseBalance(addressOrName, null, tag)).then(function (value) {
        checkResponse(false, value)
        expect(value.message).to.contains('no such account')
      }, function (err) {
        expect(err).to.be.ok
      })
    })
  }

  function checkBalanceOnWrongFormatAccount(server, addressOrName, tag){
    it('0010\t查询有效的地址_01:地址内没有有底层币和代币', function () {
      return Promise.resolve(server.responseBalance(addressOrName, null, tag)).then(function (value) {
        checkResponse(false, value)
        expect(value.message).to.contains('no such account')
      }, function (err) {
        expect(err).to.be.ok
      })
    })
  }

  //endregion

  //region account check
  function checkAccountOnActiveAccount(server, addressOrName, tag){
    it('0010\t查询有效的地址_01:地址内有底层币和代币', function () {
      return Promise.resolve(server.responseGetAccount(addressOrName, null, tag)).then(function (value) {
        checkResponse(true, value)
        // expect(value.result).to.be.jsonSchema(schema.BLANCE_SCHEMA)  //todo: add account schema
        expect(Number(value.result.Balance)).to.be.above(0)
      }, function (err) {
        expect(err).to.be.ok
      })
    })
  }

  function checkAccountOnInactiveAccount(server, addressOrName, tag){
    it('0010\t查询有效的地址_01:地址内没有有底层币和代币', function () {
      return Promise.resolve(server.responseGetAccount(addressOrName, null, tag)).then(function (value) {
        checkResponse(false, value)
        expect(value.result).to.contains('Bad account address:')
      }, function (err) {
        expect(err).to.be.ok
      })
    })
  }

  function checkAccountOnWrongFormatAccount(server, addressOrName, tag){
    it('0010\t查询有效的地址_01:地址内没有有底层币和代币', function () {
      return Promise.resolve(server.responseGetAccount(addressOrName, null, tag)).then(function (value) {
        checkResponse(false, value)
        expect(value.result).to.contains('Bad account address:')
      }, function (err) {
        expect(err).to.be.ok
      })
    })
  }
  //endregion

  //region common functions

  function getDynamicName(){
    let timeSeed = (_LastDynamicalTimeSeed) ? _LastDynamicalTimeSeed : Math.round(new Date().getTime()/1000)
    _LastDynamicalTimeSeed = ++timeSeed
    let result = {}
    result.name = "TestCoin" + timeSeed
    result.symbol = timeSeed.toString(16)
    logger.debug("getDynamicName: " + JSON.stringify(result))
    return result
  }

  //region hex relative

  function hex2Utf8(hex){
    return new Buffer.from(hex.toString(), 'hex').toString('utf8')
  }

  function hex2String(hex){
    // return new Buffer.from(hex.toString(), 'hex').toString('utf8')
    return new Buffer.from(hex.toString(), 'hex').toString('base64')
  }

  function string2Hex(string){
    // return new Buffer.from(string, 'utf8').toString('hex')
    return new Buffer.from(string, 'base64').toString('hex')
  }

  function isHex(context){
    let context2 = hex2String(context)
    let hex = string2Hex(context2)
    return context === hex
  }

  //endregion

  //region process sequence
  function getSequence(server, from){
    return new Promise(function (resolve){
      if(_SequenceMap.has(from)){
        logger.debug("===sequence   _SequenceMap:" + _SequenceMap.get(from))
        resolve(_SequenceMap.get(from))
      }
      else{
        Promise.resolve(server.responseGetAccount(from)).then(function (accountInfo) {
          logger.debug("---sequence   accountInfo:" + JSON.stringify(accountInfo))
          let sequence = Number(accountInfo.result.Sequence)
          setSequence(from, sequence)
          resolve(sequence)
        }).catch(function (error){
          logger.debug("Error!!! " + error)
        })
      }
    })
  }

  function setSequence(from, sequence){
    _SequenceMap.set(from, sequence)
  }
  //endregion

  //endregion

  //region clone params
  function cloneParams(originalParams){
    let params = {}
    if(originalParams.from != null) params.from = originalParams.from
    if(originalParams.secret != null) params.secret = originalParams.secret
    if(originalParams.to != null) params.to = originalParams.to
    if(originalParams.value != null) params.value = originalParams.value
    if(originalParams.fee != null) params.fee = originalParams.fee
    if(originalParams.memos != null) params.memos = originalParams.memos  //todo memos is an array, may need clone, not assign
    if(originalParams.type != null) params.type = originalParams.type
    if(originalParams.name != null) params.name = originalParams.name
    if(originalParams.symbol != null) params.symbol = originalParams.symbol
    if(originalParams.decimals != null) params.decimals = originalParams.decimals
    if(originalParams.total_supply != null) params.total_supply = originalParams.total_supply
    if(originalParams.local != null) params.local = originalParams.local
    if(originalParams.flags != null) params.flags = originalParams.flags
    return params
  }

  function cloneParamsAarry(originalParamsAarry){
    let paramsAarry = []
    paramsAarry.push(cloneParams(originalParamsAarry[0]))
    return paramsAarry

  }
  //endregion

  //region show symbol
  function getShowSymbol(symbol, issuer){
    return (!symbol || symbol == null || symbol == 'swt' || symbol == 'SWT') ? '' : ('/' + symbol + '/' + issuer)
  }
  //endregion

  // endregion

})
