|用例编号|用例标题|预置条件<br>输入内容<br>预期结果|
|----------------|----------------|----------------|
|<a name="FCJT_getTransactionCount_000010"></a>FCJT_getTransactionC<br>ount_000010|查询有效地址，无区块参数|**预置条件**`无`<br><br>**输入内容**`查询有效地址，无区块参数；然后从该地址发起一笔交易，再次查询该地址，无区块参数`<br><br>**预期结果**`第一次查询返回该地址发起的所有交易次数；第二次查询的返回值比第一次多1`|
|<a name="FCJT_getTransactionCount_000020"></a>FCJT_getTransactionC<br>ount_000020|查询有效昵称，无区块参数|**预置条件**`无`<br><br>**输入内容**`查询有效昵称，无区块参数；然后从该昵称发起一笔交易，再次查询该昵称，无区块参数`<br><br>**预期结果**`第一次查询返回该昵称发起的所有交易次数；第二次查询的返回值比第一次多1`|
|<a name="FCJT_getTransactionCount_000030"></a>FCJT_getTransactionC<br>ount_000030|查询无效地址，无区块参数|**预置条件**`无`<br><br>**输入内容**`查询无效地址，比如不存在的地址、长度不够的地址、纯数字等`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_getTransactionCount_000040"></a>FCJT_getTransactionC<br>ount_000040|查询无效昵称，无区块参数|**预置条件**`无`<br><br>**输入内容**`查询无效昵称，比如不存在的昵称等`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_getTransactionCount_000050"></a>FCJT_getTransactionC<br>ount_000050|查询有效地址，区块参数是有效区块号|**预置条件**`无`<br><br>**输入内容**`查询有效地址，区块参数是有效区块号`<br><br>**预期结果**`返回指定区块内该地址的交易数`|
|<a name="FCJT_getTransactionCount_000060"></a>FCJT_getTransactionC<br>ount_000060|查询有效地址，区块参数是有效区块哈希|**预置条件**`无`<br><br>**输入内容**`查询有效地址，区块参数是有效区块哈希`<br><br>**预期结果**`返回指定区块内该地址的交易数`|
|<a name="FCJT_getTransactionCount_000070"></a>FCJT_getTransactionC<br>ount_000070|查询有效昵称，区块参数是有效区块号|**预置条件**`无`<br><br>**输入内容**`查询有效昵称，区块参数是有效区块号`<br><br>**预期结果**`返回指定区块内该地址的交易数`|
|<a name="FCJT_getTransactionCount_000080"></a>FCJT_getTransactionC<br>ount_000080|查询有效昵称，区块参数是有效区块哈希|**预置条件**`无`<br><br>**输入内容**`查询有效昵称，区块参数是有效区块哈希`<br><br>**预期结果**`返回指定区块内该地址的交易数`|
|<a name="FCJT_getTransactionCount_000090"></a>FCJT_getTransactionC<br>ount_000090|查询有效地址，区块参数是无效区块号|**预置条件**`无`<br><br>**输入内容**`查询有效地址，区块参数是无效区块号（比如不存在的区块号）`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_getTransactionCount_000100"></a>FCJT_getTransactionC<br>ount_000100|查询有效地址，区块参数是无效区块哈希|**预置条件**`无`<br><br>**输入内容**`查询有效地址，区块参数是无效区块号（比如不存在的区块哈希、长度不够的哈希）`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_getTransactionCount_000110"></a>FCJT_getTransactionC<br>ount_000110|查询有效昵称，区块参数是无效区块号|**预置条件**`无`<br><br>**输入内容**`查询有效昵称，区块参数是无效区块号（比如不存在的区块号）`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_getTransactionCount_000120"></a>FCJT_getTransactionC<br>ount_000120|查询有效昵称，区块参数是无效区块哈希|**预置条件**`无`<br><br>**输入内容**`查询有效昵称，区块参数是无效区块号（比如不存在的区块哈希、长度不够的哈希）`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_getTransactionCount_000130"></a>FCJT_getTransactionC<br>ount_000130|查询无效地址，区块参数是无效区块号|**预置条件**`无`<br><br>**输入内容**`查询无效地址，区块参数是无效区块号`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_getTransactionCount_000140"></a>FCJT_getTransactionC<br>ount_000140|查询无效地址，区块参数是无效区块哈希|**预置条件**`无`<br><br>**输入内容**`查询无效地址，区块参数是无效区块号`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_getTransactionCount_000150"></a>FCJT_getTransactionC<br>ount_000150|查询无效昵称，区块参数是无效区块号|**预置条件**`无`<br><br>**输入内容**`查询无效昵称，区块参数是无效区块号`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_getTransactionCount_000160"></a>FCJT_getTransactionC<br>ount_000160|查询无效昵称，区块参数是无效区块哈希|**预置条件**`无`<br><br>**输入内容**`查询无效昵称，区块参数是无效区块号`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_getTransactionCount_000170"></a>FCJT_getTransactionC<br>ount_000170|验证validated参数|**预置条件**`无`<br><br>**输入内容**`查询有效地址，第二个参数为validated`<br><br>**预期结果**`无`|
|<a name="FCJT_getTransactionCount_000180"></a>FCJT_getTransactionC<br>ount_000180|验证current参数|**预置条件**`无`<br><br>**输入内容**`查询有效地址，第二个参数current`<br><br>**预期结果**`无`|
|<a name="FCJT_getTransactionCount_000190"></a>FCJT_getTransactionC<br>ount_000190|验证closed参数|**预置条件**`无`<br><br>**输入内容**`查询有效地址，第二个参数为closed`<br><br>**预期结果**`无`|
