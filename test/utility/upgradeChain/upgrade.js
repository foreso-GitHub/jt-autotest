//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
const tool = require("./upgradeChainTool")
//endregion

run()

async function run(){
    let allSame = await tool.shasumNodes()
    if(allSame){
        logger.debug('go on!')
    }
}



