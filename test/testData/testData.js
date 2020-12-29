const consts = require('../framework/consts')
const Total_Supply = (9876543210 * Math.pow(10, consts.default.tokenDecimals)).toString()

let chains = ['swt', 'bwt']

let data = {

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
    },

    swtclib_Main:{
        tx:{
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
    },

    swtclib_Test:{
        tx:{
            "Account": "jpmKEm2sUevfpFjS7QHdT8Sx7ZGoEXTJAz",
            "Amount": "1",
            "Destination": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
            "Fee": "10000",
            "Flags": 0,
            "Memos": [
                {
                    "Memo": {
                        "MemoData": "74657374"
                    }
                }
            ],
            "Sequence": 38,
            "SigningPubKey": "029110C3744FB57BD1F4824F5B989AE75EB6402B4365B501F6EDCA9BE44A675E15",
            "TransactionType": "Payment",
            "TxnSignature": "3044022011348BC4E1370A823F9449AE1A3D37E073A0382879B59344A6C82E6D923A1FB102205103A3B3A753B8BEE8748BDCF62298593B13E6D35EF3DFE77E4415F097E9890A",
            "date": 635915300,
            "hash": "641A96FE56C2D234D83F8E40E214DCA545AF666243FE7E89247D2BE00AA72B75",
            "inLedger": 785909,
            "ledger_index": 785909,
            "meta": {
                "AffectedNodes": [
                    {
                        "ModifiedNode": {
                            "FinalFields": {
                                "Account": "j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
                                "Balance": "631230005",
                                "Flags": 0,
                                "OwnerCount": 0,
                                "Sequence": 1
                            },
                            "LedgerEntryType": "AccountRoot",
                            "LedgerIndex": "3B64ACE3D3169F69272108CAD37C4B0F0D978BED120E1414BC48140ED0539B6C",
                            "PreviousFields": {
                                "Balance": "631230004"
                            },
                            "PreviousTxnID": "F4BC811AE4F3AABD1537C3B433E651E380FBF016544A62975FA910AF9ACF5A32",
                            "PreviousTxnLgrSeq": 785907
                        }
                    },
                    {
                        "ModifiedNode": {
                            "FinalFields": {
                                "Account": "jPABxZ2ZMsqv2jA9rNhC2VZs9dBeXmLbAR",
                                "Balance": "1015961",
                                "Flags": 0,
                                "OwnerCount": 0,
                                "Sequence": 526
                            },
                            "LedgerEntryType": "AccountRoot",
                            "LedgerIndex": "5D78AAFB835F94C60E2DFC442D8E3569728E64AC7ADF218B0BA6D5EC3051EF56",
                            "PreviousFields": {
                                "Balance": "1005961",
                                "Sequence": 525
                            },
                            "PreviousTxnID": "F4BC811AE4F3AABD1537C3B433E651E380FBF016544A62975FA910AF9ACF5A32",
                            "PreviousTxnLgrSeq": 785907
                        }
                    },
                    {
                        "ModifiedNode": {
                            "FinalFields": {
                                "Account": "jpmKEm2sUevfpFjS7QHdT8Sx7ZGoEXTJAz",
                                "Balance": "10099368389995",
                                "Flags": 0,
                                "OwnerCount": 0,
                                "Sequence": 39
                            },
                            "LedgerEntryType": "AccountRoot",
                            "LedgerIndex": "DB35CDEAF3F0D3C190B041C0C7D92FB0E43CBCBFAD4F498C28858A35CEA8BBB7",
                            "PreviousFields": {
                                "Balance": "10099368399996",
                                "Sequence": 38
                            },
                            "PreviousTxnID": "F4BC811AE4F3AABD1537C3B433E651E380FBF016544A62975FA910AF9ACF5A32",
                            "PreviousTxnLgrSeq": 785907
                        }
                    }
                ],
                "TransactionIndex": 0,
                "TransactionResult": "tesSUCCESS",
                "delivered_amount": "unavailable"
            },
            "validated": true
        },

        tx_memo:{
            "hash": "641A96FE56C2D234D83F8E40E214DCA545AF666243FE7E89247D2BE00AA72B75",  //memo: test
        },

        tx_token: {
            "hash": "641A96FE56C2D234D83F8E40E214DCA545AF666243FE7E89247D2BE00AA72B75",   //todo: it is not a token tx.
        },

        tx_issue_token:{
            "hash": "815459CA446C9D9A0C53E373917AA517D516BDBB099F79F341361F5A2A8D92C3",
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

}

let token = {
    config_normal:{
        testName: "全局标准代币",
        type: "IssueCoin",
        name: "TestCoin",
        symbol: "TC",
        decimals: consts.default.tokenDecimals.toString(),
        total_supply: Total_Supply,
        local:false,
        flags: consts.flags.normal,
        fee: "10",
    },
    config_mintable:{
        testName: "全局可增发代币",
        type: "IssueCoin",
        name: "TestCoin",
        symbol: "TC",
        decimals: consts.default.tokenDecimals.toString(),
        total_supply: Total_Supply,
        local:false,
        flags: consts.flags.mintable,
        fee: "10",
    },
    config_burnable:{
        testName: "全局可销毁代币",
        type: "IssueCoin",
        name: "TestCoin",
        symbol: "TC",
        decimals: consts.default.tokenDecimals.toString(),
        total_supply: Total_Supply,
        local:false,
        flags: consts.flags.burnable,
        fee: "10",
    },
    config_mint_burn:{
        testName: "全局可增发可销毁代币",
        type: "IssueCoin",
        name: "TestCoin",
        symbol: "TC",
        decimals: consts.default.tokenDecimals.toString(),
        total_supply: Total_Supply,
        local:false,
        flags: consts.flags.both,
        fee: "10",
    },
    config_issuer_normal:{
        testName: "本地标准代币",
        type: "IssueCoin",
        name: "TestCoin",
        symbol: "TC",
        decimals: consts.default.tokenDecimals.toString(),
        total_supply: Total_Supply,
        local:true,
        flags: consts.flags.normal,
        fee: "10",
    },
    config_issuer_mintable:{
        testName: "本地可增发代币",
        type: "IssueCoin",
        name: "TestCoin",
        symbol: "TC",
        decimals: consts.default.tokenDecimals.toString(),
        total_supply: Total_Supply,
        local:true,
        flags: consts.flags.mintable,
        fee: "10",
    },
    config_issuer_burnable:{
        testName: "本地可销毁代币",
        type: "IssueCoin",
        name: "TestCoin",
        symbol: "TC",
        decimals: consts.default.tokenDecimals.toString(),
        total_supply: Total_Supply,
        local:true,
        flags: consts.flags.burnable,
        fee: "10",
    },
    config_issuer_mint_burn:{
        testName: "本地可增发可销毁代币",
        type: "IssueCoin",
        name: "TestCoin",
        symbol: "TC",
        decimals: consts.default.tokenDecimals.toString(),
        total_supply: Total_Supply,
        local:true,
        flags: consts.flags.both,
        fee: "10",
    },
    existToken:{
        name: "TestCoin1576652216",
        symbol: "5df9cdf0",
    },
    CNYT:{
        testName: "全局CNYT",
        type: "IssueCoin",
        name: "CNY Token",
        symbol: "CNYT",
        decimals: consts.default.tokenDecimals.toString(),
        total_supply: Total_Supply,
        local:false,  //it is global CNYT, local must be false.
        flags: consts.flags.both,
        fee: "10",
        issuer:"jjjjjjjjjjjjjjjjjjjjjhoLvTp",
    },
}

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

let ipfs_data = {
    data_upload:{
        "data_hash": "F5B92036DF885311D9196E418846F2DE58C25FA06BA489C0F1FA74D7B7D8A08C",
        "ipfs_hash": "QmdsfpkDoDvTNxWYes3qrRmHSbhy9Vth8X4EY5hdYmYkWu",
        "size": 29,
        "raw_data": "Test for upload data!",
    },
    data_download: {
        "data_hash": "EE4153929FA183010B7B710F46519B280774EE2863C08250A11A327878862C74",
        "ipfs_hash": "QmQmhX1RNKU9EhDGfqeu7VfcuPrZzGHHmdc7BegzfeH32t",
        "size": 129,
        "raw_data": "关于群众反映的涉及李文亮医生有关情况调查的通报\n中央纪委国家监委网站 2020-03-19 19:30:06\n",
    },
    data_remove: {
        "data_hash": "F4D538057EFD63186E0E0317F40F00761918867C211B872A32D57416214F380A",
        "ipfs_hash": "QmNvP3JHvM8tiGsVP41La2aHn69UJDD6Xcv1PtciSQRS9L",
        "size": 35,
        "raw_data": "Test for single valid hash!",
    },
    data_pin:{
        "data_hash": "C1FA7C142D2EAF19552032652013080D866AB5FD17FA4458BDCA61CB9059B308",
        "ipfs_hash": "QmcsNQ5YNv3tn8FBL5pzBDQMqjMLYdSknLMTEdhJYaoYQE",
        "size": 26,
        "raw_data": "Test for pin data!",
    },
    data_unpin: {
        "data_hash": "84DA8CF9D47932BB830D4328D442161102E2D561AB6F98B803C85FE0C8A463F0",
        "ipfs_hash": "QmbzJ1f1htbg1huWu8fyUShnTXDTJuznn1JjNABFodpXWq",
        "size": 28,
        "raw_data": "Test for unpin data!",
    },
    deleted_data_1: {  //has been deleted
        "data_hash": "E241DD748FF87D42E874C2531F9C51BC0200F7E03C14678D9069EA8B93926C49",
        "ipfs_hash": "QmXJ6aefqno3sX4sgSkE98cD3zBAvNpdQZtriP4sokvZqA",
        "size": 218,
        "raw_data": "李文亮，男，满族，1985年10月出生，辽宁锦州人，中共党员，工作中因感染新型冠状病毒引发肺炎于2020年2月7日不幸去世，生前系武汉市中心医院眼科医师。",
    },
    bad_data_1: {
        "ipfs_hash_too_short": "QmQmhX1RNKU9EhDGfqeu7VfcuPrZzGHHmdc7Begzfe",
        "ipfs_hash_too_long": "QmQmhX1RNKU9EhDGfqeu7VfcuPrZzGHHmdc7BegzfeH32taa",
    },
    poem_1:[
        {
            "raw_data": "此时此刻",
            "data_hash": "12A598F48C6E5FFBABCA3A786C9A0F18A412628BDF6D5D753FAD7624B0DD4AD4",
            "ipfs_hash": "QmZqiFPzRch5FFeTQEQYALHp36XhHysP64FpfS1YoDgDdU",
            "size": 20
        },
        {
            "raw_data": "此时此刻，\n外星人你们在干什么呢？",
            "data_hash": "B9A16F218CED8482A360250E254EE16D60ACC5F4CE74934A71D9F5656214B4B7",
            "ipfs_hash": "QmaQJeg188tGzFFyx2VhZdDYPr5n43uVV7pcYH8Ma382Aw",
            "size": 57
        },
        {
            "raw_data": "也许你们正在探索其他星球，\n是不是你们的太阳熄灭了而不得不踏上星际探索之旅呢？",
            "data_hash": "2BD118BFD1BC8353B84E4B4D8E7EB3E7BEF9B3D778C517A790948362D6BEB65F",
            "ipfs_hash": "QmdoJnCNb9oYCAqDPXrZrxQwPiXCr1BA6DdMqL7Fyk7jYX",
            "size": 123
        },
        {
            "raw_data": "也许你们的家乡有了病毒，\n是不是你们的白衣天使也在想办法消灭它呢？",
            "data_hash": "90E9136D154816191C5CE457455E2B021CBAAA40561007DBA6D8EA10750A7DF8",
            "ipfs_hash": "QmUQkMpNbJfbgE6v8KA9bAQqHwJAqfiNf9h5MKWDnkjTYE",
            "size": 105
        },
        {
            "raw_data": "也许你们正在打仗，\n是不是你们认为战争很有趣呢？",
            "data_hash": "5C5841D0DCF854E13A19592E8A13BC4B105D791D75362F96DD6EE6F69D2F1690",
            "ipfs_hash": "QmcdgSiSVTfy1QxRufewCYBZ3yzAGCCubqrKNoAXxnp98w",
            "size": 78
        },
        {
            "raw_data": "也许你们遇到了可怕的黑洞，\n是不是你们能轻易逃离那恐怖的引力呢？",
            "data_hash": "52AF573592A9F313FF203F4239FC4D88252C4734A2A340FC30F34D5B4C29BC11",
            "ipfs_hash": "QmVpbaHFYWgAJMYkF33gAjYFZ8bsgiUL1xbNrSPgKxkdtF",
            "size": 102
        },
        {
            "raw_data": "也许你们在保护着地球，\n是不是地球上有你们重视的东西呢？",
            "data_hash": "222B0C16483424BB3830D1483FFB609B6AB59D5E11C0D7AC74C274659F6F3100",
            "ipfs_hash": "QmRHBhnvk4YXxTzRySTqmgH5PET8jHeWgqamVSydVddrjZ",
            "size": 90
        },
        {
            "raw_data": "此时此刻，\n我仰望着蔚蓝的天空，\n不知你们能否听见我的疑问？",
            "data_hash": "268A068D0828873993B5E098AB09807942750924BE8869BC6D27F9F616555AC8",
            "ipfs_hash": "QmRoo5AzV5LpF7NtZJ45LuDj2FZ6rN6KEJ99Mby9S2RyHF",
            "size": 94
        }
    ],
    uploadFile_1: {
        data_hash: '949892EE22A7AEA90A3DA5B0804DB877C1474454BE2E08CDDF2310D6C99D0C8F',
        ipfs_hash: 'QmRgroG1sBJq3Uq8rXbD4UfQYnzBJ5fdHYkw39qo5D1C54',
        name: 'up1.txt',
        size: 21,
        raw_data: 'Test for upload file!'
    },
    uploadImage_1: {
        data_hash: '7551A0FED56A8BCA0C26FE8289F95F17FF41A6C40A71DC412E6F81615966198C',
        ipfs_hash: 'QmSMbSFseAVxMxsRnPESN6yLBoLqLQxsKe2nbyevZP15DW',
        name: 'image1.png',
        size: 2699,
        raw_data: ''
    },
}


module.exports = {
    chains,
    data,
    token,
    txs,
    blocks,
    ipfs_data,
}

