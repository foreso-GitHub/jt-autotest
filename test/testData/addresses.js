let { accounts } = require('./accounts')

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

module.exports = { addresses }