let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const { servers, chains, addresses, status, data, token, txs, blocks, modes } = require("../../config/config")
const consts = require('../../framework/lib/base/consts')



clear()

function clear(){
    for(let mode of modes) {
        let server = mode.server
        server.setUrl(mode.url)
        clearSequence(server, addresses.sender2, 9403, 50)
    }
}

//用批处理交易的sequence填充被跳过的sequence，使得后续交易能继续正常执行。
function clearSequence(server, sender, sequence, clearCount){
    let txParams = server.createTransferParams(sender.address, sender.secret, sequence,
        addresses.receiver1.address, "1", "10", ['clear sequence'])
    let txFunctionName = consts.rpcFunctions.sendTx

    for(let i = 0; i < clearCount; i++){
        let testCase = createTestCase('9999\t发起批处理有效交易以清除帐号：' + sender.address + '的错误sequence!', server,
            txFunctionName, txParams, null, null, null, null)
        logger.debug("sequence: " + txParams[0].sequence)
        executeTxByTestCase(testCase)
        txParams[0].sequence++
    }
}

function createTestCase(title, server, txFunctionName, txParams, otherParams, executeFunction, checkFunction, expecteResult){
    let testCase = {}
    testCase.type = "it"
    if(title) testCase.title = title
    if(server) testCase.server = server
    if(txFunctionName) testCase.txFunctionName = txFunctionName
    if(txParams) testCase.txParams = txParams
    if(otherParams) testCase.otherParams = otherParams
    if(executeFunction) testCase.executeFunction = executeFunction
    if(checkFunction) testCase.checkFunction = checkFunction
    if(expecteResult) testCase.expecteResult = expecteResult
    testCase.hasExecuted = false
    testCase.actualResult = []
    return testCase
}

function executeTxByTestCase(testCase){
    logger.debug(testCase.title)
    return testCase.server.getResponse(testCase.txFunctionName, testCase.txParams)
}