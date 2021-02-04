const SERVER_INFO_SCHEMA = {
    title: "test response of server info",
    type: "object",
    required: [
        "complete_ledgers",
        "ledger",
        "public_key",
        "state",
        "peers",
        "version"
    ],
    properties: {
        complete_ledgers: {
            type: "string"
        },
        ledger: {
            type: "string"
        },
        public_key: {
            type: "string"
        },
        state: {
            type: "string"
        },
        version: {
            type: "string"
        },
        peers: {
            type: "number"
        }
    }
}

const LEDGER_CLOSED_SCHEMA = {
    title: "test response of ledger closed",
    type: "object",
    required: ["ledger_hash", "ledger_index"],
    properties: {
        ledger_hash: {
            type: "string"
        },
        ledger_index: {
            type: "number"
        }
    }
}

const LEDGER_SCHEMA = {
    title: "test response of ledger",
    type: "object",
    required: [
        "accepted",
        "ledger_hash",
        "ledger_index",
        "parent_hash",
        "close_time",
        "total_coins"
    ],
    properties: {
        accepted: {
            type: "boolean"
        },
        ledger_hash: {
            type: "string"
        },
        ledger_index: {
            type: "string"
        },
        parent_hash: {
            type: "string"
        },
        total_coins: {
            type: "string"
        }
    }
}

const TX_SCHEMA = {
    title: "test response of tx",
    type: "object",
    required: [
        "Account",
        // "Destination",
        "TransactionType",
        "Flags",
        "Sequence",
        // "Amount",
        "Fee",
        // "Memos",
        "SigningPubKey",
        "TxnSignature",
        "hash",
        // todo need restore date, inLedger, ledger_index
        // "date",
        // "inLedger",
        // "ledger_index",
        // "meta",
        // "validated"
    ],
    properties: {
        //todo need add more checks
        Account: {
            "type": "string"
        },
        Destination: {
            "type": "string"
        },
        TransactionType: {
            "type": "string"
        },
        Flags: {
            "type": "integer"
        },
        Sequence: {
            "type": "integer"
        },
        Amount: {
            type: "object",
            required: ["value", "currency", "issuer"],
            properties: {
                value: {
                    type: "string"
                },
                currency: {
                    type: "string"
                },
                issuer: {
                    type: "string"
                },
            }
        },
        TotalSupply:{
            type: "object",
            required: ["value", "currency", "issuer"],
            properties: {
                value: {
                    type: "string"
                },
                currency: {
                    type: "string"
                },
                issuer: {
                    type: "string"
                },
            }
        },
        Fee: {
            "type": "string"
        },
        Memos: {
            "type": "array"
        },
        SigningPubKey: {
            "type": "string"
        },
        TxnSignature: {
            "type": "string"
        },
        date: {
            "type": "integer"
        },
        hash: {
            "type": "string"
        },
        inLedger: {
            "type": "integer"
        },
        ledger_index: {
            "type": "integer"
        },
        meta: {
            type: "object",
            required: ["AffectedNodes", "TransactionIndex", "TransactionResult"],
            properties: {
                AffectedNodes: {
                    type: "array"
                }
            }
        }
    }
}

const ACCOUNT_INFO_SCHEMA = {
    title: "test response of account info",
    type: "object",
    required: ["account_data", "ledger_hash", "ledger_index", "validated"],
    properties: {
        account_data: {
            type: "object",
            required: [
                "Account",
                "Balance",
                "Flags",
                "LedgerEntryType",
                "OwnerCount",
                "PreviousTxnID",
                "PreviousTxnLgrSeq",
                "Sequence",
                "index"
            ]
        }
    }
}

const ACCOUNT_TUMS_SCHEMA = {
    title: "test response of account tums",
    type: "object",
    required: [
        "ledger_hash",
        "ledger_index",
        "receive_currencies",
        "send_currencies",
        "validated"
    ],
    properties: {
        account_data: {
            type: "object",
            required: [
                "Account",
                "Balance",
                "Flags",
                "LedgerEntryType",
                "OwnerCount",
                "PreviousTxnID",
                "PreviousTxnLgrSeq",
                "Sequence",
                "index"
            ]
        },
        validated: {
            type: "boolean"
        },
        receive_currencies: {
            type: "array",
            minItems: 0,
            items: {
                type: "string"
            }
        },
        send_currencies: {
            type: "array",
            minItems: 0,
            items: {
                type: "string"
            }
        }
    }
}

const ACCOUNT_RELATIONS_SCHEMA = {
    title: "test response of account relations",
    type: "object",
    required: ["account", "ledger_index", "lines", "validated", "ledger_hash"],
    properties: {
        lines: {
            type: "array",
            minItems: 0,
            items: {
                type: "object",
                required: [
                    "account",
                    "balance",
                    "currency",
                    "limit",
                    "limit_peer",
                    "no_skywell",
                    "quality_in",
                    "quality_out"
                ]
            }
        },
        account: {
            type: "string"
        },
        ledger_index: {
            type: "number"
        },
        validated: {
            type: "boolean"
        },
        ledger_hash: {
            type: "string"
        }
    }
}

const ACCOUNT_OFFERS_SCHEMA = {
    title: "test response of account offers",
    type: "object",
    required: ["account", "ledger_index", "ledger_hash", "offers", "validated"],
    properties: {
        account: {
            type: "string"
        },
        ledger_index: {
            type: "number"
        },
        ledger_hash: {
            type: "string"
        },
        offers: {
            type: "array",
            minItems: 0,
            item: {
                type: "object",
                required: ["flags", "seq", "taker_gets", "taker_pays"]
            }
        },
        validated: {
            type: "boolean"
        }
    }
}

const ACCOUNT_TX_SCHEMA = {
    title: "test response of account tx",
    type: "object",
    required: ["account", "ledger_index_max", "ledger_index_min", "transactions"],
    properties: {
        transactions: {
            type: "array",
            item: {
                type: "object",
                required: [
                    "date",
                    "hash",
                    "type",
                    "fee",
                    "result",
                    "memos",
                    "counterparty",
                    "amount",
                    "effects"
                ]
            }
        }
    }
}

const ORDER_BOOK_SECHEMA = {
    title: "test response of order book",
    type: "object",
    required: ["ledger_current_index", "offers", "validated"],
    properties: {
        offers: {
            type: "array",
            item: {
                type: "object",
                required: [
                    "Account",
                    "BookDirectory",
                    "BookNode",
                    "Flags",
                    "LedgerEntryType",
                    "OwnerNode",
                    "PreviousTxnID",
                    "PreviousTxnLgrSeq",
                    "Sequence",
                    "TakerGets",
                    "TakerPays",
                    "index",
                    "owner_funds",
                    "quality"
                ]
            }
        }
    }
}

const PATH_FIND_SCHEMA = {
    title: "test response of path",
    type: "array",
    item: {
        type: "object",
        required: ["choice", "key"],
        properties: {
            choice: {
                type: "object",
                required: ["currency", "issuer", "value"]
            },
            key: {
                type: "string"
            }
        }
    }
}

const ORDER_SCHEMA = {
    title: "test response of creating order",
    type: "object",
    required: [
        "engine_result",
        "engine_result_code",
        "engine_result_message",
        "tx_blob",
        "tx_json"
    ],
    properties: {
        tx_json: {
            type: "object",
            required: [
                "Account",
                "Fee",
                "Flags",
                "Sequence",
                "SigningPubKey",
                "TakerGets",
                "TakerPays",
                "TransactionType",
                "TxnSignature",
                "hash"
            ]
        }
    }
}

const PAYMENT_SCHEMA = {
    title: "test response of payment",
    type: "object",
    required: [
        "engine_result",
        "engine_result_code",
        "engine_result_message",
        "tx_blob",
        "tx_json"
    ],
    properties: {
        tx_json: {
            type: "object",
            required: [
                "Account",
                "Amount",
                "Destination",
                "Fee",
                "Flags",
                "Memos",
                "Sequence",
                "SigningPubKey",
                "TransactionType",
                "TxnSignature",
                "hash"
            ]
        }
    }
}

const RESPONSE_SCHEMA = {
    title: "test response schema",
    type: "object",
    required: [
        "id",
        "jsonrpc",
        "result",  //todo: need restore when get functions support compound result
        // "type",
        // "status",
    ],
    properties: {
        id: {
            type: "integer"
        },
        jsonrpc: {
            type: "string"
        },
        // result: {
        //     type: "array",
        //     minItems: 0,
        // },
        type: {
            type: "string"
        },
        status: {
            type: "integer"
        },
        error: {
            type: "object"
        },
    },
}

const GET_RESPONSE_SCHEMA = {  //todo: need combine with RESPONSE_SCHEMA when get function has result
    title: "test response schema",
    type: "object",
    required: [
        "id",
        "jsonrpc",
        // "result",
        // "type",
        // "status",
    ],
    properties: {
        id: {
            type: "integer"
        },
        jsonrpc: {
            type: "string"
        },
        // result: {
        //     type: "array",
        //     minItems: 0,
        // },
        type: {
            type: "string"
        },
        status: {
            type: "integer"
        },
        error: {
            type: "object"
        },
    },
}

// const ERROR_SCHEMA = {
//     title: "test response error item schema",
//     type: "object",
//     required: [
//         "error",
//         "type",
//         "status",
//     ],
//     properties: {
//         error: {
//             type: "object"
//         },
//         type: {
//             type: "string"
//         },
//         status: {
//             type: "integer"
//         },
//     },
// }

const ERROR_SCHEMA = {
    title: "test response error item schema",
    type: "object",
    required: [
        "error",
        "type",
        "status",
    ],
    properties: {
        error: {
            type: "object",
            required: [
                "desc",
                "info",
                // "message",
            ],
            properties: {
                count: {
                    type: "integer"
                },
                desc: {
                    type: "string"
                },
                info: {
                    type: "string"
                },
                message: {
                    type: "object"
                },
            }
        },
        type: {
            type: "string"
        },
        status: {
            type: "integer"
        },
    },
}

const BLOCKNUMBER_NUMBER_SCHEMA = {
    title: "test response of jt_blockNumber",
    type: "integer",
}

const BLOCKNUMBER_INFO_SCHEMA = {
    title: "test response of jt_blockNumber",
    type: "array",
    minItems: 2,
    item: {
        type: "integer",
    }
}

const VERSION_TXT_SCHEMA = {
    title: "test response of jt_version, txt format",
    type: "string",
}

const VERSION_JSON_SCHEMA = {
    title: "test response of jt_version",
    type: "object",
    required: [
        "checksum",
        "time",
        "version",
    ],
    properties: {
        checksum: {
            "type": "string"
        },
        time: {
            "type": "string"
        },
        version: {
            "type": "string"
        },
    },
}

//{"balance":"10000100003"}
// const BALANCE_SCHEMA = {
//     title: "test response of jt_getBalance",
//     type: "object",
//     required: [
//         "balance"
//     ],
//     properties: {
//         balance: {
//             "type": "string"
//         }
//     },
// }

// {
//     "balance": {
//     "currency": "5e69b0cc"
//     "issuer": "jjjjjjjjjjjjjjjjjjjjjhoLvTp"
//     "value": "1000000"
// }
// }

const BALANCE_SCHEMA = {
    title: "test response of jt_getBalance, for token",
    type: "object",
    required: [
        "balance"
    ],
    properties: {
        balance: {
            currency: {
                "type": "string"
            },
            issuer: {
                "type": "integer"
            },
            value: {
                "type": "string"
            },
        },
    },
}

const WALLET_SCHEMA = {
    title: "test response of jt_createWallet and jt_createAccount",
    type: "object",
    properties: {
        "address": {
            "type": "string"
        },
        "secret": {
            "type": "string"
        },
        "type": {
            "type": "string"
        },
        "nickname": {
            "type": "string"
        },
    },
    required: [
        "address",
        "secret",
        "type",
    ]
}

const ACCOUNT_SCHEMA = {
    title: "test response of jt_getAccount",
    type: "object",
    required: [
        "Account",
        "Balance",
        "Hash",
        "LedgerEntryType",
        "Sequence",
    ],
    properties: {
        "Account": {
            "type": "string"
        },
        "Balance": {
            type: "object",
            required: [
                "currency",
                "issuer",
                "value",
            ],
            properties: {
                "currency": {
                    "type": "string"
                },
                "issuer": {
                    "type": "string"
                },
                "value": {
                    "type": "string"
                },
            },
        },
        "Hash": {
            "type": "string"
        },
        "LedgerEntryType": {
            "type": "string"
        },
        "Sequence": {
            "type": "integer"
        },
    },
}

const ACCOUNTS_SCHEMA = {
    title: "test response of jt_getAccount",
    type: "array",
    minItems: 0,
    items: {
        type: "string"
    }
}

const CURRENCY_SCHEMA = {
    title: "test response of jt_getCurrency",
    type: "object",
    required: [
        "LedgerEntryType",
        "Flags",
        "Hash",
        "Account",
        "Sequence",
        "Name",
        "Decimals",
        "TotalSupply",
    ],
    properties: {
        "LedgerEntryType": {
            "type": "string"
        },
        "Flags": {
            "type": "integer"
        },
        "Hash": {
            "type": "string"
        },
        "Account": {
            "type": "string"
        },
        "Sequence": {
            "type": "integer"
        },
        "Name": {
            "type": "string"
        },
        "Decimals": {
            "type": "integer"
        },
        "TotalSupply": {
            type: "object",
            required: [
                "currency",
                "issuer",
                "value",
            ],
            properties: {
                "currency": {
                    "type": "string"
                },
                "issuer": {
                    "type": "string"
                },
                "value": {
                    "type": "string"
                },
            },
        },
    },
}

const RECEIPT_SCHEMA = {
    title: "test response of jt_getCurrency",
    type: "object",
    required: [
        "AffectedNodes",
        "TransactionIndex",
        "TransactionResult",
    ],
    properties: {
        "AffectedNodes": {
            type: "array",
            minItems: 0,
            items: {
                type: "object",
                required: [
                    "ModifiedNode",
                ],
                properties: {
                    "ModifiedNode": {
                        "type": "object"
                    },
                },
            }

        },
        "TransactionIndex": {
            "type": "integer"
        },
        "TransactionResult": {
            "type": "string"
        },
    },
}

//todo need be replaced by SENDTX_SCHEMA
const OLD_SENDTX_SCHEMA = {
    title: "test response of jt_sendTransaction",
    type: "object",
    required: [
        "id",
        "jsonrpc",
        "result",
        // "status",
    ],
    properties: {
        id: {
            type: "integer"
        },
        jsonrpc: {
            type: "string"
        },
        result: {
            type: "array",
            minItems: 0,
            items: {
                type: "object"
            }
        },
        status: {
            type: "integer"
        },
    },
}

const SENDTX_SCHEMA = {
    title: "test response of jt_sendTransaction",
    type: "object",
    required: [
        "id",
        "jsonrpc",
        // "result",
        // "status",
    ],
    properties: {
        id: {
            type: "integer"
        },
        jsonrpc: {
            type: "string"
        },
        result: {
            engine_result: {
                "type": "string"
            },
            engine_result_code: {
                "type": "integer"
            },
            engine_result_message: {
                "type": "string"
            },
            hash: {
                "type": "string"
            },
        },
        status: {
            type: "integer"
        },
    },
}

const SIGNTX_SCHEMA = {
    title: "test response of jt_signTransaction",
    type: "object",
    required: [
        "id",
        "jsonrpc",
        "result",
        // "status",
    ],
    properties: {
        id: {
            type: "integer"
        },
        jsonrpc: {
            type: "string"
        },
        result: {
            type: "array",
            minItems: 0,
            items: {
                type: "object"
            }
        },
        status: {
            type: "integer"
        },
    },
}

//region ipfs schemas

const NODEINFO_SCHEMA = {
    title: "test response of sw_nodeInfo",
    type: "object",
    required: [
        "id",
        "jsonrpc",
        "result",
        // "status",
    ],
    properties: {
        id: {
            type: "integer"
        },
        jsonrpc: {
            type: "string"
        },
        result: {
            type: "object",
            required: [
                "max",
                "usage",
            ],
            properties: {
                max: {
                    type: "integer"
                },
                usage: {
                    type: "integer"
                },
            },
        },
        status: {
            type: "integer"
        },
    },
}

const UPLOAD_DATA_SCHEMA = {
    title: "test response of sw_uploadData",
    type: "object",
    required: [
        "id",
        "jsonrpc",
        "result",
        // "status",
    ],
    properties: {
        id: {
            type: "integer"
        },
        jsonrpc: {
            type: "string"
        },
        result: {
            type: "array",
            minItems: 0,
            items: {
                type: "object",
                required: [
                    "data_hash",
                    "ipfs_hash",
                    "size",
                ],
                properties: {
                    data_hash: {
                        type: "string"
                    },
                    ipfs_hash: {
                        type: "string"
                    },
                    size: {
                        type: "integer"
                    },
                },
            },
        },
        status: {
            type: "integer"
        },
    },
}

const DOWNLOAD_DATA_SCHEMA = {
    title: "test response of sw_downloadData",
    type: "object",
    required: [
        "id",
        "jsonrpc",
        "result",
        // "status",
    ],
    properties: {
        id: {
            type: "integer"
        },
        jsonrpc: {
            type: "string"
        },
        result: {
            type: "array",
            minItems: 0,
            items: {
                type: "string"
            }
        },
        status: {
            type: "integer"
        },
    },
}

const REMOVE_DATA_SCHEMA = {
    title: "test response of sw_removeData",
    type: "object",
    required: [
        "id",
        "jsonrpc",
        "result",
        // "status",
    ],
    properties: {
        id: {
            type: "integer"
        },
        jsonrpc: {
            type: "string"
        },
        result: {
            type: "array",
            minItems: 0,
            items: {
                type: "string"
            }
        },
        status: {
            type: "integer"
        },
    },
}

const UPLOAD_FILE_SCHEMA = {
    title: "test response of sw_uploadFile",
    type: "object",
    required: [
        "id",
        "jsonrpc",
        "result",
        // "status",
    ],
    properties: {
        id: {
            type: "integer"
        },
        jsonrpc: {
            type: "string"
        },
        result: {
            type: "array",
            minItems: 0,
            items: {
                type: "object",
                required: [
                    "data_hash",
                    "ipfs_hash",
                    "name",
                    "size",
                ],
                properties: {
                    data_hash: {
                        type: "string"
                    },
                    ipfs_hash: {
                        type: "string"
                    },
                    name: {
                        type: "string"
                    },
                    size: {
                        type: "integer"
                    },
                },
            },
        },
        status: {
            type: "integer"
        },
    },
}

const DOWNLOAD_FILE_SCHEMA = {
    title: "test response of sw_downloadFile",
    type: "string",
}

//endregion

module.exports = {
    SERVER_INFO_SCHEMA,
    LEDGER_CLOSED_SCHEMA,
    LEDGER_SCHEMA,
    TX_SCHEMA,
    ACCOUNT_INFO_SCHEMA,
    ACCOUNT_TUMS_SCHEMA,
    ACCOUNT_RELATIONS_SCHEMA,
    ACCOUNT_OFFERS_SCHEMA,
    ACCOUNT_TX_SCHEMA,
    ORDER_BOOK_SECHEMA,
    PATH_FIND_SCHEMA,
    ORDER_SCHEMA,
    PAYMENT_SCHEMA,
    BLOCKNUMBER_NUMBER_SCHEMA,
    BLOCKNUMBER_INFO_SCHEMA,
    VERSION_TXT_SCHEMA,
    VERSION_JSON_SCHEMA,
    BALANCE_SCHEMA,
    WALLET_SCHEMA,
    ACCOUNT_SCHEMA,
    ACCOUNTS_SCHEMA,
    CURRENCY_SCHEMA,
    RECEIPT_SCHEMA,
    RESPONSE_SCHEMA,
    GET_RESPONSE_SCHEMA,
    ERROR_SCHEMA,
    SENDTX_SCHEMA,
    SIGNTX_SCHEMA,
    OLD_SENDTX_SCHEMA,
    UPLOAD_DATA_SCHEMA,
    DOWNLOAD_DATA_SCHEMA,
    NODEINFO_SCHEMA,
    REMOVE_DATA_SCHEMA,
    UPLOAD_FILE_SCHEMA,
    DOWNLOAD_FILE_SCHEMA,
}
