let rpcInterface = require('../rpc/rpcInterface')
let swtclibInterface = require('../swtclib/swtclibInterface')
const consts = require("../base/consts")
let server = new swtclibInterface()
const { servers, modes } = require("../../test/config")


// let rpc = rpcInterface()
// rpc.init(modes[0])
// rpc.printClassName()
// rpc.getBlockNumber().then((block)=>{
//     console.log(block)
// })

server.getResponse(consts.rpcFunctions.getBlockNumber, null).then(function(data){
    console.log(data)
    server.disconnect()
})