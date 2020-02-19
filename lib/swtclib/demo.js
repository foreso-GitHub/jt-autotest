const Remote = require('swtc-lib').Remote
const remote = new (require('swtc-lib').Remote)({server: 'ws://139.198.19.157:5055', issuer: 'jBciDE8Q3uJjf111VeiUNM775AMKHEbBLS'})
//主链： wss://c04.jingtum.com:5020
//基金会测试链： ws://139.198.19.157:5055

// jpmKEm2sUevfpFjS7QHdT8Sx7ZGoEXTJAz
// ssiUDhUpUZ5JDPWZ9Twt27Ckq6k4C

let address = 'jpmKEm2sUevfpFjS7QHdT8Sx7ZGoEXTJAz'
let secret = 'ssiUDhUpUZ5JDPWZ9Twt27Ckq6k4C'
let to = 'j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd'
let memo = 'test'

remote.connectPromise().then(function(){
    console.log
    console.log("aaa")
    //remote.requestLedgerClosed().submitPromise().then(console.log)
    // remote.requestAccountInfo({account: address}).submitPromise().then(console.log)
    // remote.requestAccountTums({account: address}).submitPromise().then(console.log)

    remote.requestLedger({
        ledger_index: '702545',
        transactions: true
    }).submitPromise()
        .then((data)=>{
            console.log('bbb')
            console.log(data)
        })

    /*
    async () => {
        let response = await remote.requestLedger({
            ledger_index: '701919',
            transactions: false
        }).submitPromise()
        console.log(response)
        // remote.disconnect()
    }
    //*/



    /*
    remote.buildPaymentTx({source: address, to: to, amount: remote.makeAmount(0.01)}).submitPromise(secret, memo).then(function(){
        console.log
        remote.requestAccountInfo({account: to}).submitPromise().then(function(data){
            // console.log
            console.log(data)
            remote.disconnect()
        }

        )
    }).catch(console.error)
    // remote.requestAccountInfo({account: to}).submitPromise().then(console.log)
    //*/

}).catch(console.error)

