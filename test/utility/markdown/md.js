const utility = require("../../framework/testUtility")
const tool = require('./markdownTool')

let file = '.\\test\\utility\\markdown\\sample\\chainErrors.md'
// run()
loadDoc()
// convert()


//region demo

async function loadDoc(){
    let resultsPath = '.\\test\\utility\\markdown\\results\\'
    let file = 'errors_doc_2020-12-22T10-14-16.001Z.json'
    let doc = await utility.loadJsonFile(resultsPath+file)
    tool.printDoc(doc)
}

async function run(){
    let content = await utility.loadFile(file, 'utf8',)
    let doc = tool.parseErrorWiki(content)
    tool.printDoc(doc)

    let resultsPath = '.\\test\\utility\\markdown\\results\\'
    utility.saveJsonFile(resultsPath, 'errors_doc', doc)
}

async function convert(){
    let content = await utility.loadFile(file, 'utf8',)
    let doc = tool.parseErrorWiki(content)
    // printDoc(doc)

    let map = tool.errors2Map(doc)
    let resultsPath = '.\\test\\utility\\markdown\\results\\'
    utility.saveJsonFile(resultsPath, 'errors_map', map)

    let keys = map.keys()
    for(let i = 0; i < keys.length; i++){
        tool.printError((i+1).toString() + '. ' + JSON.stringify(map.get(keys[i])))
    }
}

function run1(){
    let content = "#### S Success\n" +
        "> Success\n" +
        "\n" +
        "0 **TesSUCCESS** ``The transaction was applied.``\n" +
        "\n" +
        "#### C Claim: 100 .. 159\n" +
        "> Success, but does not achieve optimal result.\n" +
        "\n" +
        "100 **TecCLAIM** ``Fee claimed. Sequence used. No action.``\n" +
        "\n" +
        "101 **TecPATH_PARTIAL** ``Path could not send full amount.``"
    let doc = tool.parseErrorWiki(content)
    // console.log(JSON.stringify(doc))
    tool.printDoc(doc)
}

//endregion

