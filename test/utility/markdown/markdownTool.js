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
                            //category desc
                            category.desc = txt
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
                    else if(node.type === consts.markdownTypes.code){  //error desc
                        error.desc = txt
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

    //region utility

    getLastMark: function(marks, offset){
        if(!offset){
            offset = 1
        }
        return marks[marks.length - offset]
    },

    newError: function(status, type, desc, category){
        let error = {}
        error.status = status
        error.type = type
        error.desc = desc
        error.category = category
        return error
    },

    newCategory: function(name, desc){
        let category = {}
        category.name = name
        category.desc = desc
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
        console.log('category desc: ' + category.desc)
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
            // let fileString = 'let ' + moduleName + ' = '
            //     + JSON.stringify(jsonObject)
            //     + '\r\nmodule.exports = { ' + moduleName +' }'
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
    //endregion

}


