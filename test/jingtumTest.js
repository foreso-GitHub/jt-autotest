const chai = require("chai")
chai.use(require("chai-json-schema"))
const expect = chai.expect
var assert = require('assert')

const { servers, chains, addresses, status } = require("./config")
const schema = require("./schema.js")

describe('jingtum test', function () {
  this.timeout(10000)

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

  for(let server of servers){
    describe('jingtum test mode: ' + server.getName(), function () {

      it('getBlockNumber', function () {
        return Promise.resolve(get2BlockNumber(server)).then(function (value) {
          expect(value.blockNumber2 - value.blockNumber1).to.be.most(2)
          expect(value.blockNumber2 - value.blockNumber1).to.be.least(1)
        }, function (err) {
          assert.ok(!err)
        })
      })

      it('get balance', function () {
        return Promise.resolve(server.getBalance(addresses.balanceAccount.address)).then(function (value) {
          expect(Number(value)).to.be.above(0)
        }, function (err) {
          assert.ok(!err)
        })
      })

      //region schema check
      it('check schema: getBlockNumber', function () {
        return Promise.resolve(server.responseBlockNumber()).then(function (value) {
          expect(value).to.be.jsonSchema(schema.BLOCKNUMBER_SCHEMA)
          expect(value.status).to.equal(status.success)
        }, function (err) {
          assert.ok(!err)
        })
      })

      it('check schema: getBalance', function () {
        return Promise.resolve(server.responseBalance(addresses.balanceAccount.address)).then(function (value) {
          expect(value).to.be.jsonSchema(schema.BLANCE_SCHEMA)
          expect(value.status).to.equal(status.success)
        }, function (err) {
          assert.ok(!err)
        })
      })
      //endregion


    })
  }

})
