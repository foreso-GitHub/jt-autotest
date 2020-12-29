//region require
let log4js = require('log4js')
log4js.configure('./log4js.json')
let logger = log4js.getLogger('default')
let sshCmd = require('../../framework/sshCmd')
let utility = require("../../framework/testUtility.js")
const { jtNodes, } = require("../../config/config")
//endregion

/*

1.shasum
compare all.x
compare last
2.stop chain
3. cp skywell.chain
update update.sh
cp
backup
4. check again
shasum
5. start chain
6. record shasum as last shasum
7. get ver
8. update const, config

 */

module.exports = upgradeChainTool = {

    shasum: function(service){
        return new Promise(async (resolve, reject) => {
            let servers = []
            servers.push(sshCmd.setCmd(service, service.cmds.shasum))
            sshCmd.execCmd(servers, function(error, results){
                // results.forEach(result=>{
                //     let shasum = upgradeChainTool.parseShasum(result.cmdResult)
                //     shasums.push(shasum)
                //     // logger.debug('service name:' + result.service.name)
                //     // logger.debug('cmd result:' + result.cmdResult)
                //
                // })

                let shasum = upgradeChainTool.parseShasum(results[0].cmdResult)
                resolve(shasum)
            })

        })
    },

    //2d55b2941a775a8c090b9039d57ef805dba3c516  ./download/skywell.chain
    parseShasum: function(result){
        let shasum = result.replace('  ./download/skywell.chain\r','')
        return shasum
    },

    shasumNodes: async function(){
        let shasums = []
        let shasum
        let allSame = true
        for(let i = 0; i < jtNodes.length; i++){
            let shasum = await upgradeChainTool.shasum(jtNodes[i])
            shasums.push({node: jtNodes[i].name, shasum: shasum})
        }

        for(let i = 0; i < shasums.length; i++){
            if(!shasum){
                shasum = shasums[i]
            }
            else{
                if(shasum.shasum != shasums[i].shasum){
                    allSame = false
                    logger.debug(shasum.node + ' and ' + shasums[i].node + ' have different shasum: '
                        + shasum.shasum + ' | ' + shasums[i].shasum)
                }
            }
        }
        return allSame
    },

}

