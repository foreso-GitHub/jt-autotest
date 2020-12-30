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
        for(let i = 0; i < table.length; i++){
            let row = table[i]
            let testCase = {}
            testCase.code = row[2]
            testCase.title = row[3]
            testCase.precondition = row[4]
            testCase.input = row[5]
            testCase.expetedResult = row[6]
            testCases.push(testCase)
        }
        return testCases
    },

}



