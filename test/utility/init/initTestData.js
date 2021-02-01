//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const { modes } = require("../../config/config")
const { addresses, accounts } = require("../../testData/testData")
const utility = require("../../framework/testUtility.js")
//endregion

let mode = modes[0]
let server = mode.server
server.init(mode)

let root = addresses.rootAccount.address
let rootSecret = addresses.rootAccount.secret
// initTestDataForSwtclib()

chargeMain(
    'j9t5tjAawNoAxgn7FudkaKTo7GjD3HqvtH',
    '',
    '',
    30,
    null,
    0)

async function initTestDataForSwtclib(){
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

async function chargeMain(from, secret, to, value, sequence, waitSpan){
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

function chargeOnebyoneForSwtclib(address, value, sequence){
    return chargeMain(root, rootSecret, address, value, sequence, 10000)
}

