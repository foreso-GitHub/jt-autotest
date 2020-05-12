//region require
const chai = require("chai")
chai.use(require("chai-json-schema"))
const expect = chai.expect
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let HashMap = require('hashmap')
let utility = require("./utility/testUtility.js")
const schema = require("./schema.js")
const consts = require('../lib/base/consts')
const { chains, data, token, txs, blocks, ipfs_data } = require("./testData/testData")
const { addresses } = require("./testData/addresses")
const { configCommons, modes, } = require("./config")
const { responseStatus,  serviceType,  interfaceType,  testMode,  restrictedLevel, } = require("./enums")
const status = responseStatus
const testModeEnums = testMode
//endregion

//region global fields
const HASH_LENGTH = 64
const IPFS_HASH_LENGTH = 46
let _SequenceMap = new HashMap()
let _LastDynamicalTimeSeed = 0
let _FullTestCaseList = []
//endregion

describe('Jingtum测试', function() {

  //region ===record start time===
  logger.debug("======Start testing!======")
  let start = new Date()
  let end = new Date()
  logger.debug("Start time: " + start.toTimeString())
  //endregion

  for(let mode of modes){

    let server = mode.server
    server.init(mode)

    // this.timeout(mode.service == serviceType.oldChain ? 120000: 30000)

    if(mode.service == serviceType.oldChain){
      this.timeout(120000)
    }
    else if(mode.service == serviceType.newChain){
      this.timeout(30000)
    }
    else if(mode.service == serviceType.ipfs){
      this.timeout(35000)
    }
    else{
      this.timeout(10000)
    }

    describe('测试模式: ' + server.getName(), function () {

      before(async function() {
        // logger.debug('before connnect')
        // await server.connect()
        // logger.debug('after connnect')
      })

      // /*
      describe('用例测试', function () {

        testForIpfsTest(server, '测试ipfs')

        testForGetBlockNumber(server, '测试jt_blockNumber')

        testForGetBlockByNumber(server, '测试jt_getBlockByNumber')

        testForGetBlockByHash(server, '测试jt_getBlockByHash')

        testForCreateAccount(server, '测试jt_createAccount')

        testForGetAccount(server, '测试jt_getAccount')

        testForGetAccounts(server, '测试jt_accounts')

        testForGetBalance(server, '测试jt_getBalance')

        testForGetTransactionReceipt(server, '测试jt_getTransactionReceipt')

        testForGetTransaction(server, '测试jt_getTransactionByHash')

        testForGetTransactionByBlockHashAndIndex(server, '测试jt_getTransactionByBlockHashAndIndex')

        testForGetTransactionByBlockNumberAndIndex(server, '测试jt_getTransactionByBlockNumberAndIndex')

        testForGetBlockTransactionCountByHash(server, '测试jt_getBlockTransactionCountByHash')

        testForGetBlockTransactionCountByNumber(server, '测试jt_getBlockTransactionCountByNumber')

        testForSendTxAndSignTx(server, '测试jt_sendTransaction和jt_signTransaction')

      })
      //*/

      describe('is working', async function () {

        // testForSendTxAndSignTx(server, '测试jt_sendTransaction和jt_signTransaction')

        // await utility.timeout(5000)

        // testForIpfsTest(server, '测试ipfs')

        // testForGetBlockNumber(server, '测试jt_blockNumber')

        // testForGetAccount(server, '测试jt_getAccount')

        // testForSendTxAndSignTx(server, '测试jt_sendTransaction和jt_signTransaction')

      })

    })


  }

  //region auto test framework

  //region 1. create test cases

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
    testCaseParams.expectedResult = createExpecteResult(true)
    testCaseParams.testCase = {}
    testCaseParams.symbol = testCaseParams.txParams[0].symbol
    testCaseParams.showSymbol = (testCaseParams.txParams[0].showSymbol) ? testCaseParams.txParams[0].showSymbol : ''
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
    testCaseParams.restrictedLevel = restrictedLevel.L2
    testCaseParams.supportedServices = [serviceType.newChain]
    testCaseParams.supportedInterfaces = []
    return testCaseParams
  }

  function createTestCase(title, server, txFunctionName, txParams, otherParams, executeFunction, checkFunction, expectedResult,
                          restrictedLv, supportedServices, supportedInterfaces){
    let testCase = {}
    testCase.type = "it"
    if(title) testCase.title = title
    if(server) testCase.server = server
    if(txFunctionName) testCase.txFunctionName = txFunctionName
    if(txParams) testCase.txParams = txParams
    if(otherParams) testCase.otherParams = otherParams
    if(executeFunction) testCase.executeFunction = executeFunction
    if(checkFunction) testCase.checkFunction = checkFunction
    if(expectedResult) testCase.expectedResult = expectedResult
    testCase.hasExecuted = false
    testCase.actualResult = []
    testCase.restrictedLevel = (restrictedLv != null) ? restrictedLv : restrictedLevel.L2
    testCase.supportedServices = (supportedServices) ? cloneArray(supportedServices) : []
    testCase.supportedInterfaces = (supportedInterfaces) ? cloneArray(supportedInterfaces) : []
    testCase.checks = []
    return testCase
  }

  function createTestCaseByParams(testCaseParams){
    return createTestCase(testCaseParams.title, testCaseParams.server,
        testCaseParams.txFunctionName, testCaseParams.txParams, testCaseParams.otherParams,
        testCaseParams.executeFunction, testCaseParams.checkFunction, testCaseParams.expectedResult,
        testCaseParams.restrictedLevel, testCaseParams.supportedServices, testCaseParams.supportedInterfaces)
  }

  function createTxParamsForTransfer(server){
    return server.createTransferParams(addresses.sender1.address, addresses.sender1.secret, null,
        addresses.receiver1.address, '0.000015', '0.00001', ['autotest: transfer test'])
  }

  function createTxParamsForIssueToken(server, account, token){
    // 参考”发起底层币无效交易“的测试用例
    // "flags":        float64(data.TxCoinMintable | data.TxCoinBurnable)
    // TxCoinMintable  TransactionFlag = 0x00010000 (65536)
    // TxCoinBurnable  TransactionFlag = 0x00020000 (131072)
    // Mintable+Burnable  TransactionFlag = 0x00030000  (196608)
    // Neither Mintable nor Burnable  TransactionFlag = 0x00000000  (0)
    // "local":true 表示发的是带issuer的币，类似这种100/CNY/jGr9kAJ1grFwK4FtQmYMm5MRnLzm93CV9C

    let tokenName = getDynamicName()
    return server.createIssueTokenParams(account.address, account.secret, null,
        tokenName.name, tokenName.symbol, token.decimals, token.total_supply, token.local, token.flags)
  }

  function createTxParamsForTokenTransfer(server, account, symbol, issuer){
    let tokenParams = server.createTransferParams(account.address, account.secret, null,
        addresses.receiver1.address, '1', '0.00001', ['autotest: token test'])
    tokenParams[0].symbol = symbol
    tokenParams[0].issuer = issuer
    tokenParams[0].showSymbol = getShowSymbol(symbol, issuer)
    tokenParams[0].value = '1' + tokenParams[0].showSymbol
    return tokenParams
  }

  // example
  // {"jsonrpc":"2.0","id":7,"method":"jt_sendTransaction","params":[{"type":"IssueCoin","from":"jPdevNK8NeYSkg3TrWZa8eT6BrSp2oteUh","secret":"ssSLJReyitmAELQ3E3zYpZti1YuRe","name":"TestCoin1578886708","symbol":"5e1be634","decimals":8,"total_supply":"9876543210","local":false,"flags":65536,"fee":"10",
  //   "sequence":5620	}]}
  function createTxParamsForMintToken(server, account, token, tokenName, tokenSymbol){
    return server.createIssueTokenParams(account.address, account.secret, null,
        tokenName, tokenSymbol, token.decimals, token.total_supply, token.local, token.flags)
  }

  function createExpecteResult(needPass, isErrorInResult, expectedError){
    let expectedResult = {}
    expectedResult.needPass = needPass
    expectedResult.isErrorInResult = isErrorInResult != null ? isErrorInResult : true;
    expectedResult.expectedError = expectedError
    return expectedResult
  }
  //endregion

  //region common create method for sendTx and signTx

  function addTestCaseForSendRawTx(testCaseOfSignTx, expectedResultOfSendRawTx){
    let txFunctionName = consts.rpcFunctions.sendRawTx
    let testCaseOfSendRawTx = createTestCase(testCaseOfSignTx.title + '-' + txFunctionName, testCaseOfSignTx.server,
        txFunctionName, null,null, null, null, expectedResultOfSendRawTx,
        testCaseOfSignTx.restrictedLevel, testCaseOfSignTx.supportedServices, testCaseOfSignTx.supportedInterfaces)
    testCaseOfSignTx.subTestCases = []
    testCaseOfSignTx.subTestCases.push(testCaseOfSendRawTx)
  }

  //region 当jt_sendTransaction和jt_signTransaction都通过测试时

  function createTestCaseWhenSignPassAndSendRawTxPass(testCaseParams, updateTxParamsFunction){
    testCaseParams.txParams = cloneParamsAarry(testCaseParams.originalTxParams)
    updateTxParamsFunction()
    // testCaseParams.expectedResult = createExpecteResult(true)
    let testCase = createTestCaseByParams(testCaseParams)
    if(testCaseParams.txFunctionName === consts.rpcFunctions.signTx) {
      let expectedResultOfSendRawTx = createExpecteResult(true)
      addTestCaseForSendRawTx(testCase, expectedResultOfSendRawTx)
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
      let expectedResultOfSignTx = createExpecteResult(true)
      testCase.expectedResult = expectedResultOfSignTx
      addTestCaseForSendRawTx(testCase, testCaseParams.expectedResult)
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

  //region common
  function addTestCase(testCases, testCase){
    if(ifNeedExecuteOrCheck(testCase)){
      testCases.push(testCase)
      _FullTestCaseList.push(testCase)
      // logger.debug('====== _FullTestCaseList Count ======')
      // logger.debug(_FullTestCaseList.length)
    }
  }
  //endregion

  //endregion

  //region 2. execute test cases

  //region for send
  function executeTestCaseOfCommon(testCase, specialExecuteFunction){
    return new Promise(function(resolve){
      let server = testCase.server
      let data = testCase.txParams[0]
      let from = data.from
      getSequence(server, from).then(function(sequence){
        if(data.sequence == null){
          data.sequence = isNaN(sequence) ? 1 : sequence
        }
        server.getBalance(server, data.from, data.symbol).then(function(balanceBeforeExecution){
          testCase.balanceBeforeExecution = balanceBeforeExecution ? balanceBeforeExecution : 0
          logger.debug("balanceBeforeExecution:" + JSON.stringify(testCase.balanceBeforeExecution))
          executeTxByTestCase(testCase).then(function(response){
            specialExecuteFunction(testCase, response, resolve)
          })
        })
      })
    })
  }

  function executeTestCaseOfSendTx(testCase){
    testCase.hasExecuted = true
    return executeTestCaseOfCommon(testCase, function(testCase, response, resolve){
      addSequenceAfterResponseSuccess(response, testCase)
      // testCase.hasExecuted = true
      testCase.actualResult.push(response)
      resolve(testCase)
    })
  }

  function executeTestCaseOfSignTxAndSendRawTx(testCase){
    testCase.hasExecuted = true
    return executeTestCaseOfCommon(testCase, function(testCase, responseOfSign, resolve){
      // testCase.hasExecuted = true
      testCase.actualResult.push(responseOfSign)
      if(responseOfSign.status === status.success){
        if(testCase.expectedResult.needPass){
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
              testCaseOfSendRawTx.hasExecuted = true
              executeTestCaseOfCommonFunction(testCaseOfSendRawTx).then(function(responseOfSendRawTx){
                // testCaseOfSendRawTx.hasExecuted = true
                testCaseOfSendRawTx.actualResult.push(responseOfSendRawTx)
                addSequenceAfterResponseSuccess(responseOfSendRawTx, testCase)
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
  }

  //if send tx successfully, then sequence need plus 1
  function addSequenceAfterResponseSuccess(response, testCase){
    let data = testCase.txParams[0]
    let serverName = testCase.server.getName()
    if(response.status === status.success){
      setSequence(serverName, data.from, data.sequence + 1)  //if send tx successfully, then sequence need plus 1
    }
  }
  //endregion

  //region for get
  function executeTestCaseForGet(testCase){
    testCase.hasExecuted = true
    return new Promise(async (resolve, reject) => {
      executeTxByTestCase(testCase).then(function(response){
        // testCase.hasExecuted = true
        testCase.actualResult.push(response)
        resolve(testCase)
      }, function (error) {
        logger.debug(error)
        expect(false).to.be.ok
      })
    })
  }

  //endregion

  //region common execute

  function executeTxByTestCase(testCase){
    logger.debug(testCase.title)
    return testCase.server.getResponse(testCase.server, testCase.txFunctionName, testCase.txParams)
  }

  //region execute the function which will NOT write block like jt_signTransaction

  function executeTestCaseOfCommonFunction(testCase){
    testCase.hasExecuted = true
    return new Promise(function(resolve){
      executeTxByTestCase(testCase).then(function(response){
        // testCase.hasExecuted = true
        testCase.actualResult.push(response)
        resolve(response)
      })
    })
  }

  //endregion

  //endregion

  //endregion

  //region 3. check test cases

  //region check send tx result
  async function checkTestCaseOfSendTx(testCase){
    await checkResponseOfTransfer(testCase, testCase.txParams)
  }

  async function checkResponseOfCommon(testCase, txParams, checkFunction){
    await checkSingleResponseOfCommonOneByOne(testCase, txParams, checkFunction, 0)
  }

  async function checkSingleResponseOfCommonOneByOne(testCase, txParams, checkFunction, index){
    await checkSingleResponseOfCommon(testCase, testCase.actualResult[index], txParams, checkFunction)
    index++
    if(index < testCase.actualResult.length){
      await checkSingleResponseOfCommonOneByOne(testCase, txParams, checkFunction, index)
    }
  }

  async function checkSingleResponseOfCommon(testCase, responseOfSendTx, txParams, checkFunction){
    checkResponse(testCase.expectedResult.needPass, responseOfSendTx)

    //todo need remove OLD_SENDTX_SCHEMA when new chain updates its sendTx response
    if(testCase.server.mode.service == serviceType.newChain){
      if(testCase.expectedResult.needPass){
        expect(responseOfSendTx).to.be.jsonSchema(schema.OLD_SENDTX_SCHEMA)
        let hash = responseOfSendTx.result[0]
        // expect(responseOfSendTx).to.be.jsonSchema(schema.SENDTX_SCHEMA)
        // let hash = responseOfSendTx.result[0]
        // let hash = responseOfSendTx.result.tx_json.hash  //for swtclib
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
        let expectedResult = testCase.expectedResult
        expect((expectedResult.isErrorInResult) ? responseOfSendTx.result : responseOfSendTx.message).to.contains(expectedResult.expectedError)
      }
    }
    else{
      if(testCase.expectedResult.needPass){
        expect(responseOfSendTx).to.be.jsonSchema(schema.SENDTX_SCHEMA)
        let hash = responseOfSendTx.result.hash  //for swtclib
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
        expect(responseOfSendTx).to.be.jsonSchema(schema.SENDTX_SCHEMA)
        let expectedResult = testCase.expectedResult.expectedError
        compareEngineResults(expectedResult, responseOfSendTx.result)
      }
    }
  }

  function compareEngineResults(result1, result2){
    expect(result2.engine_result).to.equals(result1.engine_result)
    expect(result2.engine_result_code).to.equals(result1.engine_result_code)
    expect(result2.engine_result_message).to.equals(result1.engine_result_message)
  }

  async function checkResponseOfTransfer(testCase, txParams){
    await checkResponseOfCommon(testCase, txParams, async function(testCase, txParams, tx){
      let params = txParams[0]
      await compareActualTxWithTxParams(params, tx, testCase.server.mode)

      if(testCase.server.mode.restrictedLevel >= restrictedLevel.L5){
        let expectedBalance = testCase.expectedResult.expectedBalance
        if(expectedBalance){
          let server = testCase.server
          let from = params.from
          let symbol = params.symbol
          await checkBalanceChange(server, from, symbol, expectedBalance)
        }
      }
    })
  }

  function getBalanceValue(balanceObject){
    if(balanceObject){
      if(balanceObject.value){
        return Number(balanceObject.value.toString())
      }
      else{
        return Number(balanceObject.toString())
      }
    }
    else{
      return 0
    }
  }

  async function checkTestCaseOfMintOrBurn(testCase){
    await checkResponseOfCommon(testCase, testCase.txParams, async function(testCase, txParams, tx){
      let params = txParams[0]
      await testCase.server.getBalance(testCase.server, params.from, params.symbol).then(function(balanceAfterExecution){
        testCase.balanceAfterExecution = balanceAfterExecution
        oldBalance = getBalanceValue(testCase.balanceBeforeExecution)
        newBalance = getBalanceValue(testCase.balanceAfterExecution)
        if(params.type === consts.rpcParamConsts.issueCoin){
          expect(newBalance).to.be.equals(newBalance + Number(params.total_supply))
        }
        else{
          expect(newBalance).to.be.equals(newBalance + Number(params.value))
        }

        logger.debug("balanceAfterExecution:" + JSON.stringify(testCase))
        logger.debug("balanceAfterExecution, symbol:" + params.symbol)
        logger.debug("balanceAfterExecution:" + JSON.stringify(balanceAfterExecution))

        expect(false).to.be.ok
      })
      // expect(true).to.be.ok
    })
  }

  function compareActualTxWithTxParams(txParams, tx, mode){
    return new Promise(function(resolve){
      expect(tx.Account).to.be.equals(txParams.from)
      expect(tx.Destination).to.be.equals(txParams.to)

      let expectedFee
      let expectedValue
      if(mode.service == serviceType.oldChain){
        expectedFee = mode.defaultFee
        expectedValue = Number(txParams.value) * 1000000
      }
      else
      {
        expectedFee = (txParams.fee) ? txParams.fee : mode.defaultFee
        expectedValue = Number(txParams.value)
      }

      expect(tx.Fee).to.be.equals(expectedFee.toString())
      //check value
      if(txParams.type == consts.rpcParamConsts.issueCoin){
        expect(tx.Name).to.be.equals(txParams.name)
        expect(tx.Decimals).to.be.equals(Number(txParams.decimals))
        expect(tx.TotalSupply.value).to.be.equals(txParams.total_supply)
        expect(tx.TotalSupply.currency).to.be.equals(txParams.symbol)
        expect(tx.TotalSupply.issuer).to.be.equals((txParams.local) ? txParams.from : addresses.defaultIssuer.address)
        if(mode.restrictedLevel >= restrictedLevel.L5) expect(tx.Flags).to.be.equals(txParams.flags)  //todo need restore
      }
      else{
        if(txParams.symbol){
          expect(tx.Amount.currency).to.be.equals(txParams.symbol)
          expect(tx.Amount.value + "/" + tx.Amount.currency + "/" + tx.Amount.issuer).to.be.equals(txParams.value)
        }
        else{
          // expect(Number(tx.Amount)).to.be.equals(Number(txParams.value))
          expect(Number(tx.Amount)).to.be.equals(expectedValue)
        }
      }
      //check memos, only in new chain
      if(txParams.memos != null){
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
    return server.responseGetTxByHash(server, hash)
        .then(async function (value) {
          //retry
          if(retryCount < server.mode.retryMaxCount && (value.result.toString().indexOf('can\'t find transaction') != -1
              || value.result.toString().indexOf('no such transaction') != -1)){
            retryCount++
            logger.debug("===Try responseGetTxByHash again! The " + retryCount + " retry!===")
            await utility.timeout(server.mode.retryPauseTime)
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
    checkResponse(testCase.expectedResult.needPass, responseOfSendTx)
    if(testCase.expectedResult.needPass){
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
      let expectedResult = testCase.expectedResult
      expect((expectedResult.isErrorInResult) ? responseOfSendTx.result : responseOfSendTx.message).to.contains(expectedResult.expectedError)
    }
  }
  //endregion

  //region common check system for sequence and ipfs test
  async function checkTestCase(testCase){
    await checkTestCaseOneByOne(testCase, 0)
  }

  async function checkTestCaseOneByOne(testCase, index){
    let check = testCase.checks[index]
    if(check.title) logger.debug('Checking ' + check.title + ' ...')
    await check.checkFunction(testCase, check)
    if(check.title) logger.debug('Check ' + check.title + ' done!')
    index++
    if(index < testCase.checks.length) {
      await checkTestCaseOneByOne(testCase, index)
    }
  }
  //endregion

  //endregion

  //region 4. test test cases

  //region common

  function testTestCases(server, describeTitle, testCases) {
    let testMode = server.mode.testMode
    if(!testMode || testMode == testModeEnums.batchMode){
      testBatchTestCases(server, describeTitle, testCases)
    }
    else if (testMode == testModeEnums.singleMode) {
      testSingleTestCases(server, describeTitle, testCases)
    }
    else{
      logger.debug("No special test mode!")
    }
  }

  //region batch mode

  function testBatchTestCases(server, describeTitle, testCases) {
    describe(describeTitle, async function () {

      before(async function() {
        await execEachTestCase(testCases, 0)  //NOTICE!!! the execute method must RETURN a promise, then batch mode can work!!!
      })

      testCases.forEach(async function(testCase){
        it(testCase.title, async function () {
          // await testCase.checkFunction(testCase)
          try{
            // logger.debug('===before checkFunction')
            // logger.debug('hasExecuted: ' + testCase.hasExecuted)
            printTestCaseInfo(testCase)
            await testCase.checkFunction(testCase)
            // logger.debug('===after checkFunction')
            afterTestFinish(testCase)
          }
          catch(ex){
            afterTestFinish(testCase)
            throw ex
          }
        })
      })
    })
  }

  async function execEachTestCase(testCases, index){
    if(index < testCases.length){
      let testCase = testCases[index]
      // logger.debug("===1. index: " + index )
      // logger.debug('=== before executeFunction')
      await testCase.executeFunction(testCase)
      // logger.debug('=== after executeFunction')
      // logger.debug("===2. index: " + index )
      index++
      await execEachTestCase(testCases, index)
      // logger.debug("===3. index: " + index )
    }
  }

  //endregion

  //region single mode
  function testSingleTestCases(server, describeTitle, testCases) {
    describe(describeTitle, async function () {
      testCases.forEach(async function(testCase){
        it(testCase.title, async function () {
          try{
            await testCase.executeFunction(testCase)
            printTestCaseInfo(testCase)
            await testCase.checkFunction(testCase)
            afterTestFinish(testCase)
          }
          catch(ex){
            afterTestFinish(testCase)
            throw ex
          }
        })
      })
    })
  }
  //endregion

  //region after test
  function afterTestFinish(testCase){
    if(checkIfAllTestHasBeenExecuted(_FullTestCaseList)){
      closeTest(testCase)
    }
  }

  function checkIfAllTestHasBeenExecuted(testCases){
    let result = true
    // let hasExecutedCount = 0
    // let clearCount = 0
    // let clearList = []
    testCases.forEach((testCase)=>{
      if(!testCase.hasExecuted){
        result = false
        // clearCount++
        // clearList.push(testCase)
      }
      else{
        // hasExecutedCount++
      }
    })
    // logger.debug('====== hasExecuted Count ======')
    // logger.debug(hasExecutedCount)
    // logger.debug('====== clear Count ======')
    // logger.debug(clearCount)

    return result
  }

  function closeTest(testCase){
    //region ===record start time===
    logger.debug("======End testing!======")
    end = new Date()
    logger.debug("Start time: " + start.toTimeString())
    logger.debug("End time: " + end.toTimeString())
    let span = end - start
    let hour = Math.floor(span / 1000 / 60 / 60)
    span = span - hour * 1000 * 60 * 60
    let minute = Math.floor(span / 1000 / 60 )
    span = span - minute * 1000 * 60
    let second = Math.floor(span / 1000  )
    logger.debug("Consume time: " + (end - start) / 1000 + 's, equals to ' + hour + ':' + minute + ':' + second + '!')
    logger.debug('Closing server ...')
    testCase.server.close()
    //endregion
  }
  //endregion

  function printTestCaseInfo(testCase){
    logger.debug('check title: ' + testCase.title)
    logger.debug('function: ' + testCase.txFunctionName)
    logger.debug('paraments: ' + JSON.stringify(testCase.txParams))
    logger.debug('supportedServices: ' + JSON.stringify(testCase.supportedServices))
    logger.debug('supportedInterfaces: ' + JSON.stringify(testCase.supportedInterfaces))
    logger.debug('restrictedLevel: ' + JSON.stringify(testCase.restrictedLevel))
    logger.debug('hasExecuted: ' + testCase.hasExecuted)
    for(let i = 0; i < testCase.actualResult.length; i++){
      logger.debug('result[' +i + ']: ' + JSON.stringify(testCase.actualResult[i]))    }
    if(testCase.subTestCases != null && testCase.subTestCases.length > 0) {
      logger.debug('subTestCases result: ' + JSON.stringify(testCase.subTestCases[0].actualResult[0]))
    }
    if(testCase.checks != null && testCase.checks.length > 0) {
      for(let i = 0; i < testCase.checks.length; i++){
        logger.debug('check[' + i + ']: ' + JSON.stringify(testCase.checks[i]))
      }
    }
  }

  function ifNeedExecuteOrCheck(testCase){
    if(!testCase){
      logger.debug("Error: test case doesn't exist!")
    }
    if(testCase.server.mode.restrictedLevel < testCase.restrictedLevel){
      return false
    }
    else if(!(!testCase.supportedServices || testCase.supportedServices.length == 0)
        && !ifArrayHas(testCase.supportedServices, testCase.server.mode.service)){
      return false
    }
    else if(!(!testCase.supportedInterfaces || testCase.supportedInterfaces.length == 0)
        && !ifArrayHas(testCase.supportedInterfaces, testCase.server.mode.interface)){
      return false
    }
    else if(testCase.txFunctionName == consts.rpcFunctions.signTx
        && testCase.server.mode.service == serviceType.oldChain){
      return false
    }
    else{
      return true
    }
  }

  function testTestCasesByDescribes(server, describeTitle, descriptions) {

    // describe(describeTitle, async function () {
    //
    //   before(async function() {
    //     execEachTestCase(testCases, 0)
    //     await utility.timeout(server.mode.defaultBlockTime)
    //   })
    //
    //   testCases.forEach(async function(testCase){
    //     it(testCase.title, async function () {
    //       await testCase.checkFunction(testCase)
    //     })
    //   })
    // })
  }
  //endregion

  //region test for tx
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

  function testForIssueToken(server, categoryName, txFunctionName, account, configToken){
    let testName = ''
    let describeTitle = ''
    let testCases = []
    let txParams = {}

    //create token
    testName = '测试创建token'
    describeTitle = testName + '-[币种:' + categoryName + '] [方式:' + txFunctionName + ']'
    txParams = createTxParamsForIssueToken(server, account, configToken)
    testCases = createTestCasesForCreateToken(server, categoryName, txFunctionName, txParams)
    testTestCases(server, describeTitle, testCases)

    //set created token properties
    // let tokenName = testCases[0].txParams[0].name
    // let tokenSymbol = testCases[0].txParams[0].symbol
    // let issuer = testCases[0].txParams[0].local ? testCases[0].txParams[0].from : addresses.defaultIssuer.address
    let txParam = txParams[0]
    let tokenName = txParam.name
    let tokenSymbol = txParam.symbol
    let issuer = txParam.local ? txParam.from : addresses.defaultIssuer.address
    logger.debug("===create token: " + tokenSymbol)

    //token transfer
    let transferTxParams = createTxParamsForTokenTransfer(server, account, tokenSymbol, issuer)
    describeTitle = '测试基本交易-[币种:' + transferTxParams[0].symbol + '] [方式:' + txFunctionName + ']'
    testForTransfer(server, categoryName, txFunctionName, transferTxParams)

    //mint token
    let mintTxParams = createTxParamsForMintToken(server, account, configToken, tokenName, tokenSymbol)
    describeTitle = '测试增发-[币种:' + mintTxParams[0].symbol + '] [方式:' + txFunctionName + ']'
    testCases = createTestCasesForMintToken(server, categoryName, txFunctionName, mintTxParams)
    testTestCases(server, describeTitle, testCases)

    //burn token
    describeTitle = '测试销毁-[币种:' + mintTxParams[0].symbol + '] [方式:' + txFunctionName + ']'
    testCases = createTestCasesForBurnToken(server, categoryName, txFunctionName, mintTxParams)
    testTestCases(server, describeTitle, testCases)
  }

  function testForIssueTokenInComplexMode(server, txFunctionName){
    let account = addresses.sender3

    let configToken = token.config_normal
    describe(configToken.testName + '测试：' + txFunctionName, async function () {
      testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
    })

    configToken = token.config_mintable
    describe(configToken.testName + '测试：' + txFunctionName, async function () {
      testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
    })

    configToken = token.config_burnable
    describe(configToken.testName + '测试：' + txFunctionName, async function () {
      testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
    })

    configToken = token.config_mint_burn
    describe(configToken.testName + '测试：' + txFunctionName, async function () {
      testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
    })

    configToken = token.config_issuer_normal
    describe(configToken.testName + '测试：' + txFunctionName, async function () {
      testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
    })

    configToken = token.config_issuer_mintable
    describe(configToken.testName + '测试：' + txFunctionName, async function () {
      testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
    })

    configToken = token.config_issuer_burnable
    describe(configToken.testName + '测试：' + txFunctionName, async function () {
      testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
    })

    configToken = token.config_issuer_mint_burn
    describe(configToken.testName + '测试：' + txFunctionName, async function () {
      testForIssueToken(server, configToken.testName, txFunctionName, account, configToken)
    })

  }
  //endregion

  //endregion

  //endregion

  //region sequence test
  async function testForSequenceTest(server, describeTitle){
    testSequenceByFunction(server, describeTitle, consts.rpcFunctions.sendTx)
    testSequenceByFunction(server, describeTitle, consts.rpcFunctions.signTx)
  }

  function testSequenceByFunction(server, describeTitle, txFunctionName){
    let categoryName = describeTitle + txFunctionName
    let testCasesList = createTestCasesForSequenceTest(server, txFunctionName)
    testTestCases(server, categoryName + '基本测试', testCasesList[0])
    testTestCases(server, categoryName + '无效参数测试1', testCasesList[1])
    testTestCases(server, categoryName + '无效参数测试2', testCasesList[2])
    testTestCases(server, categoryName + '多交易测试1', testCasesList[3])
    testTestCases(server, categoryName + '多交易测试2', testCasesList[4])
  }

  function createTestCasesForSequenceTest(server, txFunctionName){
    let testCasesList = []
    let testCases = []
    let testCase = {}
    let title
    let value = '0.000001'
    // let fee = '0.00001'
    let valueInAmount = server.mode.service == serviceType.newChain ? value : value * 1000000
    let fee = server.mode.defaultFee

    title = '0630\t有效的sequence参数_01: 假设发起钱包的sequence已经到了n，发起交易时，指定sequence为n+1'
    {
      testCase = createTestCaseForSequenceTest(server, title, txFunctionName, addresses.sequence1, addresses.receiver2, value)
      testCase.executeFunction = function(testCase){
        return new Promise(async function(resolve){
          testCase.hasExecuted = true
          testCase.checks = []
          let server = testCase.server
          let data = testCase.txParams[0]
          let from = data.from

          //record balance before transfer
          let from_balance_1 = await server.getBalance(server, data.from, data.symbol)
          let to_balance_1 = await server.getBalance(server, data.to, data.symbol)

          //get sequence
          let currentSequence = await getSequence(server, from)
          data.sequence = isNaN(currentSequence) ? 1 : currentSequence

          //transfer
          let expectedResult = createExpecteResult(true)
          await executeTransfer(testCase, expectedResult, expectedResult)

          //wait transfer result written in block
          // await utility.timeout(server.mode.defaultBlockTime + 2000)
          // let hash = _CurrentService == serviceType.newChain ? result.result[0] : result.result.hash
          // let tx = await getTxByHash(server, hash, 0)  //do not work in swtclib
          if(testCase.server.mode.service == serviceType.newChain){
            let hash = testCase.actualResult.result[0]
            let tx = await getTxByHash(server, hash, 0)  //do not work in swtclib
          }
          else{
            // let hash = result.result.hash
            // let tx = await getTxByHash(server, hash, 0)  //do not work in swtclib
            await utility.timeout(server.mode.defaultBlockTime + 2000)
          }

          //record balance after transfer
          let from_balance_2 = await server.getBalance(server, data.from, data.symbol)
          let from_balance_expected = Number(from_balance_1) - Number(server.valueToAmount(valueInAmount)) - Number(fee) //Number(server.valueToAmount(fee))
          addBalanceCheck(testCase, 'from address balance', from_balance_expected, from_balance_2)
          // logger.debug('===from_balance_1: ' + from_balance_1)
          // logger.debug('===valueInAmount: ' + Number(server.valueToAmount(valueInAmount)))
          // logger.debug('===fee: ' + Number(server.valueToAmount(fee)))
          // logger.debug('===check_2: ' + JSON.stringify(check_2))

          let to_balance_2 = await server.getBalance(server, data.to, data.symbol)
          let to_balance_expected = Number(to_balance_1) + Number(server.valueToAmount(valueInAmount))
          addBalanceCheck(testCase, 'to address balance', to_balance_expected, to_balance_2)

          resolve(testCase)
        })
      }
      addTestCase(testCases, testCase)
    }

    title = '0640\t有效的sequence参数_01: 假设发起钱包的sequence已经到了n，发起交易时，指定sequence为n+2;返回交易哈希，' +
        '但是余额并没有变化；此时再发起一个sequence为n+1的交易，n+2的交易再被真正记录到链上'
    {
      testCase = createTestCaseForSequenceTest(server, title, txFunctionName, addresses.sequence2, addresses.receiver2, value)
      testCase.executeFunction = function(testCase){
        return new Promise(async function(resolve){
          testCase.hasExecuted = true
          testCase.checks = []
          let server = testCase.server
          let data = testCase.txParams[0]
          let from = data.from

          //record balance before transfer
          let from_balance_1 = await server.getBalance(server, data.from, data.symbol)
          let to_balance_1 = await server.getBalance(server, data.to, data.symbol)

          //get sequence
          let currentSequence = await getSequence(server, from)
          currentSequence = isNaN(currentSequence) ? 1 : currentSequence
          data.sequence = currentSequence + 1

          //transfer n+2 tx
          let expectedResult = createExpecteResult(true)
          await executeTransfer(testCase, expectedResult, expectedResult)

          //wait transfer result written in block
          await utility.timeout(server.mode.defaultBlockTime + 2000)

          //balance should not change
          let from_balance_2 = await server.getBalance(server, data.from, data.symbol)
          let from_balance_expected = Number(from_balance_1)
          addBalanceCheck(testCase, 'from address balance, no change', from_balance_expected, from_balance_2)
          let to_balance_2 = await server.getBalance(server, data.to, data.symbol)
          let to_balance_expected = Number(to_balance_1)
          addBalanceCheck(testCase, 'to address balance, no change', to_balance_expected, to_balance_2)

          //transfer n+1 tx
          expectedResult = createExpecteResult(true)
          data.sequence = currentSequence
          await executeTransfer(testCase, expectedResult, expectedResult)
          data.sequence = currentSequence + 2
          await executeTransfer(testCase, expectedResult, expectedResult)
          // await utility.timeout(server.mode.defaultBlockTime * (server.mode.service == serviceType.oldChain ? 3 : 1) + 1000)
          if(testCase.server.mode.service == serviceType.newChain){
            let hash = testCase.actualResult.result[0]
            let tx = await getTxByHash(server, hash, 0)  //do not work in swtclib
          }
          else{
            // let hash = result.result.hash
            // let tx = await getTxByHash(server, hash, 0)  //do not work in swtclib
            await utility.timeout(server.mode.defaultBlockTime * 3 + 2000)
          }

          // balance should change now
          from_balance_2 = await server.getBalance(server, data.from, data.symbol)
          from_balance_expected = Number(from_balance_1) - (Number(server.valueToAmount(valueInAmount)) + Number(fee)) * 3
          addBalanceCheck(testCase, 'from address balance, need change', from_balance_expected, from_balance_2)
          to_balance_2 = await server.getBalance(server, data.to, data.symbol)
          to_balance_expected = Number(to_balance_1) + Number(server.valueToAmount(valueInAmount)) * 3
          addBalanceCheck(testCase, 'to address balance, need change', to_balance_expected, to_balance_2)

          resolve(testCase)
        })
      }
      addTestCase(testCases, testCase)
    }
    testCasesList.push(testCases)
    testCases = []

    title = '0650\t无效的sequence参数_01：假设发起钱包的sequence已经到了n，发起交易时，指定sequence为大于0且小于n的整数'
    {
      testCase = createTestCaseForSequenceTest(server, title, txFunctionName, addresses.sequence3, addresses.receiver2, value)
      let signTxExpectedResult = createExpecteResult(true)
      let sendTxExpectedResult = createExpecteResult(false, true,
          testCase.server.mode.service == serviceType.newChain
              ? 'temBAD_SEQUENCE Malformed: Sequence is not in the past.'
              : consts.engineResults.tefPAST_SEQ)
      testCase.executeFunction = function(testCase){
        return executeTransferFailWithSpecialSequence(testCase, sendTxExpectedResult, signTxExpectedResult,
            function(txParams, currentSequence){
              txParams.sequence = 1
            })
      }
      addTestCase(testCases, testCase)
    }

    title = '0660\t无效的sequence参数_02：指定sequence为正整数之外的其他值：小数'
    {
      testCase = createTestCaseForSequenceTest(server, title, txFunctionName, addresses.sequence3, addresses.receiver2, value)
      let signTxExpectedResult = createExpecteResult(false, true,
          server.mode.service == serviceType.newChain ? 'sequence must be positive integer' : consts.engineResults.temBAD_SEQUENCE)
      let sendTxExpectedResult = signTxExpectedResult
      testCase.executeFunction = function(testCase){
        return executeTransferFailWithSpecialSequence(testCase, sendTxExpectedResult, signTxExpectedResult,
            function(txParams, currentSequence){
              txParams.sequence = 0.5
            })
      }
      addTestCase(testCases, testCase)
    }
    testCasesList.push(testCases)
    testCases = []

    title = '0660\t无效的sequence参数_02：指定sequence为正整数之外的其他值：负数'
    {
      testCase = createTestCaseForSequenceTest(server, title, txFunctionName, addresses.sequence3, addresses.receiver2, value)
      let signTxExpectedResult = createExpecteResult(false, true,
          server.mode.service == serviceType.newChain ? 'sequence must be positive integer' : consts.engineResults.temBAD_SEQUENCE)
      let sendTxExpectedResult = signTxExpectedResult
      testCase.executeFunction = function(testCase){
        return executeTransferFailWithSpecialSequence(testCase, sendTxExpectedResult, signTxExpectedResult,
            function(txParams, currentSequence){
              txParams.sequence = -1
            })
      }
      addTestCase(testCases, testCase)
    }

    title = '0660\t无效的sequence参数_02：指定sequence为正整数之外的其他值：字符串'
    {
      testCase = createTestCaseForSequenceTest(server, title, txFunctionName, addresses.sequence3, addresses.receiver2, value)
      let signTxExpectedResult = createExpecteResult(false, true,
          server.mode.service == serviceType.newChain ? 'sequence must be positive integer' : consts.engineResults.temBAD_SEQUENCE)
      let sendTxExpectedResult = signTxExpectedResult
      testCase.executeFunction = function(testCase){
        return executeTransferFailWithSpecialSequence(testCase, sendTxExpectedResult, signTxExpectedResult,
            function(txParams, currentSequence){
              txParams.sequence = 'abcdefgijklmnopq'
            })
      }
      addTestCase(testCases, testCase)
    }
    testCasesList.push(testCases)
    testCases = []

    title = '0670	同时发起多个交易时指定sequence_01:假设发起钱包的sequence已经到了n，同时发起m个交易，' +
        '指定每个交易的sequence分别为n+1、n+2、…、n+m'
    {
      testCase = createTestCaseForSequenceTest(server, title, txFunctionName, addresses.sequence4, addresses.receiver2, value)
      testCase.executeFunction = function(testCase){
        return new Promise(async function(resolve){
          testCase.hasExecuted = true
          testCase.checks = []
          let server = testCase.server
          let data = testCase.txParams[0]
          let from = data.from

          //record balance before transfer
          let from_balance_1 = await server.getBalance(server, data.from, data.symbol)
          let to_balance_1 = await server.getBalance(server, data.to, data.symbol)

          //transfer
          let currentSequence = await getSequence(server, from)
          currentSequence = isNaN(currentSequence) ? 1 : currentSequence
          let expectedResult = createExpecteResult(true)
          data.sequence = currentSequence
          await executeTransfer(testCase, expectedResult, expectedResult)
          data.sequence = currentSequence + 1
          await executeTransfer(testCase, expectedResult, expectedResult)
          data.sequence = currentSequence + 2
          await executeTransfer(testCase, expectedResult, expectedResult)
          data.sequence = currentSequence + 3
          await executeTransfer(testCase, expectedResult, expectedResult)
          data.sequence = currentSequence + 4
          await executeTransfer(testCase, expectedResult, expectedResult)

          //wait transfer result written in block
          if(testCase.server.mode.service == serviceType.newChain){
            let hash = testCase.actualResult.result[0]
            let tx = await getTxByHash(server, hash, 0)  //do not work in swtclib
          }
          else{
            // let hash = result.result.hash
            // let tx = await getTxByHash(server, hash, 0)  //do not work in swtclib
            await utility.timeout(server.mode.defaultBlockTime + 2000)
          }

          //record balance after transfer
          let from_balance_2 = await server.getBalance(server, data.from, data.symbol)
          let from_balance_expected = Number(from_balance_1) - (Number(server.valueToAmount(valueInAmount)) + Number(fee)) * 5
          addBalanceCheck(testCase, 'from address balance', from_balance_expected, from_balance_2)


          let to_balance_2 = await server.getBalance(server, data.to, data.symbol)
          let to_balance_expected = Number(to_balance_1) + Number(server.valueToAmount(valueInAmount)) * 5
          addBalanceCheck(testCase, 'to address balance', to_balance_expected, to_balance_2)

          resolve(testCase)
        })
      }
      addTestCase(testCases, testCase)
    }
    testCasesList.push(testCases)
    testCases = []

    title = '0680\t同时发起多个交易时指定sequence_02:假设发起钱包的sequence已经到了n，' +
        '同时发起m个交易，指定每个交易的sequence分别为n+1、n+3、n+5、…、n+2m-1'
    {
      testCase = createTestCaseForSequenceTest(server, title, txFunctionName, addresses.sequence5, addresses.receiver2, value)
      testCase.executeFunction = function(testCase){
        return new Promise(async function(resolve){
          testCase.hasExecuted = true
          testCase.checks = []
          let server = testCase.server
          let data = testCase.txParams[0]
          let from = data.from
          let check = {}

          //record balance before transfer
          let from_balance_1 = await server.getBalance(server, data.from, data.symbol)
          let to_balance_1 = await server.getBalance(server, data.to, data.symbol)

          //transfer n+2 tx
          let currentSequence = await getSequence(server, from)
          currentSequence = isNaN(currentSequence) ? 1 : currentSequence
          let expectedResult = createExpecteResult(true)
          data.sequence = currentSequence + 1
          await executeTransfer(testCase, expectedResult, expectedResult)
          data.sequence = currentSequence + 3
          await executeTransfer(testCase, expectedResult, expectedResult)
          data.sequence = currentSequence + 5
          await executeTransfer(testCase, expectedResult, expectedResult)
          data.sequence = currentSequence + 7
          await executeTransfer(testCase, expectedResult, expectedResult)

          //wait transfer result written in block
          await utility.timeout(server.mode.defaultBlockTime + 2000)

          //balance should not change
          let from_balance_2 = await server.getBalance(server, data.from, data.symbol)
          let from_balance_expected = Number(from_balance_1)
          addBalanceCheck(testCase, 'from address balance check, no change', from_balance_expected, from_balance_2)
          let to_balance_2 = await server.getBalance(server, data.to, data.symbol)
          let to_balance_expected = Number(to_balance_1)
          addBalanceCheck(testCase, 'to address balance check, no change', to_balance_expected, to_balance_2)

          //transfer n+1 tx
          data.sequence = currentSequence
          await executeTransfer(testCase, expectedResult, expectedResult)
          data.sequence = currentSequence + 2
          await executeTransfer(testCase, expectedResult, expectedResult)
          data.sequence = currentSequence + 4
          await executeTransfer(testCase, expectedResult, expectedResult)
          data.sequence = currentSequence + 6
          await executeTransfer(testCase, expectedResult, expectedResult)
          data.sequence = currentSequence + 8
          await executeTransfer(testCase, expectedResult, expectedResult)   //NOTICE:  the last transfer must be right sequence, cannot be future sequnce!
          // await utility.timeout(server.mode.defaultBlockTime * (server.mode.service == serviceType.oldChain ? 3 : 1) + 1000)
          if(testCase.server.mode.service == serviceType.newChain){
            let hash = testCase.actualResult.result[0]
            let tx = await getTxByHash(server, hash, 0)  //do not work in swtclib
          }
          else{
            // let hash = result.result.hash
            // let tx = await getTxByHash(server, hash, 0)  //do not work in swtclib
            await utility.timeout(server.mode.defaultBlockTime * 3 + 2000)
          }

          // balance should change now
          from_balance_2 = await server.getBalance(server, data.from, data.symbol)
          from_balance_expected = Number(from_balance_1) - (Number(server.valueToAmount(valueInAmount)) + Number(fee)) * 9
          addBalanceCheck(testCase, 'from address balance, need change', from_balance_expected, from_balance_2)
          to_balance_2 = await server.getBalance(server, data.to, data.symbol)
          to_balance_expected = Number(to_balance_1) + Number(server.valueToAmount(valueInAmount)) * 9
          addBalanceCheck(testCase, 'to address balance check, need change', to_balance_expected, to_balance_2)

          resolve(testCase)
        })
      }
      addTestCase(testCases, testCase)
    }
    testCasesList.push(testCases)
    testCases = []

    return testCasesList
  }

  //region standard executions

  function executeTransferFailWithSpecialSequence(testCase, sendTxExpectedResult, signTxExpectedResult, setSequenceFunction){
    return new Promise(async function(resolve){
      testCase.hasExecuted = true
      testCase.checks = []
      let server = testCase.server
      let data = testCase.txParams[0]
      let from = data.from

      //get sequence
      let currentSequence = await getSequence(server, from)
      currentSequence = isNaN(currentSequence) ? 1 : currentSequence
      setSequenceFunction(data, currentSequence)

      //record balance before transfer
      let from_balance_1 = await server.getBalance(server, data.from, data.symbol)
      let to_balance_1 = await server.getBalance(server, data.to, data.symbol)

      //transfer
      await executeTransfer(testCase, sendTxExpectedResult, signTxExpectedResult)

      //wait transfer result written in block
      let result = testCase.actualResult
      await utility.timeout(server.mode.defaultBlockTime + 2000)

      //record balance after transfer
      let from_balance_2 = await server.getBalance(server, data.from, data.symbol)
      let from_balance_expected = Number(from_balance_1)
      addBalanceCheck(testCase, 'from address balance', from_balance_expected, from_balance_2)
      let to_balance_2 = await server.getBalance(server, data.to, data.symbol)
      let to_balance_expected = Number(to_balance_1)
      addBalanceCheck(testCase, 'to address balance', to_balance_expected, to_balance_2)

      resolve(testCase)
    })
  }

  async function executeTransfer(testCase, sendTxExpectedResult, signTxExpectedResult){
    return new Promise(async(resolve)=>{
      let result
      if(testCase.txFunctionName == consts.rpcFunctions.sendTx){
        result = await testCase.server.getResponse(testCase.server, testCase.txFunctionName, testCase.txParams)
        addSequenceAfterResponseSuccess(result, testCase)
      }
      else if(testCase.txFunctionName == consts.rpcFunctions.signTx){
        let responseOfSignTx = await testCase.server.getResponse(testCase.server, testCase.txFunctionName, testCase.txParams)
        let blob = responseOfSignTx.result[0]
        //sign tx, need record signed tx
        let check_0 = {
          title: 'sign tx result',
          expectedResult: signTxExpectedResult,
          actualResult: responseOfSignTx,
          checkFunction: checkSignTx
        }
        testCase.checks.push(check_0)
        //sign tx, need sendRawTx
        result = await testCase.server.getResponse(testCase.server, consts.rpcFunctions.sendRawTx, [blob])
        addSequenceAfterResponseSuccess(result, testCase)
      }
      else{
        throw new Error(testCase.txFunctionName + 'cannot be executed!')
      }
      if(testCase.txFunctionName == consts.rpcFunctions.sendTx || (signTxExpectedResult && signTxExpectedResult.needPass)){  //only when sign tx need success, will check send raw tx result.
        let check_1 = {
          title: 'send tx result',
          expectedResult: sendTxExpectedResult,
          actualResult: result,
          checkFunction: checkSendTx
        }
        if(testCase.server.mode.service == serviceType.newChain) testCase.checks.push(check_1)  //todo need remove condition, new chain and old chain should be the same
      }
      testCase.actualResult = result
      resolve(testCase)
    })
  }

  function addBalanceCheck(testCase, title, expectedBalance, actualBalance){
    let check = {
      title: title,
      expectedBalance: expectedBalance,
      actualBalance: actualBalance,
      checkFunction: checkBalance
    }
    testCase.checks.push(check)
  }

  //endregion

  //region check

  function checkBalance(testCase, check){
    let expectedBalance = Number(check.expectedBalance)
    let actualBalance = Number(check.actualBalance)
    expect(actualBalance).to.be.equal(expectedBalance)
  }

  async function checkSendTx(testCase, check){
    let server = testCase.server
    let needPass = check.expectedResult.needPass
    let responseOfSendTx = check.actualResult
    checkResponse(needPass, responseOfSendTx)

    //todo need remove OLD_SENDTX_SCHEMA when new chain updates its sendTx response
    if(testCase.server.mode.service == serviceType.newChain){
      // expect(responseOfSendTx).to.be.jsonSchema(schema.OLD_SENDTX_SCHEMA)
      if(needPass){
        expect(responseOfSendTx).to.be.jsonSchema(schema.OLD_SENDTX_SCHEMA)
        let hash = responseOfSendTx.result[0]
        let responseOfGetTx = await getTxByHash(server, hash, 0)
        checkResponse(true, responseOfGetTx)

        let tx = responseOfGetTx.result
        expect(tx.hash).to.be.equal(hash)
        let params = testCase.txParams[0]
        await compareActualTxWithTxParams(params, tx, server.mode)
      }
      else{
        let expectedResult = check.expectedResult
        expect(responseOfSendTx.result).to.contains(expectedResult.expectedError)
      }
    }
    else{
      expect(responseOfSendTx).to.be.jsonSchema(schema.SENDTX_SCHEMA)
      if(needPass){
        let hash = responseOfSendTx.result.hash  //for swtclib
        let responseOfGetTx = await getTxByHash(server, hash, 0)
        checkResponse(true, responseOfGetTx)

        let tx = responseOfGetTx.result
        expect(tx.hash).to.be.equal(hash)
        let params = testCase.txParams[0]
        await compareActualTxWithTxParams(params, tx, server.mode)
      }
      else{
        let expectedResult = testCase.expectedResult.expectedError
        compareEngineResults(expectedResult, responseOfSendTx.result)
      }
    }
  }

  function checkSignTx(testCase, check){
    let needPass = check.expectedResult.needPass
    let responseOfSendTx = check.actualResult
    checkResponse(needPass, responseOfSendTx)

    if(needPass) {
      expect(responseOfSendTx).to.be.jsonSchema(schema.SIGNTX_SCHEMA)
    }
    else{
      let expectedResult = check.expectedResult
      expect(responseOfSendTx.result).to.contains(expectedResult.expectedError)
    }
  }

  //endregion

  function createTestCaseForSequenceTest(server, title, txFunctionName, sender, receiver, value, fee){
    let txParams = server.createTransferParams(sender.address, sender.secret, null,
        receiver.address, value, fee, ['autotest: sequence test'])
    let testCase = createTestCase(title, server,
        txFunctionName, txParams, null,
        null, checkTestCase, null,
        restrictedLevel.L0, [serviceType.newChain, serviceType.oldChain])
    return testCase
  }

  //endregion

  //region pressure test

  function createTestCasesForPressureTest(server, categoryName, testCount){
    let testCases = []
    for(let i = 0; i < testCount; i++){
      let txParams = createTxParamsForTransfer(server)
      let txFunctionName = consts.rpcFunctions.sendTx
      let executeFunction = executeTestCaseOfSendTx
      let checkFunction = checkTestCaseOfSendTx
      let expectedResult = createExpecteResult(true)
      let testCase = createTestCase('0010\t发起' + categoryName + '有效交易_' + (i + 1), server,
          txFunctionName, txParams, null,
          executeFunction, checkFunction, expectedResult,
          restrictedLevel.L0, [serviceType.newChain, serviceType.oldChain])
      addTestCase(testCases, testCase)
    }
    return testCases
  }

  //region pressure test in one case
  function createTestCasesForPressureTestInOneCase(server, txFunctionName, count){
    let testCases = []
    let title = '9000\t交易压力测试，交易数量：' + count
    let testCase = createTestCaseForPressureTest(server, title, txFunctionName, count)
    addTestCase(testCases, testCase)
    return testCases
  }

  function createTestCaseForPressureTest(server, title, txFunctionName, count){
    let testCase = createTestCaseForSequenceTest(server, title, txFunctionName, addresses.pressureAccount, addresses.receiver2, '0.000001')
    testCase.executeFunction = function(testCase){
      return new Promise(async function(resolve){
        testCase.hasExecuted = true
        testCase.checks = []
        let server = testCase.server
        let data = testCase.txParams[0]
        let from = data.from

        let value = '0.000001'
        // let fee = '0.00001'
        let valueInAmount = testCase.server.mode.service == serviceType.newChain ? value : value * 1000000
        let fee = server.mode.defaultFee

        //record balance before transfer
        let from_balance_1 = await server.getBalance(server, data.from, data.symbol)
        let to_balance_1 = await server.getBalance(server, data.to, data.symbol)

        //get sequence
        let currentSequence = await getSequence(server, from)
        currentSequence = isNaN(currentSequence) ? 1 : currentSequence

        //transfer
        for(let i = 0; i < count; i++){
          data.sequence = currentSequence + i
          let expectedResult = createExpecteResult(true)
          await executeTransfer(testCase, expectedResult, expectedResult)
        }

        //wait transfer result written in block
        // await utility.timeout(server.mode.defaultBlockTime + 2000)
        // let hash = testCase.server.mode.service == serviceType.newChain ? result.result[0] : result.result.hash
        // let tx = await getTxByHash(server, hash, 0)  //do not work in swtclib
        if(server.mode.service == serviceType.newChain){
          let hash = testCase.actualResult.result[0]
          let tx = await getTxByHash(server, hash, 0)  //do not work in swtclib
        }
        else{
          // let hash = result.result.hash
          // let tx = await getTxByHash(server, hash, 0)  //do not work in swtclib
          await utility.timeout(server.mode.defaultBlockTime + 2000)
        }

        //record balance after transfer
        let from_balance_2 = await server.getBalance(server, data.from, data.symbol)
        let from_balance_expected = Number(from_balance_1) - (Number(server.valueToAmount(valueInAmount)) + Number(fee)) * count
        addBalanceCheck(testCase, 'from address balance check', from_balance_expected, from_balance_2)
        // logger.debug('===from_balance_1: ' + from_balance_1)
        // logger.debug('===valueInAmount: ' + Number(server.valueToAmount(valueInAmount)))
        // logger.debug('===fee: ' + Number(server.valueToAmount(fee)))
        // logger.debug('===check_2: ' + JSON.stringify(check_2))

        let to_balance_2 = await server.getBalance(server, data.to, data.symbol)
        let to_balance_expected = Number(to_balance_1) + Number(server.valueToAmount(valueInAmount)) * count
        addBalanceCheck(testCase, 'to address balance check', to_balance_expected, to_balance_2)

        resolve(testCase)
      })
    }
    testCase.checkFunction = checkTestCase
    return testCase
  }
  //endregion

  //endregion

  //region common test case

  //region tx test case

  function testForSendTxAndSignTx(server, describeTitle){
    describe(describeTitle, function (){
      let categoryName = ''
      let txFunctionName = ''
      let txParams = {}
      let testCases = []

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

      //endregion

      //region sequence test
      categoryName = 'Sequence测试: '
      testForSequenceTest(server, categoryName)
      //endregion

      //region pressure test
      categoryName = '原生币swt压力测试，分多个case执行'
      testCases = createTestCasesForPressureTest(server, categoryName, 20)
      testTestCases(server, categoryName, testCases)

      categoryName = '原生币swt压力测试，jt_sendTransaction，在一个内case执行'
      testCases = createTestCasesForPressureTestInOneCase(server,  consts.rpcFunctions.sendTx, 50)
      testTestCases(server, categoryName, testCases)

      categoryName = '原生币swt压力测试，jt_signTransaction，在一个内case执行'
      testCases = createTestCasesForPressureTestInOneCase(server,  consts.rpcFunctions.signTx, 50)
      testTestCases(server, categoryName, testCases)
      //endregion

      //region token test

      if(server.mode.service == serviceType.newChain && server.mode.restrictedLevel >= restrictedLevel.L3){

        txFunctionName = consts.rpcFunctions.sendTx
        describe('代币测试：' + txFunctionName, async function () {
          testForIssueTokenInComplexMode(server, txFunctionName)
        })

        txFunctionName = consts.rpcFunctions.signTx
        describe('代币测试：' + txFunctionName, async function () {
          testForIssueTokenInComplexMode(server, txFunctionName)
        })

      }

      //endregion

    })
  }

  //region transfer tx

  function createTestCasesForBasicTransaction(server, categoryName, txFunctionName, txParams){
    let testCases = []
    let testCaseParams = createTestCaseParams(server, categoryName, txFunctionName, txParams)
    if(txFunctionName == consts.rpcFunctions.sendTx) testCaseParams.supportedServices.push(serviceType.oldChain)

    //region test cases for basic transfer
    testCaseParams.title = '0010\t发起' + testCaseParams.categoryName + '有效交易_01'
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0020\t发起' + categoryName + '有效交易_02: 交易额填"' + testCaseParams.txParams[0].value + '"等'
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].value = "123/swt"
      })
      //only test when send swt
      if(testCaseParams.txParams[0].symbol == null) {
        addTestCase(testCases, testCase)
      }
    }

    testCaseParams.title = '0030\t发起' + categoryName + '无效交易_01: 没有秘钥'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].secret = null
        // testCaseParams.expectedResult = createExpecteResult(false, true, 'No secret found for')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            server.mode.service == serviceType.newChain ? 'No secret found for' : consts.engineResults.temINVALID_SECRET)
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0030\t发起' + categoryName + '无效交易_01: 错误的秘钥1'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].secret = '错误的秘钥'
        // testCaseParams.expectedResult = createExpecteResult(false, true, 'Bad Base58 string')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            server.mode.service == serviceType.newChain ? 'Bad Base58 string' : consts.engineResults.temMALFORMED)
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0030\t发起' + categoryName + '无效交易_01: 错误的秘钥2'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].secret = testCaseParams.txParams[0].secret + '1'
        // testCaseParams.expectedResult = createExpecteResult(false, true, 'Bad Base58 checksum')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            server.mode.service == serviceType.newChain ? 'Bad Base58 checksum' : consts.engineResults.temMALFORMED)
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0040\t发起' + categoryName + '无效交易_02: 错误的发起钱包地址（乱码字符串）'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].from = testCaseParams.txParams[0].from + '1'
        // testCaseParams.expectedResult = createExpecteResult(false, true, 'Bad account address:')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            server.mode.service == serviceType.newChain ? 'Bad account address:' : consts.engineResults.temINVALID_FROM_ADDRESS)
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0050\t发起' + categoryName + '无效交易_03: 错误的接收钱包地址（乱码字符串）'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].to = testCaseParams.txParams[0].to + '1'
        // testCaseParams.expectedResult = createExpecteResult(false, true, 'Bad account address:')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            server.mode.service == serviceType.newChain ? 'Bad account address:' : consts.engineResults.temINVALID_TO_ADDRESS)
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0060\t发起' + categoryName + '无效交易_04: 交易额超过发起钱包余额'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].value = "999999999999999" + testCaseParams.showSymbol
        // testCaseParams.expectedResult = createExpecteResult(false, false, 'telINSUF_FEE_P Fee insufficient')
        // testCaseParams.expectedResult = createExpecteResult(false, true, 'telINSUF_FEE_P Fee insufficient')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            server.mode.service == serviceType.newChain ? 'telINSUF_FEE_P Fee insufficient' : consts.engineResults.temBAD_AMOUNT)
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0070\t发起' + categoryName + '无效交易_05: 交易额为负数'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].value = "-100" + testCaseParams.showSymbol
        // testCaseParams.expectedResult = createExpecteResult(false, false,
        //     'temBAD_AMOUNT Can only send positive amounts')
        // testCaseParams.expectedResult = createExpecteResult(false, true,
        //     'temBAD_AMOUNT Can only send positive amounts')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            server.mode.service == serviceType.newChain ? 'value must be integer type and >= 0' : consts.engineResults.temBAD_AMOUNT)
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0080\t发起' + categoryName + '无效交易_06: 交易额为空'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].value = null
        // testCaseParams.expectedResult = createExpecteResult(false, true, 'Invalid Number')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            server.mode.service == serviceType.newChain ? 'Invalid Number' : consts.engineResults.temBAD_AMOUNT)
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0080\t发起' + categoryName + '无效交易_06: 交易额为字符串'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].value = "aawrwfsfs"
        // testCaseParams.expectedResult = createExpecteResult(false, true, 'Invalid Number')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            server.mode.service == serviceType.newChain ? 'Invalid Number' : consts.engineResults.temBAD_AMOUNT)
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0090\t发起' + categoryName + '无效交易_07: 交易额为小于0.000001(最小数额)的正小数'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].value = "0.0000001" + testCaseParams.showSymbol
        // testCaseParams.expectedResult = createExpecteResult(false, true, 'value must be integer type')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            server.mode.service == serviceType.newChain ? 'value must be integer type' : consts.engineResults.temBAD_AMOUNT)
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0100\t发起' + categoryName + '无效交易_08: 交易额为大于0.000001(最小数额)的小数'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].value = "0.0000011" + testCaseParams.showSymbol
        // testCaseParams.expectedResult = createExpecteResult(false, true, 'value must be integer type')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            server.mode.service == serviceType.newChain ? 'value must be integer type' : consts.engineResults.temBAD_AMOUNT)
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0110\t发起' + categoryName + '无效交易_09: 交易额为负小数：-0.1、-1.23等'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].value = "-0.1" + testCaseParams.showSymbol
        // testCaseParams.expectedResult = createExpecteResult(false, true, 'value must be integer type')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            server.mode.service == serviceType.newChain ? 'value must be integer type' : consts.engineResults.temBAD_AMOUNT)
      })
      addTestCase(testCases, testCase)
    }

    //endregion

    return testCases
  }

  function createTestCasesForTransactionWithMemo(server, categoryName, txFunctionName, txParams){
    let testCases = []
    let testCaseParams = createTestCaseParams(server, categoryName, txFunctionName, txParams)
    if(txFunctionName == consts.rpcFunctions.sendTx) testCaseParams.supportedServices.push(serviceType.oldChain)

    //region test cases
    testCaseParams.title = '0120\t发起带有效memo的交易_01: memo格式为："memos":["大家好"]'
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].memos = ["大家好"]
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0120\t发起带有效memo的交易_01: memo格式为奇数长度数字字串："memos":["12345"]'
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].memos = ["12345"]
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0120\t发起带有效memo的交易_01: memo格式为偶数长度数字字串："memos":["123456"]'
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].memos = ["123456"]
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0120\t发起带有效memo的交易_01: memo格式为字串："memos":["E5A4A7E5AEB6E5A5BDff"]'
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].memos = ["E5A4A7E5AEB6E5A5BDff"]
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0130\t发起带有效memo的交易_02: memo格式为： "memos":[{"type":"ok","format":"utf8","data":"E5A4A7E5AEB6E5A5BD"}]'
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].memos = [{"type":"ok","format":"utf8","data":"E5A4A7E5AEB6E5A5BD"}]
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0140\t发起带无效memo的交易_01: memo内容使整个交易内容超过900K'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        let memos = "E5A4A7E5AEB6E5A5BD"
        for(let i = 0; i < 18; i++){
          memos += memos
        }
        testCaseParams.txParams[0].memos = memos
        testCaseParams.restrictedLevel = restrictedLevel.L4
        testCaseParams.expectedResult = createExpecteResult(false, true, 'memos data error')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0150\t发起带无效memo的交易_02: memo内容使整个交易内容超过900K'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        let memos = "E5A4A7E5AEB6E5A5BD"
        for(let i = 0; i < 18; i++){
          memos += memos
        }
        testCaseParams.txParams[0].memos = {"type":"ok","format":"utf8","data":memos}
        testCaseParams.restrictedLevel = restrictedLevel.L4
        testCaseParams.expectedResult = createExpecteResult(false, true, 'memos data error')
      })
      addTestCase(testCases, testCase)
    }
    // endregion

    return testCases
  }

  function createTestCasesForTransactionWithFee(server, categoryName, txFunctionName, txParams){
    let testCases = []
    let testCaseParams = createTestCaseParams(server, categoryName, txFunctionName, txParams)

    //region test cases
    testCaseParams.title = '0160\t发起带有效fee的交易_01: fee为默认值12'
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].fee = server.mode.defaultFee
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0160\t发起带有效fee的交易_01: fee为null'
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0170\t发起带有效fee的交易_02: fee比12小，但是足以发起成功的交易，fee=10'
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].fee = "10"
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0180\t发起带有效fee的交易_03: fee比12大但小于钱包余额'
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].fee = "110"
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0190\t发起带无效fee的交易_01: fee比12小（比如5），但是不足以发起成功的交易，fee=9'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].fee = "9"
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'tecINSUFF_FEE Insufficient balance to pay fee')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0200\t发起带无效fee的交易_02: fee为0'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].fee = "0"
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'tecINSUFF_FEE Insufficient balance to pay fee')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0210\t发起带无效fee的交易_03: fee为大于0的小数，比如12.5、5.5'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].fee = "12.5"
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'tecINSUFF_FEE Insufficient balance to pay fee')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0220\t发起带无效fee的交易_04: fee为大于发起钱包' + categoryName + '余额的整数'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].fee = "999999999999999"
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'telINSUF_FEE_P Fee insufficient')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0230\t发起带无效fee的交易_05: fee为负数，比如-3.5、-555等'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].fee = "-35"
        // testCaseParams.expectedResult = createExpecteResult(false, false,
        //     'tecINSUFF_FEE Insufficient balance to pay fee')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'tecINSUFF_FEE Insufficient balance to pay fee')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0240\t发起带无效fee的交易_06: fee为数字'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].fee = 35
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'interface conversion: interface {} is float64, not string')
      })
      addTestCase(testCases, testCase)
    }
    //endregion

    return testCases
  }

  //endregion

  //region issue token tx

  function createTestCasesForCreateToken(server, categoryName, txFunctionName, txParams){
    let testCases = []
    let testCaseParams = createTestCaseParams(server, categoryName, txFunctionName, txParams)
    testCaseParams.restrictedLevel = restrictedLevel.L3

    //region test cases

    testCaseParams.title = '0270\t发行' + testCaseParams.categoryName
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForIssueToken(testCaseParams, function(){
        testCaseParams.expectedResult.expectedBalance = txParams[0].total_supply
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0290\t发行' + testCaseParams.categoryName + '_无效的type参数'
    {
      let testCase = createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].type = "issuecoin"
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'Invalid Number:  Reason: strconv.ParseUint: parsing "": invalid syntax')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0300\t发行' + testCaseParams.categoryName + '_无效的from参数'
    {
      let testCase = createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].from = "from.address"
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'Bad account address: from.address: Bad Base58 string: from.address')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0310\t发行' + testCaseParams.categoryName + '_无效的name参数:很长的字符串'
    {
      let testCase = createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].name = "tokenName.name12345678901234567890tokenName.name12345678901234567890tokenName.name12345678901234567890" +
            "tokenName.name12345678901234567890tokenName.name12345678901234567890tokenName.name12345678901234567890"
        testCaseParams.txParams[0].symbol = getDynamicName().symbol
        // testCaseParams.expectedResult = createExpecteResult(false, false,
        //     'failed to submit transaction')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'failed to submit transaction')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0310\t发行' + testCaseParams.categoryName + '_无效的name参数:被已有代币使用过的name'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].name = token.existToken.name
        // testCaseParams.expectedResult = createExpecteResult(false, false,
        //         //     'failed to submit transaction')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'failed to submit transaction')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0320\t发行' + testCaseParams.categoryName + '_无效的symbol参数:很长的字符串'
    {
      let testCase = createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].symbol = "tokenName.symbolymboltokenN"
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'symbol must be the characters with alphas[a-zA-Z], numbers[0-9], chinese characters[一-龥] and underscores[_]')
      })
      addTestCase(testCases, testCase)
    }

    //todo it will cause no response, looks like no response from server.request
    testCaseParams.title = '0320\t发行' + testCaseParams.categoryName + '_无效的symbol参数:被已有代币使用过的symbol'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].symbol = token.existToken.symbol
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'tefNO_PERMISSION_ISSUE No permission issue')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0330\t发行' + testCaseParams.categoryName + '_无效的decimals参数:字符串'
    {
      let testCase = createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].decimals = "config.decimals"
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'decimals must be integer type(string) and in range [0, 18]')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0330\t发行' + testCaseParams.categoryName + '_无效的decimals参数:负数'
    {
      let testCase = createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].decimals = -8
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'decimals must be integer type(string) and in range [0, 18]')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0330\t发行' + testCaseParams.categoryName + '_无效的decimals参数:小数'
    {
      let testCase = createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].decimals = 11.64
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'decimals must be integer type(string) and in range [0, 18]')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0340\t发行' + testCaseParams.categoryName + '_无效的total_supply参数:字符串'
    {
      let testCase = createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].total_supply = "config.total_supply"
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'total_supply must be integer type')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0340\t发行' + testCaseParams.categoryName + '_无效的total_supply参数:负数'
    {
      let testCase = createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].total_supply = -10000000
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'invalid syntax')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0340\t发行' + testCaseParams.categoryName + '_无效的total_supply参数:小数'
    {
      let testCase = createTestCaseWhenSignFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].total_supply = 10000.12345678
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'strconv.ParseInt: parsing')
      })
      addTestCase(testCases, testCase)
    }

    //endregion

    return testCases
  }

  function createTestCasesForMintToken(server, categoryName, txFunctionName, txParams){
    let testCases = []
    let testCaseParams = createTestCaseParams(server, categoryName, txFunctionName, txParams)
    testCaseParams.restrictedLevel = restrictedLevel.L3

    // await utility.timeout(1)  //make sure create token done first!

    //region test cases
    testCaseParams.title = '0370\t增发可增发的代币' + testCaseParams.categoryName
    {
      let testCase = canMint(testCaseParams.txParams[0].flags) ?
          createTestCaseWhenSignPassAndSendRawTxPassForIssueToken(testCaseParams, function(){
            testCaseParams.txParams[0].total_supply = '9'
            testCaseParams.expectedResult.expectedBalance = 19753086419
          })
          :
          createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
            testCaseParams.txParams[0].total_supply = '9'
            testCaseParams.expectedResult = createExpecteResult(false, true,
                'tefNO_PERMISSION_ISSUE No permission issue')
          })
      addTestCase(testCases, testCase)
    }
    //endregion

    return testCases
  }

  function createTestCasesForBurnToken(server, categoryName, txFunctionName, txParams){
    let testCases = []
    let testCaseParams = createTestCaseParams(server, categoryName, txFunctionName, txParams)
    testCaseParams.restrictedLevel = restrictedLevel.L3

    //region test cases
    testCaseParams.title = '0380\t销毁' + testCaseParams.categoryName
    {
      let testCase = canBurn(testCaseParams.txParams[0].flags) ?
          createTestCaseWhenSignPassAndSendRawTxPassForIssueToken(testCaseParams, function(){
            testCaseParams.txParams[0].total_supply = '-9'
          })
          :
          createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
            testCaseParams.txParams[0].total_supply = '-9'
            testCaseParams.expectedResult = createExpecteResult(false, true,
                'tefNO_PERMISSION_ISSUE No permission issue')
          })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0420\t无效地销毁：销毁数量大于发行数量' + testCaseParams.categoryName
    {
      testCaseParams.otherParams.oldBalance = '49382716041'
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].total_supply = '-9876543210000'
        let burnable = canBurn(testCaseParams.txParams[0].flags)
        testCaseParams.expectedResult = createExpecteResult(false, true,
            burnable ? 'telINSUF_FUND Fund insufficient' : 'tefNO_PERMISSION_ISSUE No permission issue')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0380\t销毁所有' + testCaseParams.categoryName
    {
      let testCase = canBurn(testCaseParams.txParams[0].flags) ?
          createTestCaseWhenSignPassAndSendRawTxPassForIssueToken(testCaseParams, function(){
            if(testCaseParams.txParams[0].flags == consts.flags.burnable){
              testCaseParams.txParams[0].total_supply = '-9876543191'
            }
            else if(testCaseParams.txParams[0].flags == consts.flags.both){  //it minted 9 more in above test case, so need add it.
              // testCaseParams.txParams[0].total_supply =  '-9876543219'
              testCaseParams.txParams[0].total_supply =  '-19753086410'
            }
            // testCaseParams.txParams[0].total_supply =  '-9876543191'

            // let data = testCaseParams.txParams[0]
            // let server = testCaseParams.server
            // // logger.debug('++++' + JSON.stringify(data))
            // server.getBalance(data.from, data.symbol).then(function(balance){
            //   logger.debug('++++' + JSON.stringify(balance))
            //   testCaseParams.txParams[0].total_supply = '-' + balance.value
            // })

            testCaseParams.expectedResult = createExpecteResult(true)
            testCaseParams.expectedResult.expectedBalance = 0
          })
          :
          createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
            testCaseParams.txParams[0].total_supply =  '-49382716041'
            testCaseParams.expectedResult = createExpecteResult(false, true,
                'tefNO_PERMISSION_ISSUE No permission issue')
          })
      addTestCase(testCases, testCase)
    }
    //endregion

    return testCases
  }

  //endregion

  //endregion

  //region blockNumber test case

  function testForGetBlockNumber(server, describeTitle) {
    let testCases = []
    let testCase = {}

    let title = '0010\t查询最新区块号：发起查询请求，等待5秒或10秒（同步时间），再次发起查询请求'
    {
      testCase = createTestCase(
          title,
          server,
          consts.rpcFunctions.getBlockNumber,
          null,
          null,
          function (testCase) {  //execute function
            testCase.hasExecuted = true
            return get2BlockNumber(server).then(function (compareResult) {
              // testCase.hasExecuted = true
              testCase.actualResult.push(compareResult)
            }, function (error) {
              logger.debug(error)
              expect(false).to.be.ok
            })
          },
          function (testCase) {  //check function
            let value = testCase.actualResult[0]
            expect(value.blockNumber2 - value.blockNumber1).to.be.most(2)
            expect(value.blockNumber2 - value.blockNumber1).to.be.least(1)
          },
          null,
          restrictedLevel.L2,
          [serviceType.newChain, serviceType.oldChain],
          [],//[interfaceType.rpc, interfaceType.websocket]
      )
    }
    addTestCase(testCases, testCase)

    title = '0010\t查询最新区块号'
    {
      testCase = createTestCase(
          title,
          server,
          consts.rpcFunctions.getBlockNumber,
          null,
          null,
          executeTestCaseForGet,
          checkBlockNumber,
          null,
          restrictedLevel.L2,
          [serviceType.newChain, serviceType.oldChain],
          [],//[interfaceType.rpc, interfaceType.websocket]
      )
    }
    addTestCase(testCases, testCase)
    testTestCases(server, describeTitle, testCases)
  }

  function checkBlockNumber(testCase){
    let response = testCase.actualResult[0]
    checkResponse(true, response)
    expect(response.result).to.be.jsonSchema(schema.BLOCKNUMBER_SCHEMA)
    expect(response.result).to.be.above(100)
  }

  //endregion

  //region balance check

  function testForGetBalance(server, describeTitle){
    describe(describeTitle, function () {
      let symbol = null //swtc
      testForGetBalanceByAllTags(server, symbol)
      if(server.mode.service == serviceType.newChain){
        symbol = '5e69b0cc'   //token without issuer
        testForGetBalanceByAllTags(server, symbol)
        symbol = '5e69b0d4'   //token with issuer
        testForGetBalanceByAllTags(server, symbol)
      }
    })
  }

  function testForGetBalanceByAllTags(server, symbol){
    testForGetBalanceBySymbolAndTag(server, symbol, null)
    testForGetBalanceBySymbolAndTag(server, symbol, 'current')
    testForGetBalanceBySymbolAndTag(server, symbol, 'validated')
    testForGetBalanceBySymbolAndTag(server, symbol, 'closed')
    testForGetBalanceBySymbolAndTag(server, symbol, '4136')  //block number  //todo: always timeout, need restore
    testForGetBalanceBySymbolAndTag(server, symbol, 'C0B53E636BE844AD4AD1D54391E589931A71F08D72CA7AE6E103312CB30C1D91')  //block 4136
  }

  function testForGetBalanceBySymbolAndTag(server, symbol, tag){

    let testCases = []
    let showSymbol = symbol == null ? 'swtc' : symbol
    let describeTitle = '测试jt_getBalance， Token为' + showSymbol + '，tag为' + tag

    let title = '0010\t查询有效的地址_01:地址内有底层币和代币'
    let addressOrName = addresses.balanceAccount.address
    let needPass = true
    let expectedError = ''
    let testCase = createSingleTestCaseForGetBalance(server, title, addressOrName, symbol, tag, needPass, expectedError)
    if(tag == null) testCase.supportedServices.push(serviceType.oldChain)
    addTestCase(testCases, testCase)

    title = '0010\t查询有效的昵称_01:地址内有底层币和代币'
    addressOrName = addresses.balanceAccount.nickName
    testCase = createSingleTestCaseForGetBalance(server, title, addressOrName, symbol, tag, needPass, expectedError)
    addTestCase(testCases, testCase)

    title = '0010\t查询未激活的地址_01:地址内没有有底层币和代币'
    addressOrName = addresses.inactiveAccount1.address
    needPass = false
    //expectedError = 'no such account'
    expectedError = 'Account not found.'
    testCase = createSingleTestCaseForGetBalance(server, title, addressOrName, symbol, tag, needPass, expectedError)
    if(tag == null) testCase.supportedServices.push(serviceType.oldChain)
    addTestCase(testCases, testCase)

    title = '0010\t查询未激活的昵称_01:地址内没有有底层币和代币'
    addressOrName = addresses.inactiveAccount1.nickName
    //expectedError = 'Bad account address:'
    expectedError = 'invalid account'
    testCase = createSingleTestCaseForGetBalance(server, title, addressOrName, symbol, tag, needPass, expectedError)
    addTestCase(testCases, testCase)

    title = '0010\t查询无效的地址_01:地址内没有有底层币和代币'
    addressOrName = addresses.wrongFormatAccount1.address
    testCase = createSingleTestCaseForGetBalance(server, title, addressOrName, symbol, tag, needPass, expectedError)
    if(tag == null) testCase.supportedServices.push(serviceType.oldChain)
    addTestCase(testCases, testCase)

    title = '0010\t查询无效的昵称_01:地址内没有有底层币和代币'
    addressOrName = addresses.wrongFormatAccount1.nickName
    testCase = createSingleTestCaseForGetBalance(server, title, addressOrName, symbol, tag, needPass, expectedError)
    addTestCase(testCases, testCase)

    testTestCases(server, describeTitle, testCases)
  }

  function createSingleTestCaseForGetBalance(server, title, addressOrName, symbol, tag, needPass, expectedError){

    let functionName = consts.rpcFunctions.getBalance
    let txParams = []
    txParams.push(addressOrName)
    txParams.push(symbol != null ? symbol : '')
    if(tag != null) txParams.push(tag)
    let expectedResult = {}
    expectedResult.needPass = needPass
    expectedResult.isErrorInResult = true
    expectedResult.expectedError = expectedError

    let testCase = createTestCase(
        title,
        server,
        functionName,
        txParams,
        null,
        executeTestCaseForGet,
        checkGetBalance,
        expectedResult,
        restrictedLevel.L2,
        [serviceType.newChain,],
        [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
    )

    return testCase
  }

  function checkGetBalance(testCase){
    let response = testCase.actualResult[0]
    let needPass = testCase.expectedResult.needPass
    checkResponse(needPass, response)
    if(needPass){
      let symbol = testCase.txParams[1]
      if(symbol == ''){  //todo suppose it is swtc, in fact, maybe not.  the better way is formats of balance of swtc and token are the same.
        expect(response.result).to.be.jsonSchema(schema.BALANCE_SCHEMA)
        expect(Number(response.result.balance)).to.be.above(0)
      }
      else{ //suppose it is token
        expect(response.result).to.be.jsonSchema(schema.BALANCE_TOKEN_SCHEMA)
        expect(Number(response.result.balance.value)).to.be.above(0)
      }

    }
    else{
      expect(response.result).to.contains(testCase.expectedResult.expectedError)
    }
  }

  //endregion

  //region account check
  //region create account
  function testForCreateAccount(server, describeTitle){
    let testCases = []

    let title = '0010\t创建有效的账户'
    let nickName = getDynamicName().symbol
    let needPass = true
    let expectedError = ''
    let testCase = createSingleTestCaseForCreateAccount(server, title, nickName, needPass, expectedError)
    addTestCase(testCases, testCase)

    title = '0020\t创建无效的账户:重复的名字'
    nickName = 'autotest_1'
    needPass = false
    expectedError = 'the nickname already exists'
    testCase = createSingleTestCaseForCreateAccount(server, title, nickName, needPass, expectedError)
    addTestCase(testCases, testCase)

    title = '0020\t创建无效的账户:超过长度的字符串数字'
    nickName = getDynamicName().name + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字'
        + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字'
        + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字'
        + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字' + '很长的名字'
    needPass = false
    expectedError = ''
    testCase = createSingleTestCaseForCreateAccount(server, title, nickName, needPass, expectedError)
    addTestCase(testCases, testCase)

    testTestCases(server, describeTitle, testCases)
  }

  function createSingleTestCaseForCreateAccount(server, title, nickName, needPass, expectedError){

    let functionName = consts.rpcFunctions.createAccount
    let txParams = []
    txParams.push(nickName)
    let expectedResult = {}
    expectedResult.needPass = needPass
    expectedResult.isErrorInResult = true
    expectedResult.expectedError = expectedError

    let testCase = createTestCase(
        title,
        server,
        functionName,
        txParams,
        null,
        executeTestCaseForGet,
        checkCreateAccount,
        expectedResult,
        restrictedLevel.L2,
        [serviceType.newChain],
        [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
    )

    return testCase
  }

  function checkCreateAccount(testCase){
    let response = testCase.actualResult[0]
    let needPass = testCase.expectedResult.needPass
    checkResponse(needPass, response)
    if(needPass){
      let account = response.result[0]
      let nickName = testCase.txParams[0]
      // expect(value.result).to.be.jsonSchema(schema.WALLET_SCHEMA)
      expect(account.address).to.match(/^j/)
      expect(account.secret).to.match(/^s/)
      expect(account.nickname).to.equal(nickName)  //todo: bug, nickname should be nickName
    }
    else{
      expect(response.result).to.contains(testCase.expectedResult.expectedError)
    }
  }
  //endregion

  //region get account
  function testForGetAccount(server, describeTitle){
    testForGetAccountByTag(server, describeTitle, null)
    testForGetAccountByTag(server, describeTitle, 'validated')
    testForGetAccountByTag(server, describeTitle, 'current')
    testForGetAccountByTag(server, describeTitle, 'closed')
  }

  function testForGetAccountByTag(server, describeTitle, tag){
    let testCases = []

    describeTitle = describeTitle + '， tag为' + tag

    let title = '0010\t查询有效的地址_01:地址内有底层币和代币'
    let addressOrName = addresses.balanceAccount.address
    let needPass = true
    let expectedError = ''
    let testCase = createSingleTestCaseForGetAccount(server, title, addressOrName, tag, needPass, expectedError)
    testCase.supportedServices.push(serviceType.oldChain)
    addTestCase(testCases, testCase)

    title = '0010\t查询有效的昵称_01:地址内有底层币和代币'
    addressOrName = addresses.balanceAccount.nickName
    testCase = createSingleTestCaseForGetAccount(server, title, addressOrName, tag, needPass, expectedError)
    addTestCase(testCases, testCase)

    title = '0010\t查询未激活的地址_01:地址内没有有底层币和代币'
    addressOrName = addresses.inactiveAccount1.address
    needPass = false
    //expectedError = 'no such account'
    expectedError = 'Account not found.'
    testCase = createSingleTestCaseForGetAccount(server, title, addressOrName, tag, needPass, expectedError)
    testCase.supportedServices.push(serviceType.oldChain)
    addTestCase(testCases, testCase)

    title = '0010\t查询未激活的昵称_01:地址内没有有底层币和代币'
    addressOrName = addresses.inactiveAccount1.nickName
    //expectedError = 'Bad account address:'
    expectedError = 'invalid account'
    testCase = createSingleTestCaseForGetAccount(server, title, addressOrName, tag, needPass, expectedError)
    addTestCase(testCases, testCase)

    title = '0010\t查询无效的地址_01:地址内没有有底层币和代币'
    addressOrName = addresses.wrongFormatAccount1.address
    testCase = createSingleTestCaseForGetAccount(server, title, addressOrName, tag, needPass, expectedError)
    testCase.supportedServices.push(serviceType.oldChain)
    addTestCase(testCases, testCase)

    title = '0010\t查询无效的昵称_01:地址内没有有底层币和代币'
    addressOrName = addresses.wrongFormatAccount1.nickName
    testCase = createSingleTestCaseForGetAccount(server, title, addressOrName, tag, needPass, expectedError)
    addTestCase(testCases, testCase)

    testTestCases(server, describeTitle, testCases)
  }

  function createSingleTestCaseForGetAccount(server, title, addressOrName, tag, needPass, expectedError){

    let functionName = consts.rpcFunctions.getAccount
    let txParams = []
    txParams.push(addressOrName)
    if(tag != null) txParams.push(tag)
    let expectedResult = {}
    expectedResult.needPass = needPass
    expectedResult.isErrorInResult = true
    expectedResult.expectedError = expectedError

    let testCase = createTestCase(
        title,
        server,
        functionName,
        txParams,
        null,
        executeTestCaseForGet,
        checkGetAccount,
        expectedResult,
        restrictedLevel.L2,
        [serviceType.newChain,],
        [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
    )

    return testCase
  }

  function checkGetAccount(testCase){
    let response = testCase.actualResult[0]
    let needPass = testCase.expectedResult.needPass
    checkResponse(needPass, response)
    if(needPass){
      // expect(response.result).to.be.jsonSchema(schema.BALANCE_SCHEMA)  //todo: add account schema
      expect(Number(response.result.Balance)).to.be.above(0)
    }
    else{
      expect(response.result).to.contains(testCase.expectedResult.expectedError)
    }
  }
  //endregion

  //region get accounts
  function testForGetAccounts(server, describeTitle){
    let testCases = []

    let title = '0010\tjt_accounts'
    let functionName = consts.rpcFunctions.getAccounts
    let txParams = []
    let expectedResult = {}
    expectedResult.needPass = true

    let testCase = createTestCase(
        title,
        server,
        functionName,
        txParams,
        null,
        executeTestCaseForGet,
        checkGetAccounts,
        expectedResult,
        restrictedLevel.L2,
        [serviceType.newChain, ],
        [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
    )
    addTestCase(testCases, testCase)

    testTestCases(server, describeTitle, testCases)
  }

  function checkGetAccounts(testCase){
    let response = testCase.actualResult[0]
    let needPass = testCase.expectedResult.needPass
    checkResponse(needPass, response)
    if(needPass){
      // expect(response.result).to.be.jsonSchema(schema.BALANCE_SCHEMA)  //todo: add account schema
      let accounts = response.result
      let rootAccount = 'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh:root'
      // logger.debug(JSON.stringify(accounts))
      expect(accounts.length).to.be.above(0)
      expect(accounts).to.be.contains(rootAccount)
    }
    else{
      expect(response.result).to.contains(testCase.expectedResult.expectedError)
    }
  }
  //endregion
  //endregion

  //region get tx check

  //region get tx by hash
  function testForGetTransaction(server, describeTitle){
    let testCases = []

    let txs = server.mode.txs

    let title = '0010\t查询有效交易哈希-底层币'
    let hash = txs.tx1.hash
    let needPass = true
    let expectedError = ''
    let testCase = createSingleTestCaseForGetTransaction(server, title, hash, needPass, expectedError)
    addTestCase(testCases, testCase)

    title = '0020\t查询有效交易哈希-token'
    hash = txs.tx_token.hash
    testCase = createSingleTestCaseForGetTransaction(server, title, hash, needPass, expectedError)
    addTestCase(testCases, testCase)

    title = '0030\t查询有效交易哈希-memos'
    hash = txs.tx_memo.hash
    testCase = createSingleTestCaseForGetTransaction(server, title, hash, needPass, expectedError)
    addTestCase(testCases, testCase)

    title = '0040\t查询无效交易哈希:数字'
    hash = 1231111
    needPass = false
    //expectedError = 'interface conversion: interface {} is float64, not string'  //new chain
    expectedError = 'invalid tx hash'
    testCase = createSingleTestCaseForGetTransaction(server, title, hash, needPass, expectedError)
    addTestCase(testCases, testCase)

    title = '0040\t查询无效交易哈希:字符串'
    hash = 'data.tx1.hash'
    //expectedError = 'encoding/hex: invalid byte:'
    expectedError = 'invalid tx hash'
    testCase = createSingleTestCaseForGetTransaction(server, title, hash, needPass, expectedError)
    addTestCase(testCases, testCase)

    title = '0040\t查询无效交易哈希:参数为空'
    hash = null
    //expectedError = 'interface conversion: interface {} is nil, not string'
    expectedError = 'invalid tx hash'
    testCase = createSingleTestCaseForGetTransaction(server, title, hash, needPass, expectedError)
    addTestCase(testCases, testCase)

    title = '0040\t无效交易哈希：不存在的hash'
    hash = 'B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A'
    //expectedError = 'can\'t find transaction'
    expectedError = 'Transaction not found.'
    testCase = createSingleTestCaseForGetTransaction(server, title, hash, needPass, expectedError)
    addTestCase(testCases, testCase)

    title = '0040\t无效交易哈希：hash长度超过标准'
    hash = 'B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A1F'
    //expectedError = 'index out of range'
    expectedError = 'invalid tx hash'
    testCase = createSingleTestCaseForGetTransaction(server, title, hash, needPass, expectedError)
    addTestCase(testCases, testCase)

    testTestCases(server, describeTitle, testCases)
  }

  function createSingleTestCaseForGetTransaction(server, title, hash, needPass, expectedError){

    let functionName = consts.rpcFunctions.getTransactionByHash
    let txParams = []
    txParams.push(hash)

    let expectedResult = {}
    expectedResult.needPass = needPass
    expectedResult.isErrorInResult = true
    expectedResult.expectedError = expectedError

    let testCase = createTestCase(
        title,
        server,
        functionName,
        txParams,
        null,
        executeTestCaseForGet,
        checkTransaction,
        expectedResult,
        restrictedLevel.L2,
        [serviceType.newChain, serviceType.oldChain],
        [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
    )

    return testCase
  }

  function checkTransaction(testCase){
    let response = testCase.actualResult[0]
    let needPass = testCase.expectedResult.needPass
    checkResponse(needPass, response)
    if(needPass){
      let hash = testCase.txParams[0]
      // expect(value.result).to.be.jsonSchema(schema.TX_SCHEMA)
      expect(response.result.hash).to.be.equal(hash)
    }
    else{
      expect(response.result).to.contains(testCase.expectedResult.expectedError)
    }
  }
  //endregion

  //region get tx by block and index
  function testForGetTransactionByBlockHashAndIndex(server, describeTitle){
    let testCases = []
    let functionName = consts.rpcFunctions.getTransactionByBlockHashAndIndex

    let title = '0010\t有效区块哈希，有效交易索引'
    let hash = txs.swtTx1.blockHash
    let index = txs.swtTx1.tx.meta.TransactionIndex.toString()
    let needPass = true
    let expectedError = ''
    let testCase = createSingleTestCaseForGetTransactionByBlockAndIndex(server, title, functionName, hash, index, needPass, expectedError)
    testCase.supportedServices = [serviceType.newChain,]
    addTestCase(testCases, testCase)

    title = '0010\t有效区块哈希，有效交易索引:查询有效区块编号，遍历所有有效交易索引'
    let blockHash = blocks.block1.hash
    testCase = createSingleTestCaseForGoThroughTxsInBlockByBlockHash(server, title, blockHash)
    testCase.supportedServices = [serviceType.newChain,]
    addTestCase(testCases, testCase)

    title = '0020\t有效区块哈希，无效交易索引无效交易索引:100'
    hash = txs.swtTx1.blockHash
    index = '100'
    needPass = false
    expectedError = 'no such transaction in block'
    testCase = createSingleTestCaseForGetTransactionByBlockAndIndex(server, title, functionName, hash, index, needPass, expectedError)
    testCase.supportedServices = [serviceType.newChain,]
    addTestCase(testCases, testCase)

    title = '0020\t有效区块哈希，无效交易索引无效交易索引:负数'
    hash = txs.swtTx1.blockHash
    index = '-1'
    needPass = false
    expectedError = 'index out of range'
    testCase = createSingleTestCaseForGetTransactionByBlockAndIndex(server, title, functionName, hash, index, needPass, expectedError)
    testCase.supportedServices = [serviceType.newChain,]
    addTestCase(testCases, testCase)

    title = '0020\t有效区块哈希，无效交易索引无效交易索引:乱码'
    hash = txs.swtTx1.blockHash
    index = 'asdf'
    needPass = false
    expectedError = 'invalid syntax'
    testCase = createSingleTestCaseForGetTransactionByBlockAndIndex(server, title, functionName, hash, index, needPass, expectedError)
    testCase.supportedServices = [serviceType.newChain,]
    addTestCase(testCases, testCase)

    title = '0030\t无效区块哈希'
    hash = 'B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A'
    index = '0'
    needPass = false
    expectedError = 'can\'t find block'
    testCase = createSingleTestCaseForGetTransactionByBlockAndIndex(server, title, functionName, hash, index, needPass, expectedError)
    testCase.supportedServices = [serviceType.newChain,]
    addTestCase(testCases, testCase)

    testTestCases(server, describeTitle, testCases)
  }

  function testForGetTransactionByBlockNumberAndIndex(server, describeTitle){
    let testCases = []
    let functionName = consts.rpcFunctions.getTransactionByBlockNumberAndIndex

    let tx1 = txs.swtTx1.tx
    let title = '0010\t有效区块哈希，有效交易索引'
    let blockNumber = tx1.ledger_index.toString()
    let index = txs.swtTx1.tx.meta.TransactionIndex.toString()
    let needPass = true
    let expectedError = ''
    let testCase = createSingleTestCaseForGetTransactionByBlockAndIndex(server, title, functionName, blockNumber, index, needPass, expectedError)
    testCase.supportedServices = [serviceType.newChain,]
    addTestCase(testCases, testCase)

    title = '0010\t有效区块编号，有效交易索引:查询有效区块编号，遍历所有有效交易索引'
    blockNumber = blocks.block1.blockNumber
    testCase = createSingleTestCaseForGoThroughTxsInBlockByBlockNumber(server, title, blockNumber)
    testCase.supportedServices = [serviceType.newChain,]
    addTestCase(testCases, testCase)

    title = '0010\t有效区块编号，有效交易索引:查询有效区块编号earliest，遍历所有有效交易索引'
    blockNumber = "earliest"
    testCase = createSingleTestCaseForGoThroughTxsInBlockByBlockNumber(server, title, blockNumber)
    testCase.supportedServices = [serviceType.newChain,]
    addTestCase(testCases, testCase)

    title = '0010\t有效区块编号，有效交易索引:查询有效区块编号latest，遍历所有有效交易索引'
    blockNumber = "latest"
    testCase = createSingleTestCaseForGoThroughTxsInBlockByBlockNumber(server, title, blockNumber)
    testCase.supportedServices = [serviceType.newChain,]
    addTestCase(testCases, testCase)

    title = '0010\t有效区块编号，有效交易索引:查询有效区块编号pending，遍历所有有效交易索引'
    blockNumber = "pending"
    testCase = createSingleTestCaseForGoThroughTxsInBlockByBlockNumber(server, title, blockNumber)
    testCase.supportedServices = [serviceType.newChain,]
    addTestCase(testCases, testCase)

    title = '0020\t有效区块编号，无效交易索引无效交易索引:100'
    blockNumber = tx1.ledger_index.toString()
    index = '100'
    needPass = false
    expectedError = 'no such transaction in block'
    testCase = createSingleTestCaseForGetTransactionByBlockAndIndex(server, title, functionName, blockNumber, index, needPass, expectedError)
    testCase.supportedServices = [serviceType.newChain,]
    addTestCase(testCases, testCase)

    title = '0020\t有效区块编号，无效交易索引无效交易索引:负数'
    blockNumber = tx1.ledger_index.toString()
    index = '-1'
    needPass = false
    expectedError = 'index out of range'
    testCase = createSingleTestCaseForGetTransactionByBlockAndIndex(server, title, functionName, blockNumber, index, needPass, expectedError)
    testCase.supportedServices = [serviceType.newChain,]
    addTestCase(testCases, testCase)

    title = '0020\t有效区块编号，无效交易索引无效交易索引:乱码'
    blockNumber = tx1.ledger_index.toString()
    index = 'asdf'
    needPass = false
    expectedError = 'invalid syntax'
    testCase = createSingleTestCaseForGetTransactionByBlockAndIndex(server, title, functionName, blockNumber, index, needPass, expectedError)
    testCase.supportedServices = [serviceType.newChain,]
    addTestCase(testCases, testCase)

    title = '0030\t无效区块编号'
    blockNumber = '999999999'
    index = '0'
    needPass = false
    expectedError = 'can\'t find block'
    testCase = createSingleTestCaseForGetTransactionByBlockAndIndex(server, title, functionName, blockNumber, index, needPass, expectedError)
    testCase.supportedServices = [serviceType.newChain,]
    addTestCase(testCases, testCase)

    testTestCases(server, describeTitle, testCases)
  }

  function createSingleTestCaseForGetTransactionByBlockAndIndex(server, title, functionName, hashOrNumber, index, needPass, expectedError){

    let txParams = []
    txParams.push(hashOrNumber)
    txParams.push(index)

    let expectedResult = {}
    expectedResult.needPass = needPass
    expectedResult.isErrorInResult = true
    expectedResult.expectedError = expectedError

    let testCase = createTestCase(
        title,
        server,
        functionName,
        txParams,
        null,
        executeTestCaseForGet,
        checkTransactionByBlockHashAndIndex,
        expectedResult,
        restrictedLevel.L2,
        [serviceType.newChain,],
        [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
    )

    return testCase
  }

  function checkTransactionByBlockHashAndIndex(testCase){
    let response = testCase.actualResult[0]
    let needPass = testCase.expectedResult.needPass
    checkResponse(needPass, response)
    if(needPass){
      let tx1 = txs.swtTx1.tx
      compareTx(tx1, response.result)
    }
    else{
      expect(response.result).to.contains(testCase.expectedResult.expectedError)
    }
  }

  function createSingleTestCaseForGoThroughTxsInBlockByBlockHash(server, title, hash){
    // todo: need consider how to combine these 2 similar functions.
    // try to combine number and hash function but failed.
    // because use function as param will cause 'this' in function direct to other value, response function cannot be found.
    // let getCountFunc = numberOrHash.length == HASH_LENGTH ? server.responseGetTxCountByHash : server.responseGetTxCountByBlockNumber
    // let getTxFunc = numberOrHash.length == HASH_LENGTH ? server.responseGetTxByBlockHashAndIndex : server.responseGetTxByBlockNumberAndIndex

    return createTestCase(
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
          checkResponse(true, countResponse)
          let txCount = Number(countResponse.result)
          let finishCount = 0
          for(let i = 0; i < txCount; i++){
            await Promise.resolve(server.responseGetTxByBlockHashAndIndex(server, hash, i.toString())).then(function (response) {
              checkResponse(true, response)
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
  }

  function createSingleTestCaseForGoThroughTxsInBlockByBlockNumber(server, title, number){
    // todo: need consider how to combine these 2 similar functions.
    return createTestCase(
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
          checkResponse(true, countResponse)
          let txCount = Number(countResponse.result)
          let finishCount = 0
          for(let i = 0; i < txCount; i++){
            await Promise.resolve(server.responseGetTxCountByBlockNumber(server, number, i.toString())).then(function (response) {
              checkResponse(true, response)
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
  }

  async function goThroughTxsInBlockByBlockNumber(server, blockNumber){
    await server.responseGetTxCountByBlockNumber(server, blockNumber).then(async(countResponse)=>{
      checkResponse(true, countResponse)
      let txCount = Number(countResponse.result)
      let finishCount = 0
      for(let i = 0; i < txCount; i++){
        await Promise.resolve(server.responseGetTxByBlockNumberAndIndex(server, blockNumber.toString(), i.toString())).then(function (response) {
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
    await server.responseGetTxCountByHash(server, blockHash).then(async(countResponse)=>{
      checkResponse(true, countResponse)
      let txCount = Number(countResponse.result)
      let finishCount = 0
      for(let i = 0; i < txCount; i++){
        await Promise.resolve(server.responseGetTxByBlockHashAndIndex(server, blockHash, i.toString())).then(function (response) {
          checkResponse(true, response)
          finishCount++
        })
      }
      if(finishCount == txCount){
        logger.debug("遍历所有有效交易索引: " + txCount + " txs done!")
        return "done!"
      }
      else{
        expect(false).to.be.ok
      }
    })
  }
  //endregion

  //endregion

  //region tx receipt check

  function testForGetTransactionReceipt(server, describeTitle){
    let testCases = []

    let title = '0010\t有效交易哈希'
    let hash = 'B9A45BD943EE1F3AB8F505A61F6EE38F251DA723ECA084CBCDAB5076C60F84E7'
    let needPass = true
    let expectedError = ''
    let testCase = createSingleTestCaseForGetTransactionReceipt(server, title, hash, needPass, expectedError)
    addTestCase(testCases, testCase)

    title = '0020\t无效交易哈希：不存在的交易哈希'
    needPass = false
    hash = 'B9A45BD943EE1F3AB8F505A61F6EE38F251DA723ECA084CBCDAB5076C60F84E8'
    expectedError = 'can\'t find transaction'
    testCase = createSingleTestCaseForGetTransactionReceipt(server, title, hash, needPass, expectedError)
    addTestCase(testCases, testCase)

    title = '0020\t无效交易哈希：数字'
    hash = '100093'
    expectedError = 'NewHash256: Wrong length'
    testCase = createSingleTestCaseForGetTransactionReceipt(server, title, hash, needPass, expectedError)
    addTestCase(testCases, testCase)

    title = '0020\t无效交易哈希：字符串乱码'
    hash = '1231dsfafwrwerwer'
    expectedError = 'invalid byte'
    testCase = createSingleTestCaseForGetTransactionReceipt(server, title, hash, needPass, expectedError)
    addTestCase(testCases, testCase)

    testTestCases(server, describeTitle, testCases)
  }

  function createSingleTestCaseForGetTransactionReceipt(server, title, hash, needPass, expectedError){

    let functionName = consts.rpcFunctions.getTransactionReceipt
    let txParams = []
    txParams.push(hash)

    let expectedResult = {}
    expectedResult.needPass = needPass
    expectedResult.isErrorInResult = true
    expectedResult.expectedError = expectedError

    let testCase = createTestCase(
        title,
        server,
        functionName,
        txParams,
        null,
        executeTestCaseForGet,
        checkTransactionReceipt,
        expectedResult,
        restrictedLevel.L2,
        [serviceType.newChain, ],
        [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
    )

    return testCase
  }

  function checkTransactionReceipt(testCase){
    let response = testCase.actualResult[0]
    let needPass = testCase.expectedResult.needPass
    checkResponse(needPass, response)
    if(needPass){
      // expect(response.result).to.be.jsonSchema(schema.LEDGER_SCHEMA)   //todo need add full block schema
      let affectedNodes = response.result.AffectedNodes
      let from = affectedNodes[1].ModifiedNode.FinalFields.Account
      let to = affectedNodes[2].ModifiedNode.FinalFields.Account
      expect(from).to.be.equals(addresses.sender2.address)
      expect(to).to.be.equals(addresses.receiver1.address)
    }
    else{
      expect(response.result).to.contains(testCase.expectedResult.expectedError)
    }
  }

  //endregion

  //region tx count check

  function testForGetBlockTransactionCountByHash(server, describeTitle){
    let testCases = []
    let functionName = consts.rpcFunctions.getBlockTransactionCountByHash

    let title = '0010\t查询有效区块哈希'
    let hash = blocks.block1.hash
    let needPass = true
    let expectedError = ''
    let testCase = createSingleTestCaseForGetBlockTransactionCount(server, title, functionName, hash, needPass, expectedError)
    addTestCase(testCases, testCase)

    title = '0020\t无效交易哈希：不存在的hash'
    hash = 'B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A'
    needPass = false
    expectedError = 'can\'t find block'
    testCase = createSingleTestCaseForGetBlockTransactionCount(server, title, functionName, hash, needPass, expectedError)
    addTestCase(testCases, testCase)

    title = '0020\t无效交易哈希：hash长度超过标准'
    hash = 'B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530A1F'
    needPass = false
    expectedError = 'index out of range'
    testCase = createSingleTestCaseForGetBlockTransactionCount(server, title, functionName, hash, needPass, expectedError)
    addTestCase(testCases, testCase)

    testTestCases(server, describeTitle, testCases)
  }

  function testForGetBlockTransactionCountByNumber(server, describeTitle){
    let testCases = []
    let functionName = consts.rpcFunctions.getBlockTransactionCountByNumber

    let title = '0010\t查询有效区块编号'
    let blockNumber = blocks.block1.blockNumber
    let needPass = true
    let expectedError = ''
    let testCase = createSingleTestCaseForGetBlockTransactionCount(server, title, functionName, blockNumber, needPass, expectedError)
    addTestCase(testCases, testCase)

    title = '0020\t无效交易编号：9999999'
    blockNumber = '999999999'
    needPass = false
    expectedError = 'can\'t find block'
    testCase = createSingleTestCaseForGetBlockTransactionCount(server, title, functionName, blockNumber, needPass, expectedError)
    addTestCase(testCases, testCase)

    title = '0020\t无效交易编号：负数'
    blockNumber = '-100'
    needPass = false
    expectedError = 'invalid syntax'
    testCase = createSingleTestCaseForGetBlockTransactionCount(server, title, functionName, blockNumber, needPass, expectedError)
    addTestCase(testCases, testCase)

    title = '0020\t无效交易编号：乱码'
    blockNumber = 'addeew'
    needPass = false
    expectedError = 'invalid syntax'
    testCase = createSingleTestCaseForGetBlockTransactionCount(server, title, functionName, blockNumber, needPass, expectedError)
    addTestCase(testCases, testCase)

    testTestCases(server, describeTitle, testCases)
  }

  function createSingleTestCaseForGetBlockTransactionCount(server, title, functionName, hashOrNumber, needPass, expectedError){

    let txParams = []
    txParams.push(hashOrNumber)

    let expectedResult = {}
    expectedResult.needPass = needPass
    expectedResult.isErrorInResult = true
    expectedResult.expectedError = expectedError

    let testCase = createTestCase(
        title,
        server,
        functionName,
        txParams,
        null,
        executeTestCaseForGet,
        checkBlockTransactionCount,
        expectedResult,
        restrictedLevel.L2,
        [serviceType.newChain, ],
        [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
    )

    return testCase
  }

  function checkBlockTransactionCount(testCase){
    let response = testCase.actualResult[0]
    let needPass = testCase.expectedResult.needPass
    checkResponse(needPass, response)
    if(needPass){
      let txCount = blocks.block1.transactionsCount
      expect(txCount).to.equal(response.result)
    }
    else{
      expect(response.result).to.contains(testCase.expectedResult.expectedError)
    }
  }

  //endregion

  //region block check

  function testForGetBlockByNumber(server, describeTitle){
    let functionName = consts.rpcFunctions.getBlockByNumber
    let blockNumber = server.mode.blockNumber
    let testCases = createTestCasesForGetBlock(server, functionName, blockNumber)
    testTestCases(server, describeTitle, testCases)
  }

  function testForGetBlockByHash(server, describeTitle){
    let functionName = consts.rpcFunctions.getBlockByHash
    let blockNumber = server.mode.blockHash
    let testCases = createTestCasesForGetBlock(server, functionName, blockNumber)
    testTestCases(server, describeTitle, testCases)
  }

  function createTestCasesForGetBlock(server, functionName, numberOrHash){
    let testCases = []
    let validNumberOrHash = numberOrHash
    let testNumber = '0010'
    let showFullTx = false
    let needPass = true
    let expectedError = ''
    let testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
    testCase.supportedServices.push(serviceType.oldChain)
    addTestCase(testCases, testCase)

    testNumber = '0020'
    showFullTx = true
    testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
    testCase.supportedServices.push(serviceType.oldChain)
    addTestCase(testCases, testCase)

    if(functionName == consts.rpcFunctions.getBlockByNumber){
      testNumber = '0030'
      numberOrHash = 'earliest'
      showFullTx = true
      testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
      addTestCase(testCases, testCase)

      testNumber = '0040'
      numberOrHash = 'earliest'
      showFullTx = false
      testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
      addTestCase(testCases, testCase)

      testNumber = '0050'
      numberOrHash = 'latest'
      showFullTx = true
      testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
      // testCases[testCases.length - 1].supportedServices = [serviceType.newChain, serviceType.ipfs,]
      addTestCase(testCases, testCase)

      testNumber = '0060'
      numberOrHash = 'latest'
      showFullTx = false
      testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
      addTestCase(testCases, testCase)

      testNumber = '0090'
      numberOrHash = 'pending'
      showFullTx = true
      testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
      addTestCase(testCases, testCase)

      testNumber = '0100'
      numberOrHash = 'pending'
      showFullTx = false
      testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
      addTestCase(testCases, testCase)
    }

    testNumber = '0110'
    numberOrHash = validNumberOrHash
    showFullTx = 'wrwerwre'
    needPass = false
    expectedError = 'interface conversion: interface {} is string, not bool'
    testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
    testCase.title = '0110\t有效区块编号，无效Boolean参数：showFullTx是字符串'
    testCase.supportedServices.push(serviceType.oldChain)
    addTestCase(testCases, testCase)

    testNumber = '0110'
    numberOrHash = validNumberOrHash
    showFullTx = 123123
    needPass = false
    expectedError = 'interface conversion: interface {} is float64, not bool'
    testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
    testCase.title = '0110\t有效区块编号，无效Boolean参数：showFullTx是数字'
    testCase.supportedServices.push(serviceType.oldChain)
    addTestCase(testCases, testCase)

    testNumber = '0110'
    numberOrHash = validNumberOrHash
    showFullTx = null
    needPass = false
    expectedError = 'interface conversion: interface {} is nil, not bool'
    testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
    testCase.title = '0110\t有效区块编号，无效Boolean参数：showFullTx是空值'
    testCase.supportedServices.push(serviceType.oldChain)
    addTestCase(testCases, testCase)

    testNumber = '0120'
    numberOrHash = '9990000000'
    showFullTx = false
    needPass = false
    expectedError = 'value out of range'
    testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
    // testCase.supportedServices.push(serviceType.oldChain)  //old chain not support huge block number, it will cause test hook more than 20s
    addTestCase(testCases, testCase)

    testNumber = '0120'
    numberOrHash = '99900000'
    showFullTx = false
    needPass = false
    expectedError = 'ledgerNotFound'
    testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
    if(functionName == consts.rpcFunctions.getBlockByNumber) testCase.supportedServices.push(serviceType.oldChain)
    addTestCase(testCases, testCase)

    testNumber = '0120'
    numberOrHash = '-1000'
    showFullTx = false
    needPass = false
    expectedError = 'invalid ledger_index'
    testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
    if(functionName == consts.rpcFunctions.getBlockByNumber) testCase.supportedServices.push(serviceType.oldChain)
    addTestCase(testCases, testCase)

    testNumber = '0120'
    numberOrHash = 'abcdefg'
    showFullTx = false
    needPass = false
    expectedError = 'invalid ledger_index'
    testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
    if(functionName == consts.rpcFunctions.getBlockByNumber) testCase.supportedServices.push(serviceType.oldChain)
    addTestCase(testCases, testCase)

    return testCases
  }

  function createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError){

    let txParams = []
    txParams.push(numberOrHash)
    txParams.push(showFullTx)

    let expectedResult = {}
    expectedResult.needPass = needPass
    expectedResult.isErrorInResult = true
    expectedResult.expectedError = expectedError

    let title = testNumber + '\t'+ (needPass ? '有' : '无') + '效区块编号，' + (showFullTx ? '' : '不') + '需要返回所有交易详情'

    let testCase = createTestCase(
        title,
        server,
        functionName,
        txParams,
        null,
        executeTestCaseForGet,
        checkBlock,
        expectedResult,
        restrictedLevel.L2,
        [serviceType.newChain,],
        [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
    )

    return testCase
  }

  function checkBlock(testCase){
    let response = testCase.actualResult[0]
    let needPass = testCase.expectedResult.needPass
    checkResponse(needPass, response)
    if(needPass){
      expect(response.result).to.be.jsonSchema(schema.LEDGER_SCHEMA)   //todo need add full block schema
      let functionName = testCase.txFunctionName
      let blockNumberOrHash = testCase.txParams[0]
      expect((functionName === consts.rpcFunctions.getBlockByNumber) ? response.result.ledger_index : response.result.ledger_hash)
          .to.be.equals(blockNumberOrHash)
      let server = testCase.server
      expect(response.result.transactions.length).to.be.equals(server.mode.txCountInBlock)
      let showFullTx = testCase.txParams[1]
      if(showFullTx != null){
        let tx = response.result.transactions[0]
        expect(typeof tx == 'object' || utility.isJSON(tx)).to.be.equals(showFullTx)
      }
    }
    else{
      expect(response.result).to.contains(testCase.expectedResult.expectedError)
    }
  }

  //endregion

  //endregion

  //region ipfs test
  function testForIpfsTest(server, describeTitle){
    describe(describeTitle, function(){
      let testCases

      testCases = testForNodeInfo(server)
      testTestCases(server, consts.ipfsFunctions.getNodeInfo, testCases)

      testCases = testForUploadData(server)
      testTestCases(server, consts.ipfsFunctions.uploadData, testCases)

      testCases = testForDownloadData(server)
      testTestCases(server, consts.ipfsFunctions.downloadData, testCases)

      testCases = testForRemoveData(server)
      testTestCases(server, consts.ipfsFunctions.removeData, testCases)

      testCases = testForPinData(server)
      testTestCases(server, consts.ipfsFunctions.pinData, testCases)

      testCases = testForUnpinData(server)
      testTestCases(server, consts.ipfsFunctions.unpinData, testCases)

      testCases = testForUploadFile(server)
      testTestCases(server, consts.ipfsFunctions.uploadFile, testCases)

      testCases = testForDownloadFile(server)
      testTestCases(server, consts.ipfsFunctions.downloadFile, testCases)

      testCases = testForFullProcess(server)
      testTestCases(server, 'ipfs全流程测试', testCases)

      testCases = pressureTestForUploadData(server)
      testTestCases(server, 'ipfs上传压力测试，多个case', testCases)

      testCases = pressureTestForUploadDataInOneCase(server)
      testTestCases(server, 'ipfs上传压力测试，单个case', testCases)

      testCases = pressureTestForFullProcess(server)
      testTestCases(server, 'ipfs全流程压力测试，多个case', testCases)

      testCases = pressureTestForFullProcessInOneCase(server)
      testTestCases(server, 'ipfs全流程压力测试，单个case', testCases)
    })
  }

  function createTestCaseForIpfsTest(server, title, txFunctionName, txParams){
    let executeFunction
    if(txFunctionName == consts.ipfsFunctions.getNodeInfo){
      executeFunction = executeForNodeInfo
    }
    else if(txFunctionName == consts.ipfsFunctions.uploadData){
      executeFunction = executeForUploadData
    }
    else if(txFunctionName == consts.ipfsFunctions.downloadData){
      executeFunction = executeForDownloadData
    }
    else if(txFunctionName == consts.ipfsFunctions.removeData){
      executeFunction = executeForRemoveData
    }
    else if(txFunctionName == consts.ipfsFunctions.pinData){
      executeFunction = executeForPinData
    }
    else if(txFunctionName == consts.ipfsFunctions.unpinData){
      executeFunction = executeForUnpinData
    }
    else if(txFunctionName == consts.ipfsFunctions.uploadFile){
      executeFunction = executeForUploadFile
    }
    else if(txFunctionName == consts.ipfsFunctions.downloadFile){
      executeFunction = executeForDownloadFile
    }
    else {
      throw new Error('Interface ' + txFunctionName + ' doesn\'t exist!')
    }

    let testCase = createTestCase(title, server,
        txFunctionName, txParams, null,
        executeFunction, checkTestCase, createExpecteResult(true),
        restrictedLevel.L0, [serviceType.ipfs])
    return testCase
  }

  //region common execute

  function operateData(testCase, functionName, params, rawDatas, expectedResult, checkFunction){
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
  }

  function getNodeInfoBase(testCase, params, expectedResult){
    return operateData(testCase, consts.ipfsFunctions.getNodeInfo, params, null, expectedResult, checkNodeInfo)
  }

  function uploadDataBase(testCase, params, expectedResult){
    return operateData(testCase, consts.ipfsFunctions.uploadData, params, null, expectedResult, checkUploadData)
  }

  function downloadDataBase(testCase, params, rawDatas, expectedResult){
    return operateData(testCase, consts.ipfsFunctions.downloadData, params, rawDatas, expectedResult, checkDownloadData)
  }

  function removeDataBase(testCase, params, expectedResult){
    return operateData(testCase, consts.ipfsFunctions.removeData, params, null, expectedResult, checkRemoveData)
  }

  function pinDataBase(testCase, params, expectedResult){
    return operateData(testCase, consts.ipfsFunctions.pinData, params, null, expectedResult, checkPinData)
  }

  function unpinDataBase(testCase, params, expectedResult){
    return operateData(testCase, consts.ipfsFunctions.unpinData, params, null, expectedResult, checkUnpinData)
  }

  function uploadFileBase(testCase, params, expectedResult){
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
  }

  function downloadFileBase(testCase, params, rawDatas, expectedResult){
    return operateData(testCase, consts.ipfsFunctions.downloadFile, params, rawDatas, expectedResult, checkDownloadFile)
  }

  //endregion

  //region node info

  function testForNodeInfo(server){
    let testCases = []
    let testCase = {}
    let title = ''
    let txFunctionName = consts.ipfsFunctions.getNodeInfo

    title = '0010\t显示节点状态'
    {
      let txParams = []
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.executeFunction = executeForNodeInfo
      addTestCase(testCases, testCase)
    }

    return testCases
  }

  function executeForNodeInfo(testCase){
    return new Promise(async function(resolve){
      testCase.hasExecuted = true
      let check = await getNodeInfoBase(testCase, testCase.txParams, testCase.expectedResult)
      testCase.actualResult.push(check.actualResult)
      resolve(testCase)
    })
  }

  function checkNodeInfo(testCase, check){
    let needPass = check.expectedResult.needPass
    let response = check.actualResult
    checkResponse(needPass, response)
    if(needPass){
      expect(response).to.be.jsonSchema(schema.NODEINFO_SCHEMA)
      let max = response.result.max
      let usage = response.result.usage
      expect(max >= usage).to.be.ok
    }
    else{
      let expectedResult = check.expectedResult
      expect(response.result).to.contains(expectedResult.expectedError)
    }
  }

  //endregion

  //region upload data

  function testForUploadData(server){
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
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
      addTestCase(testCases, testCase)
    }

    title = '0010\t有效的单个字符串：上传一般字符串'
    {
      dataArray = ['Hello jingtum\t!\r\n']
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
      addTestCase(testCases, testCase)
    }

    title = '0010\t有效的单个字符串：上传纯数字'
    {
      dataArray = ['1234567890']
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
      addTestCase(testCases, testCase)
    }

    title = '0010\t有效的单个字符串：上传空格'
    {
      dataArray = [' ']
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
      addTestCase(testCases, testCase)
    }

    title = '0010\t有效的单个字符串：上传中文'
    {
      dataArray = ['你好井通']
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
      addTestCase(testCases, testCase)
    }
    //endregion

    //region 0020	有效的多个字符串
    title = '0020\t有效的多个字符串：上传多个十六进制字符串'
    {
      dataArray = ['QmUuVfJrQ2mb7F223fUhvpkQ6bjFFM4FaPKnKLLBWMEpBW', 'QmXGoXxdRBYjXE3Wj95NBLHqg8hEG1W8xXHF99aH3q921b']
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
      addTestCase(testCases, testCase)
    }

    title = '0020\t有效的多个字符串：上传多个一般字符串'
    {
      dataArray = ['Hello jingtum!', 'Make jingtum great!']
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
      addTestCase(testCases, testCase)
    }

    title = '0020\t有效的多个字符串：上传多个纯数字字符串'
    {
      dataArray = ['1234567890', '9876543210']
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
      addTestCase(testCases, testCase)
    }

    title = '0020\t有效的多个字符串：上传多个空格'
    {
      dataArray = [' ', ' ']
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
      addTestCase(testCases, testCase)
    }

    title = '0020\t有效的多个字符串：上传多个中文'
    {
      dataArray = ['你好井通！', '我很好，你呢？']
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
      addTestCase(testCases, testCase)
    }
    //endregion

    //region 0030	无效字符测试
    title = '0030\t无效字符测试：上传的数据为空'
    {
      dataArray = []
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
      testCase.expectedResult = createExpecteResult(false, true, 'no hash')
      addTestCase(testCases, testCase)
    }

    title = '0030\t无效字符测试：上传的数据为数字'
    {
      dataArray = [123]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
      testCase.expectedResult = createExpecteResult(false, true, 'only string allowed')
      addTestCase(testCases, testCase)
    }

    title = '0030\t无效字符测试：上传的数据为单引号字符串'  //cannot input 单引号字符串 by js
    //endregion

    //region 0040	多个无效数据测试
    title = '0040\t多个无效数据测试：上传多个十六进制字符串'
    {
      dataArray = [123, 456, 789]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
      testCase.expectedResult = createExpecteResult(false, true, 'only string allowed')
      addTestCase(testCases, testCase)
    }

    title = '0050\t多个有效无效数据混合测试'
    {
      dataArray = ['QmUuVfJrQ2mb7F223fUhvpkQ6bjFFM4FaPKnKLLBWMEpBW', 456, 789]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
      testCase.expectedResult = createExpecteResult(false, true, 'only string allowed')
      addTestCase(testCases, testCase)
    }

    title = '0050\t多个有效无效数据混合测试'
    {
      dataArray = ['QmUuVfJrQ2mb7F223fUhvpkQ6bjFFM4FaPKnKLLBWMEpBW', 456, '789']
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
      testCase.expectedResult = createExpecteResult(false, true, 'only string allowed')
      addTestCase(testCases, testCase)
    }

    title = '0050\t多个有效无效数据混合测试'
    {
      dataArray = ['QmUuVfJrQ2mb7F223fUhvpkQ6bjFFM4FaPKnKLLBWMEpBW', '456', 789]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
      testCase.expectedResult = createExpecteResult(false, true, 'only string allowed')
      addTestCase(testCases, testCase)
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
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
      addTestCase(testCases, testCase)
    }

    title = '0070\t字符串最多个数测试：上传多个十六进制字符串测试（个数可逐渐增加），测试字符串个数是否有上限'
    {
      let count = 30
      let dataArray = []
      let txt = (new Date()).toTimeString()
      for(let i = 0; i < count; i++){
        dataArray.push(i.toString() + '. ' + txt)
      }
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
      addTestCase(testCases, testCase)
    }

    title = '0080\t存储相同的数据'
    {
      let dataArray = ['QmUuVfJrQ2mb7F223fUhvpkQ6bjFFM4FaPKnKLLBWMEpBW','QmUuVfJrQ2mb7F223fUhvpkQ6bjFFM4FaPKnKLLBWMEpBW']
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
      testCase.executeFunction = function(testCase){
        return new Promise(async (resolve)=>{
          testCase.hasExecuted = true
          let uploadCheck = await uploadDataBase(testCase, testCase.txParams, testCase.expectedResult)
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
      addTestCase(testCases, testCase)
    }

    //endregion

    return testCases
  }

  function executeForUploadData(testCase){
    return new Promise(async function(resolve){
      testCase.hasExecuted = true
      let uploadCheck = await uploadDataBase(testCase, testCase.txParams, testCase.expectedResult)
      testCase.actualResult.push(uploadCheck.actualResult)
      if(testCase.expectedResult.needPass){
        let uploadResponse = uploadCheck.actualResult
        let hashAarray = []
        uploadResponse.result.forEach((result)=>{
          hashAarray.push(result.ipfs_hash)
        })
        let rawDatas = testCase.txParams
        let downloadCheck = await downloadDataBase(testCase, hashAarray, rawDatas, createExpecteResult(true))
        testCase.actualResult.push(downloadCheck.actualResult)
      }
      resolve(testCase)
    })
  }

  function executeForpressureTestForUploadData(testCase){
    return new Promise(async function(resolve){
      testCase.hasExecuted = true
      let count = testCase.testCount
      count = count != null ? count : 1
      let doneCount = 0;
      for(let i = 0; i < count; i++){
        let data = i.toString() + '. ' +  testCase.txParams[0]
        let uploadCheck = await uploadDataBase(testCase, [data], testCase.expectedResult)
        testCase.actualResult.push(uploadCheck.actualResult)
        if(testCase.expectedResult.needPass){
          let uploadResponse = uploadCheck.actualResult
          let hashAarray = []
          uploadResponse.result.forEach((result)=>{
            hashAarray.push(result.ipfs_hash)
          })
          let rawDatas = [data]
          let downloadCheck = await downloadDataBase(testCase, hashAarray, rawDatas, createExpecteResult(true))
          testCase.actualResult.push(downloadCheck.actualResult)
          doneCount++

          if(doneCount == count){
            resolve(testCase)
          }
        }
      }
    })
  }

  function checkUploadData(testCase, check){
    let needPass = check.expectedResult.needPass
    let response = check.actualResult
    checkResponse(needPass, response)
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
      let expectedResult = check.expectedResult
      expect(response.result).to.contains(expectedResult.expectedError)
    }
  }

  //endregion

  //region download data

  function testForDownloadData(server){
    let testCases = []
    let testCase = {}
    let title = ''
    let txFunctionName = consts.ipfsFunctions.downloadData
    let validData = ipfs_data.data_download

    title = '0010\t单个有效的哈希参数'
    {
      let txParams = [validData.ipfs_hash]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.rawDatas = [validData.raw_data]
      addTestCase(testCases, testCase)
    }

    title = '0020\t单个无效的哈希参数_01：哈希长度不够'
    {
      let txParams = [ipfs_data.bad_data_1.ipfs_hash_too_short]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
      addTestCase(testCases, testCase)
    }

    title = '0020\t单个无效的哈希参数_01：哈希长度过长'
    {
      let txParams = [ipfs_data.bad_data_1.ipfs_hash_too_long]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
      addTestCase(testCases, testCase)
    }

    title = '0030\t单个无效的哈希参数_02：哈希长度没问题，但没有对应的原始数据'
    {
      let txParams = [ipfs_data.deleted_data_1.ipfs_hash]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
      // addTestCase(testCases, testCase)  //todo: this case will cause getting response for long long time.  it is a bug. need be restore after fix.
    }

    title = '0040\t有效和无效混合的哈希参数_01：输入多个哈希参数，其中部分是长度不够或过长的哈希参数，部分是有效的哈希参数'
    {
      let txParams = [validData.ipfs_hash, ipfs_data.bad_data_1.ipfs_hash_too_short, ipfs_data.bad_data_1.ipfs_hash_too_long]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
      addTestCase(testCases, testCase)
    }

    title = '0050\t有效和无效混合的哈希参数_02：输入多个哈希参数，其中部分是没有对应原始数据的哈希参数，部分是有效的哈希参数'
    {
      let txParams = [validData.ipfs_hash, ipfs_data.deleted_data_1.ipfs_hash]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
      // addTestCase(testCases, testCase) //todo: this case will cause getting response for long long time.  it is a bug. need be restore after fix.
    }

    title = '0060\t哈希参数最多个数测试：输入多个有效的哈希参数（个数可逐渐增加），测试哈希参数的个数是否有上限'
    {
      let count = 100
      let txParams = []
      let data = validData
      for(let i = 0; i < count; i++){
        txParams.push(data.ipfs_hash)
      }
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.rawDatas = []
      for(let i = 0; i < count; i++){
        testCase.rawDatas.push(data.raw_data)
      }
      addTestCase(testCases, testCase)
    }

    title = '0070\t多个有效的哈希参数：输入多个有效的哈希参数'
    {
      let txParams = []
      let poem = ipfs_data.poem_1
      poem.forEach((data)=>{
        txParams.push(data.ipfs_hash)
      })
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.rawDatas = []
      poem.forEach((data)=>{
        testCase.rawDatas.push(data.raw_data)
      })
      addTestCase(testCases, testCase)
    }

    title = '0070\t多个有效的哈希参数：输入多个有效但重复的哈希参数'
    {
      let txParams = [validData.ipfs_hash, validData.ipfs_hash, validData.ipfs_hash, ]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.expectedResult = createExpecteResult(true)
      testCase.rawDatas = [validData.raw_data, validData.raw_data, validData.raw_data,]
      addTestCase(testCases, testCase)
    }

    return testCases
  }

  function executeForDownloadData(testCase){
    return new Promise(async function(resolve){
      testCase.hasExecuted = true
      let downloadCheck = await downloadDataBase(testCase, testCase.txParams, testCase.rawDatas, testCase.expectedResult)
      testCase.actualResult.push(downloadCheck.actualResult)
      resolve(testCase)
    })
  }

  function checkDownloadData(testCase, check){
    let needPass = check.expectedResult.needPass
    let response = check.actualResult
    checkResponse(needPass, response)
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
      let expectedResult = check.expectedResult
      expect(response.result).to.contains(expectedResult.expectedError)
    }
  }

  //endregion

  //region remove data

  function testForRemoveData(server){
    let testCases = []
    let testCase = {}
    let title = ''
    let txFunctionName = consts.ipfsFunctions.removeData
    let validData = ipfs_data.data_remove

    title = '0010\t单个有效的哈希参数'
    {
      let txParams = [validData.ipfs_hash]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.uploadParams = [validData.raw_data]
      testCase.executeFunction = executeForRemoveDataWithPreparation
      addTestCase(testCases, testCase)
    }

    title = '0020\t单个无效的哈希参数_01：哈希长度不够'
    {
      let txParams = [ipfs_data.bad_data_1.ipfs_hash_too_short]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
      addTestCase(testCases, testCase)
    }

    title = '0020\t单个无效的哈希参数_01：哈希长度过长'
    {
      let txParams = [ipfs_data.bad_data_1.ipfs_hash_too_long]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
      addTestCase(testCases, testCase)
    }

    title = '0030\t单个无效的哈希参数_02：哈希长度没问题，但没有对应的原始数据'
    {
      let txParams = [ipfs_data.deleted_data_1.ipfs_hash]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.expectedResult = createExpecteResult(false, true, 'blockstore: block not found')
      addTestCase(testCases, testCase)
    }

    title = '0040\t有效和无效混合的哈希参数_01：输入多个哈希参数，其中部分是长度不够或过长的哈希参数，部分是有效的哈希参数'
    {
      let txParams = [validData.ipfs_hash, ipfs_data.bad_data_1.ipfs_hash_too_short, ipfs_data.bad_data_1.ipfs_hash_too_long]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.uploadParams = [validData.raw_data]
      testCase.executeFunction = executeForRemoveDataWithPreparation
      testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
      addTestCase(testCases, testCase)
    }

    title = '0050\t有效和无效混合的哈希参数_02：输入多个哈希参数，其中部分是没有对应原始数据的哈希参数，部分是有效的哈希参数'
    {
      let txParams = [validData.ipfs_hash, ipfs_data.deleted_data_1.ipfs_hash]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.uploadParams = [validData.raw_data]
      testCase.executeFunction = executeForRemoveDataWithPreparation
      testCase.expectedResult = createExpecteResult(false, true, 'blockstore: block not found')
      addTestCase(testCases, testCase)
    }

    title = '0060\t有效和无效混合的哈希参数_03：输入多个哈希参数，其中部分哈希参数重复'
    {
      let txParams = [validData.ipfs_hash, validData.ipfs_hash]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.uploadParams = [validData.raw_data]
      testCase.executeFunction = executeForRemoveDataWithPreparation
      testCase.expectedResult = createExpecteResult(false, true, 'blockstore: block not found')
      addTestCase(testCases, testCase)
    }

    title = '0070\t哈希参数最多个数测试：输入多个有效的哈希参数（个数可逐渐增加），测试哈希参数的个数是否有上限'
    {
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, null)
      testCase.testCount = 30
      testCase.executeFunction = executeForRemoveDataInBatch
      addTestCase(testCases, testCase)
    }

    title = '0080\t多个有效的哈希参数：输入多个有效的哈希参数'
    {
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, null)
      testCase.testCount = 10
      testCase.executeFunction = executeForRemoveDataInBatch
      addTestCase(testCases, testCase)
    }

    return testCases
  }

  function executeForRemoveDataWithPreparation(testCase){  //upload data to make sure there is data can be removed.
    return new Promise(async function(resolve){
      testCase.hasExecuted = true
      let uploadCheck = await uploadDataBase(testCase, testCase.uploadParams, createExpecteResult(true))
      testCase.actualResult.push(uploadCheck.actualResult)
      let uploadResponse = uploadCheck.actualResult
      let hashAarray = []
      uploadResponse.result.forEach((result)=>{
        hashAarray.push(result.ipfs_hash)
      })
      let removeCheck = await removeDataBase(testCase, testCase.txParams, testCase.expectedResult)
      testCase.actualResult.push(removeCheck.actualResult)
      resolve(testCase)
    })
  }

  function executeForRemoveDataInBatch(testCase){
    return new Promise(async function(resolve){
      testCase.hasExecuted = true
      let count = testCase.testCount
      let dataArray = []
      let txt = (new Date()).toTimeString()
      for(let i = 0; i < count; i++){
        dataArray.push(i.toString() + '. ' + txt)
      }
      let uploadCheck = await uploadDataBase(testCase, dataArray, createExpecteResult(true))
      testCase.actualResult.push(uploadCheck.actualResult)
      let uploadResponse = uploadCheck.actualResult
      testCase.txParams = []
      uploadResponse.result.forEach((result)=>{
        testCase.txParams.push(result.ipfs_hash)
      })
      let removeCheck = await removeDataBase(testCase, testCase.txParams, testCase.expectedResult)
      testCase.actualResult.push(removeCheck.actualResult)
      resolve(testCase)
    })
  }

  function executeForRemoveData(testCase){
    return new Promise(async function(resolve){
      testCase.hasExecuted = true
      let removeCheck = await removeDataBase(testCase, testCase.txParams, testCase.expectedResult)
      testCase.actualResult.push(removeCheck.actualResult)
      resolve(testCase)
    })
  }

  function checkRemoveData(testCase, check){
    let needPass = check.expectedResult.needPass
    let response = check.actualResult
    checkResponse(needPass, response)
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
      let expectedResult = check.expectedResult
      expect(response.result).to.contains(expectedResult.expectedError)
    }
  }

  //endregion

  //region pin data

  function testForPinData(server){
    let testCases = []
    let testCase = {}
    let title = ''
    let txFunctionName = consts.ipfsFunctions.pinData
    let validData = ipfs_data.data_pin

    title = '0010\t单个有效的哈希参数'
    {
      let txParams = [validData.ipfs_hash]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.uploadParams = [validData.raw_data]
      testCase.executeFunction = executeForPinDataWithPreparation
      addTestCase(testCases, testCase)
    }

    title = '0020\t单个无效的哈希参数_01：哈希长度不够'
    {
      let txParams = [ipfs_data.bad_data_1.ipfs_hash_too_short]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
      addTestCase(testCases, testCase)
    }

    title = '0020\t单个无效的哈希参数_01：哈希长度过长'
    {
      let txParams = [ipfs_data.bad_data_1.ipfs_hash_too_long]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
      addTestCase(testCases, testCase)
    }

    title = '0030\t单个无效的哈希参数_02：哈希长度没问题，但没有对应的原始数据'
    {
      let txParams = [ipfs_data.deleted_data_1.ipfs_hash]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.expectedResult = createExpecteResult(false, true, 'blockstore: block not found')
      //addTestCase(testCases, testCase)  //todo: this case will cause getting response for long long time.  it is a bug. need be restore after fix.
    }

    title = '0040\t有效和无效混合的哈希参数_01：输入多个哈希参数，其中部分是长度不够或过长的哈希参数，部分是有效的哈希参数'
    {
      let txParams = [validData.ipfs_hash, ipfs_data.bad_data_1.ipfs_hash_too_short, ipfs_data.bad_data_1.ipfs_hash_too_long]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.uploadParams = [validData.raw_data]
      testCase.executeFunction = executeForPinDataWithPreparation
      testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
      addTestCase(testCases, testCase)
    }

    title = '0050\t有效和无效混合的哈希参数_02：输入多个哈希参数，其中部分是没有对应原始数据的哈希参数，部分是有效的哈希参数'
    {
      let txParams = [validData.ipfs_hash, ipfs_data.deleted_data_1.ipfs_hash]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.uploadParams = [validData.raw_data]
      testCase.executeFunction = executeForPinDataWithPreparation
      testCase.expectedResult = createExpecteResult(false, true, 'blockstore: block not found')
      // addTestCase(testCases, testCase)  //todo: this case will cause getting response for long long time.  it is a bug. need be restore after fix.
    }

    title = '0060\t哈希参数最多个数测试：输入多个有效的哈希参数（个数可逐渐增加），测试哈希参数的个数是否有上限'
    {
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, null)
      testCase.testCount = 30
      testCase.executeFunction = executeForRemoveDataInBatch
      addTestCase(testCases, testCase)
    }

    title = '0070\t多个有效的哈希参数：输入多个有效的哈希参数'
    {
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, null)
      testCase.testCount = 10
      testCase.executeFunction = executeForRemoveDataInBatch
      addTestCase(testCases, testCase)
    }

    title = '0070\t有效和无效混合的哈希参数_03：输入多个哈希参数，其中部分哈希参数重复'
    {
      let txParams = [validData.ipfs_hash, validData.ipfs_hash]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.uploadParams = [validData.raw_data, validData.raw_data]
      testCase.executeFunction = executeForPinDataWithPreparation
      addTestCase(testCases, testCase)
    }

    return testCases
  }

  function executeForPinDataWithPreparation(testCase){
    return new Promise(async function(resolve){
      testCase.hasExecuted = true
      let uploadCheck = await uploadDataBase(testCase, testCase.uploadParams, createExpecteResult(true))
      testCase.actualResult.push(uploadCheck.actualResult)
      let uploadResponse = uploadCheck.actualResult
      let hashAarray = []
      uploadResponse.result.forEach((result)=>{
        hashAarray.push(result.ipfs_hash)
      })
      let pinCheck = await pinDataBase(testCase, testCase.txParams, testCase.expectedResult)
      testCase.actualResult.push(pinCheck.actualResult)
      resolve(testCase)
    })
  }

  function executeForRemoveDataInBatch(testCase){
    return new Promise(async function(resolve){
      testCase.hasExecuted = true
      let count = testCase.testCount
      let dataArray = []
      let txt = (new Date()).toTimeString()
      for(let i = 0; i < count; i++){
        dataArray.push(i.toString() + '. ' + txt)
      }
      let uploadCheck = await uploadDataBase(testCase, dataArray, createExpecteResult(true))
      testCase.actualResult.push(uploadCheck.actualResult)
      let uploadResponse = uploadCheck.actualResult
      testCase.txParams = []
      uploadResponse.result.forEach((result)=>{
        testCase.txParams.push(result.ipfs_hash)
      })
      let pinCheck = await pinDataBase(testCase, testCase.txParams, testCase.expectedResult)
      testCase.actualResult.push(pinCheck.actualResult)
      resolve(testCase)
    })
  }

  function executeForPinData(testCase){
    testCase.hasExecuted = true
    return pinDataBase(testCase, testCase.txParams, testCase.expectedResult)
  }

  function checkPinData(testCase, check){
    checkRemoveData(testCase, check)
  }

  //endregion

  //region unpin data

  function testForUnpinData(server){
    let testCases = []
    let testCase = {}
    let title = ''
    let txFunctionName = consts.ipfsFunctions.unpinData
    let validData = ipfs_data.data_unpin

    title = '0010\t单个有效的哈希参数'
    {
      let txParams = [validData.ipfs_hash]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.uploadParams = [validData.raw_data]
      testCase.executeFunction = executeForUnpinDataWithPreparation
      addTestCase(testCases, testCase)
    }

    title = '0020\t单个无效的哈希参数_01：哈希长度不够'
    {
      let txParams = [ipfs_data.bad_data_1.ipfs_hash_too_short]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
      addTestCase(testCases, testCase)
    }

    title = '0020\t单个无效的哈希参数_01：哈希长度过长'
    {
      let txParams = [ipfs_data.bad_data_1.ipfs_hash_too_long]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
      addTestCase(testCases, testCase)
    }

    title = '0030\t单个无效的哈希参数_02：哈希长度没问题，但没有对应的原始数据'
    {
      let txParams = [ipfs_data.deleted_data_1.ipfs_hash]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.expectedResult = createExpecteResult(false, true, 'blockstore: block not found')
      //addTestCase(testCases, testCase)  //todo: this case will cause getting response for long long time.  it is a bug. need be restore after fix.
    }

    title = '0040\t有效和无效混合的哈希参数_01：输入多个哈希参数，其中部分是长度不够或过长的哈希参数，部分是有效的哈希参数'
    {
      let txParams = [validData.ipfs_hash, ipfs_data.bad_data_1.ipfs_hash_too_short, ipfs_data.bad_data_1.ipfs_hash_too_long]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.uploadParams = [validData.raw_data]
      testCase.expectedResult = createExpecteResult(false, true, 'selected encoding not supported')
      testCase.executeFunction = executeForUnpinDataWithPreparation
      addTestCase(testCases, testCase)
    }

    title = '0050\t有效和无效混合的哈希参数_02：输入多个哈希参数，其中部分是没有对应原始数据的哈希参数，部分是有效的哈希参数'
    {
      let txParams = [validData.ipfs_hash, ipfs_data.deleted_data_1.ipfs_hash]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.uploadParams = [validData.raw_data]
      testCase.expectedResult = createExpecteResult(false, true, 'blockstore: block not found')
      testCase.executeFunction = executeForUnpinDataWithPreparation
      // addTestCase(testCases, testCase)  //todo: this case will cause getting response for long long time.  it is a bug. need be restore after fix.
    }

    title = '0060\t哈希参数最多个数测试：输入多个有效的哈希参数（个数可逐渐增加），测试哈希参数的个数是否有上限'
    {
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, null)
      testCase.testCount = 30
      testCase.executeFunction = executeForUnpinDataInBatch
      addTestCase(testCases, testCase)
    }

    title = '0070\t多个有效的哈希参数：输入多个有效的哈希参数'
    {
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, null)
      testCase.testCount = 10
      testCase.executeFunction = executeForUnpinDataInBatch
      addTestCase(testCases, testCase)
    }

    return testCases
  }

  function executeForUnpinDataWithPreparation(testCase){
    return new Promise(async function(resolve){
      testCase.hasExecuted = true
      let uploadCheck = await uploadDataBase(testCase, testCase.uploadParams, createExpecteResult(true))
      testCase.actualResult.push(uploadCheck.actualResult)
      let uploadResponse = uploadCheck.actualResult
      let hashAarray = []
      uploadResponse.result.forEach((result)=>{
        hashAarray.push(result.ipfs_hash)
      })
      let pinCheck = await pinDataBase(testCase, hashAarray, createExpecteResult(true))
      testCase.actualResult.push(pinCheck.actualResult)
      let unpinCheck = await unpinDataBase(testCase, testCase.txParams, testCase.expectedResult)
      testCase.actualResult.push(unpinCheck.actualResult)
      resolve(testCase)
    })
  }

  function executeForUnpinDataInBatch(testCase){
    return new Promise(async function(resolve){
      testCase.hasExecuted = true
      let count = testCase.testCount
      let dataArray = []
      let txt = testCase.title + ' - ' + (new Date()).toTimeString()
      for(let i = 0; i < count; i++){
        dataArray.push(i.toString() + '. ' + txt)
      }
      let uploadCheck = await uploadDataBase(testCase, dataArray, createExpecteResult(true))
      let uploadResponse = uploadCheck.actualResult
      let hashAarray = []
      uploadResponse.result.forEach((result)=>{
        hashAarray.push(result.ipfs_hash)
      })
      let pinCheck = await pinDataBase(testCase, hashAarray, createExpecteResult(true))
      let unpinCheck = await unpinDataBase(testCase, hashAarray, testCase.expectedResult)
      testCase.actualResult.push(uploadCheck.actualResult)
      testCase.actualResult.push(pinCheck.actualResult)
      testCase.actualResult.push(unpinCheck.actualResult)
      resolve(testCase)
    })
  }

  function executeForUnpinData(testCase){
    testCase.hasExecuted = true
    return unpinDataBase(testCase, testCase.txParams, testCase.expectedResult)
  }

  function checkUnpinData(testCase, check){
    checkRemoveData(testCase, check)
  }

  //endregion

  //region upload file

  function testForUploadFile(server){
    let testCases = []
    let testCase = {}
    let title = ''
    let txFunctionName = consts.ipfsFunctions.uploadFile
    let url = server.mode.initParams.url + '/' + consts.ipfsFunctions.uploadFile
    let testFilePath = configCommons.ipfs_test_files_path

    title = '0010\t上传存在的文件：通过API接口上传文件，指定的文件存在'
    {
      let testFile = ipfs_data.uploadFile_1
      let fileName = testFilePath + testFile.name
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, fileName)
      testCase.url = url
      testCase.rawDatas = testFile
      addTestCase(testCases, testCase)
    }

    title = '0030\t不同文件类型上传测试：上传不同类型的文件'
    {
      let testFile = ipfs_data.uploadImage_1
      let fileName = testFilePath + testFile.name
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, fileName)
      testCase.url = url
      testCase.rawDatas = testFile
      addTestCase(testCases, testCase)
    }

    return testCases
  }

  function executeForUploadFile(testCase){
    return new Promise(async function(resolve){
      testCase.hasExecuted = true
      let check = await uploadFileBase(testCase, testCase.txParams, testCase.expectedResult)
      testCase.actualResult.push(check.actualResult)
      resolve(testCase)
    })
  }

  function checkUploadFile(testCase, check){
    let needPass = check.expectedResult.needPass
    let response = check.actualResult
    checkResponse(needPass, response)
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
      let expectedResult = check.expectedResult
      expect(response.result).to.contains(expectedResult.expectedError)
    }
  }

  //endregion

  //region download file

  function testForDownloadFile(server){
    let testCases = []
    let testCase = {}
    let title = ''
    let txFunctionName = consts.ipfsFunctions.downloadFile
    let validData = ipfs_data.data_download

    title = '0010\t有效的哈希参数：哈希参数有效，有对应的数据'
    {
      let txParams = [validData.ipfs_hash]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.rawDatas = validData.raw_data
      addTestCase(testCases, testCase)
    }

    title = '0020\t单个无效的哈希参数_01：哈希长度不够'
    {
      let txParams = [ipfs_data.bad_data_1.ipfs_hash_too_short]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.expectedResult = createExpecteResult(false, false, 'selected encoding not supported')
      addTestCase(testCases, testCase)
    }

    title = '0020\t单个无效的哈希参数_01：哈希长度过长'
    {
      let txParams = [ipfs_data.bad_data_1.ipfs_hash_too_long]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.expectedResult = createExpecteResult(false, false, 'selected encoding not supported')
      addTestCase(testCases, testCase)
    }

    title = '0030\t单个无效的哈希参数_02：哈希长度没问题，但没有对应的原始数据'
    {
      let txParams = [ipfs_data.deleted_data_1.ipfs_hash]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, txParams)
      testCase.expectedResult = createExpecteResult(false, false, 'selected encoding not supported')
      // addTestCase(testCases, testCase)  //todo: this case will cause getting response for long long time.  it is a bug. need be restore after fix.
    }

    return testCases
  }

  function executeForDownloadFile(testCase){
    return new Promise(async function(resolve){
      testCase.hasExecuted = true
      let check = await downloadFileBase(testCase, testCase.txParams, testCase.rawDatas, testCase.expectedResult)
      testCase.actualResult.push(check.actualResult)
      resolve(testCase)
    })
  }

  function checkDownloadFile(testCase, check){
    let needPass = check.expectedResult.needPass
    let response = check.actualResult
    // checkResponse(needPass, response)  //download file response is not json
    if(needPass){
      expect(response).to.be.jsonSchema(schema.DOWNLOAD_FILE_SCHEMA)
      //compare data
      let rawContent = check.rawDatas
      let content = response
      expect(content).to.be.equal(rawContent)
    }
    else{
      let expectedResult = check.expectedResult
      expect(expectedResult.isErrorInResult ? response.result : response.message).to.contains(expectedResult.expectedError)
    }
  }

  //endregion

  //region full process of ipfs

  function testForFullProcess(server){
    let testCases = []
    let testCase = {}
    let title = ''
    let txFunctionName = consts.ipfsFunctions.uploadData
    let dataArray = []

    title = '0010\t上传数据'
    {
      txFunctionName = consts.ipfsFunctions.uploadData
      dataArray = ['QmUuVfJrQ2mb7F223fUhvpkQ6bjFFM4FaPKnKLLBWMEpBW']
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
      testCase.rawDatas = dataArray
      testCase.rawDownloadDatas = dataArray
      testCase.executeFunction = executeForFullProcessForUploadData
      addTestCase(testCases, testCase)
    }

    title = '0020\t上传文件'
    {
      txFunctionName = consts.ipfsFunctions.uploadFile
      let url = server.mode.initParams.url + '/' + consts.ipfsFunctions.uploadFile
      // let testFilePath = '.\\test\\testData\\testFiles\\'
      let testFilePath = configCommons.ipfs_test_files_path
      let testFile = ipfs_data.uploadFile_1
      let fileName = testFilePath + testFile.name
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, fileName)
      testCase.url = url
      testCase.rawDatas = testFile
      testCase.rawDownloadDatas = [testFile.raw_data]
      testCase.executeFunction = executeForFullProcessForUploadFile
      addTestCase(testCases, testCase)
    }

    return testCases
  }

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

  function executeForFullProcessForUploadData(testCase){
    return new Promise(async function(resolve){
      testCase.hasExecuted = true

      //step1.1 upload
      let check = await uploadDataBase(testCase, testCase.txParams, createExpecteResult(true))
      check.title = 'Step1.1: upload data successfully'
      testCase.actualResult.push(check.actualResult)

      await executeForFullProcess(testCase)

      resolve(testCase)
    })
  }

  function executeForFullProcessForUploadDataInOneCase(testCase){
    return new Promise(async function(resolve){
      testCase.hasExecuted = true
      let count = testCase.testCount
      count = count != null ? count : 1
      let doneCount = 0;
      for(let i = 0; i < count; i++){
        //step1.1 upload
        let check = await uploadDataBase(testCase, testCase.txParams, createExpecteResult(true))
        check.title = 'Step1.1: upload data successfully'
        testCase.actualResult.push(check.actualResult)
        await executeForFullProcess(testCase)
        doneCount++
        if(doneCount == count){
          resolve(testCase)
        }
      }
    })
  }

  function executeForFullProcessForUploadFile(testCase){
    return new Promise(async function(resolve){
      testCase.hasExecuted = true

      //step1.1 upload
      let check = await uploadFileBase(testCase, testCase.txParams, createExpecteResult(true))
      check.title = 'Step1.1: upload file successfully'
      testCase.actualResult.push(check.actualResult)

      await executeForFullProcess(testCase)

      resolve(testCase)
    })
  }

  function executeForFullProcess(testCase){
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
      check = await unpinDataBase(testCase, hashAarray, createExpecteResult(false, true, 'not pinned'))
      check.title = 'Step2.1: unpin data failed before pin'
      testCase.actualResult.push(check.actualResult)

      //step2.2 pin
      check = await pinDataBase(testCase, hashAarray, createExpecteResult(true))
      check.title = 'Step2.2: pin data successfully'
      testCase.actualResult.push(check.actualResult)

      //step2.3 download
      await executeForDownloads(testCase, hashAarray, rawDatas, createExpecteResult(true), 'Step2.3')

      //step2.4 fail to remove
      check = await removeDataBase(testCase, hashAarray, createExpecteResult(false, true, 'pinned: direct'))
      check.title = 'Step2.4: fail to remove data'
      testCase.actualResult.push(check.actualResult)

      //step2.5 download
      await executeForDownloads(testCase, hashAarray, rawDatas, createExpecteResult(true), 'Step2.5')

      //step3.1 unpin
      check = await unpinDataBase(testCase, hashAarray, createExpecteResult(true))
      check.title = 'Step2.2: unpin data successfully'
      testCase.actualResult.push(check.actualResult)

      //step3.2 download
      await executeForDownloads(testCase, hashAarray, rawDatas, createExpecteResult(true), 'Step3.2')

      //step4.1 remove successfully
      check = await removeDataBase(testCase, hashAarray, createExpecteResult(true))
      check.title = 'Step4.1: remove data successfully'
      testCase.actualResult.push(check.actualResult)

      //step4.2 fail to remove
      check = await removeDataBase(testCase, hashAarray, createExpecteResult(false, true, 'blockstore: block not found'))
      check.title = 'Step4.2: fail to remove data'
      testCase.actualResult.push(check.actualResult)

      resolve(testCase)
    })
  }

  function executeForDownloads(testCase, hashAarray, rawDatas, expectedResult, stepNumber){
    return new Promise(async(resolve)=>{
      let check

      check = await downloadDataBase(testCase, hashAarray, rawDatas, expectedResult)
      check.title = stepNumber + ': download data successfully after upload'
      testCase.actualResult.push(check.actualResult)

      let count = hashAarray.length
      let doneCount = 0
      for(let i = 0; i < count; i++){
        check = await downloadFileBase(testCase, [hashAarray[i]], rawDatas[i], expectedResult)
        check.title = stepNumber + ': download file successfully after upload for data[' + i + ']'
        testCase.actualResult.push(check.actualResult)
        doneCount++
        if(doneCount == count){
          resolve(testCase)
        }
      }
    })
  }

  //endregion

  //region pressure test
  function pressureTestForUploadData(server){
    let testCases = []
    let testCase = {}
    let title = ''
    let txFunctionName = consts.ipfsFunctions.uploadData
    let count = 60

    let txt = (new Date()).toTimeString()
    for(let i = 1; i <= count; i++){
      let data = i.toString() + '. ' + txt
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, [data])
      testCase.title = '0010\t测试UploadData: ' + i + '/' + count
      addTestCase(testCases, testCase)
    }

    return testCases
  }

  function pressureTestForUploadDataInOneCase(server){
    let testCases = []
    let testCase = {}
    let title = ''
    let txFunctionName = consts.ipfsFunctions.uploadData

    let dataArray = [(new Date()).toTimeString()]
    testCase = createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
    testCase.executeFunction = executeForpressureTestForUploadData
    testCase.testCount = 100
    testCase.title = '0020\t测试' + testCase.testCount + '个uploadData，在单个case内执行'
    addTestCase(testCases, testCase)
    return testCases
  }

  function pressureTestForFullProcess(server){
    let testCases = []
    let testCase = {}
    let title = ''
    let txFunctionName = consts.ipfsFunctions.uploadData
    let count = 30

    let txt = (new Date()).toTimeString()
    for(let i = 1; i <= count; i++){
      let dataArray = [i.toString() + '. ' + txt]
      testCase = createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
      testCase.rawDatas = dataArray
      testCase.rawDownloadDatas = dataArray
      testCase.executeFunction = executeForFullProcessForUploadData
      testCase.title = '0010\t测试FullProcess: ' + i + '/' + count
      addTestCase(testCases, testCase)
    }

    return testCases
  }

  function pressureTestForFullProcessInOneCase(server){
    let testCases = []
    let testCase = {}
    let title = ''
    let txFunctionName = consts.ipfsFunctions.uploadData

    let dataArray = ['QmUuVfJrQ2mb7F223fUhvpkQ6bjFFM4FaPKnKLLBWMEpBW']
    testCase = createTestCaseForIpfsTest(server, title, txFunctionName, dataArray)
    testCase.rawDatas = dataArray
    testCase.rawDownloadDatas = dataArray
    testCase.executeFunction = executeForFullProcessForUploadDataInOneCase
    testCase.testCount = 50
    testCase.title = '0010\t测试' + testCase.testCount + '个FullProcess，在单个case内执行'
    addTestCase(testCases, testCase)

    return testCases
  }
  //endregion

  //endregion

  // region utility methods

  async function get2BlockNumber (server) {
    return new Promise(async (resolve, reject) => {
      if(!server) reject("Server cannot be null!")
      let result = {}
      result.blockNumber1 = await server.getBlockNumber(server)
      //logger.debug("defaultBlockTime: " + server.mode.defaultBlockTime)
      await utility.timeout(server.mode.defaultBlockTime)
      result.blockNumber2 = await server.getBlockNumber(server)
      resolve(result)
    })
  }

  //swt example:
  // { id: 38,
  //     jsonrpc: '2.0',
  //     result: { balance: '1798498811047' },
  //   status: 'success' }
  //token example:
  async function checkBalanceChange(server, from, symbol, expectedBalance){
    if(symbol){ //token
      let balance = await server.getBalance(server, from, symbol)
      expect(Number(balance.value)).to.be.equal(Number(expectedBalance))
      return balance
    }
    else{ //swt
      let balance = await server.getBalance(server, from)
      expect(Number(balance)).to.be.equal(Number(expectedBalance))
      return balance
    }
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

  //endregion

  //region common functions

  //region dynamic token name
  function getDynamicName(){
    let timeSeed = (_LastDynamicalTimeSeed) ? _LastDynamicalTimeSeed : Math.round(new Date().getTime()/1000)
    _LastDynamicalTimeSeed = ++timeSeed
    let result = {}
    result.name = "TestCoin" + timeSeed
    result.symbol = timeSeed.toString(16)
    logger.debug("getDynamicName: " + JSON.stringify(result))
    return result
  }
  //endregion

  //region hex relative

  //example
  // hex: 516d557556664a7251326d62374632323366556876706b5136626a46464d344661504b6e4b4c4c42574d45704257
  // ascii: QmUuVfJrQ2mb7F223fUhvpkQ6bjFFM4FaPKnKLLBWMEpBW
  // base64: UW1VdVZmSnJRMm1iN0YyMjNmVWh2cGtRNmJqRkZNNEZhUEtuS0xMQldNRXBCVw==

  function hex2Utf8(hex){
    return new Buffer.from(hex.toString(), 'hex').toString('utf8')
  }

  function utf82Hex(hex){
    return new Buffer.from(string, 'utf8').toString('hex')
  }

  function hex2Base64(hex){
    // return new Buffer.from(hex.toString(), 'hex').toString('utf8')
    return new Buffer.from(hex.toString(), 'hex').toString('base64')
  }

  function base642Hex(string){
    // return new Buffer.from(string, 'utf8').toString('hex')
    return new Buffer.from(string, 'base64').toString('hex')
  }

  function hex2Ascii(hex){
    return new Buffer.from(hex.toString(), 'hex').toString('ascii')
  }

  function ascii2Hex(string){
    return new Buffer.from(string, 'ascii').toString('hex')
  }

  function isHex(context){
    let context2 = hex2Base64(context)
    let hex = base642Hex(context2)
    return context.toUpperCase() === hex.toUpperCase()
  }

  //endregion

  //region process sequence
  function getSequence(server, from){
    return new Promise(function (resolve){
      let key = from + '@' + server.getName()
      if(_SequenceMap.has(key)){
        logger.debug("===sequence   _SequenceMap:" + _SequenceMap.get(key))
        resolve(_SequenceMap.get(key))
      }
      else{
        Promise.resolve(server.responseGetAccount(server, from)).then(function (accountInfo) {
          // logger.debug("---sequence   accountInfo:" + JSON.stringify(accountInfo))
          let sequence = Number(accountInfo.result.Sequence)
          setSequence(server.getName(), from, sequence)
          resolve(sequence)
        }).catch(function (error){
          logger.debug("Error!!! " + error)
        })
      }
    })
  }

  function setSequence(serverName, from, sequence){
    let key = from + '@' + serverName
    _SequenceMap.set(key, sequence)
  }
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

  //region array operation
  function cloneArray(originalArray){
    let newArray = []
    originalArray.forEach((item) => {
      newArray.push(item)
    })
    return newArray
  }

  function ifArrayHas(array, specialItem){
    let result = false
    array.forEach((item) => {
      if(item == specialItem){
        result = true
      }
    })

    return result
  }

  function addItemInEmptyArray(item){
    let array = []
    array.push(item)
    return array
  }

  function addItemInArray(array, item){
    array.push(item)
    return array
  }
  //endregion

  //region show symbol
  function getShowSymbol(symbol, issuer){
    return (!symbol || symbol == null || symbol == 'swt' || symbol == 'SWT') ? '' : ('/' + symbol + '/' + issuer)
  }
  //endregion

  //endregion

  //region mintable and burnable

  // 参考”发起底层币无效交易“的测试用例
  // "flags":        float64(data.TxCoinMintable | data.TxCoinBurnable)
  // TxCoinMintable  TransactionFlag = 0x00010000 (65536)
  // TxCoinBurnable  TransactionFlag = 0x00020000 (131072)
  // Mintable+Burnable  TransactionFlag = 0x00030000  (196608)
  // Neither Mintable nor Burnable  TransactionFlag = 0x00000000  (0)
  // "local":true 表示发的是带issuer的币，类似这种100/CNY/jGr9kAJ1grFwK4FtQmYMm5MRnLzm93CV9C

  function canMint(flags){
    if(flags === consts.flags.mintable || flags === consts.flags.both){
      return true
    }
    return false
  }

  function canBurn(flags){
    if(flags === consts.flags.burnable || flags === consts.flags.both){
      return true
    }
    return false
  }

  //endregion

  // endregion

})

