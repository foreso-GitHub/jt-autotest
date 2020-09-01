const { allModes } = require("../../config/config")
const utility = require('../../framework/testUtility')
const AccountsDealer = require('./accountsDealer')
const ChainDataCreator = require('./chainDataCreator')
let dealer = new AccountsDealer()
let creator = new ChainDataCreator()

init()

async function init(){
    let modeAccounts = await dealer.startInit(allModes)
    logger.info('Wait for 11 seconds and then start to create chain data ...')
    await utility.timeout(11000)  //wait for charge finish

    // let modeAccounts = require('../testData/accounts')
    await creator.create(allModes, modeAccounts, false)
}



