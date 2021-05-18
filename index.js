// load the things we need
var express = require('express');

const fs = require ('fs');

var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

var articles = {

}

var all_articles = []

fs.readdir("./stories", function (err, files) {
    
    // CREATES AN OBJECT FOR EACH PERSON IN THE PEOPLE DIRECTORY
    // THEN IT CREATES A PAGE FOR THEM, AND ADDS THEM TO THE INDEX
    files.forEach(function (dir, index) {

        fs.readdir(`./stories/${dir}/`, function (err, article_files) {

            article_files.forEach(function (file, index) {
                // Make one pass and make the file complete

                fs.readFile(`./stories/${dir}/${file}`, 'utf8', function(err, data) {
                    if (err) throw err;
                    
                    let name = data.split('\n')[0]
                    
                    let series = dir;
                    if (dir == 'GameReset')
                        series = 'Game->Reset'
                    else if (dir == 'LaserKid')
                        series = 'Laser Kid'

                    let obj = { 
                        'raw': data.split ('\n'),
                        'uri': '/' + dir + '/' + name.split (' ').join ('-'),
                        'name': name,
                        'series_short': dir,
                        'series': series,
                        'num': parseInt(file.split('txt')),
                        'date': data.split ('\n').pop(-1)
                    }

                    if (obj.series in articles)
                        articles[obj.series_short].push(obj);
                    else
                        articles[obj.series_short] = [obj]

                    all_articles.push(obj);
                });

            });

        });

        setTimeout(() => {
            
            let story = articles[dir].sort(function(first, second) {
                return parseInt(first.num) - parseInt(second.num);
            });

            console.log (story);

            app.get(`/${dir}`, function(req, res) {

                res.render('story_template.ejs', {
                    name: story[0].series,
                    story: story
                });
    
            });

            articles[dir].forEach (elem => {

                app.get(`${elem.uri}`, function(req, res) {

                    res.render('page_template.ejs', {
                        story: elem,
                        all: story
                    });

                });

            })

        }, 1000);
        
    });

});

 // FIX IN THE FUTURE
setTimeout(() => {
        
    var article_json = Object.entries (articles);

    // Sorts articles by newest
    let all = all_articles.sort(function(first, second) {
        return Date.parse(first.date) - Date.parse(second.date);
    });

    console.log (article_json);

    app.get('/', function(req, res) {
        res.render('index', { 
            all_articles: all,
        });
    });

}, 1000);

app.listen(8080);
console.log('8080 is the magic port');