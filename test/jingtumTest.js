const chai = require("chai")
chai.use(require("chai-json-schema"))
const expect = chai.expect
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
var utility = require("./testUtility.js")
const { servers, chains, addresses, status, data, token, modes } = require("./config")
const schema = require("./schema.js")

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
          return Promise.resolve(server.responseGetTx(mode.tx1.hash)).then(function (value) {
            checkResponse(true, value)
            expect(value.result).to.be.jsonSchema(schema.TX_SCHEMA)
            expect(value.result.Account).to.be.equal(mode.tx1.Account)
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        //endregion

        //region send tx

        it('test send transaction with string memo', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "1",
              data.defaultFee,
              ["test"]
          )).then(async function (value) {
            checkResponse(true, value)
            await checkSendTxSuccess(server, value)
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('test send transaction with json memo', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender2.address,
              addresses.sender2.secret,
              addresses.receiver2.address,
              "5",
              data.defaultFee,
              [
                {
                  "type":"ok",
                  "format":"utf8",
                  "data":""
                }
              ]
          )).then(async function (value) {
            checkResponse(true, value)
            await checkSendTxSuccess(server, value)
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        //endregion

      })

      describe.skip('用例测试', function () {

        describe('测试jt_getTransactionByHash', function () {

          it('0010\t查询有效交易哈希-底层币\n', function () {
            let tx = data.chain.tx
            return Promise.resolve(server.responseGetTx(
                tx.hash,
            )).then(async function (value) {
              checkGetTxSuccess(tx, value)
            })
          })

          it('0020\t查询有效交易哈希-token\n', function () {
            let tx = data.tx_token
            return Promise.resolve(server.responseGetTx(
                tx.hash,
            )).then(async function (value) {
              checkGetTxSuccess(tx, value)
            })
          })

          it('0030\t查询有效交易哈希-memos\n', function () {
            let tx = data.tx_memo
            return Promise.resolve(server.responseGetTx(
                tx.hash,
            )).then(async function (value) {
              checkGetTxSuccess(tx, value)
            })
          })

          it('0040\t查询无效交易哈希:数字\n', function () {
            return Promise.resolve(server.responseGetTx(
                1231111,
            )).then(async function (value) {
              checkResponse(false, value)
              expect(value.result).to.equal('interface conversion: interface {} is float64, not string')
            })
          })

          it('0040\t查询无效交易哈希:字符串\n', function () {
            return Promise.resolve(server.responseGetTx(
                "data.tx1.hash",
            )).then(async function (value) {
              checkResponse(false, value)
              expect(value.result).to.contains('encoding/hex: invalid byte:')
            })
          })

          it('0040\t查询无效交易哈希:参数为空\n', function () {
            return Promise.resolve(server.responseGetTx(
                null,
            )).then(async function (value) {
              checkResponse(false, value)
              expect(value.result).to.equal('interface conversion: interface {} is nil, not string')
            })
          })

        })

        describe('测试jt_blockNumber', function () {

          it('0010\t查询最新区块号\n', function () {
            return Promise.resolve(server.responseBlockNumber()).then(function (value) {
              checkResponse(true, value)
              expect(value.result).to.be.jsonSchema(schema.BLOCKNUMBER_SCHEMA)
              expect(server.processBlockNumberResponse(value)).to.be.above(100)
            }, function (err) {
              expect(err).to.be.ok
            })
          })

          it('0010\t查询最新区块号：发起查询请求，等待5秒或10秒（同步时间），再次发起查询请求\n', function () {
            return Promise.resolve(get2BlockNumber(server)).then(function (value) {
              expect(value.blockNumber2 - value.blockNumber1).to.be.most(2)
              expect(value.blockNumber2 - value.blockNumber1).to.be.least(1)
            }, function (err) {
              expect(err).to.be.ok
            })
          })

        })

        describe('测试jt_createAccount\n', function () {

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

        describe('测试jt_getAccount\n', function () {

          testGetAccountByTag(server, null)
          testGetAccountByTag(server, "current")
          testGetAccountByTag(server, "validated")
          testGetAccountByTag(server, "closed")
          // testGetAccountByTag(server, "4136")  //block number  //todo: always timeout, need restore
          testGetAccountByTag(server, "C0B53E636BE844AD4AD1D54391E589931A71F08D72CA7AE6E103312CB30C1D91")  //block 4136
        })

        describe('测试jt_getBalance\n', function () {

          testGetBalanceByTag(server, null)
          testGetBalanceByTag(server, "current")
          testGetBalanceByTag(server, "validated")
          testGetBalanceByTag(server, "closed")
          // testGetBalanceByTag(server, "4136")  //block number  //todo: always timeout, need restore
          testGetBalanceByTag(server, "C0B53E636BE844AD4AD1D54391E589931A71F08D72CA7AE6E103312CB30C1D91")  //block 4136
        })

        describe('测试jt_sendTransaction', function () {

          describe('测试底层币交易', function (){
            let params = createTokenParams("底层币", addresses.sender1, addresses.receiver1,
                "swt", "telINSUF_FEE_P Fee insufficient")
            testBasicTransaction(server, params)

            //todo check send tx continuously by with sequence
          })

          describe('测试token交易', function (){

            describe('测试基本交易', function (){
              let params = createTokenParams("token", addresses.sender3, addresses.receiver1,
                  "at1", "telINSUF_FUND Fund insufficient")
              testBasicTransaction(server, params)
            })

            describe('测试发行一次性代币', function (){
              //test create first
              let params = {}
              params.type = "一次性代币"
              params.from = addresses.sender1
              params.config = token.config_normal
              params.existToken = token.existToken
              params.tokenName = getDynamicName()
              testCreateToken(server, params)

              //then test transaction of new token
              let txParams = createTokenParams(params.type, addresses.sender1, addresses.receiver1,
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
              params.type = "可增发代币"
              params.from = addresses.sender1
              params.config = token.config_mintable
              params.existToken = token.existToken
              params.tokenName = getDynamicName()
              testCreateToken(server, params)

              //then test transaction of new token
              let txParams = createTokenParams(params.type, addresses.sender1, addresses.receiver1,
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
              params.type = "可销毁代币"
              params.from = addresses.sender1
              params.config = token.config_burnable
              params.existToken = token.existToken
              params.tokenName = getDynamicName()
              testCreateToken(server, params)

              //then test transaction of new token
              let txParams = createTokenParams(params.type, addresses.sender1, addresses.receiver1,
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
              params.type = "可增发可销毁代币"
              params.from = addresses.sender1
              params.config = token.config_mint_burn
              params.existToken = token.existToken
              params.tokenName = getDynamicName()
              testCreateToken(server, params)

              //then test transaction of new token
              let txParams = createTokenParams(params.type, addresses.sender1, addresses.receiver1,
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
              params.type = "带issuer的一次性代币"
              params.from = addresses.sender1
              params.config = token.config_issuer_normal
              params.existToken = token.existToken
              params.tokenName = getDynamicName()
              testCreateToken(server, params)

              //then test transaction of new token
              let txParams = createTokenParams(params.type, addresses.sender1, addresses.receiver1,
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
              params.type = "带issuer的可增发的代币"
              params.from = addresses.sender1
              params.config = token.config_issuer_mintable
              params.existToken = token.existToken
              params.tokenName = getDynamicName()
              testCreateToken(server, params)

              //then test transaction of new token
              let txParams = createTokenParams(params.type, addresses.sender1, addresses.receiver1,
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
              params.type = "带issuer的可销毁的代币"
              params.from = addresses.sender1
              params.config = token.config_issuer_burnable
              params.existToken = token.existToken
              params.tokenName = getDynamicName()
              testCreateToken(server, params)

              //then test transaction of new token
              let txParams = createTokenParams(params.type, addresses.sender1, addresses.receiver1,
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
              params.type = "带issuer的可增发可销毁的代币"
              params.from = addresses.sender1
              params.config = token.config_issuer_mint_burn
              params.existToken = token.existToken
              params.tokenName = getDynamicName()
              testCreateToken(server, params)

              //then test transaction of new token
              let txParams = createTokenParams(params.type, addresses.sender1, addresses.receiver1,
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

        describe('测试token交易', function (){

          describe('测试基本交易', function (){
            let params = createTokenParams("token", addresses.sender3, addresses.receiver1,
                "at1", "telINSUF_FUND Fund insufficient")
            testBasicTransaction(server, params)
          })

          describe.skip('测试发行一次性代币', function (){
            //test create first
            let params = {}
            params.type = "一次性代币"
            params.from = addresses.sender1
            params.config = token.config_normal
            params.existToken = token.existToken
            params.tokenName = getDynamicName()
            testCreateToken(server, params)

            //then test transaction of new token
            let txParams = createTokenParams(params.type, addresses.sender1, addresses.receiver1,
                params.tokenName.symbol, "telINSUF_FUND Fund insufficient")
            testBasicTransaction(server, txParams)

            //then test mint
            params.mintResult = false
            testMintToken(server, params)

            //then test burn
            params.burnResult = false
            testBurnToken(server, params)
          })

        })

        // afterEach(async function() {
        //   //set timeout to ensure the next test which use the same sender address can pass the test
        //   return await utility.timeout(data.defaultBlockTime)
        // })


      })

    })


  }

  //region common test case
  function createTokenParams(type, from, to, symbol, exceedingErrorMessage){
    let showSymbol = (symbol === 'swt') ? "" : ("/" + symbol)
    let params = {}
    params.type = type
    params.from = from.address
    params.secret = from.secret
    params.to = to.address
    params.symbol = symbol
    params.value = "1" + showSymbol
    params.value2 = "123/" + symbol
    params.exceedingValue = "999999999999999" + showSymbol
    params.exceedingErrorMessage = exceedingErrorMessage
    params.nagetiveValue = "-100" + showSymbol
    params.stringValue = "aawrwfsfs"
    params.below1DecimalValue = "0.1" + showSymbol
    params.over1DecimalValue = "1.1" + showSymbol
    params.negativeDecimalValue = "-0.1" + showSymbol
    return params
  }

  function createTxParams(type, from, to, symbol){
    let showSymbol = (symbol === 'swt') ? "" : ("/" + symbol)
    let params = {}
    params.type = type
    params.from = from.address
    params.secret = from.secret
    params.to = to.address
    params.symbol = symbol
    params.value = "1" + showSymbol
    return params
  }

  function testBasicTransaction(server, params) {

    describe.skip('测试基本交易', function () {

      it('0010\t发起' + params.type + '有效交易_01', function () {
        return Promise.resolve(server.responseSendTx(
            params.from,
            params.secret,
            params.to,
            params.value,
        )).then(async function (value) {
          return await checkSendTxSuccess(server, value)
        })
      })

      it('0020\t发起' + params.type + '有效交易_02: 交易额填"1/' + params.symbol + '或“100/' + params.symbol + '”等', function () {
        return Promise.resolve(server.responseSendTx(
            params.from,
            params.secret,
            params.to,
            params.value2,
        )).then(async function (value) {
          return await checkSendTxSuccess(server, value)
        })
      })

      it('0030\t发起' + params.type + '无效交易_01: 没有秘钥', function () {
        return Promise.resolve(server.responseSendTx(
            params.from,
            null,
            params.to,
            params.value,
        )).then(function (value) {
          checkResponse(false, value)
          expect(value.result).to.contains('No secret found for')
        }, function (err) {
          expect(err).to.be.ok
        })
      })

      it('0030\t发起' + params.type + '无效交易_01: 错误的秘钥1', function () {
        return Promise.resolve(server.responseSendTx(
            params.from,
            '错误的秘钥',
            params.to,
            params.value,
        )).then(function (value) {
          checkResponse(false, value)
          expect(value.result).to.contains('Bad Base58 string')
        }, function (err) {
          expect(err).to.be.ok
        })
      })

      it('0030\t发起' + params.type + '无效交易_01: 错误的秘钥2', function () {
        return Promise.resolve(server.responseSendTx(
            params.from,
            params.secret + '1',
            params.to,
            params.value,
        )).then(function (value) {
          checkResponse(false, value)
          expect(value.result).to.contains('Bad Base58 checksum')
        }, function (err) {
          expect(err).to.be.ok
        })
      })

      it('0040\t发起' + params.type + '无效交易_02: 错误的发起钱包地址（乱码字符串）', function () {
        return Promise.resolve(server.responseSendTx(
            params.from + '1',
            params.secret,
            params.to,
            params.value,
        )).then(function (value) {
          checkResponse(false, value)
          expect(value.result).to.contains('Bad account address:')
        }, function (err) {
          expect(err).to.be.ok
        })
      })

      it('0050\t发起' + params.type + '无效交易_03: 错误的接收钱包地址（乱码字符串）', function () {
        return Promise.resolve(server.responseSendTx(
            params.from,
            params.secret,
            params.to + '1',
            params.value,
        )).then(function (value) {
          checkResponse(false, value)
          expect(value.result).to.contains('Bad account address:')
        }, function (err) {
          expect(err).to.be.ok
        })
      })

      it('0060\t发起' + params.type + '无效交易_04: 交易额超过发起钱包余额', function () {
        return Promise.resolve(server.responseSendTx(
            params.from,
            params.secret,
            params.to,
            params.exceedingValue,  //todo need check balance first
        )).then(function (value) {
          checkResponse(false, value)
          expect(value.message).to.contains(params.exceedingErrorMessage)
        }, function (err) {
          expect(err).to.be.ok
        })
      })

      it('0070\t发起' + params.type + '无效交易_05: 交易额为负数', function () {
        return Promise.resolve(server.responseSendTx(
            params.from,
            params.secret,
            params.to,
            params.nagetiveValue,
        )).then(function (value) {
          checkResponse(false, value)
          expect(value.message).to.contains('temBAD_AMOUNT Can only send positive amounts')
        }, function (err) {
          expect(err).to.be.ok
        })
      })

      it('0080\t发起' + params.type + '无效交易_06: 交易额为空', function () {
        return Promise.resolve(server.responseSendTx(
            params.from,
            params.secret,
            params.to,
            null,
        )).then(function (value) {
          checkResponse(false, value)
          expect(value.result).to.contains('Invalid Number')
        }, function (err) {
          expect(err).to.be.ok
        })
      })

      it('0080\t发起' + params.type + '无效交易_06: 交易额为字符串', function () {
        return Promise.resolve(server.responseSendTx(
            params.from,
            params.secret,
            params.to,
            params.stringValue,
        )).then(function (value) {
          checkResponse(false, value)
          expect(value.result).to.contains('Invalid Number')
        }, function (err) {
          expect(err).to.be.ok
        })
      })

      it('0090\t发起' + params.type + '无效交易_07: 交易额为小于1的正小数', function () {
        return Promise.resolve(server.responseSendTx(
            params.from,
            params.secret,
            params.to,
            params.below1DecimalValue,
        )).then(function (value) {
          checkResponse(false, value)
          expect(value.result).to.equal('value must be integer type')
        }, function (err) {
          expect(err).to.be.ok
        })
      })

      it('0100\t发起' + params.type + '无效交易_08: 交易额为大于1的小数', function () {
        return Promise.resolve(server.responseSendTx(
            params.from,
            params.secret,
            params.to,
            params.over1DecimalValue,
        )).then(function (value) {
          checkResponse(false, value)
          expect(value.result).to.equal('value must be integer type')
        }, function (err) {
          expect(err).to.be.ok
        })
      })

      it('0110\t发起' + params.type + '无效交易_09: 交易额为负小数：-0.1、-1.23等', function () {
        return Promise.resolve(server.responseSendTx(
            params.from,
            params.secret,
            params.to,
            params.negativeDecimalValue,
        )).then(function (value) {
          checkResponse(false, value)
          expect(value.result).to.equal('value must be integer type')
        }, function (err) {
          expect(err).to.be.ok
        })
      })

    })

    describe('测试带memo的交易', function () {
      it('0120\t发起带有效memo的交易_01: memo格式为："memos":["大家好"]', function () {
        let specialParams = {}
        specialParams.fee = data.defaultFee
        specialParams.memos = ["大家好"]
        return checkMemosSuccess(server, params, specialParams)
      })

      it('0120\t发起带有效memo的交易_01: memo格式为奇数长度数字字串："memos":["12345"]', function () {
        let specialParams = {}
        specialParams.fee = data.defaultFee
        specialParams.memos = ["12345"]
        return checkMemosSuccess(server, params, specialParams)
      })

      it('0120\t发起带有效memo的交易_01: memo格式为偶数长度数字字串："memos":["123456"]', function () {
        let specialParams = {}
        specialParams.fee = data.defaultFee
        specialParams.memos = ["123456"]
        return checkMemosSuccess(server, params, specialParams)
      })

      it('0120\t发起带有效memo的交易_01: memo格式为字串："memos":["E5A4A7E5AEB6E5A5BDff"]', function () {
        let specialParams = {}
        specialParams.fee = data.defaultFee
        specialParams.memos = ["E5A4A7E5AEB6E5A5BDff"]
        return checkMemosSuccess(server, params, specialParams)
      })

      it('0130\t发起带有效memo的交易_02\n: memo格式为： "memos":[{"type":"ok","format":"utf8","data":"E5A4A7E5AEB6E5A5BD"}]', function () {
        let specialParams = {}
        specialParams.fee = data.defaultFee
        specialParams.memos = [{"type":"ok","format":"utf8","data":"E5A4A7E5AEB6E5A5BD"}]
        return checkMemosSuccess(server, params, specialParams)
      })

      it('0140\t发起带无效memo的交易_01\n: memo内容使整个交易内容超过900K', function () {
        //memo内容使整个交易内容超过900K
        let memos = "E5A4A7E5AEB6E5A5BD"
        for(let i = 0; i < 18; i++){
          memos += memos;
        }
        let specialParams = {}
        specialParams.fee = data.defaultFee
        specialParams.memos = memos
        return checkMemosFailure(server, params, specialParams, 'memos data error')
      })

      it('0150\t发起带无效memo的交易_02: memo内容使整个交易内容超过900K', function () {
        //memo内容使整个交易内容超过900K
        let memos = "E5A4A7E5AEB6E5A5BD"
        for(let i = 0; i < 18; i++){
          memos += memos;
        }
        let specialParams = {}
        specialParams.fee = data.defaultFee
        specialParams.memos = memos
        return checkMemosFailure(server, params, specialParams, 'memos data error')
      })

    })

    describe('测试交易fee', function (){

      it('0160\t发起带有效fee的交易_01: fee为默认值12', function () {
        let specialParams = {}
        specialParams.fee = data.defaultFee
        return checkFeeSuccess(server, params, specialParams, specialParams.fee)
      })

      it('0160\t发起带有效fee的交易_01: fee为null', function () {
        let specialParams = {}
        specialParams.fee = null
        return checkFeeSuccess(server, params, specialParams, data.defaultFee)
      })

      it('0170\t发起带有效fee的交易_02: fee比12小，但是足以发起成功的交易', function () {
        let specialParams = {}
        specialParams.fee = 11
        return checkFeeSuccess(server, params, specialParams, specialParams.fee)
      })

      it('0180\t发起带有效fee的交易_03\n: fee比12大但小于钱包余额', function () {
        let specialParams = {}
        specialParams.fee = 110
        return checkFeeSuccess(server, params, specialParams, specialParams.fee)
      })

      it('0190\t发起带无效fee的交易_01\n: fee比12小（比如5），但是不足以发起成功的交易\n', function () {
        let specialParams = {}
        specialParams.fee = 5
        return checkFeeFailure(server, params, specialParams, 'tecINSUFF_FEE Insufficient balance to pay fee')
      })

      it('0200\t发起带无效fee的交易_02\n: fee为0\n', function () {
        let specialParams = {}
        specialParams.fee = 0
        return checkFeeFailure(server, params, specialParams, 'tecINSUFF_FEE Insufficient balance to pay fee')
      })

      it('0210\t发起带无效fee的交易_03\n: fee为大于0的小数，比如12.5、5.5\n', function () {
        let specialParams = {}
        specialParams.fee = 12.5
        return checkFeeFailure(server, params, specialParams, 'tecINSUFF_FEE Insufficient balance to pay fee')
      })

      it('0220\t发起带无效fee的交易_04\n: fee为大于发起钱包' + params.type + '余额的整数\n', function () {
        let specialParams = {}
        specialParams.fee = 999999999999999
        return checkFeeFailure(server, params, specialParams, 'telINSUF_FEE_P Fee insufficient')
      })

      it('0230\t发起带无效fee的交易_05\n: fee为负数，比如-3.5、-555等\n', function () {
        let specialParams = {}
        specialParams.fee = -35
        return checkFeeFailure(server, params, specialParams, 'tecINSUFF_FEE Insufficient balance to pay fee')
      })

      it('0240\t发起带无效fee的交易_06\n: fee为字符串\n', function () {
        let specialParams = {}
        specialParams.fee = "35"
        return checkFeeFailure(server, params, specialParams, 'interface conversion: interface {} is string, not float64')
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
  function checkResponse(isSuccess, value){
    expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
    expect(value.status).to.equal(isSuccess ? status.success: status.error)
  }

  async function checkSendTxSuccess(server, value){
    checkResponse(true, value)
    expect(value).to.be.jsonSchema(schema.SENDTX_SCHEMA)
    let hash = value.result[0]
    await utility.timeout(data.defaultBlockTime)
    return checkSendTxResponse(server, hash)
  }

  function checkSendTxResponse(server, hash){
    return server.responseGetTx(hash)
        .then(function (value) {
          checkResponse(true, value)
          // expect(value.result).to.be.jsonSchema(schema.TX_SCHEMA)
          expect(value.result.hash).to.be.equal(hash)
          return value.result
        }).catch(function(error){
          logger.debug(error)
          expect(error).to.not.be.ok
        })
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

  //region memos check
  function checkMemosSuccess(server, params, specialParams){
    return Promise.resolve(sendTx(server, params, specialParams)).then(async function (value) {
      await checkSendTxSuccess(server, value).then((tx)=>{
        let memos = tx.Memos
        let expectedMemos = specialParams.memos

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
      })
    })
  }
  
  function checkMemosFailure(server, params, specialParams, expectedError){
    return Promise.resolve(sendTx(server, params, specialParams)).then(function (value) {
      checkResponse(false, value)
      expect(value.result).to.contains(expectedError)
    }, function (err) {
      expect(err).to.be.ok
    })
  }
  //endregion

  //region fee check
  function checkFeeSuccess(server, params, specialParams, expectedFee){
    return Promise.resolve(sendTx(server, params, specialParams)).then(async function (value) {
      await checkSendTxSuccess(server, value).then((tx)=>{
        expect(tx.Fee).to.be.equals(expectedFee.toString())
      })
    })
  }

  function checkFeeFailure(server, params, specialParams, expectedError){
    return Promise.resolve(sendTx(server, params, specialParams)).then(function (value) {
      checkResponse(false, value)
      expect(value.message).to.contains(expectedError)
    }, function (err) {
      expect(err).to.be.ok
    })
  }
  //endregion

  //region send tx
  async function sendTx(server, commonParams, specialParams){
    if(!commonParams.sequence){
      await server.responseGetAccount(commonParams.from).then((accountInfo)=>{
        commonParams.sequence = Number(accountInfo.result.Sequence)
      })
    }
    return sendTxWithSequence(server, commonParams, specialParams)
  }

  function sendTxWithSequence(server, commonParams, specialParams){
    return Promise.resolve(server.responseSendTxWithSequence(
        commonParams.from,
        commonParams.secret,
        commonParams.sequence,
        commonParams.to,
        commonParams.value,
        specialParams.fee,
        specialParams.memos,
    )).then(async function (value) {
      if(value.status === status.success){
        commonParams.sequence++ //if send tx successfully, then sequence need plus 1
      }
      return value
    })
  }
  //endregion

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
    return new Buffer(hex, 'hex').toString('utf8')
  }

  function string2hex(string){
    return new Buffer(string, 'base64').toString('hex')
  }

  function isHex(string){

  }

  // endregion

})
