const tool = require('../markdownTool')
const utility = require("../../../framework/testUtility")

let file = '.\\test\\utility\\markdown\\sample\\chainErrors.md'
let baselinePath = '.\\test\\utility\\markdown\\sample\\baseline\\'
let baselineDocFile = 'baseline_errors_doc_2020-12-22T10-14-16.001Z.json'
let baselineMapFile = 'baseline_errors_map_2020-12-22T13-13-31.971Z.json'

testAll()

function testAll(){
    testParse()
    testDoc2Map()
}

async function testParse(){
    let content = await utility.loadFile(file, 'utf8',)
    let doc = tool.parseErrorWiki(content)
    let baselineDoc = await utility.loadJsonFile(baselinePath + baselineDocFile)
    let result = JSON.stringify(doc) === JSON.stringify(baselineDoc)
    console.log('markdownTool.parseErrorWiki test result: ' + (result ? 'Pass!' : 'Fail!'))
}

async function testDoc2Map(){
    let content = await utility.loadFile(file, 'utf8',)
    let doc = tool.parseErrorWiki(content)
    let map = tool.errors2Map(doc)
    let baselineMap = await utility.loadJsonFile(baselinePath + baselineMapFile)
    let result = JSON.stringify(map) === JSON.stringify(baselineMap)
    console.log('markdownTool.errorDoc2map test result: ' + (result ? 'Pass!' : 'Fail!'))
}
