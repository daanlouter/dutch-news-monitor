var fs = require('fs');
var express = require('express');
var Mustache = require('mustache');
var template = fs.readFileSync('index.html','utf8')
var data = fs.readFileSync('data.json','utf8')
var app = express();

var queries = {
  "pvv" : ["geert wilders","pvv","wilders","partij voor de vrijheid"],
  "pvda": ["pvda","asscher","lodewijk asscher","diederik samson","partij van de arbeid"],
  "vvd": ["rutte",],
  "peilingen": ["peilingen","peiling","maurice de hond", "de hond"],
  "cda": ["cda","buma","sybrand buma"],
  "denk": ["denk","sylvana simons","simons","sylvana","kuzu","Öztürk","Ozturk"],
  "d66": ["d66","alexander pechtold","pechtold"],
  "cu": ["christenunie", "christen unie","cu","gert-jan segers","gert jan segers","segers"],
  "gl": ["groenlinks","groen links","gl","jesse klaver","klaver","jesse"],
  "pvdd": ["pvdd","partij voor de dieren","marianne thieme","thieme"],
  "sgp": ["sgp","kees van der staaij","van der staaij"],
  "sp": ["sp","socialistische partij","emile roemer","roemer"],
  "vnl": ["jan roos","roos","vnl","voornederland","voor nederland"]
}

var counts = {};

JSON.parse(data).forEach(function(src){
    var a = {};

    for(var query in queries){
        var queryCount = 0;
        src.articles.forEach(function(text){

            var str = text.headline + " " + text.standfirst + text.more.toString();
                str = str.toLowerCase();

                if(src.src==="nrc"){
                    console.log(str)
                }
            var found = false;

            queries[query].forEach(function(q){
                if(str.indexOf(" " + q + " ") > -1 && !found){
                    found = true;
                    queryCount++;
                }
            })
        });
        a[query] = queryCount;
    }

    console.log(src.src,a)
})

app.get('/',function(req,res){
    template = fs.readFileSync('index.html','utf8');
    var articles = JSON.parse(data).map(function(e){
        e.html = "";
        return e;
    })
    var html = Mustache.render(template,{data:JSON.stringify(articles)})

    res.send(html)
})


app.listen('1991',function(){
    console.log('oi')
})
// console.log(data);
