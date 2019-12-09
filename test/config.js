var rpc = require('../app/rpc/interfaces.js')

const RPC_URL = 'http://139.198.191.254:7545/v1/jsonrpc'

init()
function init(){
    rpc.setUrl(RPC_URL)
}

let servers = [rpc, rpc]

let chains = ['swt', 'bwt']

let status = {
    success: "success",
}


let addresses = {
    rootAccount:{
      address:"jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh",
      secret:""
    },
    walletAccount:{
        address:"j3Go8eJjRD5yvZuZbrGXXDcrACkxHgdaM8",
        secret:"shnWYMunzyrzfLAE4LWknxxST7mq8"
    },
    balanceAccount:{
        address:"j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd",
        secret:""
    }
}

module.exports = {
    servers,
    status,
    chains,
    addresses,

}