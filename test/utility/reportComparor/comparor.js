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
    let statResult = reportComparor.compareStats(report1.stats, report2.stats)

    logger.debug(JSON.stringify(statResult.differences))
    logger.debug(JSON.stringify(statResult.fullComparison))

}