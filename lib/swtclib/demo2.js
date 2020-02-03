let swtclib = require('./swtclib-interface.js')
const consts = require("../consts")
let server = new swtclib()

server.getResponse(consts.rpcFunctions.getBlockNumber, null).then(function(data){
    console.log(data)
})