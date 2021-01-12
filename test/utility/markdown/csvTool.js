const fs = require("fs")
const iconv = require('iconv-lite')

module.exports = csvTool = {

    load: function(file){
        filePath = testUtility.updatePath(file)
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'binary',async function (err, data) {
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
            // let startColumn = 0
            let startColumn = 2
            let row = table[i]
            let testCase = {}
            testCase.code = csvTool.clean(row[startColumn++])
            testCase.title = csvTool.clean(row[startColumn++])
            testCase.precondition = csvTool.clean(row[startColumn++])
            testCase.input = csvTool.clean(row[startColumn++])
            testCase.expectedOutput = csvTool.clean(row[startColumn++])
            if(testCase.code && testCase.code.length > 0 && testCase.code.indexOf('用例编号（新）') == -1){
                testCases.push(testCase)
            }
        }
        return testCases
    },

    clean: function(cell){
        if(cell){
            let result = cell
                .replace(new RegExp('\n','g'), '')
                // | => /, otherwise it will break markdown table
                .replace(new RegExp('[|]','g'), '/')
                //jt_sendTransaction_000352 => jt_sendTransaction_000352
                .replace(new RegExp('jt_','g'), 'FCJT_')
                .replace(new RegExp('sw_','g'), 'FCSW_')
                //Perf_Test_Under_Diff_HW_000160 => PERF_DiffHW_000160
                .replace(new RegExp('Perf_Test_Under_','g'), 'PFMC_')
                .replace(new RegExp('Diff_HW','g'), 'DiffHW')
                //Perf_Test_Under_Same_HW_000190
                .replace(new RegExp('Same_HW','g'), 'SameHW')
                //RAS_000010 => ERR_RAS_000010
                .replace(new RegExp('RAS_','g'), 'ERR_RAS_')
                //Err_Inject_000010
                .replace(new RegExp('Err_Inject','g'), 'ERR_Inject')
                //Interop_Send_000010
                .replace(new RegExp('Interop_','g'), 'INTR_')
                //Interop_Send_Issue_000050
                .replace(new RegExp('Send_Issue_','g'), 'SendIssue_')
                //SVT_Low_HW_000010
                .replace(new RegExp('Low_HW','g'), 'LowHW')
                //Install_000010
                .replace(new RegExp('Install_','g'), 'CONF_Install_')
                //Config_Maint_000030
                .replace(new RegExp('Config_Maint_','g'), 'CONF_Maintain_')
                //Consensus_000010
                .replace(new RegExp('Consensus_','g'), 'CONS_Consensus_')

            return result
        }
        return cell
    }

}



