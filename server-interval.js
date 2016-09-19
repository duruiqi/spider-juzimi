/**
 * Created by huangzhangjiang@isesol.com on 2016/9/16.
 */
var http = require("http");
var superagent = require("superagent");
var cheerio = require("cheerio");
var eventproxy = require("eventproxy");
var fs = require("fs");

var ep = new eventproxy();
var writerArray = ["张爱玲", "林徽因"];
var siteUrl = "http://www.juzimi.com/writer/";

function start() {
    function onRequest(req, res) {
        console.log("started ...");
        res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
        var proverbString = "";
        var maxPage = 50;
        var index = 0;
        var timeInterval = 500;
        writerArray.forEach(function (writer) {
            for(var page = 0;page < maxPage;page++){
                var requestUrl = encodeURI(siteUrl + writer + "?page=" + page);
                getAndWrite(requestUrl, index++);
            }
            setTimeout(function () {
                fs.writeFile('document/'+ writer +".txt", proverbString, function (err) {
                    if(err) {
                        return console.error(err);
                        console.log("数据保存成功！");
                    }
                });
            },maxPage*timeInterval)
        });

        function getAndWrite(requestUrl, index) {
            setTimeout(function () {
                var page = index + 1;
                res.write("<p>Page:"+ page + "</p>");
                superagent.get(requestUrl)
                    .set('User-Agent', "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36")
                    .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
                    .set('Accept-Encoding', 'gzip, deflate, sdch')
                    .set('Cache-Control', 'no-cache')
                    .set('Connection', 'keep-alive')
                    .set('Upgrade-Insecure-Requests', 1)
                    .end(function (err, sres) {
                        if(err){
                            return false;
                        }
                        var $ = cheerio.load(sres.text);
                        var juziObject = $(".view-content .xlistju");
                        for(var j=0;j < juziObject.length;j++){
                            var juziTotal = "";
                            var juziArray = juziObject[j].children;
                            for(var k in juziArray){
                                var juzi = juziArray[k];
                                juziTotal += (juzi.data || "").replace("\r","").replace(/\s/g,"");
                            }
                            res.write("<p>"+ juziTotal + "</p>");
                            proverbString += juziTotal + "\r";
                        }
                    });
            },index*timeInterval);
        }
    }

    http.createServer(onRequest).listen(5000);
}

exports.start = start;
