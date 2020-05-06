let testUtility = {
    timeout: function(time) {
        return new Promise(async (resolve, reject) => {
            if (typeof time != 'number') reject(new Error('参数必须是number类型'));
            setTimeout(
                () => {
                    resolve('timeout done!')
                }, time)
        })
    },

    isJSON: function(str) {
        if (typeof str == 'string') {
            try {
                let obj = JSON.parse(str)
                if(typeof obj == 'object' && obj ){
                    return true
                }else{
                    return false
                }
            } catch(e) {
                // console.log('error：'+str+'!!!'+e)
                return false
            }
        }
        // console.log('It is not a string!')
        return false
    }
}
module.exports = testUtility