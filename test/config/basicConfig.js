
let commonPaths = {
    test_data_path: ".\\test\\testData\\",
    test_data_backup_path: ".\\test\\testData\\backup\\",
    ipfs_test_files_path: ".\\test\\testData\\testFiles\\",
    accounts_js_file_path: ".\\test\\testData\\accounts.js",
    chain_data_js_file_path: ".\\test\\testData\\chainDatas.js",
}

let rpcSettings = {
    request_timeout: 6000,  //important: rpc request timeout setting.  if request_timeout <= 0, then request timeout will be ignore.
}

module.exports = {
    commonPaths,
    rpcSettings,
}