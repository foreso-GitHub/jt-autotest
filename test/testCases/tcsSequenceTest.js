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
//endregion


module.exports = tcsSequenceTest = {

    //region sequence test

    testForSequenceTest: function(server, describeTitle){
        tcsSequenceTest.testSequenceByFunction(server, describeTitle, consts.rpcFunctions.sendTx)
        tcsSequenceTest.testSequenceByFunction(server, describeTitle, consts.rpcFunctions.signTx)
    },

    testSequenceByFunction: function(server, describeTitle, txFunctionName){
        let categoryName = describeTitle + txFunctionName
        let testScripts = tcsSequenceTest.createTestScriptsForSequenceTest(server, txFunctionName)
        framework.testTestScripts(server, categoryName, testScripts)
    },

    createTestScriptsForSequenceTest: function(server, txFunctionName){
        let testScripts = []
        let testCaseCode
        let scriptCode = '000100_' + txFunctionName

        let value = '0.00002'
        let fee = '0.00001'

        testCaseCode = 'FCJT_sendTransaction_000630'
        {
            let testScript = tcsSequenceTest.createTestScript(server, testCaseCode, scriptCode, txFunctionName,
                server.mode.addresses.sequence1, server.mode.addresses.sequence_r_1, value, fee, false)
            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_000640'
        {
            let testScript = tcsSequenceTest.createTestScript(server, testCaseCode, scriptCode, txFunctionName,
                server.mode.addresses.sequence2, server.mode.addresses.sequence_r_2, value, fee)

            if(txFunctionName == consts.rpcFunctions.sendTx){
                testScript.actions[0].bindData.sequenceStart = 1  //sequence + 1
                testScript.actions[0].bindData.plusValueTimes = 0 // value should not change
                testScript.actions[1].bindData.sequenceStart = 0  //right sequence
                testScript.actions[1].bindData.plusValueTimes = 2 // value should change 2 times
            }
            else if(txFunctionName == consts.rpcFunctions.signTx){
                testScript.actions[0].bindData.sequenceStart = 1  //sequence + 1
                testScript.actions[0].bindData.plusValueTimes = 0 // value should not change
                testScript.actions[2].bindData.sequenceStart = 0  //right sequence
                testScript.actions[2].bindData.plusValueTimes = 2 // value should change 2 times
            }

            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_000650'
        {
            let testScript = tcsSequenceTest.createTestScript(server, testCaseCode, scriptCode, txFunctionName,
                server.mode.addresses.sequence3, server.mode.addresses.sequence_r_3, value, fee, false)

            testScript.actions[0].bindData.txParams[0].sequence = 1  //set sequence as 1
            testScript.actions[0].bindData.plusValueTimes = 0 // value should not change
            testScript.actions[0].bindData.timeoutAfterSend = 0  //need not timeout
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-284, 'Malformed: Sequence is not in the past.'))
            framework.changeExpectedResultWhenSignPassButSendRawTxFail(testScript, expectedResult)

            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_000660'
        scriptCode = '000100_' + txFunctionName + '_sequence为小数'
        {
            let testScript = tcsSequenceTest.createTestScript(server, testCaseCode, scriptCode, txFunctionName,
                server.mode.addresses.sequence3, server.mode.addresses.sequence_r_3, value, fee, false)

            testScript.actions[0].bindData.txParams[0].sequence = 0.5  //set sequence as 0.5
            testScript.actions[0].bindData.plusValueTimes = 0 // value should not change
            testScript.actions[0].bindData.timeoutAfterSend = 0  //need not timeout
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-284, 'sequence must be positive integer'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)

            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_000660'
        scriptCode = '000200_' + txFunctionName + '_sequence为负数'
        {
            let testScript = tcsSequenceTest.createTestScript(server, testCaseCode, scriptCode, txFunctionName,
                server.mode.addresses.sequence3, server.mode.addresses.sequence_r_3, value, fee, false)

            testScript.actions[0].bindData.txParams[0].sequence = -2  //set sequence as -2
            testScript.actions[0].bindData.plusValueTimes = 0 // value should not change
            testScript.actions[0].bindData.timeoutAfterSend = 0  //need not timeout
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-284, 'sequence must be positive integer'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)

            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_000660'
        scriptCode = '000300_' + txFunctionName + '_sequence为字符串'
        {
            let testScript = tcsSequenceTest.createTestScript(server, testCaseCode, scriptCode, txFunctionName,
                server.mode.addresses.sequence3, server.mode.addresses.sequence_r_3, value, fee, false)

            testScript.actions[0].bindData.txParams[0].sequence = '1234'  //set sequence as '1234'
            testScript.actions[0].bindData.plusValueTimes = 0 // value should not change
            testScript.actions[0].bindData.timeoutAfterSend = 0  //need not timeout
            let expectedResult = framework.createExpecteResult(false,
                framework.getError(-284, 'sequence must be positive integer'))
            framework.changeExpectedResultWhenSignFail(testScript, expectedResult)

            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_000670'
        scriptCode = '000100_' + txFunctionName
        {
            let testScript = tcsSequenceTest.createTestScript(server, testCaseCode, scriptCode, txFunctionName,
                server.mode.addresses.sequence4, server.mode.addresses.sequence_r_4, value, fee, false)
            let txCount = 5
            let sendOrSignAction = testScript.actions[0]
            let sendRawAction
            if(txFunctionName == consts.rpcFunctions.sendTx){
                sendRawAction = null
            }
            else if (txFunctionName == consts.rpcFunctions.signTx){
                sendRawAction = testScript.actions[1]
            }
            tcsSequenceTest.cloneTxSettings(sendOrSignAction, sendRawAction, txCount)
            sendOrSignAction.bindData.sequenceStart = 0
            sendOrSignAction.bindData.plusValueTimes = txCount  //change value for 5 times

            framework.addTestScript(testScripts, testScript)
        }

        testCaseCode = 'FCJT_sendTransaction_000680'
        {
            let testScript = tcsSequenceTest.createTestScript(server, testCaseCode, scriptCode, txFunctionName,
                server.mode.addresses.sequence5, server.mode.addresses.sequence_r_5, value, fee, true)
            let txCount = 5
            let sendOrSignAction = testScript.actions[0]
            let sendRawAction
            if(txFunctionName == consts.rpcFunctions.sendTx){
                sendRawAction = null
            }
            else if (txFunctionName == consts.rpcFunctions.signTx){
                sendRawAction = testScript.actions[1]
            }
            tcsSequenceTest.cloneTxSettings(sendOrSignAction, sendRawAction, txCount)
            sendOrSignAction.bindData.sequenceStart = 1
            sendOrSignAction.bindData.sequenceOffset = 2
            sendOrSignAction.bindData.plusValueTimes = 0

            if(txFunctionName == consts.rpcFunctions.sendTx){
                sendOrSignAction = testScript.actions[1]
                sendRawAction = null
            }
            else if (txFunctionName == consts.rpcFunctions.signTx){
                sendOrSignAction = testScript.actions[2]
                sendRawAction = testScript.actions[3]
            }
            tcsSequenceTest.cloneTxSettings(sendOrSignAction, sendRawAction, txCount)
            sendOrSignAction.bindData.sequenceStart = 0
            sendOrSignAction.bindData.sequenceOffset = 2
            sendOrSignAction.bindData.plusValueTimes = txCount * 2  //change value for 10 times

            framework.addTestScript(testScripts, testScript)
        }

        return testScripts
    },

    createTestScript: function(server, testCaseCode, scriptCode, txFunctionName, sender, receiver, value, fee, hasOneMoreActionSet){

        let sendOrSignAction_1st
        let sendRawAction_1st
        let sendOrSignAction_2nd
        let sendRawAction_2nd

        let txParams = server.createTransferParams(sender.address, sender.secret, null,
            receiver.address, value, fee, ['autotest: sequence test'])
        let testScript = framework.createTestScriptForTx(server, testCaseCode, scriptCode, txFunctionName, txParams) //fisrt send set
        sendOrSignAction_1st = testScript.actions[0]
        sendRawAction_1st = testScript.actions[1]
        tcsSequenceTest.updateSendOrSignActionSet(sendOrSignAction_1st, sendRawAction_1st)
        sendOrSignAction_1st.bindData.sequenceStart = 0
        sendOrSignAction_1st.bindData.plusValueTimes = 1 // value has not changed yet

        if(hasOneMoreActionSet == undefined || hasOneMoreActionSet == true){
            if (sendRawAction_1st != undefined){
                sendRawAction_1st.expectedResults[0].needCheckTx = false
            }

            framework.pushTestActionForSendAndSign(testScript, txFunctionName, txParams)  //second send set
            if(txFunctionName == consts.rpcFunctions.sendTx){
                sendOrSignAction_2nd = testScript.actions[1]
            }
            else if (txFunctionName == consts.rpcFunctions.signTx){
                sendOrSignAction_2nd = testScript.actions[2]
                sendRawAction_2nd = testScript.actions[3]
            }
            tcsSequenceTest.updateSendOrSignActionSet(sendOrSignAction_2nd, sendRawAction_2nd)
            sendOrSignAction_2nd.bindData.sequenceStart = 0
            sendOrSignAction_2nd.bindData.plusValueTimes = 1 //change value again
        }

        return testScript
    },

    updateSendOrSignActionSet: function(sendOrSignAction, sendRawAction){
        sendOrSignAction.bindData = {}  //sign and sendraw can share data in bindData.  only works in sequence test.
        sendOrSignAction.bindData.txParams = sendOrSignAction.txParams
        sendOrSignAction.bindData.timeoutAfterSend = sendOrSignAction.server.mode.defaultBlockTime + 2000

        if(sendRawAction == undefined){
            sendOrSignAction.beforeExecution = tcsSequenceTest.beforeExecuteSendTx
            sendOrSignAction.afterExecution = tcsSequenceTest.fillBalances
            sendOrSignAction.moreChecks = tcsSequenceTest.checkBalances
        }
        else {
            sendOrSignAction.beforeExecution = tcsSequenceTest.changeSequence
            sendRawAction.bindData = sendOrSignAction.bindData
            sendRawAction.beforeExecution = tcsSequenceTest.beforeExecute000640_sendRaw
            sendRawAction.afterExecution = tcsSequenceTest.fillBalances
            sendRawAction.moreChecks = tcsSequenceTest.checkBalances
        }
    },

    cloneTxSettings: function(sendOrSignAction, sendRawAction, txCount){
        let txParam = sendOrSignAction.txParams[0]
        let expectedResult = sendOrSignAction.expectedResults[0]
        for(let i = 0; i < txCount - 1; i++){
            let newTxParam = utility.deepClone(txParam)
            sendOrSignAction.txParams.push(newTxParam)
            sendOrSignAction.expectedResults.push(utility.deepClone(expectedResult))
            if(sendRawAction){
                sendRawAction.expectedResults.push(utility.deepClone(expectedResult))
                sendRawAction.signTxParams.push(newTxParam)
            }
        }
    },

    //region functions

    getBalanceValue: async function(server, from){
        let balance = await server.getBalance(server, from,)
        return balance.value
    },

    fillActualBalance: async function(server, balanceCheck){
        let from = balanceCheck.address
        balanceCheck.actualBalance = await tcsSequenceTest.getBalanceValue(server, from)
    },

    fillBalances: async function(action){
        let server = action.server
        await utility.timeout(action.bindData.timeoutAfterSend)
        await tcsSequenceTest.fillActualBalance(server, action.bindData.balanceChecks[0])
        await tcsSequenceTest.fillActualBalance(server, action.bindData.balanceChecks[1])
    },

    checkBalances: function(action){
        let checks = action.bindData.balanceChecks
        if(checks != undefined){
            for(let i = 0; i < checks.length; i++){
                let check = checks[i]
                let expectedBalance = Number(check.expectedBalance)
                let actualBalance = Number(check.actualBalance)
                logger.debug('balance checking [' + i + '] [' + check.sequence + ']: ' + expectedBalance + ' | ' + actualBalance)
                expect(actualBalance).to.be.equal(expectedBalance)
            }
        }
    },

    restoreBalances: async function(action){
        let server = action.server
        let from = action.bindData.txParams[0].from
        let to = action.bindData.txParams[0].to
        let value = action.bindData.txParams[0].value
        let fee = action.bindData.txParams[0].fee
        let plusTimes = action.bindData.plusValueTimes
        let sequence = action.bindData.txParams[0].sequence

        let from_balance = await tcsSequenceTest.getBalanceValue(server, from)
        let to_balance = await tcsSequenceTest.getBalanceValue(server, to)
        let from_balance_expected = Number(from_balance) - (Number(value) + Number(fee)) * plusTimes
        let to_balance_expected = Number(to_balance) + Number(value) * plusTimes

        let from_check = {address: from, sequence:sequence, expectedBalance: from_balance_expected}
        let to_check = {address: to, sequence:sequence, expectedBalance: to_balance_expected}
        action.bindData.balanceChecks = []
        action.bindData.balanceChecks.push(from_check)
        action.bindData.balanceChecks.push(to_check)
    },

    changeSequence: async function(action){
        let server = action.server
        let from = action.bindData.txParams[0].from
        let currentSequence = await server.getSequence(server, from)
        let offset = action.bindData.sequenceOffset ? action.bindData.sequenceOffset : 1

        for(let i = 0; i < action.bindData.txParams.length; i++){
            let txParam = action.bindData.txParams[i]
            if(!txParam.sequence){
                txParam.sequence = currentSequence + action.bindData.sequenceStart + i * offset
            }
        }
    },

    beforeExecuteSendTx: async function(action){
        await tcsSequenceTest.changeSequence(action)
        await tcsSequenceTest.restoreBalances(action)
    },

    beforeExecute000640_sendRaw: async function(action){
        await tcsSequenceTest.restoreBalances(action)
        await framework.beforeSendRawTx(action)
    },

    //endregion

    // endregion

}
