|用例编号|用例标题|预置条件<br>输入内容<br>预期结果|
|----------------|----------------|----------------|
|<a name="FCJT_createToken_000010"></a>FCJT_createToken_000<br>010|无效的from参数|**预置条件**`无`<br><br>**输入内容**`无效的from参数（即创建token的帐户地址）：地址过长或过短、纯数字、不以j开头的地址等`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_createToken_000020"></a>FCJT_createToken_000<br>020|无效的secret参数|**预置条件**`无`<br><br>**输入内容**`其他参数都有效，secret跟创建账户地址不匹配`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_createToken_000030"></a>FCJT_createToken_000<br>030|无效的to参数|**预置条件**`无`<br><br>**输入内容**`无效的to参数（即接收token的帐户地址）：地址过长或过短、纯数字、不以j开头的地址等`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_createToken_000040"></a>FCJT_createToken_000<br>040|无效的token info参数|**预置条件**`无`<br><br>**输入内容**`info参数应该是FCJT_issueToken返回的哈希值，此处无效指：哈希值过长或过短、纯数字、乱码字符串等`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_createToken_000050"></a>FCJT_createToken_000<br>050|from参数与info参数不匹配|**预置条件**`无`<br><br>**输入内容**`from参数是一个有效的地址，info参数也是一个有效的定义token的哈希，但是该哈希并不是from参数指定的地址所创建`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_createToken_000060"></a>FCJT_createToken_000<br>060|无效的token uri参数|**预置条件**`无`<br><br>**输入内容**`验证uri是否可以为空，以及是否有长度限制`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_createToken_000070"></a>FCJT_createToken_000<br>070|无效的token属性：name无效|**预置条件**`无`<br><br>**输入内容**`某个属性的name为空，或者在token的定义里面不存在`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_createToken_000080"></a>FCJT_createToken_000<br>080|无效的token属性：type不匹配|**预置条件**`无`<br><br>**输入内容**`比如某个属性name对应的type定义为string，但是实际给出的value属性是number或其他类型（反之亦然，此处需要覆盖很多不匹配的场景）`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_createToken_000090"></a>FCJT_createToken_000<br>090|无效的token属性：属性不全|**预置条件**`无`<br><br>**输入内容**`比如token定义了三个属性，此处指给出其中两个属性的值`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_createToken_000100"></a>FCJT_createToken_000<br>100|无效的token属性：属性过多|**预置条件**`无`<br><br>**输入内容**`比如token定义了三个属性，此处参数给出了四个属性，其中一个属性重复出现了两次`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_createToken_000110"></a>FCJT_createToken_000<br>110|有效的参数测试，创建账号燃料足够|**预置条件**`无`<br><br>**输入内容**`每个参数都有效，token有八个属性，分别覆盖八个不同的属性类型`<br><br>**预期结果**`token创建成功`|
|<a name="FCJT_createToken_000120"></a>FCJT_createToken_000<br>120|有效的参数测试，创建账号燃料不够|**预置条件**`无`<br><br>**输入内容**`每个参数都有效，token有八个属性，分别覆盖八个不同的属性类型，但是创建账号燃料不够`<br><br>**预期结果**`返回相应的提示信息`|
|<a name="FCJT_createToken_000130"></a>FCJT_createToken_000<br>130|有效的参数测试，token属性重复|**预置条件**`无`<br><br>**输入内容**`希望创建的token的某个属性的value已经被之前创建过的token使用过了`<br><br>**预期结果**`需要明确不同token某个属性的value是否可以一致`|
|<a name="FCJT_createToken_000140"></a>FCJT_createToken_000<br>140|有效的参数测试，超过token定义的total_supply|**预置条件**`无`<br><br>**输入内容**`比如token定义的total_supply为100，此时已经创建了100个token，继续创建第101个`<br><br>**预期结果**`返回相应的提示信息`|
