1. 启动命令
    * ./skywell.chain -code="SWT" -rpc -rpcaddr="0.0.0.0" -rpcport=9545 -ws -wsaddr="0.0.0.0" -wsport=9546 -manage -manageaddr="0.0.0.0" -log_level=2 -log_to_ws -log_wsaddr="0.0.0.0" -log_wsport=5142 -log_ws_crossdomain="*"

2. 打开防火墙9546端口

3. 调用链接：
    * ws://121.89.209.19:9546/v1/jsonrpc
    * ws://121.89.209.19:9546/v1/subscribe