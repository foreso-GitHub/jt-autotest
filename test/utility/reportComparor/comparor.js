//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const utility = require('../../framework/testUtility')
const reportComparor = require('./mochaReportComparor')
//endregion


test()

async function test(){

    let path = '.\\test\\utility\\reportComparor\\sample\\'
    let report1 = await utility.loadJsonFile(path,'report1.json')
    let report2 = await utility.loadJsonFile(path,'report2.json')

    // let statsChanges = reportComparor.compareStats(report1.stats, report2.stats)
    // logger.debug('===statsChanges: ' + JSON.stringify(statsChanges.differences))
    // // logger.debug(JSON.stringify(statResult.fullComparison))

    // let testList1 = reportComparor.collectTests(report1.results)
    // let testList2 = reportComparor.collectTests(report2.results)
    // logger.debug('===testList1: ' + JSON.stringify(testList1.length))
    // logger.debug('===testList2: ' + JSON.stringify(testList2.length))
    // let testsChanges = reportComparor.compareTests(testList1, testList2)
    // logger.debug('===testsChanges: ' + JSON.stringify(testsChanges))

    let reportsChanges = reportComparor.compareReports(report1, report2)

    let resultsPath = '.\\test\\utility\\reportComparor\\results\\'
    utility.saveJsonFile(resultsPath, 'compare_result', reportsChanges)


}