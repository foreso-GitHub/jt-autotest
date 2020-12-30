const fs = require("fs")
const iconv = require('iconv-lite')

module.exports = csvTool = {

    load: function(file){
        return new Promise((resolve, reject) => {
            fs.readFile(file, 'binary',async function (err, data) {
                if (err) {
                    console.log(err.stack)
                    reject(err)
                }
                let table = await csvTool.convertToTable(iconv.decode(data, 'GBK'))
                resolve(table)
            })
        })
    },

    convertToTable: function(data) {
        return new Promise((resolve, reject) => {
            data = data.toString()
            let table = []
            var rows = []
            rows = data.split("\r\n")
            for (let i = 0; i < rows.length; i++) {
                table.push(rows[i].split(","))
            }
            resolve(table)
        })
    },

    convertToTestCases: function(table){
        let testCases = []
        for(let i = 1; i < table.length - 1; i++){
            let row = table[i]
            let testCase = {}
            testCase.code = csvTool.clean(row[2])
            testCase.title = csvTool.clean(row[3])
            testCase.precondition = csvTool.clean(row[4])
            testCase.input = csvTool.clean(row[5])
            testCase.expetedResult = csvTool.clean(row[6])
            testCases.push(testCase)
        }
        return testCases
    },

    clean: function(cell){
        if(cell){
            let result = cell
                .replace(new RegExp('\n','g'), '')
                .replace(new RegExp('jt_','g'), 'FUNC_')
            return result
        }
        return cell
    }

}



