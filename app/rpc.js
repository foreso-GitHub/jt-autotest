var querystring = require('querystring');
var request = require('request');

const PARSER_TEXT_JSON = "application/json";
const PARSER_NAME_JSON = "json";
const PARSER_NAME_URLENCODED = "urlencoded";
const PARSER_TEXT_URLENCODED = "application/x-www-form-urlencoded";
// const RPC_URL = "http://139.198.177.59:9545";
const RPC_URL = "http://139.198.191.254:7545/v1/jsonrpc";

var rpc = module.exports = {
    getBlockNumber: function(){
        var params = [];
        // params.push(0);
        rpc.RPC_POST("jt_blockNumber", params, function(error, data){
            var result = {};
            if(data != null && JSON.stringify(data) != '{}'){
                result = data;
                console.log("result: ", result);
            }
            console.log("error: ", error);
        });
    },



    //region send http request

    send_request_get: function(url, callback){
        utility.sendRequest(url, "GET", PARSER_TEXT_JSON, null, null, null, callback);
    },

    send_request_post: function(url, data, callback){
        utility.sendRequest(url, "POST", PARSER_TEXT_JSON, data, null, null, callback);
    },

    sendRequest: function(url, method, parser, rawData, username, password, callback){
        //default is JSON
        var data = JSON.stringify(rawData);
        var parser_text = PARSER_TEXT_JSON;

        if(parser == PARSER_NAME_URLENCODED){
            var data = querystring.stringify(rawData);
            var parser_text = PARSER_TEXT_URLENCODED;
        }

        var options = {
            url: url,
            method: method,
            headers:{
                "content-type": parser_text,
                "Accept": parser_text,  //add by foreso on 20190327, for moac subchain rpc.
            },
            // body: data
        };

        if(rawData){
            options.body = data;
        }

        if(username && password){
            options.headers.Authorization = "Basic " + new Buffer(username + ":" + password).toString("base64");
        }

        request(options, function(error, response, body) {
            if(error){
                callback(error);
            }
            else if(response.statusCode != 200){
                callback(response);
            }
            else{
                try {
                    callback(null, JSON.parse(body));
                } catch(e) {
                    callback(null, body);
                }
                // callback(null, body);

            }
        });
    },

    RPC_POST: function(method, params, callback){
        var request_method = "POST",
            // username = config.get("btcf.username"),
            // password = config.get("btcf.password"),
            url = RPC_URL,
            parser_text = PARSER_TEXT_JSON;
        var data = {};
        data.jsonrpc = "2.0";
        data.id = 1;
        data.method = method;
        data.params = params;

        rpc.sendRequest(url, request_method, parser_text, data, null, null, function(error, res){
            var result = {};
            if(res){
                result = JSON.parse(res).result;
            }
            callback(error, result);
        });
    },
    //endregion
}
