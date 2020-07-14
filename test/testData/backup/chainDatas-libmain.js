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
]
module.exports = { chainDatas }