如何生成新的测试帐号和数据


1. 2种模式：
    * 增加模式：变量modes，如果没有对应的accounts和chaindata，则重新生成，增加到../testData/accounts.js和../testData/accounts.js中
    * 刷新模式：accounts不变，chaindata全部重新生成
2. 操作
    * 增加模式
        * copy ../testData/backupMain/accounts-libmain.js到../testData/accounts.js
        * copy ../testData/backupMain/chainDatas-libmain.js到../testData/chainDatas.js
        * init.js,执行await init_new()
    * 刷新模式
        * init.js,执行await init_based_on_existed_accounts()