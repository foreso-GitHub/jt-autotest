## 如何生成新的测试帐号和数据


### 2种模式：
   * 增加模式：变量modes，如果没有对应的accounts和chaindata，则重新生成，增加到../testData/accounts.js和../testData/accounts.js中
   * 刷新模式：accounts不变，chaindata全部重新生成
### 操作
   * 增加模式
        * copy ../testData/backupMain/accounts-libmain.js到../testData/accounts.js
        * copy ../testData/backupMain/chainDatas-libmain.js到../testData/chainDatas.js
        * init.js,执行await init_new()
   * 刷新模式
        * init.js,执行await init_based_on_existed_accounts()
        
### 注意
   * 区块链重置后，必须要把所有的account数据(lib_main除外)删除然后重新生成一遍，不然nickname的测试会失败
   * nickname只存在于本地节点，不存在于区块链上。也就是说，baidu节点的nickname：“aaa”和腾讯节点的nickname：“aaa”极有可能不是同一个地址。
   * 一般而言，初始化使用baidu节点的rpc接口，因此初始化时的nickname只存在于baidu节点。因此getBalance检查nickname的case只有在baidu节点(rpc和ws都可)才能通过。
   
   
   
   
   
   
