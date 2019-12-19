var rpc = require('../lib/rpc/interfaces.js')

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

let accounts = [
    {address: "jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh", secret: ""},
    {address: "jnrX7oqQLtF2Vi5tXpS8gNza2x75kgQmFp", secret: "shU3sYDD5bSrtAn2jQSEMX8RVFiYf"},
    {address: "jP6qtKENk7dFqkk9R5gbzoR3doPbeThujj", secret: "ss7zdg72dGuRwi4r7kic4TkzVb4Zz", nickName:"autotest_1"},
    {address: "jJ2iyFtGTzYzv8GuNpCyxfKFxhr1SwmAqw", secret: "shne2fBdSVBM9jkDeLKPHiLN9nxSk"},
    {address: "jGRY1qHuVtSbpjqHLQsKPBQ9L4Hng38iyJ", secret: "ssujaeqwGnA6dEDyYf2tCG8UxUCX8"},
    {address: "jKmboSgBUbEsCdARP6sf1FeRWX5gYm7TcZ", secret: "ssrJCd6zp4hRavjaApsxPy8u3qZKu"},
    {address: "jD53RxbnN23vSAEJrFJ69TPgrvBU7UNhU5", secret: "ssebtBTcNLL2FPcarxXK3WXMzKYZC"},
    {address: "jfoxXUf1onsPYYeBxGtJApDenaMQD7YCUf", secret: "shPJ7FWtMfhVagt3avcUYUTaMn27k"},
    {address: "j4hxZmEo37wWcq7WLaoCtf8BjPDesTpAaR", secret: "ss1RvLHxENzbFPe5P4HgCTFebhSQD"},
    {address: "jBykxUHVDccTYtquCSCsFVgem1zt3FFe71", secret: "shJcGmQDoF3DU61ufA25a36ipfe4x"},
    // {address: "j3Go8eJjRD5yvZuZbrGXXDcrACkxHgdaM8", secret: "shnWYMunzyrzfLAE4LWknxxST7mq8"},
    // {address: "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd", secret: "ss6iFshVyH7zZL2pGiQ4otrrd5uCg"},
    // {address: "jjsbo9Yz5RTrKAWSWgNtEHdrviMtWYoqZ5", secret: ""},
    // {address: "jGPPk3jWd2NY1wStCHK27NDm61MES8Bhuf", secret: "ss5WvoCyjpryiuQ8ioENTccZoxPG6"},
    // {address: "jJMsY9dmkRfj1fGbft7kyXxJ3SyehPg1tG", secret: ""},
    // {address: "jDjvM2rrjgAsYEeFJsSvuXxkbYxZQpdEwu", secret: "shJTqjPJKsgTLDqCQ16nuALHSzjTd"},
    // {address: "jnrX7oqQLtF2Vi5tXpS8gNza2x75kgQmFp", secret: "shU3sYDD5bSrtAn2jQSEMX8RVFiYf"},
]

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
    inactiveAccount1:{
        address:inactiveAccounts[0].address,
        secret:inactiveAccounts[0].secret,
        nickName:inactiveAccounts[0].nickName,
    },
    wrongFormatAccount1:{
        address:"inactiveAccounts[0].address",
        secret:"inactiveAccounts[0].secret",
        nickName:"inactiveAccounts[0].nickName",
    }
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

    tx_memo:{
        "TransactionType": "Payment",
        "Flags": 2147483648,
        "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
        "Sequence": 521,
        "Fee": "10",
        "SigningPubKey": "02D9E3B2D4ED2A49C1BB3891A62DC275C0C610D7570A37EA174DB39EF732AA4EE7",
        "TxnSignature": "3044022062095105FF18A0EDC4771BBA1FE565E8A03A66D5FBB87522069F6F8C35F7B184022042A58D077306FFCAD370069952E1CA2D57E9DEF8A0234E34788D6D934FAB3BBF",
        "Memos": [
            {
                "Memo": {
                    "MemoType": "",
                    "MemoData": "74657374",
                    "MemoFormat": ""
                }
            }
        ],
        "hash": "467D3947047430CD88A20D05278487DCF780A5B42E9C41FEC85F4ED96C9F9E37",
        "Destination": "jjsbo9Yz5RTrKAWSWgNtEHdrviMtWYoqZ5",
        "Amount": "1",
        "date": 629876705,
        "inLedger": 561502,
        "ledger_index": 561502,
        "meta": {
            "AffectedNodes": [
                {
                    "ModifiedNode": {
                        "FinalFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                            "Sequence": 0,
                            "Balance": "11525"
                        },
                        "LedgerEntryType": "AccountRoot",
                        "PreviousFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                            "Sequence": 0,
                            "Balance": "11515"
                        }
                    }
                },
                {
                    "ModifiedNode": {
                        "FinalFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
                            "Sequence": 521,
                            "Balance": "1987391099"
                        },
                        "LedgerEntryType": "AccountRoot",
                        "PreviousFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
                            "Sequence": 520,
                            "Balance": "1987391110"
                        }
                    }
                },
                {
                    "ModifiedNode": {
                        "FinalFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "jjsbo9Yz5RTrKAWSWgNtEHdrviMtWYoqZ5",
                            "Sequence": 0,
                            "Balance": "13300617"
                        },
                        "LedgerEntryType": "AccountRoot",
                        "PreviousFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "jjsbo9Yz5RTrKAWSWgNtEHdrviMtWYoqZ5",
                            "Sequence": 0,
                            "Balance": "13300616"
                        }
                    }
                }
            ],
            "TransactionIndex": 0,
            "TransactionResult": "tesSUCCESS"
        }
    },

    tx_token: {
        TransactionType: 'IssueCoin',
        Flags: 2147549184,
        Account: 'j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd',
        Sequence: 549,
        Fee: '20',
        SigningPubKey:
            '02D9E3B2D4ED2A49C1BB3891A62DC275C0C610D7570A37EA174DB39EF732AA4EE7',
        TxnSignature:
            '304402206591240859BD6EEF123FD540A880A39AB5D9107E969EED6788850A23F7663199022034963C36227295FE44F518947B7F668983ABB93549E20B3049D24E4125923606',
        hash:
            'AE25D5C8787AC4A1AF2434FD3B46A0EDEE60147EE766FB79D60FC3AAC93AC891',
        Name: 'TestCoin1576569581',
        Decimals: 8,
        TotalSupply:
            { value: '9876543210',
                currency: 'TC',
                issuer: 'j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd' },
        date: 629884785,
        inLedger: 563118,
        ledger_index: 563118,
        meta:
            { AffectedNodes: [Array],
                TransactionIndex: 0,
                TransactionResult: 'tesSUCCESS' }
    },

}

let token = {
    config_normal:{
        type: "IssueCoin",
        name: "TestCoin",
        symbol: "TC",
        decimals: 8,
        total_supply: "9876543210",
        local:false,
        flags: 0,
        fee: 20,
    },
    config_mintable:{
        type: "IssueCoin",
        name: "TestCoin",
        symbol: "TC",
        decimals: 8,
        total_supply: "9876543210",
        local:false,
        flags: 65536,
        fee: 20,
    },
    config_burnable:{
        type: "IssueCoin",
        name: "TestCoin",
        symbol: "TC",
        decimals: 8,
        total_supply: "9876543210",
        local:false,
        flags: 131072,
        fee: 20,
    },
    config_mint_burn:{
        type: "IssueCoin",
        name: "TestCoin",
        symbol: "TC",
        decimals: 8,
        total_supply: "9876543210",
        local:false,
        flags: 196608,
        fee: 20,
    },
    config_issuer_normal:{
        type: "IssueCoin",
        name: "TestCoin",
        symbol: "TC",
        decimals: 8,
        total_supply: "9876543210",
        local:true,
        flags: 0,
        fee: 20,
    },
    config_issuer_mintable:{
        type: "IssueCoin",
        name: "TestCoin",
        symbol: "TC",
        decimals: 8,
        total_supply: "9876543210",
        local:true,
        flags: 65536,
        fee: 20,
    },
    config_issuer_burnable:{
        type: "IssueCoin",
        name: "TestCoin",
        symbol: "TC",
        decimals: 8,
        total_supply: "9876543210",
        local:true,
        flags: 131072,
        fee: 20,
    },
    config_issuer_mint_burn:{
        type: "IssueCoin",
        name: "TestCoin",
        symbol: "TC",
        decimals: 8,
        total_supply: "9876543210",
        local:true,
        flags: 196608,
        fee: 20,
    },
    existToken:{
        name: "TestCoin1576652216",
        symbol: "5df9cdf0",
    },
}

let modes = [
    {
        server: rpc_9545,
        url: RPC_URL_9545,
        tx1: data.tx2,
    },
    {
        server: rpc_7545,
        url: RPC_URL_7545,
        tx1: data.tx1,
    },
]

module.exports = {
    servers,
    status,
    chains,
    accounts,
    addresses,
    data,
    token,
    modes,
}