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
const tcsSequenceTest = require('./testCases/tcsSequenceTest')
const tcsPerformanceTest = require('./testCases/tcsPerformanceTest')
const tcsIpfs = require('./testCases/tcsIpfs')
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
let _longTimeOut = 3600000
//endregion

describe('Jingtum测试', function() {

    framework.init()
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

            after(async function() {
                framework.statistics()
                // framework.loadWashedTestCases()
                framework.stoptWork()
            })

            /*
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

                tcsSequenceTest.testForSequenceTest(server, '测试Sequence')

                tcsPerformanceTest.testForPerformance(server, '测试Performance')

                // tcsInteractiveTest.testForInteractiveTest(server, '交互性测试')

                //endregion

                //region performance test

                // tcsSequenceTest.testForPressureTest(server, '测试连续发送交易', 1)
                //
                // tcsSequenceTest.testForPurePressureTest(server, '压力测试：发送交易，看tps', 1)
                //
                // tcsSequenceTest.testForPerformanceTest(server, '性能测试：', 1)
                //
                // tcsSequenceTest.testForFastPerformance(server,
                //     '快速压力测试：多帐号通过多节点连续发送交易，等response，看tps', allRpcServers, 1)
                //
                // tcsSequenceTest.testForFastPerformance(server,
                //     '快速压力测试：多帐号通过多节点连续发送交易，不等response，看tps', allRpcServers, 1, 'WithoutResponse')
                //
                // tcsSendRawTx.testForPerformanceTestBySendRaw(server, '用sendRaw进行性能测试，多节点轮流', 10, 2)

                // endregion

                //region websocket subscribe

                this.timeout(_longTimeOut)
                server.mode.testMode = testMode.singleMode
                tcsSubscribe.testForSubscribe(server, '测试jt_subscribe')
                tcsSubscribe.testForUnsubscribe(server, '测试jt_unsubscribe')
                tcsSubscribe.testForListSubscribe(server, '测试jt_listSubscribe')
                this.timeout(timeout)

                //endregion

                //region special

                // this.timeout(_longTimeOut)
                // tcsBugInjection.testForBugInjection(server, '故障注入测试')
                // tcsBugInjection.testForRAS(server, 'RAS测试')
                // this.timeout(timeout)

                // tcsIpfs.testForIpfsTest(server, '测试ipfs')

                //endregion

            })
            //*/

            describe('debug testing', async function () {

                //region test1

                // tcsGetVersion.testForGetVersion(server, '测试jt_version')

                this.timeout(_longTimeOut)

                tcsPerformanceTest.testForPerformance(server, '测试Performance')

                // let ptParam = tcsPerformanceTest.createPerformanceTestParam(consts.rpcFunctions.sendTx, 2, 10,
                //     [interfaceType.rpc, interfaceType.websocket], 18, 20, 20, 0,
                //     5000, true, true, false)
                // tcsPerformanceTest.testForSendTxs(server, '一个请求执行多个交易', ptParam)
                //
                // ptParam = tcsPerformanceTest.createPerformanceTestParam(consts.rpcFunctions.signTx, 2, 10,
                //     [interfaceType.rpc, interfaceType.websocket], 18, 20, 20, 8,
                //     5000, true, true, false)
                // tcsPerformanceTest.testForSendTxs(server, '一个请求执行多个交易', ptParam)

                this.timeout(timeout)


                //region websocket subscribe

                // this.timeout(_longTimeOut)
                // server.mode.testMode = testMode.singleMode
                // // tcsSubscribe.testForSubscribe(server, '测试jt_subscribe')
                // // tcsSubscribe.testForUnsubscribe(server, '测试jt_unsubscribe')
                // tcsSubscribe.testForListSubscribe(server, '测试jt_listSubscribe')
                // this.timeout(timeout)

                //endregion

                //region server test

                this.timeout(_longTimeOut)

                // for(let i = 0; i < 3000; i++) {
                //     tcsBugInjection.testForBugInjection(server, '故障注入测试')
                //     tcsBugInjection.testForRAS(server, 'RAS测试')
                // }


                // for(let i = 0; i < 5000; i++){
                //     tcsPerformanceTest.testForSendTxs(server, '一个请求执行多个交易', consts.rpcFunctions.sendTx,
                //         1, 30, true, 5000, true, )
                // }

                this.timeout(timeout)

                //endregion



                //region special

                // this.timeout(_longTimeOut)
                // tcsBugInjection.testForBugInjection(server, '故障注入测试')
                // tcsBugInjection.testForRAS(server, 'RAS测试')
                // this.timeout(timeout)

                //endregion

                //endregion

                //region need work on

                // tcsInteractiveTest.testForInteractiveTest(server, '交互性测试')

                //endregion

            })
        })
    }

})

