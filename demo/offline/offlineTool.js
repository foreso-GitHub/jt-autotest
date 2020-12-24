const Transaction = require("swtc-transaction-ext").Transaction
const WalletFactory = require("swtc-wallet").Factory
// import { Factory as WalletFactory } from "swtc-wallet"
const Wallet = WalletFactory("jingtum")
const consts = require('../../test/framework/consts')

run()
let account = createWallet(consts.walletTypes.Ed25519)
console.log(JSON.stringify(account))

async function run(){
    let options = []
    options.push({
        from:'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh',
        secret:'snoPBjXtMeMyMHUVTgbuqAfg1SUTb',
        to:'jBAFWRUGRuWdT5R2tAZA49oytnQ3KXeQYH',
        sequence:'965',
        memos:[],
        id:'1',
    })

    let blobs = await signTransaction(options)
    console.log(JSON.stringify(blobs))
}

//region sign

async function _signTransaction(option) {
    let tx = Transaction.buildPaymentTx({
        account: option.from,
        to: option.to,
        amount: {
            value: 10,
            currency: "SWT",
            issuer:""
        }
    }, {_token:""});
    tx.setSecret(option.secret)
    if(option.invoice) tx.setInvoice(option.invoice)
    tx.setSequence(option.sequence)
    tx.setFee("10")

    if(option.data && option.data.length > 0){
        for(let i = 0; i < option.data.length; i ++){
            tx.addMemo(option.data[i], 'hex')
        }
    }

    for(let i = 0; i < option.memos.length; i ++){
        tx.addMemo(option.memos[i], 'hex')
    }

    let txBlob = await tx.signPromise(option.secret)
    console.log('sign', txBlob)

    return txBlob
}

async function signTransaction(options) {
    let l = options.length
    let blobs = new Array(l)
    for(let i = 0; i < l; i ++){
        blobs[i] = await _signTransaction(options[i])
    }
    return blobs
}

//endregion

//region wallet

function createWallet(type){
    // let Keypair = Wallet.KeyPair
    // let seed = Keypair.generateSeed({ algorithm: type.toLowerCase() })
    // let account = Wallet.fromSecret(seed)

    let algorithm = type.toLowerCase()
    let account = Wallet.generate({ algorithm: algorithm })
    return account
}

//endregion
