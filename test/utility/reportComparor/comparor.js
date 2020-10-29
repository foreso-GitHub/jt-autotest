//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const utility = require('../../framework/testUtility')
const reportComparor = require('./mochaReportComparor')
//endregion


test()

async function test(){

    // let path = '.\\test\\utility\\reportComparor\\sample\\'
    // let file1 = path + 'report1.json'
    // let file2 = path + 'report2.json'

    let path = 'E:\\2. work\\井系\\3. 链景\\井通新链\\自动测试\\codes\\reports'
    // let file1 = path + '\\baselines\\base-mochawesome-report-20201026a-no_exp\\' + 'mochawesome.json'
    // let file2 = path + '\\normal\\mochawesome-report-20201029d-no_exp\\' + 'mochawesome.json'
    let file1 = path + '\\baselines\\base-mochawesome-report-20201026b-chk_exp\\' + 'mochawesome.json'
    let file2 = path + '\\normal\\mochawesome-report-20201029e-chk_exp\\' + 'mochawesome.json'

    let reportsChanges = await reportComparor.compareReportFiles(file1, file2, false)

    let resultsPath = '.\\test\\utility\\reportComparor\\results\\'
    utility.saveJsonFile(resultsPath, 'compare_result', reportsChanges)

}