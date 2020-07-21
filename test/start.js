//region require
const chai = require("chai")
chai.use(require("chai-json-schema"))
const expect = chai.expect
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let HashMap = require('hashmap')
const {  modes, } = require("./config/config")
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
const tcsPressureSendTx = require('./testCases/tcsPressureSendTx')
const tcsIpfs = require('./testCases/tcsIpfs')
const tcsRASTest = require('./testCases/tcsRASTest')
const tcsInteractiveTest = require('./testCases/tcsInteractiveTest')
//endregion

//region global fields
const HASH_LENGTH = 64
const IPFS_HASH_LENGTH = 46
let _SequenceMap = new HashMap()
let _FullTestCaseList = []
//endregion

describe('Jingtum测试', function() {

    framework.startWork()

    for(let mode of modes){

        let server = framework.activeServer(mode)

        // let server = mode.server
        // server.init(mode)
        // if(mode.service == serviceType.newChain || mode.service == serviceType.oldChain){
        //     mode.addresses = accountsDealer.getAddressesByMode(modeAccounts, mode)
        //     mode.txs = utility.findMode(chainDatas, mode.name)
        // }

        // this.timeout(mode.service == serviceType.oldChain ? 120000: 30000)

        if(mode.service == serviceType.oldChain){
            this.timeout(120000)
        }
        else if(mode.service == serviceType.newChain){
            this.timeout(999930000)
        }
        else if(mode.service == serviceType.ipfs){
            this.timeout(35000)
        }
        else{
            this.timeout(10000)
        }

        describe('测试模式: ' + server.getName(), function () {

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

                tcsGetTx.testForGetTransactionByBlockHashAndIndex(server, '测试jt_getTransactionByBlockHashAndIndex')

                tcsGetTx.testForGetTransactionByBlockNumberAndIndex(server, '测试jt_getTransactionByBlockNumberAndIndex')

                tcsGetTxCount.testForGetBlockTransactionCountByHash(server, '测试jt_getBlockTransactionCountByHash')

                tcsGetTxCount.testForGetBlockTransactionCountByNumber(server, '测试jt_getBlockTransactionCountByNumber')

                //endregion

                tcsSendAndSignTx.testForSendTxAndSignTx(server, '测试jt_sendTransaction和jt_signTransaction')

                //region performance test
                tcsPressureSendTx.testForSequenceTest(server, 'Sequence测试: ')

                tcsPressureSendTx.testForPressureTest(server, '测试连续发送交易')

                tcsPressureSendTx.testForPurePressureTest(server, '压力测试：发送交易，看tps')

                tcsPressureSendTx.testForPerformanceTest(server, '性能测试：')

                tcsPressureSendTx.testForFastPerformance(server,
                    '快速压力测试：多帐号通过多节点连续发送交易，等response，看tps',
                    30)

                tcsPressureSendTx.testForFastPerformance(server,
                    '快速压力测试：多帐号通过多节点连续发送交易，不等response，看tps',
                    30, 'WithoutResponse')

                // endregion

                tcsInteractiveTest.testForPerformanceTest(server, '交互性测试')

                // tcsRASTest.testChangeNodeCount(server, 'RAS测试')

                // tcsIpfs.testForIpfsTest(server, '测试ipfs')

            })
            //*/

            describe('is working', async function () {

                // tcsRASTest.testChangeNodeCount(server, 'RAS测试')

                // tcsGetBalance.testForGetBalance(server, '测试jt_getBalance')

                // tcsSendAndSignTx.testForSendTxAndSignTx(server, '测试jt_sendTransaction和jt_signTransaction')

                // tcsPressureSendTx.testForPressureTest(server, '测试连续发送交易')

                // tcsPressureSendTx.testForPurePressureTest(server, '压力测试：发送交易，看tps')

                // tcsPressureSendTx.testForFastPerformance(server,
                //     '快速压力测试：多帐号通过多节点连续发送交易，等response，看tps',
                //     10)

                // tcsPressureSendTx.testForFastPerformance(server,
                //     '快速压力测试：多帐号通过多节点连续发送交易，不等response，看tps',
                //     100, 'WithoutResponse')

                // tcsPressureSendTx.testForPerformanceTest(server, '性能测试：')

                tcsInteractiveTest.testForPerformanceTest(server, '交互性测试')

                // tcsRASTest.testChangeNodeCount(server, 'RAS测试')

                // tcsIpfs.testForIpfsTest(server, '测试ipfs')



            })
        })
    }

})

