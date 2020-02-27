const testNetIP = 'ws://139.198.19.157:5055'       //基金会测试链： ws://139.198.19.157:5055
const mainNetIP = 'wss://c05.jingtum.com:5020'  //主链： wss://c04.jingtum.com:5020
const Remote = require('swtc-lib').Remote
const remote = new (require('swtc-lib').Remote)({server: testNetIP, issuer: 'jBciDE8Q3uJjf111VeiUNM775AMKHEbBLS'})
let utility = require("../../test/testUtility.js")

let address = 'jpmKEm2sUevfpFjS7QHdT8Sx7ZGoEXTJAz'
let secret = 'ssiUDhUpUZ5JDPWZ9Twt27Ckq6k4C'
// let to = 'j3C3LAfQ6aTgnG3gvPPEaUE3g6cPnXZQdd'
let to = 'jP6qtKENk7dFqkk9R5gbzoR3doPbeThujj'
let memo = 'test'


remote.connectPromise().then(function(){
    console.log
    remote.disconnect()
    
    // console.log("aaa")
    //remote.requestLedgerClosed().submitPromise().then(console.log)
    // remote.requestAccountInfo({account: address}).submitPromise().then(console.log)
    // remote.requestAccountTums({account: address}).submitPromise().then(console.log)

    // remote.requestLedger({
    //     ledger_index: '702545',
    //     transactions: true
    // }).submitPromise()
    //     .then((data)=>{
    //         console.log('bbb')
    //         console.log(data)
    //     })

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
    remote.requestAccountInfo({account: address}).submitPromise().then(async function(accountInfo){
        console.log(accountInfo)
        let sequence = accountInfo.account_data.Sequence
        //await utility.timeout(10000)
        console.log('current sequence: ' + sequence)
        let count = sequence + 2

        remote.buildPaymentTx({source: address, to: to, amount: remote.makeAmount(0.000001), sequence: sequence++})
            .submitPromise(secret, memo).then(function(payment) {
                console.log('p1: ' + JSON.stringify(payment))
                // if(count == sequence){
                //     remote.disconnect()
                // }
            })
        remote.buildPaymentTx({source: address, to: to, amount: remote.makeAmount(0.000001), sequence: sequence++})
            .submitPromise(secret, memo).then(function(payment) {
            console.log('p2: ' + JSON.stringify(payment))
            // if(count == sequence){
            //     remote.disconnect()
            // }
        })

        await utility.timeout(10000)
        await remote.requestAccountInfo({account: address}).submitPromise().then(console.log)
        remote.disconnect()
    })
    */


    /*
    remote.buildPaymentTx({source: address, to: to, amount: remote.makeAmount(0.000001)}).submitPromise(secret, memo).then(function(payment){
        console.log(payment)
        remote.requestAccountInfo({account: to}).submitPromise().then(async function(data){
            // console.log
            console.log('1')
            console.log(data)
            await utility.timeout(10000)
            console.log('2')
            await remote.requestAccountInfo({account: address}).submitPromise().then(console.log)
            console.log('3')
            await remote.requestAccountInfo({account: to}).submitPromise().then(console.log)
            remote.disconnect()
        })
    }).catch(console.error)
    // remote.requestAccountInfo({account: to}).submitPromise().then(console.log)
    //*/

}).catch(console.error)

