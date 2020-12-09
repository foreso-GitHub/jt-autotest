//region require
let rpc = require('../framework/lib/rpc/rpcInterface.js')
let ws = require('../framework/lib/ws/websocketInterface.js')
let swtclib = require('../framework/lib/swtclib/swtclibInterface.js')
const { status,  serviceType,  interfaceType,  testMode,  restrictedLevel, } = require("../framework/enums")
const { data, token, txs, blocks } = require("../testData/testData")
let sshCmd = require('../framework/sshCmd')
let HashMap = require('hashmap')
//endregion

//region init

//const RPC_URL_7545 = 'http://139.198.191.254:7545/v1/jsonrpc'
//const RPC_URL_9545 = 'http://139.198.177.59:9545/v1/jsonrpc'
//主链： wss://c04.jingtum.com:5020
//基金会测试链： ws://139.198.19.157:5055
// jpmKEm2sUevfpFjS7QHdT8Sx7ZGoEXTJAz
// ssiUDhUpUZ5JDPWZ9Twt27Ckq6k4C

let rpc_7545 = new rpc()
let rpc_9545 = new rpc()
let rpc_box01 = new rpc()

let rpc_yun_ali = new rpc()
let rpc_yun_baidu = new rpc()
let rpc_yun_tengxun = new rpc()
let rpc_yun_huawei = new rpc()
let rpc_yun_tianyi = new rpc()

let ws_yun_ali = new ws()
let ws_yun_baidu = new ws()
let ws_yun_tengxun = new ws()
let ws_yun_huawei = new ws()
let ws_yun_tianyi = new ws()

let lib_main = new swtclib()
let lib_test = new swtclib()
let servers = [rpc_7545, rpc_9545, lib_main, lib_test]

//endregion

//region old config
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

//endregion

//region box config

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
    initParams: {url:'http://box-admin.elerp.net:10202/v1/jsonrpc'},
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

//endregion

//region cloud config

cloneMode = function(mode){
    return JSON.parse(JSON.stringify(mode))
}

//region rpc
let mode_rpc_yun_ali = mode_template = {
    name: "rpc_yun_ali",
    server: rpc_yun_ali,
    initParams: {url:'http://121.89.209.19:9545/v1/jsonrpc'},
    chainDataName: "rpc_yun_chain_data",
    accountsName: "rpc_yun_chain_accounts",
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
    coins: [
        {name:'TestCoin_global_2', symbol:'TSC_2', issuer:'jjjjjjjjjjjjjjjjjjjjjhoLvTp'},
        {name:'TestCoin_local_3', symbol:'TSC_3', issuer:'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh'},
        {name:'TestCoin_same_global_1', symbol:'TSC_SAME_1', issuer:'jjjjjjjjjjjjjjjjjjjjjhoLvTp'},
        {name:'TestCoin_same_local_1', symbol:'TSC_SAME_1', issuer:'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh'},
        {name:'TestCoin_existed_4', symbol:'TSC_4', issuer:'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh'},
    ],
}

let mode_rpc_yun_baidu = cloneMode(mode_template)
mode_rpc_yun_baidu.name = "rpc_yun_baidu"
mode_rpc_yun_baidu.server = rpc_yun_baidu
mode_rpc_yun_baidu.initParams = {url:'http://180.76.125.22:9545/v1/jsonrpc'}

let mode_rpc_yun_tengxun  = cloneMode(mode_template)
mode_rpc_yun_tengxun.name = "rpc_yun_tengxun"
mode_rpc_yun_tengxun.server = rpc_yun_tengxun
mode_rpc_yun_tengxun.initParams = {url:'http://45.40.240.50:9545/v1/jsonrpc'}

let mode_rpc_yun_huawei  = cloneMode(mode_template)
mode_rpc_yun_huawei.name = "rpc_yun_huawei"
mode_rpc_yun_huawei.server = rpc_yun_huawei
mode_rpc_yun_huawei.initParams = {url:'http://121.37.216.100:9545/v1/jsonrpc'}

let mode_rpc_yun_tianyi  = cloneMode(mode_template)
mode_rpc_yun_tianyi.name = "rpc_yun_tianyi"
mode_rpc_yun_tianyi.server = rpc_yun_tianyi
mode_rpc_yun_tianyi.initParams = {url:'http://61.171.12.71:9545/v1/jsonrpc'}

//endregion

//region ws
let mode_ws_yun_ali = cloneMode(mode_template)
mode_ws_yun_ali.name = "ws_yun_ali"
mode_ws_yun_ali.server = ws_yun_ali
mode_ws_yun_ali.initParams = {url:'ws://121.89.209.19:9546/v1/jsonrpc'}
mode_ws_yun_ali.interface = interfaceType.websocket

let mode_ws_yun_baidu = cloneMode(mode_ws_yun_ali)
mode_ws_yun_baidu.name = "ws_yun_baidu"
mode_ws_yun_baidu.server = ws_yun_baidu
mode_ws_yun_baidu.initParams =  {url:'ws://180.76.125.22:9546/v1/jsonrpc'}

let mode_ws_yun_tengxun = cloneMode(mode_ws_yun_ali)
mode_ws_yun_tengxun.name = "ws_yun_tengxun"
mode_ws_yun_tengxun.server = ws_yun_tengxun
mode_ws_yun_tengxun.initParams = {url:'ws://45.40.240.50:9546/v1/jsonrpc'}

let mode_ws_yun_huawei = cloneMode(mode_ws_yun_ali)
mode_ws_yun_huawei.name = "ws_yun_huawei"
mode_ws_yun_huawei.server = ws_yun_huawei
mode_ws_yun_huawei.initParams = {url:'ws://121.37.216.100:9546/v1/jsonrpc'}

let mode_ws_yun_tianyi = cloneMode(mode_ws_yun_ali)
mode_ws_yun_tianyi.name = "ws_yun_tianyi"
mode_ws_yun_tianyi.server = ws_yun_tianyi
mode_ws_yun_tianyi.initParams = {url:'ws://61.171.12.71:9546/v1/jsonrpc'}

//endregion

//endregion

//region current jingtum config

let mode_lib_mainnet = {
    name: "lib_main",
    server: lib_main,
    initParams: {url:'wss://c02.jingtum.com:5020', issuer:'jBciDE8Q3uJjf111VeiUNM775AMKHEbBLS'},
    chainDataName: "lib_main",
    accountsName: "lib_main",
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

//endregion

//region modes
let modes = [
    // mode_rpc_yun_ali,
    // mode_rpc_yun_baidu,
    // mode_rpc_yun_tengxun,
    // mode_rpc_yun_huawei,
    // mode_rpc_yun_tianyi,

    mode_ws_yun_ali,
    // mode_ws_yun_baidu,
    // mode_ws_yun_tengxun,
    // mode_ws_yun_huawei,
    // mode_ws_yun_tianyi,

    // mode_rpc_newChain,
    // mode_rpc_box01,
    // mode_rpc_ipfs,
    // mode_lib_mainnet,
    // mode_lib_testnet,
]

let allModes = [
    mode_rpc_yun_ali,
    mode_rpc_yun_baidu,
    mode_rpc_yun_tengxun,
    mode_rpc_yun_huawei,
    mode_rpc_yun_tianyi,

    mode_ws_yun_ali,
    mode_ws_yun_baidu,
    mode_ws_yun_tengxun,
    mode_ws_yun_huawei,
    mode_ws_yun_tianyi,

    // mode_rpc_newChain,
    // mode_rpc_box01,
    // mode_rpc_box02,
    // mode_rpc_ipfs,
    mode_lib_mainnet,
    // mode_lib_testnet,
]
//endregion

//region set jt nodes
//region paths
const cmds_path = '/root/cmds/'
const cmds_path_tx = '/home/ubuntu/cmds/'
// const cmds_delay_path = 'delay/'
// const cmds_loss_path = 'loss/'
// const cmds_duplicate_path = 'duplicate/'
// const cmds_corrupt_path = 'corrupt/'
// const cmds_reorder_path = 'reorder/'
//endregion
//region commands
const cmd_start = 'start.sh'
const cmd_stop = 'stop.sh'

const cmd_openP2P = 'open7001.sh'
const cmd_closeP2P = 'close7001.sh'
const cmd_showIptables = 'iptables -nL'
const cmd_resetIptables = 'iptables -F'

const cmd_resetTc = 'resetTc.sh'
const cmd_showTc = 'showTc.sh'
const cmd_delay0_1_5 = 'delay/delay0_1_5.sh'
const cmd_delay1s = 'delay/delay1s.sh'
const cmd_delay6s = 'delay/delay6s.sh'
const cmd_loss30 = 'loss/loss30.sh'
const cmd_duplicate30 = 'duplicate/duplicate30.sh'
const cmd_corrupt30 = 'corrupt/corrupt30.sh'
const cmd_reorder30 = 'reorder/reorder30.sh'
//endregion

const cmds = {start: 'sudo ' + cmds_path + cmd_start, stop: 'sudo ' + cmds_path + cmd_stop,
    resetNet: 'sudo ' + cmd_resetIptables, showNet: 'sudo ' + cmd_showIptables,
    openP2P: 'sudo ' + cmds_path + cmd_openP2P, closeP2P: 'sudo ' + cmds_path + cmd_closeP2P,
    resetTc: 'sudo ' + cmds_path + cmd_resetTc, showTc: 'sudo ' + cmds_path + cmd_showTc,
    delay0_1_5: 'sudo ' + cmds_path + cmd_delay0_1_5,
    delay1s: 'sudo ' + cmds_path + cmd_delay1s, delay6s: 'sudo ' + cmds_path + cmd_delay6s,
    loss30: 'sudo ' + cmds_path + cmd_loss30, duplicate30: 'sudo ' + cmds_path + cmd_duplicate30,
    corrupt30: 'sudo ' + cmds_path + cmd_corrupt30, reorder30: 'sudo ' + cmds_path + cmd_reorder30, }

const cmds_tx = {start: 'sudo ' + cmds_path_tx + cmd_start, stop: 'sudo ' + cmds_path_tx + cmd_stop,
    resetNet: 'sudo ' + cmd_resetIptables, showNet: 'sudo ' + cmd_showIptables,
    openP2P: 'sudo ' + cmds_path_tx + cmd_openP2P, closeP2P: 'sudo ' + cmds_path_tx + cmd_closeP2P,
    resetTc: 'sudo ' + cmds_path_tx + cmd_resetTc, showTc: 'sudo ' + cmds_path_tx + cmd_showTc,
    delay0_1_5: 'sudo ' + cmds_path_tx + cmd_delay0_1_5,
    delay1s: 'sudo ' + cmds_path_tx + cmd_delay1s, delay6s: 'sudo ' + cmds_path_tx + cmd_delay6s,
    loss30: 'sudo ' + cmds_path_tx + cmd_loss30, duplicate30: 'sudo ' + cmds_path_tx + cmd_duplicate30,
    corrupt30: 'sudo ' + cmds_path_tx + cmd_corrupt30, reorder30: 'sudo ' + cmds_path_tx + cmd_reorder30,}

let jt_node_al = sshCmd.createService('al', '121.89.209.19', '22', '9545',
    'root', 'Lianjing@123456', cmds)
let jt_node_bd = sshCmd.createService('bd', '180.76.125.22', '22', '9545',
    'root', 'Lianjing@123456', cmds)
let jt_node_tx = sshCmd.createService('tx', '45.40.240.50', '22', '9545',
    'ubuntu', 'x6spfYUvtE^tjCAf', cmds_tx)
let jt_node_hw = sshCmd.createService('hw', '121.37.216.100', '22', '9545',
    'root', 'Lianjing@123456', cmds)
let jt_node_ty = sshCmd.createService('ty', '61.171.12.71', '22', '9545',
    'root', 'Lianjing@13579', cmds)

let nodes = []
nodes.push(jt_node_bd)
nodes.push(jt_node_tx)
nodes.push(jt_node_hw)
nodes.push(jt_node_ty)
nodes.push(jt_node_al)
let jtNodes = nodes
//endregion

//region set cmd
// let sshCommands = new HashMap()
// const cmd_start_jt = 'sudo /root/start.sh'
// const cmd_stop_jt = 'sudo /root/stop.sh'
// sshCommands.set('start', cmd_start_jt)
// sshCommands.set('stop', cmd_stop_jt)
//endregion

module.exports = {
    servers,
    modes,
    allModes,
    jtNodes,
}