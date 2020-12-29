//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let sshCmd = require('../../framework/sshCmd')
let utility = require("../../framework/testUtility.js")
const { jtNodes, } = require("../../config/config")
const nodeStatusTool = require("../monitor/nodeStatusTool")
//endregion

/*

1.shasum
compare all.x
compare current chain.
2. backup chain
3.stop chain
4. cp skywell.chain
5. check shasum again
6. start chain

 */

const cmds = {
    shasum_newChain: 'shasum ./download/skywell.chain',
    shasum_currentChain: 'shasum ./node/skywell.chain',
    shasum_backupChain: 'shasum ./backup/versions/skywell.chain',
    cp_newChain: 'cp ./download/skywell.chain ./node/skywell.chain',
    cp_backup: 'cp ./download/skywell.chain ./backup/versions/skywell.chain',
}

module.exports = upgradeChainTool = {

    //region shasum

    shasumNewChain: async function(){
        return await upgradeChainTool.execShasum(cmds.shasum_newChain)
    },

    shasumCurrentChain: async function(){
        return await upgradeChainTool.execShasum(cmds.shasum_currentChain)
    },

    execShasum: async function(cmd){
        let results = await upgradeChainTool.exec(jtNodes, cmd)
        let result
        let allSame = true

        for(let i = 0; i < results.length; i++){
            results[i].shasum = upgradeChainTool.parseShasum(cmd, results[i].cmdResult)
            // logger.debug(results[i].service.name + ': ' + results[i].shasum)
            if(!result){
                result = results[i]
            }
            else{
                if(result.shasum != results[i].shasum){
                    allSame = false
                    logger.debug(result.service.name + ' and ' + results[i].service.name + ' have different shasum: '
                        + result.shasum + ' | ' + results[i].shasum)
                }
            }
        }
        // logger.debug(result.shasum)
        return allSame ? result.shasum : null
    },

    //2d55b2941a775a8c090b9039d57ef805dba3c516  ./download/skywell.chain
    parseShasum: function(cmd, result){
        let removePart = cmd.replace('shasum', '')
        let shasum = result.replace(removePart,'')
        shasum = shasum.replace('\r','')
        return shasum
    },

    //endregion

    //region common

    exec: function(nodes, cmd){
        return new Promise(async (resolve, reject) => {
            let servers = []
            for(let i = 0; i < nodes.length; i++){
                servers.push(sshCmd.setCmd(nodes[i], cmd))
            }
            sshCmd.execCmd(servers, function(error, results){
                resolve(results)
            })
        })
    },

    //endregion

    upgrade: async function(newDate){
        let error = 'Upgrade chain failed!'

        if(!newDate)
        {
            logger.debug(error + ' No new date input!')
            return false
        }

        let newShasum = await upgradeChainTool.shasumNewChain()
        if(newShasum)
        {
            logger.debug('Find new version: ' + newShasum)
            let currentShasum = await upgradeChainTool.shasumCurrentChain()
            if(currentShasum && currentShasum != newShasum){
                logger.debug('Versions check: pass!')

                let cp_backup = cmds.cp_backup + '_' + newDate
                let shasum_backupChain = cmds.shasum_backupChain + '_' + newDate
                let cp_backup_results = await upgradeChainTool.exec(jtNodes, cp_backup)
                let backupShasum = await upgradeChainTool.execShasum(shasum_backupChain)
                if(backupShasum === newShasum){
                    logger.debug('Backup chain done!')

                    await nodeStatusTool.stopNodes()
                    logger.debug('Stop chain!')
                    await utility.timeout(5000)

                    let cp_newChain_results = await upgradeChainTool.exec(jtNodes, cmds.cp_newChain)
                    let updatedShasum = await upgradeChainTool.shasumCurrentChain()
                    if(updatedShasum === newShasum){
                        logger.debug('Update chain done!')
                        await nodeStatusTool.startNodes()
                        logger.debug('Start chain!')
                        await utility.timeout(5000)
                        logger.debug('Upgrade chain done!')
                        return true
                    }
                    else{
                        logger.debug(error + ' Update chain failed!')
                        return false
                    }
                }
                else{
                    logger.debug(error + ' Backup chain failed!')
                    return false
                }
            }
            else{
                logger.debug(error + ' Current chain doesn\'t exist or it is the same as new version!')
                return false
            }
        }
        else{
            logger.debug(error + ' Not all nodes have new version!')
            return false
        }

        logger.debug(error)
        return false
    },



}

