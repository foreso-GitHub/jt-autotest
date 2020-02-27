let swtclib = require('./swtclib-interface.js')
const consts = require("../consts")
let server = new swtclib()
const { servers, modes } = require("../../test/config")

let rpcInterface = require('../rpc/rpcInterface')

let rpc = rpcInterface()
rpc.init(modes[0])
rpc.printClassName()
rpc.getBlockNumber().then((block)=>{
    console.log(block)
})

server.getResponse(consts.rpcFunctions.getBlockNumber, null).then(function(data){
    console.log(data)
    server.disconnect()
})