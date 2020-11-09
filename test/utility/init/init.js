//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const { allModes } = require("../../config/config")
const utility = require('../../framework/testUtility')
const AccountsDealer = require('./accountsDealer')
const ChainDataCreator = require('./chainDataCreator')
let dealer = new AccountsDealer()
let creator = new ChainDataCreator()
//endregion

init()

async function init(){
    // await init_new()
    await init_based_on_existed_accounts()
}

//no existing data, create new accounts and then create new chain data based on the new accounts.
async function init_new(){
    let modeAccounts = await dealer.startInit(allModes)
    logger.info('Wait for 11 seconds and then start to create chain data ...')
    await utility.timeout(11000)  //wait for charge finish
    await creator.create(allModes, modeAccounts, false)
}

//suppose the accounts has been created.  just create chain data based on existed accounts.
async function init_based_on_existed_accounts(){
    let modeAccounts = require('../../testData/accounts').modeAccounts
    await creator.create(allModes, modeAccounts, false)
}


