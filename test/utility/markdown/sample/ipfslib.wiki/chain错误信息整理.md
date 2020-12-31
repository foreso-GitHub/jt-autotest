#### S Success
> Success

0 **TesSUCCESS** ``The transaction was applied.``

#### D Defined
> Defined

1000 **TedCOMPOUND** ``The compound error.``

#### C Claim: 100 .. 159
> Success, but does not achieve optimal result.

100 **TecCLAIM** ``Fee claimed. Sequence used. No action.``

101 **TecPATH_PARTIAL** ``Path could not send full amount.``

102 **TecUNFUNDED_ADD** ``Insufficient NATIVE balance for WalletAdd.``

103 **TecUNFUNDED_OFFER** ``Insufficient balance to fund created offer. ``

104 **TecUNFUNDED_PAYMENT** ``Insufficient NATIVE balance to send.``

105 **TecFAILED_PROCESSING** ``Failed to correctly process transaction.``  

121 **TecDIR_FULL** ``Can not add entry to full directory.``

122 **TecINSUF_RESERVE_LINE** ``Insufficient reserve to add trust line.``

123 **TecINSUF_RESERVE_OFFER** ``Insufficient reserve to create offer.``

124 **TecNO_DST** ``Destination does not exist. Send NATIVE to create it.``

125 **TecNO_DST_INSUF_NATIVE** ``Destination does not exist. Too little NATIVE sent to create it.``

126 **TecNO_LINE_INSUF_RESERVE** ``No such line. Too little reserve to create it.``

127 **TecNO_LINE_REDUNDANT** ``Can't set non-existant line to default.``

128 **TecPATH_DRY** ``Path could not send partial amount.``

129 **TecUNFUNDED** ``One of _ADD, _OFFER, or _SEND. Deprecated.``

130 **TecNO_ALTERNATIVE_KEY** ``The operation would remove the ability to sign transactions with the account.``

131 **TecNO_REGULAR_KEY** ``Regular key is not set.``

132 **TecOWNERS** ``Non-zero owner count.``

133 **TecNO_ISSUER** ``Issuer account does not exist.``

134 **TecNO_AUTH** ``Not authorized to hold asset.``

135 **TecNO_LINE** ``No such line.``

136 **TecINSUFF_FEE** ``Insufficient balance to pay fee.``

137 **TecFROZEN** ``Asset is frozen.``

138 **TecNO_TARGET** ``Target account does not exist.``

139 **TecNO_PERMISSION** ``No permission to perform requested operation.``

140 **TecNO_ENTRY** ``No matching entry found.``

141 **TecINSUFFICIENT_RESERVE** ``Insufficient reserve to complete requested operation.``

142 **TecNEED_MASTER_KEY** ``The operation requires the use of the Master Key.``

143 **TecDST_TAG_NEEDED** ``A destination tag is required.``

144 **TecINTERNAL** ``An internal error has occurred during processing.``

145 **TecOVERSIZE** ``Object exceeded serialization limits.``

146 **TecCRYPTOCONDITION_ERROR** ``Malformed, invalid, or mismatched conditional or fulfillment.``

147 **TecINVARIANT_FAILED** ``One or more invariants for the transaction were not satisfied.``

150 **TecWRONG_SECRET_FOR_FROM_ADDRESS** ``The secret doesn't match the "from" address.``

151 **TecINSUFF_BALANCE** ``The balance is not enough to complete the transaction.``

152 **TecINSUFF_TOKEN_BALANCE** ``The balance of the token is not enough to complete the transaction.``

153 **TecTOKEN_NOT_EXIST** ``The token symbol in "value" parameter doesn't exist.``

154 **TecTOKEN_NOT_MINEABLE** ``The token is not mineable.``

155 **TecTOKEN_NOT_BURNABLE** ``The token is not burnable.``

156 **TecBLOCK_HASH_NOT_EXIST** ``The block hash doesn't exist.``

157 **TecBLOCK_NUMBER_NOT_EXIST** ``The block number doesn't exist.``

	
#### L Local error: -399 .. -300
> Transaction errors, only valid during non-consensus processing.

-399 **TelLOCAL_ERROR** ``Local failure.``

-398 **TelBAD_DOMAIN** ``Domain too long.``

-397 **TelBAD_PATH_COUNT** ``Malformed: Too many paths.``

-396 **TelBAD_PUBLIC_KEY** ``Public key too long.``

-395 **TelFAILED_PROCESSING** ``Failed to correctly process transaction.``

-394 **TelINSUF_FEE_P** ``Fee insufficient.``

-393 **TelNO_DST_PARTIAL** ``Partial payment to create account not allowed.``

-392 **TelCAN_NOT_QUEUE** ``Can not queue at this time.``

-391 **TelCAN_NOT_QUEUE_BALANCE** ``Can not queue at this time: insufficient balance to pay all queued fees.``

-390 **TelCAN_NOT_QUEUE_BLOCKS** ``Can not queue at this time: would block later queued transaction(s).``

-389 **TelCAN_NOT_QUEUE_BLOCKED** ``Can not queue at this time: blocking transaction in queue.``

-388 **TelCAN_NOT_QUEUE_FEE** ``Can not queue at this time: fee insufficient to replace queued transaction.``

-387 **TelCAN_NOT_QUEUE_FULL** ``Can not queue at this time: queue is full.``

-386 **TelINSUF_FUND** ``Fund insufficient.``

#### M Malformed: -299 .. -200
> Transaction corrupt.

-299 **TemMALFORMED** ``Malformed transaction.``

-298 **TemBAD_AMOUNT** ``Can only send non-negative amounts.``

-297 **TemBAD_CURRENCY** ``Malformed: Bad currency.``

-296 **TemBAD_EXPIRATION** ``Malformed: Bad expiration.``

-295 **TemBAD_FEE** ``Invalid fee, [negative] or not NATIVE.``

-294 **TemBAD_ISSUER** ``Malformed: Bad issuer.``

-293 **TemBAD_LIMIT** ``Limits must be non-negative.``

-292 **TemBAD_OFFER** ``Malformed: Bad offer.``

-291 **TemBAD_PATH** ``Malformed: Bad path.``

-290 **TemBAD_PATH_LOOP** ``Malformed: Loop in path.``

-289 **TemBAD_SEND_NATIVE_LIMIT** ``Malformed: Limit quality is not allowed for NATIVE to NATIVE.``

-288 **TemBAD_SEND_NATIVE_MAX** ``Malformed: Send max is not allowed for NATIVE to NATIVE.``

-287 **TemBAD_SEND_NATIVE_NO_DIRECT** ``Malformed: No Skywell direct is not allowed for NATIVE to NATIVE.``

-286 **TemBAD_SEND_NATIVE_PARTIAL** ``Malformed: Partial payment is not allowed for NATIVE to NATIVE.``

-285 **TemBAD_SEND_NATIVE_PATHS** ``Malformed: Paths are not allowed for NATIVE to NATIVE.``

-284 **TemBAD_SEQUENCE** ``Malformed: Sequence is not in the past.``

-283 **TemBAD_SIGNATURE** ``Malformed: Bad signature.``

-282 **TemBAD_SRC_ACCOUNT** ``Malformed: Bad source account.``

-281 **TemBAD_TRANSFER_RATE** ``Malformed: Transfer rate must be >= 1.0``

-280 **TemDST_IS_SRC** ``Destination may not be source.``

-279 **TemDST_NEEDED** ``Destination not specified.``

-278 **TemINVALID** ``The transaction is ill-formed.``

-277 **TemINVALID_FLAG** ``The transaction has an invalid flag.``

-276 **TemREDUNDANT** ``Sends same currency to self.``

-275 **TemSKYWELL_EMPTY** ``PathSet with no paths.``

-274 **TemDISABLED** ``The transaction requires logic that is currently disabled.``

-273 **TemBAD_SIGNER** ``The SignerListSet transaction includes a signer who is invalid. ``

-272 **TemBAD_QUORUM** ``The SignerListSet transaction has an invalid SignerQuorum value. Either the value is not greater than zero, or it is more than the sum of all signers in the list.``

-271 **TemBAD_WEIGHT** ``The SignerListSet transaction includes a SignerWeight that is invalid.``

-270 **TemBAD_TICK_SIZE** ``Malformed: Tick size out of range.``

-269 **TemBAD_PARAMETER** ``Malformed: bad parameter.``

-268 **TemUNCERTAIN** ``In process of determining result. Never returned.``

-267 **TemUNKNOWN** ``The transactions requires logic not implemented yet.``

-250 **TemVALUE_NOT_POSITIVE_INT** ``The value must be positive integer.``

-249 **TemVALUE_NOT_ALL_NUM** ``The value includes non-numeric character.``

-248 **TemINVALID_SECRET** ``The secret is invalid.``

-247 **TemINVALID_FROM_ADDRESS** ``The "from" address is invalid.``

-246 **TemINVALID_TO_ADDRESS** ``The "to" address is invalid.``

-245 **TemTRANSACTION_EXCEED_SIZE_LIMIT** ``This transaction exceeds size limitation.``

-244 **TemFEE_NOT_POSITIVE_INT** ``The fee must be positive integer.``

-243 **TemTOKEN_VALUE_NOT_POSITIVE** ``The value of the token must be positive number.``

-242 **TemUNSUPPORT_TYPE_PARAMETER** ``Unsupported transaction type parameter.``

-241 **TemNAME_USED** ``The name has been used by other token.``

-240 **TemNAME_TOO_LONG** ``The name is too long.``

-239 **TemSYMBOL_INVALID_CHARATER** `` The symbol can only include charater, number, or _.``

-238 **TemSYMBOL_TOO_LONG** ``Symbol is too long.``

-237 **TemSYMBOL_USED** ``The symbol has been used by other token.``

-236 **TemINVALID_DECIMALS** ``The decimals must be positive integer and less than 19.``

-235 **TemTOTAL_SUPPLY_NOT_POSITIVE_INT** ``The total_supply must be positive integer.``

-234 **TemTOTAL_SUPPLY_NOT_NEGATIVE_INT** ``The total_supply must be negative integer.``

-233 **TemNAME_NOT_IDENTICAL_WITH_TOKEN** ``The name is not identical with the token.``

-232 **TemDECIMALS_NOT_IDENTICAL_WITH_TOKEN** ``The decimals is not identical with the token. ``

-231 **TemINVALID_BLOCK_HASH** ``The block hash is invalid.``

-230 **TemINVALID_BLOCK_NUMBER** ``The block number is invalid.``

-229 **TemINVALID_PARAMETER** ``Some parameter name is invalid.``

#### F Failure: -199 .. -100
> Transaction cannot succeed because of ledger state.

-199 **TefFAILURE** ``Failed to apply.``

-198 **TefALREADY** ``The exact transaction was already in this ledger.``

-197 **TefBAD_ADD_AUTH** ``Not authorized to add account.``

-196 **TefBAD_AUTH** ``Transaction's public key is not authorized.``

-195 **TefBAD_CLAIM_ID** ``Malformed: Bad claim id.``

-194 **TefBAD_GEN_AUTH** ``Not authorized to claim generator.``

-193 **TefBAD_LEDGER** ``Ledger in unexpected state.``

-192 **TefCLAIMED** ``Can not claim a previously claimed account.``

-191 **TefCREATED** ``Can't add an already created account.``

-190 **TefDST_TAG_NEEDED** ``Destination tag required.``

-189 **TefEXCEPTION** ``Unexpected program state.``

-188 **TefGEN_IN_USE** ``Generator already in use.``

-187 **TefINTERNAL** ``Internal error.``

-186 **TefNO_AUTH_REQUIRED** ``Auth is not required.``

-185 **TefPAST_SEQ** ``This sequence number has already past.``

-184 **TefWRONG_PRIOR** ``This previous transaction does not match.``

-183 **TefMASTER_DISABLED** ``Master key is disabled.``

-182 **TefMAX_LEDGER** ``Ledger sequence too high.``

-181 **TefBAD_SIGNATURE** ``The transaction was multi-signed, but contained a signature for an address not part of a SignerList associated with the sending account.``

-180 **TefBAD_QUORUM** ``The transaction was multi-signed, but the total weights of all included signatures did not meet the quorum.``

-179 **TefNOT_MULTI_SIGNING** ``The transaction was multi-signed, but the sending account has no SignerList defined.``

-178 **TefBAD_AUTH_MASTER** ``Auth for unclaimed account needs correct master key.``

-177 **TefINVARIANT_FAILED** ``Fee claim violated invariants for the transaction.``

-176 **TefCAN_NOT_ISSUE** ``Can not issue.``

-175 **TefNO_PERMISSION_ISSUE** ``No permission issue.``

-174 **TefSYMBOL_USED** ``Symbol has been used.``

-173 **TefBAD_TRANSACTION** ``Transaction in unexpected state.``

#### R Retry: -99 .. -1
> Prior application of another, possibly non-existant, another transaction could allow this transaction to succeed.

-99 **TerRETRY** ``Retry transaction.``

-98 **TerFUNDS_SPENT** ``Can't set password, password set funds already spent.``

-97 **TerINSUF_FEE_B** ``Account balance can't pay fee.``

-96 **TerNO_ACCOUNT** ``The source account does not exist.``

-95 **TerNO_AUTH** ``Not authorized to hold IOUs.``

-94 **TerNO_LINE** ``No such line.``

-93 **TerOWNERS** ``Non-zero owner count.``

-92 **TerPRE_SEQ** ``Missing/inapplicable prior transaction.``

-91 **TerLAST** ``Process last.``

-90 **TerNO_SKYWELL** ``Path does not permit rippling.``

-89 **TerQUEUED** ``Held until escalated fee drops.``

-88 **TerTIMEOUT** ``No replies received and timeout.``

-87 **TerNO_CURRENCY** ``The currency does not exist.``