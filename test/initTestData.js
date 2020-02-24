let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')

const { modes } = require("./config")
const { addresses, accounts } = require("./testData")
const utility = require("./testUtility.js")

let mode = modes[1]
let server = mode.server
server.init(mode)

let root = addresses.rootAccount.address
let rootSecret = addresses.rootAccount.secret
initTestDataForSwtclib()
// chargeMain('j9t5tjAawNoAxgn7FudkaKTo7GjD3HqvtH', 'ss56xiijXd5RkMn677D2mwuHfYe48', root, 10000, 0, 0)

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


async function initTestDataForNewChain(){
    // let value = "100000000"
    let value = '30'
    await server.responseGetAccount(root).then(async function(response){
        let sequence = response.result.Sequence
        for(let account of accounts){
            await chargeTogether(account.address, value, sequence++)
                .then(function(result){logger.debug(JSON.stringify(result))})
        }
    })

    // charge("jnrX7oqQLtF2Vi5tXpS8gNza2x75kgQmFp", "100")
    //     .then(function(result){logger.debug(JSON.stringify(result))})
}

async function charge(address, value, sequence){
    let params = server.createTxParams(root, secret, sequence, address, value, null, 'init test data: charge',
        null, null, null, null, null, null, null)
    return Promise.resolve(server.responseSendTx(params)).then(async function (result) {
        await utility.timeout(5000)
        return {address: address, value: value, success: true}
    }).catch(function(error){
        return {address: address, value: value, success: false, message: error}
    })
}

function charge2(address, value, sequence){
    return Promise.resolve(server.responseSendTx(
        root,
        secret,
        //"j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
        //"ss6iFshVyH7zZL2pGiQ4otrrd5uCg",
        address,
        value,
        12,
        null,
        sequence
    )).then(async function (result) {
        return {address: address, value: value, success: true}
    }).catch(function(error){
        return {address: address, value: value, success: false, message: error}
    })
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

function chargeOnebyoneForNewChain(address, value, sequence){
    return chargeMain(root, rootSecret, address, value, sequence, 5000)
}

function chargeOnebyoneForSwtclib(address, value, sequence){
    return chargeMain(root, rootSecret, address, value, sequence, 10000)
}

function chargeTogether(address, value, sequence){
    return chargeMain(root, rootSecret, address, value, sequence, 0)
}