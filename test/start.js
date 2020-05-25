//region require
const chai = require("chai")
chai.use(require("chai-json-schema"))
const expect = chai.expect
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let HashMap = require('hashmap')
let utility = require("./utility/testUtility.js")
const schema = require("./framework/schema.js")
const consts = require('./framework/lib/base/consts')
const { chains, data, token, txs, blocks, ipfs_data } = require("./testData/testData")
const { chainDatas } = require("./testData/chainDatas")
let { modeAccounts } = require('./testData/accounts')
const AccountsDealer = require('./utility/accountsDealer')
let accountsDealer = new AccountsDealer()
const { configCommons, modes, } = require("./config")
const { responseStatus,  serviceType,  interfaceType,  testMode,  restrictedLevel, } = require("./framework/enums")
const status = responseStatus
const testModeEnums = testMode
const framework = require('./framework/framework')
//endregion

//region import test cases
const tcsBlockCheck = require('./testCases/tcsBlockCheck')
const tcsGetBlockNumber = require('./testCases/tcsGetBlockNumber')
const tcsCreateAccount = require('./testCases/tcsCreateAccount')
const tcsGetAccount = require('./testCases/tcsGetAccount')
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

        let server = mode.server
        server.init(mode)
        mode.addresses = accountsDealer.getAddressesByMode(modeAccounts, mode)
        mode.txs = utility.findMode(chainDatas, mode.name)

        // this.timeout(mode.service == serviceType.oldChain ? 120000: 30000)

        if(mode.service == serviceType.oldChain){
            this.timeout(120000)
        }
        else if(mode.service == serviceType.newChain){
            this.timeout(30000)
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

            // /*
            describe('用例测试', function () {

                // tcsGetBlockNumber.testForGetBlockNumber(server, '测试jt_blockNumber')
                //
                // tcsBlockCheck.testForGetBlockByNumber(server, '测试jt_getBlockByNumber')
                //
                // tcsBlockCheck.testForGetBlockByHash(server, '测试jt_getBlockByHash')

                tcsCreateAccount.testForCreateAccount(server, '测试jt_createAccount')

                tcsGetAccount.testForGetAccount(server, '测试jt_getAccount')

                // testForIpfsTest(server, '测试ipfs')



                // testForGetAccounts(server, '测试jt_accounts')
                //
                // testForGetBalance(server, '测试jt_getBalance')
                //
                // testForGetTransactionReceipt(server, '测试jt_getTransactionReceipt')
                //
                // testForGetTransaction(server, '测试jt_getTransactionByHash')
                //
                // testForGetTransactionByBlockHashAndIndex(server, '测试jt_getTransactionByBlockHashAndIndex')
                //
                // testForGetTransactionByBlockNumberAndIndex(server, '测试jt_getTransactionByBlockNumberAndIndex')
                //
                // testForGetBlockTransactionCountByHash(server, '测试jt_getBlockTransactionCountByHash')
                //
                // testForGetBlockTransactionCountByNumber(server, '测试jt_getBlockTransactionCountByNumber')
                //
                // testForSendTxAndSignTx(server, '测试jt_sendTransaction和jt_signTransaction')

            })
            //*/

            describe('is working', async function () {


            })

        })


    }



    //endregion


})

