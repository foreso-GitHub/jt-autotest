const nodeMonitor = require('./monitor')
let monitor = new nodeMonitor()

test()

function test(){
    let nodes = []
    nodes.push(createNode('al', 'http://121.89.209.19:9545/v1/jsonrpc'))
    nodes.push(createNode('bd', 'http://180.76.125.22:9545/v1/jsonrpc'))
    nodes.push(createNode('tx', 'http://45.40.240.50:9545/v1/jsonrpc'))
    nodes.push(createNode('hw', 'http://121.37.216.100:9545/v1/jsonrpc'))
    nodes.push(createNode('ty', 'http://61.171.12.71:9545/v1/jsonrpc'))

    monitor.checkSync(nodes)
}

function createNode(name, url){
    let node = {}
    node.name = name
    node.url = url
    return node
}