//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const { allModes } = require("../config")
const utility = require("./testUtility.js")
//endregion

let mode = allModes[0]
let server = mode.server
server.init(mode)

// initTestDataForSwtclib()

// chargeMain(
//     'j9t5tjAawNoAxgn7FudkaKTo7GjD3HqvtH',
//     '',
//     '',
//     30,
//     null,
//     0)

function charger() {
    async function chargeForSwtclib(){
        // let value = "100000000"
        let value = '0.000001'
        let totalCount = accounts.length
        let count = 0
        for(let account of accounts){
            await chargeOnebyoneForSwtclib(account.address, value, null)
                .then(function(result){
                    logger.debug(JSON.stringify(result))
                    count++
                    if(count == totalCount){
                        server.disconnect()
                    }
                })
        }
    }

    charger.prototype.chargeForNewChain = async function(accounts, value){
        let root = accounts[0].address
        let rootSecret = accounts[0].secret
        await server.responseGetAccount(root).then(async function(response){
            let sequence = response.result.Sequence
            for(let account of accounts){
                await charge(root, rootSecret, account.address, value, sequence++, 0)
                    .then(function(result){logger.debug(JSON.stringify(result))})
            }
        })
    }

    async function charge(from, secret, to, value, sequence, waitSpan){
        let params = server.createTxParams(from, secret, sequence, to, value, null, null,
            null, null, null, null, null, null, null)
        return new Promise((resolve, reject) => {
            server.responseSendTx(params).then(async function (result) {
                logger.debug(JSON.stringify((result)))
                await utility.timeout(waitSpan)
                resolve({from: from, to: to, value: value, success: true})
            }).catch(function(error){
                reject({from: from, to: to, value: value, success: false, message: error})
                //return {address: address, value: value, success: false, message: error}
            })
        })
    }

    function chargeOnebyoneForNewChain(address, value, sequence){
        return chargeMain(root, rootSecret, address, value, sequence, 5000)
    }

    function chargeOnebyoneForSwtclib(address, value, sequence){
        return chargeMain(root, rootSecret, address, value, sequence, 10000)
    }

    function chargeTogether(address, value, sequence){
        return charge(root, rootSecret, address, value, sequence, 0)
    }
}

module.exports = charger