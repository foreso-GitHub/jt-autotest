//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const { allModes } = require("../config/config")
const utility = require('../framework/testUtility')

const AccountsDealer = require('./init/accountsDealer')
const ChainDataCreator = require('./init/chainDataCreator')
let dealer = new AccountsDealer()
let creator = new ChainDataCreator()

const netStatusTool = require("./monitor/netStatusTool")
const nodeStatusTool = require("./monitor/nodeStatusTool")
const { modes, } = require("../config/config")
const framekwork = require('../framework/framework')

const reportComparor = require('./reportComparor/mochaReportComparor')
const markdownTool = require('./markdown/markdownTool')
const upgradeChainTool = require("./upgradeChain/upgradeChainTool")
//endregion


// init()
// setNetStatus()
// setNodeStatus()
// getAllTxBlock()
// compare()
// updateErrorsDoc()
// loadErrors()
// upgradeChain('20201229')


//region init

async function init(){
    await init_new()
    // await init_based_on_existed_accounts()
}

//no existing data, create new accounts and then create new chain data based on the new accounts.
async function init_new(){
    let modeAccounts = await dealer.startInit(allModes)
    logger.info('Wait for 11 seconds and then start to create chain data ...')
    await utility.timeout(11000)  //wait for charge finish
    await creator.create(allModes, modeAccounts, false)
}

//suppose the accounts has been created.  just create chain data based on existed accounts.
async function init_based_on_existed_accounts(){
    let modeAccounts = require('../../testData/accounts').modeAccounts
    await creator.create(allModes, modeAccounts, false)
}

//endregion

//region monitor

function setNetStatus(){
    netStatusTool.showTcAll()
    // netStatusTool.showNetAll()
    //
    // netStatusTool.resetTcAll()
    // netStatusTool.resetNetAll()
}

function setNodeStatus(){
    // nodeStatusTool.resetNode('bd')
    // nodeStatusTool.stopJt(getNode('bd', jtNodes)))
    // nodeStatusTool.startJt(getNode('ty', jtNodes))
    // nodeStatusTool.startJt(jt_node_al)
    // nodeStatusTool.stopJt(jt_node_al)
    //
    // nodeStatusTool.resetNodes()
    // nodeStatusTool.stopNodes()
    // nodeStatusTool.startNodes()
    nodeStatusTool.testMonitor()
}

//region block info
async function getAllTxBlock(){
    let server = framework.activeServer(modes[0])
    let startBlock = 8500
    let endBlock = 8510
    let blocksInfo = await framework.getBlocksInfo(server, startBlock, endBlock)
    printTps(blocksInfo)
}

function printTps(blocksInfo){
    let list = blocksInfo.blockTpsInfoList
    for (let i = 0; i < list.length; i++){
        let block = list[i]
        let bar = printBar(block.tps)
        logger.debug(block.blockNumber.toString() + '(' + utility.toDecimal2(block.tps) + '): ' + bar)
    }
}

function printBar(tps){
    let bar = ''
    for(let i = 0; i < tps; i++){
        bar += '[]'
    }
    return bar
}
//endregion

//endregion

//region report comparor
async function compare(){

    let path = 'E:\\2. work\\井系\\3. 链景\\井通新链\\自动测试\\codes\\reports'
    // let file1 = path + '\\baselines\\base-mochawesome-report-20201111d-no_exp-ws\\' + 'mochawesome.json'
    // let file1 = path + '\\normal\\mochawesome-report-20201116a-no_exp-rpc\\' + 'mochawesome.json'
    // let file1 = path + '\\normal\\mochawesome-report-20201121b-no_exp-ws\\' + 'mochawesome.json'
    // let file1 = path + '\\normal\\mochawesome-report-20201209c-no_exp-ws\\' + 'mochawesome.json'
    let file1 = path + '\\baselines\\base-mochawesome-report-20201223c-no_exp-ws\\' + 'mochawesome.json'
    let file2 = path + '\\normal\\mochawesome-report-20201229c-no_exp-ws\\' + 'mochawesome.json'

    let reportsChanges = await reportComparor.compareReportFiles(file1, file2, false)

    let resultsPath = '.\\test\\utility\\reportComparor\\results\\'
    utility.saveJsonFile(resultsPath, 'compare_result', reportsChanges)

}
//endregion

//region markdown

async function updateErrorsDoc(){
    let mdFile = '.\\test\\utility\\markdown\\md\\chainErrors_20201229.md'
    let doc = await md2Doc(mdFile)
    let docFile = '.\\test\\testData\\errors.js'
    markdownTool.saveJsFile(doc, docFile)
}

async function loadErrors(){
    let docFile = '.\\test\\testData\\errors.json'
    let doc = await loadDoc(docFile)
    let map = markdownTool.doc2Map(doc)
    markdownTool.printMap(map)
}

async function loadDoc(file){
    let doc = await utility.loadJsonFile(file)
    // markdownTool.printDoc(doc)
    return doc
}

async function md2Doc(file){
    let content = await markdownTool.load(file, 'utf8',)
    let doc = markdownTool.parseErrorWiki(content)
    markdownTool.printDoc(doc)

    let resultsPath = '.\\test\\utility\\markdown\\results\\'
    utility.saveJsonFile(resultsPath, 'errors_doc', doc)

    return doc
}

//endregion

//region upgrade chain

async function upgradeChain(newDate){
    await upgradeChainTool.upgrade(newDate)
}

//endregion
