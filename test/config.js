var rpc = require('../lib/rpc/interfaces.js')
const consts = require('../lib/rpc/consts')
const { status,  serviceType,  interfaceType,  testMode,  restrictedLevel, } = require("./enums")
const { chains, addresses, data, token, txs, blocks } = require("./testData")

const RPC_URL_7545 = 'http://139.198.191.254:7545/v1/jsonrpc'
const RPC_URL_9545 = 'http://139.198.177.59:9545/v1/jsonrpc'

let rpc_7545 = new rpc()
let rpc_9545 = new rpc()
let servers = [rpc_7545, rpc_9545]

let testConfig = {
    testMode: testMode.batchMode,
    defaultBlockTime: 5000,
    retryPauseTime: 1000,
    retryMaxCount: 16,
    defaultFee: "10",
}

let modes = [
    {
        server: rpc_9545,
        url: RPC_URL_9545,
        service: serviceType.newChain,
        interface: interfaceType.rpc,
        tx1: data.chain.tx,
    },
    // {
    //     server: rpc_7545,
    //     url: RPC_URL_7545,
    //     service: serviceType.ipfs,
    //     interface: interfaceType.rpc,
    //     tx1: data.ipfs.tx,
    // },
]


module.exports = {
    servers,
    testConfig,
    modes,
}