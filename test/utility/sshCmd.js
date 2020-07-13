//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let async = require('async')
let SSH2Utils = require('ssh2-utils')
let ssh = new SSH2Utils()
//endregion

exports.sshCmd = function(servers, callback) {
    let results = []
    async.each(servers, function(server, cb2) {
        let _result = {}
        ssh.exec(server, server.cmd, function(err, stdout, stderr, server, conn) {
            if (err) throw err
            _result['node'] = server
            _result['cmdResult'] = stdout.replace('\n\n', '').replace('\n', '')
            results.push(_result)
            conn.end()
            cb2()
        })
    }, function(err) {
        logger.debug('error: ' + err)
        // logger.debug('done: ' + JSON.stringify(results))
        callback(err, results)
    })
}

exports.createNode = function(name, ip, sshPort, rpcPort, user, pw, cmds){
    let node = {}
    node.name = name
    node.host = ip
    node.port = sshPort
    node.rpcPort = rpcPort
    node.username = user
    node.password = pw
    node.url = 'http://' + ip + ':' + rpcPort + '/v1/jsonrpc'
    node.cmds = cmds
    return node
}

exports.createServer = function(node, cmd){
    let server = node
    node.cmd = cmd
    return server
}
