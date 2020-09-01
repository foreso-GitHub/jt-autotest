
let responseStatus = {
    success: "success",
    error: "error",
}

//region types
let serviceType = {
    unknown: 0,
    oldChain: 10,
    newChain: 20,
    ipfs: 30,
}

let interfaceType = {
    unknown: 0,
    rpc: 10,
    websocket: 20,
    restful_api: 30,
    swtc_lib: 40,
    swtc_api: 50,
    jingtum_lib: 60,
}
//endregion

let testMode = {
    unknown: 0,
    singleMode: 10,
    batchMode: 20,
}

let restrictedLevel = {
    L0: 0,  //lowest
    L1: 10, //low
    L2: 20, //normal
    L3: 30, //medium
    L4: 40, //high
    L5: 50, //higher
}

let reportTestState = {
    passed: 'passed',
    failed: 'failed',
    pending: 'pending',
    hooked: 'hooked',
    skipped: 'skipped',
    p2f: 'passed ==> failed',
    p2pd: 'passed ==> pending',
    p2h: 'passed ==> hooked',
    p2s: 'passed ==> skipped',
    f2p: 'failed ==> passed',
    pd2p: 'pending ==> passed',
    h2p: 'hooked ==> passed',
    s2p: 'skipped ==> passed',
}

module.exports = { responseStatus,  serviceType,  interfaceType,  testMode,  restrictedLevel, reportTestState, }