//region require
const chai = require("chai")
chai.use(require("chai-json-schema"))
const expect = chai.expect
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let HashMap = require('hashmap')
const { modes, } = require("./config/config")
const { responseStatus,  serviceType,  interfaceType,  testMode,  restrictedLevel, } = require("./framework/enums")
const framework = require('./framework/framework')
//endregion

//region import test cases
const tcsGetVersion = require('./testCases/tcsGetVersion')
const tcsGetBlock = require('./testCases/tcsGetBlock')
const tcsGetBlockNumber = require('./testCases/tcsGetBlockNumber')
const tcsCreateWallet = require('./testCases/tcsCreateWallet')
const tcsCreateAccount = require('./testCases/tcsCreateAccount')
const tcsGetAccount = require('./testCases/tcsGetAccount')
const tcsGetAccounts = require('./testCases/tcsGetAccounts')
const tcsGetBalance = require('./testCases/tcsGetBalance')
const tcsGetCurrency = require('./testCases/tcsGetCurrency')
const tcsGetReceipt = require('./testCases/tcsGetReceipt')
const tcsGetTx = require('./testCases/tcsGetTx')
const tcsGetTxCount = require('./testCases/tcsGetTxCount')
const tcsSendAndSignTx = require('./testCases/tcsSendAndSignTx')
const tcsSendRawTx = require('./testCases/tcsSendRawTx')
const tcsPressureSendTx = require('./testCases/tcsPressureSendTx')
const tcsSendTxInOneRequest = require('./testCases/tcsSendTxInOneRequest')
const tcsIpfs = require('./testCases/tcsIpfs')
const tcsRASTest = require('./testCases/tcsRASTest')
const tcsInteractiveTest = require('./testCases/tcsInteractiveTest')
const tcsBugInjection = require('./testCases/tcsBugInjection')
const tcsSubscribe = require('./testCases/tcsSubscribe')
const tcsSign = require('./testCases/tcsSign')
//endregion

//region global fields
const HASH_LENGTH = 64
const IPFS_HASH_LENGTH = 46
let _SequenceMap = new HashMap()
let _FullTestCaseList = []
//endregion

describe('Jingtum测试', function() {

    framework.startWork()
    let allRpcServers = framework.activeAllRpcServers()

    for(let mode of modes){

        let server = framework.activeServer(mode)

        //region set timeout
        let timeout = 10000
        if(mode.service == serviceType.oldChain){
            timeout = 120000
        }
        else if(mode.service == serviceType.newChain){
            timeout = 180000
        }
        else if(mode.service == serviceType.ipfs){
            timeout = 35000
        }
        else{
            timeout = 10000
        }
        this.timeout(timeout)
        //endregion

        describe('【测试模式: ' + server.getName() + '】', function () {

            before(async function() {
                // logger.debug('before connnect')
                // await server.connect()
                // logger.debug('after connnect')
            })

            // /*
            describe('用例测试', function () {

                //region basic test

                tcsGetVersion.testForGetVersion(server, '测试jt_version')

                tcsGetBlockNumber.testForGetBlockNumber(server, '测试jt_blockNumber')

                tcsGetBlock.testForGetBlockByNumber(server, '测试jt_getBlockByNumber')

                tcsGetBlock.testForGetBlockByHash(server, '测试jt_getBlockByHash')

                tcsCreateWallet.testForCreateWallet(server, '测试jt_createWallet')

                tcsCreateAccount.testForCreateAccount(server, '测试jt_createAccount')

                tcsGetAccount.testForGetAccount(server, '测试jt_getAccount')

                tcsGetAccounts.testForGetAccounts(server, '测试jt_accounts')

                tcsGetBalance.testForGetBalance(server, '测试jt_getBalance')

                tcsGetCurrency.testForGetCurrency(server, '测试jt_getCurrency')

                tcsGetReceipt.testForGetTransactionReceipt(server, '测试jt_getTransactionReceipt')

                tcsGetTx.testForGetTransaction(server, '测试jt_getTransactionByHash')

                tcsGetTx.testForGetTransactionByIndex(server, '测试jt_getTransactionByIndex')

                tcsGetTx.testForGetTransactionByBlockHashAndIndex(server, '测试jt_getTransactionByBlockHashAndIndex')

                tcsGetTx.testForGetTransactionByBlockNumberAndIndex(server, '测试jt_getTransactionByBlockNumberAndIndex')

                tcsGetTxCount.testForGetTransactionCount(server, '测试jt_getBlockTransactionCountByHash')

                tcsGetTxCount.testForGetBlockTransactionCountByHash(server, '测试jt_getBlockTransactionCountByHash')

                tcsGetTxCount.testForGetBlockTransactionCountByNumber(server, '测试jt_getBlockTransactionCountByNumber')

                tcsSign.testForSign(server, '测试jt_sign')

                //endregion

                //region send and sign

                tcsSendAndSignTx.testForSendTxAndSignTx(server, '测试jt_sendTransaction和jt_signTransaction')

                tcsSendRawTx.testForSendRawTx(server, '测试jt_sendRawTransaction')

                tcsSendTxInOneRequest.testForSendTxs(server, '一个请求执行多个交易', 100)

                tcsPressureSendTx.testForSequenceTest(server, 'Sequence测试: ')

                tcsInteractiveTest.testForInteractiveTest(server, '交互性测试')

                //endregion

                //region performance test

                tcsPressureSendTx.testForPressureTest(server, '测试连续发送交易', 1)

                tcsPressureSendTx.testForPurePressureTest(server, '压力测试：发送交易，看tps', 1)

                tcsPressureSendTx.testForPerformanceTest(server, '性能测试：', 1)

                tcsPressureSendTx.testForFastPerformance(server,
                    '快速压力测试：多帐号通过多节点连续发送交易，等response，看tps', allRpcServers, 1)

                tcsPressureSendTx.testForFastPerformance(server,
                    '快速压力测试：多帐号通过多节点连续发送交易，不等response，看tps', allRpcServers, 1, 'WithoutResponse')

                tcsSendRawTx.testForPerformanceTestBySendRaw(server, '用sendRaw进行性能测试，多节点轮流', 10, 2)

                tcsSendTxInOneRequest.testForSendTxsFast(server, '一个请求执行多个交易，快速执行', 100)

                // endregion

                //region websocket subscribe

                this.timeout(360000)
                tcsSubscribe.testForSubscribe(server, '测试jt_subscribe')
                tcsSubscribe.testForUnsubscribe(server, '测试jt_unsubscribe')
                tcsSubscribe.testForListSubscribe(server, '测试jt_listSubscribe')
                this.timeout(timeout)

                //endregion

                //region special
                // this.timeout(3600000)
                // tcsBugInjection.test(server, '故障注入测试')
                // tcsRASTest.testChangeNodeCount(server, 'RAS测试')

                // tcsIpfs.testForIpfsTest(server, '测试ipfs')

                //endregion

            })
            //*/

            describe('debug testing', async function () {

                // this.timeout(480000*100)
                // tcsPressureSendTx.testForFastPerformance(server,
                //     '快速压力测试：多帐号通过多节点连续发送交易，不等response，看tps', allRpcServers, 100, 'WithoutResponse')

                // this.timeout(360000)
                // // tcsSubscribe.testForSubscribe_2(server, '测试jt_subscribe')
                // // tcsSubscribe.testForUnsubscribe_2(server, '测试jt_unsubscribe')
                //
                // tcsSubscribe.testForSubscribe(server, '测试jt_subscribe')
                // tcsSubscribe.testForUnsubscribe(server, '测试jt_unsubscribe')
                // tcsSubscribe.testForListSubscribe(server, '测试jt_listSubscribe')
                // this.timeout(timeout)

                // tcsSendAndSignTx.testForSendTxAndSignTx(server, '测试jt_sendTransaction和jt_signTransaction')

            })
        })
    }

})

