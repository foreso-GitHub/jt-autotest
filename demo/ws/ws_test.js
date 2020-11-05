var ws = require("nodejs-websocket")

let connection = ws.connect("ws://121.89.209.19:9546/v1/jsonrpc")
connection.on("text", function (str) {
    if (connection.nickname === null) {
        connection.nickname = str
        console.log("text: " + str)
    } else
        console.log("["+connection.nickname+"] "+str)
})
connection.on("close", function () {
    console.log(connection.nickname+" left")
})
console.log("readyState: " + connection.readyState)
connection.sendText("aaa")
console.log("readyState: " + connection.readyState)
connection.close()

// ws.connect("ws://121.89.209.19:9546/v1/jsonrpc", function(connection){
//     console.log("connect")
//     connection.on("text", function (str) {
//         if (connection.nickname === null) {
//             connection.nickname = str
//             console.log("text: " + str)
//         } else
//             console.log("["+connection.nickname+"] "+str)
//     })
//     connection.on("close", function () {
//         console.log(connection.nickname+" left")
//     })
// })

