//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const { allModes } = require("../config")
const utility = require("./testUtility.js")
//endregion

// let mode = allModes[0]
// let server = mode.server
// server.init(mode)

// initTestDataForSwtclib()

// chargeMain(
//     'j9t5tjAawNoAxgn7FudkaKTo7GjD3HqvtH',
//     '',
//     '',
//     30,
//     null,
//     0)

function charger() {

    charger.prototype.chargeForNewChain = async function(server, accounts, value){
        let root = accounts[0].address
        let rootSecret = accounts[0].secret
        await server.responseGetAccount(server, root).then(async function(response){
            let sequence = response.result.Sequence
            for(let account of accounts){
                await charge(server, root, rootSecret, account.address, value, sequence++, 0)
                    .then(function(result){logger.debug(JSON.stringify(result))})
            }
        })
    }

    async function charge(server, from, secret, to, value, sequence, waitSpan){
        let params = server.createTxParams(from, secret, sequence, to, value, null, null,
            null, null, null, null, null, null, null)
        return new Promise((resolve, reject) => {
            server.responseSendTx(server, params).then(async function (result) {
                logger.debug(JSON.stringify((result)))
                await utility.timeout(waitSpan)
                resolve({from: from, to: to, value: value, success: true})
            }).catch(function(error){
                reject({from: from, to: to, value: value, success: false, message: error})
                //return {address: address, value: value, success: false, message: error}
            })
        })
    }

}

module.exports = charger