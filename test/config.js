var rpc = require('../app/rpc/interfaces.js')

const RPC_URL_7545 = 'http://139.198.191.254:7545/v1/jsonrpc'
const RPC_URL_9545 = 'http://139.198.177.59:9545/v1/jsonrpc'

let rpc_7545 = new rpc()
let rpc_9545 = new rpc()
let servers = [rpc_7545, rpc_9545]
let chains = ['swt', 'bwt']

let status = {
    success: "success",
    error: "error",
}

let addresses = {
    rootAccount:{
      address:"jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh",
      secret:""
    },
    walletAccount:{
        address:"j3Go8eJjRD5yvZuZbrGXXDcrACkxHgdaM8",
        secret:"shnWYMunzyrzfLAE4LWknxxST7mq8"
    },
    balanceAccount:{
        address:"j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
        secret:""
    },
    sender1:{
        address:"j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
        secret:"ss6iFshVyH7zZL2pGiQ4otrrd5uCg"
    },
    receiver1:{
        address:"jjsbo9Yz5RTrKAWSWgNtEHdrviMtWYoqZ5",
        secret:""
    },
    sender2:{
        address:"jGPPk3jWd2NY1wStCHK27NDm61MES8Bhuf",
        secret:"ss5WvoCyjpryiuQ8ioENTccZoxPG6"
    },
    receiver2:{
        address:"jJMsY9dmkRfj1fGbft7kyXxJ3SyehPg1tG",
        secret:""
    },
    sender3:{
        address:"jDjvM2rrjgAsYEeFJsSvuXxkbYxZQpdEwu",
        secret:"shJTqjPJKsgTLDqCQ16nuALHSzjTd"
    },
    receiver3:{
        address:"",
        secret:""
    },

}

let data = {
    tx1:{
        "TransactionType": "Payment",
        "Flags": 2147483648,
        "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
        "Sequence": 16,
        "Fee": "10",
        "SigningPubKey": "02D9E3B2D4ED2A49C1BB3891A62DC275C0C610D7570A37EA174DB39EF732AA4EE7",
        "TxnSignature": "3044022065F9D04265E80C5579AB4871E1F3DB1F094AAC429D166485352B1A6AA00FAFD502204F28F618A2B8603CB56063F8D6E9796434CB4499F7A1A7A2122278F0376188EE",
        "Memos": [
            {
                "Memo": {
                    "MemoType": "",
                    "MemoData": "74657374",
                    "MemoFormat": ""
                }
            }
        ],
        "hash": "19C329803D4511B038053DE04B86A01AF88049A360612AECBC448F9DEC0CDCAB",
        "Destination": "jjsbo9Yz5RTrKAWSWgNtEHdrviMtWYoqZ5",
        "Amount": {
            "value": "1",
            "currency": "ZYDT",
            "issuer": "jjjjjjjjjjjjjjjjjjjjjhoLvTp"
        },
        "date": 626946450,
        "inLedger": 12913,
        "ledger_index": 12913,
        "meta": {
            "AffectedNodes": [
                {
                    "ModifiedNode": {
                        "FinalFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                            "Sequence": 0,
                            "Balance": "410"
                        },
                        "LedgerEntryType": "AccountRoot",
                        "PreviousFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                            "Sequence": 0,
                            "Balance": "400"
                        }
                    }
                },
                {
                    "ModifiedNode": {
                        "FinalFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
                            "Sequence": 16,
                            "Balance": "576608"
                        },
                        "LedgerEntryType": "AccountRoot",
                        "PreviousFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
                            "Sequence": 15,
                            "Balance": "576618"
                        }
                    }
                },
                {
                    "ModifiedNode": {
                        "FinalFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
                            "Sequence": 16,
                            "Balance": {
                                "value": "12300099.4",
                                "currency": "ZYDT",
                                "issuer": "jjjjjjjjjjjjjjjjjjjjjhoLvTp"
                            }
                        },
                        "LedgerEntryType": "AccountRoot",
                        "PreviousFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
                            "Sequence": 15,
                            "Balance": {
                                "value": "12300100.4",
                                "currency": "ZYDT",
                                "issuer": "jjjjjjjjjjjjjjjjjjjjjhoLvTp"
                            }
                        }
                    }
                },
                {
                    "ModifiedNode": {
                        "FinalFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "jjsbo9Yz5RTrKAWSWgNtEHdrviMtWYoqZ5",
                            "Sequence": 0,
                            "Balance": {
                                "value": "23.6",
                                "currency": "ZYDT",
                                "issuer": "jjjjjjjjjjjjjjjjjjjjjhoLvTp"
                            }
                        },
                        "LedgerEntryType": "AccountRoot",
                        "PreviousFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "jjsbo9Yz5RTrKAWSWgNtEHdrviMtWYoqZ5",
                            "Sequence": 0,
                            "Balance": {
                                "value": "22.6",
                                "currency": "ZYDT",
                                "issuer": "jjjjjjjjjjjjjjjjjjjjjhoLvTp"
                            }
                        }
                    }
                }
            ],
            "TransactionIndex": 0,
            "TransactionResult": "tesSUCCESS"
        }
    },

    tx2:{
        "TransactionType": "Payment",
        "Flags": 2147483648,
        "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
        "Sequence": 36,
        "Fee": "10",
        "SigningPubKey": "02D9E3B2D4ED2A49C1BB3891A62DC275C0C610D7570A37EA174DB39EF732AA4EE7",
        "TxnSignature": "304402201BADA444EC6094A6DB4C466D4480037C702972404D57B0143DF74CF281794B1102203C62A70B2CD860B0BB71FAA272C9F6DF2C5C166446FE329D1B9409BA8185942B",
        "hash": "CEEFBD4EE0C34E24D587D7D7BD7647B825449AD1F7D7A8449C2AB4625258664F",
        "Destination": "jjsbo9Yz5RTrKAWSWgNtEHdrviMtWYoqZ5",
        "Amount": "1",
        "date": 629273865,
        "inLedger": 440934,
        "ledger_index": 440934,
        "meta": {
            "AffectedNodes": [
                {
                    "ModifiedNode": {
                        "FinalFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                            "Sequence": 0,
                            "Balance": "3120"
                        },
                        "LedgerEntryType": "AccountRoot",
                        "PreviousFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                            "Sequence": 0,
                            "Balance": "3110"
                        }
                    }
                },
                {
                    "ModifiedNode": {
                        "FinalFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
                            "Sequence": 36,
                            "Balance": "2000699866"
                        },
                        "LedgerEntryType": "AccountRoot",
                        "PreviousFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
                            "Sequence": 35,
                            "Balance": "2000699877"
                        }
                    }
                },
                {
                    "ModifiedNode": {
                        "FinalFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "jjsbo9Yz5RTrKAWSWgNtEHdrviMtWYoqZ5",
                            "Sequence": 0,
                            "Balance": "122"
                        },
                        "LedgerEntryType": "AccountRoot",
                        "PreviousFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "jjsbo9Yz5RTrKAWSWgNtEHdrviMtWYoqZ5",
                            "Sequence": 0,
                            "Balance": "121"
                        }
                    }
                }
            ],
            "TransactionIndex": 0,
            "TransactionResult": "tesSUCCESS"
        }
    },
}

let modes = [
    {
        server: rpc_7545,
        url: RPC_URL_7545,
        tx1: data.tx1,
    },
    {
        server: rpc_9545,
        url: RPC_URL_9545,
        tx1: data.tx2,
    },
]

module.exports = {
    servers,
    status,
    chains,
    addresses,
    data,
    modes,
}