const chai = require("chai")
chai.use(require("chai-json-schema"))
const expect = chai.expect

let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default');

const { servers, chains, addresses, status, data, modes } = require("./config")
const schema = require("./schema.js")

describe('jingtum test', function () {
  this.timeout(20000)

  for(let mode of modes){

    let server = mode.server
    server.setUrl(mode.url)

    describe('jingtum test mode: ' + server.getName(), function () {

      describe('test demo', function () {
        //region common test

        it('test create wallet', function () {
          return Promise.resolve(server.responseCreateWallet()).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.success)
            expect(value.result).to.be.jsonSchema(schema.WALLET_SCHEMA)
            expect(value.result.address).to.match(/^j/)
            expect(value.result.secret).to.match(/^s/)
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('test get balance', function () {
          return Promise.resolve(server.responseBalance(addresses.balanceAccount.address)).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.success)
            expect(value.result).to.be.jsonSchema(schema.BLANCE_SCHEMA)
            expect(Number(value.result.balance)).to.be.above(0)
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('test get block number', function () {
          return Promise.resolve(server.responseBlockNumber()).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.success)
            expect(value.result).to.be.jsonSchema(schema.BLOCKNUMBER_SCHEMA)
            expect(server.processBlockNumberResponse(value)).to.be.above(400000)
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
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.success)
            expect(value.result).to.be.jsonSchema(schema.TX_SCHEMA)
            expect(value.result.Account).to.be.equal(mode.tx1.Account)
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        //endregion

        //region send tx

        it.skip('test send transaction with string memo', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "1",
              ["test"]
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.success)
            expect(value).to.be.jsonSchema(schema.SENDTX_SCHEMA)
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
              [
                {
                  "type":"ok",
                  "format":"utf8",
                  "data":""
                }
              ]
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.success)
            expect(value).to.be.jsonSchema(schema.SENDTX_SCHEMA)
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        //endregion
      })

      describe('test by cases', function () {

        it('0010\t发起底层币有效交易_01', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "1",
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.success)
            expect(value).to.be.jsonSchema(schema.SENDTX_SCHEMA)
            //todo need check if the tx exists, check by hash
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0020\t发起底层币有效交易_02: 交易额填"1/swt"或“100/SWT”等', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "1/swt",
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.success)
            expect(value).to.be.jsonSchema(schema.SENDTX_SCHEMA)
            //todo need check if the tx exists, check by hash
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0030\t发起底层币无效交易_01: 没有秘钥', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              null,
              addresses.receiver1.address,
              "1",
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.error)
            expect(value.result).to.contains('No secret found for')
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0030\t发起底层币无效交易_01: 错误的秘钥1', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              '错误的秘钥',
              addresses.receiver1.address,
              "1",
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.error)
            expect(value.result).to.contains('Bad Base58 string')
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0030\t发起底层币无效交易_01: 错误的秘钥2', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret + '1',
              addresses.receiver1.address,
              "1",
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.error)
            expect(value.result).to.contains('Bad Base58 checksum')
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0040\t发起底层币无效交易_02: 错误的发起钱包地址（乱码字符串）', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address + '1',
              addresses.sender1.secret,
              addresses.receiver1.address,
              "1",
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.error)
            expect(value.result).to.contains('Bad account address:')
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0050\t发起底层币无效交易_03: 错误的接收钱包地址（乱码字符串）', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address + '1',
              "1",
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.error)
            expect(value.result).to.contains('Bad account address:')
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0060\t发起底层币无效交易_04: 交易额超过发起钱包余额', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "999999999999999",  //todo need check balance first
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.error)
            expect(value.message).to.contains('telINSUF_FEE_P Fee insufficient')
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0070\t发起底层币无效交易_05: 交易额为负数', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "-100",
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.error)
            expect(value.message).to.contains('temBAD_AMOUNT Can only send positive amounts')
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0080\t发起底层币无效交易_06: 交易额为空', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              null,
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.error)
            expect(value.result).to.contains('Invalid Number')
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0080\t发起底层币无效交易_06: 交易额为字符串', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "aawrwfsfs",
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.error)
            expect(value.result).to.contains('Invalid Number')
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0090\t发起底层币无效交易_07: 交易额为小于1的正小数', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "0.1",
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.error)
            expect(value.result).to.equal('value must be integer type')
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0100\t发起底层币无效交易_08: 交易额为大于1的小数', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "1.1",
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.error)
            expect(value.result).to.equal('value must be integer type')
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0110\t发起底层币无效交易_09: 交易额为负小数：-0.1、-1.23等', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "-1.23",
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.error)
            expect(value.result).to.equal('value must be integer type')
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0120\t发起带有效memo的交易_01: memo格式为："memos":["大家好"]', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "1",
              12,
              ["大家好"],
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.success)
            expect(value).to.be.jsonSchema(schema.SENDTX_SCHEMA)
            //todo need check if the tx exists, check by hash
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0130\t发起带有效memo的交易_02\n: memo格式为： "memos":[{"type":"ok","format":"utf8","data":"E5A4A7E5AEB6E5A5BD"}]', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "1",
              12,
              [{"type":"ok","format":"utf8","data":"E5A4A7E5AEB6E5A5BD"}],
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.success)
            expect(value).to.be.jsonSchema(schema.SENDTX_SCHEMA)
            //todo need check if the tx exists, check by hash
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0140\t发起带无效memo的交易_01\n: memo内容使整个交易内容超过900K', function () {

          //memo内容使整个交易内容超过900K
          let data = "E5A4A7E5AEB6E5A5BD"
          for(let i = 0; i < 18; i++){
            data += data;
          }

          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "1",
              12,
              [data],
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.error)
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0150\t发起带无效memo的交易_02: memo内容使整个交易内容超过900K', function () {

          //memo内容使整个交易内容超过900K
          let data = "E5A4A7E5AEB6E5A5BD"
          for(let i = 0; i < 18; i++){
            data += data;
          }

          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "1",
              12,
              [{"type":"ok","format":"utf8","data":data}],
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.error)
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0160\t发起带有效fee的交易_01: fee为默认值12', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "1",
              12,
              null,
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.success)
            expect(value).to.be.jsonSchema(schema.SENDTX_SCHEMA)
            //todo need check if the tx exists, check by hash
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0160\t发起带有效fee的交易_01: fee为null', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "1",
              null,
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.success)
            expect(value).to.be.jsonSchema(schema.SENDTX_SCHEMA)
            //todo need check if the tx exists, check by hash
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0170\t发起带有效fee的交易_02: fee比12小，但是足以发起成功的交易', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "1",
              11,
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.success)
            expect(value).to.be.jsonSchema(schema.SENDTX_SCHEMA)
            //todo need check if the tx exists, check by hash
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0180\t发起带有效fee的交易_03\n: fee比12大但小于钱包余额', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "1",
              110,
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.success)
            expect(value).to.be.jsonSchema(schema.SENDTX_SCHEMA)
            //todo need check if the tx exists, check by hash
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0190\t发起带无效fee的交易_01\n: fee比12小（比如5），但是不足以发起成功的交易\n', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "1",
              5,
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.error)
            expect(value.message).to.contains('tecINSUFF_FEE Insufficient balance to pay fee')
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0200\t发起带无效fee的交易_02\n: fee为0\n', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "1",
              0,
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.error)
            expect(value.message).to.contains('tecINSUFF_FEE Insufficient balance to pay fee')
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0210\t发起带无效fee的交易_03\n: fee为大于0的小数，比如12.5、5.5\n', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "1",
              12.5,
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.error)
            expect(value.message).to.contains('tecINSUFF_FEE Insufficient balance to pay fee')
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0220\t发起带无效fee的交易_04\n: fee为大于发起钱包底层币余额的整数\n', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "1",
              999999999999999,  //todo need check balance first
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.error)
            expect(value.message).to.contains('telINSUF_FEE_P Fee insufficient')
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0230\t发起带无效fee的交易_05\n: fee为负数，比如-3.5、-555等\n', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "1",
              -35,
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.error)
            expect(value.message).to.contains('tecINSUFF_FEE Insufficient balance to pay fee')
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        it('0240\t发起带无效fee的交易_06\n: fee为字符串\n', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "1",
              "35",
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.error)
            expect(value.result).to.contains('interface conversion: interface {} is string, not float64')
          }, function (err) {
            expect(err).to.be.ok
          })
        })

        afterEach(function() {
          //set timeout to ensure the next test which use the same sender address can pass the test
          return Promise.resolve(timeout(5000)).then(function (value) {
            logger.debug(value)
          }, function (err) {
            logger.debug(err)
          })
        });

      })

      describe.skip('test by case, working', function () {



        it('0240\t发起带无效fee的交易_06\n: fee为字符串\n', function () {
          return Promise.resolve(server.responseSendTx(
              addresses.sender1.address,
              addresses.sender1.secret,
              addresses.receiver1.address,
              "1",
              "35",
          )).then(function (value) {
            expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
            expect(value.status).to.equal(status.error)
            expect(value.result).to.contains('interface conversion: interface {} is string, not float64')
          }, function (err) {
            expect(err).to.be.ok
          })
        })



      })

    })
  }

  // region utility methods
  async function get2BlockNumber (server) {
    return new Promise(async (resolve, reject) => {
      let result = {}
      result.blockNumber1 = await server.getBlockNumber()
      setTimeout(
          async () => {
            result.blockNumber2 = await server.getBlockNumber()
            resolve(result)
          },5000
      )
    })
  }

  async function timeout (time) {
    return new Promise(async (resolve, reject) => {
      setTimeout(
          async () => {
            resolve('done!')
          },
          time
      )
    })
  }

  function promiseSendTx(from, secret, to, value, memo) {
    return Promise.resolve(server.responseSendTx(
        from,
        secret,
        to,
        value,
        memo,
    )).then(function (value) {
      // logger.debug(value)
      expect(value).to.be.jsonSchema(schema.RESPONSE_SCHEMA)
      expect(value.status).to.equal(status.success)
      expect(value).to.be.jsonSchema(schema.SENDTX_SCHEMA)
    }, function (err) {
      expect(err).to.be.ok
    })
  }

  // endregion

})
