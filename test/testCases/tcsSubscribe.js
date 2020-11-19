//region require
//region mocha
const chai = require('chai')
chai.use(require('chai-json-schema'))
const expect = chai.expect
//endregion
//region logger
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
//endregion
//region test framework
const framework = require('../framework/framework')
const schema = require('../framework/schema')
const { responseStatus,  serviceType,  interfaceType,  testMode,  restrictedLevel, } = require("../framework/enums")
const consts = require('../framework/consts')
let utility = require('../framework/testUtility')
//endregion
const chainDatas = require('../testData/chainDatas').chainDatas
//endregion


module.exports = tcsSubscribe = {

    //region normal send raw tx
    testForSubscribe: function(server, describeTitle){
        let title
        let testCase
        let testCases = []
        let needPass = true
        let expectedError = ''

        let from = server.mode.addresses.sender3.address
        let globalCoin = server.mode.coins[0]
        let localCoin = server.mode.coins[1]

        title = '0010\t订阅区块'
        {
            let params = ['block']
            testCase = tcsSubscribe.createSingleTestCaseForSubscribe(server, title, params, needPass, expectedError)
            testCase.checkFunction = tcsSubscribe.checkForSubscribeBlock
            framework.addTestCase(testCases, testCase)
        }

        title = '0020\t订阅交易'
        {
            let params = ['tx']
            testCase = tcsSubscribe.createSingleTestCaseForSubscribe(server, title, params, needPass, expectedError)
            testCase.checkFunction = tcsSubscribe.checkForSubscribeTx
            testCase.hasFake = false
            framework.addTestCase(testCases, testCase)
        }

        title = '0030\t订阅代币: swt'
        {
            let params = ['token', consts.defaultNativeCoin]
            testCase = tcsSubscribe.createSingleTestCaseForSubscribe(server, title, params, needPass, expectedError)
            testCase.checkFunction = tcsSubscribe.checkForSubscribeTx
            testCase.hasFake = true
            testCase.realValue = '0.0001'
            testCase.fakeValue = {amount:'0.0001', symbol:globalCoin.symbol, issuer:globalCoin.issuer}
            framework.addTestCase(testCases, testCase)
        }

        title = '0031\t订阅代币: swt，完整写法'
        {
            let params = ['token', consts.defaultNativeCoin]
            testCase = tcsSubscribe.createSingleTestCaseForSubscribe(server, title, params, needPass, expectedError)
            testCase.checkFunction = tcsSubscribe.checkForSubscribeTx
            testCase.hasFake = true
            testCase.realValue = {amount:'0.0001', symbol:consts.defaultNativeCoin, issuer:consts.defaultIssuer}
            testCase.fakeValue = {amount:'1', symbol:globalCoin.symbol, issuer:globalCoin.issuer}
            framework.addTestCase(testCases, testCase)
        }

        title = '0032\t订阅代币: global token'
        {
            let params = ['token', globalCoin.symbol]
            testCase = tcsSubscribe.createSingleTestCaseForSubscribe(server, title, params, needPass, expectedError)
            testCase.checkFunction = tcsSubscribe.checkForSubscribeTx
            testCase.hasFake = true
            testCase.realValue = {amount:'1', symbol:globalCoin.symbol, issuer:globalCoin.issuer}
            testCase.fakeValue = '0.0001'
            framework.addTestCase(testCases, testCase)
        }

        title = '0033\t订阅代币: local token'
        {
            let params = ['token', localCoin.symbol]
            testCase = tcsSubscribe.createSingleTestCaseForSubscribe(server, title, params, needPass, expectedError)
            testCase.checkFunction = tcsSubscribe.checkForSubscribeTx
            testCase.hasFake = true
            testCase.realValue = {amount:'1', symbol:localCoin.symbol, issuer:localCoin.issuer}
            testCase.fakeValue = {amount:'1', symbol:globalCoin.symbol, issuer:globalCoin.issuer}
            framework.addTestCase(testCases, testCase)
        }

        title = '0040\t订阅帐号'
        {
            let params = ['account', from]
            testCase = tcsSubscribe.createSingleTestCaseForSubscribe(server, title, params, needPass, expectedError)
            testCase.checkFunction = tcsSubscribe.checkForSubscribeTx
            testCase.hasFake = true
            framework.addTestCase(testCases, testCase)
        }

        framework.testTestCases(server, describeTitle, testCases)
    },

    createSingleTestCaseForSubscribe: function(server, title, params, needPass, expectedError){

        let functionName = consts.rpcFunctions.subscribe
        let txParams = params
        let expectedResult = {}
        expectedResult.needPass = needPass
        expectedResult.isErrorInResult = true
        expectedResult.expectedError = expectedError

        let testCase = framework.createTestCase(
            title,
            server,
            functionName,
            txParams,
            null,
            tcsSubscribe.executeForSubscribe,
            tcsSubscribe.checkForSubscribe,
            expectedResult,
            restrictedLevel.L2,
            [serviceType.newChain],
            [interfaceType.websocket],//[interfaceType.rpc,],//[interfaceType.rpc, interfaceType.websocket]
        )

        testCase.realValue = '1'
        testCase.fakeValue = '1'
        testCase.txCount = 5
        testCase.hasFake = false

        return testCase
    },

    executeForSubscribe: async function(testCase){
        testCase.hasExecuted = true
        return new Promise(async (resolve, reject) => {
            logger.debug(testCase.title)
            testCase.server.getSubscribeData(testCase.server, testCase.txFunctionName, testCase.txParams).then(function(response){
                testCase.actualResult.push(response)
                resolve(testCase)
            }, function (error) {
                logger.debug(error)
                expect(false).to.be.ok
            })

            //send txs
            let server = testCase.server
            let txCount = testCase.txCount

            let realValue = testCase.realValue
            let realFrom = server.mode.addresses.sender3.address
            let realSecret = server.mode.addresses.sender3.secret
            let realTo = server.mode.addresses.receiver3.address
            let realParams = await utility.createTxParams(server, realFrom, realSecret, realTo, realValue)
            testCase.realHashes = await utility.sendTxs(server, realParams, txCount)

            if(testCase.hasFake && testCase.hasFake == true){
                let fakeValue = testCase.fakeValue
                let fakeFrom = server.mode.addresses.sender2.address
                let fakeSecret = server.mode.addresses.sender2.secret
                let fakeTo = server.mode.addresses.receiver2.address
                let fakeParams = await utility.createTxParams(server, fakeFrom, fakeSecret, fakeTo, fakeValue)
                testCase.fakeHashes = await utility.sendTxs(server, fakeParams, txCount)
            }
        })
    },

    checkForSubscribe: async function(testCase){
        logger.debug('actualResult count: ' + testCase.actualResult[0].length)
        testCase.actualResult.forEach(result => {
            logger.debug(JSON.stringify(result))
        })
    },

    checkForSubscribeBlock: async function(testCase){
        let blocks = testCase.actualResult[0]
        expect(blocks.length).to.be.least(2)    //15s, should have 3 blocks
        expect(blocks.length).to.be.most(4)

        let start = blocks[0].ledger_index
        blocks.forEach(block => {
            expect(block.ledger_index).to.be.equals(start++)
        })
    },

    checkForSubscribeTx: async function(testCase){
        let txs = testCase.actualResult[0]
        let receivedHashes = []
        txs.forEach(tx => {
            if(tx.result){
                receivedHashes.push(tx.result)
            }
            else if (tx.transaction && tx.transaction.hash){
                receivedHashes.push(tx.transaction.hash)
            }
        })
        let realHashes = testCase.realHashes
        let fakeHashes = testCase.fakeHashes
        realHashes.forEach(realHash => {
            expect(receivedHashes).to.be.contains(realHash)
        })
        if(testCase.hasFake && testCase.hasFake == true){
            fakeHashes.forEach(fakeHash => {
                expect(receivedHashes).to.not.be.contains(fakeHash)
            })
        }
    },
    //endregion


}