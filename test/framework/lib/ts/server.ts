import querystring = require('querystring')
import request = require('request')
import log4js = require('log4js')
log4js.configure('./log4js.json')
let logger: any = log4js.getLogger('default');

const PARSER_TEXT_JSON = 'application/json'
const PARSER_NAME_URLENCODED = 'urlencoded'
const PARSER_TEXT_URLENCODED = 'application/x-www-form-urlencoded'

class server {

    public url: string = ""
    public id: number = 1

    constructor() {

    }

    public sendRequest(url: string = "", method: string = "", parser: string = PARSER_TEXT_JSON,
                       rawData: object = {}, username: string = "", password: string = ""){

    }
}

// function sayHello(person: string) {
//     return 'Hello, ' + person;
// }
//
// let user = 'Tom';
// console.log(sayHello(user));