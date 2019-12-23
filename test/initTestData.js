let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')

const { accounts, modes } = require("./config")
var utility = require("./testUtility.js")

let mode = modes[0]  //9545
let server = mode.server
server.setUrl(mode.url)
let root = "root"
initTestData()

async function initTestData(){
    let value = "10000000000"
    for(let account of accounts){
        await charge(account.address, value)
            .then(function(result){logger.debug(JSON.stringify(result))})
    }

    // charge("jnrX7oqQLtF2Vi5tXpS8gNza2x75kgQmFp", "100")
    //     .then(function(result){logger.debug(JSON.stringify(result))})
}

async function charge(address, value){
    return Promise.resolve(server.responseSendTx(
        // root,
        "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
        "ss6iFshVyH7zZL2pGiQ4otrrd5uCg",
        address,
        value,
    )).then(async function (result) {
        await utility.timeout(5000)
        return {address: address, value: value, success: true}
    }).catch(function(error){
        return {address: address, value: value, success: false, message: error}
    })
}