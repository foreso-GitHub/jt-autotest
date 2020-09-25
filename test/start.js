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
const tcsGetBlock = require('./testCases/tcsGetBlock')
const tcsGetBlockNumber = require('./testCases/tcsGetBlockNumber')
const tcsCreateAccount = require('./testCases/tcsCreateAccount')
const tcsGetAccount = require('./testCases/tcsGetAccount')
const tcsGetAccounts = require('./testCases/tcsGetAccounts')
const tcsGetBalance = require('./testCases/tcsGetBalance')
const tcsGetReceipt = require('./testCases/tcsGetReceipt')
const tcsGetTx = require('./testCases/tcsGetTx')
const tcsGetTxCount = require('./testCases/tcsGetTxCount')
const tcsSendAndSignTx = require('./testCases/tcsSendAndSignTx')
const tcsSendRawTx = require('./testCases/tcsSendRawTx')
const tcsPressureSendTx = require('./testCases/tcsPressureSendTx')
const tcsIpfs = require('./testCases/tcsIpfs')
const tcsRASTest = require('./testCases/tcsRASTest')
const tcsInteractiveTest = require('./testCases/tcsInteractiveTest')
const tcsBugInjection = require('./testCases/tcsBugInjection')
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

        if(mode.service == serviceType.oldChain){
            this.timeout(120000)
        }
        else if(mode.service == serviceType.newChain){
            this.timeout(180000)
        }
        else if(mode.service == serviceType.ipfs){
            this.timeout(35000)
        }
        else{
            this.timeout(10000)
        }

        describe('【测试模式: ' + server.getName() + '】', function () {

            before(async function() {
                // logger.debug('before connnect')
                // await server.connect()
                // logger.debug('after connnect')
            })

            /*
            describe('用例测试', function () {

                //region basic test

                tcsGetBlockNumber.testForGetBlockNumber(server, '测试jt_blockNumber')

                tcsGetBlock.testForGetBlockByNumber(server, '测试jt_getBlockByNumber')

                tcsGetBlock.testForGetBlockByHash(server, '测试jt_getBlockByHash')

                tcsCreateAccount.testForCreateAccount(server, '测试jt_createAccount')

                tcsGetAccount.testForGetAccount(server, '测试jt_getAccount')

                tcsGetAccounts.testForGetAccounts(server, '测试jt_accounts')

                tcsGetBalance.testForGetBalance(server, '测试jt_getBalance')

                tcsGetReceipt.testForGetTransactionReceipt(server, '测试jt_getTransactionReceipt')

                tcsGetTx.testForGetTransaction(server, '测试jt_getTransactionByHash')

                tcsGetTx.testForGetTransactionByIndex(server, '测试jt_getTransactionByIndex')

                tcsGetTx.testForGetTransactionByBlockHashAndIndex(server, '测试jt_getTransactionByBlockHashAndIndex')

                tcsGetTx.testForGetTransactionByBlockNumberAndIndex(server, '测试jt_getTransactionByBlockNumberAndIndex')

                tcsGetTxCount.testForGetBlockTransactionCountByHash(server, '测试jt_getBlockTransactionCountByHash')

                tcsGetTxCount.testForGetBlockTransactionCountByNumber(server, '测试jt_getBlockTransactionCountByNumber')

                //endregion

                //region send and sign

                tcsSendAndSignTx.testForSendTxAndSignTx(server, '测试jt_sendTransaction和jt_signTransaction')

                tcsSendRawTx.testForSendRawTx(server, '测试jt_sendRawTransaction')

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

                tcsSendRawTx.testForPerformanceTestBySendRaw(server, '用sendRaw进行性能测试', 10, 2)

                // endregion

                //region special
                // this.timeout(1800000)
                // tcsBugInjection.test(server, '故障注入测试')
                // tcsRASTest.testChangeNodeCount(server, 'RAS测试')

                // tcsIpfs.testForIpfsTest(server, '测试ipfs')

                //endregion

            })
            //*/

            describe('debug testing', async function () {

                // tcsPressureSendTx.testForSequenceTest(server, 'Sequence测试: ')

                // tcsSendRawTx.testForSendRawTx(server, '测试jt_sendRawTransaction')

                // this.timeout(30000)
                // tcsSendRawTx.testForPerformanceTestBySendRaw(server, '用sendRaw进行性能测试', 100, 12000)

                //region performance test

                // tcsPressureSendTx.testForPerformanceTest(server, '性能测试：', 1)
                //
                // tcsPressureSendTx.testForFastPerformance(server,
                //     '快速压力测试：多帐号通过多节点连续发送交易，等response，看tps',allRpcServers, 1)
                //
                // tcsPressureSendTx.testForFastPerformance(server,
                //     '快速压力测试：多帐号通过多节点连续发送交易，不等response，看tps', allRpcServers, 1, 'WithoutResponse')

                // tcsSendRawTx.testForPerformanceTestBySendRaw(server, '用sendRaw进行性能测试', 10, 2)

                // endregion

                // tcsInteractiveTest.testForInteractiveTest(server, '交互性测试')

                // this.timeout(1800000)
                // tcsRASTest.testChangeNodeCount(server, 'RAS测试')

                // this.timeout(180000)
                // tcsBugInjection.test(server, '故障注入测试')

            })
        })
    }

})

