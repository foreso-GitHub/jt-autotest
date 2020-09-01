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
    // let report1 = await utility.loadJsonFile(path,'report1.json')
    // let report2 = await utility.loadJsonFile(path,'report2.json')

    let path = 'E:\\2. work\\井系\\3. 链景\\井通新链\\自动测试\\codes\\reports'
    let report1 = await utility.loadJsonFile(path + '\\mochawesome-report-20200831a\\','mochawesome.json')
    let report2 = await utility.loadJsonFile(path + '\\mochawesome-report-20200901a\\','mochawesome.json')

    let reportsChanges = reportComparor.compareReports(report1, report2)

    let resultsPath = '.\\test\\utility\\reportComparor\\results\\'
    utility.saveJsonFile(resultsPath, 'compare_result', reportsChanges)


}