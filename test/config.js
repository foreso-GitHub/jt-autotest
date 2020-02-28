//region require
let rpc = require('../lib/rpc/rpcInterface.js')
let swtclib = require('../lib/swtclib/swtclibInterface.js')
const { status,  serviceType,  interfaceType,  testMode,  restrictedLevel, } = require("./enums")
const { chains, addresses, data, token, txs, blocks } = require("./testData")
//endregion

//const RPC_URL_7545 = 'http://139.198.191.254:7545/v1/jsonrpc'
//const RPC_URL_9545 = 'http://139.198.177.59:9545/v1/jsonrpc'
//主链： wss://c04.jingtum.com:5020
//基金会测试链： ws://139.198.19.157:5055
// jpmKEm2sUevfpFjS7QHdT8Sx7ZGoEXTJAz
// ssiUDhUpUZ5JDPWZ9Twt27Ckq6k4C

let rpc_7545 = new rpc()
let rpc_9545 = new rpc()
let lib_main = new swtclib()
let lib_test = new swtclib()
let servers = [rpc_7545, rpc_9545, lib_main, lib_test]

let mode_rpc_newChain = {
    server: rpc_9545,
    initParams: {url:'http://139.198.177.59:9545/v1/jsonrpc'},
    service: serviceType.newChain,
    interface: interfaceType.rpc,
    testMode: testMode.batchMode,
    restrictedLevel: restrictedLevel.L2,
    defaultBlockTime: 5000,
    retryPauseTime: 1000,
    retryMaxCount: 16,
    defaultValue: "1",
    defaultFee: "10",
    txs:{
        tx1: data.chain.tx,
        tx_memo: data.chain.tx_memo,
        tx_token: data.chain.tx_token,
        tx_issue_token: data.chain.tx_issue_token
    },
    blockNumber: '107600',
    blockHash: '06DA6A9900FDBBCA1CBE8E9A2146ED8D664FE49102CCE5FAB3554AF0E72F6E38',
}

let mode_rpc_ipfs = {
    server: rpc_7545,
    initParams: {url:'http://139.198.191.254:7545/v1/jsonrpc'},
    service: serviceType.ipfs,
    interface: interfaceType.rpc,
    testMode: testMode.batchMode,
    restrictedLevel: restrictedLevel.L2,
    defaultBlockTime: 5000,
    retryPauseTime: 1000,
    retryMaxCount: 16,
    defaultFee: "10",
    txs:{
        tx1: data.chain.tx,
        tx_memo: data.chain.tx_memo,
        tx_token: data.chain.tx_token,
        tx_issue_token: data.chain.tx_issue_token
    },
    blockNumber: '107600',
    blockHash: '06DA6A9900FDBBCA1CBE8E9A2146ED8D664FE49102CCE5FAB3554AF0E72F6E38',
}

let mode_lib_mainnet = {
        server: lib_main,
        initParams: {url:'wss://c05.jingtum.com:5020', issuer:'jBciDE8Q3uJjf111VeiUNM775AMKHEbBLS'},
        service: serviceType.oldChain,
        interface: interfaceType.websocket,
        testMode: testMode.batchMode,
        restrictedLevel: restrictedLevel.L2,
        defaultBlockTime: 10000,
        retryPauseTime: 1000,
        retryMaxCount: 16,
        defaultFee: "10",
        txs:{
            tx1: data.swtclib_Main.tx,
            tx_memo: data.swtclib_Main.tx_memo,
            tx_token: data.swtclib_Main.tx_token,
            tx_issue_token: data.swtclib_Main.tx_issue_token,
        },
        // blockNumber: '15190000',
        // blockHash: '82DE81D806DCEC9140B9382C402967AEF879C76865C8714FF290A75344F973EB',
        blockNumber: '15267011',
        blockHash: 'FF9D1723299F7314462F3B366215B5F52176CD78651AB2F51373068EC5A8B041',
    }

let mode_lib_testnet = {
    server: lib_test,
    initParams: {url:'ws://139.198.19.157:5055', issuer:'jBciDE8Q3uJjf111VeiUNM775AMKHEbBLS'},
    service: serviceType.oldChain,
    interface: interfaceType.websocket,
    testMode: testMode.batchMode,
    restrictedLevel: restrictedLevel.L2,
    defaultBlockTime: 10000,
    retryPauseTime: 1000,
    retryMaxCount: 16,
    defaultFee: "10",
    txs:{
        tx1: data.swtclib_Test.tx,
        tx_memo: data.swtclib_Test.tx_memo,
        tx_token: data.swtclib_Test.tx_token,
        tx_issue_token: data.swtclib_Test.tx_issue_token,
    },
    blockNumber: '785909',
    blockHash: '928A72FA819C0812FA7BCCAB8A6EAB36830F40FC18E5F504CA61AB54514027BB',
}

let modes = [
    mode_rpc_newChain,
    // mode_rpc_ipfs,
    // mode_lib_mainnet,
    // mode_lib_testnet,
]


module.exports = {
    servers,
    modes,
}