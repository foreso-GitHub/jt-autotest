cd /root/codes/jt-autotest
rm ./test/testData/accounts.js -fr
rm ./test/testData/chainDatas.js -fr
cp ./test/testData/backupMain/accounts-libmain.js ./test/testData/accounts.js
cp ./test/testData/backupMain/chainDatas-libmain.js ./test/testData/chainDatas.js
node ./test/utility/init/init.js

