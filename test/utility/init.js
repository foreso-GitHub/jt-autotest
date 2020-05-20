const { allModes } = require("../config")
const AccountsDealer = require('./accountsDealer')

let dealer = new AccountsDealer()
dealer.initAndChargeAccounts(allModes[1])
// init(allModes[1])
// charge(allModes[1])

// async function init(mode){
//     await accountsDealer.create(mode)
//     let accounts = await accountsDealer.loadAccounts(mode.accountsJsonPath)
//     let server = mode.server
//     server.init(mode)
//     charger.chargeForNewChain(server, accounts, '10000')
// }

// async function init(mode) {
//     let accounts = await accountsDealer.loadAccounts(mode.accountsJsonPath)
//     if (accounts.length < ACCOUNT_COUNT) {
//         await accountsDealer.create(mode)
//         accounts = await accountsDealer.loadAccounts(mode.accountsJsonPath)
//     }
//     let server = mode.server
//     server.init(mode)
//     charger.chargeBasedOnBalance(server, accounts[0], accounts, ACCOUNT_MIN_BALANCE, ACCOUNT_CHARGE_AMOUNT)
// }

// async function charge(mode){
//     let accounts = await dealer.loadAccounts(mode.accountsJsonPath)
//     let server = mode.server
//     server.init(mode)
//     charger.chargeBasedOnBalance(server, accounts[0], accounts, ACCOUNT_MIN_BALANCE, ACCOUNT_CHARGE_AMOUNT)
// }

