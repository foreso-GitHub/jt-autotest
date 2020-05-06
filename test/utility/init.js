const { allModes } = require("../config")
const accountsDealer = require('./accountsDealer')
const Charger = require('./charger')

init()

async function init(){
    let mode = allModes[0]
    let dealer = new accountsDealer()
    await dealer.create(mode)
    let accounts = await dealer.loadAccounts(mode.accountsJsonPath)
    let charger = new Charger()
    charger.chargeForNewChain(accounts, '10000')
}
