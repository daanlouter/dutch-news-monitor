var cheerio = require('cheerio');
var rp = require('request-promise');
var fs = require('fs');
var data = [];

var urls = [
  {"name":"nrc","url":"https://www.nrc.nl"},
  {"name":"volkskrant","url":"http://www.volkskrant.nl"},
  {"name":"ad","url":"http://www.ad.nl/accept?url=http://www.ad.nl/","cookie":"nl_cookiewall_version=1"},
  {"name":"telegraaf","url":"http://www.telegraaf.nl"},
  {"name":"nos","url":"http://www.nos.nl"},
  {"name":"nu","url":"http://www.nu.nl"},
  {"name":"rtl","url":"http://www.rtlnieuws.nl"}
]

var scrapePage = function(){
    return new Promise(function(resolve,reject){
        var requests = urls.map(function(u){
            return rp({
                uri: u.url,
                headers : {
                    "Cookie": u.cookie ? u.cookie : ""
                }
            })
        })

        Promise.all(requests).then(function(e,i){
            var results = e.map(function(html,i){
                return {
                    "src": urls[i].name,
                    "html": html,
                    "time": Date.now()
                }
            })
            resolve(results);
        }).catch(function(e){
            reject(e);
        })
    })
}

scrapePage().then(function(results){
    var promises = results.map(function(r){return analyseArticles(r.html,r.src)})
    Promise.all(promises).then(function(e){
        e.forEach(function(articles,i){
            results[i].articles = articles
        })

        fs.writeFile('data.json',JSON.stringify(results,null,2),function(){
            console.log('written data - finished')
        })
    }).catch(function(e){
        console.log(e)
    })
})

function analyseArticles(body,src){
    return new Promise(function(resolve,reject){
        var $ = cheerio.load(body);
        var articleEls;
        var articleArray = [];

        if(src === "nrc"){
            articleEls = $('.nmt-item');
            articleEls.each(function(i,item){
                articleArray.push({
                    "headline": $(item).find('h3').text(),
                    "standfirst": $(item).find('.nmt-item__teaser').text(),
                    "more" : [$(item).find('h6').text()]
                })
            })
        }else if(src === "ad"){
            articleEls = $('.tile article, .breaking-news article')
            articleEls.each(function(i,item){
                articleArray.push({
                    "headline": $(item).find('.ankeiler__title').text(),
                    "standfirst": $(item).find('.nmt-item__teaser').html(),
                    "more" : [$(item).find('h6').html()]
                })
            })
        }else if(src === "volkskrant"){
            articleEls = $('article.ankeiler')
            articleEls.each(function(i,item){
                articleArray.push({
                    "headline": $(item).find('.ankeiler__title').text(),
                    "standfirst": $(item).find('.ankeiler__body-text').text(),
                    "more" : ""
                })
            })
        }else if(src === "nos"){
            articleEls = $('.list-featured__item, .topstory, .list-latest__item, .rsNavItem')
            articleEls.each(function(i,item){
                articleArray.push({
                    "headline": $(item).find('.link-hover').text() +  " " + $(item).find('.slider-thumb-title').text() +  " " + $(item).find('.topstory_mainarticle_title').text(),
                    "standfirst": $(item).find('.list-featured__text').text(),
                    "more" : ""
                })
            })
        }else if(src === "telegraaf"){
            articleEls = $('.artikel, .snelnieuws_list .item')
            articleEls.each(function(i,item){
                articleArray.push({
                    "headline": $(item).find('.snelnieuws-tekst').text() +  " " + $(item).find('h2 a').text(),
                    "standfirst": $(item).find('.zaktxt a').text(),
                    "more" : ""
                })
            })
        }else if(src === "nu"){
            articleEls = $('.articlelist ul li')
            articleEls.each(function(i,item){
                articleArray.push({
                    "headline": $(item).find('.title').text(),
                    "standfirst": $(item).find('.caption').text(),
                    "more" : ""
                })
            })
        }else if(src === "rtl"){
            articleEls = $('.sidebarList article, .topNewsHeader article, #main article')
            articleEls.each(function(i,item){
                articleArray.push({
                    "headline": $(item).find('h5 a').text() + " " + $(item).find('h1 a').text(),
                    "standfirst": $(item).find('.paragraph').text(),
                    "more" : ""
                })
            })
        }

        if(articleArray.length > 0){
          resolve(articleArray)
        }else{
            console.log(src)
          reject('array is empty')
        }
    })
}
