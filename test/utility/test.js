//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let utility = require('../framework/testUtility')
//endregion

let rands = utility.getRandList(0, 4, 5, false)
logger.debug('rands: ' + JSON.stringify(rands))

