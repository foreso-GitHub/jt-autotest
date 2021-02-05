//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let utility = require('../framework/testUtility')
const fs = require('fs')
const offline = require('../framework/offlineTool')
const consts = require('../framework/consts')
//endregion


//region can be removed

// testCreateAccount()
// testSignTx()
testSignToken()


function testCreateAccount(){
    let account = offline.createWallet(consts.walletTypes.Ed25519)
    logger.debug(JSON.stringify(account))
}

async function testSignTx(){
    let txParams = []
    txParams.push({
        from:'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh',
        secret:'snoPBjXtMeMyMHUVTgbuqAfg1SUTb',
        to:'jBAFWRUGRuWdT5R2tAZA49oytnQ3KXeQYH',
        value:'1',
        sequence:'970',
        memos:['hello'],
    })

    let blobs = await offline.signTransaction(txParams)
    logger.debug(JSON.stringify(blobs))
}

async function testSignToken(){
    let txParams = []
    txParams.push({
        from:'jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh',
        secret:'snoPBjXtMeMyMHUVTgbuqAfg1SUTb',
        to:'jBAFWRUGRuWdT5R2tAZA49oytnQ3KXeQYH',
        value:'0.004/TSC_3/jHb9CJAWyB4jr91VRWn96DkukG4bwdtyTh',
        // value:'0.003/TSC_2/jjjjjjjjjjjjjjjjjjjjjhoLvTp',
        // value:'0.002/SWT',
        sequence:'973',
        // flags: 0,
        memos:['hello'],
    })

    let blobs = await offline.signTransaction(txParams)
    logger.debug(JSON.stringify(blobs))
}


//endregion
