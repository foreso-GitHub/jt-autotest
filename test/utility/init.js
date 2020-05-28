const { allModes } = require("../config")
const utility = require('../framework/testUtility')
const AccountsDealer = require('./accountsDealer')
const ChainDataCreator = require('./chainDataCreator')
let dealer = new AccountsDealer()
let creator = new ChainDataCreator()

init()

async function init(){
    let modeAccounts = await dealer.startInit()
    await utility.timeout(11000)  //wait for charge finish
    await creator.create(allModes, modeAccounts, false)
}



