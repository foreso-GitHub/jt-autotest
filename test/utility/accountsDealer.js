//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const fs = require('fs')
const { modes, allModes, configCommons } = require("../config")
const consts = require("../../lib/base/consts.js")
const Charger = require('./charger')
let { modeAccounts } = require("../testData/accounts")
//endregion

const ACCOUNT_COUNT = 15
const ACCOUNT_MIN_BALANCE = 50*1000000
const ACCOUNT_CHARGE_AMOUNT = 100
let charger = new Charger()
let root = {}
let server

function accountsDealer() {

    //region create accounts

    function init(mode) {
        root = mode.root
        server = mode.server
        server.init(mode)
    }

    accountsDealer.prototype.create = async function(mode) {
        init(mode)
        let accounts = await createAccounts(mode.server, 15)
        let accountsJsonString = JSON.stringify(accounts)
        fs.writeFileSync(mode.accountsJsonPath, accountsJsonString);
        let jsString = 'let accounts = ' + accountsJsonString + '\r\nmodule.exports = { accounts }'
        fs.writeFileSync(mode.accountsJsPath, jsString);
        // let newAccounts = await this.loadAccounts(mode.accountsJsonPath)
        return accounts
    }

    async function createAccounts(server, count){
        let accounts = []
        accounts.push(root)
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

    function createWallet(server) {
        return new Promise((resolve, reject) => {
            server.getResponse(server, consts.rpcFunctions.createWallet, []).then(async function (result) {
                resolve({account: {address: result.result[0].address, secret: result.result[0].secret}, success: true})
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
                secret:accounts[i++].secret,
            },
            walletAccount:{
                address:accounts[i].address,
                secret:accounts[i++].secret,
            },
            balanceAccount:{
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
        let accounts = findModeAccounts(modeAccounts, mode.name)
        return this.getAddresses(accounts)
    }

    //endregion

    //region init
    //init accounts, and send swtc in them.
    accountsDealer.prototype.initAndChargeAccounts = async function(mode){
        let accounts = await this.loadAccounts(mode.accountsJsonPath)
        if (accounts.length < ACCOUNT_COUNT) {
            await this.create(mode)
            accounts = await this.loadAccounts(mode.accountsJsonPath)
        }
        let server = mode.server
        server.init(mode)
        charger.chargeBasedOnBalance(server, accounts[0], accounts, ACCOUNT_MIN_BALANCE, ACCOUNT_CHARGE_AMOUNT)
    }

    accountsDealer.prototype.initAccounts = async function(modes){
        return new Promise((resolve, reject) =>{
            if(!modeAccounts){
                modeAccounts = []
            }
            let needSaveAccountsJsFile = false
            let needCreateMode = []
            let checkedCount = 0
            modes.forEach(async mode=>{
                let accounts = findModeAccounts(modeAccounts, mode.name)
                if (accounts == null){
                    needCreateMode.push(mode)
                    needSaveAccountsJsFile = true
                }
                checkedCount++
                if(checkedCount == modes.length){
                    if(needCreateMode.length==0){
                        resolve(modeAccounts)
                    }
                    let createCount = 0
                    for(let i=0;i<needCreateMode.length;i++) {
                        let createMode = needCreateMode[i]
                        let newModeAccount = await createNewAccounts(createMode)
                        modeAccounts.push(newModeAccount)
                        createCount++
                        if(createCount == needCreateMode.length) {
                            if(needSaveAccountsJsFile){
                                await saveAccountJsFile(modeAccounts, configCommons.accounts_js_file_path)
                                resolve(modeAccounts)
                            }
                        }
                    }
                }
            })
        })
    }

    async function createNewAccounts(createMode){
        init(createMode)
        let accounts = await createAccounts(createMode.server, 15)
        let newModeAccount = {}
        newModeAccount.modeName = createMode.name
        newModeAccount.accounts = accounts
        return newModeAccount
    }

    function findModeAccounts(modeAccounts, modeName){
        let accounts = null
        let totalCount = modeAccounts.length
        let count = 0
        for(i=0;i<totalCount;i++){
            modeAccount=modeAccounts[i]
            if(modeAccount.modeName == modeName){
                accounts = modeAccount.accounts
            }
            count++
            if(totalCount == count){
                return accounts
            }
        }
    }

    function saveAccountJsFile(modeAccounts, filePath){
        return new Promise(async (resolve, reject) =>{
            let destFilePath = configCommons.test_data_backup_path
                + 'accounts_backup_' + (new Date()).toDateString() + '_' + (new Date()).getTime() + '.js'
            await copyFile(filePath, destFilePath)  //backup
            let fileString = 'let modeAccounts = ' + JSON.stringify(modeAccounts) + '\r\nmodule.exports = { modeAccounts }'
            fs.writeFile(filePath, fileString, function (err) {
                if (err) {
                    logger.debug(err)
                    reject(err)
                } else {
                    logger.debug('Accounts js saved: ' + filePath)
                    resolve(modeAccounts)
                }
            })
        })
    }

    function copyFile(srcFilePath, destFilePath){
        return new Promise((resolve, reject) =>{
            fs.copyFile(srcFilePath, destFilePath,function(err){
                if(err) {
                    console.log('Copy file error: ' + err)
                    reject(err)
                }
                else {
                    console.log('Copy file succeed! From [' + srcFilePath + '] to [' + destFilePath + ']!')
                    resolve(destFilePath)
                }
            })
        })
    }

    accountsDealer.prototype.chargeAccounts = async function(modes){
        for(let i=0;i<modes.length;i++) {
            let mode = modes[i]
            let server = mode.server
            server.init(mode)
            let accounts = findModeAccounts(modeAccounts, mode.name)
            await charger.chargeBasedOnBalance(server, accounts[0], accounts, ACCOUNT_MIN_BALANCE, ACCOUNT_CHARGE_AMOUNT)
        }

    }

    accountsDealer.prototype.startInit = async function(){
        await this.initAccounts(allModes)
        this.chargeAccounts(allModes)
    }
    //endregion

}

module.exports = accountsDealer
