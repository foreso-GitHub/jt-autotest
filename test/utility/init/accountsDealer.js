//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const fs = require('fs')
const { commonPaths } = require("../../config/basicConfig")
const consts = require("../../framework/consts.js")
const Charger = require('./charger')
let { modeAccounts } = require("../../testData/accounts")
const utility = require("../../framework/testUtility.js")
//endregion

const ACCOUNT_COUNT = 100
const ACCOUNT_MIN_BALANCE = 50*1000000
const ACCOUNT_CHARGE_AMOUNT = 100
let charger = new Charger()
let root = {}
let server

function accountsDealer() {

    //region create accounts

    function init(mode) {
        root = mode.root
        root.nickName = 'root'
        server = mode.server
        server.init(mode)
    }

    async function createAccounts(server, count){
        let accounts = []
        //add fixed accounts
        accounts.push(root)
        accounts.push({
            "address": "jBAxWtNKqTRaL2hN6Gv48Zd4tPd7VUW3tZ",
            "secret": "ssdECu8uDPh4Pzb3P4LCSQoRmXMkM"
        })
        accounts.push({
            "address": "jHMf2pQVxVUH2hzLFWNDusSwPRavJhr9eY",
            "secret": "snAiaEDyeZgMyF4ouk4qzZC6PeV67"
        })
        accounts.push({
            "address": "jjan287EN3QLdvQYQHfB95jQwQJmLHXcWf",
            "secret": "snewKnpnywQgRWcfpbVdqBLMZarkN"
        })
        accounts.push({
            "address": "jfTd19eyWiXk7PVGmL1WXQwRptFRJAaZdH",
            "secret": "sh47QjJ1UDCJgTABP38qDoHEcgh6c"
        },)
        accounts.push({
            "address": "jhVgC7xhD3mHx63bb39ugRUDPfFzRzAsFJ",
            "secret": "shotUv2QzHXCaWtnsDJX1qRai4TRT"
        },)
        accounts.push({
            "address": "jPXRwGEVCrhQjUq4jJ4Ceedku6W9chRYB3",
            "secret": "sn2LxJUiJJ2YS2kQwgMESFevwTkmh"
        })

        //walletAccount, balanceAccount, nickNameSender, nickNameReceiver, 4 accounts need use createAccount, so to test nick name.
        for (let i = 1; i <= 4; i++) {
            let result = await createAccount(server)
            if (result.success) {
                accounts.push(result.account)
            } else {
                logger.debug(JSON.stringify((result)))
            }
        }

        //other accounts need use createWallet, so no nick name, not exists in jt node.
        for (let i = 1; i < count; i++) {
            let result = await createWallet(server)
            if (result.success) {
                accounts.push(result.account)
                // logger.debug(JSON.stringify((result)))
            } else {
                logger.debug(JSON.stringify((result)))
            }
        }
        // logger.debug('Create accounts: ' + JSON.stringify(accounts))
        return accounts
    }

    accountsDealer.prototype.loadAccounts = function(jsonPath) {
        return new Promise((resolve, reject) =>{
            let accountsJsonString = fs.readFileSync(jsonPath)
            let accounts = JSON.parse(accountsJsonString)
            logger.debug('Load accounts: ' + JSON.stringify(accounts))
            resolve(accounts)
        })
    }

    function createAccount(server) {
        return new Promise((resolve, reject) => {
            let name = utility.getDynamicTokenName().name
            server.getResponse(server, consts.rpcFunctions.createAccount, [name]).then(async function (result) {
                resolve({account: {address: result.result[0].address, secret: result.result[0].secret, nickName: name,}, success: true})
            }).catch(function (error) {
                reject({message: error, success: false})
            })
        })
    }

    function createWallet(server) {
        return new Promise((resolve, reject) => {
            server.getResponse(server, consts.rpcFunctions.createWallet, []).then(async function (result) {
                resolve({account: {address: result.result[0].address, secret: result.result[0].secret,}, success: true})
            }).catch(function (error) {
                reject({message: error, success: false})
            })
        })
    }

    //endregion

    //region convert accounts to addresses
    //output addresses based on accounts.  addresses is the real account data used in test.
    accountsDealer.prototype.getAddresses = function(accounts){

        //inactive account, do not send swt in them!
        let inactiveAccounts = [
            {
                address:"j4tBKPidB9iEJMqdatq7rbh14nPhAbCyfg",
                secret:"sawLfQ4sDGHAu65pe11Uvv5HkvDcG",
                nickName: "inactive_1",
            },
            {
                address:"j4SnwaukEx7VaRhwaQGzJJ9LF7XAbJhDzv",
                secret:"shU9YLun779XCUa91SkRe5z8ZG3LZ",
                nickName: "notexist1",
            },
        ]

        let i = 0
        let addresses = {
            rootAccount:{
                address:accounts[i].address,
                secret:accounts[i].secret,
                nickName: accounts[i++].nickName,
            },
            fixedSender1:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            fixedReceiver1:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            fixedSender2:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            fixedReceiver2:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            fixedSender3:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            fixedReceiver3:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            walletAccount:{
                address:accounts[i].address,
                secret:accounts[i].secret,
                nickName: accounts[i++].nickName,
            },
            balanceAccount:{
                address:accounts[i].address,
                secret:accounts[i].secret,
                nickName: accounts[i++].nickName,
            },
            nickNameSender:{
                address:accounts[i].address,
                secret:accounts[i].secret,
                nickName: accounts[i++].nickName,
            },
            nickNameReceiver:{
                address:accounts[i].address,
                secret:accounts[i].secret,
                nickName: accounts[i++].nickName,
            },
            sender1:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            receiver1:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            sender2:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            receiver2:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            sender3:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            receiver3:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            sequence1:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            sequence2:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            sequence3:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            sequence4:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            sequence5:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            pressureAccount:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            pressureAccount1:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            pressureAccount2:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            pressureAccount3:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            pressureAccount4:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            pressureAccount5:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            pressureAccount6:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            pressureAccount7:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            pressureAccount8:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            pressureAccount9:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            pressureAccount10:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            pressureAccount11:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            pressureAccount12:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            pressureAccount13:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            pressureAccount14:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            pressureAccount15:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            pressureAccount16:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            pressureAccount17:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            pressureAccount18:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            pressureAccount19:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            pressureAccount20:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            inactiveAccount1:{
                address:inactiveAccounts[0].address,
                secret:inactiveAccounts[0].secret,
                nickName:inactiveAccounts[0].nickName,
            },
            wrongFormatAccount1:{
                address:"inactiveAccounts[0].address",
                secret:"inactiveAccounts[0].secret",
                nickName:"inactiveAccounts[0].nickName",
            },
            defaultIssuer:{
                address: 'jjjjjjjjjjjjjjjjjjjjjhoLvTp',
                secret: ''
            },
        }

        return addresses
    }

    accountsDealer.prototype.getAddressesByMode = function(modeAccounts, mode){
        // let accounts = findModeAccounts(modeAccounts, mode.accountsName)
        let accounts = utility.findAccounts(modeAccounts, mode.accountsName).accounts
        return this.getAddresses(accounts)
    }

    //endregion

    //region init
    //init accounts, and send swtc in them.
    accountsDealer.prototype.initAccounts = async function(modes){
        return new Promise((resolve, reject) =>{
            let result = {}
            if(!modeAccounts){
                modeAccounts = []
            }
            let needSaveAccountsJsFile = false
            let needCreateMode = []
            let checkedCount = 0
            modes.forEach(async mode=>{
                // let accounts = utility.findMode(modeAccounts, mode.accountsName)
                if (utility.findAccounts(modeAccounts, mode.accountsName) == null){ //not exist in current accounts
                    if(utility.findAccounts(needCreateMode, mode.accountsName) == null){  //not exist in the accounts will be created
                        needCreateMode.push(mode)
                        needSaveAccountsJsFile = true
                    }
                }
                checkedCount++
                if(checkedCount == modes.length){
                    if(needCreateMode.length==0){
                        result.modeAccounts = modeAccounts
                        result.needCreateModes = needCreateMode
                        resolve(result)
                    }
                    let createCount = 0
                    for(let i=0;i<needCreateMode.length;i++) {
                        let createMode = needCreateMode[i]
                        let newModeAccount = await createNewAccounts(createMode)
                        modeAccounts.push(newModeAccount)
                        createCount++
                        if(createCount == needCreateMode.length) {
                            if(needSaveAccountsJsFile){
                                await utility.saveJsFile('modeAccounts', modeAccounts, commonPaths.accounts_js_file_path)
                                result.modeAccounts = modeAccounts
                                result.needCreateModes = needCreateMode
                                resolve(result)
                            }
                        }
                    }
                }
            })
        })
    }

    async function createNewAccounts(createMode){
        init(createMode)
        let accounts = await createAccounts(createMode.server, ACCOUNT_COUNT)
        let newModeAccount = {}
        newModeAccount.accountsName = createMode.accountsName
        newModeAccount.accounts = accounts
        return newModeAccount
    }

    // function findModeAccounts(modeAccounts, modeName){
    //     let accounts = []
    //     let mode = utility.findMode(modeAccounts, modeName)
    //     if(mode && mode.accounts){
    //         accounts = mode.accounts
    //     }
    //     return accounts
    // }

    accountsDealer.prototype.chargeAccounts = async function(modes){
        for(let i = 0; i < modes.length; i++) {
            let mode = modes[i]
            let server = mode.server
            server.init(mode)
            // let accounts = findModeAccounts(modeAccounts, mode.accountsName)
            let accounts = utility.findAccounts(modeAccounts, mode.accountsName).accounts
            await charger.chargeBasedOnBalance(server, accounts[0], accounts, ACCOUNT_MIN_BALANCE, ACCOUNT_CHARGE_AMOUNT)
        }
    }

    accountsDealer.prototype.startInit = async function(allModes){
        let result = await this.initAccounts(allModes)
        await this.chargeAccounts(result.needCreateModes)
        return result.modeAccounts
    }
    //endregion

}

module.exports = accountsDealer
