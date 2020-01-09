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
    {address: "jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh", secret: "snoPBjXtMeMyMHUVTgbuqAfg1SUTb"},
    {address: "jnrX7oqQLtF2Vi5tXpS8gNza2x75kgQmFp", secret: "shU3sYDD5bSrtAn2jQSEMX8RVFiYf"},
    {address: "jP6qtKENk7dFqkk9R5gbzoR3doPbeThujj", secret: "ss7zdg72dGuRwi4r7kic4TkzVb4Zz", nickName:"autotest_1"},

    //sender1
    // {address: "jJ2iyFtGTzYzv8GuNpCyxfKFxhr1SwmAqw", secret: "shne2fBdSVBM9jkDeLKPHiLN9nxSk"},
    // {address: "jNVcLkEu7HqFV42Ps9Wf7fp6z6CH714zbF", secret: "ssR6tJPS8ZgiejNGTA7f4zezfHZy6"},
    // {address: "jpm3K2GDLqfZswBfmAuzA3t6rrgkanSyDN", secret: "ssidxoohU7fHB9jm8VLQiNsnE1SPE"},
    {address: "jPdevNK8NeYSkg3TrWZa8eT6BrSp2oteUh", secret: "ssSLJReyitmAELQ3E3zYpZti1YuRe"},
    //receiver1
    {address: "jGRY1qHuVtSbpjqHLQsKPBQ9L4Hng38iyJ", secret: "ssujaeqwGnA6dEDyYf2tCG8UxUCX8"},

    //sender2
    {address: "jKmboSgBUbEsCdARP6sf1FeRWX5gYm7TcZ", secret: "ssrJCd6zp4hRavjaApsxPy8u3qZKu"},
    //receiver2
    {address: "jD53RxbnN23vSAEJrFJ69TPgrvBU7UNhU5", secret: "ssebtBTcNLL2FPcarxXK3WXMzKYZC"},

    //sender3
    // {address: "jfoxXUf1onsPYYeBxGtJApDenaMQD7YCUf", secret: "shPJ7FWtMfhVagt3avcUYUTaMn27k"},
    {address: "jB4uCrWFDykMLRpk8v7VGgcPucjaxrQ8Xn", secret: "sh9Y6aAGPuP3fa4DHYsCYYNqsckWw"},
    //receiver3
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
    },
    defaultIssuer:{
        address: 'jjjjjjjjjjjjjjjjjjjjjhoLvTp',
        secret: ''
    }
}

let data = {
    defaultBlockTime: 5000,
    retryPauseTime: 5000,  //todo sometimes get tx will fail because the tx has not been written in block yet.  in such case, can retry get tx after 1s, for 3 times.
    defaultFee: 12,
    chain:{
        tx:{
            "TransactionType": "Payment",
            "Flags": 2147483648,
            "Account": "jJ2iyFtGTzYzv8GuNpCyxfKFxhr1SwmAqw",
            "Sequence": 1,
            "Fee": "10",
            "SigningPubKey": "0339D787D8B7860B964C498B907A29C4A1F910572982D57EE706DC069F2E599680",
            "TxnSignature": "3045022100F1D84D88BCF1D51732192084B1EA2D5FE38803A060355C0A08891BC8DB2C2DFC022046187DFA44C739CADAF308B17CF295E1B15AEC596B1B029A5CF06A4F0503C103",
            "hash": "725DF42A93967942B36E2D6524214E9F1BA0CB9C6FA42934923230D3E14B9EE7",
            "Destination": "jGRY1qHuVtSbpjqHLQsKPBQ9L4Hng38iyJ",
            "Amount": "1",
            "date": 630380960,
            "inLedger": 47029,
            "ledger_index": 47029,
            "meta": {
                "AffectedNodes": [
                    {
                        "ModifiedNode": {
                            "FinalFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                                "Sequence": 0,
                                "Balance": "340"
                            },
                            "LedgerEntryType": "AccountRoot",
                            "PreviousFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                                "Sequence": 0,
                                "Balance": "330"
                            }
                        }
                    },
                    {
                        "ModifiedNode": {
                            "FinalFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jJ2iyFtGTzYzv8GuNpCyxfKFxhr1SwmAqw",
                                "Sequence": 1,
                                "Balance": "99989"
                            },
                            "LedgerEntryType": "AccountRoot",
                            "PreviousFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jJ2iyFtGTzYzv8GuNpCyxfKFxhr1SwmAqw",
                                "Sequence": 0,
                                "Balance": "100000"
                            }
                        }
                    },
                    {
                        "ModifiedNode": {
                            "FinalFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jGRY1qHuVtSbpjqHLQsKPBQ9L4Hng38iyJ",
                                "Sequence": 0,
                                "Balance": "100001"
                            },
                            "LedgerEntryType": "AccountRoot",
                            "PreviousFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jGRY1qHuVtSbpjqHLQsKPBQ9L4Hng38iyJ",
                                "Sequence": 0,
                                "Balance": "100000"
                            }
                        }
                    }
                ],
                "TransactionIndex": 0,
                "TransactionResult": "tesSUCCESS"
            }
        },
    },

    ipfs:{
        tx:{
            "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
            "Amount": "100000",
            "Destination": "jfoxXUf1onsPYYeBxGtJApDenaMQD7YCUf",
            "Fee": "10",
            "Flags": 2147483648,
            "Memos": [
                {
                    "Memo": {
                        "MemoData": "74657374",
                        "MemoFormat": "",
                        "MemoType": ""
                    }
                }
            ],
            "Sequence": 29,
            "SigningPubKey": "02D9E3B2D4ED2A49C1BB3891A62DC275C0C610D7570A37EA174DB39EF732AA4EE7",
            "TransactionType": "Payment",
            "TxnSignature": "3044022047B90710AF5350DC3FD8684CDAA6983F4F305B0D434507E8EDCAA370958F7B9702206EDEFF00CEEE53FC2F233E422486177CE921680C397030080CB9FA9D439A55F3",
            "date": 630383225,
            "hash": "6201EF37B51408019E19AA679A569ABE846528AD43BFDDB97FD36BAA028BF24A",
            "inLedger": 47482,
            "ledger_hash": "4BFDA7B69A8D9EBC9A11B2C83B36E794F08166C7E4059095D9BD2811178D9407",
            "ledger_index": 47482
        },
    },

    tx_memo:{
        "TransactionType": "Payment",
        "Flags": 2147483648,
        "Account": "jJ2iyFtGTzYzv8GuNpCyxfKFxhr1SwmAqw",
        "Sequence": 4,
        "Fee": "12",
        "SigningPubKey": "0339D787D8B7860B964C498B907A29C4A1F910572982D57EE706DC069F2E599680",
        "TxnSignature": "3045022100DE1A72F231280EF8774C5DC1547A97468ACF189995B6736A02FD9FE54CC5B17B0220765A1A47F200742378F32739A1772EFC4F21C17AD1DF25A50BFA16DC817B68A3",
        "hash": "BDD907643D684B60F57BEAAD81401CE86542053E57920049C8FAF1E9F9FEB676",
        "Destination": "jGRY1qHuVtSbpjqHLQsKPBQ9L4Hng38iyJ",
        "Amount": "1",
        "date": 630381040,
        "inLedger": 47045,
        "ledger_index": 47045,
        "meta": {
            "AffectedNodes": [
                {
                    "ModifiedNode": {
                        "FinalFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                            "Sequence": 0,
                            "Balance": "372"
                        },
                        "LedgerEntryType": "AccountRoot",
                        "PreviousFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                            "Sequence": 0,
                            "Balance": "360"
                        }
                    }
                },
                {
                    "ModifiedNode": {
                        "FinalFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "jJ2iyFtGTzYzv8GuNpCyxfKFxhr1SwmAqw",
                            "Sequence": 4,
                            "Balance": "56"
                        },
                        "LedgerEntryType": "AccountRoot",
                        "PreviousFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "jJ2iyFtGTzYzv8GuNpCyxfKFxhr1SwmAqw",
                            "Sequence": 3,
                            "Balance": "69"
                        }
                    }
                },
                {
                    "ModifiedNode": {
                        "FinalFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "jGRY1qHuVtSbpjqHLQsKPBQ9L4Hng38iyJ",
                            "Sequence": 0,
                            "Balance": "199902"
                        },
                        "LedgerEntryType": "AccountRoot",
                        "PreviousFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "jGRY1qHuVtSbpjqHLQsKPBQ9L4Hng38iyJ",
                            "Sequence": 0,
                            "Balance": "199901"
                        }
                    }
                }
            ],
            "TransactionIndex": 0,
            "TransactionResult": "tesSUCCESS"
        }
    },

    tx_token: {
        "TransactionType": "Payment",
        "Flags": 2147483648,
        "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
        "Sequence": 28,
        "Fee": "10",
        "SigningPubKey": "02D9E3B2D4ED2A49C1BB3891A62DC275C0C610D7570A37EA174DB39EF732AA4EE7",
        "TxnSignature": "3045022100E8D896BCF3A763951F83FB7AF4459C10DC1B22E74BEC7607117FC751931F37A2022002D9D6D9F2EC10C1553F98B9DB588F8A8DF6EB414691B70D7BE6988CFF4BCEBF",
        "Memos": [
            {
                "Memo": {
                    "MemoType": "",
                    "MemoData": "74657374",
                    "MemoFormat": ""
                }
            }
        ],
        "hash": "142C81EFF398B80A902D45D5AE9866ED730EA9F90C79595E0329129575E01F4A",
        "Destination": "jfoxXUf1onsPYYeBxGtJApDenaMQD7YCUf",
        "Amount": {
            "value": "10000000",
            "currency": "at1",
            "issuer": "jjjjjjjjjjjjjjjjjjjjjhoLvTp"
        },
        "date": 630382935,
        "inLedger": 47424,
        "ledger_index": 47424,
        "meta": {
            "AffectedNodes": [
                {
                    "ModifiedNode": {
                        "FinalFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                            "Sequence": 0,
                            "Balance": "590"
                        },
                        "LedgerEntryType": "AccountRoot",
                        "PreviousFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                            "Sequence": 0,
                            "Balance": "580"
                        }
                    }
                },
                {
                    "ModifiedNode": {
                        "FinalFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
                            "Sequence": 28,
                            "Balance": "2806700"
                        },
                        "LedgerEntryType": "AccountRoot",
                        "PreviousFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
                            "Sequence": 27,
                            "Balance": "2806710"
                        }
                    }
                },
                {
                    "ModifiedNode": {
                        "FinalFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
                            "Sequence": 28,
                            "Balance": {
                                "value": "990000000",
                                "currency": "at1",
                                "issuer": "jjjjjjjjjjjjjjjjjjjjjhoLvTp"
                            }
                        },
                        "LedgerEntryType": "AccountRoot",
                        "PreviousFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
                            "Sequence": 27,
                            "Balance": {
                                "value": "1000000000",
                                "currency": "at1",
                                "issuer": "jjjjjjjjjjjjjjjjjjjjjhoLvTp"
                            }
                        }
                    }
                },
                {
                    "CreatedNode": {
                        "LedgerEntryType": "AccountRoot",
                        "NewFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "jfoxXUf1onsPYYeBxGtJApDenaMQD7YCUf",
                            "Sequence": 0,
                            "Balance": {
                                "value": "10000000",
                                "currency": "at1",
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

    tx_issue_token:{
        "TransactionType": "IssueCoin",
        "Flags": 2147483648,
        "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
        "Sequence": 27,
        "Fee": "10",
        "SigningPubKey": "02D9E3B2D4ED2A49C1BB3891A62DC275C0C610D7570A37EA174DB39EF732AA4EE7",
        "TxnSignature": "3045022100C13F254C3BAA50E4874B41E2D82B9D07412079714DEB20A4BAE79F95ADD147A00220110B4EAF35D0D627F3368AA641E8142CEB28396FD24E35D6EF19E92E0C87842A",
        "hash": "8BAC0FDB71BE3DB332D54F829E8D408E63C2F16CC3E19B61B9F76F3E2E7AC3E9",
        "Name": "AutoTest",
        "Decimals": 8,
        "TotalSupply": {
            "value": "1000000000",
            "currency": "at1",
            "issuer": "jjjjjjjjjjjjjjjjjjjjjhoLvTp"
        },
        "date": 630382545,
        "inLedger": 47346,
        "ledger_index": 47346,
        "meta": {
            "AffectedNodes": [
                {
                    "ModifiedNode": {
                        "FinalFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                            "Sequence": 0,
                            "Balance": "580"
                        },
                        "LedgerEntryType": "AccountRoot",
                        "PreviousFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                            "Sequence": 0,
                            "Balance": "570"
                        }
                    }
                },
                {
                    "ModifiedNode": {
                        "FinalFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
                            "Sequence": 27,
                            "Balance": "2806710"
                        },
                        "LedgerEntryType": "AccountRoot",
                        "PreviousFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
                            "Sequence": 26,
                            "Balance": "2806720"
                        }
                    }
                },
                {
                    "CreatedNode": {
                        "LedgerEntryType": "AccountRoot",
                        "NewFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
                            "Sequence": 27,
                            "Balance": {
                                "value": "1000000000",
                                "currency": "at1",
                                "issuer": "jjjjjjjjjjjjjjjjjjjjjhoLvTp"
                            }
                        }
                    }
                },
                {
                    "CreatedNode": {
                        "LedgerEntryType": "CurrencyRoot",
                        "NewFields": {
                            "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                            "Flags": 0,
                            "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
                            "Sequence": 27,
                            "Name": "AutoTest",
                            "Decimals": 8,
                            "TotalSupply": {
                                "value": "1000000000",
                                "currency": "at1",
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
        tx1: data.chain.tx,
    },
    // {
    //     server: rpc_7545,
    //     url: RPC_URL_7545,
    //     tx1: data.ipfs.tx,
    // },
]

let txs = {
    swtTx1:{
        hash: "B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530B",
        blockHash: "69C6AF9882E6F86E97057090882530A6A55FDD9191040ADFF701621FAFCEBA6E",
        tx: {
            "TransactionType": "Payment",
            "Flags": 2147483648,
            "Account": "j4hxZmEo37wWcq7WLaoCtf8BjPDesTpAaR",
            "Sequence": 1,
            "Fee": "10",
            "SigningPubKey": "02477644256C68CCFB9D1FF3990F8444FC54D17A11878616430AFDA12A4F1EDDE9",
            "TxnSignature": "30450221008B94D0244A969AF09BC94657D5739347CB004A95787389A5A7235A3863485587022051220CF94FA705AA74D3D0B5747BA550EFC2DB8862AFC22D4B81B041D92017AB",
            "Memos": [
                {
                    "Memo": {
                        "MemoType": "",
                        "MemoData": "74657374",
                        "MemoFormat": ""
                    }
                }
            ],
            "hash": "B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530B",
            "Destination": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
            "Amount": "1",
            "date": 630665495,
            "inLedger": 103896,
            "ledger_index": 103896,
            "meta": {
                "AffectedNodes": [
                    {
                        "ModifiedNode": {
                            "FinalFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                                "Sequence": 0,
                                "Balance": "100018"
                            },
                            "LedgerEntryType": "AccountRoot",
                            "PreviousFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                                "Sequence": 0,
                                "Balance": "100008"
                            }
                        }
                    },
                    {
                        "ModifiedNode": {
                            "FinalFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "j4hxZmEo37wWcq7WLaoCtf8BjPDesTpAaR",
                                "Sequence": 1,
                                "Balance": "20000099989"
                            },
                            "LedgerEntryType": "AccountRoot",
                            "PreviousFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "j4hxZmEo37wWcq7WLaoCtf8BjPDesTpAaR",
                                "Sequence": 0,
                                "Balance": "20000100000"
                            }
                        }
                    },
                    {
                        "ModifiedNode": {
                            "FinalFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
                                "Sequence": 35,
                                "Balance": "1080002506703"
                            },
                            "LedgerEntryType": "AccountRoot",
                            "PreviousFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
                                "Sequence": 35,
                                "Balance": "1080002506702"
                            }
                        }
                    }
                ],
                "TransactionIndex": 0,
                "TransactionResult": "tesSUCCESS"
            }
        },
    },
    at1Tx1:{
        hash: "B07647D61E6F7C4683E715004E2FB236D47DB64DF92F6504B71D6A1D4469530B",
        tx:{},
    }
}

let blocks = {
    block1:{
        blockNumber: "107621",
        hash: "2EBFABD8340E016ACD8E0C28E878532633E5893251B8410647A03A993747FDAF",
        transactionsCount: 20,
    }
}

module.exports = {
    servers,
    status,
    chains,
    accounts,
    addresses,
    data,
    token,
    txs,
    blocks,
    modes,
}