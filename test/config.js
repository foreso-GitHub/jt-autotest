//region require
let rpc = require('./framework/lib/rpc/rpcInterface.js')
let swtclib = require('./framework/lib/swtclib/swtclibInterface.js')
const { status,  serviceType,  interfaceType,  testMode,  restrictedLevel, } = require("./framework/enums")
const { data, token, txs, blocks } = require("./testData/testData")
//endregion

//const RPC_URL_7545 = 'http://139.198.191.254:7545/v1/jsonrpc'
//const RPC_URL_9545 = 'http://139.198.177.59:9545/v1/jsonrpc'
//主链： wss://c04.jingtum.com:5020
//基金会测试链： ws://139.198.19.157:5055
// jpmKEm2sUevfpFjS7QHdT8Sx7ZGoEXTJAz
// ssiUDhUpUZ5JDPWZ9Twt27Ckq6k4C

let rpc_7545 = new rpc()
let rpc_9545 = new rpc()
let rpc_box01 = new rpc()
let lib_main = new swtclib()
let lib_test = new swtclib()
let servers = [rpc_7545, rpc_9545, lib_main, lib_test]

let mode_rpc_newChain = {
    name: "rpc_9545",
    server: rpc_9545,
    initParams: {url:'http://139.198.177.59:9545/v1/jsonrpc'},
    service: serviceType.newChain,
    interface: interfaceType.rpc,
    testMode: testMode.batchMode,
    restrictedLevel: restrictedLevel.L3,
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
    blockNumber: '107621',
    blockHash: '2EBFABD8340E016ACD8E0C28E878532633E5893251B8410647A03A993747FDAF',
    txCountInBlock: 20,
    root: {address: "jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh", secret: "snoPBjXtMeMyMHUVTgbuqAfg1SUTb"},
}

let mode_rpc_box01 = {
    name: "rpc_box01",
    server: rpc_box01,
    initParams: {url:'http://box-admin.elerp.net:10201/v1/jsonrpc'},
    service: serviceType.newChain,
    interface: interfaceType.rpc,
    testMode: testMode.batchMode,
    restrictedLevel: restrictedLevel.L3,
    defaultBlockTime: 5000,
    retryPauseTime: 1000,
    retryMaxCount: 16,
    defaultValue: "1",
    defaultFee: "10",
    root: {address: "jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh", secret: "snoPBjXtMeMyMHUVTgbuqAfg1SUTb"},
}

let mode_rpc_box02 = {
    name: "rpc_box02",
    server: rpc_box01,
    initParams: {url:'http://box-admin.elerp.net:10201/v1/jsonrpc'},
    service: serviceType.newChain,
    interface: interfaceType.rpc,
    testMode: testMode.batchMode,
    restrictedLevel: restrictedLevel.L3,
    defaultBlockTime: 5000,
    retryPauseTime: 1000,
    retryMaxCount: 16,
    defaultValue: "1",
    defaultFee: "10",
    root: {address: "jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh", secret: "snoPBjXtMeMyMHUVTgbuqAfg1SUTb"},
}

let mode_rpc_ipfs = {
    name: "rpc_7545",
    server: rpc_7545,
    initParams: {url:'http://139.198.191.254:7545/v1/jsonrpc'},
    // initParams: {url:'http://139.198.177.59:7545/v1/jsonrpc'},
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
    root: {address: "jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh", secret: "snoPBjXtMeMyMHUVTgbuqAfg1SUTb"},
}

let mode_lib_mainnet = {
    name: "lib_main",
    server: lib_main,
    initParams: {url:'wss://c05.jingtum.com:5020', issuer:'jBciDE8Q3uJjf111VeiUNM775AMKHEbBLS'},
    service: serviceType.oldChain,
    interface: interfaceType.websocket,
    testMode: testMode.batchMode,
    restrictedLevel: restrictedLevel.L2,
    defaultBlockTime: 10000,
    retryPauseTime: 1000,
    retryMaxCount: 16,
    defaultFee: "10000",
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
    txCountInBlock: 9,
}

let mode_lib_testnet = {
    name: "lib_test",
    server: lib_test,
    initParams: {url:'ws://139.198.19.157:5055', issuer:'jBciDE8Q3uJjf111VeiUNM775AMKHEbBLS'},
    service: serviceType.oldChain,
    interface: interfaceType.websocket,
    testMode: testMode.batchMode,
    restrictedLevel: restrictedLevel.L2,
    defaultBlockTime: 10000,
    retryPauseTime: 1000,
    retryMaxCount: 16,
    defaultFee: "10000",
    txs:{
        tx1: data.swtclib_Test.tx,
        tx_memo: data.swtclib_Test.tx_memo,
        tx_token: data.swtclib_Test.tx_token,
        tx_issue_token: data.swtclib_Test.tx_issue_token,
    },
    blockNumber: '785909',
    blockHash: '928A72FA819C0812FA7BCCAB8A6EAB36830F40FC18E5F504CA61AB54514027BB',
    txCountInBlock: 1,
}

let modes = [
    // mode_rpc_newChain,
    mode_rpc_box01,
    // mode_rpc_ipfs,
    // mode_lib_mainnet,
    // mode_lib_testnet,
]

let allModes = [
    // mode_rpc_newChain,
    mode_rpc_box01,
    // mode_rpc_box02,
    // mode_rpc_ipfs,
    // mode_lib_mainnet,
    // mode_lib_testnet,
]

let configCommons = {
    test_data_path: ".\\test\\testData\\",
    test_data_backup_path: ".\\test\\testData\\backup\\",
    ipfs_test_files_path: ".\\test\\testData\\testFiles\\",
    accounts_js_file_path: ".\\test\\testData\\accounts.js",
    chain_data_js_file_path: ".\\test\\testData\\chainDatas.js",
}

module.exports = {
    configCommons,
    servers,
    modes,
    allModes,
}