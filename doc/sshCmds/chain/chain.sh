ulimit -HSn 320000
./skywell.chain -code="SWT" -rpc -rpcaddr="0.0.0.0" -rpcport=9545 -ws -wsaddr="0.0.0.0" -wsport=9546 -manage -manageaddr="0.0.0.0" -log_level=2 -log_to_ws -log_wsaddr="0.0.0.0" -log_wsport=5142 -log_ws_crossdomain="*"
