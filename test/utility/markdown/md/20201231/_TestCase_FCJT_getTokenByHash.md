|用例编号|用例标题|预置条件<br>输入内容<br>预期结果|
|----------------|----------------|----------------|
|<a name="FCJT_getTokenByHash_000010"></a>FCJT_getTokenByHash_<br>000010|无效的哈希参数_01|**预置条件**`无`<br><br>**输入内容**`哈希长度不够或者过长`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_getTokenByHash_000020"></a>FCJT_getTokenByHash_<br>000020|无效的哈希参数_02|**预置条件**`无`<br><br>**输入内容**`哈希长度没问题，但是是不存在的token哈希`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_getTokenByHash_000030"></a>FCJT_getTokenByHash_<br>000030|有效的哈希参数_01|**预置条件**`无`<br><br>**输入内容**`有效的token哈希（FCJT_createToken返回的hash值）`<br><br>**预期结果**`token的详细信息`|
|<a name="FCJT_getTokenByHash_000040"></a>FCJT_getTokenByHash_<br>000040|有效的哈希参数_02|**预置条件**`无`<br><br>**输入内容**`有效的token哈希（FCJT_transferToken返回的hash值）`<br><br>**预期结果**`token的详细信息`|
|<a name="FCJT_getTokenByHash_000050"></a>FCJT_getTokenByHash_<br>000050|有效的哈希参数_03|**预置条件**`无`<br><br>**输入内容**`有效的token哈希（FCJT_tokensOf返回的hash值）`<br><br>**预期结果**`token的详细信息`|
