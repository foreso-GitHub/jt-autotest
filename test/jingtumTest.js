const chai = require("chai")
chai.use(require("chai-json-schema"))
const expect = chai.expect

const { servers, chains, addresses, status, data, modes } = require("./config")
const schema = require("./schema.js")

describe('jingtum test', function () {
  this.timeout(20000)

  for(let mode of modes){
    let server = mode.server
    server.setUrl(mode.url)
    describe('jingtum test mode: ' + server.getName(), function () {

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

      it('test send transaction with string memo', function () {
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
  }

  // region utility methods
  async function get2BlockNumber (server) {
    return new Promise(async (resolve, reject) => {
      var result = {}
      result.blockNumber1 = await server.getBlockNumber()
      setTimeout(
          async () => {
            result.blockNumber2 = await server.getBlockNumber()
            resolve(result)
          }, 5000)
    })
  }
  // endregion

})
