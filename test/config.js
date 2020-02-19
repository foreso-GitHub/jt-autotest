let rpc = require('../lib/rpc/interfaces.js')
let swtclib = require('../lib/swtclib/swtclib-interface.js')
const { status,  serviceType,  interfaceType,  testMode,  restrictedLevel, } = require("./enums")
const { chains, addresses, data, token, txs, blocks } = require("./testData")

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
let servers = [rpc_7545, rpc_9545, lib_main]

let testConfig_newChain = {
    testMode: testMode.batchMode,
    restrictedLevel: restrictedLevel.L2,
    defaultBlockTime: 5000,
    retryPauseTime: 1000,
    retryMaxCount: 16,
    defaultFee: "10",
}

let testConfig_oldChain = {
    testMode: testMode.batchMode,
    restrictedLevel: restrictedLevel.L2,
    defaultBlockTime: 10000,
    retryPauseTime: 1000,
    retryMaxCount: 16,
    defaultFee: "10",
}

let modes = [
    {
        server: rpc_9545,
        initParams: {url:'http://139.198.177.59:9545/v1/jsonrpc'},
        service: serviceType.newChain,
        interface: interfaceType.rpc,
        testMode: testMode.batchMode,
        restrictedLevel: restrictedLevel.L2,
        defaultBlockTime: 5000,
        retryPauseTime: 1000,
        retryMaxCount: 16,
        defaultFee: "10",
        tx1: data.chain.tx,
        blockNumber: '107600',
        blockHash: '06DA6A9900FDBBCA1CBE8E9A2146ED8D664FE49102CCE5FAB3554AF0E72F6E38',
    },
    // {
    //     server: rpc_7545,
    //     initParams: {url:'http://139.198.191.254:7545/v1/jsonrpc'},
    //     service: serviceType.ipfs,
    //     interface: interfaceType.rpc,
    //     testConfig: testConfig_newChain,
    //     tx1: data.ipfs.tx,
    // },
    {
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
        tx1: data.chain.tx,
        blockNumber: '15190000',
        blockHash: '82DE81D806DCEC9140B9382C402967AEF879C76865C8714FF290A75344F973EB',
    },
    // {
    //     server: lib_test,
    //     initParams: {url:'ws://139.198.19.157:5055', issuer:'jBciDE8Q3uJjf111VeiUNM775AMKHEbBLS'},
    //     service: serviceType.oldChain,
    //     interface: interfaceType.websocket,
    //     testConfig: testConfig_oldChain,
    //     tx1: data.chain.tx,
    // },
]


module.exports = {
    servers,
    modes,
}