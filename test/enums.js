let enums = {

    //region types
    serviceType: {
        unknown: 0,
        oldChain: 10,
        newChain: 20,
        ipfs: 30,
    },

    interfaceType:{
        unknown: 0,
        rpc: 10,
        websocket: 20,
        restful_api: 30,
        swtc_lib: 40,
        swtc_api: 50,
        jingtum_lib: 60,
    },

    testMode: {
        unknown: 0,
        singleMode: 10,
        batchMode: 20,
    },

    restrictedLevel: {
        L0: 0,  //lowest
        L1: 10, //low
        L2: 20, //normal
        L3: 30, //medium
        L4: 40, //high
        L5: 50, //higher
    }

    //endregion
}

module.exports = enums