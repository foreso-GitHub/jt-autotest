const commonmark = require('commonmark')
const fs = require("fs")
const HashMap = require('hashmap')
const consts = require('../../framework/consts')
const utility = require("../../framework/testUtility")
const TESTCASE_MD_FILE_PREFIX = '_TestCase_'

module.exports = markdownTool = {

    //region parse error wiki

    parseErrorWiki: function(content){
        let reader = new commonmark.Parser()
        let tree = reader.parse(content) // tree is a 'Node' tree
        let walker = tree.walker()
        let event, node, currentMark, lastNodeType, txt, category, error
        let marks = []
        let doc = []

        while ((event = walker.next())) {
            node = event.node

            if(node.type === consts.markdownTypes.document
                || node.type === consts.markdownTypes.heading
                || node.type === consts.markdownTypes.block_quote
                || node.type === consts.markdownTypes.paragraph
                || node.type === consts.markdownTypes.strong
            ){
                if(markdownTool.getLastMark(marks) === node.type){
                    marks.pop()
                    currentMark = markdownTool.getLastMark(marks)
                }
                else{
                    marks.push(node.type)
                    currentMark = node.type
                }
            }
            else if(node.type === consts.markdownTypes.text
                || node.type === consts.markdownTypes.code
            ){
                if(!markdownTool.ifAllSpace(node.literal)){
                    if(lastNodeType === node.type){
                        txt += node.literal
                    }
                    else{
                        txt = node.literal
                    }

                    if(node.type === consts.markdownTypes.text && currentMark === consts.markdownTypes.heading){  //category name
                        category = markdownTool.newCategory(txt,)
                        doc.push(category)
                    }
                    else if(node.type === consts.markdownTypes.text && currentMark === consts.markdownTypes.paragraph){
                        if(markdownTool.getLastMark(marks, 2) === consts.markdownTypes.block_quote){//the mark in outer level
                            //category description
                            category.description = txt
                        }
                        else{
                            //error status
                            let status = Number(txt)
                            error = markdownTool.newError(status, null, null, category.name)
                            category.errors.push(error)
                        }
                    }
                    else if(node.type === consts.markdownTypes.text && currentMark === consts.markdownTypes.strong){  //error type
                        error.type = txt
                    }
                    else if(node.type === consts.markdownTypes.code){  //error description
                        error.description = txt
                    }
                    else{
                        console.log('=== unknown mark: ' + currentMark + ', type: ' +node.type + ' @ ' + node.sourcepos)
                    }
                }
                else{
                    // console.log('=== all space: ' + node.literal + ' @ ' + node.sourcepos)
                }
            }
            else{
                console.log('=== unknown type: ' + node.type + ' @ ' + node.sourcepos)
            }
            lastNodeType = node.type
        }

        return doc
    },

    errors2Map: function(doc){
        let map = new HashMap()
        for(let i = 0; i < doc.length; i++){
            let errors = doc[i].errors
            for(let j = 0; j < errors.length; j++){
                let error = errors[j]
                map.set(error.status, error)
            }
        }
        return map
    },

    //endregion

    //region parse testcase wiki

    //region style 1

    testCases2Md_style_1: function(testCases){
        let header = '|用例编号\t|用例标题\t|预置条件\t|输入内容\t|预期结果\t|' + '\r\n'
        header += '|----------------|----------------|----------------|----------------|----------------|' + '\r\n'
        return markdownTool.testCases2Md(header, testCases, markdownTool.testCase2Md_style_1)
    },

    testCase2Md_style_1: function(testCase){
        let content = '|'
        content += markdownTool.collapse(testCase.code, 20) + '|'
        content += testCase.title + '|'
        content += testCase.precondition + '|'
        content += testCase.input + '|'
        content += testCase.expetedResult + '|'
        return content
    },

    //region parse

    parseTestCaseWiki: function(content){
        let lines = content.split('\r\n')
        let testCaseLines = lines.slice(2, lines.length -1)
        let testCases = []
        for(let i = 0; i < testCaseLines.length; i++){
            testCases.push(markdownTool.parseTestCaseLine(testCaseLines[i]))
        }
        return testCases
    },

    parseTestCaseLine: function(line){
        let cells = line.split('|')
        let tsCells = []

        for(let i = 0; i < cells.length; i++){
            let cell = cells[i]
                .replace(new RegExp(' ','g'), '')
                .replace(new RegExp('\t','g'), '')
                .replace(new RegExp('<br>','g'), '')

            if(!((i == 0 || i == cells.length - 1) && cell == '')){
                tsCells.push(cell)
            }
        }

        let testCase
        if(tsCells.length == 5){
            testCase = {}
            testCase.code = tsCells[0]
            testCase.title = tsCells[1]
            testCase.precondition = tsCells[2]
            testCase.input = tsCells[3]
            testCase.expetedResult = tsCells[4]
        }
        else{
            console.log('Parse test cases error: not 5 cells in line!');
        }

        return testCase
    },

    //endregion

    //endregion

    //region style 2

    testCases2Md_style_2: function(testCases){
        let header = '|用例编号|用例标题|预置条件<br>输入内容<br>预期结果|' + '\r\n'
        header += '|----------------|----------------|----------------|' + '\r\n'
        return markdownTool.testCases2Md(header, testCases, markdownTool.testCase2Md_style_2)
    },

    testCase2Md_style_2: function(testCase){
        let content = '|'
        content += "<a name=\"" + testCase.code + "\"></a>"  //add anchor
        content += markdownTool.collapse(testCase.code, 20) + '|'
        content += testCase.title + '|'
        content += markdownTool.deco('预置条件', testCase.precondition? testCase.precondition : '无') + '<br><br>'
        content += markdownTool.deco('输入内容', testCase.input? testCase.input : '无') + '<br><br>'
        content += markdownTool.deco('预期结果', testCase.expetedResult? testCase.expetedResult : '无') + '|'
        return content
    },

    //region parse

    parseTestCaseWiki_style_2: function(content){
        let lines = content.split('\r\n')
        let testCaseLines = lines.slice(2, lines.length -1)
        let testCases = []
        for(let i = 0; i < testCaseLines.length; i++){
            testCases.push(markdownTool.parseTestCaseLine_style_2(testCaseLines[i]))
        }
        return testCases
    },

    parseTestCaseLine_style_2: function(line){
        let cells = line.split('|')
        let tsCells = []

        for(let i = 0; i < cells.length; i++){
            let cell = cells[i]
                .replace(new RegExp(' ','g'), '')
                .replace(new RegExp('\t','g'), '')

            if(!((i == 0 || i == cells.length - 1) && cell == '')){
                tsCells.push(cell)
            }
        }

        let testCase
        if(tsCells.length == 3){
            testCase = {}
            //<a name="FCJT_version_000010"></a>FCJT_version_000010
            const mark4 = "</a>"
            let codeStart = tsCells[0].indexOf(mark4) + mark4.length
            testCase.code = tsCells[0]
                .substring(codeStart, tsCells[0].length)
                .replace(new RegExp('<br>','g'), '')
            testCase.title = tsCells[1]

            // |**预置条件**`无`<br><br>**输入内容**`无参数`<br><br>**预期结果**`返回正确的版本号`|
            let details = tsCells[2]
            const mark1 = "**预置条件**`"
            const mark2 = "`<br><br>**输入内容**`"
            const mark3 = "`<br><br>**预期结果**`"
            let start = details.indexOf(mark1) + mark1.length
            let end = details.indexOf(mark2)
            testCase.precondition = details.substring(start, end)

            start = end + mark2.length
            end = details.indexOf(mark3)
            testCase.input = details.substring(start, end)

            start = end + mark3.length
            end = details.length - 1
            testCase.expetedResult = details.substring(start, end)
        }
        else{
            console.log('Parse test cases error: not 3 cells in line!');
        }

        return testCase
    },

    //endregion

    //endregion

    //region common

    testCases2Md: function(header, testCases, testCaseFunc){
        let lines = []
        for(let i = 0; i < testCases.length; i++){
            if(testCases[i].code){
                lines.push(testCaseFunc(testCases[i]))
            }
        }
        let content = header
        for(let i = 0; i < lines.length; i++){
            content += lines[i] + '\r\n'
        }
        return content
    },

    deco: function(title, content){
        let result = '**' + title + '**'
            + '`' + content + '`'
        return result
    },

    collapse: function(content, maxLength){
        let result = ''
        let length = content.length
        let collapse_times = Math.floor((length - 1) / maxLength)

        for(let i = 0; i < collapse_times; i++){
            let start = maxLength * i
            let end = maxLength * (i + 1)
            // let end = i == collapse_times ? maxLength * (i + 1) : content.length - 1
            result += content.substring(start, end) + '<br>'
            if(i == collapse_times - 1){
                result += content.substring(end, content.length)
            }
        }

        return collapse_times == 0 ? content : result
    },

    groupTestCases: function(testCases){
        let testCaseGroup = new HashMap()
        for(let i = 0; i< testCases.length; i++){
            let prefix = markdownTool.getPrefix(testCases[i].code, 2)
            let group = testCaseGroup.get(prefix)
            if(group == undefined){
                group = []
                testCaseGroup.set(prefix, group)
            }
            group.push(testCases[i])
        }
        return testCaseGroup
    },

    groupNames: function(names){
        let nameGroup = new HashMap()
        for(let i = 0; i< names.length; i++){
            let prefix = markdownTool.getPrefix(names[i], 1)
            let group = nameGroup.get(prefix)
            if(group == undefined){
                group = []
                nameGroup.set(prefix, group)
            }
            group.push(names[i])
        }
        return nameGroup
    },

    getPrefix: function(code, level){
        let phases = code.split('_')

        if(level > 3 || level <1){
            console.log('getPrefix error: wrong level')
            return null
        }
        // if(phases.length != 3){
        //     console.log('getPrefix error: ' + code + ' phases count is not 3.')
        //     return null
        // }

        if(level == 1){
            return phases[0]
        }
        else if(level == 2){
            return phases[0] + '_' + phases[1]
        }
        else if(level == 3){
            return phases[0] + '_' + phases[1] + '_' + phases[2]
        }

        return null
    },

    //endregion

    //region csv2Md

    csv2Md: async function (csvPath, mdPath){

        let testCases = await markdownTool.csv2TestCases(csvPath)
        let group = markdownTool.groupTestCases(testCases)
        await markdownTool.group2MdFiles(group, mdPath)
        await markdownTool.group2IndexMdFile(group, mdPath)
    },

    csv2TestCases: async function(csvPath){
        let files = fs.readdirSync(csvPath)
        let testCases = []
        for(let i = 0; i < files.length; i++){
            let file = files[i]
            if(file.substring(file.length - 4, file.length).toLowerCase() == '.csv'){
                let table = await csvTool.load(csvPath + '\\' + file)
                testCases = testCases.concat(csvTool.convertToTestCases(table))
            }
        }
        return testCases
    },

    group2MdFiles: async function(group, mdPath){
        let mdNames = group.keys()
        for(let i = 0; i < mdNames.length; i++){
            let mdName = mdNames[i]
            let content = markdownTool.testCases2Md_style_2(group.get(mdName))
            let mdFile = mdPath + '\\' + TESTCASE_MD_FILE_PREFIX + mdName + '.md'
            await utility.saveFile(mdFile, content)
        }
    },

    group2IndexMdFile: async function(group, mdPath){
        let indexContent = '# 测试用例目录\r\n'
        indexContent += '\r\n'

        let mdNames = group.keys()
        let nameGroup = markdownTool.groupNames(mdNames)
        let categories = nameGroup.keys()
        for(let i = 0; i < categories.length; i++){
            let category = categories[i]
            indexContent += '## ' + markdownTool.categoryConvert(category) + '\r\n'
            let files = nameGroup.get(category)
            for(let j = 0; j < files.length; j++){
                //* [Home](./Home)
                let file = files[j]
                indexContent += '* [' + file + '](./' + TESTCASE_MD_FILE_PREFIX + file + ')\r\n'
            }
            indexContent += '\r\n'
        }

        let mdFile = mdPath + '\\' + TESTCASE_MD_FILE_PREFIX + 'Index.md'
        await utility.saveFile(mdFile, indexContent)
    },

    categoryConvert: function(category){
        if(category == 'FCJT'){
            return '接口功能测试_jt'
        }

        if(category == 'FCSW'){
            return '接口功能测试_sw'
        }

        if(category == 'ERR'){
            return '故障测试'
        }

        if(category == 'CONS'){
            return '共识机制测试'
        }

        if(category == 'CMPT'){
            return '兼容性测试'
        }

        if(category == 'PFMC'){
            return '性能测试'
        }

        if(category == 'INTR'){
            return '接口交互测试'
        }

        if(category == 'SVT'){
            return '系统测试'
        }

        if(category == 'CONF'){
            return '配置维护测试'
        }

    },

    //endregion

    //region md2testcases

    ts2Doc: async function(path, indexFile){
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
            testCases = testCases.concat(await markdownTool.tsmd2Doc(path + files[i] + '.md'))
        }

        return testCases
    },

    tsmd2Doc: async function(file){
        let content = await utility.loadFile(file, 'utf8',)
        let testCases = markdownTool.parseTestCaseWiki_style_2(content)
        return testCases
    },

    //endregion

    //region test cases 2 map

    testCases2Map: function(doc){
        let map = new HashMap()
        for(let i = 0; i < doc.length; i++){
            let testCase = doc[i]
            testCase.scripts = []
            map.set(testCase.code, testCase)
        }
        return map
    },

    //endregion

    //endregion

    //region utility

    getLastMark: function(marks, offset){
        if(!offset){
            offset = 1
        }
        return marks[marks.length - offset]
    },

    newError: function(status, type, description, category){
        let error = {}
        error.status = status
        error.type = type
        error.description = description
        error.category = category
        return error
    },

    newCategory: function(name, description){
        let category = {}
        category.name = name
        category.description = description
        category.errors = []
        return category
    },

    getObject: function(object){
        if(object){
            return object
        }
        else{
            return {}
        }
    },

    ifAllSpace: function(literal){
        for(let i = 0; i < literal.length; i++){
            if(literal[i] != ' '){
                return false
            }
        }
        return true
    },

    //endregion

    //region print
    printDoc: function(doc){
        markdownTool.printArray(doc, markdownTool.printCategory)
    },

    printMap: function(map){
        let errors = map.values()
        // let index = 1
        errors.forEach(error => {
            // console.log((index++).toString())
            markdownTool.printError(error)
        })

    },

    printCategory: function(category){
        console.log('category name: ' + category.name)
        console.log('category description: ' + category.description)
        markdownTool.printArray(category.errors, markdownTool.printError)
    },

    printError: function(error){
        console.log(JSON.stringify(error))
    },

    printArray: function(array, printFunc){
        for(let i = 0; i < array.length; i++){
            printFunc(array[i])
        }
    },

    printTestCase: function(testCase){
        console.log(
            testCase.code.toString()
            + ': '
            + testCase.title.toString()
        )
    },

    printTestCases: function(testCases){
        testCases.forEach(testCase =>{
            markdownTool.printTestCase(testCase)
        })
        console.log('Total test cases count: ' + testCases.length)
    },

    //endregion

}


