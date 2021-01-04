|用例编号|用例标题|预置条件<br>输入内容<br>预期结果|
|----------------|----------------|----------------|
|<a name="FCJT_getAccount_000010"></a>FCJT_getAccount_0000<br>10|查询有效的地址_01|**预置条件**`地址内有底层币和代币`<br><br>**输入内容**`查询地址的底层币、代币`<br><br>**预期结果**`返回底层币、代币余额`|
|<a name="FCJT_getAccount_000020"></a>FCJT_getAccount_0000<br>20|查询有效的地址_02|**预置条件**`地址内没有有底层币和代币`<br><br>**输入内容**`查询地址的底层币、代币`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_getAccount_000030"></a>FCJT_getAccount_0000<br>30|查询有效的昵称_01|**预置条件**`昵称对应的地址内有底层币和代币`<br><br>**输入内容**`查询昵称的底层币、代币`<br><br>**预期结果**`返回底层币、代币余额`|
|<a name="FCJT_getAccount_000040"></a>FCJT_getAccount_0000<br>40|查询有效的昵称_02|**预置条件**`昵称对应的地址内没有底层币和代币`<br><br>**输入内容**`查询昵称的底层币、代币`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_getAccount_000050"></a>FCJT_getAccount_0000<br>50|查询不存在的地址|**预置条件**`无`<br><br>**输入内容**`查询不存在的地址`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_getAccount_000060"></a>FCJT_getAccount_0000<br>60|查询不存在的昵称|**预置条件**`无`<br><br>**输入内容**`查询不存在的昵称`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_getAccount_000070"></a>FCJT_getAccount_0000<br>70|验证validated参数|**预置条件**`无`<br><br>**输入内容**`查询账户信息时使用validated参数`<br><br>**预期结果**`返回已经共识过的账户信息`|
|<a name="FCJT_getAccount_000080"></a>FCJT_getAccount_0000<br>80|验证current参数|**预置条件**`无`<br><br>**输入内容**`查询账户信息时使用current参数`<br><br>**预期结果**`返回正在共识的账户信息`|
|<a name="FCJT_getAccount_000090"></a>FCJT_getAccount_0000<br>90|验证closed参数|**预置条件**`无`<br><br>**输入内容**`查询账户信息时使用closed参数`<br><br>**预期结果**`目前可能还不支持closed参数`|
