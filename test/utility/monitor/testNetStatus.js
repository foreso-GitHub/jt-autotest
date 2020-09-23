//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const tool = require("./netStatusTool")
//endregion


tool.showTcAll()
// tool.showNetAll()

// tool.resetTcAll()
// tool.resetNetAll()

