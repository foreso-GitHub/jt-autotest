//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let async = require('async')
let SSH2Utils = require('ssh2-utils')
let ssh = new SSH2Utils()
//endregion

module.exports = sshCmd = {

    execCmd: function(services, callback) {
        let results = []
        async.each(services, function(service, cb2) {
            let _result = {}
            let hasCallbacked = false
            logger.debug('service.cmd: ' + service.cmd)
            ssh.exec(service, service.cmd, function(err, stdout, stderr, service, conn) {
                _result['service'] = service
                if (err) {
                    logger.debug('service: ' + service.name + ' | service.cmd: ' + service.cmd)
                    logger.debug('execCmd_1 error: ' + err)
                    if(!hasCallbacked) {  //if has callbacked, then ignore this error.
                        _result['cmdResult'] = err
                        results.push(_result)
                        cb2(err)
                    }else{
                        logger.debug('execCmd_1 error: error is ignored!')
                    }
                    // throw err
                }
                else{
                    _result['cmdResult'] = stdout.replace('\n\n', '').replace('\n', '')
                    results.push(_result)
                    conn.end()
                    cb2()
                    hasCallbacked = true
                }
            })
        }, function(err) {
            if(err){
                logger.debug('execCmd_2 error: ' + err)
            }
            // logger.debug('done: ' + JSON.stringify(results))
            callback(err, results)
        })
    },

    createService: function(name, ip, sshPort, rpcPort, user, pw, cmds){
        let service = {}
        service.name = name
        service.host = ip
        service.port = sshPort
        service.rpcPort = rpcPort
        service.username = user
        service.password = pw
        service.url = 'http://' + ip + ':' + rpcPort + '/v1/jsonrpc'
        service.cmds = cmds
        return service
    },

    setCmd: function(service, cmd){
        service.cmd = cmd
        return service
    },

    execSshCmd: function(service, cmd){
        let services = []
        services.push(sshCmd.setCmd(service, cmd))
        sshCmd.execCmd(services, function(error, results){
            results.forEach(result=>{
                logger.debug('service name:' + result.service.name)
                logger.debug('cmd:' + result.service.cmd)
                logger.debug('cmd result:' + result.cmdResult)
            })
        })
    },

}
