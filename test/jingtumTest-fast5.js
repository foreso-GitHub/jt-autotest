const chai = require("chai")
chai.use(require("chai-json-schema"))
const expect = chai.expect
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let HashMap = require('hashmap')
let utility = require("./testUtility.js")
const { servers, chains, addresses, status, data, token, txs, blocks, modes } = require("./config")
const schema = require("./schema.js")

let sequenceMap = new HashMap()
run()

async function run(){
  for(let mode of modes){

    let server = mode.server
    server.setUrl(mode.url)

    describe('测试模式: ' + server.getName(), function () {
      this.timeout(20000)

      describe('is working', function () {

        describe('demo', async function () {

          let desc = createCases()

          before(async function() {
            await executeSendTx(server, desc).then(async function(description){
              desc = description
              logger.debug("desc: " + JSON.stringify(desc))
            })
            return await utility.timeout(1000)
          })


          // executeSendTx(server).then(async function(description){
          //   desc = description
          //   await utility.timeout(1000)
          //   logger.debug("====" + JSON.stringify(desc))
          //   checkDescribe(server, desc)
          // })

          //
          // checkDescribe(server, desc)

          // describe('ddd', async function () {
          //   logger.debug("ddd " + JSON.stringify(desc))
          // })
          //
          // for(let i = 0; i < 2; i++){
          //   it('0010\t发起有效交易:' + i, async function () {
          //     let testCase = desc.testCases[i]
          //     logger.debug("testCase: " + JSON.stringify(testCase))
          //     return await checkCase(server, testCase)
          //   })
          // }

          // for(let i = 0; i < count; i++){
          //   // let testCase = desc.testCases[i]
          //   it("No." + i + ": " + desc.testCases[i].title, function () {
          //     checkCase(server, desc.testCases[i])
          //   })
          // }


          // let results = []
          // results.push(true)
          // results.push(false)
          // results.push(false)
          // results.push(true)
          // results.push(false)
          //
          // for(let i = 0; i < 5; i++){
          //   it('0010\t发起有效交易:' + i, function () {
          //     logger.debug("case: " + i)
          //
          //     desc.testCases.forEach((testCase)=>{
          //       logger.debug("desc: " + JSON.stringify(testCase.response))
          //     })
          //
          //     temp(desc)
          //
          //     logger.debug("case: " + i + "done")
          //     expect(results[i]).to.be.ok
          //   })
          // }

          // await executeSendTx(server).then(async function(description){
          //   desc = description
          //   logger.debug("desc: " + JSON.stringify(desc))
          //   temp(desc)
          // })
          // return await utility.timeout(1000)

          // await utility.timeout(5000)
          // logger.debug("desc: " + JSON.stringify(desc))
          // temp(desc)

          let count = 2;
          // it('获取testcase个数', function () {
          //   logger.debug("desc: " + JSON.stringify(testCase.response))
          //   count = desc.testCases.length
          //   logger.debug("case count: " + count)
          //   expect(true).to.be.ok
          // })

          for(let i = 0; i < count; i++){
            // logger.debug("----: " + JSON.stringify(desc))
            let testCase = desc.testCases[i]
            // it("No." + i + ": " + JSON.stringify(desc), function () {
            it("No." + (i + 1) + ": " + testCase.title, function () {
              logger.debug("----: " + JSON.stringify(desc))
              checkCase(server, testCase)
            })
          }

        })

      })

    })
  }
}

async function temp(desc){


  let results = []
  results.push(true)
  results.push(false)
  results.push(false)
  results.push(true)
  results.push(false)

  for(let i = 0; i < 5; i++){
    it('0010\t发起有效交易:' + i, function () {
      logger.debug("temp: " + i)

      logger.debug("temp: " + JSON.stringify(desc))
      desc.testCases.forEach((testCase)=>{
        logger.debug("temp: " + JSON.stringify(testCase.response))
      })

      logger.debug("temp: " + i + "done")
      expect(results[i]).to.be.ok
    })
  }
}

//region execute send tx
function createCases(){
  let description = {
    type:"describe",
    title:"testFastSend",
    testCases: [],
  }

  let params = createTransactionParams("底层币", addresses.sender1, addresses.receiver1,
      "swt", "telINSUF_FEE_P Fee insufficient")

  let testCase = {}
  testCase.type = "it"
  testCase.params =cloneParams(params)
  testCase.title = '0010\t发起' + params.type + '有效交易_01'
  testCase.needPass = true
  testCase.expectedError = {
    isErrorInResult: true,
    expectedError: '',
  }
  description.testCases.push(testCase)

  testCase = {}
  testCase.type = "it"
  testCase.params =cloneParams(params)
  testCase.params.value = params.value2
  testCase.title = '0020\t发起' + params.type + '有效交易_02: 交易额填"1/' + params.symbol + '或“100/' + params.symbol + '”等'
  testCase.needPass = true
  testCase.expectedError = {
    isErrorInResult: true,
    expectedError: '',
  }
  description.testCases.push(testCase)

  return description
}

//region execute testcase
function executeSendTx(server, initDesc){
  return new Promise(async function (resolve){
    await executeDescribe(server, initDesc, sendTxWithSequence3).then(function(description){
      logger.debug("desc in testFastSend2: " + JSON.stringify(description.testCases[0]))
      resolve(description)
    })
  })
}

function executeDescribe(server, description, executeFunction){
  return new Promise(async function (resolve) {
    let finishCount = 0
    let cases = description.testCases
    for (let i = 0; i < cases.length; i++) {
      let testCase = cases[i]
      if(testCase.type === 'it'){
        await executeCase(server, testCase, executeFunction)
      }
      else if (testCase.type === 'describe'){
        await executeDescribe(server, testCase, executeFunction)
      }
      else{
        logger.debug("Error: unknown test case type: " + testCase.type)
      }

      finishCount++
      logger.debug("=== finishCount: " + finishCount)
      if(finishCount == cases.length) {
        // await utility.timeout(data.defaultBlockTime)
        logger.debug("executeDescribe done!")
        resolve(description)
      }
    }
  })
}

function executeCase(server, testCase, executeFunction){
  return new Promise(async function (resolve) {
    await Promise.resolve(executeFunction(server, testCase.params)).then(function (response) {
      testCase.response = response
      logger.debug("=== " + JSON.stringify(response))
      resolve(testCase)
    })
  })
}
//endregion

//region check testcase
function checkDescribe(server, description, checkFunction){
  describe(description.title, function () {
    let cases = description.testCases
    for (let i = 0; i < cases.length; i++) {
      let testCase = cases[i]
      checkCase(server, testCase)
      // if(testCase.type === 'it'){
      //   checkCase(server, testCase, checkFunction)
      // }
      // else if (testCase.type === 'describe'){
      //   checkDescribe(server, testCase, checkFunction)
      // }
      // else{
      //   logger.debug("Error: unknown test case type: " + testCase.type)
      // }
    }
  })

}

function checkCase(server, testCase){
  // it(testCase.params.title, function () {
    let response = testCase.response
    let commonParams = testCase.params
    checkCommonSendTxSuccess(server, response).then((tx)=>{
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
            expect(hex2String(memos[i].Memo.MemoData)).to.be.equals(expectedMemo)
          }
          else if(expectedMemo.data){
            expect(hex2String(memos[i].Memo.MemoData)).to.be.equals(expectedMemo.data)
          }
          else{
            expect(false).to.be.ok
          }
          //todo need check type and format also. need make type, format, data of memo function clear with weijia.
        }
      }
    })

  // })
}
//endregion

//endregion


//region fast test

//region useful
let testCase = {
  type:"it",
  title:"",
  params:{},
  needPass: true,
  expectedError: {},
  response: {},
}

let description = {
  type:"describe",
  title:"",
  testCases: [],
}





function sendTxWithSequence2(server, txParams){
  Promise.resolve(getSequence(server, txParams.from)).then(async function (sequence) {
    logger.debug("===" + sequence)
    await Promise.resolve(server.responseSendTxWithSequence(
        txParams.from,
        txParams.secret,
        sequence,
        txParams.to,
        txParams.value,
        txParams.fee,
        txParams.memos,
    ).then(function (response) {
      logger.debug("===" + JSON.stringify(response))
      if(response.status === status.success){
        setSequence(txParams.from, ++sequence)  //if send tx successfully, then sequence need plus 1
        logger.debug("===" + JSON.stringify(getSequence(server, txParams.from)))
      }
      // resolve(response)
      return response
    })).catch(function (error) {
      logger.debug("!!!" + error)
    })
  })
}

function sendTxWithSequence3(server, txParams){
  return new Promise(async function (resolve) {
    await Promise.resolve(getSequence(server, txParams.from)).then(async function (sequence) {
      logger.debug("===" + sequence)
      await Promise.resolve(server.responseSendTxWithSequence(
          txParams.from,
          txParams.secret,
          sequence,
          txParams.to,
          txParams.value,
          txParams.fee,
          txParams.memos,
      ).then(function (response) {
        logger.debug("===" + JSON.stringify(response))
        if(response.status === status.success){
          setSequence(txParams.from, ++sequence)  //if send tx successfully, then sequence need plus 1
          logger.debug("===" + JSON.stringify(getSequence(server, txParams.from)))
        }
        resolve(response)
      })).catch(function (error) {
        logger.debug("!!!" + error)
      })
    })
  })
}

//endregion

function sendTx(){

}

function compareActualTxWithTxParams(commonParams, tx){
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
        expect(hex2String(memos[i].Memo.MemoData)).to.be.equals(expectedMemo)
      }
      else if(expectedMemo.data){
        expect(hex2String(memos[i].Memo.MemoData)).to.be.equals(expectedMemo.data)
      }
      else{
        expect(false).to.be.ok
      }
      //todo need check type and format also. need make type, format, data of memo function clear with weijia.
    }
  }

}

function getTx(){

}

function checkGetTxResponse(){

}

function signTx(){

}

function sendRawTx(){

}
//endregion

//region common test case

function createTransactionParams(type, from, to, symbol, exceedingErrorMessage){
  let showSymbol = (symbol || symbol == null) ? "" : ("/" + symbol)
  let params = {}
  params.type = type
  params.from = from.address
  params.secret = from.secret
  params.to = to.address
  params.symbol = symbol
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

function cloneParams(originalParams){
  let params = {}
  params.type = originalParams.type
  params.from = originalParams.from
  params.secret = originalParams.secret
  params.to = originalParams.to
  params.symbol = originalParams.symbol
  params.value = originalParams.value
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

  it('0010\t发起' + params.type + '有效交易_01', function () {
    let commonParams = cloneParams(params)
    return checkSendTxSuccess(server, commonParams, retentiveParams)
  })
}

function testBasicTransaction(server, params) {
  let retentiveParams = {}

  describe('测试基本交易', function () {

    it('0010\t发起' + params.type + '有效交易_01', function () {
      let commonParams = cloneParams(params)
      return checkSendTxSuccess(server, commonParams, retentiveParams)
    })

    it('0010\t发起' + params.type + '有效交易_01：连续交易', async function () {
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

    it('0020\t发起' + params.type + '有效交易_02: 交易额填"1/' + params.symbol + '或“100/' + params.symbol + '”等', function () {
      let commonParams = cloneParams(params)
      commonParams.value = params.value2
      return checkSendTxSuccess(server, commonParams, retentiveParams)
    })

    it('0030\t发起' + params.type + '无效交易_01: 没有秘钥', function () {
      let commonParams = cloneParams(params)
      commonParams.secret = null
      return checkSendTxFailure(server, commonParams, retentiveParams, true, 'No secret found for')
    })

    it('0030\t发起' + params.type + '无效交易_01: 错误的秘钥1', function () {
      let commonParams = cloneParams(params)
      commonParams.secret = '错误的秘钥'
      return checkSendTxFailure(server, commonParams, retentiveParams, true, 'Bad Base58 string')
    })

    it('0030\t发起' + params.type + '无效交易_01: 错误的秘钥2', function () {
      let commonParams = cloneParams(params)
      commonParams.secret = commonParams.secret + '1'
      return checkSendTxFailure(server, commonParams, retentiveParams, true, 'Bad Base58 checksum')
    })

    it('0040\t发起' + params.type + '无效交易_02: 错误的发起钱包地址（乱码字符串）', function () {
      let commonParams = cloneParams(params)
      commonParams.from = commonParams.from + '1'
      return checkSendTxFailure(server, commonParams, retentiveParams, true, 'Bad account address:')
    })

    it('0050\t发起' + params.type + '无效交易_03: 错误的接收钱包地址（乱码字符串）', function () {
      let commonParams = cloneParams(params)
      commonParams.to = commonParams.to + '1'
      return checkSendTxFailure(server, commonParams, retentiveParams, true, 'Bad account address:')
    })

    it('0060\t发起' + params.type + '无效交易_04: 交易额超过发起钱包余额', function () {
      let commonParams = cloneParams(params)
      commonParams.value = params.exceedingValue
      return checkSendTxFailure(server, commonParams, retentiveParams, false, params.exceedingErrorMessage)
    })

    it('0070\t发起' + params.type + '无效交易_05: 交易额为负数', function () {
      let commonParams = cloneParams(params)
      commonParams.value = params.nagetiveValue
      return checkSendTxFailure(server, commonParams, retentiveParams, false, 'temBAD_AMOUNT Can only send positive amounts')
    })

    it('0080\t发起' + params.type + '无效交易_06: 交易额为空', function () {
      let commonParams = cloneParams(params)
      commonParams.value = null
      return checkSendTxFailure(server, commonParams, retentiveParams, true, 'Invalid Number')
    })

    it('0080\t发起' + params.type + '无效交易_06: 交易额为字符串', function () {
      let commonParams = cloneParams(params)
      commonParams.value = params.stringValue
      return checkSendTxFailure(server, commonParams, retentiveParams, true, 'Invalid Number')
    })

    it('0090\t发起' + params.type + '无效交易_07: 交易额为小于1的正小数', function () {
      let commonParams = cloneParams(params)
      commonParams.value = params.below1DecimalValue
      return checkSendTxFailure(server, commonParams, retentiveParams, true, 'value must be integer type')
    })

    it('0100\t发起' + params.type + '无效交易_08: 交易额为大于1的小数', function () {
      let commonParams = cloneParams(params)
      commonParams.value = params.over1DecimalValue
      return checkSendTxFailure(server, commonParams, retentiveParams, true, 'value must be integer type')
    })

    it('0110\t发起' + params.type + '无效交易_09: 交易额为负小数：-0.1、-1.23等', function () {
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

    it('0130\t发起带有效memo的交易_02\n: memo格式为： "memos":[{"type":"ok","format":"utf8","data":"E5A4A7E5AEB6E5A5BD"}]', function () {
      let commonParams = cloneParams(params)
      commonParams.memos = [{"type":"ok","format":"utf8","data":"E5A4A7E5AEB6E5A5BD"}]
      return checkSendTxSuccess(server, commonParams, retentiveParams)
    })

    it('0140\t发起带无效memo的交易_01\n: memo内容使整个交易内容超过900K', function () {
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

    it('0180\t发起带有效fee的交易_03\n: fee比12大但小于钱包余额', function () {
      let commonParams = cloneParams(params)
      commonParams.fee = 110
      return checkSendTxSuccess(server, commonParams, retentiveParams)
    })

    it('0190\t发起带无效fee的交易_01\n: fee比12小（比如5），但是不足以发起成功的交易\n', function () {
      let commonParams = cloneParams(params)
      commonParams.fee = 5
      return checkSendTxFailure(server, commonParams, retentiveParams, false, 'tecINSUFF_FEE Insufficient balance to pay fee')
    })

    it('0200\t发起带无效fee的交易_02\n: fee为0\n', function () {
      let commonParams = cloneParams(params)
      commonParams.fee = 0
      return checkSendTxFailure(server, commonParams, retentiveParams, false, 'tecINSUFF_FEE Insufficient balance to pay fee')
    })

    it('0210\t发起带无效fee的交易_03\n: fee为大于0的小数，比如12.5、5.5\n', function () {
      let commonParams = cloneParams(params)
      commonParams.fee = 12.5
      return checkSendTxFailure(server, commonParams, retentiveParams, false,
          'tecINSUFF_FEE Insufficient balance to pay fee')
    })

    it('0220\t发起带无效fee的交易_04\n: fee为大于发起钱包' + params.type + '余额的整数\n', function () {
      let commonParams = cloneParams(params)
      commonParams.fee = 999999999999999
      return checkSendTxFailure(server, commonParams, retentiveParams, false,
          'telINSUF_FEE_P Fee insufficient')
    })

    it('0230\t发起带无效fee的交易_05\n: fee为负数，比如-3.5、-555等\n', function () {
      let commonParams = cloneParams(params)
      commonParams.fee = -35
      return checkSendTxFailure(server, commonParams, retentiveParams, false,
          'tecINSUFF_FEE Insufficient balance to pay fee')
    })

    it('0240\t发起带无效fee的交易_06\n: fee为字符串\n', function () {
      let commonParams = cloneParams(params)
      commonParams.fee = "35"
      return checkSendTxFailure(server, commonParams, retentiveParams, true,
          'interface conversion: interface {} is string, not float64')
    })

  })
}

function testCreateToken(server, params){
  let type = params.type
  let from = params.from
  let config = params.config
  let existToken = params.existToken
  let tokenName = params.tokenName

  describe('测试' + type + '发行', function () {

    it('0270\t发行' + type + '\n', function () {
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
        await checkSendTxSuccess(server, value)
        return await checkBalanceChange(server, from.address, tokenName.symbol, Number(config.total_supply))
      })
    })

    it('0290\t发行' + type + '_无效的type参数\n', function () {
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

    it('0300\t发行' + type + '_无效的from参数\n', function () {
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

    it('0320\t发行' + type + '_无效的symbol参数\n:很长的字符串', function () {
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

    it('0320\t发行' + type + '_无效的symbol参数\n:被已有代币使用过的name', function () {
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

    it('0330\t发行' + type + '_无效的decimals参数\n:字符串', function () {
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

    it('0330\t发行' + type + '_无效的decimals参数\n:负数', function () {
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

    it('0330\t发行' + type + '_无效的decimals参数\n:小数', function () {
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

    it('0340\t发行' + type + '_无效的total_supply参数\n:字符串', function () {
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

    it('0340\t发行' + type + '_无效的total_supply参数\n:负数', function () {
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

    it('0340\t发行' + type + '_无效的total_supply参数\n:小数', function () {
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
  let type = params.type
  let from = params.from
  let config = params.config
  let tokenName = params.tokenName
  let mintResult = params.mintResult

  describe('测试' + type + '增发', function () {

    it('0370\t增发可增发的代币\n', async function () {
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
  let type = params.type
  let from = params.from
  let config = params.config
  let tokenName = params.tokenName
  let burnResult = params.burnResult

  describe('测试' + type + '销毁', function () {

    it('0380\t销毁' + type + '\n', async function () {
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

    it('0420\t无效地销毁' + type + '\n', async function () {
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

    it('0380\t销毁所有' + type + '\n', async function () {
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
  return Promise.resolve(sendTx(server, commonParams, retentiveParams)).then(async function (value) {
    await checkCommonSendTxSuccess(server, value).then((tx)=>{
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
            expect(hex2String(memos[i].Memo.MemoData)).to.be.equals(expectedMemo)
          }
          else if(expectedMemo.data){
            expect(hex2String(memos[i].Memo.MemoData)).to.be.equals(expectedMemo.data)
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
        if(!isRetry && (value.result.toString().indexOf('can\'t find transaction') != -1 || value.result.toString().indexOf('no such transaction') != -1)){
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
  it('0010\t查询有效的地址_01:地址内有底层币和代币\n', function () {
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
  it('0010\t查询有效的地址_01:地址内没有有底层币和代币\n', function () {
    return Promise.resolve(server.responseBalance(addressOrName, null, tag)).then(function (value) {
      checkResponse(false, value)
      expect(value.message).to.contains('no such account')
    }, function (err) {
      expect(err).to.be.ok
    })
  })
}

function checkBalanceOnWrongFormatAccount(server, addressOrName, tag){
  it('0010\t查询有效的地址_01:地址内没有有底层币和代币\n', function () {
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
  it('0010\t查询有效的地址_01:地址内有底层币和代币\n', function () {
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
  it('0010\t查询有效的地址_01:地址内没有有底层币和代币\n', function () {
    return Promise.resolve(server.responseGetAccount(addressOrName, null, tag)).then(function (value) {
      checkResponse(false, value)
      expect(value.result).to.contains('Bad account address:')
    }, function (err) {
      expect(err).to.be.ok
    })
  })
}

function checkAccountOnWrongFormatAccount(server, addressOrName, tag){
  it('0010\t查询有效的地址_01:地址内没有有底层币和代币\n', function () {
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
  return Promise.resolve(server.responseSendTxWithSequence(
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

function hex2String(hex){
  return new Buffer.from(hex, 'hex').toString('utf8')
}

function string2hex(string){
  return new Buffer(string, 'base64').toString('hex')
}

function getSequence(server, from){
  // return new Promise((resolve) => {resolve('123')})
  // return 123
  // return new Promise((resolve) => {resolve(1234)})

  return new Promise(function (resolve){
    if(sequenceMap.has(from)){
      resolve(sequenceMap.get(from))
    }
    else{
      Promise.resolve(server.responseGetAccount(from)).then(function (accountInfo) {
        logger.debug("accountInfo:" + JSON.stringify(accountInfo))
        let sequence = Number(accountInfo.result.Sequence)
        setSequence(from, sequence)
        resolve(sequence)
      }).catch(function (error){
        logger.debug("!!!" + error)
      })
    }
  })

  // if(sequenceMap.has(from)){
  //   return sequenceMap.get(from)
  // }
  // else{
  //   await Promise.resolve(server.responseGetAccount(from)).then(function(accountInfo){
  //     let sequence = Number(accountInfo.result.Sequence)
  //     setSequence(from, sequence)
  //     // return 123
  //     // return sequence
  //     return new Promise((resolve) => {resolve(sequence)})
  //   })
  // }
}

function setSequence(from, sequence){
  sequenceMap.set(from, sequence)
}

//endregion

// endregion
