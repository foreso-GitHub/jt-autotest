const https = require('https')
const http = require('http')
const fs = require('fs')

// let url = 'https://github.com/caivega/ipfslib/wiki/%E6%B5%8B%E8%AF%95%E7%94%A8%E4%BE%8B2/_edit'
let url = 'https://github.com/caivega/ipfslib/wiki/%E6%B5%8B%E8%AF%95%E7%94%A8%E4%BE%8B2'
let web = url.indexOf('https') == 0 ? https : http

web.get(url, function (response) {
    response.setEncoding('utf8')
    var Data = ''
    response.on('data', function (data) {    //加载到内存
        Data += data
    }).on('end', function () {          //加载完
        // fs.writeFile(完整存储路径, Data , function () {
        //     console.log('ok')
        // });
        console.log(Data)
    })
})
