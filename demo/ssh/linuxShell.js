/**
 * Created by kevalin on 2015/4/27.
 */
var fs = require('fs')
var async = require('async')
var SSH2Utils = require('ssh2-utils')
var ssh = new SSH2Utils()



/*
exec linux shell on remote-servers
----------------------------------------------------------------------------------------------
 */
exports.cmdShell2 = function(servers, callback) {
    // if(!cmd || !ips || !ips.length) {
    //     console.log('cmdShell2 ERR - 缺少参数')
    // }
    // else
        {
        var results = [];
        async.waterfall([
            function(cb1) {
                // var servers = [];
                // for(var i = 0; i < ips.length; i++) {
                //     var _server = {};
                //     _server['host'] = ips[i];
                //     // _server['port'] = '10205';
                //     // _server['username'] = 'jt';
                //     // _server['password'] = 'jt';
                //     // _server['privateKey'] = fs.readFileSync('id_rsa_2');
                //     _server['port'] = '22';
                //     _server['username'] = 'root';
                //     _server['password'] = 'Foreso1Aliyun';
                //     servers.push(_server)
                // }
                cb1(null, servers)
            },
            function(servers, cb1) {
                async.each(servers, function(server, cb2) {
                    var _result = {};
                    ssh.exec(server, server.cmd, function(err, stdout, stderr, server, conn) {
                        if (err) throw err;
                        _result['ip'] = server.host;
                        _result['cmdResult'] = stdout.replace('\n\n', '').replace('\n', '');
                        results.push(_result);
                        conn.end()
                        cb2()
                    })
                }, function(err) {
                    cb1(err, results)
                })
            }
        ], function(err, result) {
            if (err) throw err;
            callback(result)
        })
    }
}

/*
get file from remote-servers function
----------------------------------------------------------------------------------------------
 */
exports.getFiles = function(ips, filename, remotePath, localPath, callback) {
    if (!ips || !filename || !remotePath || !localPath) {
        console.log('getFile ERR - 缺少参数')
    }
    else {
        async.waterfall([
            function(cb1) {
                var servers = [];
                for(var i = 0; i < ips.length; i++) {
                    var _server = {};
                    _server['host'] = ips[i];
                    _server['username'] = 'root';
                    _server['privateKey'] = fs.readFileSync('/home/kevalin/.ssh/id_rsa');
                    servers.push(_server)
                }
                cb1(null, servers)
            },
            function(servers, cb1) {
                async.each(servers, function (server, cb2) {
                    async.series([
                        function(cb3) {
                            var localServer = { host:'localhost', username:'kevalin', password:'123456' };
                            var _localPath = localPath + server.host;
                            ssh.mkdir(localServer, _localPath, function(err, server, conn) {
                                if (err) {
                                    console.log(err)
                                }
                                conn.end();
                                cb3(null, 'one')
                            })
                        },
                        function(cb3) {
                            var _remoteFile = remotePath + filename;
                            var _localFile = localPath + server.host + '/' + filename;
                            ssh.getFile(server, _remoteFile, _localFile, function(err, server, conn) {
                                if (err) {
                                    console.log(err)
                                }
                                conn.end();
                                cb3(null, 'two')
                            })
                        }
                    ], function(err, c) {
                        cb2()
                    })
                }, function(err) {
                    cb1()
                })
            }
        ], function(err, result) {
            callback('get file success!!!')
        })
    }
}

/*
put file to remote-servers function
----------------------------------------------------------------------------------------------
 */
exports.putFiles = function(ips, filename, localPath, remotePath, callback) {
    if (!ips || !filename || !remotePath || !localPath) {
        console.log('putFiles ERR - 缺少参数')
    }
    else {
        async.waterfall([
            function(cb1) {
                var servers = [];
                for(var i = 0; i < ips.length; i++) {
                    var _server = {};
                    _server['host'] = ips[i];
                    _server['username'] = 'root';
                    _server['privateKey'] = fs.readFileSync('/home/kevalin/.ssh/id_rsa');
                    servers.push(_server)
                }
                cb1(null, servers)
            },
            function(servers, cb1) {
                async.each(servers, function(server, cb2) {
                    var _localFile = localPath + filename;
                    var _remoteFile = remotePath + filename;
                    ssh.putFile(server, _localFile, _remoteFile, function(err, server, conn) {
                        if (err) {
                            console.log(err)
                        }
                        conn.end();
                        cb2()
                    })
                }, function(err) {
                    cb1()
                })
            }
        ], function(err, result) {
            callback('put file success!!!')
        })
    }
}

