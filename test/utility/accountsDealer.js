//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const fs = require('fs');
// const utility = require("./testUtility.js")
const { allModes } = require("../config")
const consts = require("../../lib/base/consts.js")
//endregion

let root = {}
let jsonPath = ''
let server

function accountsDealer() {

    function init(mode) {
        root = mode.root
        jsonPath = mode.accountsJsonPath
        server = mode.server
        server.init(mode)
    }

    accountsDealer.prototype.createDefault = function() {
        return this.create(allModes[0])
    }

    accountsDealer.prototype.create = async function(mode) {
        init(mode)
        let accounts = await createAccounts(15)
        let accountsJsonString = JSON.stringify(accounts)
        fs.writeFileSync(mode.accountsJsonPath, accountsJsonString);
        let jsString = 'let accounts = ' + accountsJsonString + '\r\nmodule.exports = { accounts }'
        fs.writeFileSync(mode.accountsJsPath, jsString);
        // let newAccounts = await this.loadAccounts(mode.accountsJsonPath)
        return accounts
    }

    // accountsDealer.prototype.createAccounts = async function(count) {
    async function createAccounts(count){
        let accounts = []
        accounts.push(root)
        for (let i = 1; i < count; i++) {
            let result = await createWallet()
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

    accountsDealer.prototype.saveAccounts = function(accounts, jsonPath) {
        return new Promise((resolve, reject) =>{
            let accountsJsonString = 'let accounts = ' + JSON.stringify(accounts)
            // fs.writeFileSync(newfilepath, JSON.stringify(filestr));
            // {'flag':'a'},
            fs.writeFile(jsonPath, accountsJsonString, function (err) {
                if (err) {
                    logger.debug(err)
                    reject(err)
                } else {
                    logger.debug('Accounts json saved: ' + jsonPath)
                    resolve(accounts)
                }
            })
        })
    }

    function createWallet() {
        return new Promise((resolve, reject) => {
            server.getResponse(consts.rpcFunctions.createWallet, []).then(async function (result) {
                resolve({account: {address: result.result[0].address, secret: result.result[0].secret}, success: true})
            }).catch(function (error) {
                reject({message: error, success: false})
            })
        })
    }

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

}

module.exports = accountsDealer
