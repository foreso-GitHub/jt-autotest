let chainDatas = [
    {
        chainDataName: "lib_main",
        tx1:{
            "Account": "jnPytUkcu5F1hEZtiMAThA1KxHBMgLLgiu",
            "Amount": "100000000000",
            "Destination": "j9t5tjAawNoAxgn7FudkaKTo7GjD3HqvtH",
            "Fee": "10000",
            "Flags": 0,
            "Memos": [
                {
                    "Memo": {
                        "MemoData": "00",
                        "MemoType": "737472696E67"
                    }
                }
            ],
            "Sequence": 30,
            "SigningPubKey": "0266E1690630DE9026777586307F4B4EACC547771979E5B73105EE9ABAE311626F",
            "TransactionType": "Payment",
            "TxnSignature": "304402204C8725CC929F0FFE95796B5B2BA9A48CAF8792AEA66BB3E927EA7DA0DDF2299302205E4C1549C4E7D5F42531EBC846E75696973DFF8B09EB4C323CFC7E1C1B4B31A9",
            "date": 635233250,
            "hash": "7068743F6FA46A3BDCC5BA1C2027091B21C213B823CE581C30962943ACFFC96B",
            "inLedger": 15207195,
            "ledger_index": 15207195,
            "meta": {
                "AffectedNodes": [
                    {
                        "ModifiedNode": {
                            "FinalFields": {
                                "Account": "jEoSyfChhUMzpRDttAJXuie8XhqyoPBYvV",
                                "Balance": "634945654978",
                                "Flags": 0,
                                "OwnerCount": 1,
                                "Sequence": 50344576
                            },
                            "LedgerEntryType": "AccountRoot",
                            "LedgerIndex": "109E80FB8CC6D82D4F7F7D77248C2C3C116ECCD4520B3D2A88421FFF94A57B1E",
                            "PreviousFields": {
                                "Balance": "634945644978",
                                "Sequence": 50344575
                            },
                            "PreviousTxnID": "61952B98ABC4C31A9826C2627CDE9557F84FAD3996ED7021624B8FC56FF3ACF3",
                            "PreviousTxnLgrSeq": 15207195
                        }
                    },
                    {
                        "CreatedNode": {
                            "LedgerEntryType": "AccountRoot",
                            "LedgerIndex": "75CCFDD24EC29D98729E2A91548C13063C11888CAE9E17AB45247FBD8E4B3E96",
                            "NewFields": {
                                "Account": "j9t5tjAawNoAxgn7FudkaKTo7GjD3HqvtH",
                                "Balance": "100000000000",
                                "Sequence": 1
                            }
                        }
                    },
                    {
                        "ModifiedNode": {
                            "FinalFields": {
                                "Account": "jnPytUkcu5F1hEZtiMAThA1KxHBMgLLgiu",
                                "Balance": "16311060979720",
                                "Flags": 0,
                                "OwnerCount": 2,
                                "Platform": "jDXCeSHSpZ9LiX6ihckWaYDeDt5hFrdTto",
                                "Sequence": 31
                            },
                            "LedgerEntryType": "AccountRoot",
                            "LedgerIndex": "9DE2BA7D01AB09C39CE7BAAE4FA55A44404B26E8BED36C8EEA3008EF2AE55BE9",
                            "PreviousFields": {
                                "Balance": "16411060989720",
                                "Sequence": 30
                            },
                            "PreviousTxnID": "21BA874E4C0A105B6E9F69F058B490F2DC7B9376747AED7BB37371F88E78B323",
                            "PreviousTxnLgrSeq": 14984794
                        }
                    }
                ],
                "TransactionIndex": 1,
                "TransactionResult": "tesSUCCESS"
            },
            "validated": true
        },

        tx_memo:{
            "hash": "04DF8D86E1ED175EB6F7EDAD65BB8089253AE4F90D2AFCABCBD1ED49F9380D66",  //memo: 新用户注册赠送区块币; 1456005
        },

        tx_token: {
            "hash": "815459CA446C9D9A0C53E373917AA517D516BDBB099F79F341361F5A2A8D92C3",   //token: JJCC
        },

        tx_issue_token:{
            "hash": "815459CA446C9D9A0C53E373917AA517D516BDBB099F79F341361F5A2A8D92C3",
        },

        "block": {
            "blockNumber": "16417699",
            "blockHash": "BF95A512631F2F714CEDD38BD69605E789B024C208AD324D77F0BC0984F05B1A",
            "txCountInBlock": 36
        }
    },
    {
        "chainDataName": "rpc_yun_ali",
        "tx_token_CNYT": {
            "TransactionType": "Payment",
            "Flags": 2147483648,
            "Account": "jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh",
            "Sequence": 359,
            "Fee": "10",
            "SigningPubKey": "0330E7FC9D56BB25D6893BA3F317AE5BCF33B3291BD63DB32654A313222F7FD020",
            "TxnSignature": "30450221009E5BFA0D7C8351BB2D13761261085561BD4D3009802F387E22C21AB9FCD4DE2C02201A9D1A01D50F409F7B243F3714067111868E62A6D6CC205125D93CE8B54E811A",
            "hash": "8855FFC0A86F846AA67D14473AEB41999C29AD75475545C3BDDA500C3AA51837",
            "Destination": "jUTLfrMnrimNV2TRQkvjWURwL9mqQ3hD3C",
            "Amount": {
                "value": "999999",
                "currency": "CNYT",
                "issuer": "jjjjjjjjjjjjjjjjjjjjjhoLvTp"
            },
            "date": 647323965,
            "inLedger": 1239,
            "ledger_index": 1239,
            "meta": {
                "AffectedNodes": [
                    {
                        "ModifiedNode": {
                            "FinalFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                                "Sequence": 0,
                                "Balance": "11280"
                            },
                            "LedgerEntryType": "AccountRoot",
                            "PreviousFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                                "Sequence": 0,
                                "Balance": "11270"
                            }
                        }
                    },
                    {
                        "ModifiedNode": {
                            "FinalFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh",
                                "Sequence": 359,
                                "Balance": "99964499996409"
                            },
                            "LedgerEntryType": "AccountRoot",
                            "PreviousFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh",
                                "Sequence": 358,
                                "Balance": "99964499996419"
                            }
                        }
                    },
                    {
                        "ModifiedNode": {
                            "FinalFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh",
                                "Sequence": 359,
                                "Balance": {
                                    "value": "9999999997000012",
                                    "currency": "CNYT",
                                    "issuer": "jjjjjjjjjjjjjjjjjjjjjhoLvTp"
                                }
                            },
                            "LedgerEntryType": "AccountRoot",
                            "PreviousFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh",
                                "Sequence": 259,
                                "Balance": {
                                    "value": "9999999998000011",
                                    "currency": "CNYT",
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
                                "Account": "jUTLfrMnrimNV2TRQkvjWURwL9mqQ3hD3C",
                                "Sequence": 0,
                                "Balance": {
                                    "value": "999999",
                                    "currency": "CNYT",
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
        "tx1": {
            "TransactionType": "Payment",
            "Flags": 2147483648,
            "Account": "jWEDX7C5UzeoxRA7uBzHJJJ4vYtCsvenT",
            "Sequence": 1,
            "Fee": "10",
            "SigningPubKey": "0381C22C3D23C04D5284F2EE1108EBDC8E2DE7E1F04BF9592EFD8A282BE5E19196",
            "TxnSignature": "304402202E0AF7636D386221AABFF846B23B4FB586423BE185321F17437BF48151D90A3802205C6A9F3F9E024FCB2F25BEB78F97DF591D73B971547F6E7B2B9B813DA3B6DEC7",
            "hash": "F2ED569EED61DAA89856BB9061F9AFDEB2D493E54DDD4754CDE03256D069BA7D",
            "Destination": "jJaojWnapeaipyFKXtEpvU5XJmvFrfuA3A",
            "Amount": "1000000",
            "date": 647323965,
            "inLedger": 1239,
            "ledger_index": 1239,
            "meta": {
                "AffectedNodes": [
                    {
                        "ModifiedNode": {
                            "FinalFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                                "Sequence": 0,
                                "Balance": "11290"
                            },
                            "LedgerEntryType": "AccountRoot",
                            "PreviousFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                                "Sequence": 0,
                                "Balance": "11280"
                            }
                        }
                    },
                    {
                        "ModifiedNode": {
                            "FinalFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jWEDX7C5UzeoxRA7uBzHJJJ4vYtCsvenT",
                                "Sequence": 1,
                                "Balance": "98999990"
                            },
                            "LedgerEntryType": "AccountRoot",
                            "PreviousFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jWEDX7C5UzeoxRA7uBzHJJJ4vYtCsvenT",
                                "Sequence": 0,
                                "Balance": "100000000"
                            }
                        }
                    },
                    {
                        "ModifiedNode": {
                            "FinalFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jJaojWnapeaipyFKXtEpvU5XJmvFrfuA3A",
                                "Sequence": 0,
                                "Balance": "101000000"
                            },
                            "LedgerEntryType": "AccountRoot",
                            "PreviousFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jJaojWnapeaipyFKXtEpvU5XJmvFrfuA3A",
                                "Sequence": 0,
                                "Balance": "100000000"
                            }
                        }
                    }
                ],
                "TransactionIndex": 1,
                "TransactionResult": "tesSUCCESS"
            }
        },
        "tx_memo": {
            "TransactionType": "Payment",
            "Flags": 2147483648,
            "Account": "jWEDX7C5UzeoxRA7uBzHJJJ4vYtCsvenT",
            "Sequence": 2,
            "Fee": "10",
            "SigningPubKey": "0381C22C3D23C04D5284F2EE1108EBDC8E2DE7E1F04BF9592EFD8A282BE5E19196",
            "TxnSignature": "30450221009733A69C50EA90F0ECAFEAA875CFDF7BB6C68B391C9498D2CED3459E6DA386070220447BE09B8DC8DC173FBAE8121BDEE7B82900FCF3EAA6259C38E414A4DA43030B",
            "Memos": [
                {
                    "Memo": {
                        "MemoType": "",
                        "MemoData": "637265617465207465737420636861696E206461746120666F72207270635F79756E5F616C6920617420323032302D30372D30365430343A31323A34322E3332325A",
                        "MemoFormat": ""
                    }
                }
            ],
            "hash": "45F94FA10D9C08D1498DEA5D1D2E1F3A3D72F9329154AC9304D43D1087E1C1F3",
            "Destination": "jJaojWnapeaipyFKXtEpvU5XJmvFrfuA3A",
            "Amount": "1000000",
            "date": 647323965,
            "inLedger": 1239,
            "ledger_index": 1239,
            "meta": {
                "AffectedNodes": [
                    {
                        "ModifiedNode": {
                            "FinalFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                                "Sequence": 0,
                                "Balance": "11300"
                            },
                            "LedgerEntryType": "AccountRoot",
                            "PreviousFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                                "Sequence": 0,
                                "Balance": "11290"
                            }
                        }
                    },
                    {
                        "ModifiedNode": {
                            "FinalFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jWEDX7C5UzeoxRA7uBzHJJJ4vYtCsvenT",
                                "Sequence": 2,
                                "Balance": "97999980"
                            },
                            "LedgerEntryType": "AccountRoot",
                            "PreviousFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jWEDX7C5UzeoxRA7uBzHJJJ4vYtCsvenT",
                                "Sequence": 1,
                                "Balance": "98999990"
                            }
                        }
                    },
                    {
                        "ModifiedNode": {
                            "FinalFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jJaojWnapeaipyFKXtEpvU5XJmvFrfuA3A",
                                "Sequence": 0,
                                "Balance": "102000000"
                            },
                            "LedgerEntryType": "AccountRoot",
                            "PreviousFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jJaojWnapeaipyFKXtEpvU5XJmvFrfuA3A",
                                "Sequence": 0,
                                "Balance": "101000000"
                            }
                        }
                    }
                ],
                "TransactionIndex": 2,
                "TransactionResult": "tesSUCCESS"
            }
        },
        "block": {
            "blockNumber": "1239",
            "blockHash": "792C11F130D5238114C65BB9C060EDAC132B06BBA7C41217F3E465E323EB8CE9",
            "txCountInBlock": 11
        }
    },
]
module.exports = { chainDatas }