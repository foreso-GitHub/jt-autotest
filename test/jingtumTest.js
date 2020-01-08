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

let sequenceMap = new HashMap()

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

        describe('测试jt_sendTransaction', function () {

          describe.skip('测试底层币交易：没有symbol，默认swt', function (){
            let params = createTransactionParams("底层币", addresses.sender1, addresses.receiver1,
                "swt", "telINSUF_FEE_P Fee insufficient")
            testBasicTransaction(server, params)
          })

          describe('测试token交易', function (){

            describe('测试基本交易', function (){
              let params = createTransactionParams("token", addresses.sender3, addresses.receiver1,
                  "at1", "telINSUF_FUND Fund insufficient")
              testBasicTransaction(server, params)
            })

            describe('测试发行一次性代币', function (){
              //test create first
              let params = {}
              params.testType = "一次性代币"
              params.from = addresses.sender1
              params.config = token.config_normal
              params.existToken = token.existToken
              params.tokenName = getDynamicName()
              testCreateToken(server, params)

              //then test transaction of new token
              let txParams = createTransactionParams(params.testType, addresses.sender1, addresses.receiver1,
                  params.tokenName.symbol, "telINSUF_FUND Fund insufficient")
              testBasicTransaction(server, txParams)

              //then test mint
              params.mintResult = false
              testMintToken(server, params)

              //then test burn
              params.burnResult = false
              testBurnToken(server, params)
            })

            describe('测试发行可增发的代币', function (){
              //test create first
              let params = {}
              params.testType = "可增发代币"
              params.from = addresses.sender1
              params.config = token.config_mintable
              params.existToken = token.existToken
              params.tokenName = getDynamicName()
              testCreateToken(server, params)

              //then test transaction of new token
              let txParams = createTransactionParams(params.testType, addresses.sender1, addresses.receiver1,
                  params.tokenName.symbol, "telINSUF_FUND Fund insufficient")
              testBasicTransaction(server, txParams)

              //then test mint
              params.mintResult = true
              testMintToken(server, params)

              //then test burn
              params.burnResult = false
              testBurnToken(server, params)

            })

            describe('测试发行可销毁的代币', function (){
              //test create first
              let params = {}
              params.testType = "可销毁代币"
              params.from = addresses.sender1
              params.config = token.config_burnable
              params.existToken = token.existToken
              params.tokenName = getDynamicName()
              testCreateToken(server, params)

              //then test transaction of new token
              let txParams = createTransactionParams(params.testType, addresses.sender1, addresses.receiver1,
                  params.tokenName.symbol, "telINSUF_FUND Fund insufficient")
              testBasicTransaction(server, txParams)

              //then test mint
              params.mintResult = false
              testMintToken(server, params)

              //then test burn
              params.burnResult = true
              testBurnToken(server, params)
            })

            describe('发行既可增发又可销毁的代币', function (){
              //test create first
              let params = {}
              params.testType = "可增发可销毁代币"
              params.from = addresses.sender1
              params.config = token.config_mint_burn
              params.existToken = token.existToken
              params.tokenName = getDynamicName()
              testCreateToken(server, params)

              //then test transaction of new token
              let txParams = createTransactionParams(params.testType, addresses.sender1, addresses.receiver1,
                  params.tokenName.symbol, "telINSUF_FUND Fund insufficient")
              testBasicTransaction(server, txParams)

              //then test mint
              params.mintResult = true
              testMintToken(server, params)

              //then test burn
              params.burnResult = true
              testBurnToken(server, params)
            })

            describe('发行带issuer的一次性代币', function (){
              //test create first
              let params = {}
              params.testType = "带issuer的一次性代币"
              params.from = addresses.sender1
              params.config = token.config_issuer_normal
              params.existToken = token.existToken
              params.tokenName = getDynamicName()
              testCreateToken(server, params)

              //then test transaction of new token
              let txParams = createTransactionParams(params.testType, addresses.sender1, addresses.receiver1,
                  params.tokenName.symbol, "telINSUF_FUND Fund insufficient")
              testBasicTransaction(server, txParams)

              //then test mint
              params.mintResult = false
              testMintToken(server, params)

              //then test burn
              params.burnResult = false
              testBurnToken(server, params)
            })

            describe('发行带issuer的可增发的代币', function (){
              //test create first
              let params = {}
              params.testType = "带issuer的可增发的代币"
              params.from = addresses.sender1
              params.config = token.config_issuer_mintable
              params.existToken = token.existToken
              params.tokenName = getDynamicName()
              testCreateToken(server, params)

              //then test transaction of new token
              let txParams = createTransactionParams(params.testType, addresses.sender1, addresses.receiver1,
                  params.tokenName.symbol, "telINSUF_FUND Fund insufficient")
              testBasicTransaction(server, txParams)

              //then test mint
              params.mintResult = true
              testMintToken(server, params)

              //then test burn
              params.burnResult = false
              testBurnToken(server, params)
            })

            describe('发行带issuer的可销毁的代币', function (){
              //test create first
              let params = {}
              params.testType = "带issuer的可销毁的代币"
              params.from = addresses.sender1
              params.config = token.config_issuer_burnable
              params.existToken = token.existToken
              params.tokenName = getDynamicName()
              testCreateToken(server, params)

              //then test transaction of new token
              let txParams = createTransactionParams(params.testType, addresses.sender1, addresses.receiver1,
                  params.tokenName.symbol, "telINSUF_FUND Fund insufficient")
              testBasicTransaction(server, txParams)

              //then test mint
              params.mintResult = false
              testMintToken(server, params)

              //then test burn
              params.burnResult = true
              testBurnToken(server, params)
            })

            describe('发行带issuer的可增发可销毁的代币', function (){
              //test create first
              let params = {}
              params.testType = "带issuer的可增发可销毁的代币"
              params.from = addresses.sender1
              params.config = token.config_issuer_mint_burn
              params.existToken = token.existToken
              params.tokenName = getDynamicName()
              testCreateToken(server, params)

              //then test transaction of new token
              let txParams = createTransactionParams(params.testType, addresses.sender1, addresses.receiver1,
                  params.tokenName.symbol, "telINSUF_FUND Fund insufficient")
              testBasicTransaction(server, txParams)

              //then test mint
              params.mintResult = true
              testMintToken(server, params)

              //then test burn
              params.burnResult = true
              testBurnToken(server, params)
            })

          })

          afterEach(async function() {
            //set timeout to ensure the next test which use the same sender address can pass the test
            return await utility.timeout(data.defaultBlockTime)
          })
        })

      })

      describe('is working', function () {

        let categoryName = ''
        let txFunctionName = ''

        categoryName = '原生币swt'
        txFunctionName = 'jt_sendTransaction'
        describe(categoryName + '测试：' + txFunctionName, async function () {
          testForTransfer(server, categoryName, txFunctionName)
        })

        txFunctionName = 'jt_signTransaction'
        describe(categoryName + '测试：' + txFunctionName, async function () {
          testForTransfer(server, categoryName, txFunctionName)
        })

        // categoryName = '原生币swt压力测试'
        // testCases = createTestCasesForPressureTest(server, categoryName, 20)
        // testTestCases(server, categoryName, testCases)
      })

    })


  }

  //region fast sendTx case

  //region create test cases

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

  //region assistant create methods
  function createTestCase(title, server, txFunctionName, txParams, executeFunction, checkFunction, expecteResult){
    let testCase = {}
    testCase.type = "it"
    if(title) testCase.title = title
    if(server) testCase.server = server
    if(txFunctionName) testCase.txFunctionName = txFunctionName
    if(txParams) testCase.txParams = txParams
    if(executeFunction) testCase.executeFunction = executeFunction
    if(checkFunction) testCase.checkFunction = checkFunction
    if(expecteResult) testCase.expecteResult = expecteResult
    testCase.hasExecuted = false
    testCase.actualResult = []
    return testCase
  }

  function createTestCaseByParams(testCaseParams){
    return createTestCase(testCaseParams.title, testCaseParams.server, testCaseParams.txFunctionName,
        testCaseParams.txParams, testCaseParams.executeFunction, testCaseParams.checkFunction, testCaseParams.expecteResult)
  }

  function createTxParamsForTransfer(server){
    return server.createTransferParams(addresses.sender1.address, addresses.sender1.secret, null,
        addresses.receiver1.address, "1", 10, ['autotest'])
  }

  function createTxParamsForIssueToken(){

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
    let txFunctionName = 'jt_sendRawTransaction'
    let testCaseOfSendRawTx = createTestCase(testCaseOfSignTx.title + '-' + txFunctionName, testCaseOfSignTx.server,
        txFunctionName, null,null, null, expecteResultOfSendRawTx)
    testCaseOfSignTx.subTestCases = []
    testCaseOfSignTx.subTestCases.push(testCaseOfSendRawTx)
  }

  //当jt_sendTransaction和jt_signTransaction都通过测试时
  function createEitherTestCaseWhenSignPassAndSendRawTxPass(testCaseParams, updateTxParamsFunction){
    testCaseParams.txParams = createTxParamsForTransfer(testCaseParams.server)
    updateTxParamsFunction()
    testCaseParams.expecteResult = createExpecteResult(true)
    let testCase = createTestCaseByParams(testCaseParams)
    if(testCaseParams.txFunctionName === 'jt_signTransaction') {
      let expecteResultOfSendRawTx = createExpecteResult(true)
      addTestCaseForSendRawTx(testCase, expecteResultOfSendRawTx)
    }
    return testCase
  }

  //当jt_sendTransaction和jt_signTransaction都通不过测试时
  function createEitherTestCaseWhenSignFail(testCaseParams, updateTxParamsFunction){
    testCaseParams.txParams = createTxParamsForTransfer(testCaseParams.server)
    updateTxParamsFunction()
    let testCase = createTestCaseByParams(testCaseParams)
    return testCase
  }

  //当jt_signTransaction，sign可以通过，但sendRawTx会出错的情况的处理：这时sendRawTx的期望出错结果和jt_sendTransaction的期望出错结果一致。
  function createEitherTestCaseWhenSignPassButSendRawTxFail(testCaseParams, updateTxParamsFunction){
    testCaseParams.txParams = createTxParamsForTransfer(testCaseParams.server)
    updateTxParamsFunction()
    let testCase = createTestCaseByParams(testCaseParams)
    if(testCaseParams.txFunctionName === 'jt_signTransaction') {
      let expecteResultOfSignTx = createExpecteResult(true)
      testCase = createTestCase(testCaseParams.title, testCaseParams.server, testCaseParams.txFunctionName,
          testCaseParams.txParams, testCaseParams.executeFunction, testCaseParams.checkFunction, expecteResultOfSignTx)
      addTestCaseForSendRawTx(testCase, testCaseParams.expecteResult)
    }
    return testCase
  }

  //endregion

  //region main create methods

  //region transfer tx

  function createTestCaseParamsForCommonTransfer(server, categoryName, txFunctionName){
    let testCaseParams = {}
    testCaseParams.server = server
    testCaseParams.categoryName = categoryName
    testCaseParams.txFunctionName = txFunctionName
    testCaseParams.title = ''
    testCaseParams.txParams = createTxParamsForTransfer(server)
    testCaseParams.executeFunction = executeTestCaseOfSendTx
    testCaseParams.checkFunction = checkTestCaseOfSendTx
    testCaseParams.expecteResult = createExpecteResult(true)
    testCaseParams.testCase = {}
    testCaseParams.symbol = testCaseParams.txParams[0].symbol
    testCaseParams.showSymbol = (testCaseParams.symbol || testCaseParams.symbol == null
        || testCaseParams.symbol == "swt" || testCaseParams.symbol == "SWT") ? "" : ("/" + testCaseParams.symbol)
    if(txFunctionName === 'jt_sendTransaction') {
      testCaseParams.executeFunction = executeTestCaseOfSendTx
      testCaseParams.checkFunction = checkTestCaseOfSendTx
    }
    else if(txFunctionName === 'jt_signTransaction'){
      testCaseParams.executeFunction = executeTestCaseOfSignTxAndSendRawTx
      testCaseParams.checkFunction = checkTestCaseOfSignTxAndSendRawTx
    }
    else{
      throw new Error('txFunctionName doesn\'t exist!')
    }

    return testCaseParams
  }

  function createTestCasesForBasicTransaction(server, categoryName, txFunctionName){
    let testCases = []
    let testCaseParams = createTestCaseParamsForCommonTransfer(server, categoryName, txFunctionName)

    //region test cases for basic transfer
    testCaseParams.title = '0010\t发起' + testCaseParams.categoryName + '有效交易_01'
    {
      let testCase = createEitherTestCaseWhenSignPassAndSendRawTxPass(testCaseParams, function(){
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0020\t发起' + categoryName + '有效交易_02: 交易额填"' + testCaseParams.txParams[0].value + '"等'
    {
      let testCase = createEitherTestCaseWhenSignPassAndSendRawTxPass(testCaseParams, function(){
        testCaseParams.txParams[0].value = "123/swt"
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0030\t发起' + categoryName + '无效交易_01: 没有秘钥'
    {
      let testCase = createEitherTestCaseWhenSignFail(testCaseParams, function(){
        testCaseParams.txParams[0].secret = null
        testCaseParams.expecteResult = createExpecteResult(false, true, 'No secret found for')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0030\t发起' + categoryName + '无效交易_01: 错误的秘钥1'
    {
      let testCase = createEitherTestCaseWhenSignFail(testCaseParams, function(){
        testCaseParams.txParams[0].secret = '错误的秘钥'
        testCaseParams.expecteResult = createExpecteResult(false, true, 'Bad Base58 string')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0030\t发起' + categoryName + '无效交易_01: 错误的秘钥2'
    {
      let testCase = createEitherTestCaseWhenSignFail(testCaseParams, function(){
        testCaseParams.txParams[0].secret = testCaseParams.txParams[0].secret + '1'
        testCaseParams.expecteResult = createExpecteResult(false, true, 'Bad Base58 checksum')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0040\t发起' + categoryName + '无效交易_02: 错误的发起钱包地址（乱码字符串）'
    {
      let testCase = createEitherTestCaseWhenSignFail(testCaseParams, function(){
        testCaseParams.txParams[0].from = testCaseParams.txParams[0].from + '1'
        testCaseParams.expecteResult = createExpecteResult(false, true, 'Bad account address:')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0050\t发起' + categoryName + '无效交易_03: 错误的接收钱包地址（乱码字符串）'
    {
      let testCase = createEitherTestCaseWhenSignFail(testCaseParams, function(){
        testCaseParams.txParams[0].to = testCaseParams.txParams[0].to + '1'
        testCaseParams.expecteResult = createExpecteResult(false, true, 'Bad account address:')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0060\t发起' + categoryName + '无效交易_04: 交易额超过发起钱包余额'
    {
      let testCase = createEitherTestCaseWhenSignPassButSendRawTxFail(testCaseParams, function(){
        testCaseParams.txParams[0].value = "999999999999999" + testCaseParams.showSymbol
        testCaseParams.expecteResult = createExpecteResult(false, false, 'telINSUF_FEE_P Fee insufficient')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0070\t发起' + categoryName + '无效交易_05: 交易额为负数'
    {
      let testCase = createEitherTestCaseWhenSignPassButSendRawTxFail(testCaseParams, function(){
        testCaseParams.txParams[0].value = "-100" + testCaseParams.showSymbol
        testCaseParams.expecteResult = createExpecteResult(false, false,
            'temBAD_AMOUNT Can only send positive amounts')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0080\t发起' + categoryName + '无效交易_06: 交易额为空'
    {
      let testCase = createEitherTestCaseWhenSignPassButSendRawTxFail(testCaseParams, function(){
        testCaseParams.txParams[0].value = null
        testCaseParams.expecteResult = createExpecteResult(false, true, 'Invalid Number')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0080\t发起' + categoryName + '无效交易_06: 交易额为字符串'
    {
      let testCase = createEitherTestCaseWhenSignPassButSendRawTxFail(testCaseParams, function(){
        testCaseParams.txParams[0].value = "aawrwfsfs"
        testCaseParams.expecteResult = createExpecteResult(false, true, 'Invalid Number')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0090\t发起' + categoryName + '无效交易_07: 交易额为小于1的正小数'
    {
      let testCase = createEitherTestCaseWhenSignPassButSendRawTxFail(testCaseParams, function(){
        testCaseParams.txParams[0].value = "0.1" + testCaseParams.showSymbol
        testCaseParams.expecteResult = createExpecteResult(false, true, 'value must be integer type')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0100\t发起' + categoryName + '无效交易_08: 交易额为大于1的小数'
    {
      let testCase = createEitherTestCaseWhenSignPassButSendRawTxFail(testCaseParams, function(){
        testCaseParams.txParams[0].value = "1.1" + testCaseParams.showSymbol
        testCaseParams.expecteResult = createExpecteResult(false, true, 'value must be integer type')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0110\t发起' + categoryName + '无效交易_09: 交易额为负小数：-0.1、-1.23等'
    {
      let testCase = createEitherTestCaseWhenSignPassButSendRawTxFail(testCaseParams, function(){
        testCaseParams.txParams[0].value = "-0.1" + testCaseParams.showSymbol
        testCaseParams.expecteResult = createExpecteResult(false, true, 'value must be integer type')
      })
      testCases.push(testCase)
    }

    //endregion

    return testCases
  }

  function createTestCasesForTransactionWithMemo(server, categoryName, txFunctionName){
    let testCases = []
    let testCaseParams = createTestCaseParamsForCommonTransfer(server, categoryName, txFunctionName)

    //region test cases
    testCaseParams.title = '0120\t发起带有效memo的交易_01: memo格式为："memos":["大家好"]'
    {
      let testCase = createEitherTestCaseWhenSignPassAndSendRawTxPass(testCaseParams, function(){
        testCaseParams.txParams[0].memos = ["大家好"]
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0120\t发起带有效memo的交易_01: memo格式为奇数长度数字字串："memos":["12345"]'
    {
      let testCase = createEitherTestCaseWhenSignPassAndSendRawTxPass(testCaseParams, function(){
        testCaseParams.txParams[0].memos = ["12345"]
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0120\t发起带有效memo的交易_01: memo格式为偶数长度数字字串："memos":["123456"]'
    {
      let testCase = createEitherTestCaseWhenSignPassAndSendRawTxPass(testCaseParams, function(){
        testCaseParams.txParams[0].memos = ["123456"]
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0120\t发起带有效memo的交易_01: memo格式为字串："memos":["E5A4A7E5AEB6E5A5BDff"]'
    {
      let testCase = createEitherTestCaseWhenSignPassAndSendRawTxPass(testCaseParams, function(){
        testCaseParams.txParams[0].memos = ["E5A4A7E5AEB6E5A5BDff"]
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0130\t发起带有效memo的交易_02: memo格式为： "memos":[{"type":"ok","format":"utf8","data":"E5A4A7E5AEB6E5A5BD"}]'
    {
      let testCase = createEitherTestCaseWhenSignPassAndSendRawTxPass(testCaseParams, function(){
        testCaseParams.txParams[0].memos = [{"type":"ok","format":"utf8","data":"E5A4A7E5AEB6E5A5BD"}]
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0140\t发起带无效memo的交易_01: memo内容使整个交易内容超过900K'
    {
      let testCase = createEitherTestCaseWhenSignPassButSendRawTxFail(testCaseParams, function(){
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
      let testCase = createEitherTestCaseWhenSignPassButSendRawTxFail(testCaseParams, function(){
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

  function createTestCasesForTransactionWithFee(server, categoryName, txFunctionName){
    let testCases = []
    let testCaseParams = createTestCaseParamsForCommonTransfer(server, categoryName, txFunctionName)

    //region test cases
    testCaseParams.title = '0160\t发起带有效fee的交易_01: fee为默认值12'
    {
      let testCase = createEitherTestCaseWhenSignPassAndSendRawTxPass(testCaseParams, function(){
        testCaseParams.txParams[0].fee = data.defaultFee
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0160\t发起带有效fee的交易_01: fee为null'
    {
      let testCase = createEitherTestCaseWhenSignPassAndSendRawTxPass(testCaseParams, function(){
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0170\t发起带有效fee的交易_02: fee比12小，但是足以发起成功的交易'
    {
      let testCase = createEitherTestCaseWhenSignPassAndSendRawTxPass(testCaseParams, function(){
        testCaseParams.txParams[0].fee = 11
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0180\t发起带有效fee的交易_03: fee比12大但小于钱包余额'
    {
      let testCase = createEitherTestCaseWhenSignPassAndSendRawTxPass(testCaseParams, function(){
        testCaseParams.txParams[0].fee = 110
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0190\t发起带无效fee的交易_01: fee比12小（比如5），但是不足以发起成功的交易'
    {
      let testCase = createEitherTestCaseWhenSignPassButSendRawTxFail(testCaseParams, function(){
        testCaseParams.txParams[0].fee = 5
        testCaseParams.expecteResult = createExpecteResult(false, false,
            'tecINSUFF_FEE Insufficient balance to pay fee')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0200\t发起带无效fee的交易_02: fee为0'
    {
      let testCase = createEitherTestCaseWhenSignPassButSendRawTxFail(testCaseParams, function(){
        testCaseParams.txParams[0].fee = 0
        testCaseParams.expecteResult = createExpecteResult(false, false,
            'tecINSUFF_FEE Insufficient balance to pay fee')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0210\t发起带无效fee的交易_03: fee为大于0的小数，比如12.5、5.5'
    {
      let testCase = createEitherTestCaseWhenSignPassButSendRawTxFail(testCaseParams, function(){
        testCaseParams.txParams[0].fee = 12.5
        testCaseParams.expecteResult = createExpecteResult(false, false,
            'tecINSUFF_FEE Insufficient balance to pay fee')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0220\t发起带无效fee的交易_04: fee为大于发起钱包' + categoryName + '余额的整数'
    {
      let testCase = createEitherTestCaseWhenSignPassButSendRawTxFail(testCaseParams, function(){
        testCaseParams.txParams[0].fee = 999999999999999
        testCaseParams.expecteResult = createExpecteResult(false, false,
            'telINSUF_FEE_P Fee insufficient')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0230\t发起带无效fee的交易_05: fee为负数，比如-3.5、-555等'
    {
      let testCase = createEitherTestCaseWhenSignPassButSendRawTxFail(testCaseParams, function(){
        testCaseParams.txParams[0].fee = -35
        testCaseParams.expecteResult = createExpecteResult(false, false,
            'tecINSUFF_FEE Insufficient balance to pay fee')
      })
      testCases.push(testCase)
    }

    testCaseParams.title = '0240\t发起带无效fee的交易_06: fee为字符串'
    {
      let testCase = createEitherTestCaseWhenSignFail(testCaseParams, function(){
        testCaseParams.txParams[0].fee = "35"
        testCaseParams.expecteResult = createExpecteResult(false, true,
            'interface conversion: interface {} is string, not float64')
      })
      testCases.push(testCase)
    }
    //endregion

    return testCases
  }

  //endregion

  //region issue token tx

  //endregion

  function example(server, categoryName, txFunctionName){
    let testCases = []
    let testCaseParams = createTestCaseParamsForCommonTransfer(server, categoryName, txFunctionName)

    //region test cases
    let testAll = true
    if(testAll){

      testCaseParams.title = '0160\t发起带有效fee的交易_01: fee为默认值12'
      {
        let testCase = createEitherTestCaseWhenSignPassAndSendRawTxPass(testCaseParams, function(){
          testCaseParams.txParams[0].fee = data.defaultFee
        })
        testCases.push(testCase)
      }

      testCaseParams.title = '0160\t发起带有效fee的交易_01: fee为null'
      {
        let testCase = createEitherTestCaseWhenSignPassAndSendRawTxPass(testCaseParams, function(){
        })
        testCases.push(testCase)
      }

      testCaseParams.title = '0170\t发起带有效fee的交易_02: fee比12小，但是足以发起成功的交易'
      {
        let testCase = createEitherTestCaseWhenSignPassAndSendRawTxPass(testCaseParams, function(){
          testCaseParams.txParams[0].fee = 11
        })
        testCases.push(testCase)
      }

      testCaseParams.title = '0180\t发起带有效fee的交易_03: fee比12大但小于钱包余额'
      {
        let testCase = createEitherTestCaseWhenSignPassAndSendRawTxPass(testCaseParams, function(){
          testCaseParams.txParams[0].fee = 110
        })
        testCases.push(testCase)
      }

      testCaseParams.title = '0190\t发起带无效fee的交易_01: fee比12小（比如5），但是不足以发起成功的交易'
      {
        let testCase = createEitherTestCaseWhenSignPassButSendRawTxFail(testCaseParams, function(){
          testCaseParams.txParams[0].fee = 5
          testCaseParams.expecteResult = createExpecteResult(false, false,
              'tecINSUFF_FEE Insufficient balance to pay fee')
        })
        testCases.push(testCase)
      }

      testCaseParams.title = '0200\t发起带无效fee的交易_02: fee为0'
      {
        let testCase = createEitherTestCaseWhenSignPassButSendRawTxFail(testCaseParams, function(){
          testCaseParams.txParams[0].fee = 0
          testCaseParams.expecteResult = createExpecteResult(false, false,
              'tecINSUFF_FEE Insufficient balance to pay fee')
        })
        testCases.push(testCase)
      }

      testCaseParams.title = '0210\t发起带无效fee的交易_03: fee为大于0的小数，比如12.5、5.5'
      {
        let testCase = createEitherTestCaseWhenSignPassButSendRawTxFail(testCaseParams, function(){
          testCaseParams.txParams[0].fee = 12.5
          testCaseParams.expecteResult = createExpecteResult(false, false,
              'tecINSUFF_FEE Insufficient balance to pay fee')
        })
        testCases.push(testCase)
      }

      testCaseParams.title = '0220\t发起带无效fee的交易_04: fee为大于发起钱包' + categoryName + '余额的整数'
      {
        let testCase = createEitherTestCaseWhenSignPassButSendRawTxFail(testCaseParams, function(){
          testCaseParams.txParams[0].fee = 999999999999999
          testCaseParams.expecteResult = createExpecteResult(false, false,
              'telINSUF_FEE_P Fee insufficient')
        })
        testCases.push(testCase)
      }

      testCaseParams.title = '0230\t发起带无效fee的交易_05: fee为负数，比如-3.5、-555等'
      {
        let testCase = createEitherTestCaseWhenSignPassButSendRawTxFail(testCaseParams, function(){
          testCaseParams.txParams[0].fee = -35
          testCaseParams.expecteResult = createExpecteResult(false, false,
              'tecINSUFF_FEE Insufficient balance to pay fee')
        })
        testCases.push(testCase)
      }

      testCaseParams.title = '0240\t发起带无效fee的交易_06: fee为字符串'
      {
        let testCase = createEitherTestCaseWhenSignFail(testCaseParams, function(){
          testCaseParams.txParams[0].fee = "35"
          testCaseParams.expecteResult = createExpecteResult(false, true,
              'interface conversion: interface {} is string, not float64')
        })
        testCases.push(testCase)
      }


    }
    //endregion


    return testCases
  }


  //endregion

  //endregion

  //region execute test cases

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

  //region check test cases

  //region check send tx result
  async function checkTestCaseOfSendTx(testCase){
    await checkResponseOfTransfer(testCase, testCase.txParams)
  }

  async function checkResponseOfTransfer(testCase, txParams){
    let responseOfSendTx = testCase.actualResult[0]
    checkResponse(testCase.expecteResult.needPass, responseOfSendTx)
    if(testCase.expecteResult.needPass){
      expect(responseOfSendTx).to.be.jsonSchema(schema.SENDTX_SCHEMA)
      let hash = responseOfSendTx.result[0]
      let params = txParams[0]
      await getTxByHash(testCase.server, hash, false).then(async function(responseOfGetTx){
        checkResponse(true, responseOfGetTx)
        // expect(responseOfGetTx.result).to.be.jsonSchema(schema.TX_SCHEMA)
        expect(responseOfGetTx.result.hash).to.be.equal(hash)
        await compareActualTxWithTxParams(params, responseOfGetTx.result)
      }, function (err) {
        expect(err).to.be.ok
      })
    }
    else{
      let expecteResult = testCase.expecteResult
      expect((expecteResult.isErrorInResult) ? responseOfSendTx.result : responseOfSendTx.message).to.contains(expecteResult.expectedError)
    }
  }

  function compareActualTxWithTxParams(commonParams, tx){
    return new Promise(function(resolve){
      expect(tx.Account).to.be.equals(commonParams.from)
      expect(tx.Destination).to.be.equals(commonParams.to)
      expect(tx.Fee).to.be.equals(((commonParams.fee) ? commonParams.fee : 10).toString())
      //check value
      if(commonParams.symbol){
        expect(tx.Amount.currency).to.be.equals(commonParams.symbol)
        expect(tx.Amount.value + "/" + tx.Amount.currency).to.be.equals(commonParams.value)
      }
      else{
        expect(tx.Amount).to.be.equals(commonParams.value)
      }
      //check memos
      if(tx.Memos){
        let memos = tx.Memos
        let expectedMemos = commonParams.memos
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

  function getTxByHash(server, hash, isRetry){
    return server.responseGetTxByHash(hash)
        .then(async function (value) {
          //retry
          if(!isRetry && (value.result.toString().indexOf('can\'t find transaction') != -1
              || value.result.toString().indexOf('no such transaction') != -1)){
            logger.debug("===Try responseGetTxByHash again!===")
            await utility.timeout(data.retryPauseTime)
            return getTxByHash(server, hash, true)
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

  //region process sequence
  function getSequence(server, from){
    return new Promise(function (resolve){
      if(sequenceMap.has(from)){
        logger.debug("===sequence   sequenceMap:" + sequenceMap.get(from))
        resolve(sequenceMap.get(from))
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
    sequenceMap.set(from, sequence)
  }
  //endregion

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

  function testForTransfer(server, categoryName, txFunctionName){
    let testName = ''
    let describeTitle = ''
    let testCases = []

    testName = '测试基本交易'
    describeTitle = testName + '-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
    testCases = createTestCasesForBasicTransaction(server, categoryName, txFunctionName)
    testTestCases(server, describeTitle, testCases)

    testName = '测试交易memo'
    describeTitle = testName + '-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
    testCases = createTestCasesForTransactionWithMemo(server, categoryName, txFunctionName)
    testTestCases(server, describeTitle, testCases)

    testName = '测试交易Fee'
    describeTitle = testName + '-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
    testCases = createTestCasesForTransactionWithFee(server, categoryName, txFunctionName)
    testTestCases(server, describeTitle, testCases)
  }

  //endregion

  //region pressure test

  function createTestCasesForPressureTest(server, categoryName, testCount){
    let testCases = []
    let txParams = createTxParamsForTransfer(server)
    let txFunctionName = 'jt_sendTransaction'
    let executeFunction = executeTestCaseOfSendTx
    let checkFunction = checkTestCaseOfSendTx
    let expecteResult = createExpecteResult(true)

    for(let i = 0; i <= testCount; i++){
      let testCase = createTestCase('0010\t发起' + categoryName + '有效交易_01', server, txFunctionName, txParams,
          executeFunction, checkFunction, expecteResult)
      testCases.push(testCase)
    }
    return testCases
  }

  //endregion

  //region common test case

  //testcase
  function createTransactionParams(testType, from, to, symbol, exceedingErrorMessage){
    let showSymbol = (symbol || symbol == null || symbol == "swt" || symbol == "SWT") ? "" : ("/" + symbol)
    let params = {}
    params.testType = testType
    params.from = from.address
    params.secret = from.secret
    params.to = to.address
    params.symbol = symbol
    params.showSymbol = showSymbol
    params.value = "1" + showSymbol
    params.value2 = "123/" + ((symbol || symbol == null) ? "swt" : symbol)
    params.exceedingValue = "999999999999999" + showSymbol
    params.exceedingErrorMessage = exceedingErrorMessage
    params.nagetiveValue = "-100" + showSymbol
    params.stringValue = "aawrwfsfs"
    params.below1DecimalValue = "0.1" + showSymbol
    params.over1DecimalValue = "1.1" + showSymbol
    params.negativeDecimalValue = "-0.1" + showSymbol
    return params
  }

  function createIssueTokenParams(testType, account, config){
    let token = getDynamicName()
    let params = {}
    params.testType = testType
    params.from = account.address
    params.secret = account.secret
    params.name = token.name
    params.symbol = token.symbol
    params.decimals = config.decimals
    params.total_supply = config.total_supply
    params.local = config.local
    params.flags = config.flags
    params.fee = config.fee
    return params
  }

  function cloneParams(originalParams){
    let params = {}
    if(originalParams.from) params.from = originalParams.from
    if(originalParams.secret) params.secret = originalParams.secret
    if(originalParams.to) params.to = originalParams.to
    if(originalParams.value) params.value = originalParams.value
    if(originalParams.fee) params.fee = originalParams.fee
    if(originalParams.memos) params.memos = originalParams.memos
    if(originalParams.type) params.type = originalParams.type
    if(originalParams.name) params.name = originalParams.name
    if(originalParams.symbol) params.symbol = originalParams.symbol
    if(originalParams.decimals) params.decimals = originalParams.decimals
    if(originalParams.total_supply) params.total_supply = originalParams.total_supply
    if(originalParams.local) params.local = originalParams.local
    if(originalParams.flags) params.flags = originalParams.flags
    return params
  }

  async function testSendTxCases(cases){
    for(let i = 0; i < cases.length; i++){
      await testSingleSendTxCase(cases[i], i)
    }
  }

  function testSingleSendTxCase(caseParams, index){
    let title = caseParams.title
    let server = caseParams.server
    let commonParams = caseParams.commonParams
    let retentiveParams = caseParams.retentiveParams
    let isSuccess = caseParams.isSuccess
    let expectedError = caseParams.expectedError
    it("Case " + index + " [ " + title + " ]", function () {
      return isSuccess ? checkSendTxSuccess(server, commonParams, retentiveParams)
          : checkSendTxFailure(server, commonParams, retentiveParams, expectedError.isInResult, expectedError.content)
    })

    it('0010\t发起' + params.testType + '有效交易_01', function () {
      let commonParams = cloneParams(params)
      return checkSendTxSuccess(server, commonParams, retentiveParams)
    })
  }

  function testBasicTransaction(server, params, func) {
    let retentiveParams = {}
    retentiveParams.function = func

    describe('测试基本交易', function () {

      it('0010\t发起' + params.testType + '有效交易_01', function () {
        let commonParams = cloneParams(params)
        return checkSendTxSuccess(server, commonParams, retentiveParams)
      })

      it('0010\t发起' + params.testType + '有效交易_01：连续交易', async function () {
        let commonParams = cloneParams(params)
        let sendCount = 20
        let finishCount = 0;
        await sendTxWithSequenceContinuously(server, commonParams, retentiveParams, sendCount).then(async (txHashes)=>{
          for(let i = 0; i < txHashes.length; i++){
            let value = txHashes[i]
            checkResponse(true, value)
            expect(value).to.be.jsonSchema(schema.SENDTX_SCHEMA)
            let hash = value.result[0]
            await checkSendTxResponse(server, hash)
            finishCount++
            if(finishCount == sendCount) {
              logger.debug("=== sendTxWithSequenceContinuously: " + finishCount + " checks done! ===")
              return txHashes
            }
          }
        })
      })

      it('0020\t发起' + params.testType + '有效交易_02: 交易额填"1/' + params.symbol + '或“100/' + params.symbol + '”等', function () {
        let commonParams = cloneParams(params)
        commonParams.value = params.value2
        return checkSendTxSuccess(server, commonParams, retentiveParams)
      })

      it('0030\t发起' + params.testType + '无效交易_01: 没有秘钥', function () {
        let commonParams = cloneParams(params)
        commonParams.secret = null
        return checkSendTxFailure(server, commonParams, retentiveParams, true, 'No secret found for')
      })

      it('0030\t发起' + params.testType + '无效交易_01: 错误的秘钥1', function () {
        let commonParams = cloneParams(params)
        commonParams.secret = '错误的秘钥'
        return checkSendTxFailure(server, commonParams, retentiveParams, true, 'Bad Base58 string')
      })

      it('0030\t发起' + params.testType + '无效交易_01: 错误的秘钥2', function () {
        let commonParams = cloneParams(params)
        commonParams.secret = commonParams.secret + '1'
        return checkSendTxFailure(server, commonParams, retentiveParams, true, 'Bad Base58 checksum')
      })

      it('0040\t发起' + params.testType + '无效交易_02: 错误的发起钱包地址（乱码字符串）', function () {
        let commonParams = cloneParams(params)
        commonParams.from = commonParams.from + '1'
        return checkSendTxFailure(server, commonParams, retentiveParams, true, 'Bad account address:')
      })

      it('0050\t发起' + params.testType + '无效交易_03: 错误的接收钱包地址（乱码字符串）', function () {
        let commonParams = cloneParams(params)
        commonParams.to = commonParams.to + '1'
        return checkSendTxFailure(server, commonParams, retentiveParams, true, 'Bad account address:')
      })

      it('0060\t发起' + params.testType + '无效交易_04: 交易额超过发起钱包余额', function () {
        let commonParams = cloneParams(params)
        commonParams.value = params.exceedingValue
        return checkSendTxFailure(server, commonParams, retentiveParams, false, params.exceedingErrorMessage)
      })

      it('0070\t发起' + params.testType + '无效交易_05: 交易额为负数', function () {
        let commonParams = cloneParams(params)
        commonParams.value = params.nagetiveValue
        return checkSendTxFailure(server, commonParams, retentiveParams, false, 'temBAD_AMOUNT Can only send positive amounts')
      })

      it('0080\t发起' + params.testType + '无效交易_06: 交易额为空', function () {
        let commonParams = cloneParams(params)
        commonParams.value = null
        return checkSendTxFailure(server, commonParams, retentiveParams, true, 'Invalid Number')
      })

      it('0080\t发起' + params.testType + '无效交易_06: 交易额为字符串', function () {
        let commonParams = cloneParams(params)
        commonParams.value = params.stringValue
        return checkSendTxFailure(server, commonParams, retentiveParams, true, 'Invalid Number')
      })

      it('0090\t发起' + params.testType + '无效交易_07: 交易额为小于1的正小数', function () {
        let commonParams = cloneParams(params)
        commonParams.value = params.below1DecimalValue
        return checkSendTxFailure(server, commonParams, retentiveParams, true, 'value must be integer type')
      })

      it('0100\t发起' + params.testType + '无效交易_08: 交易额为大于1的小数', function () {
        let commonParams = cloneParams(params)
        commonParams.value = params.over1DecimalValue
        return checkSendTxFailure(server, commonParams, retentiveParams, true, 'value must be integer type')
      })

      it('0110\t发起' + params.testType + '无效交易_09: 交易额为负小数：-0.1、-1.23等', function () {
        let commonParams = cloneParams(params)
        commonParams.value = params.negativeDecimalValue
        return checkSendTxFailure(server, commonParams, retentiveParams, true, 'value must be integer type')
      })


    })

    describe('测试带memo的交易', function () {

      it('0120\t发起带有效memo的交易_01: memo格式为："memos":["大家好"]', function () {
        let commonParams = cloneParams(params)
        commonParams.memos = ["大家好"]
        return checkSendTxSuccess(server, commonParams, retentiveParams)
      })

      it('0120\t发起带有效memo的交易_01: memo格式为奇数长度数字字串："memos":["12345"]', function () {
        let commonParams = cloneParams(params)
        commonParams.memos = ["12345"]
        return checkSendTxSuccess(server, commonParams, retentiveParams)
      })

      it('0120\t发起带有效memo的交易_01: memo格式为偶数长度数字字串："memos":["123456"]', function () {
        let commonParams = cloneParams(params)
        commonParams.memos = ["123456"]
        return checkSendTxSuccess(server, commonParams, retentiveParams)
      })

      it('0120\t发起带有效memo的交易_01: memo格式为字串："memos":["E5A4A7E5AEB6E5A5BDff"]', function () {
        let commonParams = cloneParams(params)
        commonParams.memos = ["E5A4A7E5AEB6E5A5BDff"]
        return checkSendTxSuccess(server, commonParams, retentiveParams)
      })

      it('0130\t发起带有效memo的交易_02: memo格式为： "memos":[{"type":"ok","format":"utf8","data":"E5A4A7E5AEB6E5A5BD"}]', function () {
        let commonParams = cloneParams(params)
        commonParams.memos = [{"type":"ok","format":"utf8","data":"E5A4A7E5AEB6E5A5BD"}]
        return checkSendTxSuccess(server, commonParams, retentiveParams)
      })

      it('0140\t发起带无效memo的交易_01: memo内容使整个交易内容超过900K', function () {
        //memo内容使整个交易内容超过900K
        let memos = "E5A4A7E5AEB6E5A5BD"
        for(let i = 0; i < 18; i++){
          memos += memos;
        }
        let commonParams = cloneParams(params)
        commonParams.memos = memos
        return checkSendTxFailure(server, commonParams, retentiveParams, true, 'memos data error')
      })

      it('0150\t发起带无效memo的交易_02: memo内容使整个交易内容超过900K', function () {
        //memo内容使整个交易内容超过900K
        let memos = "E5A4A7E5AEB6E5A5BD"
        for(let i = 0; i < 18; i++){
          memos += memos;
        }
        let commonParams = cloneParams(params)
        commonParams.memos = memos
        return checkSendTxFailure(server, commonParams, retentiveParams, true, 'memos data error')
      })

    })

    describe('测试交易fee', function (){

      it('0160\t发起带有效fee的交易_01: fee为默认值12', function () {
        let commonParams = cloneParams(params)
        commonParams.fee = data.defaultFee
        return checkSendTxSuccess(server, commonParams, retentiveParams)
      })

      it('0160\t发起带有效fee的交易_01: fee为null', function () {
        let commonParams = cloneParams(params)
        return checkSendTxSuccess(server, commonParams, retentiveParams)
      })

      it('0170\t发起带有效fee的交易_02: fee比12小，但是足以发起成功的交易', function () {
        let commonParams = cloneParams(params)
        commonParams.fee = 11
        return checkSendTxSuccess(server, commonParams, retentiveParams)
      })

      it('0180\t发起带有效fee的交易_03: fee比12大但小于钱包余额', function () {
        let commonParams = cloneParams(params)
        commonParams.fee = 110
        return checkSendTxSuccess(server, commonParams, retentiveParams)
      })

      it('0190\t发起带无效fee的交易_01: fee比12小（比如5），但是不足以发起成功的交易', function () {
        let commonParams = cloneParams(params)
        commonParams.fee = 5
        return checkSendTxFailure(server, commonParams, retentiveParams, false, 'tecINSUFF_FEE Insufficient balance to pay fee')
      })

      it('0200\t发起带无效fee的交易_02: fee为0', function () {
        let commonParams = cloneParams(params)
        commonParams.fee = 0
        return checkSendTxFailure(server, commonParams, retentiveParams, false, 'tecINSUFF_FEE Insufficient balance to pay fee')
      })

      it('0210\t发起带无效fee的交易_03: fee为大于0的小数，比如12.5、5.5', function () {
        let commonParams = cloneParams(params)
        commonParams.fee = 12.5
        return checkSendTxFailure(server, commonParams, retentiveParams, false,
            'tecINSUFF_FEE Insufficient balance to pay fee')
      })

      it('0220\t发起带无效fee的交易_04: fee为大于发起钱包' + params.testType + '余额的整数', function () {
        let commonParams = cloneParams(params)
        commonParams.fee = 999999999999999
        return checkSendTxFailure(server, commonParams, retentiveParams, false,
            'telINSUF_FEE_P Fee insufficient')
      })

      it('0230\t发起带无效fee的交易_05: fee为负数，比如-3.5、-555等', function () {
        let commonParams = cloneParams(params)
        commonParams.fee = -35
        return checkSendTxFailure(server, commonParams, retentiveParams, false,
            'tecINSUFF_FEE Insufficient balance to pay fee')
      })

      it('0240\t发起带无效fee的交易_06: fee为字符串', function () {
        let commonParams = cloneParams(params)
        commonParams.fee = "35"
        return checkSendTxFailure(server, commonParams, retentiveParams, true,
            'interface conversion: interface {} is string, not float64')
      })

    })
  }

  function testCreateToken(server, params, func){
    let type = params.testType
    // let from = params.from
    // let config = params.config
    // let existToken = params.existToken
    // let tokenName = params.tokenName

    let retentiveParams = {}
    retentiveParams.function = func

    describe('测试' + type + '发行', function () {

      // it('0010\t发起' + params.testType + '有效交易_01', function () {
      //   let commonParams = cloneParams(params)
      //   return checkSendTxSuccess(server, commonParams, retentiveParams)
      // })

      it('0270\t发行' + type + '', function () {
        let commonParams = cloneParams(params)
        return checkSendTxSuccess(server, commonParams, retentiveParams)

        // return Promise.resolve(server.responseIssueToken(
        //     config.type,
        //     from.address,
        //     from.secret,
        //     tokenName.name,
        //     tokenName.symbol,
        //     config.decimals,
        //     config.total_supply,
        //     config.local,
        //     config.flags,
        //     config.fee,
        // )).then(async function (value) {
        //   await checkSendTxSuccess(server, value)
        //   return await checkBalanceChange(server, from.address, tokenName.symbol, Number(config.total_supply))
        // })

      })

      it('0290\t发行' + type + '_无效的type参数', function () {
        return Promise.resolve(server.responseIssueToken(
            "issuecoin",
            from.address,
            from.secret,
            tokenName.name,
            tokenName.symbol,
            config.decimals,
            config.total_supply,
            config.local,
            config.flags,
            config.fee,
        )).then(async function (value) {
          checkResponse(false, value)
          expect(value.result).to.contains('Invalid Number:  Reason: strconv.ParseUint: parsing "": invalid syntax')
        })
      })

      it('0300\t发行' + type + '_无效的from参数', function () {
        return Promise.resolve(server.responseIssueToken(
            config.type,
            "from.address",
            from.secret,
            tokenName.name,
            tokenName.symbol,
            config.decimals,
            config.total_supply,
            config.local,
            config.flags,
            config.fee,
        )).then(async function (value) {
          checkResponse(false, value)
          expect(value.result).to.contains('Bad account address: from.address: Bad Base58 string: from.address')
        })
      })

      it('0310\t发行' + type + '_无效的name参数:很长的字符串', function () {
        return Promise.resolve(server.responseIssueToken(
            config.type,
            from.address,
            from.secret,
            "tokenName.name12345678901234567890",
            tokenName.symbol,
            config.decimals,
            config.total_supply,
            config.local,
            config.flags,
            config.fee,
        )).then(async function (value) {
          checkResponse(false, value)
          expect(value.message).to.contains('failed to submit transaction')
        })
      })

      it('0310\t发行' + type + '_无效的name参数:被已有代币使用过的name', function () {
        return Promise.resolve(server.responseIssueToken(
            config.type,
            from.address,
            from.secret,
            existToken.name,
            tokenName.symbol,
            config.decimals,
            config.total_supply,
            config.local,
            config.flags,
            config.fee,
        )).then(async function (value) {
          checkResponse(false, value)
          expect(value.message).to.contains('failed to submit transaction')
        })
      })

      it('0320\t发行' + type + '_无效的symbol参数:很长的字符串', function () {
        return Promise.resolve(server.responseIssueToken(
            config.type,
            from.address,
            from.secret,
            tokenName.name,
            "tokenName.symbol",
            config.decimals,
            config.total_supply,
            config.local,
            config.flags,
            config.fee,
        )).then(async function (value) {
          checkResponse(false, value)
          expect(value.result).to.contains('runtime error: invalid memory address or nil pointer dereference')
        })
      })

      it('0320\t发行' + type + '_无效的symbol参数:被已有代币使用过的name', function () {
        return Promise.resolve(server.responseIssueToken(
            config.type,
            from.address,
            from.secret,
            token.name,
            existToken.symbol,
            config.decimals,
            config.total_supply,
            config.local,
            config.flags,
            config.fee,
        )).then(async function (value) {
          checkResponse(false, value)
          expect(value.result).to.contains('no name')
        })
      })

      it('0330\t发行' + type + '_无效的decimals参数:字符串', function () {
        return Promise.resolve(server.responseIssueToken(
            config.type,
            from.address,
            from.secret,
            tokenName.name,
            tokenName.symbol,
            "config.decimals",
            config.total_supply,
            config.local,
            config.flags,
            config.fee,
        )).then(async function (value) {
          checkResponse(false, value)
          expect(value.result).to.contains('nterface conversion: interface {} is string, not float64')
        })
      })

      it('0330\t发行' + type + '_无效的decimals参数:负数', function () {
        return Promise.resolve(server.responseIssueToken(
            config.type,
            from.address,
            from.secret,
            tokenName.name,
            tokenName.symbol,
            -8,
            config.total_supply,
            config.local,
            config.flags,
            config.fee,
        )).then(async function (value) {
          checkResponse(false, value)
          expect(value.message).to.contains('tefNO_PERMISSION_ISSUE No permission issue')
        })
      })

      it('0330\t发行' + type + '_无效的decimals参数:小数', function () {
        return Promise.resolve(server.responseIssueToken(
            config.type,
            from.address,
            from.secret,
            tokenName.name,
            tokenName.symbol,
            11.64,
            config.total_supply,
            config.local,
            config.flags,
            config.fee,
        )).then(async function (value) {
          checkResponse(false, value)
          expect(value.message).to.contains('tefNO_PERMISSION_ISSUE No permission issue')
        })
      })

      it('0340\t发行' + type + '_无效的total_supply参数:字符串', function () {
        return Promise.resolve(server.responseIssueToken(
            config.type,
            from.address,
            from.secret,
            tokenName.name,
            tokenName.symbol,
            config.decimals,
            "config.total_supply",
            config.local,
            config.flags,
            config.fee,
        )).then(async function (value) {
          checkResponse(false, value)
          expect(value.result).to.contains('strconv.ParseInt: parsing')
        })
      })

      it('0340\t发行' + type + '_无效的total_supply参数:负数', function () {
        return Promise.resolve(server.responseIssueToken(
            config.type,
            from.address,
            from.secret,
            tokenName.name,
            config.decimals,
            -10000000,
            config.total_supply,
            config.local,
            config.flags,
            config.fee,
        )).then(async function (value) {
          checkResponse(false, value)
          expect(value.result).to.contains('interface conversion: interface {} is float64, not string')
        })
      })

      it('0340\t发行' + type + '_无效的total_supply参数:小数', function () {
        return Promise.resolve(server.responseIssueToken(
            config.type,
            from.address,
            from.secret,
            tokenName.name,
            config.decimals,
            10000.12345678,
            config.total_supply,
            config.local,
            config.flags,
            config.fee,
        )).then(async function (value) {
          checkResponse(false, value)
          expect(value.result).to.contains('interface conversion: interface {} is float64, not string')
        })
      })

    })

  }

  function testMintToken(server, params){
    let type = params.testType
    let from = params.from
    let config = params.config
    let tokenName = params.tokenName
    let mintResult = params.mintResult

    describe('测试' + type + '增发', function () {

      it('0370\t增发可增发的代币', async function () {
        let oldBalance = await server.getBalance(from.address, tokenName.symbol)
        return Promise.resolve(server.responseIssueToken(
            config.type,
            from.address,
            from.secret,
            tokenName.name,
            tokenName.symbol,
            config.decimals,
            config.total_supply,
            config.local,
            config.flags,
            config.fee,
        )).then(async function (value) {
          if(mintResult){
            await checkSendTxSuccess(server, value)
            return await checkBalanceChange(server, from.address, tokenName.symbol,
                Number(oldBalance.value) + Number(config.total_supply))
          }
          else{
            checkResponse(false, value)
            expect(value.result).to.contains('tefNO_PERMISSION_ISSUE No permission issue')
            return value
          }
        })
      })

    })
  }

  function testBurnToken(server, params){
    let type = params.testType
    let from = params.from
    let config = params.config
    let tokenName = params.tokenName
    let burnResult = params.burnResult

    describe('测试' + type + '销毁', function () {

      it('0380\t销毁' + type + '', async function () {
        let oldBalance = await server.getBalance(from.address, tokenName.symbol)
        let value = 0 - (Math.floor(Number(oldBalance.value) / 10));

        return Promise.resolve(server.responseIssueToken(
            config.type,
            from.address,
            from.secret,
            tokenName.name,
            tokenName.symbol,
            config.decimals,
            value.toString(),
            config.local,
            config.flags,
            config.fee,
        )).then(async function (value) {
          if(burnResult){
            await checkSendTxSuccess(server, value)
            return await checkBalanceChange(server, from.address, tokenName.symbol,
                Number(oldBalance.value) - value)
          }
          else{
            checkResponse(false, value)
            expect(value.message).to.contains('tefNO_PERMISSION_ISSUE No permission issue')
            return value
          }
        })
      })

      it('0420\t无效地销毁' + type + '', async function () {
        let oldBalance = await server.getBalance(from.address, tokenName.symbol)
        let value = 0 - (Number(oldBalance.value) * 10);

        return Promise.resolve(server.responseIssueToken(
            config.type,
            from.address,
            from.secret,
            tokenName.name,
            tokenName.symbol,
            config.decimals,
            value.toString(),
            config.local,
            config.flags,
            config.fee,
        )).then(async function (value) {
          if(burnResult){
            await checkSendTxSuccess(server, value)
            return await checkBalanceChange(server, from.address, tokenName.symbol,
                Number(oldBalance.value) - value)
          }
          else{
            checkResponse(false, value)
            expect(value.message).to.contains('tefNO_PERMISSION_ISSUE No permission issue')
            return value
          }
        })
      })

      it('0380\t销毁所有' + type + '', async function () {
        let oldBalance = await server.getBalance(from.address, tokenName.symbol)
        let value = 0 - (Number(oldBalance.value));

        return Promise.resolve(server.responseIssueToken(
            config.type,
            from.address,
            from.secret,
            tokenName.name,
            tokenName.symbol,
            config.decimals,
            value.toString(),
            config.local,
            config.flags,
            config.fee,
        )).then(async function (value) {
          if(burnResult){
            await checkSendTxSuccess(server, value)
            return await checkBalanceChange(server, from.address, tokenName.symbol,
                Number(oldBalance.value) - value)
          }
          else{
            checkResponse(false, value)
            expect(value.message).to.contains('tefNO_PERMISSION_ISSUE No permission issue')
            // expect(value.message).to.contains('temINVALID The transaction is ill-formed')
            return value
          }
        })
      })
    })
  }

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

  function checkSendTxSuccess(server, commonParams, retentiveParams){
    let func = (!retentiveParams || !retentiveParams.function) ? sendTx : retentiveParams.function
    return Promise.resolve(func(server, commonParams, retentiveParams)).then(async function (value) {
      await checkCommonSendTxSuccess(server, value).then((tx)=>{
        expect(tx.Account).to.be.equals(commonParams.from)
        expect(tx.Destination).to.be.equals(commonParams.to)
        expect(tx.Fee).to.be.equals(((commonParams.fee) ? commonParams.fee : 10).toString())
        //check value
        if(commonParams.showSymbol && commonParams.showSymbol != ""){
          expect(tx.Amount.currency).to.be.equals(commonParams.symbol)
          expect(tx.Amount.value + "/" + tx.Amount.currency).to.be.equals(commonParams.value)
        }
        else{
          expect(tx.Amount).to.be.equals(commonParams.value)
        }
        //check memos
        if(tx.Memos){
          let memos = tx.Memos
          let expectedMemos = commonParams.memos
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
      })
    })
  }

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

  function checkSendTxFailure(server, commonParams, retentiveParams, isErrorInResult, expectedError){
    return Promise.resolve(sendTx(server, commonParams, retentiveParams)).then(function (value) {
      checkResponse(false, value)
      expect((isErrorInResult) ? value.result : value.message).to.contains(expectedError)
    }, function (err) {
      expect(err).to.be.ok
    })
  }

  async function checkCommonSendTxSuccess(server, value){
    checkResponse(true, value)
    expect(value).to.be.jsonSchema(schema.SENDTX_SCHEMA)
    let hash = value.result[0]
    await utility.timeout(data.defaultBlockTime)
    return checkSendTxResponse(server, hash)
  }

  function checkSendTxResponse(server, hash, isRetry){
    return server.responseGetTxByHash(hash)
        .then(async function (value) {
          //retry
          if(!isRetry && (value.result.toString().indexOf('can\'t find transaction') != -1
              || value.result.toString().indexOf('no such transaction') != -1)){
            logger.debug("===Try responseGetTxByHash again!===")
            await utility.timeout(data.retryPauseTime)
            return checkSendTxResponse(server, hash, true)
          }
          checkResponse(true, value)
          // expect(value.result).to.be.jsonSchema(schema.TX_SCHEMA)
          expect(value.result.hash).to.be.equal(hash)
          return value.result
        }).catch(function(error){
          logger.debug(error)
          expect(error).to.not.be.ok
        })
  }

  function checkResponse(isSuccess, value){
    expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
    expect(value.status).to.equal(isSuccess ? status.success: status.error)
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

  //region send tx
  async function sendTx(server, commonParams, retentiveParams){
    if(!retentiveParams.sequence){
      await server.responseGetAccount(commonParams.from).then((accountInfo)=>{
        retentiveParams.sequence = Number(accountInfo.result.Sequence)
      })
    }
    return sendTxWithSequence(server, commonParams, retentiveParams)
  }

  function sendTxWithSequence(server, commonParams, retentiveParams){
    return Promise.resolve(server.responseSendTx(
        commonParams.from,
        commonParams.secret,
        retentiveParams.sequence,
        commonParams.to,
        commonParams.value,
        commonParams.fee,
        commonParams.memos,
    )).then(async function (value) {
      if(value.status === status.success){
        retentiveParams.sequence++ //if send tx successfully, then sequence need plus 1
      }
      return value
    })
  }

  async function signAndSendRaw(server, commonParams, retentiveParams){
    if(!retentiveParams.sequence){
      await server.responseGetAccount(commonParams.from).then((accountInfo)=>{
        retentiveParams.sequence = Number(accountInfo.result.Sequence)
      })
    }
    return signAndSendRawWithSequence(server, commonParams, retentiveParams)
  }

  function signAndSendRawWithSequence(server, commonParams, retentiveParams){
    return Promise.resolve(server.responseSignTx(
        commonParams.from,
        commonParams.secret,
        retentiveParams.sequence,
        commonParams.to,
        commonParams.value,
        commonParams.fee,
        commonParams.memos,
    )).then(async function (repsonseOfSign) {
      if(repsonseOfSign.status === status.success){
        // retentiveParams.sequence++ //if send tx successfully, then sequence need plus 1
        let rawTx = repsonseOfSign.result[0]
        return Promise.resolve(server.responseSendRawTx(
            rawTx,
        )).then(function(responseOfSendRaw){
          if(responseOfSendRaw.status === status.success){
            retentiveParams.sequence++ //if send tx successfully, then sequence need plus 1
            return responseOfSendRaw
          }
        })
      }
    })
  }

  async function sendTxWithSequenceContinuously(server, commonParams, retentiveParams, sendCount){
    if(!retentiveParams.sequence){
      await server.responseGetAccount(commonParams.from).then((accountInfo)=>{
        retentiveParams.sequence = Number(accountInfo.result.Sequence)
      })
    }
    return new Promise(async (resolve, reject) => {
      let txHashes = []
      for(let index = 0; index < sendCount; index++){
        await sendTxWithSequence(server, commonParams, retentiveParams).then(function (value) {
          txHashes.push(value)
          if(txHashes.length == sendCount) {
            resolve(txHashes)
          }
        })
      }
    })
  }
  //endregion

  //region common functions

  function checkGetTxSuccess(tx, value){
    checkResponse(true, value)
    // expect(value.result).to.be.jsonSchema(schema.TX_SCHEMA)
    expect(value.result.hash).to.be.equal(tx.hash)
  }

  function getDynamicName(){
    let result = {}
    let postfix = Math.round(new Date().getTime()/1000)
    result.name = "TestCoin" + postfix
    result.symbol = postfix.toString(16)
    return result
  }

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

  // endregion

})
