const { allModes } = require("../config")
const AccountsDealer = require('./accountsDealer')
const ChainDataCreator = require('./chainDataCreator')
let dealer = new AccountsDealer()
let creator = new ChainDataCreator()

// dealer.startInit()
// creator.create(allModes, false)

