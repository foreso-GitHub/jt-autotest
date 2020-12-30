const commonmark = require('commonmark')
const fs = require('fs')
const HashMap = require('hashmap')
const consts = require('../../framework/consts')
// const utility = require("../../framework/testUtility")

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

    doc2Map: function(doc){
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

    //region style 1
    testCases2md_style_1: function(testCases){
        let header = '|用例编号\t|用例标题\t|预置条件\t|输入内容\t|预期结果\t|' + '\r\n'
        header += '|----------------|----------------|----------------|----------------|----------------|' + '\r\n'
        return markdownTool.testCases2md(header, testCases, markdownTool.testCase2md_style_1)
    },

    testCase2md_style_1: function(testCase){
        let content = '|'
        content += markdownTool.collapse(testCase.code, 20) + '|'
        content += testCase.title + '|'
        content += testCase.precondition + '|'
        content += testCase.input + '|'
        content += testCase.expetedResult + '|'
        return content
    },
    //endregion

    //region style 2
    testCases2md_style_2: function(testCases){
        let header = '|用例编号|用例标题|预置条件<br>输入内容<br>预期结果|' + '\r\n'
        header += '|----------------|----------------|----------------|' + '\r\n'
        return markdownTool.testCases2md(header, testCases, markdownTool.testCase2md_style_2)
    },

    testCase2md_style_2: function(testCase){
        let content = '|'
        content += markdownTool.collapse(testCase.code, 20) + '|'
        content += testCase.title + '|'
        content += markdownTool.deco('预置条件', testCase.precondition? testCase.precondition : '无') + '<br><br>'
        content += markdownTool.deco('输入内容', testCase.input? testCase.input : '无') + '<br><br>'
        content += markdownTool.deco('预期结果', testCase.expetedResult? testCase.expetedResult : '无') + '|'
        return content
    },

    //endregion

    //region common

    testCases2md: function(header, testCases, testCaseFunc){
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

    load: function(file){
        return new Promise((resolve, reject) => {
            fs.readFile(file, 'utf8', function (err, data) {
                if (err) {
                    throw err
                }
                resolve(data)
            })
        })
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
    //endregion

    //region save js file
    saveDocFile: function(jsonObject, file){
        let destFile = testUtility.updatePath(file)
        return new Promise(async (resolve, reject) =>{
            let moduleName = 'errors'
            fs.writeFile(destFile, JSON.stringify(jsonObject), function (err) {
                if (err) {
                    console.log(err)
                    reject(err)
                } else {
                    console.log(moduleName + ' json saved: ' + destFile)
                    resolve(jsonObject)
                }
            })
        })
    },

    saveJsFile: function(jsonObject, moduleName, file){
        let destFile = testUtility.updatePath(file)
        return new Promise(async (resolve, reject) =>{
            // let moduleName = 'errors'
            let fileString = 'let ' + moduleName + ' = '
                + JSON.stringify(jsonObject)
                + '\r\nmodule.exports = { ' + moduleName +' }'
            fs.writeFile(destFile, fileString, function (err) {
                if (err) {
                    console.log(err)
                    reject(err)
                } else {
                    console.log(moduleName + ' js saved: ' + destFile)
                    resolve(jsonObject)
                }
            })
        })
    },

    saveFile: function(file, content){
        let destFile = testUtility.updatePath(file)
        return new Promise(async (resolve, reject) =>{
            fs.writeFile(destFile, content, function (err) {
                if (err) {
                    console.log(err)
                    reject(err)
                } else {
                    console.log(destFile + ' has been saved!')
                    resolve(destFile)
                }
            })
        })
    },
    //endregion

}


