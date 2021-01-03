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

const reportComparor = require('./reportComparor/mochaReportComparor')
const markdownTool = require('./markdown/markdownTool')
const csvTool = require('./markdown/csvTool')
const upgradeChainTool = require("./upgradeChain/upgradeChainTool")
//endregion

//region work dock

// init()

// setNetStatus()
// setNodeStatus()
// getAllTxBlock()

// compare()

// upgradeChain('20210102b')

// updateErrorsDoc('..\\ipfslib.wiki\\chain错误信息整理.md')
// loadErrors()

// updateTestCaseDoc('.\\test\\utility\\markdown\\sample\\ipfslib.wiki\\', '测试用例3.md')
// loadTestCases()
csv2Md()

//endregion

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
    netStatusTool.showNetAll()

    netStatusTool.resetTcAll()
    netStatusTool.resetNetAll()
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
    let file1 = path + '\\baselines\\base-mochawesome-report-20201231a-no_exp-ws\\' + 'mochawesome.json'
    let file2 = path + '\\normal\\mochawesome-report-20210103a-no_exp-ws\\' + 'mochawesome.json'

    let reportsChanges = await reportComparor.compareReportFiles(file1, file2, false)

    let resultsPath = '.\\test\\utility\\reportComparor\\results\\'
    utility.saveJsonFile(resultsPath, 'compare_result', reportsChanges)

}
//endregion

//region markdown

//region testcases

async function updateTestCaseDoc(path, indexFile){
    // let mdFile = '.\\test\\utility\\markdown\\sample\\testcase.md'
    let doc = await ts2Doc(path, indexFile)
    let docFile = '.\\test\\testData\\testcase.js'
    utility.saveJsFile(doc, 'testCases', docFile)
}

async function ts2Doc(path, indexFile){
    let indexContent = await utility.loadFile(path + indexFile, 'utf8',)
    let lines = indexContent.split('\r\n')
    let files = []
    for(let i = 0; i < lines.length; i++){
        let line = lines[i]
        if(line.indexOf('* [') != -1){
            let start = line.indexOf('](./') + 4
            files.push(line.substring(start, line.length - 1))
        }
    }

    let testCases = []
    for(let i = 0; i < files.length; i++){
        testCases = testCases.concat(await tsmd2Doc(path + files[i] + '.md'))
    }

    return testCases
}

async function tsmd2Doc(file){
    let content = await utility.loadFile(file, 'utf8',)
    let testCases = markdownTool.parseTestCaseWiki_style_2(content)
    // markdownTool.printDoc(doc)
    // let resultsPath = '.\\test\\utility\\markdown\\results\\'
    // utility.saveJsonFile(resultsPath, 'testcases_doc', testCases)

    return testCases
}

async function csv2Md(){
    let csvPath = '.\\test\\utility\\markdown\\csv\\20201231'
    let mdPath = '.\\test\\utility\\markdown\\md\\20201231'
    await markdownTool.csv2Md(csvPath, mdPath)
}

//endregion

//region errors

async function updateErrorsDoc(mdFile){
    // let mdFile = '.\\test\\utility\\markdown\\md\\chainErrors_20201229.md'
    let doc = await md2Doc(mdFile)
    let docFile = '.\\test\\testData\\errors.js'
    utility.saveJsFile(doc, 'errors', docFile)
}

async function loadErrors(){
    let docFile = '.\\test\\testData\\errors.js'
    let content = await utility.loadFile(docFile)
    let jsonString = errorsJs2Json(content)
    let doc = JSON.parse(jsonString)
    let map = markdownTool.doc2Map(doc)
    markdownTool.printMap(map)
}

function errorsJs2Json(content){
    return content
        .replace(new RegExp('let errors = ', 'g'), '')
        .replace(new RegExp('module.exports = \{ errors \}', 'g'), '')
}

async function md2Doc(file){
    let content = await utility.loadFile(file, 'utf8',)
    let doc = markdownTool.parseErrorWiki(content)
    markdownTool.printDoc(doc)

    let resultsPath = '.\\test\\utility\\markdown\\results\\'
    utility.saveJsonFile(resultsPath, 'errors_doc', doc)

    return doc
}
//endregion

//endregion

//region upgrade chain

async function upgradeChain(newDate){
    await upgradeChainTool.upgrade(newDate)
}

//endregion
