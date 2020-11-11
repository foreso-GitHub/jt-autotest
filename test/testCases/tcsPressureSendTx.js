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
const consts = require('../framework/lib/base/consts')
let utility = require('../framework/testUtility')
//endregion
//endregion


module.exports = tcsPressureSendTx = {

    testForPressureSendTx: function(server, describeTitle){
        describe(describeTitle, function (){

            //region sequence test
            // let categoryName = 'Sequence测试: '
            // tcsPressureSendTx.testForSequenceTest(server, categoryName)
            //endregion

            //region pressure test
            // tcsPressureSendTx.testForPressureTest(server)
            // endregion

            //region pure pressure test
            // tcsPressureSendTx.testForPurePressureTest(server)
            // endregion
        })
    },

    //region sequence test
    testForSequenceTest: function(server, describeTitle){
        tcsPressureSendTx.testSequenceByFunction(server, describeTitle, consts.rpcFunctions.sendTx)
        tcsPressureSendTx.testSequenceByFunction(server, describeTitle, consts.rpcFunctions.signTx)
    },

    testSequenceByFunction: function(server, describeTitle, txFunctionName){
        let categoryName = describeTitle + txFunctionName
        let testCasesList = tcsPressureSendTx.createTestCasesForSequenceTest(server, txFunctionName)
        framework.testTestCases(server, categoryName + '基本测试', testCasesList[0])
        framework.testTestCases(server, categoryName + '无效参数测试1', testCasesList[1])
        framework.testTestCases(server, categoryName + '无效参数测试2', testCasesList[2])
        framework.testTestCases(server, categoryName + '多交易测试1', testCasesList[3])
        framework.testTestCases(server, categoryName + '多交易测试2', testCasesList[4])
    },

    createTestCasesForSequenceTest: function(server, txFunctionName){
        let testCasesList = []
        let testCases = []
        let testCase = {}
        let title
        let value = '0.000001'
        // let fee = '0.00001'
        let valueInAmount = server.mode.service == serviceType.newChain ? value : value * consts.swtConsts.oneSwt
        let fee = server.mode.defaultFee

        title = '0630\t有效的sequence参数_01: 假设发起钱包的sequence已经到了n，发起交易时，指定sequence为n+1'
        {
            testCase = tcsPressureSendTx.createTestCaseForSequenceTest(server, title, txFunctionName, server.mode.addresses.sequence1, server.mode.addresses.receiver2, value)
            testCase.executeFunction = function(testCase){
                return new Promise(async function(resolve){
                    testCase.hasExecuted = true
                    testCase.checks = []
                    let server = testCase.server
                    let data = testCase.txParams[0]
                    let from = data.from

                    //record balance before transfer
                    let from_balance_1 = await server.getBalance(server, data.from, data.symbol)
                    let to_balance_1 = await server.getBalance(server, data.to, data.symbol)

                    //get sequence
                    let currentSequence = await framework.getSequence(server, from)
                    data.sequence = isNaN(currentSequence) ? 1 : currentSequence

                    //transfer
                    let expectedResult = framework.createExpecteResult(true)
                    await tcsPressureSendTx.executeTransfer(testCase, expectedResult, expectedResult)

                    //wait transfer result written in block
                    // await utility.timeout(server.mode.defaultBlockTime + 2000)
                    // let hash = _CurrentService == serviceType.newChain ? result.result[0] : result.result.hash
                    // let tx = await utility.getTxByHash(server, hash, 0)  //do not work in swtclib
                    if(testCase.server.mode.service == serviceType.newChain){
                        let hash = testCase.actualResult.result[0]
                        let tx = await utility.getTxByHash(server, hash, 0)  //do not work in swtclib
                    }
                    else{
                        // let hash = result.result.hash
                        // let tx = await utility.getTxByHash(server, hash, 0)  //do not work in swtclib
                        await utility.timeout(server.mode.defaultBlockTime + 2000)
                    }

                    //record balance after transfer
                    let from_balance_2 = await server.getBalance(server, data.from, data.symbol)
                    let from_balance_expected = Number(from_balance_1) - Number(server.valueToAmount(valueInAmount)) - Number(fee) //Number(server.valueToAmount(fee))
                    tcsPressureSendTx.addBalanceCheck(testCase, 'from address balance', from_balance_expected, from_balance_2)
                    // logger.debug('===from_balance_1: ' + from_balance_1)
                    // logger.debug('===valueInAmount: ' + Number(server.valueToAmount(valueInAmount)))
                    // logger.debug('===fee: ' + Number(server.valueToAmount(fee)))
                    // logger.debug('===check_2: ' + JSON.stringify(check_2))

                    let to_balance_2 = await server.getBalance(server, data.to, data.symbol)
                    let to_balance_expected = Number(to_balance_1) + Number(server.valueToAmount(valueInAmount))
                    tcsPressureSendTx.addBalanceCheck(testCase, 'to address balance', to_balance_expected, to_balance_2)

                    resolve(testCase)
                })
            }
            framework.addTestCase(testCases, testCase)
        }

        title = '0640\t有效的sequence参数_01: 假设发起钱包的sequence已经到了n，发起交易时，指定sequence为n+2;返回交易哈希，' +
            '但是余额并没有变化；此时再发起一个sequence为n+1的交易，n+2的交易再被真正记录到链上'
        {
            testCase = tcsPressureSendTx.createTestCaseForSequenceTest(server, title, txFunctionName, server.mode.addresses.sequence2, server.mode.addresses.receiver2, value)
            testCase.executeFunction = function(testCase){
                return new Promise(async function(resolve){
                    testCase.hasExecuted = true
                    testCase.checks = []
                    let server = testCase.server
                    let data = testCase.txParams[0]
                    let from = data.from

                    //record balance before transfer
                    let from_balance_1 = await server.getBalance(server, data.from, data.symbol)
                    let to_balance_1 = await server.getBalance(server, data.to, data.symbol)

                    //get sequence
                    let currentSequence = await framework.getSequence(server, from)
                    currentSequence = isNaN(currentSequence) ? 1 : currentSequence
                    data.sequence = currentSequence + 1

                    //transfer n+2 tx
                    let expectedResult = framework.createExpecteResult(true)
                    await tcsPressureSendTx.executeTransfer(testCase, expectedResult, expectedResult)

                    //wait transfer result written in block
                    await utility.timeout(server.mode.defaultBlockTime + 2000)

                    //balance should not change
                    let from_balance_2 = await server.getBalance(server, data.from, data.symbol)
                    let from_balance_expected = Number(from_balance_1)
                    tcsPressureSendTx.addBalanceCheck(testCase, 'from address balance, no change', from_balance_expected, from_balance_2)
                    let to_balance_2 = await server.getBalance(server, data.to, data.symbol)
                    let to_balance_expected = Number(to_balance_1)
                    tcsPressureSendTx.addBalanceCheck(testCase, 'to address balance, no change', to_balance_expected, to_balance_2)

                    //transfer n+1 tx
                    expectedResult = framework.createExpecteResult(true)
                    data.sequence = currentSequence
                    await tcsPressureSendTx.executeTransfer(testCase, expectedResult, expectedResult)
                    data.sequence = currentSequence + 2
                    await tcsPressureSendTx.executeTransfer(testCase, expectedResult, expectedResult)
                    // await utility.timeout(server.mode.defaultBlockTime * (server.mode.service == serviceType.oldChain ? 3 : 1) + 1000)
                    if(testCase.server.mode.service == serviceType.newChain){
                        let hash = testCase.actualResult.result[0]
                        let tx = await utility.getTxByHash(server, hash, 0)  //do not work in swtclib
                    }
                    else{
                        // let hash = result.result.hash
                        // let tx = await utility.getTxByHash(server, hash, 0)  //do not work in swtclib
                        await utility.timeout(server.mode.defaultBlockTime * 3 + 2000)
                    }

                    // balance should change now
                    from_balance_2 = await server.getBalance(server, data.from, data.symbol)
                    from_balance_expected = Number(from_balance_1) - (Number(server.valueToAmount(valueInAmount)) + Number(fee)) * 3
                    tcsPressureSendTx.addBalanceCheck(testCase, 'from address balance, need change', from_balance_expected, from_balance_2)
                    to_balance_2 = await server.getBalance(server, data.to, data.symbol)
                    to_balance_expected = Number(to_balance_1) + Number(server.valueToAmount(valueInAmount)) * 3
                    tcsPressureSendTx.addBalanceCheck(testCase, 'to address balance, need change', to_balance_expected, to_balance_2)

                    resolve(testCase)
                })
            }
            framework.addTestCase(testCases, testCase)
        }
        testCasesList.push(testCases)
        testCases = []

        title = '0650\t无效的sequence参数_01：假设发起钱包的sequence已经到了n，发起交易时，指定sequence为大于0且小于n的整数'
        {
            testCase = tcsPressureSendTx.createTestCaseForSequenceTest(server, title, txFunctionName, server.mode.addresses.sequence3, server.mode.addresses.receiver2, value)
            let signTxExpectedResult = framework.createExpecteResult(true)
            let sendTxExpectedResult = framework.createExpecteResult(false, true,
                testCase.server.mode.service == serviceType.newChain
                    ? 'temBAD_SEQUENCE Malformed: Sequence is not in the past.'
                    : consts.engineResults.tefPAST_SEQ)
            testCase.executeFunction = function(testCase){
                return tcsPressureSendTx.executeTransferFailWithSpecialSequence(testCase, sendTxExpectedResult, signTxExpectedResult,
                    function(txParams, currentSequence){
                        txParams.sequence = 1
                    })
            }
            framework.addTestCase(testCases, testCase)
        }

        title = '0660\t无效的sequence参数_02：指定sequence为正整数之外的其他值：小数'
        {
            testCase = tcsPressureSendTx.createTestCaseForSequenceTest(server, title, txFunctionName, server.mode.addresses.sequence3, server.mode.addresses.receiver2, value)
            let signTxExpectedResult = framework.createExpecteResult(false, true,
                server.mode.service == serviceType.newChain ? 'sequence must be positive integer' : consts.engineResults.temBAD_SEQUENCE)
            let sendTxExpectedResult = signTxExpectedResult
            testCase.executeFunction = function(testCase){
                return tcsPressureSendTx.executeTransferFailWithSpecialSequence(testCase, sendTxExpectedResult, signTxExpectedResult,
                    function(txParams, currentSequence){
                        txParams.sequence = 0.5
                    })
            }
            framework.addTestCase(testCases, testCase)
        }
        testCasesList.push(testCases)
        testCases = []

        title = '0660\t无效的sequence参数_02：指定sequence为正整数之外的其他值：负数'
        {
            testCase = tcsPressureSendTx.createTestCaseForSequenceTest(server, title, txFunctionName, server.mode.addresses.sequence3, server.mode.addresses.receiver2, value)
            let signTxExpectedResult = framework.createExpecteResult(false, true,
                server.mode.service == serviceType.newChain ? 'sequence must be positive integer' : consts.engineResults.temBAD_SEQUENCE)
            let sendTxExpectedResult = signTxExpectedResult
            testCase.executeFunction = function(testCase){
                return tcsPressureSendTx.executeTransferFailWithSpecialSequence(testCase, sendTxExpectedResult, signTxExpectedResult,
                    function(txParams, currentSequence){
                        txParams.sequence = -1
                    })
            }
            framework.addTestCase(testCases, testCase)
        }

        title = '0660\t无效的sequence参数_02：指定sequence为正整数之外的其他值：字符串'
        {
            testCase = tcsPressureSendTx.createTestCaseForSequenceTest(server, title, txFunctionName, server.mode.addresses.sequence3, server.mode.addresses.receiver2, value)
            let signTxExpectedResult = framework.createExpecteResult(false, true,
                server.mode.service == serviceType.newChain ? 'sequence must be positive integer' : consts.engineResults.temBAD_SEQUENCE)
            let sendTxExpectedResult = signTxExpectedResult
            testCase.executeFunction = function(testCase){
                return tcsPressureSendTx.executeTransferFailWithSpecialSequence(testCase, sendTxExpectedResult, signTxExpectedResult,
                    function(txParams, currentSequence){
                        txParams.sequence = 'abcdefgijklmnopq'
                    })
            }
            framework.addTestCase(testCases, testCase)
        }
        testCasesList.push(testCases)
        testCases = []

        title = '0670	同时发起多个交易时指定sequence_01:假设发起钱包的sequence已经到了n，同时发起m个交易，' +
            '指定每个交易的sequence分别为n+1、n+2、…、n+m'
        {
            testCase = tcsPressureSendTx.createTestCaseForSequenceTest(server, title, txFunctionName, server.mode.addresses.sequence4, server.mode.addresses.receiver2, value)
            testCase.executeFunction = function(testCase){
                return new Promise(async function(resolve){
                    testCase.hasExecuted = true
                    testCase.checks = []
                    let server = testCase.server
                    let data = testCase.txParams[0]
                    let from = data.from

                    //record balance before transfer
                    let from_balance_1 = await server.getBalance(server, data.from, data.symbol)
                    let to_balance_1 = await server.getBalance(server, data.to, data.symbol)

                    //transfer
                    let currentSequence = await framework.getSequence(server, from)
                    currentSequence = isNaN(currentSequence) ? 1 : currentSequence
                    let expectedResult = framework.createExpecteResult(true)
                    data.sequence = currentSequence
                    await tcsPressureSendTx.executeTransfer(testCase, expectedResult, expectedResult)
                    data.sequence = currentSequence + 1
                    await tcsPressureSendTx.executeTransfer(testCase, expectedResult, expectedResult)
                    data.sequence = currentSequence + 2
                    await tcsPressureSendTx.executeTransfer(testCase, expectedResult, expectedResult)
                    data.sequence = currentSequence + 3
                    await tcsPressureSendTx.executeTransfer(testCase, expectedResult, expectedResult)
                    data.sequence = currentSequence + 4
                    await tcsPressureSendTx.executeTransfer(testCase, expectedResult, expectedResult)

                    //wait transfer result written in block
                    if(testCase.server.mode.service == serviceType.newChain){
                        let hash = testCase.actualResult.result[0]
                        let tx = await utility.getTxByHash(server, hash, 0)  //do not work in swtclib
                    }
                    else{
                        // let hash = result.result.hash
                        // let tx = await utility.getTxByHash(server, hash, 0)  //do not work in swtclib
                        await utility.timeout(server.mode.defaultBlockTime + 2000)
                    }

                    //record balance after transfer
                    let from_balance_2 = await server.getBalance(server, data.from, data.symbol)
                    let from_balance_expected = Number(from_balance_1) - (Number(server.valueToAmount(valueInAmount)) + Number(fee)) * 5
                    tcsPressureSendTx.addBalanceCheck(testCase, 'from address balance', from_balance_expected, from_balance_2)


                    let to_balance_2 = await server.getBalance(server, data.to, data.symbol)
                    let to_balance_expected = Number(to_balance_1) + Number(server.valueToAmount(valueInAmount)) * 5
                    tcsPressureSendTx.addBalanceCheck(testCase, 'to address balance', to_balance_expected, to_balance_2)

                    resolve(testCase)
                })
            }
            framework.addTestCase(testCases, testCase)
        }
        testCasesList.push(testCases)
        testCases = []

        title = '0680\t同时发起多个交易时指定sequence_02:假设发起钱包的sequence已经到了n，' +
            '同时发起m个交易，指定每个交易的sequence分别为n+1、n+3、n+5、…、n+2m-1'
        {
            testCase = tcsPressureSendTx.createTestCaseForSequenceTest(server, title, txFunctionName, server.mode.addresses.sequence5, server.mode.addresses.receiver2, value)
            testCase.executeFunction = function(testCase){
                return new Promise(async function(resolve){
                    testCase.hasExecuted = true
                    testCase.checks = []
                    let server = testCase.server
                    let data = testCase.txParams[0]
                    let from = data.from
                    let check = {}

                    //record balance before transfer
                    let from_balance_1 = await server.getBalance(server, data.from, data.symbol)
                    let to_balance_1 = await server.getBalance(server, data.to, data.symbol)

                    //transfer n+2 tx
                    let currentSequence = await framework.getSequence(server, from)
                    currentSequence = isNaN(currentSequence) ? 1 : currentSequence
                    let expectedResult = framework.createExpecteResult(true)
                    data.sequence = currentSequence + 1
                    await tcsPressureSendTx.executeTransfer(testCase, expectedResult, expectedResult)
                    data.sequence = currentSequence + 3
                    await tcsPressureSendTx.executeTransfer(testCase, expectedResult, expectedResult)
                    data.sequence = currentSequence + 5
                    await tcsPressureSendTx.executeTransfer(testCase, expectedResult, expectedResult)
                    data.sequence = currentSequence + 7
                    await tcsPressureSendTx.executeTransfer(testCase, expectedResult, expectedResult)

                    //wait transfer result written in block
                    await utility.timeout(server.mode.defaultBlockTime + 2000)

                    //balance should not change
                    let from_balance_2 = await server.getBalance(server, data.from, data.symbol)
                    let from_balance_expected = Number(from_balance_1)
                    tcsPressureSendTx.addBalanceCheck(testCase, 'from address balance check, no change', from_balance_expected, from_balance_2)
                    let to_balance_2 = await server.getBalance(server, data.to, data.symbol)
                    let to_balance_expected = Number(to_balance_1)
                    tcsPressureSendTx.addBalanceCheck(testCase, 'to address balance check, no change', to_balance_expected, to_balance_2)

                    //transfer n+1 tx
                    data.sequence = currentSequence
                    await tcsPressureSendTx.executeTransfer(testCase, expectedResult, expectedResult)
                    data.sequence = currentSequence + 2
                    await tcsPressureSendTx.executeTransfer(testCase, expectedResult, expectedResult)
                    data.sequence = currentSequence + 4
                    await tcsPressureSendTx.executeTransfer(testCase, expectedResult, expectedResult)
                    data.sequence = currentSequence + 6
                    await tcsPressureSendTx.executeTransfer(testCase, expectedResult, expectedResult)
                    data.sequence = currentSequence + 8
                    await tcsPressureSendTx.executeTransfer(testCase, expectedResult, expectedResult)   //NOTICE:  the last transfer must be right sequence, cannot be future sequnce!
                    // await utility.timeout(server.mode.defaultBlockTime * (server.mode.service == serviceType.oldChain ? 3 : 1) + 1000)
                    if(testCase.server.mode.service == serviceType.newChain){
                        let hash = testCase.actualResult.result[0]
                        let tx = await utility.getTxByHash(server, hash, 0)  //do not work in swtclib
                    }
                    else{
                        // let hash = result.result.hash
                        // let tx = await utility.getTxByHash(server, hash, 0)  //do not work in swtclib
                        await utility.timeout(server.mode.defaultBlockTime * 3 + 2000)
                    }

                    // balance should change now
                    from_balance_2 = await server.getBalance(server, data.from, data.symbol)
                    from_balance_expected = Number(from_balance_1) - (Number(server.valueToAmount(valueInAmount)) + Number(fee)) * 9
                    tcsPressureSendTx.addBalanceCheck(testCase, 'from address balance, need change', from_balance_expected, from_balance_2)
                    to_balance_2 = await server.getBalance(server, data.to, data.symbol)
                    to_balance_expected = Number(to_balance_1) + Number(server.valueToAmount(valueInAmount)) * 9
                    tcsPressureSendTx.addBalanceCheck(testCase, 'to address balance check, need change', to_balance_expected, to_balance_2)

                    resolve(testCase)
                })
            }
            framework.addTestCase(testCases, testCase)
        }
        testCasesList.push(testCases)
        testCases = []

        return testCasesList
    },

    createTestCaseForSequenceTest: function(server, title, txFunctionName, sender, receiver, value, fee){
        let txParams = server.createTransferParams(sender.address, sender.secret, null,
            receiver.address, value, fee, ['autotest: sequence test'])
        let testCase = framework.createTestCase(title, server,
            txFunctionName, txParams, null,
            null, framework.checkTestCase, null,
            restrictedLevel.L2, [serviceType.newChain, serviceType.oldChain])
        return testCase
    },

    // endregion

    //region pressure test
    testForPressureTest: function(server, describeTitle, testRound){
        describe(describeTitle, function () {
            let categoryName = ''
            let testCases = []

            categoryName = '原生币swt压力测试，分多个case执行'
            testCases = tcsPressureSendTx.createTestCasesForPressureTest(server, categoryName, testRound)
            framework.testTestCases(server, categoryName, testCases)

            categoryName = '原生币swt压力测试，jt_sendTransaction，在一个内case执行'
            testCases = tcsPressureSendTx.createTestCasesForPressureTestInOneCase(server,  consts.rpcFunctions.sendTx, testRound)
            framework.testTestCases(server, categoryName, testCases)

            categoryName = '原生币swt压力测试，jt_signTransaction，在一个内case执行'
            testCases = tcsPressureSendTx.createTestCasesForPressureTestInOneCase(server,  consts.rpcFunctions.signTx, testRound)
            framework.testTestCases(server, categoryName, testCases)
        })
    },

    createTestCasesForPressureTest: function(server, categoryName, testCount){
        let testCases = []
        for(let i = 0; i < testCount; i++){
            let txParams = framework.createTxParamsForTransfer(server)
            let txFunctionName = consts.rpcFunctions.sendTx
            let executeFunction = framework.executeTestCaseOfSendTx
            let checkFunction = framework.checkTestCaseOfSendTx
            let expectedResult = framework.createExpecteResult(true)
            let testCase = framework.createTestCase('0010\t发起' + categoryName + '有效交易_' + (i + 1), server,
                txFunctionName, txParams, null,
                executeFunction, checkFunction, expectedResult,
                restrictedLevel.L3, [serviceType.newChain, serviceType.oldChain])
            framework.addTestCase(testCases, testCase)
        }
        return testCases
    },

    //region pressure test in one case
    createTestCasesForPressureTestInOneCase: function(server, txFunctionName, count){
        let testCases = []
        let title = '9000\t交易压力测试，交易数量：' + count
        let testCase = tcsPressureSendTx.createTestCaseForPressureTest(server, title, txFunctionName, count)
        testCase.restrictedLevel = restrictedLevel.L3
        framework.addTestCase(testCases, testCase)
        return testCases
    },

    createTestCaseForPressureTest: function(server, title, txFunctionName, count){
        let testCase = tcsPressureSendTx.createTestCaseForSequenceTest(server, title, txFunctionName, server.mode.addresses.pressureAccount, server.mode.addresses.receiver2, '0.000001')
        testCase.executeFunction = function(testCase){
            return new Promise(async function(resolve){
                testCase.hasExecuted = true
                testCase.checks = []
                let server = testCase.server
                let data = testCase.txParams[0]
                let from = data.from

                let value = '0.000001'
                // let fee = '0.00001'
                let valueInAmount = testCase.server.mode.service == serviceType.newChain ? value : value * consts.swtConsts.oneSwt
                let fee = server.mode.defaultFee

                //record balance before transfer
                let from_balance_1 = await server.getBalance(server, data.from, data.symbol)
                let to_balance_1 = await server.getBalance(server, data.to, data.symbol)

                //get sequence
                let currentSequence = await framework.getSequence(server, from)
                currentSequence = isNaN(currentSequence) ? 1 : currentSequence

                //transfer
                for(let i = 0; i < count; i++){
                    data.sequence = currentSequence + i
                    let expectedResult = framework.createExpecteResult(true)
                    await tcsPressureSendTx.executeTransfer(testCase, expectedResult, expectedResult)
                }

                //wait transfer result written in block
                // await utility.timeout(server.mode.defaultBlockTime + 2000)
                // let hash = testCase.server.mode.service == serviceType.newChain ? result.result[0] : result.result.hash
                // let tx = await utility.getTxByHash(server, hash, 0)  //do not work in swtclib
                if(server.mode.service == serviceType.newChain){
                    let hash = testCase.actualResult.result[0]
                    let tx = await utility.getTxByHash(server, hash, 0)  //do not work in swtclib
                }
                else{
                    // let hash = result.result.hash
                    // let tx = await utility.getTxByHash(server, hash, 0)  //do not work in swtclib
                    await utility.timeout(server.mode.defaultBlockTime + 2000)
                }

                //record balance after transfer
                let from_balance_2 = await server.getBalance(server, data.from, data.symbol)
                let from_balance_expected = Number(from_balance_1) - (Number(server.valueToAmount(valueInAmount)) + Number(fee)) * count
                tcsPressureSendTx.addBalanceCheck(testCase, 'from address balance check', from_balance_expected, from_balance_2)
                // logger.debug('===from_balance_1: ' + from_balance_1)
                // logger.debug('===valueInAmount: ' + Number(server.valueToAmount(valueInAmount)))
                // logger.debug('===fee: ' + Number(server.valueToAmount(fee)))
                // logger.debug('===check_2: ' + JSON.stringify(check_2))

                let to_balance_2 = await server.getBalance(server, data.to, data.symbol)
                let to_balance_expected = Number(to_balance_1) + Number(server.valueToAmount(valueInAmount)) * count
                tcsPressureSendTx.addBalanceCheck(testCase, 'to address balance check', to_balance_expected, to_balance_2)

                resolve(testCase)
            })
        }
        testCase.checkFunction = framework.checkTestCase
        return testCase
    },
    //endregion

    //endregion

    //region pure pressure test, send without getTx

    //pure pressure test means just send tx or send rawtx, whithout checking balance, getting tx, etc checks.
    testForPurePressureTest: function(server, describeTitle, testCountOfSingleCase){
        let testCases = []
        let accountParams = []
        let addresses = server.mode.addresses
        let value = '0.000001'
        let fee = '0.00001'
        // const SINGER_PRESSURE_TEST_COUNT = 5  //better to be the times of the count of servers
        let count = testCountOfSingleCase

        //region push account params

        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.sender1.address, addresses.sender1.secret,
            addresses.receiver1.address, value, fee, null, consts.rpcFunctions.sendTx, count))
        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.sender2.address, addresses.sender2.secret,
            addresses.receiver2.address, value, fee, null, consts.rpcFunctions.sendTx, count))
        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.sender3.address, addresses.sender3.secret,
            addresses.receiver3.address, value, fee, null, consts.rpcFunctions.sendTx, count))
        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.receiver1.address, addresses.receiver1.secret,
            addresses.sender1.address, value, fee, null, consts.rpcFunctions.sendTx, count))
        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.receiver2.address, addresses.receiver2.secret,
            addresses.sender2.address, value, fee, null, consts.rpcFunctions.sendTx, count))
        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.receiver3.address, addresses.receiver3.secret,
            addresses.sender3.address, value, fee, null, consts.rpcFunctions.sendTx, count))
        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount.address, addresses.pressureAccount.secret,
            addresses.sender3.address, value, fee, null, consts.rpcFunctions.sendTx, count))

        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount1.address, addresses.pressureAccount1.secret,
            addresses.sender3.address, value, fee, null, consts.rpcFunctions.sendTx, count))
        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount2.address, addresses.pressureAccount2.secret,
            addresses.sender3.address, value, fee, null, consts.rpcFunctions.sendTx, count))
        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount3.address, addresses.pressureAccount3.secret,
            addresses.sender3.address, value, fee, null, consts.rpcFunctions.sendTx, count))
        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount4.address, addresses.pressureAccount4.secret,
            addresses.sender3.address, value, fee, null, consts.rpcFunctions.sendTx, count))
        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount5.address, addresses.pressureAccount5.secret,
            addresses.sender3.address, value, fee, null, consts.rpcFunctions.sendTx, count))

        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount6.address, addresses.pressureAccount6.secret,
            addresses.sender3.address, value, fee, null, consts.rpcFunctions.signTx, count))
        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount7.address, addresses.pressureAccount7.secret,
            addresses.sender3.address, value, fee, null, consts.rpcFunctions.signTx, count))
        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount8.address, addresses.pressureAccount8.secret,
            addresses.sender3.address, value, fee, null, consts.rpcFunctions.signTx, count))
        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount9.address, addresses.pressureAccount9.secret,
            addresses.sender3.address, value, fee, null, consts.rpcFunctions.signTx, count))
        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount10.address, addresses.pressureAccount10.secret,
            addresses.sender3.address, value, fee, null, consts.rpcFunctions.signTx, count))

        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount11.address, addresses.pressureAccount11.secret,
            addresses.sender3.address, value, fee, null, consts.rpcFunctions.sendTx, count))
        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount12.address, addresses.pressureAccount12.secret,
            addresses.sender3.address, value, fee, null, consts.rpcFunctions.sendTx, count))
        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount13.address, addresses.pressureAccount13.secret,
            addresses.sender3.address, value, fee, null, consts.rpcFunctions.sendTx, count))
        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount14.address, addresses.pressureAccount14.secret,
            addresses.sender3.address, value, fee, null, consts.rpcFunctions.sendTx, count))
        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount15.address, addresses.pressureAccount15.secret,
            addresses.sender3.address, value, fee, null, consts.rpcFunctions.sendTx, count))

        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount16.address, addresses.pressureAccount16.secret,
            addresses.sender3.address, value, fee, null, consts.rpcFunctions.signTx, count))
        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount17.address, addresses.pressureAccount17.secret,
            addresses.sender3.address, value, fee, null, consts.rpcFunctions.signTx, count))
        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount18.address, addresses.pressureAccount18.secret,
            addresses.sender3.address, value, fee, null, consts.rpcFunctions.signTx, count))
        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount19.address, addresses.pressureAccount19.secret,
            addresses.sender3.address, value, fee, null, consts.rpcFunctions.signTx, count))
        accountParams.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount20.address, addresses.pressureAccount20.secret,
            addresses.sender3.address, value, fee, null, consts.rpcFunctions.signTx, count))

        //endregion

        testCases = tcsPressureSendTx.createTestCaseForPurePressureTest(server,  accountParams)
        framework.testTestCases(server, describeTitle, testCases)
    },

    createTestCaseForPurePressureTest: function(server, accountParams){
        let testCases = []
        let totalCount = 0
        for (let accountParam of accountParams){
            totalCount += accountParam.count
        }
        let title = '9001\t纯交易压力测试，交易数量：' + totalCount
        // let testCase = tcsPressureSendTx.createTestCaseForPressureTest(server, title, txFunctionName, count)
        let testCase = framework.createTestCase(title, server,
            '', '', null,
            null, null, null,
            restrictedLevel.L3, [serviceType.newChain, serviceType.oldChain])

        testCase.otherParams = {}
        testCase.otherParams.accountParams = accountParams
        testCase.otherParams.totalCount = totalCount
        testCase.executeFunction = tcsPressureSendTx.executePurePressureTest
        testCase.checkFunction = tcsPressureSendTx.checkPurePressureTest

        framework.addTestCase(testCases, testCase)
        return testCases
    },

    executePurePressureTest: function(testCase){
        testCase.hasExecuted = true
        return new Promise(async (resolve, reject) => {
            let server = testCase.server
            let accountParams = testCase.otherParams.accountParams
            let totalCount = testCase.otherParams.totalCount
            let executeCount = 0
            let totalSuccessCount = 0
            accountParams.forEach(async accountParam=>{
                // for (let accountParam of accountParams){
                // for (let j = 0; j < accountParams.length; j++){
                //     let accountParam = accountParams[j]
                let count = accountParam.count
                let txFunctionName = accountParam.txFunctionName

                //get sequence
                let currentSequence = await framework.getSequence(server, accountParam.from)
                currentSequence = isNaN(currentSequence) ? 1 : currentSequence
                let sequence = currentSequence

                accountParam.results = []
                accountParam.successCount = 0

                //transfer
                for(let i = 0; i < count; i++){
                    let params = server.createTransferParams(accountParam.from, accountParam.secret, sequence,
                        accountParam.to, accountParam.value, accountParam.fee, accountParam.memos)
                    let result = await server.getResponse(server, txFunctionName, params)
                    if (txFunctionName == consts.rpcFunctions.signTx && utility.isResponseStatusSuccess(result)){
                        result = await server.getResponse(server, consts.rpcFunctions.sendRawTx, [result.result[0]])
                    }
                    executeCount++
                    accountParam.results.push(result)
                    if(utility.isResponseStatusSuccess(result)) {
                        sequence++
                        framework.setSequence(server.getName(), accountParam.from, sequence)
                        accountParam.successCount++
                        totalSuccessCount++
                    }

                    logger.info('[' + executeCount.toString() + '/' + totalSuccessCount + '] - [' + accountParam.from + ']: '
                        + JSON.stringify(result))

                    if(executeCount == totalCount){
                        testCase.otherParams.executeCount = executeCount
                        testCase.otherParams.totalSuccessCount = totalSuccessCount
                        resolve(testCase.otherParams)
                    }
                }
            })
        })
    },

    checkPurePressureTest: async function(testCase){
        let totalCount = testCase.otherParams.totalCount
        let totalSuccessCount = testCase.otherParams.totalSuccessCount
        let totalFailCount = testCase.otherParams.totalFailCount

        //check tps
        let server = testCase.server
        let blockTime = server.mode.defaultBlockTime / 1000

        let startTxHash = testCase.otherParams.accountParams[0].results[0].result[0]
        let startTx = await utility.getTxByHash(server, startTxHash)
        let startBlockNumber = startTx.result.ledger_index

        let endAccountParams = testCase.otherParams.accountParams[testCase.otherParams.accountParams.length - 1]
        let endTxHash = endAccountParams.results[endAccountParams.results.length - 1].result[0]
        let endTx = await utility.getTxByHash(server, endTxHash)
        let endBlockNumber = endTx.result.ledger_index

        let blockTpsInfoList = []
        for(let i = startBlockNumber; i <= endBlockNumber; i++){
            let blockResponse = await server.getResponse(server, consts.rpcFunctions.getBlockByNumber, [i.toString(), false])
            let block = blockResponse.result
            let blockTpsInfo = {}
            blockTpsInfo.blockNumber = block.ledger_index
            blockTpsInfo.txCount = block.transactions.length
            blockTpsInfo.tps = blockTpsInfo.txCount / blockTime
            blockTpsInfoList.push(blockTpsInfo)
        }

        let txCountInBlocks = 0
        for(let blockTpsInfo of blockTpsInfoList){
            logger.info('------ block tps status ------')
            logger.info("blockNumber: " + blockTpsInfo.blockNumber)
            logger.info("txCount: " + blockTpsInfo.txCount)
            logger.info("tps: " + blockTpsInfo.tps)
            txCountInBlocks += blockTpsInfo.txCount
        }

        let blockCount = endBlockNumber - startBlockNumber + 1
        let tps1 = totalSuccessCount / blockCount / blockTime
        let tps2 = txCountInBlocks / blockCount / blockTime
        logger.info("======== tps status ========")
        logger.info("startBlockNumber: " + startBlockNumber)
        logger.info("endBlockNumber: " + endBlockNumber)
        logger.info("blockCount: " + blockCount)
        logger.info("totalSuccessCount: " + totalSuccessCount)
        logger.info("totalFailCount: " + totalFailCount)
        logger.info("tps1: " + tps1)
        logger.info("txCountInBlocks: " + txCountInBlocks)
        logger.info("tps2: " + tps2)

        expect(totalSuccessCount).to.be.equal(totalCount)
    },

    createAccountParam: function(from, secret, to, value, fee, memos, txFunctionName, count, shouldSuccessCount){
        let accountParam = {}
        if(from != null) accountParam.from = from
        if(secret != null) accountParam.secret = secret
        if(to != null) accountParam.to = to
        if(value != null) accountParam.value = value
        if(fee != null) accountParam.fee = fee
        if(memos != null) accountParam.memos = memos
        if(txFunctionName != null) accountParam.txFunctionName = txFunctionName
        if(count != null) accountParam.count = count
        if(shouldSuccessCount != null) accountParam.shouldSuccessCount = shouldSuccessCount
        return accountParam
    },

    //endregion

    //region performance test, multi nodes, multi tx, send/sign mix.

    //pure performance test means just send tx, no send rawtx, whithout checking balance, getting tx, etc checks.
    //several accounts, several nodes
    testForFastPerformance: function(server, describeTitle, servers, testRound, mode){
        let serverCount = servers.length
        let testCount = serverCount * 1
        let memosLength = 8

        let testCases = []
        let title = '0120\t不同账户向5个不同的节点连续发送交易（signTx, 带8字节memo）测试性能上限'
        let caseRestrictedLevel = restrictedLevel.L3
        let memos = utility.createMemosWithSpecialLength(memosLength)
        let txFunction = consts.rpcFunctions.sendTx
        let value = '0.000001'
        let fee = '0.00001'
        let addresses = server.mode.addresses

        let subCases = []
        for(let i = 0; i < testRound; i++){
            subCases = subCases.concat(tcsPressureSendTx.createAccountParamsWithDifferentAccount(addresses, value, fee, memos, txFunction, testCount, true))
        }
        let testCase = tcsPressureSendTx.createTestCaseForPerformanceTest(server, title, servers, subCases, caseRestrictedLevel)
        if(mode && mode == 'WithoutResponse'){
            testCase.executeFunction = framework.executeSubCasesWithoutResponse
            testCase.checkFunction = framework.checkSubCasesWithoutResponse
        }
        framework.addTestCase(testCases, testCase)
        framework.testTestCases(server, describeTitle + '， 数量： ' + testCase.otherParams.totalCount, testCases)
    },

    //pure pressure test means just send tx or send rawtx, whithout checking balance, getting tx, etc checks.
    testForPerformanceTest: function(server, describeTitle, testCountOfSingleCase){
        let titles = []
        let caseRestrictedLevel = restrictedLevel.L2
        let memos = null
        // const SINGER_PRESSURE_TEST_COUNT = 5
        let testCount = testCountOfSingleCase

        //region no memos
        caseRestrictedLevel = restrictedLevel.L2
        memos = null
        titles = []

        titles.push('0010\t同一账户向同一节点连续发送交易（sendTx, 不带memo）测试性能上限')
        titles.push('0020\t同一账户向2个不同的节点连续发送交易（sendTx, 不带memo）测试性能上限')
        titles.push('0030\t同一账户向3个不同的节点连续发送交易（sendTx, 不带memo）测试性能上限')
        titles.push('0040\t同一账户向4个不同的节点连续发送交易（sendTx, 不带memo）测试性能上限')
        titles.push('0050\t同一账户向5个不同的节点连续发送交易（sendTx, 不带memo）测试性能上限')

        titles.push('0010\t同一账户向同一节点连续发送交易（signTx, 不带memo）测试性能上限')
        titles.push('0020\t同一账户向2个不同的节点连续发送交易（signTx, 不带memo）测试性能上限')
        titles.push('0030\t同一账户向3个不同的节点连续发送交易（signTx, 不带memo）测试性能上限')
        titles.push('0040\t同一账户向4个不同的节点连续发送交易（signTx, 不带memo）测试性能上限')
        titles.push('0050\t同一账户向5个不同的节点连续发送交易（signTx, 不带memo）测试性能上限')

        titles.push('0060\t不同账户向同一节点连续发送交易（sendTx, 不带memo）测试性能上限')
        titles.push('0070\t不同账户向2个不同的节点连续发送交易（sendTx, 不带memo）测试性能上限')
        titles.push('0080\t不同账户向3个不同的节点连续发送交易（sendTx, 不带memo）测试性能上限')
        titles.push('0090\t不同账户向4个不同的节点连续发送交易（sendTx, 不带memo）测试性能上限')
        titles.push('0100\t不同账户向5个不同的节点连续发送交易（sendTx, 不带memo）测试性能上限')

        titles.push('0060\t不同账户向同一节点连续发送交易（signTx, 不带memo）测试性能上限')
        titles.push('0070\t不同账户向2个不同的节点连续发送交易（signTx, 不带memo）测试性能上限')
        titles.push('0080\t不同账户向3个不同的节点连续发送交易（signTx, 不带memo）测试性能上限')
        titles.push('0090\t不同账户向4个不同的节点连续发送交易（signTx, 不带memo）测试性能上限')
        titles.push('0100\t不同账户向5个不同的节点连续发送交易（signTx, 不带memo）测试性能上限')

        tcsPressureSendTx.testForPerformanceTestForOneRound(server, describeTitle, titles, memos, caseRestrictedLevel, testCount)
        //endregion

        //region 8b memos
        caseRestrictedLevel = restrictedLevel.L3
        memos = utility.createMemosWithSpecialLength(8)
        titles = []

        titles.push('0110\t同一账户向同一节点连续发送交易（sendTx, 带8字节memo）测试性能上限')
        titles.push('0110\t同一账户向2个不同的节点连续发送交易（sendTx, 带8字节memo）测试性能上限')
        titles.push('0110\t同一账户向3个不同的节点连续发送交易（sendTx, 带8字节memo）测试性能上限')
        titles.push('0110\t同一账户向4个不同的节点连续发送交易（sendTx, 带8字节memo）测试性能上限')
        titles.push('0120\t同一账户向5个不同的节点连续发送交易（sendTx, 带8字节memo）测试性能上限')

        titles.push('0110\t同一账户向同一节点连续发送交易（signTx, 带8字节memo）测试性能上限')
        titles.push('0110\t同一账户向2个不同的节点连续发送交易（signTx, 带8字节memo）测试性能上限')
        titles.push('0110\t同一账户向3个不同的节点连续发送交易（signTx, 带8字节memo）测试性能上限')
        titles.push('0110\t同一账户向4个不同的节点连续发送交易（signTx, 带8字节memo）测试性能上限')
        titles.push('0120\t同一账户向5个不同的节点连续发送交易（signTx, 带8字节memo）测试性能上限')

        titles.push('0110\t不同账户向同一节点连续发送交易（sendTx, 带8字节memo）测试性能上限')
        titles.push('0110\t不同账户向2个不同的节点连续发送交易（sendTx, 带8字节memo）测试性能上限')
        titles.push('0110\t不同账户向3个不同的节点连续发送交易（sendTx, 带8字节memo）测试性能上限')
        titles.push('0110\t不同账户向4个不同的节点连续发送交易（sendTx, 带8字节memo）测试性能上限')
        titles.push('0120\t不同账户向5个不同的节点连续发送交易（sendTx, 带8字节memo）测试性能上限')

        titles.push('0110\t不同账户向同一节点连续发送交易（signTx, 带8字节memo）测试性能上限')
        titles.push('0110\t不同账户向2个不同的节点连续发送交易（signTx, 带8字节memo）测试性能上限')
        titles.push('0110\t不同账户向3个不同的节点连续发送交易（signTx, 带8字节memo）测试性能上限')
        titles.push('0110\t不同账户向4个不同的节点连续发送交易（signTx, 带8字节memo）测试性能上限')
        titles.push('0120\t不同账户向5个不同的节点连续发送交易（signTx, 带8字节memo）测试性能上限')

        tcsPressureSendTx.testForPerformanceTestForOneRound(server, describeTitle, titles, memos, caseRestrictedLevel, testCount)
        //endregion

        //region 64b memos
        caseRestrictedLevel = restrictedLevel.L3
        memos = utility.createMemosWithSpecialLength(64)
        titles = []

        titles.push('0130\t同一账户向同一节点连续发送交易（sendTx, 带64字节memo）测试性能上限')
        titles.push('0130\t同一账户向2个不同的节点连续发送交易（sendTx, 带64字节memo）测试性能上限')
        titles.push('0130\t同一账户向3个不同的节点连续发送交易（sendTx, 带64字节memo）测试性能上限')
        titles.push('0130\t同一账户向4个不同的节点连续发送交易（sendTx, 带64字节memo）测试性能上限')
        titles.push('0140\t同一账户向5个不同的节点连续发送交易（sendTx, 带64字节memo）测试性能上限')

        titles.push('0130\t同一账户向同一节点连续发送交易（signTx, 带64字节memo）测试性能上限')
        titles.push('0130\t同一账户向2个不同的节点连续发送交易（signTx, 带64字节memo）测试性能上限')
        titles.push('0130\t同一账户向3个不同的节点连续发送交易（signTx, 带64字节memo）测试性能上限')
        titles.push('0130\t同一账户向4个不同的节点连续发送交易（signTx, 带64字节memo）测试性能上限')
        titles.push('0140\t同一账户向5个不同的节点连续发送交易（signTx, 带64字节memo）测试性能上限')

        titles.push('0130\t不同账户向同一节点连续发送交易（sendTx, 带64字节memo）测试性能上限')
        titles.push('0130\t不同账户向2个不同的节点连续发送交易（sendTx, 带64字节memo）测试性能上限')
        titles.push('0130\t不同账户向3个不同的节点连续发送交易（sendTx, 带64字节memo）测试性能上限')
        titles.push('0130\t不同账户向4个不同的节点连续发送交易（sendTx, 带64字节memo）测试性能上限')
        titles.push('0140\t不同账户向5个不同的节点连续发送交易（sendTx, 带64字节memo）测试性能上限')

        titles.push('0130\t不同账户向同一节点连续发送交易（signTx, 带64字节memo）测试性能上限')
        titles.push('0130\t不同账户向2个不同的节点连续发送交易（signTx, 带64字节memo）测试性能上限')
        titles.push('0130\t不同账户向3个不同的节点连续发送交易（signTx, 带64字节memo）测试性能上限')
        titles.push('0130\t不同账户向4个不同的节点连续发送交易（signTx, 带64字节memo）测试性能上限')
        titles.push('0140\t不同账户向5个不同的节点连续发送交易（signTx, 带64字节memo）测试性能上限')

        tcsPressureSendTx.testForPerformanceTestForOneRound(server, describeTitle, titles, memos, caseRestrictedLevel, testCount)
        //endregion

        //region 512b memos
        caseRestrictedLevel = restrictedLevel.L4
        memos = utility.createMemosWithSpecialLength(512)
        titles = []

        titles.push('0150\t同一账户向同一节点连续发送交易（sendTx, 带512字节memo）测试性能上限')
        titles.push('0150\t同一账户向2个不同的节点连续发送交易（sendTx, 带512字节memo）测试性能上限')
        titles.push('0150\t同一账户向3个不同的节点连续发送交易（sendTx, 带512字节memo）测试性能上限')
        titles.push('0150\t同一账户向4个不同的节点连续发送交易（sendTx, 带512字节memo）测试性能上限')
        titles.push('0160\t同一账户向5个不同的节点连续发送交易（sendTx, 带512字节memo）测试性能上限')

        titles.push('0150\t同一账户向同一节点连续发送交易（signTx, 带512字节memo）测试性能上限')
        titles.push('0150\t同一账户向2个不同的节点连续发送交易（signTx, 带512字节memo）测试性能上限')
        titles.push('0150\t同一账户向3个不同的节点连续发送交易（signTx, 带512字节memo）测试性能上限')
        titles.push('0150\t同一账户向4个不同的节点连续发送交易（signTx, 带512字节memo）测试性能上限')
        titles.push('0160\t同一账户向5个不同的节点连续发送交易（signTx, 带512字节memo）测试性能上限')

        titles.push('0150\t不同账户向同一节点连续发送交易（sendTx, 带512字节memo）测试性能上限')
        titles.push('0150\t不同账户向2个不同的节点连续发送交易（sendTx, 带512字节memo）测试性能上限')
        titles.push('0150\t不同账户向3个不同的节点连续发送交易（sendTx, 带512字节memo）测试性能上限')
        titles.push('0150\t不同账户向4个不同的节点连续发送交易（sendTx, 带512字节memo）测试性能上限')
        titles.push('0160\t不同账户向5个不同的节点连续发送交易（sendTx, 带512字节memo）测试性能上限')

        titles.push('0150\t不同账户向同一节点连续发送交易（signTx, 带512字节memo）测试性能上限')
        titles.push('0150\t不同账户向2个不同的节点连续发送交易（signTx, 带512字节memo）测试性能上限')
        titles.push('0150\t不同账户向3个不同的节点连续发送交易（signTx, 带512字节memo）测试性能上限')
        titles.push('0150\t不同账户向4个不同的节点连续发送交易（signTx, 带512字节memo）测试性能上限')
        titles.push('0160\t不同账户向5个不同的节点连续发送交易（signTx, 带512字节memo）测试性能上限')

        tcsPressureSendTx.testForPerformanceTestForOneRound(server, describeTitle, titles, memos, caseRestrictedLevel, testCount)
        //endregion

        //region 4096b memos
        caseRestrictedLevel = restrictedLevel.L4
        memos = utility.createMemosWithSpecialLength(4096)
        titles = []

        titles.push('0170\t同一账户向同一节点连续发送交易（sendTx, 带4096字节memo）测试性能上限')
        titles.push('0170\t同一账户向2个不同的节点连续发送交易（sendTx, 带4096字节memo）测试性能上限')
        titles.push('0170\t同一账户向3个不同的节点连续发送交易（sendTx, 带4096字节memo）测试性能上限')
        titles.push('0170\t同一账户向4个不同的节点连续发送交易（sendTx, 带4096字节memo）测试性能上限')
        titles.push('0180\t同一账户向5个不同的节点连续发送交易（sendTx, 带4096字节memo）测试性能上限')

        titles.push('0170\t同一账户向同一节点连续发送交易（signTx, 带4096字节memo）测试性能上限')
        titles.push('0170\t同一账户向2个不同的节点连续发送交易（signTx, 带4096字节memo）测试性能上限')
        titles.push('0170\t同一账户向3个不同的节点连续发送交易（signTx, 带4096字节memo）测试性能上限')
        titles.push('0170\t同一账户向4个不同的节点连续发送交易（signTx, 带4096字节memo）测试性能上限')
        titles.push('0180\t同一账户向5个不同的节点连续发送交易（signTx, 带4096字节memo）测试性能上限')

        titles.push('0170\t不同账户向同一节点连续发送交易（sendTx, 带4096字节memo）测试性能上限')
        titles.push('0170\t不同账户向2个不同的节点连续发送交易（sendTx, 带4096字节memo）测试性能上限')
        titles.push('0170\t不同账户向3个不同的节点连续发送交易（sendTx, 带4096字节memo）测试性能上限')
        titles.push('0170\t不同账户向4个不同的节点连续发送交易（sendTx, 带4096字节memo）测试性能上限')
        titles.push('0180\t不同账户向5个不同的节点连续发送交易（sendTx, 带4096字节memo）测试性能上限')

        titles.push('0170\t不同账户向同一节点连续发送交易（signTx, 带4096字节memo）测试性能上限')
        titles.push('0170\t不同账户向2个不同的节点连续发送交易（signTx, 带4096字节memo）测试性能上限')
        titles.push('0170\t不同账户向3个不同的节点连续发送交易（signTx, 带4096字节memo）测试性能上限')
        titles.push('0170\t不同账户向4个不同的节点连续发送交易（signTx, 带4096字节memo）测试性能上限')
        titles.push('0180\t不同账户向5个不同的节点连续发送交易（signTx, 带4096字节memo）测试性能上限')

        tcsPressureSendTx.testForPerformanceTestForOneRound(server, describeTitle, titles, memos, caseRestrictedLevel, testCount)
        //endregion

        //region 32768b memos
        caseRestrictedLevel = restrictedLevel.L4
        memos = utility.createMemosWithSpecialLength(32768)
        titles = []

        titles.push('0190\t同一账户向同一节点连续发送交易（sendTx, 带32768字节memo）测试性能上限')
        titles.push('0190\t同一账户向2个不同的节点连续发送交易（sendTx, 带32768字节memo）测试性能上限')
        titles.push('0190\t同一账户向3个不同的节点连续发送交易（sendTx, 带32768字节memo）测试性能上限')
        titles.push('0190\t同一账户向4个不同的节点连续发送交易（sendTx, 带32768字节memo）测试性能上限')
        titles.push('0200\t同一账户向5个不同的节点连续发送交易（sendTx, 带32768字节memo）测试性能上限')

        titles.push('0190\t同一账户向同一节点连续发送交易（signTx, 带32768字节memo）测试性能上限')
        titles.push('0190\t同一账户向2个不同的节点连续发送交易（signTx, 带32768字节memo）测试性能上限')
        titles.push('0190\t同一账户向3个不同的节点连续发送交易（signTx, 带32768字节memo）测试性能上限')
        titles.push('0190\t同一账户向4个不同的节点连续发送交易（signTx, 带32768字节memo）测试性能上限')
        titles.push('0200\t同一账户向5个不同的节点连续发送交易（signTx, 带32768字节memo）测试性能上限')

        titles.push('0190\t不同账户向同一节点连续发送交易（sendTx, 带32768字节memo）测试性能上限')
        titles.push('0190\t不同账户向2个不同的节点连续发送交易（sendTx, 带32768字节memo）测试性能上限')
        titles.push('0190\t不同账户向3个不同的节点连续发送交易（sendTx, 带32768字节memo）测试性能上限')
        titles.push('0190\t不同账户向4个不同的节点连续发送交易（sendTx, 带32768字节memo）测试性能上限')
        titles.push('0200\t不同账户向5个不同的节点连续发送交易（sendTx, 带32768字节memo）测试性能上限')

        titles.push('0190\t不同账户向同一节点连续发送交易（signTx, 带32768字节memo）测试性能上限')
        titles.push('0190\t不同账户向2个不同的节点连续发送交易（signTx, 带32768字节memo）测试性能上限')
        titles.push('0190\t不同账户向3个不同的节点连续发送交易（signTx, 带32768字节memo）测试性能上限')
        titles.push('0190\t不同账户向4个不同的节点连续发送交易（signTx, 带32768字节memo）测试性能上限')
        titles.push('0200\t不同账户向5个不同的节点连续发送交易（signTx, 带32768字节memo）测试性能上限')

        tcsPressureSendTx.testForPerformanceTestForOneRound(server, describeTitle, titles, memos, caseRestrictedLevel, testCount)
        //endregion
    },

    testForPerformanceTestForOneRound: function(server, describeTitle, titles, memos, caseRestrictedLevel, testCount){
        let testCases = []
        let subTitles
        let allServers = framework.activeAllRpcServers()
        let txFunction
        let addresses = server.mode.addresses
        let value = '0.000001'
        let fee = '0.00001'
        let memosLength = memos ? memos[0].length : 0;

        //region 0010	同一账户向同一节点连续发送交易（不带memo）测试性能上限
        testCases = []
        txFunction = consts.rpcFunctions.sendTx
        subTitles = titles.slice(0, 5)
        testCases = testCases.concat(tcsPressureSendTx.testForPerformanceTestByOneAccount(server, subTitles, allServers,
            addresses, value, fee, memos, txFunction, caseRestrictedLevel, testCount))
        txFunction = consts.rpcFunctions.signTx
        subTitles = titles.slice(5, 10)
        testCases = testCases.concat(tcsPressureSendTx.testForPerformanceTestByOneAccount(server, subTitles, allServers,
            addresses, value, fee, memos, txFunction, caseRestrictedLevel, testCount))
        framework.testTestCases(server, describeTitle + '同一账户向节点连续发送交易, memos长度为' + memosLength, testCases)
        //endregion

        //region 0060	不同账户向同一节点连续发送交易（sendTx, 不带memo）测试性能上限
        testCases = []
        txFunction = consts.rpcFunctions.sendTx
        subTitles = titles.slice(10, 15)
        testCases = testCases.concat(tcsPressureSendTx.testForPerformanceTestBySeveralAccounts(server, subTitles, allServers,
            addresses, value, fee, memos, txFunction, caseRestrictedLevel, testCount))
        txFunction = consts.rpcFunctions.signTx
        subTitles = titles.slice(15, 20)
        testCases = testCases.concat(tcsPressureSendTx.testForPerformanceTestBySeveralAccounts(server, subTitles, allServers,
            addresses, value, fee, memos, txFunction, caseRestrictedLevel, testCount))
        framework.testTestCases(server, describeTitle + '不同账户向节点连续发送交易, memos长度为' + memosLength, testCases)
        //endregion
    },

    createTestCaseForPerformanceTest: function(server, title, servers, subCases, caseRestrictedLevel){
        let totalCount = 0
        for (let subCase of subCases){
            totalCount += subCase.count
        }
        title = title + ',数量：' + totalCount
        let testCase = framework.createTestCase(title, server,
            '', '', null,
            null, null, null,
            caseRestrictedLevel, [serviceType.newChain])

        testCase.otherParams = {}
        testCase.otherParams.servers = servers
        testCase.otherParams.subCases = subCases
        testCase.otherParams.totalCount = totalCount
        testCase.otherParams.executeBothSignAndSend = true
        testCase.executeFunction = framework.executeSubCases
        testCase.checkFunction = framework.checkSubCases

        return testCase
    },

    createAccountParamsWithDifferentAccount: function(addresses, value, fee, memos, txFunction, testCount, notIncludeErrorTx){
        let subCases = []
        subCases.push(tcsPressureSendTx.createAccountParam(addresses.sender1.address, addresses.sender1.secret,
            addresses.receiver1.address, value, fee, memos, txFunction, testCount, testCount))
        subCases.push(tcsPressureSendTx.createAccountParam(addresses.sender2.address, addresses.sender2.secret,
            addresses.receiver2.address, value, fee, memos, txFunction, testCount, testCount))
        subCases.push(tcsPressureSendTx.createAccountParam(addresses.sender3.address, addresses.sender3.secret,
            addresses.receiver3.address, value, fee, memos, txFunction, testCount, testCount))
        // subCases.push(tcsPressureSendTx.createAccountParam(addresses.receiver1.address, addresses.receiver1.secret,
        //     addresses.sender1.address, value, fee, memos, txFunction, testCount, testCount))
        // subCases.push(tcsPressureSendTx.createAccountParam(addresses.receiver2.address, addresses.receiver2.secret,
        //     addresses.sender2.address, value, fee, memos, txFunction, testCount, testCount))
        // subCases.push(tcsPressureSendTx.createAccountParam(addresses.sequence1.address, addresses.sequence1.secret,
        //     addresses.sequence3.address, value, fee, memos, txFunction, testCount, testCount))
        // subCases.push(tcsPressureSendTx.createAccountParam(addresses.sequence2.address, addresses.sequence2.secret,
        //     addresses.sequence4.address, value, fee, memos, txFunction, testCount, testCount))
        subCases.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount1.address, addresses.pressureAccount1.secret,
            addresses.pressureAccount2.address, value, fee, memos, txFunction, testCount, testCount))
        subCases.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount3.address, addresses.pressureAccount3.secret,
            addresses.pressureAccount4.address, value, fee, memos, txFunction, testCount, testCount))
        subCases.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount5.address, addresses.pressureAccount5.secret,
            addresses.pressureAccount6.address, value, fee, memos, txFunction, testCount, testCount))
        subCases.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount7.address, addresses.pressureAccount7.secret,
            addresses.pressureAccount8.address, value, fee, memos, txFunction, testCount, testCount))
        subCases.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount9.address, addresses.pressureAccount9.secret,
            addresses.pressureAccount10.address, value, fee, memos, txFunction, testCount, testCount))
        subCases.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount11.address, addresses.pressureAccount11.secret,
            addresses.pressureAccount12.address, value, fee, memos, txFunction, testCount, testCount))
        subCases.push(tcsPressureSendTx.createAccountParam(addresses.pressureAccount13.address, addresses.pressureAccount13.secret,
            addresses.pressureAccount14.address, value, fee, memos, txFunction, testCount, testCount))

        if(!notIncludeErrorTx){
            subCases.push(tcsPressureSendTx.createAccountParam(addresses.inactiveAccount1.address, addresses.inactiveAccount1.secret,
                addresses.receiver1.address, value, fee, memos, txFunction, testCount, 0))  //need fail
        }
        return subCases
    },

    testForPerformanceTestByOneAccount: function(server, titles, allServers, addresses, value, fee, memos,
                                                 txFunction, caseRestrictedLevel, testCount){

        let testCases = []
        let testCase
        let subCases = []
        subCases.push(tcsPressureSendTx.createAccountParam(addresses.sender1.address, addresses.sender1.secret,
            addresses.receiver1.address, value, fee, memos, txFunction, testCount, testCount))  //need success
        subCases.push(tcsPressureSendTx.createAccountParam(addresses.inactiveAccount1.address, addresses.inactiveAccount1.secret,
            addresses.receiver1.address, value, fee, memos, txFunction, testCount, 0))  //need fail
        let servers = []
        let title

        //region 同一账户连续发送交易

        title = titles[0]
        {
            servers = framework.createServers(allServers, 1)
            testCase = tcsPressureSendTx.createTestCaseForPerformanceTest(server, title, servers, subCases, caseRestrictedLevel)
            framework.addTestCase(testCases, testCase)
        }

        title = titles[1]
        {
            servers = framework.createServers(allServers, 2)
            testCase = tcsPressureSendTx.createTestCaseForPerformanceTest(server, title, servers, subCases, caseRestrictedLevel)
            framework.addTestCase(testCases, testCase)
        }

        title = titles[2]
        {
            servers = framework.createServers(allServers, 3)
            testCase = tcsPressureSendTx.createTestCaseForPerformanceTest(server, title, servers, subCases, caseRestrictedLevel)
            framework.addTestCase(testCases, testCase)
        }

        title = titles[3]
        {
            servers = framework.createServers(allServers, 4)
            testCase = tcsPressureSendTx.createTestCaseForPerformanceTest(server, title, servers, subCases, caseRestrictedLevel)
            framework.addTestCase(testCases, testCase)
        }

        title = titles[4]
        {
            servers = framework.createServers(allServers, 5)
            testCase = tcsPressureSendTx.createTestCaseForPerformanceTest(server, title, servers, subCases, caseRestrictedLevel)
            framework.addTestCase(testCases, testCase)
        }

        //endregion

        return testCases

    },

    testForPerformanceTestBySeveralAccounts: function(server, titles, allServers, addresses, value, fee, memos,
                                                      txFunction, caseRestrictedLevel, testCount){

        let testCases = []
        let testCase
        let subCases = tcsPressureSendTx.createAccountParamsWithDifferentAccount(
            addresses, value, fee, memos, txFunction, testCount, false)
        let servers = []
        let title

        //region 同一账户连续发送交易

        title = titles[0]
        {
            servers = framework.createServers(allServers, 1)
            testCase = tcsPressureSendTx.createTestCaseForPerformanceTest(server, title, servers, subCases, caseRestrictedLevel)
            framework.addTestCase(testCases, testCase)
        }

        title = titles[1]
        {
            servers = framework.createServers(allServers, 2)
            testCase = tcsPressureSendTx.createTestCaseForPerformanceTest(server, title, servers, subCases, caseRestrictedLevel)
            framework.addTestCase(testCases, testCase)
        }

        title = titles[2]
        {
            servers = framework.createServers(allServers, 3)
            testCase = tcsPressureSendTx.createTestCaseForPerformanceTest(server, title, servers, subCases, caseRestrictedLevel)
            framework.addTestCase(testCases, testCase)
        }

        title = titles[3]
        {
            servers = framework.createServers(allServers, 4)
            testCase = tcsPressureSendTx.createTestCaseForPerformanceTest(server, title, servers, subCases, caseRestrictedLevel)
            framework.addTestCase(testCases, testCase)
        }

        title = titles[4]
        {
            servers = framework.createServers(allServers, 5)
            testCase = tcsPressureSendTx.createTestCaseForPerformanceTest(server, title, servers, subCases, caseRestrictedLevel)
            framework.addTestCase(testCases, testCase)
        }

        //endregion

        return testCases

    },

    //endregion

    //region utility

    //region standard executions

    executeTransferFailWithSpecialSequence: function(testCase, sendTxExpectedResult, signTxExpectedResult, setSequenceFunction){
        return new Promise(async function(resolve){
            testCase.hasExecuted = true
            testCase.checks = []
            let server = testCase.server
            let data = testCase.txParams[0]
            let from = data.from

            //get sequence
            let currentSequence = await framework.getSequence(server, from)
            currentSequence = isNaN(currentSequence) ? 1 : currentSequence
            setSequenceFunction(data, currentSequence)

            //record balance before transfer
            let from_balance_1 = await server.getBalance(server, data.from, data.symbol)
            let to_balance_1 = await server.getBalance(server, data.to, data.symbol)

            //transfer
            await tcsPressureSendTx.executeTransfer(testCase, sendTxExpectedResult, signTxExpectedResult)

            //wait transfer result written in block
            let result = testCase.actualResult
            await utility.timeout(server.mode.defaultBlockTime + 2000)

            //record balance after transfer
            let from_balance_2 = await server.getBalance(server, data.from, data.symbol)
            let from_balance_expected = Number(from_balance_1)
            tcsPressureSendTx.addBalanceCheck(testCase, 'from address balance', from_balance_expected, from_balance_2)
            let to_balance_2 = await server.getBalance(server, data.to, data.symbol)
            let to_balance_expected = Number(to_balance_1)
            tcsPressureSendTx.addBalanceCheck(testCase, 'to address balance', to_balance_expected, to_balance_2)

            resolve(testCase)
        })
    },

    executeTransfer: async function(testCase, sendTxExpectedResult, signTxExpectedResult){
        return new Promise(async(resolve)=>{
            let result
            if(testCase.txFunctionName == consts.rpcFunctions.sendTx){
                result = await testCase.server.getResponse(testCase.server, testCase.txFunctionName, testCase.txParams)
                framework.addSequenceAfterResponseSuccess(result, testCase)
            }
            else if(testCase.txFunctionName == consts.rpcFunctions.signTx){
                let responseOfSignTx = await testCase.server.getResponse(testCase.server, testCase.txFunctionName, testCase.txParams)
                let blob = utility.isResponseStatusSuccess(responseOfSignTx) ? responseOfSignTx.result[0] : ''
                //sign tx, need record signed tx
                let check_0 = {
                    title: 'sign tx result',
                    expectedResult: signTxExpectedResult,
                    actualResult: responseOfSignTx,
                    checkFunction: tcsPressureSendTx.checkSignTx
                }
                testCase.checks.push(check_0)
                //sign tx, need sendRawTx
                result = await testCase.server.getResponse(testCase.server, consts.rpcFunctions.sendRawTx, [blob])
                framework.addSequenceAfterResponseSuccess(result, testCase)
            }
            else{
                throw new Error(testCase.txFunctionName + 'cannot be executed!')
            }
            if(testCase.txFunctionName == consts.rpcFunctions.sendTx || (signTxExpectedResult && signTxExpectedResult.needPass)){  //only when sign tx need success, will check send raw tx result.
                let check_1 = {
                    title: 'send tx result',
                    expectedResult: sendTxExpectedResult,
                    actualResult: result,
                    checkFunction: tcsPressureSendTx.checkSendTx
                }
                if(testCase.server.mode.service == serviceType.newChain) testCase.checks.push(check_1)  //todo need remove condition, new chain and old chain should be the same
            }
            testCase.actualResult = result
            resolve(testCase)
        })
    },

    addBalanceCheck: function(testCase, title, expectedBalance, actualBalance){
        let check = {
            title: title,
            expectedBalance: expectedBalance,
            actualBalance: actualBalance,
            checkFunction: tcsPressureSendTx.checkBalance
        }
        testCase.checks.push(check)
    },

    //endregion

    //region check

    checkBalance: function(testCase, check){
        let expectedBalance = Number(check.expectedBalance)
        let actualBalance = Number(check.actualBalance)
        expect(actualBalance).to.be.equal(expectedBalance)
    },

    checkSendTx: async function(testCase, check){
        let server = testCase.server
        let needPass = check.expectedResult.needPass
        let responseOfSendTx = check.actualResult
        framework.checkResponse(needPass, responseOfSendTx)

        //todo need remove OLD_SENDTX_SCHEMA when new chain updates its sendTx response
        if(testCase.server.mode.service == serviceType.newChain){
            // expect(responseOfSendTx).to.be.jsonSchema(schema.OLD_SENDTX_SCHEMA)
            if(needPass){
                expect(responseOfSendTx).to.be.jsonSchema(schema.OLD_SENDTX_SCHEMA)
                let hash = responseOfSendTx.result[0]
                let responseOfGetTx = await utility.getTxByHash(server, hash, 0)
                framework.checkResponse(true, responseOfGetTx)

                let tx = responseOfGetTx.result
                expect(tx.hash).to.be.equal(hash)
                let params = testCase.txParams[0]
                await framework.compareActualTxWithTxParams(params, tx, server.mode)
            }
            else{
                let expectedResult = check.expectedResult
                framework.checkResponseError(testCase, responseOfSendTx.message, expectedResult.expectedError)
            }
        }
        else{
            expect(responseOfSendTx).to.be.jsonSchema(schema.SENDTX_SCHEMA)
            if(needPass){
                let hash = responseOfSendTx.result.hash  //for swtclib
                let responseOfGetTx = await utility.getTxByHash(server, hash, 0)
                framework.checkResponse(true, responseOfGetTx)

                let tx = responseOfGetTx.result
                expect(tx.hash).to.be.equal(hash)
                let params = testCase.txParams[0]
                await framework.compareActualTxWithTxParams(params, tx, server.mode)
            }
            else{
                let expectedResult = testCase.expectedResult.expectedError
                framework.compareEngineResults(expectedResult, responseOfSendTx.result)
            }
        }
    },

    checkSignTx: function(testCase, check){
        let needPass = check.expectedResult.needPass
        let responseOfSendTx = check.actualResult
        framework.checkResponse(needPass, responseOfSendTx)

        if(needPass) {
            expect(responseOfSendTx).to.be.jsonSchema(schema.SIGNTX_SCHEMA)
        }
        else{
            let expectedResult = check.expectedResult
            framework.checkResponseError(testCase, responseOfSendTx.message, expectedResult.expectedError)
        }
    },

    //endregion

    //endregion

}