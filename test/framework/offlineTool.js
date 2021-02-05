//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')

const Transaction = require('swtc-transaction-ext').Transaction
const WalletFactory = require('swtc-wallet').Factory
const SerializerFactory = require('swtc-serializer-ext').Factory
const Wallet = WalletFactory('jingtum')
const jser = SerializerFactory(Wallet)
const consts = require('../../test/framework/consts')
const utility = require('./testUtility')
//endregion

module.exports = offlineTool = {

    //region wallet
    createWallet: function(type){
        // let Keypair = Wallet.KeyPair
        // let seed = Keypair.generateSeed({ algorithm: type.toLowerCase() })
        // let account = Wallet.fromSecret(seed)
        let algorithm = type.toLowerCase()
        let account = Wallet.generate({ algorithm: algorithm })
        return account
    },
    //endregion

    //region sign

    _signTransaction: async function(txParam){

        let tx_json = {}
        tx_json.Account = txParam.from
        tx_json.Destination = txParam.to
        let rawValue = utility.parseShowValue(txParam.value)
        // tx_json.Amount = rawValue.amount
        tx_json.Amount = {
            value: rawValue.amount,
            currency: rawValue.symbol,
            issuer: rawValue.issuer
        }
        if(txParam.invoice) tx_json.Invoice = txParam.invoice
        tx_json.Sequence = Number(txParam.sequence)
        tx_json.Fee = txParam.fee ? txParam.fee: "10"
        tx_json.TransactionType = txParam.type ? txParam.type : "Payment"
        // tx_json.Flags = txParam.flags ? txParam.flags : 0

        try {
            logger.debug(JSON.stringify(tx_json))
            const wt = new Wallet(txParam.secret)
            tx_json.SigningPubKey = wt.getPublicKey()
            const prefix = 0x53545800
            const hash = jser.from_json(tx_json).hash(prefix)
            tx_json.TxnSignature = wt.signTx(hash)
            tx_json.blob = jser.from_json(tx_json).to_hex()
            return tx_json.blob
        }
        catch (error) {
            logger.error(error)
        }

    },

    _signTransaction_1: async function(txParam) {
        let rawValue = utility.parseShowValue(txParam.value)
        let tx = Transaction.buildPaymentTx({
            account: txParam.from,
            to: txParam.to,
            amount: {
                value: rawValue.amount,
                currency: rawValue.symbol,
                issuer: rawValue.issuer
            }
        }, {_token:""});
        tx.setSecret(txParam.secret)
        if(txParam.invoice) tx.setInvoice(txParam.invoice)
        tx.setSequence(txParam.sequence)
        tx.setFee(txParam.fee ? txParam.fee: "10")

        if(txParam.data && txParam.data.length > 0){
            for(let i = 0; i < txParam.data.length; i ++){
                tx.addMemo(txParam.data[i], 'hex')
            }
        }

        for(let i = 0; i < txParam.memos.length; i ++){
            tx.addMemo(txParam.memos[i], 'hex')
        }

        let txBlob = tx.signPromise(txParam.secret)
        // logger.debug('sign', txBlob)
        return txBlob
    },

    signTransaction: async function(txParams) {
        let l = txParams.length
        let blobs = new Array(l)
        for(let i = 0; i < l; i ++){
            blobs[i] = await offlineTool._signTransaction(txParams[i])
        }
        return blobs
    },

    //endregion

}



