// load the things we need
var express = require('express');

const fs = require ('fs');

var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

var articles = {

}

var highlighted_article;

fs.readdir("./stories", function (err, files) {
    
    // CREATES AN OBJECT FOR EACH PERSON IN THE PEOPLE DIRECTORY
    // THEN IT CREATES A PAGE FOR THEM, AND ADDS THEM TO THE INDEX
    files.forEach(function (dir, index) {

        fs.readdir(`./stories/${dir}/`, function (err, article_files) {

            let i = 0;

            article_files.forEach(function (file, index) {
                // Make one pass and make the file complete

                fs.readFile(`./stories/${dir}/${file}`, 'utf8', function(err, data) {
                    if (err) throw err;
                    
                    let name = data.split('\n')[0]
                    
                    i+=1;

                    let obj = { 
                        'raw': data.split ('\n'),
                        'uri': '/' + dir + '/' + name.split (' ').join ('-'),
                        'name': name,
                        'series': dir,
                        'num': i
                    } 

                    app.get(`${obj.uri}`, function(req, res) {

                        res.render('page_template.ejs', {
                            'raw': data.split ('\n'),
                            'uri': '/' + dir + '/' + name.split (' ').join ('-'),
                            'name': name,
                            'series': dir,
                            'num': i
                        });
    
                    });

                    if (obj.series in articles)
                        articles[obj.series].push(obj);
                    else
                        articles[obj.series] = [obj]
                });

            });

        });

        setTimeout(() => {
            
            let story = articles[dir].sort(function(first, second) {
                return parseInt(second.num) + parseInt(first.num);
            });

            app.get(`/${dir}`, function(req, res) {

                res.render('story_template.ejs', {
                    name: dir,
                    story: story
                });
    
            });

        }, 1000);
        
    });

});

 // FIX IN THE FUTURE
setTimeout(() => {
        
    var article_json = Object.entries (articles);

    // Sorts articles by newest
    // article_json.sort(function(first, second) {
    //     return parseInt(second[0]) - parseInt(first[0]);
    // });

    console.log (article_json);

    app.get('/', function(req, res) {
        res.render('index', { 
            articles: article_json,
        });
    });

}, 1000);

app.listen(8080);
console.log('8080 is the magic port');