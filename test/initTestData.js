let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')

const { accounts, addresses, modes } = require("./config")
var utility = require("./testUtility.js")

let mode = modes[0]  //9545
let server = mode.server
server.setUrl(mode.url)
let root = addresses.rootAccount.address
let secret = addresses.rootAccount.secret
initTestData()

async function initTestData(){
    let value = "100000000"
    await server.responseGetAccount(root).then(async function(response){
        let sequence = response.result.Sequence
        for(let account of accounts){
            await charge2(account.address, value, sequence++)
                .then(function(result){logger.debug(JSON.stringify(result))})
        }
    })

    // charge("jnrX7oqQLtF2Vi5tXpS8gNza2x75kgQmFp", "100")
    //     .then(function(result){logger.debug(JSON.stringify(result))})
}

async function charge(address, value, sequence){
    return Promise.resolve(server.responseSendTx(
        root,
        secret,
        //"j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
        //"ss6iFshVyH7zZL2pGiQ4otrrd5uCg",
        address,
        value,
        12,
        "init test data: charge",
        sequence
    )).then(async function (result) {
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