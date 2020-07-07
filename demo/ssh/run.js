const { cmdShell2, } = require('./linuxShell')
// let ips = []
// ips.push('box-admin.elerp.net:10205')
// ips.push('box-admin.elerp.net')
// let cmd = '/home/jt/test.sh'
// ips.push('39.99.174.194')
// let cmd = '/work/test2.sh'
// let cmd = 'screen -ls'
// let cmd = 'systemctl list-unit-files'
let servers = []
// let server = {}
// server.host = '39.99.174.194'
// server.port = '22'
// server.username = 'tester'
// server.password = 'test'  //need root
// // server.cmd = 'echo hello'
// server.cmd = 'systemctl list-unit-files'

// let a = Math.pow(65, 17)
// let b = 3233
// let c = 2790
// let d = a % b
// let e = (a - d) / b
// let f = a - b * e
// console.log("A:" + a)
// console.log("B:" + b)
// console.log("C:" + c)
// console.log("D:" + d)
// console.log("E:" + e)
// console.log("F:" + f)

// servers.push(createServer('39.99.174.194', '22', 'tester', 'test', 'systemctl list-unit-files'))
// servers.push(createServer('39.99.174.194', '22', 'tester', 'test', 'echo hello'))
// servers.push(createServer('39.99.174.194', '22', 'tester', 'test', 'date'))
// servers.push(createServer('39.99.174.194', '22', 'tester', 'test', '/work/test.sh'))
// servers.push(createServer('box.elerp.net', '2003', 'jt', 'jt', 'sudo systemctl stop jt'))
// servers.push(createServer('box.elerp.net', '2003', 'tester', 'test', 'echo hello world'))

// let ip = '121.89.209.19'
let ip = '180.76.125.22'
// servers.push(createServer(ip, '22', 'root', 'Lianjing@123456', '/root/node/skywell.chain -log_level=2 -rpc -rpcaddr="0.0.0.0" -rpcport=9545'))
// servers.push(createServer('121.89.209.19', '22', 'root', 'Lianjing@123456', 'echo hello'))
// servers.push(createServer('121.89.209.19', '22', 'tester', 'test', 'echo hello'))
servers.push(createServer(ip, '22', 'root', 'Lianjing@123456', 'sudo /root/start.sh'))

// servers.push(createServer('10.0.0.201', '22', 'jt', 'jt', 'echo hello'))
// servers.push(createServer('10.0.0.202', '22', 'jt', 'jt', 'echo hello'))
// servers.push(createServer('10.0.0.203', '22', 'jt', 'jt', 'echo hello'))
// servers.push(createServer('10.0.0.204', '22', 'jt', 'jt', 'echo hello'))
// servers.push(createServer('10.0.0.205', '22', 'jt', 'jt', 'echo hello'))

cmdShell2(servers, function(results){
    results.forEach(result=>{
        console.log('ip:' + result.ip)
        console.log('cmdResult:' + result.cmdResult)
    })
})

function createServer(ip, port, user, pw, cmd){
    let server = {}
    server.host = ip
    server.port = port
    server.username = user
    server.password = pw
    server.cmd = cmd
    return server
}