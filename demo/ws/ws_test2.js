const WebSocket = require('ws');

let ws_count = 0
let open_count = 0
let message_count = 0
let close_count = 0

run()

//region v1
function run_1(){
    let count = 0
    for(let i = 1; i <= 1000; i++){
        let address = 'ws://121.89.209.19:9546/v1/jsonrpc'
        let content = '{"jsonrpc":"2.0","method":"jt_blockNumber","params":[],"id":1}'
        // let response = await
        request_1(address, content, function(data){
            console.log(i + "response1: " + JSON.stringify(data))
            count++
            // if(count == 200){
            //     console.log('count: ' + count)
            // }
            // console.log('count: ' + count)
        })

        content = '{\n' +
            '    "jsonrpc": "2.0",\n' +
            '    "method": "jt_getBlockByNumber",\n' +
            '    "params": [\n' +
            '        "1131",\n' +
            '        false\n' +
            '    ],\n' +
            '    "id": 2\n' +
            '}'
        request_1(address, content, function(data){
            console.log(i + "response2: " + JSON.stringify(data))
            count++
            // if(count == 200){
            //     console.log('count: ' + count)
            // }
            // console.log('count: ' + count)
        })
    }
}

function request_1(address, content, callback){
    if(ws_count < 100){
        console.log('request_1: ' + ws_count)
        req_1(address, content, callback)
    }
    else{
        setTimeout(
            () => {
                request_1(address, content, callback)
            }, 10)
    }
}

function req_1(address, content, callback){

    const ws = new WebSocket(address)

    ws.on('open', function open() {
        // console.log('open');
        ws.send(content);

        ws_count++
        open_count++
        console.log('open count: ' + ws_count + '/' + open_count)
    });

    ws.on('message', function incoming(data) {
        let result = JSON.parse(data)
        // console.log('message:' + result.id);
        // console.log(data);
        callback(result)
        message_count++
        console.log('message count: ' + ws_count + '/' + message_count)
        ws.close()
    })

    ws.on('close', function close() {
        // console.log('disconnected');
        ws_count--
        close_count++
        console.log('close count: ' + ws_count + '/' + close_count)
    });
}
//endregion

//region v2
async function run(){
    let count = 0
    for(let i = 1; i <= 1000; i++){
        let address = 'ws://121.89.209.19:9546/v1/jsonrpc'
        let content = '{"jsonrpc":"2.0","method":"jt_blockNumber","params":[],"id":1}'
        let response = await request(address, content)
        console.log(i + ". response1: " + JSON.stringify(response))

        content = '{\n' +
            '    "jsonrpc": "2.0",\n' +
            '    "method": "jt_getBlockByNumber",\n' +
            '    "params": [\n' +
            '        "1131",\n' +
            '        false\n' +
            '    ],\n' +
            '    "id": 2\n' +
            '}'
        response = await request(address, content)
        console.log(i + ". response2: " + JSON.stringify(response))

        count++
        console.log(". count: " + count)
    }
}

function request(address, content){
    return new Promise((resolve, reject)=>{
        const ws = new WebSocket(address)

        ws.on('open', function open() {
            // console.log('open')
            ws.send(content);
            // setTimeout(
            //     () => {
            //         ws.close()
            //     }, 2000)
            ws_count++
            console.log('open count: ' + ws_count)
        })

        ws.on('message', function incoming(data) {
            let result = JSON.parse(data)
            // console.log('message:' + result.id)
            // console.log(data)
            // callback(result)
            resolve(result)
            ws.close()
        })

        ws.on('close', function close() {
            // console.log('disconnected')
            ws_count--
            console.log('close count: ' + ws_count)
        })
    })

}

//endregion