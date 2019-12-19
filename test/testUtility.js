let testUtility = {
    timeout: function(time) {
        return new Promise(async (resolve, reject) => {
            if (typeof time != 'number') reject(new Error('参数必须是number类型'));
            setTimeout(
                () => {
                    resolve('timeout done!')
                }, time)
        })
    }
}
module.exports = testUtility