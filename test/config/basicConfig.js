
let commonPaths = {
    test_data_path: ".\\test\\testData\\",
    test_data_backup_path: ".\\test\\testData\\backup\\",
    ipfs_test_files_path: ".\\test\\testData\\testFiles\\",
    accounts_js_file_path: ".\\test\\testData\\accounts.js",
    chain_data_js_file_path: ".\\test\\testData\\chainDatas.js",
}

let rpcSettings = {
    request_timeout: 13000,  //important: rpc request timeout setting (default: 6000).  if request_timeout <= 0, then request timeout will be ignore.
}

let jtVersion = '20210107'

module.exports = {
    commonPaths,
    rpcSettings,
    jtVersion,
}
