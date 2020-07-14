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

        "tx_token_CNYT": {
            "TransactionType": "Payment",
            "Flags": 2147483648,
            "Account": "jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh",
            "Sequence": 2735,
            "Fee": "10",
            "SigningPubKey": "0330E7FC9D56BB25D6893BA3F317AE5BCF33B3291BD63DB32654A313222F7FD020",
            "TxnSignature": "304402204A173AFC98A545C2324C0F6B9CE837AB0C818EF848D4071F065936DA9A1C1C61022057C6047AEB6F777F2F1550A7761AE1C28EBCFD6D08F4F96B833F6394C4D09075",
            "hash": "4D8B84246E71B58C093E3E9BF8D3E6CAB545B0F058F6BADA0955A47382E67ABD",
            "Destination": "jD9QHwGBURFACp4z3ErVupG7B4q8D6MsyH",
            "Amount": {
                "value": "999999",
                "currency": "CNYT",
                "issuer": "jjjjjjjjjjjjjjjjjjjjjhoLvTp"
            },
            "date": 648013495,
            "inLedger": 137604,
            "ledger_index": 137604,
            "meta": {
                "AffectedNodes": [
                    {
                        "ModifiedNode": {
                            "FinalFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                                "Sequence": 0,
                                "Balance": "178860"
                            },
                            "LedgerEntryType": "AccountRoot",
                            "PreviousFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jhCVwTcg5aYWMMdfDmwqYxBr5NMA1PDfyg",
                                "Sequence": 0,
                                "Balance": "178850"
                            }
                        }
                    },
                    {
                        "ModifiedNode": {
                            "FinalFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh",
                                "Sequence": 2735,
                                "Balance": "99838722968749"
                            },
                            "LedgerEntryType": "AccountRoot",
                            "PreviousFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh",
                                "Sequence": 2734,
                                "Balance": "99838722968759"
                            }
                        }
                    },
                    {
                        "ModifiedNode": {
                            "FinalFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh",
                                "Sequence": 2735,
                                "Balance": {
                                    "value": "102933319219412",
                                    "currency": "CNYT",
                                    "issuer": "jjjjjjjjjjjjjjjjjjjjjhoLvTp"
                                }
                            },
                            "LedgerEntryType": "AccountRoot",
                            "PreviousFields": {
                                "Hash": "0000000000000000000000000000000000000000000000000000000000000000",
                                "Account": "jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh",
                                "Sequence": 2635,
                                "Balance": {
                                    "value": "102933320219411",
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
                                "Account": "jD9QHwGBURFACp4z3ErVupG7B4q8D6MsyH",
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

        "block": {
            "blockNumber": "16417699",
            "blockHash": "BF95A512631F2F714CEDD38BD69605E789B024C208AD324D77F0BC0984F05B1A",
            "txCountInBlock": 36
        }
    },
]
module.exports = { chainDatas }