//region require
const chai = require("chai")
chai.use(require("chai-json-schema"))
const expect = chai.expect
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let HashMap = require('hashmap')
let utility = require("./utility/testUtility.js")
const schema = require("./schema.js")
const consts = require('../lib/base/consts')
const { chains, data, token, txs, blocks, ipfs_data } = require("./testData/testData")
const { chainDatas } = require("./testData/chainDatas")
let { modeAccounts } = require('./testData/accounts')
const AccountsDealer = require('./utility/accountsDealer')
const { configCommons, modes, } = require("./config")
const { responseStatus,  serviceType,  interfaceType,  testMode,  restrictedLevel, } = require("./enums")
const status = responseStatus
const testModeEnums = testMode
const framework = require('./framework/framework')
//endregion

//region global fields
const HASH_LENGTH = 64
const IPFS_HASH_LENGTH = 46
let _SequenceMap = new HashMap()
let _FullTestCaseList = []
let accountsDealer = new AccountsDealer()
let addresses
//endregion

describe('Jingtum测试', function() {

    framework.startWork()

    for(let mode of modes){

        let server = mode.server
        server.init(mode)
        addresses = accountsDealer.getAddressesByMode(modeAccounts, mode)
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

                testForGetBlockByNumber(server, '测试jt_getBlockByNumber')

            })
            //*/

            describe('is working', async function () {

                // testForGetBlockByNumber(server, '测试jt_getBlockByNumber')

                // testForSendTxAndSignTx(server, '测试jt_sendTransaction和jt_signTransaction')

                // await utility.timeout(5000)

                // testForIpfsTest(server, '测试ipfs')

                // testForGetBlockNumber(server, '测试jt_blockNumber')

                // testForGetAccount(server, '测试jt_getAccount')

                // testForSendTxAndSignTx(server, '测试jt_sendTransaction和jt_signTransaction')

            })

        })


    }

    //region common test case

    //region block check

    function testForGetBlockByNumber(server, describeTitle){
        let functionName = consts.rpcFunctions.getBlockByNumber
        let blockNumber = server.mode.txs.block.blockNumber
        let testCases = createTestCasesForGetBlock(server, functionName, blockNumber)
        framework.testTestCases(server, describeTitle, testCases)
    }

    function testForGetBlockByHash(server, describeTitle){
        let functionName = consts.rpcFunctions.getBlockByHash
        let blockNumber = server.mode.txs.block.blockHash
        let testCases = createTestCasesForGetBlock(server, functionName, blockNumber)
        framework.testTestCases(server, describeTitle, testCases)
    }

    function createTestCasesForGetBlock(server, functionName, numberOrHash){
        let testCases = []
        let validNumberOrHash = numberOrHash
        let testNumber = '0010'
        let showFullTx = false
        let needPass = true
        let expectedError = ''
        let testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        testCase.supportedServices.push(serviceType.oldChain)
        framework.addTestCase(testCases, testCase)

        testNumber = '0020'
        showFullTx = true
        testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        testCase.supportedServices.push(serviceType.oldChain)
        framework.addTestCase(testCases, testCase)

        if(functionName == consts.rpcFunctions.getBlockByNumber){
            testNumber = '0030'
            numberOrHash = 'earliest'
            showFullTx = true
            testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
            framework.addTestCase(testCases, testCase)

            testNumber = '0040'
            numberOrHash = 'earliest'
            showFullTx = false
            testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
            framework.addTestCase(testCases, testCase)

            testNumber = '0050'
            numberOrHash = 'latest'
            showFullTx = true
            testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
            // testCases[testCases.length - 1].supportedServices = [serviceType.newChain, serviceType.ipfs,]
            framework.addTestCase(testCases, testCase)

            testNumber = '0060'
            numberOrHash = 'latest'
            showFullTx = false
            testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
            framework.addTestCase(testCases, testCase)

            testNumber = '0090'
            numberOrHash = 'pending'
            showFullTx = true
            testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
            framework.addTestCase(testCases, testCase)

            testNumber = '0100'
            numberOrHash = 'pending'
            showFullTx = false
            testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
            framework.addTestCase(testCases, testCase)
        }

        testNumber = '0110'
        numberOrHash = validNumberOrHash
        showFullTx = 'wrwerwre'
        needPass = false
        expectedError = 'interface conversion: interface {} is string, not bool'
        testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        testCase.title = '0110\t有效区块编号，无效Boolean参数：showFullTx是字符串'
        testCase.supportedServices.push(serviceType.oldChain)
        framework.addTestCase(testCases, testCase)

        testNumber = '0110'
        numberOrHash = validNumberOrHash
        showFullTx = 123123
        needPass = false
        expectedError = 'interface conversion: interface {} is float64, not bool'
        testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        testCase.title = '0110\t有效区块编号，无效Boolean参数：showFullTx是数字'
        testCase.supportedServices.push(serviceType.oldChain)
        framework.addTestCase(testCases, testCase)

        testNumber = '0110'
        numberOrHash = validNumberOrHash
        showFullTx = null
        needPass = false
        expectedError = 'interface conversion: interface {} is nil, not bool'
        testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        testCase.title = '0110\t有效区块编号，无效Boolean参数：showFullTx是空值'
        testCase.supportedServices.push(serviceType.oldChain)
        framework.addTestCase(testCases, testCase)

        testNumber = '0120'
        numberOrHash = '9990000000'
        showFullTx = false
        needPass = false
        expectedError = 'value out of range'
        testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        // testCase.supportedServices.push(serviceType.oldChain)  //old chain not support huge block number, it will cause test hook more than 20s
        framework.addTestCase(testCases, testCase)

        testNumber = '0120'
        numberOrHash = '99900000'
        showFullTx = false
        needPass = false
        expectedError = 'ledgerNotFound'
        testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        if(functionName == consts.rpcFunctions.getBlockByNumber) testCase.supportedServices.push(serviceType.oldChain)
        framework.addTestCase(testCases, testCase)

        testNumber = '0120'
        numberOrHash = '-1000'
        showFullTx = false
        needPass = false
        expectedError = 'invalid ledger_index'
        testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        if(functionName == consts.rpcFunctions.getBlockByNumber) testCase.supportedServices.push(serviceType.oldChain)
        framework.addTestCase(testCases, testCase)

        testNumber = '0120'
        numberOrHash = 'abcdefg'
        showFullTx = false
        needPass = false
        expectedError = 'invalid ledger_index'
        testCase = createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError)
        if(functionName == consts.rpcFunctions.getBlockByNumber) testCase.supportedServices.push(serviceType.oldChain)
        framework.addTestCase(testCases, testCase)

        return testCases
    }

    function createSingleTestCaseForGetBlockByNumber(server, testNumber, functionName, numberOrHash, showFullTx, needPass, expectedError){

        let txParams = []
        txParams.push(numberOrHash)
        txParams.push(showFullTx)

        let expectedResult = {}
        expectedResult.needPass = needPass
        expectedResult.isErrorInResult = true
        expectedResult.expectedError = expectedError

        let title = testNumber + '\t'+ (needPass ? '有' : '无') + '效区块编号，' + (showFullTx ? '' : '不') + '需要返回所有交易详情'

        let testCase = framework.createTestCase(
            title,
            server,
            functionName,
            txParams,
            null,
            framework.executeTestCaseForGet,
            checkBlock,
            expectedResult,
            restrictedLevel.L2,
            [serviceType.newChain,],
            [],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        return testCase
    }

    function checkBlock(testCase){
        let response = testCase.actualResult[0]
        let needPass = testCase.expectedResult.needPass
        framework.checkResponse(needPass, response)
        if(needPass){
            expect(response.result).to.be.jsonSchema(schema.LEDGER_SCHEMA)   //todo need add full block schema
            let functionName = testCase.txFunctionName
            let blockNumberOrHash = testCase.txParams[0]
            expect((functionName === consts.rpcFunctions.getBlockByNumber) ? response.result.ledger_index : response.result.ledger_hash)
                .to.be.equals(blockNumberOrHash)
            let server = testCase.server
            expect(response.result.transactions.length).to.be.equals(server.mode.txs.block.txCountInBlock)
            let showFullTx = testCase.txParams[1]
            if(showFullTx != null){
                let tx = response.result.transactions[0]
                expect(typeof tx == 'object' || utility.isJSON(tx)).to.be.equals(showFullTx)
            }
        }
        else{
            expect(response.result).to.contains(testCase.expectedResult.expectedError)
        }
    }

    //endregion

    //endregion


})

