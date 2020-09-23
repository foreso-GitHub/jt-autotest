echo start test
curl -s -X POST -H "Content-Type:application/json" --data '{"jsonrpc":"2.0","method":"jt_blockNumber","params":[],"id":1}' http://localhost:9545/v1/jsonrpc
echo end test

