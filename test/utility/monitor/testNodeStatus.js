//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const tool = require("./nodeStatusTool")
//endregion


// tool.resetNode('bd')
// tool.stopJt(getNode('bd', jtNodes)))
// tool.startJt(getNode('ty', jtNodes))
// tool.startJt(jt_node_al)
// tool.stopJt(jt_node_al)

// tool.resetNodes()
// tool.stopNodes()
// tool.startNodes()
tool.testMonitor()

