//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let utility = require('../framework/testUtility')
//endregion

let rands = utility.getRandList(0, 4, 5, false)
logger.debug('rands: ' + JSON.stringify(rands))

let array = [[1,2],3]
// let array2 = array
let array2 = utility.cloneArray(array)
array[0][0] = 100
logger.debug('array: ' + JSON.stringify(array))
logger.debug('array2: ' + JSON.stringify(array2))
logger.debug('typeof array2: ' + typeof array2)
logger.debug('length array2: ' + array2.length)
logger.debug(Object.prototype.toString.apply(array2))
logger.debug(utility.isArray(1))