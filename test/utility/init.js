const { allModes } = require("../config")
const AccountsDealer = require('./accountsDealer')

let dealer = new AccountsDealer()
dealer.startInit()
// dealer.initAndChargeAccounts(allModes[1])
// init(allModes[1])
