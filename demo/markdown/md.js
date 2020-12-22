const commonmark = require('commonmark')
const fs = require('fs')
let HashMap = require('hashmap')
const MarkdownTypes = {
    text: "text",
    softbreak: "softbreak",
    linebreak: "linebreak",
    emph: "emph",
    strong: "strong",
    html_inline: "html_inline",
    link: "link",
    image: "image",
    text: "text",
    code: "code",
    text: "text",
    document: "document",
    paragraph: "paragraph",
    block_quote: "block_quote",
    item: "item",
    list: "list",
    heading: "heading",
    code_block: "code_block",
    html_block: "html_block",
    thematic_break: "thematic_break",
}

// parse_demo()
run()

//region demo

async function run(){
    let content = await load("E:\\2. work\\井系\\3. 链景\\井通新链\\自动测试\\codes\\ipfslib.wiki\\chain错误信息整理.md", 'utf8',)
    let doc = parse(content)
    // console.log(JSON.stringify(doc))
    printDoc(doc)
    let map = doc2map(doc)
    // let error = map.get(map.keys()[0])

    let key = 1000
    let aaa = map.has(key)
    printError(map.get(key))
}

function run1(){
    let content = "#### S Success\n" +
        "> Success\n" +
        "\n" +
        "0 **TesSUCCESS** ``The transaction was applied.``\n" +
        "\n" +
        "#### C Claim: 100 .. 159\n" +
        "> Success, but does not achieve optimal result.\n" +
        "\n" +
        "100 **TecCLAIM** ``Fee claimed. Sequence used. No action.``\n" +
        "\n" +
        "101 **TecPATH_PARTIAL** ``Path could not send full amount.``"
    let doc = parse(content)
    // console.log(JSON.stringify(doc))
    printDoc(doc)
}

function run2(){
    let content = '#### S Success\n' +
        '> Success\n' +
        '\n' +
        '0 **TesSUCCESS** ``The transaction was applied.``\n' +
        '\n' +
        '#### D Defined\n' +
        '> Defined\n' +
        '\n' +
        '1000 **TedCOMPOUND** ``The compound error.``\n' +
        '\n' +
        '#### C Claim: 100 .. 159\n' +
        '> Success, but does not achieve optimal result.\n' +
        '\n' +
        '100 **TecCLAIM** ``Fee claimed. Sequence used. No action.``\n' +
        '\n' +
        '101 **TecPATH_PARTIAL** ``Path could not send full amount.``\n' +
        '\n' +
        '102 **TecUNFUNDED_ADD** ``Insufficient NATIVE balance for WalletAdd.``\n' +
        '\n' +
        '103 **TecUNFUNDED_OFFER** ``Insufficient balance to fund created offer. ``\n' +
        '\n' +
        '104 **TecUNFUNDED_PAYMENT** ``Insufficient NATIVE balance to send.``\n' +
        '\n' +
        '105 **TecFAILED_PROCESSING** ``Failed to correctly process transaction.``  \n' +
        '\n' +
        '121 **TecDIR_FULL** ``Can not add entry to full directory.``\n' +
        '\n' +
        '122 **TecINSUF_RESERVE_LINE** ``Insufficient reserve to add trust line.``\n' +
        '\n' +
        '123 **TecINSUF_RESERVE_OFFER** ``Insufficient reserve to create offer.``\n' +
        '\n' +
        '124 **TecNO_DST** ``Destination does not exist. Send NATIVE to create it.``\n' +
        '\n' +
        '125 **TecNO_DST_INSUF_NATIVE** ``Destination does not exist. Too little NATIVE sent to create it.``\n' +
        '\n' +
        '126 **TecNO_LINE_INSUF_RESERVE** ``No such line. Too little reserve to create it.``\n' +
        '\n' +
        '127 **TecNO_LINE_REDUNDANT** ``Can\'t set non-existant line to default.``\n' +
        '\n' +
        '128 **TecPATH_DRY** ``Path could not send partial amount.``\n' +
        '\n' +
        '129 **TecUNFUNDED** ``One of _ADD, _OFFER, or _SEND. Deprecated.``\n' +
        '\n' +
        '130 **TecNO_ALTERNATIVE_KEY** ``The operation would remove the ability to sign transactions with the account.``\n' +
        '\n' +
        '131 **TecNO_REGULAR_KEY** ``Regular key is not set.``\n' +
        '\n' +
        '132 **TecOWNERS** ``Non-zero owner count.``\n' +
        '\n' +
        '133 **TecNO_ISSUER** ``Issuer account does not exist.``\n' +
        '\n' +
        '134 **TecNO_AUTH** ``Not authorized to hold asset.``\n' +
        '\n' +
        '135 **TecNO_LINE** ``No such line.``\n' +
        '\n' +
        '136 **TecINSUFF_FEE** ``Insufficient balance to pay fee.``\n' +
        '\n' +
        '137 **TecFROZEN** ``Asset is frozen.``\n' +
        '\n' +
        '138 **TecNO_TARGET** ``Target account does not exist.``\n' +
        '\n' +
        '139 **TecNO_PERMISSION** ``No permission to perform requested operation.``\n' +
        '\n' +
        '140 **TecNO_ENTRY** ``No matching entry found.``\n' +
        '\n' +
        '141 **TecINSUFFICIENT_RESERVE** ``Insufficient reserve to complete requested operation.``\n' +
        '\n' +
        '142 **TecNEED_MASTER_KEY** ``The operation requires the use of the Master Key.``\n' +
        '\n' +
        '143 **TecDST_TAG_NEEDED** ``A destination tag is required.``\n' +
        '\n' +
        '144 **TecINTERNAL** ``An internal error has occurred during processing.``\n' +
        '\n' +
        '145 **TecOVERSIZE** ``Object exceeded serialization limits.``\n' +
        '\n' +
        '146 **TecCRYPTOCONDITION_ERROR** ``Malformed, invalid, or mismatched conditional or fulfillment.``\n' +
        '\n' +
        '147 **TecINVARIANT_FAILED** ``One or more invariants for the transaction were not satisfied.``\n' +
        '\n' +
        '150 **TecWRONG_SECRET_FOR_FROM_ADDRESS** ``The secret doesn\'t match the "from" address.``\n' +
        '\n' +
        '151 **TecINSUFF_BALANCE** ``The balance is not enough to complete the transaction.``\n' +
        '\n' +
        '152 **TecINSUFF_TOKEN_BALANCE** ``The balance of the token is not enough to complete the transaction.``\n' +
        '\n' +
        '153 **TecTOKEN_NOT_EXIST** ``The token symbol in "value" parameter doesn\'t exist.``\n' +
        '\n' +
        '154 **TecTOKEN_NOT_MINEABLE** ``The token is not mineable.``\n' +
        '\n' +
        '155 **TecTOKEN_NOT_BURNABLE** ``The token is not burnable.``\n' +
        '\n' +
        '156 **TecBLOCK_HASH_NOT_EXIST** ``The block hash doesn\'t exist.``\n' +
        '\n' +
        '157 **TecBLOCK_NUMBER_NOT_EXIST** ``The block number doesn\'t exist.``\n' +
        '\n' +
        '\t\n' +
        '#### L Local error: -399 .. -300\n' +
        '> Transaction errors, only valid during non-consensus processing.\n' +
        '\n' +
        '-399 **TelLOCAL_ERROR** ``Local failure.``\n' +
        '\n' +
        '-398 **TelBAD_DOMAIN** ``Domain too long.``\n' +
        '\n' +
        '-397 **TelBAD_PATH_COUNT** ``Malformed: Too many paths.``\n' +
        '\n' +
        '-396 **TelBAD_PUBLIC_KEY** ``Public key too long.``\n' +
        '\n' +
        '-395 **TelFAILED_PROCESSING** ``Failed to correctly process transaction.``\n' +
        '\n' +
        '-394 **TelINSUF_FEE_P** ``Fee insufficient.``\n' +
        '\n' +
        '-393 **TelNO_DST_PARTIAL** ``Partial payment to create account not allowed.``\n' +
        '\n' +
        '-392 **TelCAN_NOT_QUEUE** ``Can not queue at this time.``\n' +
        '\n' +
        '-391 **TelCAN_NOT_QUEUE_BALANCE** ``Can not queue at this time: insufficient balance to pay all queued fees.``\n' +
        '\n' +
        '-390 **TelCAN_NOT_QUEUE_BLOCKS** ``Can not queue at this time: would block later queued transaction(s).``\n' +
        '\n' +
        '-389 **TelCAN_NOT_QUEUE_BLOCKED** ``Can not queue at this time: blocking transaction in queue.``\n' +
        '\n' +
        '-388 **TelCAN_NOT_QUEUE_FEE** ``Can not queue at this time: fee insufficient to replace queued transaction.``\n' +
        '\n' +
        '-387 **TelCAN_NOT_QUEUE_FULL** ``Can not queue at this time: queue is full.``\n' +
        '\n' +
        '-386 **TelINSUF_FUND** ``Fund insufficient.``\n' +
        '\n' +
        '#### M Malformed: -299 .. -200\n' +
        '> Transaction corrupt.\n' +
        '\n' +
        '-299 **TemMALFORMED** ``Malformed transaction.``\n' +
        '\n' +
        '-298 **TemBAD_AMOUNT** ``Can only send non-negative amounts.``\n' +
        '\n' +
        '-297 **TemBAD_CURRENCY** ``Malformed: Bad currency.``\n' +
        '\n' +
        '-296 **TemBAD_EXPIRATION** ``Malformed: Bad expiration.``\n' +
        '\n' +
        '-295 **TemBAD_FEE** ``Invalid fee, [negative] or not NATIVE.``\n' +
        '\n' +
        '-294 **TemBAD_ISSUER** ``Malformed: Bad issuer.``\n' +
        '\n' +
        '-293 **TemBAD_LIMIT** ``Limits must be non-negative.``\n' +
        '\n' +
        '-292 **TemBAD_OFFER** ``Malformed: Bad offer.``\n' +
        '\n' +
        '-291 **TemBAD_PATH** ``Malformed: Bad path.``\n' +
        '\n' +
        '-290 **TemBAD_PATH_LOOP** ``Malformed: Loop in path.``\n' +
        '\n' +
        '-289 **TemBAD_SEND_NATIVE_LIMIT** ``Malformed: Limit quality is not allowed for NATIVE to NATIVE.``\n' +
        '\n' +
        '-288 **TemBAD_SEND_NATIVE_MAX** ``Malformed: Send max is not allowed for NATIVE to NATIVE.``\n' +
        '\n' +
        '-287 **TemBAD_SEND_NATIVE_NO_DIRECT** ``Malformed: No Skywell direct is not allowed for NATIVE to NATIVE.``\n' +
        '\n' +
        '-286 **TemBAD_SEND_NATIVE_PARTIAL** ``Malformed: Partial payment is not allowed for NATIVE to NATIVE.``\n' +
        '\n' +
        '-285 **TemBAD_SEND_NATIVE_PATHS** ``Malformed: Paths are not allowed for NATIVE to NATIVE.``\n' +
        '\n' +
        '-284 **TemBAD_SEQUENCE** ``Malformed: Sequence is not in the past.``\n' +
        '\n' +
        '-283 **TemBAD_SIGNATURE** ``Malformed: Bad signature.``\n' +
        '\n' +
        '-282 **TemBAD_SRC_ACCOUNT** ``Malformed: Bad source account.``\n' +
        '\n' +
        '-281 **TemBAD_TRANSFER_RATE** ``Malformed: Transfer rate must be >= 1.0``\n' +
        '\n' +
        '-280 **TemDST_IS_SRC** ``Destination may not be source.``\n' +
        '\n' +
        '-279 **TemDST_NEEDED** ``Destination not specified.``\n' +
        '\n' +
        '-278 **TemINVALID** ``The transaction is ill-formed.``\n' +
        '\n' +
        '-277 **TemINVALID_FLAG** ``The transaction has an invalid flag.``\n' +
        '\n' +
        '-276 **TemREDUNDANT** ``Sends same currency to self.``\n' +
        '\n' +
        '-275 **TemSKYWELL_EMPTY** ``PathSet with no paths.``\n' +
        '\n' +
        '-274 **TemDISABLED** ``The transaction requires logic that is currently disabled.``\n' +
        '\n' +
        '-273 **TemBAD_SIGNER** ``The SignerListSet transaction includes a signer who is invalid. ``\n' +
        '\n' +
        '-272 **TemBAD_QUORUM** ``The SignerListSet transaction has an invalid SignerQuorum value. Either the value is not greater than zero, or it is more than the sum of all signers in the list.``\n' +
        '\n' +
        '-271 **TemBAD_WEIGHT** ``The SignerListSet transaction includes a SignerWeight that is invalid.``\n' +
        '\n' +
        '-270 **TemBAD_TICK_SIZE** ``Malformed: Tick size out of range.``\n' +
        '\n' +
        '-269 **TemBAD_PARAMETER** ``Malformed: bad parameter.``\n' +
        '\n' +
        '-268 **TemUNCERTAIN** ``In process of determining result. Never returned.``\n' +
        '\n' +
        '-267 **TemUNKNOWN** ``The transactions requires logic not implemented yet.``\n' +
        '\n' +
        '-250 **TemVALUE_NOT_POSITIVE_INT** ``The value must be positive integer.``\n' +
        '\n' +
        '-249 **TemVALUE_NOT_ALL_NUM** ``The value includes non-numeric character.``\n' +
        '\n' +
        '-248 **TemINVALID_SECRET** ``The secret is invalid.``\n' +
        '\n' +
        '-247 **TemINVALID_FROM_ADDRESS** ``The "from" address is invalid.``\n' +
        '\n' +
        '-246 **TemINVALID_TO_ADDRESS** ``The "to" address is invalid.``\n' +
        '\n' +
        '-245 **TemTRANSACTION_EXCEED_SIZE_LIMIT** ``This transaction exceeds size limitation.``\n' +
        '\n' +
        '-244 **TemFEE_NOT_POSITIVE_INT** ``The fee must be positive integer.``\n' +
        '\n' +
        '-243 **TemTOKEN_VALUE_NOT_POSITIVE** ``The value of the token must be positive number.``\n' +
        '\n' +
        '-242 **TemUNSUPPORT_TYPE_PARAMETER** ``Unsupported transaction type parameter.``\n' +
        '\n' +
        '-241 **TemNAME_USED** ``The name has been used by other token.``\n' +
        '\n' +
        '-240 **TemNAME_TOO_LONG** ``The name is too long.``\n' +
        '\n' +
        '-239 **TemSYMBOL_INVALID_CHARATER** `` The symbol can only include charater, number, or _.``\n' +
        '\n' +
        '-238 **TemSYMBOL_TOO_LONG** ``Symbol is too long.``\n' +
        '\n' +
        '-237 **TemSYMBOL_USED** ``The symbol has been used by other token.``\n' +
        '\n' +
        '-236 **TemINVALID_DECIMALS** ``The decimals must be positive integer and less than 19.``\n' +
        '\n' +
        '-235 **TemTOTAL_SUPPLY_NOT_POSITIVE_INT** ``The total_supply must be positive integer.``\n' +
        '\n' +
        '-234 **TemTOTAL_SUPPLY_NOT_NEGATIVE_INT** ``The total_supply must be negative integer.``\n' +
        '\n' +
        '-233 **TemNAME_NOT_IDENTICAL_WITH_TOKEN** ``The name is not identical with the token.``\n' +
        '\n' +
        '-232 **TemDECIMALS_NOT_IDENTICAL_WITH_TOKEN** ``The decimals is not identical with the token. ``\n' +
        '\n' +
        '-231 **TemINVALID_BLOCK_HASH** ``The block hash is invalid.``\n' +
        '\n' +
        '-230 **TemINVALID_BLOCK_NUMBER** ``The block number is invalid.``\n' +
        '\n' +
        '-229 **TemINVALID_PARAMETER** ``Some parameter name is invalid.``\n' +
        '\n' +
        '#### F Failure: -199 .. -100\n' +
        '> Transaction cannot succeed because of ledger state.\n' +
        '\n' +
        '-199 **TefFAILURE** ``Failed to apply.``\n' +
        '\n' +
        '-198 **TefALREADY** ``The exact transaction was already in this ledger.``\n' +
        '\n' +
        '-197 **TefBAD_ADD_AUTH** ``Not authorized to add account.``\n' +
        '\n' +
        '-196 **TefBAD_AUTH** ``Transaction\'s public key is not authorized.``\n' +
        '\n' +
        '-195 **TefBAD_CLAIM_ID** ``Malformed: Bad claim id.``\n' +
        '\n' +
        '-194 **TefBAD_GEN_AUTH** ``Not authorized to claim generator.``\n' +
        '\n' +
        '-193 **TefBAD_LEDGER** ``Ledger in unexpected state.``\n' +
        '\n' +
        '-192 **TefCLAIMED** ``Can not claim a previously claimed account.``\n' +
        '\n' +
        '-191 **TefCREATED** ``Can\'t add an already created account.``\n' +
        '\n' +
        '-190 **TefDST_TAG_NEEDED** ``Destination tag required.``\n' +
        '\n' +
        '-189 **TefEXCEPTION** ``Unexpected program state.``\n' +
        '\n' +
        '-188 **TefGEN_IN_USE** ``Generator already in use.``\n' +
        '\n' +
        '-187 **TefINTERNAL** ``Internal error.``\n' +
        '\n' +
        '-186 **TefNO_AUTH_REQUIRED** ``Auth is not required.``\n' +
        '\n' +
        '-185 **TefPAST_SEQ** ``This sequence number has already past.``\n' +
        '\n' +
        '-184 **TefWRONG_PRIOR** ``This previous transaction does not match.``\n' +
        '\n' +
        '-183 **TefMASTER_DISABLED** ``Master key is disabled.``\n' +
        '\n' +
        '-182 **TefMAX_LEDGER** ``Ledger sequence too high.``\n' +
        '\n' +
        '-181 **TefBAD_SIGNATURE** ``The transaction was multi-signed, but contained a signature for an address not part of a SignerList associated with the sending account.``\n' +
        '\n' +
        '-180 **TefBAD_QUORUM** ``The transaction was multi-signed, but the total weights of all included signatures did not meet the quorum.``\n' +
        '\n' +
        '-179 **TefNOT_MULTI_SIGNING** ``The transaction was multi-signed, but the sending account has no SignerList defined.``\n' +
        '\n' +
        '-178 **TefBAD_AUTH_MASTER** ``Auth for unclaimed account needs correct master key.``\n' +
        '\n' +
        '-177 **TefINVARIANT_FAILED** ``Fee claim violated invariants for the transaction.``\n' +
        '\n' +
        '-176 **TefCAN_NOT_ISSUE** ``Can not issue.``\n' +
        '\n' +
        '-175 **TefNO_PERMISSION_ISSUE** ``No permission issue.``\n' +
        '\n' +
        '-174 **TefSYMBOL_USED** ``Symbol has been used.``\n' +
        '\n' +
        '-173 **TefBAD_TRANSACTION** ``Transaction in unexpected state.``\n' +
        '\n' +
        '#### R Retry: -99 .. -1\n' +
        '> Prior application of another, possibly non-existant, another transaction could allow this transaction to succeed.\n' +
        '\n' +
        '-99 **TerRETRY** ``Retry transaction.``\n' +
        '\n' +
        '-98 **TerFUNDS_SPENT** ``Can\'t set password, password set funds already spent.``\n' +
        '\n' +
        '-97 **TerINSUF_FEE_B** ``Account balance can\'t pay fee.``\n' +
        '\n' +
        '-96 **TerNO_ACCOUNT** ``The source account does not exist.``\n' +
        '\n' +
        '-95 **TerNO_AUTH** ``Not authorized to hold IOUs.``\n' +
        '\n' +
        '-94 **TerNO_LINE** ``No such line.``\n' +
        '\n' +
        '-93 **TerOWNERS** ``Non-zero owner count.``\n' +
        '\n' +
        '-92 **TerPRE_SEQ** ``Missing/inapplicable prior transaction.``\n' +
        '\n' +
        '-91 **TerLAST** ``Process last.``\n' +
        '\n' +
        '-90 **TerNO_SKYWELL** ``Path does not permit rippling.``\n' +
        '\n' +
        '-89 **TerQUEUED** ``Held until escalated fee drops.``\n' +
        '\n' +
        '-88 **TerTIMEOUT** ``No replies received and timeout.``\n' +
        '\n' +
        '-87 **TerNO_CURRENCY** ``The currency does not exist.``'
    let doc = parse(content)
    printDoc(doc)
}

function parse_demo(){
    let reader = new commonmark.Parser()
    let writer = new commonmark.HtmlRenderer()
    let content = "#### S Success\n" +
        "> Success\n" +
        "\n" +
        "0 **TesSUCCESS** ``The transaction was applied.``\n" +
        "\n" +
        "#### C Claim: 100 .. 159\n" +
        "> Success, but does not achieve optimal result.\n" +
        "\n" +
        "100 **TecCLAIM** ``Fee claimed. Sequence used. No action.``\n" +
        "\n" +
        "101 **TecPATH_PARTIAL** ``Path could not send full amount.``"

    let parsed = reader.parse(content) // parsed is a 'Node' tree

    var walker = parsed.walker();
    var event, node;

    while ((event = walker.next())) {
        node = event.node
        console.log('[' + node.type + ']: ' + node.sourcepos)
        if (event.entering && (node.type === 'text' || node.type === 'code')) {
            // node.literal = node.literal.toUpperCase()
            console.log("literal: " + node.literal)
        }
    }

// transform parsed if you like...
    console.log('')
    let result = writer.render(parsed) // result is a String
    console.log(result)
}

//endregion

//region parse wiki

function parse(content){
    let reader = new commonmark.Parser()
    let tree = reader.parse(content) // tree is a 'Node' tree
    let walker = tree.walker()
    let event, node, currentMark, lastNodeType, txt, category, error
    let marks = []
    let doc = []

    while ((event = walker.next())) {
        node = event.node

        if(node.type === MarkdownTypes.document
            || node.type === MarkdownTypes.heading
            || node.type === MarkdownTypes.block_quote
            || node.type === MarkdownTypes.paragraph
            || node.type === MarkdownTypes.strong
        ){
            if(getLastMark(marks) === node.type){
                marks.pop()
                currentMark = getLastMark(marks)
            }
            else{
                marks.push(node.type)
                currentMark = node.type
            }
        }
        else if(node.type === MarkdownTypes.text
            || node.type === MarkdownTypes.code
        ){
            if(!ifAllSpace(node.literal)){
                if(lastNodeType === node.type){
                    txt += node.literal
                }
                else{
                    txt = node.literal
                }

                if(node.type === MarkdownTypes.text && currentMark === MarkdownTypes.heading){  //category name
                    category = newCategory(txt,)
                    doc.push(category)
                }
                else if(node.type === MarkdownTypes.text && currentMark === MarkdownTypes.paragraph){
                    if(getLastMark(marks, 2) === MarkdownTypes.block_quote){//the mark in outer level
                        //category desc
                        category.desc = txt
                    }
                    else{
                        //error status
                        let status = Number(txt)
                        error = newError(status, null, null, category.name)
                        category.errors.push(error)
                    }
                }
                else if(node.type === MarkdownTypes.text && currentMark === MarkdownTypes.strong){  //error type
                    error.type = txt
                }
                else if(node.type === MarkdownTypes.code){  //error desc
                    error.desc = txt
                }
                else{
                    console.log('=== unknown mark: ' + currentMark + ', type: ' +node.type + ' @ ' + node.sourcepos)
                }
            }
            else{
                // console.log('=== all space: ' + node.literal + ' @ ' + node.sourcepos)
            }
        }
        else{
            console.log('=== unknown type: ' + node.type + ' @ ' + node.sourcepos)
        }
        lastNodeType = node.type
    }

    return doc
}

function doc2map(doc){
    let map = new HashMap()
    for(let i = 0; i < doc.length; i++){
        let errors = doc[i].errors
        for(let j = 0; j < errors.length; j++){
            let error = errors[j]
            map.set(error.status, error)
        }
    }
    return map
}

//endregion

//region utility

function getLastMark(marks, offset){
    if(!offset){
        offset = 1
    }
    return marks[marks.length - offset]
}

function newError(status, type, desc, category){
    let error = {}
    error.status = status
    error.type = type
    error.desc = desc
    error.category = category
    return error
}

function newCategory(name, desc){
    let category = {}
    category.name = name
    category.desc = desc
    category.errors = []
    return category
}

function getObject(object){
    if(object){
        return object
    }
    else{
        return {}
    }
}

function ifAllSpace(literal){
    for(let i = 0; i < literal.length; i++){
        if(literal[i] != ' '){
            return false
        }
    }
    return true
}

function load(file){
    return new Promise((resolve, reject) => {
        fs.readFile( file, 'utf8', function (err, data) {
            if (err) {
                throw err
            }
            resolve(data)
        })
    })
}

//endregion

//region print
function printDoc(doc){
    printArray(doc, printCategory)
}

function printCategory(category){
    console.log('category name: ' + category.name)
    console.log('category desc: ' + category.desc)
    printArray(category.errors, printError)
}

function printError(error){
    console.log(JSON.stringify(error))
}

function printArray(array, printFunc){
    for(let i = 0; i < array.length; i++){
        printFunc(array[i])
    }
}
//endregion
