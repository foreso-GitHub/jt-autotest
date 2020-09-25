//region require
const rpc = require("./rpc")
const { allModes, } = require("../../test/config/config")
const framework = require('../../test/framework/framework')
//endregion

test()

async function test(){
    let server = framework.activeServer(allModes[0])
    let response = await rpc.responseBlockNumber(server)
    console.log('result: ' + JSON.stringify(response))
}


