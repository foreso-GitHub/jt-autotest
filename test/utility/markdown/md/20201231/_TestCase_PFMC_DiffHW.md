|用例编号|用例标题|预置条件<br>输入内容<br>预期结果|
|----------------|----------------|----------------|
|<a name="PFMC_DiffHW_000010"></a>PFMC_DiffHW_000010|5共识节点、1Gb互联|**预置条件**`5台硬件、软件配置一致的服务器作为共识节点；通过1Gb交换机互联`<br><br>**输入内容**`向每个共识节点发送交易（每秒100个），持续十分钟；之后每个节点每秒增加100个交易，再持续十分钟；之后每隔十分钟每个节点每秒再增加100个交易，如此往复`<br><br>**预期结果**`观察TPS达到多少后，不能够在指定的出块时间内完成出块，依此获得能够稳定出块的最大TPS`|
|<a name="PFMC_DiffHW_000020"></a>PFMC_DiffHW_000020|5共识节点（提升硬件）、1Gb互联|**预置条件**`5台硬件、软件配置一致的服务器作为共识节点；通过1Gb交换机互联`<br><br>**输入内容**`依次提升节点服务器的CPU、内存、硬盘性能配置，按照用例0010的要求进行性能测试`<br><br>**预期结果**`随着硬件性能的提升，能够稳定出块的最大TPS应该也有所提升`|
|<a name="PFMC_DiffHW_000030"></a>PFMC_DiffHW_000030|5共识节点、1Gb互联（不同出块时间）|**预置条件**`5台硬件、软件配置一致的服务器作为共识节点；通过1Gb交换机互联`<br><br>**输入内容**`调整出块时间，进行压测`<br><br>**预期结果**`观察不同的出块时间，能够稳定出块的最大TPS是否一致`|
|<a name="PFMC_DiffHW_000040"></a>PFMC_DiffHW_000040|7共识节点、1Gb互联|**预置条件**`7台硬件、软件配置一致的服务器作为共识节点；通过1Gb交换机互联`<br><br>**输入内容**`向每个共识节点发送交易（每秒70个），持续十分钟；之后每个节点每秒增加70个交易，再持续十分钟；之后每隔十分钟每个节点每秒再增加70个交易，如此往复`<br><br>**预期结果**`观察TPS达到多少后，不能够在指定的出块时间内完成出块，依此获得能够稳定出块的最大TPS（应该比5共识节点的最大TPS要低）`|
|<a name="PFMC_DiffHW_000050"></a>PFMC_DiffHW_000050|7共识节点（提升硬件）、1Gb互联|**预置条件**`7台硬件、软件配置一致的服务器作为共识节点；通过1Gb交换机互联`<br><br>**输入内容**`依次提升节点服务器的CPU、内存、硬盘性能配置，按照用例0030的要求进行性能测试`<br><br>**预期结果**`随着硬件性能的提升，能够稳定出块的最大TPS应该也有所提升`|
|<a name="PFMC_DiffHW_000060"></a>PFMC_DiffHW_000060|7共识节点、1Gb互联|**预置条件**`7台硬件、软件配置一致的服务器作为共识节点；通过1Gb交换机互联`<br><br>**输入内容**`调整出块时间，进行压测`<br><br>**预期结果**`观察不同的出块时间，能够稳定出块的最大TPS是否一致`|
|<a name="PFMC_DiffHW_000070"></a>PFMC_DiffHW_000070|9共识节点、1Gb互联|**预置条件**`9台硬件、软件配置一致的服务器作为共识节点；通过1Gb交换机互联`<br><br>**输入内容**`向每个共识节点发送交易（每秒50个），持续十分钟；之后每个节点每秒增加50个交易，再持续十分钟；之后每隔十分钟每个节点每秒再增加50个交易，如此往复`<br><br>**预期结果**`观察TPS达到多少后，不能够在指定的出块时间内完成出块，依此获得能够稳定出块的最大TPS（应该比7共识节点的最大TPS要低）`|
|<a name="PFMC_DiffHW_000080"></a>PFMC_DiffHW_000080|9共识节点、1Gb互联|**预置条件**`9台硬件、软件配置一致的服务器作为共识节点；通过1Gb交换机互联`<br><br>**输入内容**`依次提升节点服务器的CPU、内存、硬盘性能配置，按照用例0050的要求进行性能测试`<br><br>**预期结果**`随着硬件性能的提升，能够稳定出块的最大TPS应该也有所提升`|
|<a name="PFMC_DiffHW_000090"></a>PFMC_DiffHW_000090|9共识节点、1Gb互联|**预置条件**`9台硬件、软件配置一致的服务器作为共识节点；通过1Gb交换机互联`<br><br>**输入内容**`调整出块时间，进行压测`<br><br>**预期结果**`观察不同的出块时间，能够稳定出块的最大TPS是否一致`|
|<a name="PFMC_DiffHW_000100"></a>PFMC_DiffHW_000100|5共识节点、10Gb互联|**预置条件**`5台硬件、软件配置一致的服务器作为共识节点；通过10Gb交换机互联`<br><br>**输入内容**`向每个共识节点发送交易（每秒100个），持续十分钟；之后每个节点每秒增加100个交易，再持续十分钟；之后每隔十分钟每个节点每秒再增加100个交易，如此往复`<br><br>**预期结果**`观察TPS达到多少后，不能够在指定的出块时间内完成出块，依此获得能够稳定出块的最大TPS`|
|<a name="PFMC_DiffHW_000110"></a>PFMC_DiffHW_000110|5共识节点（提升硬件）、10Gb互联|**预置条件**`5台硬件、软件配置一致的服务器作为共识节点；通过10Gb交换机互联`<br><br>**输入内容**`依次提升节点服务器的CPU、内存、硬盘性能配置，按照用例0070的要求进行性能测试`<br><br>**预期结果**`随着硬件性能的提升，能够稳定出块的最大TPS应该也有所提升`|
|<a name="PFMC_DiffHW_000120"></a>PFMC_DiffHW_000120|5共识节点、10Gb互联|**预置条件**`5台硬件、软件配置一致的服务器作为共识节点；通过10Gb交换机互联`<br><br>**输入内容**`调整出块时间，进行压测`<br><br>**预期结果**`观察不同的出块时间，能够稳定出块的最大TPS是否一致`|
|<a name="PFMC_DiffHW_000130"></a>PFMC_DiffHW_000130|7共识节点、10Gb互联|**预置条件**`7台硬件、软件配置一致的服务器作为共识节点；通过10Gb交换机互联`<br><br>**输入内容**`向每个共识节点发送交易（每秒70个），持续十分钟；之后每个节点每秒增加70个交易，再持续十分钟；之后每隔十分钟每个节点每秒再增加70个交易，如此往复`<br><br>**预期结果**`观察TPS达到多少后，不能够在指定的出块时间内完成出块，依此获得能够稳定出块的最大TPS（应该比5共识节点的最大TPS要低）`|
|<a name="PFMC_DiffHW_000140"></a>PFMC_DiffHW_000140|7共识节点（提升硬件）、10Gb互联|**预置条件**`7台硬件、软件配置一致的服务器作为共识节点；通过10Gb交换机互联`<br><br>**输入内容**`依次提升节点服务器的CPU、内存、硬盘性能配置，按照用例0090的要求进行性能测试`<br><br>**预期结果**`随着硬件性能的提升，能够稳定出块的最大TPS应该也有所提升`|
|<a name="PFMC_DiffHW_000150"></a>PFMC_DiffHW_000150|7共识节点、10Gb互联|**预置条件**`7台硬件、软件配置一致的服务器作为共识节点；通过10Gb交换机互联`<br><br>**输入内容**`调整出块时间，进行压测`<br><br>**预期结果**`观察不同的出块时间，能够稳定出块的最大TPS是否一致`|
|<a name="PFMC_DiffHW_000160"></a>PFMC_DiffHW_000160|9共识节点、10Gb互联|**预置条件**`9台硬件、软件配置一致的服务器作为共识节点；通过10Gb交换机互联`<br><br>**输入内容**`向每个共识节点发送交易（每秒50个），持续十分钟；之后每个节点每秒增加50个交易，再持续十分钟；之后每隔十分钟每个节点每秒再增加50个交易，如此往复`<br><br>**预期结果**`观察TPS达到多少后，不能够在指定的出块时间内完成出块，依此获得能够稳定出块的最大TPS（应该比7共识节点的最大TPS要低）`|
|<a name="PFMC_DiffHW_000170"></a>PFMC_DiffHW_000170|9共识节点、10Gb互联|**预置条件**`9台硬件、软件配置一致的服务器作为共识节点；通过10Gb交换机互联`<br><br>**输入内容**`依次提升节点服务器的CPU、内存、硬盘性能配置，按照用例0110的要求进行性能测试`<br><br>**预期结果**`随着硬件性能的提升，能够稳定出块的最大TPS应该也有所提升`|
|<a name="PFMC_DiffHW_000180"></a>PFMC_DiffHW_000180|9共识节点、10Gb互联|**预置条件**`9台硬件、软件配置一致的服务器作为共识节点；通过10Gb交换机互联`<br><br>**输入内容**`调整出块时间，进行压测`<br><br>**预期结果**`观察不同的出块时间，能够稳定出块的最大TPS是否一致`|