    
Edit mode: 
Markdown
## 连接方法
### RPC
命令行参数
  * -rpc 启动rpc服务，默认为false，不启动rpc服务
  * -rpcaddr 设置rpc服务的地址，默认为"localhost"
  * -rpcport 设置rpc服务的端口，默认为7545 
   
URL：http://{rpcaddr}:{rpcport}/v1/jsonrpc
   
### Websocket

命令行参数：
  * -ws 启动websocket服务，默认为false, 不启动websocket服务
  * -wsaddr 设置websocket服务的地址，默认为"localhost"
  * -wsport 设置websocket服务的端口，默认为7546

测试网页: http://{wsaddr}:{wsport}/test   
URL: ws://{wsaddr}:{wsport}/v1/jsonrpc

测试网页: http://{wsaddr}:{wsport}/subscribe   
URL: ws://{wsaddr}:{wsport}/v1/subscribe

注：两者功能一致，推荐发送命令使用/v1/jsonrpc, 订阅区块等信息使用/v1/subscribe

### 指定底层币

命令行参数：
  * -code 指定底层币名称。默认为SWT。

### log级别

命令行参数：
  * -log_level 指定输出的log级别，0，1日志较少，2非常详细。

### 启动时是否验证所有区块

  * -verify, 默认为false, 直接装载快照，启动时不一一验证区块，当设置为true时，会像以前一样，启动时会从0开始一一装载并验证区块

### 指定chain能打开的最大文件数
设得大些，避免节点在非共识状态下，被大量交易（每个交易都有一个http链接，会占用文件）冲垮。
  
命令行参数：
  * ulimit -HSn 320000
  
### 启动命令实例
 ```
 ./skywell.chain -code="SWT" -rpc -rpcaddr="0.0.0.0" -rpcport=9545 -ws -wsaddr="0.0.0.0" -wsport=9546 -manage -manageaddr="0.0.0.0" -log_level=2 -log_to_ws -log_wsaddr="0.0.0.0" -log_wsport=5142 -log_ws_crossdomain="*"
 ```