|用例编号|用例标题|预置条件<br>输入内容<br>预期结果|
|----------------|----------------|----------------|
|<a name="FCJT_issueToken_000010"></a>FCJT_issueToken_0000<br>10|无效的from参数|**预置条件**`无`<br><br>**输入内容**`无效的from参数（即发行token的帐户地址）：地址过长或过短、纯数字、不以j开头的地址等`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_issueToken_000020"></a>FCJT_issueToken_0000<br>20|无效的secret参数|**预置条件**`无`<br><br>**输入内容**`其他参数都有效，secret跟发行账户地址不匹配`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_issueToken_000030"></a>FCJT_issueToken_0000<br>30|无效的to参数|**预置条件**`无`<br><br>**输入内容**`无效的to参数（即创建token的帐户地址）：地址过长或过短、纯数字、不以j开头的地址等`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_issueToken_000040"></a>FCJT_issueToken_0000<br>40|无效的token name参数|**预置条件**`无`<br><br>**输入内容**`在token的定义信息里面，name为空，或者name字符串过长`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_issueToken_000050"></a>FCJT_issueToken_0000<br>50|无效的token symbol参数|**预置条件**`无`<br><br>**输入内容**`在token的定义信息里面，symbol为空，或者symbol字符串过长，或者是一个被其他token使用过的symbol，或者symbol包含特殊字符串“\/*$&”等`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_issueToken_000060"></a>FCJT_issueToken_0000<br>60|无效的token total_supply参数|**预置条件**`无`<br><br>**输入内容**`在token的定义信息里面，total_supply为0、负数、小数、字符串等`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_issueToken_000070"></a>FCJT_issueToken_0000<br>70|无效的token属性参数：name|**预置条件**`无`<br><br>**输入内容**`name为空，或者很长的字符串（name长度上限为256字节）`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_issueToken_000080"></a>FCJT_issueToken_0000<br>80|无效的token属性参数：type|**预置条件**`无`<br><br>**输入内容**`"type支持八种类型boolean`<br><br>**预期结果**` integer`|
|<a name="FCJT_issueToken_000090"></a>FCJT_issueToken_0000<br>90|无效的token属性参数：desc|**预置条件**`无`<br><br>**输入内容**`desc可以为空，这里用很长的字符串测试是否有长度上限`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_issueToken_000100"></a>FCJT_issueToken_0001<br>00|无效的token属性参数：属性上限|**预置条件**`无`<br><br>**输入内容**`目前不只token最多可以有多少个属性，此处测试属性个数是否有上限`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_issueToken_000110"></a>FCJT_issueToken_0001<br>10|有效的参数测试，发行账号燃料足够|**预置条件**`无`<br><br>**输入内容**`每个参数都有效，token有八个属性，分别覆盖八个不同的属性类型`<br><br>**预期结果**`token发行成功`|
|<a name="FCJT_issueToken_000120"></a>FCJT_issueToken_0001<br>20|有效的参数测试，发行账号燃料不够|**预置条件**`无`<br><br>**输入内容**`每个参数都有效，token有八个属性，分别覆盖八个不同的属性类型；但是发现账号燃料不够`<br><br>**预期结果**`返回相应的提示信息`|
