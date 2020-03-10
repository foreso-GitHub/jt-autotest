//region require
const chai = require("chai")
chai.use(require("chai-json-schema"))
const expect = chai.expect
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let HashMap = require('hashmap')
let utility = require("./testUtility.js")
const schema = require("./schema.js")
const consts = require('../lib/base/consts')
const { chains, addresses, data, token, txs, blocks } = require("./testData")
const { servers, modes } = require("./config")
const { responseStatus,  serviceType,  interfaceType,  testMode,  restrictedLevel, } = require("./enums")
const status = responseStatus
const testModeEnums = testMode
//endregion

let _SequenceMap = new HashMap()
let _LastDynamicalTimeSeed = 0
const HASH_LENGTH = 64
let _FullTestCaseList = []

//region config
let _CurrentRestrictedLevel
let _CurrentService = serviceType.unknown
let _CurrentInterface = interfaceType.unknown
//endregion

describe('Jingtum测试', function() {

  //region ===record start time===
  logger.debug("======Start testing!======")
  let start = new Date()
  let end = new Date()
  logger.debug("Start time: " + start.toTimeString())
  //endregion

  this.timeout(20000)

  for(let mode of modes){

    let server = mode.server
    server.init(mode)
    _CurrentRestrictedLevel = mode.restrictedLevel
    _CurrentService = mode.service
    _CurrentInterface = mode.interface

    describe('测试模式: ' + server.getName(), function () {

      before(async function() {
        // logger.debug('before connnect')
        // await server.connect()
        // logger.debug('after connnect')
      })

      /*
      describe('用例测试', function () {

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

        // testForGetBlockNumber(server, '测试jt_blockNumber')
        //
        // testForGetBlockByNumber(server, '测试jt_getBlockByNumber')
        //
        // testForGetBlockByHash(server, '测试jt_getBlockByHash')
        //
        testForGetTransaction(server, '测试jt_getTransactionByHash')
        //
        // testForGetAccount(server, '测试jt_getAccount')
        //
        // testForGetBalance(server, '测试jt_getBalance')

        // testForSendTxAndSignTx(server, '测试jt_sendTransaction和jt_signTransaction')

        // testForGetTransactionByBlockHashAndIndex(server, '测试jt_getTransactionByBlockHashAndIndex')
        //
        // testForGetTransactionByBlockNumberAndIndex(server, '测试jt_getTransactionByBlockNumberAndIndex')

        // await utility.timeout(5000)

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
        addresses.receiver1.address, '0.000015', '10', ['autotest'])
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
        addresses.receiver1.address, '1', '10', ['autotest'])
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
    // expectedResult.isErrorInResult = isErrorInResult
    expectedResult.isErrorInResult = true
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
    testCaseParams.expectedResult = createExpecteResult(true)
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
        data.sequence = isNaN(sequence) ? 1 : sequence
        server.getBalance(data.from, data.symbol).then(function(balanceBeforeExecution){
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
      addSequenceAfterResponseSuccess(response, testCase.txParams[0])
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
                addSequenceAfterResponseSuccess(responseOfSendRawTx, testCase.txParams[0])
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
  function addSequenceAfterResponseSuccess(response, data){
    if(response.status === status.success){
      setSequence(data.from, data.sequence + 1)  //if send tx successfully, then sequence need plus 1
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
    return testCase.server.getResponse(testCase.txFunctionName, testCase.txParams)
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
    let responseOfSendTx = testCase.actualResult[0]
    checkResponse(testCase.expectedResult.needPass, responseOfSendTx)

    //todo need remove OLD_SENDTX_SCHEMA when new chain updates its sendTx response
    if(_CurrentService == serviceType.newChain){
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
    // if(result1.engine_result === result2.engine_result
    //   && result1.engine_result_code === result2.engine_result_code
    //   && result1.engine_result_message === result2.engine_result_message){
    //   return true
    // }
    // return false

    expect(result2.engine_result).to.equals(result1.engine_result)
    expect(result2.engine_result_code).to.equals(result1.engine_result_code)
    expect(result2.engine_result_message).to.equals(result1.engine_result_message)
  }

  async function checkResponseOfTransfer(testCase, txParams){
    await checkResponseOfCommon(testCase, txParams, async function(testCase, txParams, tx){
      let params = txParams[0]
      let defaultFee = testCase.server.mode.defaultFee
      await compareActualTxWithTxParams(params, tx, defaultFee)
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
      await testCase.server.getBalance(params.from, params.symbol).then(function(balanceAfterExecution){
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

  function compareActualTxWithTxParams(txParams, tx, defaultFee){
    return new Promise(function(resolve){
      expect(tx.Account).to.be.equals(txParams.from)
      expect(tx.Destination).to.be.equals(txParams.to)

      let expectedFee
      let expectedValue
      if(_CurrentService == serviceType.oldChain){
        expectedFee = defaultFee
        expectedValue = Number(txParams.value) * 1000000
      }
      else
      {
        expectedFee = (txParams.fee) ? txParams.fee : defaultFee
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
        if(_CurrentRestrictedLevel >= restrictedLevel.L5) expect(tx.Flags).to.be.equals(txParams.flags)  //todo need restore
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
        await execEachTestCase(testCases, 0)
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
    logger.debug("Consume time: " + (end - start) / 1000 + 's, equals to ' + (end - start) / 1000 / 60 + 'm!')
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
    logger.debug('result: ' + JSON.stringify(testCase.actualResult[0]))
    if(testCase.subTestCases != null && testCase.subTestCases.length > 0) {
      logger.debug('subTestCases result: ' + JSON.stringify(testCase.subTestCases[0].actualResult[0]))
    }
  }

  function ifNeedExecuteOrCheck(testCase){
    if(!testCase){
      logger.debug("Error: test case doesn't exist!")
    }
    if(_CurrentRestrictedLevel < testCase.restrictedLevel){
      return false
    }
    else if(!(!testCase.supportedServices || testCase.supportedServices.length == 0)
        && !ifArrayHas(testCase.supportedServices, _CurrentService)){
      return false
    }
    else if(!(!testCase.supportedInterfaces || testCase.supportedInterfaces.length == 0)
        && !ifArrayHas(testCase.supportedInterfaces, _CurrentInterface)){
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
    let tokenName = txParams.name
    let tokenSymbol = txParams.symbol
    let issuer = txParams.local ? txParams.from : addresses.defaultIssuer.address
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

  //region pressure test

  function createTestCasesForPressureTest(server, categoryName, testCount){
    let testCases = []
    let txParams = createTxParamsForTransfer(server)
    let txFunctionName = consts.rpcFunctions.sendTx
    let executeFunction = executeTestCaseOfSendTx
    let checkFunction = checkTestCaseOfSendTx
    let expectedResult = createExpecteResult(true)

    for(let i = 0; i < testCount; i++){
      let testCase = createTestCase('0010\t发起' + categoryName + '有效交易_' + (i + 1), server,
          txFunctionName, txParams, null,
          executeFunction, checkFunction, expectedResult,
          restrictedLevel.L0, [serviceType.newChain, serviceType.oldChain])
      addTestCase(testCases, testCase)
    }
    return testCases
  }

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
      // txParams = createTxParamsForTransfer(server)
      describe(categoryName + '测试：' + txFunctionName, async function () {
        testForTransfer(server, categoryName, txFunctionName, txParams)
      })

      categoryName = '原生币swt压力测试'
      testCases = createTestCasesForPressureTest(server, categoryName, 20)
      testTestCases(server, categoryName, testCases)

      //endregion

      //region token test
      if(server.mode.service == serviceType.newChain){
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
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0030\t发起' + categoryName + '无效交易_01: 没有秘钥'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].secret = null
        // testCaseParams.expectedResult = createExpecteResult(false, true, 'No secret found for')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            _CurrentService == serviceType.newChain ? 'No secret found for' : consts.engineResults.temINVALID_SECRET)
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0030\t发起' + categoryName + '无效交易_01: 错误的秘钥1'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].secret = '错误的秘钥'
        // testCaseParams.expectedResult = createExpecteResult(false, true, 'Bad Base58 string')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            _CurrentService == serviceType.newChain ? 'Bad Base58 string' : consts.engineResults.temMALFORMED)
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0030\t发起' + categoryName + '无效交易_01: 错误的秘钥2'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].secret = testCaseParams.txParams[0].secret + '1'
        // testCaseParams.expectedResult = createExpecteResult(false, true, 'Bad Base58 checksum')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            _CurrentService == serviceType.newChain ? 'Bad Base58 checksum' : consts.engineResults.temMALFORMED)
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0040\t发起' + categoryName + '无效交易_02: 错误的发起钱包地址（乱码字符串）'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].from = testCaseParams.txParams[0].from + '1'
        // testCaseParams.expectedResult = createExpecteResult(false, true, 'Bad account address:')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            _CurrentService == serviceType.newChain ? 'Bad account address:' : consts.engineResults.temINVALID_FROM_ADDRESS)
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0050\t发起' + categoryName + '无效交易_03: 错误的接收钱包地址（乱码字符串）'
    {
      let testCase = createTestCaseWhenSignFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].to = testCaseParams.txParams[0].to + '1'
        // testCaseParams.expectedResult = createExpecteResult(false, true, 'Bad account address:')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            _CurrentService == serviceType.newChain ? 'Bad account address:' : consts.engineResults.temINVALID_TO_ADDRESS)
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
            _CurrentService == serviceType.newChain ? 'telINSUF_FEE_P Fee insufficient' : consts.engineResults.temBAD_AMOUNT)
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0070\t发起' + categoryName + '无效交易_05: 交易额为负数'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].value = "-100" + testCaseParams.showSymbol
        // testCaseParams.expectedResult = createExpecteResult(false, false,
        //     'temBAD_AMOUNT Can only send positive amounts')
        // testCaseParams.expectedResult = createExpecteResult(false, true,
        //     'temBAD_AMOUNT Can only send positive amounts')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            _CurrentService == serviceType.newChain ? 'temBAD_AMOUNT Can only send positive amounts' : consts.engineResults.temBAD_AMOUNT)
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0080\t发起' + categoryName + '无效交易_06: 交易额为空'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].value = null
        // testCaseParams.expectedResult = createExpecteResult(false, true, 'Invalid Number')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            _CurrentService == serviceType.newChain ? 'Invalid Number' : consts.engineResults.temBAD_AMOUNT)
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0080\t发起' + categoryName + '无效交易_06: 交易额为字符串'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].value = "aawrwfsfs"
        // testCaseParams.expectedResult = createExpecteResult(false, true, 'Invalid Number')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            _CurrentService == serviceType.newChain ? 'Invalid Number' : consts.engineResults.temBAD_AMOUNT)
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0090\t发起' + categoryName + '无效交易_07: 交易额为小于0.000001(最小数额)的正小数'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].value = "0.0000001" + testCaseParams.showSymbol
        // testCaseParams.expectedResult = createExpecteResult(false, true, 'value must be integer type')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            _CurrentService == serviceType.newChain ? 'value must be integer type' : consts.engineResults.temBAD_AMOUNT)
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0100\t发起' + categoryName + '无效交易_08: 交易额为大于0.000001(最小数额)的小数'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].value = "0.0000011" + testCaseParams.showSymbol
        // testCaseParams.expectedResult = createExpecteResult(false, true, 'value must be integer type')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            _CurrentService == serviceType.newChain ? 'value must be integer type' : consts.engineResults.temBAD_AMOUNT)
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0110\t发起' + categoryName + '无效交易_09: 交易额为负小数：-0.1、-1.23等'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].value = "-0.1" + testCaseParams.showSymbol
        // testCaseParams.expectedResult = createExpecteResult(false, true, 'value must be integer type')
        testCaseParams.expectedResult = createExpecteResult(false, true,
            _CurrentService == serviceType.newChain ? 'value must be integer type' : consts.engineResults.temBAD_AMOUNT)
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

    testCaseParams.title = '0170\t发起带有效fee的交易_02: fee比12小，但是足以发起成功的交易'
    {
      let testCase = createTestCaseWhenSignPassAndSendRawTxPassForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].fee = "11"
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

    testCaseParams.title = '0190\t发起带无效fee的交易_01: fee比12小（比如5），但是不足以发起成功的交易'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].fee = "5"
        testCaseParams.expectedResult = createExpecteResult(false, false,
            'tecINSUFF_FEE Insufficient balance to pay fee')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0200\t发起带无效fee的交易_02: fee为0'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].fee = "0"
        testCaseParams.expectedResult = createExpecteResult(false, false,
            'tecINSUFF_FEE Insufficient balance to pay fee')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0210\t发起带无效fee的交易_03: fee为大于0的小数，比如12.5、5.5'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].fee = "12.5"
        testCaseParams.expectedResult = createExpecteResult(false, false,
            'tecINSUFF_FEE Insufficient balance to pay fee')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0220\t发起带无效fee的交易_04: fee为大于发起钱包' + categoryName + '余额的整数'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
        testCaseParams.txParams[0].fee = "999999999999999"
        testCaseParams.expectedResult = createExpecteResult(false, false,
            'telINSUF_FEE_P Fee insufficient')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0230\t发起带无效fee的交易_05: fee为负数，比如-3.5、-555等'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForTransfer(testCaseParams, function(){
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
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0290\t发行' + testCaseParams.categoryName + '_无效的type参数'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].type = "issuecoin"
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'Invalid Number:  Reason: strconv.ParseUint: parsing "": invalid syntax')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0300\t发行' + testCaseParams.categoryName + '_无效的from参数'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].from = "from.address"
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'Bad account address: from.address: Bad Base58 string: from.address')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0310\t发行' + testCaseParams.categoryName + '_无效的name参数:很长的字符串'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].name = "tokenName.name12345678901234567890"
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
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].symbol = "tokenName.symbolymboltokenN"
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'runtime error: invalid memory address or nil pointer dereference')
      })
      addTestCase(testCases, testCase)
    }

    //todo it will cause no response, looks like no response from server.request
    testCaseParams.title = '0320\t发行' + testCaseParams.categoryName + '_无效的symbol参数:被已有代币使用过的name'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].symbol = token.existToken.symbol
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'no name')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0330\t发行' + testCaseParams.categoryName + '_无效的decimals参数:字符串'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].decimals = "config.decimals"
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'nterface conversion: interface {} is string, not float64')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0330\t发行' + testCaseParams.categoryName + '_无效的decimals参数:负数'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].decimals = -8
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'tefNO_PERMISSION_ISSUE No permission issue')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0330\t发行' + testCaseParams.categoryName + '_无效的decimals参数:小数'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].decimals = 11.64
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'tefNO_PERMISSION_ISSUE No permission issue')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0340\t发行' + testCaseParams.categoryName + '_无效的total_supply参数:字符串'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].total_supply = "config.total_supply"
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'strconv.ParseInt: parsing')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0340\t发行' + testCaseParams.categoryName + '_无效的total_supply参数:字符串'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].total_supply = -10000000
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'interface conversion: interface {} is float64, not string')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0340\t发行' + testCaseParams.categoryName + '_无效的total_supply参数:小数'
    {
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].total_supply = 10000.12345678
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'interface conversion: interface {} is float64, not string')
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
      let testCase = (testCaseParams.txParams[0].flags == consts.flags.mintable ||testCaseParams.txParams[0].flags == consts.flags.both) ?
          createTestCaseWhenSignPassAndSendRawTxPassForIssueToken(testCaseParams, function(){
            testCaseParams.txParams[0].total_supply = '9'
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
      let testCase = (testCaseParams.txParams[0].flags == consts.flags.burnable ||testCaseParams.txParams[0].flags == consts.flags.both) ?
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

    testCaseParams.title = '0420\t无效地销毁' + testCaseParams.categoryName
    {
      testCaseParams.otherParams.oldBalance = '49382716041'
      let testCase = createTestCaseWhenSignPassButSendRawTxFailForIssueToken(testCaseParams, function(){
        testCaseParams.txParams[0].total_supply = '-9876543210000'
        testCaseParams.expectedResult = createExpecteResult(false, true,
            'tefNO_PERMISSION_ISSUE No permission issue')
      })
      addTestCase(testCases, testCase)
    }

    testCaseParams.title = '0380\t销毁所有' + testCaseParams.categoryName
    {
      let testCase = (testCaseParams.txParams[0].flags == consts.flags.burnable || testCaseParams.txParams[0].flags == consts.flags.both) ?
          createTestCaseWhenSignPassAndSendRawTxPassForIssueToken(testCaseParams, function(){
            // if(testCaseParams.txParams[0].flags == consts.flags.burnable){
            //   testCaseParams.txParams[0].total_supply = '-49382716041'
            // }
            // else if(testCaseParams.txParams[0].flags == consts.flags.both){  //it minted 9 more in above test case, so need add it.
            //   testCaseParams.txParams[0].total_supply =  '-49382716050'
            // }
            testCaseParams.txParams[0].total_supply =  '-49382716041'
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
      let symbol = null
      testForGetBalanceByTag(server, symbol, null)
      testForGetBalanceByTag(server, symbol, 'current')
      testForGetBalanceByTag(server, symbol, 'validated')
      testForGetBalanceByTag(server, symbol, 'closed')
      testForGetBalanceByTag(server, symbol, '4136')  //block number  //todo: always timeout, need restore
      testForGetBalanceByTag(server, symbol, 'C0B53E636BE844AD4AD1D54391E589931A71F08D72CA7AE6E103312CB30C1D91')  //block 4136
    })
  }

  function testForGetBalanceByTag(server, symbol, tag){

    let testCases = []
    let describeTitle = '测试jt_getBalance，tag为' + tag

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
    if(symbol != null) txParams.push(symbol)
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
      expect(response.result).to.be.jsonSchema(schema.BLANCE_SCHEMA)
      expect(Number(response.result.balance)).to.be.above(0)
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
    let testCases = []

    let title = '0010\t查询有效的地址_01:地址内有底层币和代币'
    let addressOrName = addresses.balanceAccount.address
    let needPass = true
    let expectedError = ''
    let testCase = createSingleTestCaseForGetAccount(server, title, addressOrName, needPass, expectedError)
    testCase.supportedServices.push(serviceType.oldChain)
    addTestCase(testCases, testCase)

    title = '0010\t查询有效的昵称_01:地址内有底层币和代币'
    addressOrName = addresses.balanceAccount.nickName
    testCase = createSingleTestCaseForGetAccount(server, title, addressOrName, needPass, expectedError)
    addTestCase(testCases, testCase)

    title = '0010\t查询未激活的地址_01:地址内没有有底层币和代币'
    addressOrName = addresses.inactiveAccount1.address
    needPass = false
    //expectedError = 'no such account'
    expectedError = 'Account not found.'
    testCase = createSingleTestCaseForGetAccount(server, title, addressOrName, needPass, expectedError)
    testCase.supportedServices.push(serviceType.oldChain)
    addTestCase(testCases, testCase)

    title = '0010\t查询未激活的昵称_01:地址内没有有底层币和代币'
    addressOrName = addresses.inactiveAccount1.nickName
    //expectedError = 'Bad account address:'
    expectedError = 'invalid account'
    testCase = createSingleTestCaseForGetAccount(server, title, addressOrName, needPass, expectedError)
    addTestCase(testCases, testCase)

    title = '0010\t查询无效的地址_01:地址内没有有底层币和代币'
    addressOrName = addresses.wrongFormatAccount1.address
    testCase = createSingleTestCaseForGetAccount(server, title, addressOrName, needPass, expectedError)
    testCase.supportedServices.push(serviceType.oldChain)
    addTestCase(testCases, testCase)

    title = '0010\t查询无效的昵称_01:地址内没有有底层币和代币'
    addressOrName = addresses.wrongFormatAccount1.nickName
    testCase = createSingleTestCaseForGetAccount(server, title, addressOrName, needPass, expectedError)
    addTestCase(testCases, testCase)

    testTestCases(server, describeTitle, testCases)
  }

  function createSingleTestCaseForGetAccount(server, title, addressOrName, needPass, expectedError){

    let functionName = consts.rpcFunctions.getAccount
    let txParams = []
    txParams.push(addressOrName)
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
      // expect(response.result).to.be.jsonSchema(schema.BLANCE_SCHEMA)  //todo: add account schema
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
      // expect(response.result).to.be.jsonSchema(schema.BLANCE_SCHEMA)  //todo: add account schema
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
          return server.responseGetTxCountByHash(hash).then(async(countResponse)=> {
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
            await Promise.resolve(server.responseGetTxByBlockHashAndIndex(hash, i.toString())).then(function (response) {
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
          return server.responseGetTxCountByBlockNumber(number).then(async(countResponse)=> {
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
            await Promise.resolve(server.responseGetTxCountByBlockNumber(number, i.toString())).then(function (response) {
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

    let testNumber = '0010'
    let hash = 'B9A45BD943EE1F3AB8F505A61F6EE38F251DA723ECA084CBCDAB5076C60F84E7'
    let needPass = true
    let expectedError = ''
    let testCase = createSingleTestCaseForGetTransactionReceipt(server, testNumber, hash, needPass, expectedError)
    addTestCase(testCases, testCase)

    testNumber = '0020'
    needPass = false
    hash = 'B9A45BD943EE1F3AB8F505A61F6EE38F251DA723ECA084CBCDAB5076C60F84E8'
    expectedError = 'can\'t find transaction'
    testCase = createSingleTestCaseForGetTransactionReceipt(server, testNumber, hash, needPass, expectedError)
    addTestCase(testCases, testCase)

    hash = '100093'
    expectedError = 'NewHash256: Wrong length'
    testCase = createSingleTestCaseForGetTransactionReceipt(server, testNumber, hash, needPass, expectedError)
    addTestCase(testCases, testCase)

    hash = '1231dsfafwrwerwer'
    expectedError = 'invalid byte'
    testCase = createSingleTestCaseForGetTransactionReceipt(server, testNumber, hash, needPass, expectedError)
    addTestCase(testCases, testCase)

    testTestCases(server, describeTitle, testCases)
  }

  function createSingleTestCaseForGetTransactionReceipt(server, testNumber, hash, needPass, expectedError){

    let functionName = consts.rpcFunctions.getTransactionReceipt
    let txParams = []
    txParams.push(hash)

    let expectedResult = {}
    expectedResult.needPass = needPass
    expectedResult.isErrorInResult = true
    expectedResult.expectedError = expectedError

    let title = testNumber + '\t'+ (needPass ? '有' : '无') + '效区块'

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
      testCases[testCases.length - 1].supportedServices = [serviceType.newChain, serviceType.ipfs,]
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

  // region utility methods

  async function get2BlockNumber (server) {
    return new Promise(async (resolve, reject) => {
      if(!server) reject("Server cannot be null!")
      let result = {}
      result.blockNumber1 = await server.getBlockNumber()
      //logger.debug("defaultBlockTime: " + server.mode.defaultBlockTime)
      await utility.timeout(server.mode.defaultBlockTime)
      result.blockNumber2 = await server.getBlockNumber()
      resolve(result)
    })
  }

  async function checkBalanceChange(server, from, symbol, expectedBalance){
    let balance = await server.getBalance(from, symbol)
    expect(Number(balance.value)).to.be.equal(expectedBalance)
    return balance
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

  // endregion

})

