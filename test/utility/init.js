const { allModes } = require("../config")
const accountsDealer = require('./accountsDealer')
const Charger = require('./charger')

let mode = allModes[0]
let dealer = new accountsDealer()
let charger = new Charger()
// init(mode)
charge(allModes[1])

async function init(mode){
    await dealer.create(mode)
    let accounts = await dealer.loadAccounts(mode.accountsJsonPath)
    let server = mode.server
    server.init(mode)
    charger.chargeForNewChain(server, accounts, '10000')
}

async function charge(mode){
    let accounts = await dealer.loadAccounts(mode.accountsJsonPath)
    let server = mode.server
    server.init(mode)
    charger.chargeForNewChain(server, accounts, '10000')
}

