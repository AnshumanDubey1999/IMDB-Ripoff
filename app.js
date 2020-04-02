var express = require("express");
var app = express()
var request = require("request")

var bodyParser = require("body-parser")
app.use(express.static("public"))

app.use(bodyParser.urlencoded({extended: true}))

app.set("view engine", "ejs")
require("dotenv").config()


app.get("/results", function(req, res){
    
    var query = req.query.search
    var url = "http://www.omdbapi.com/?s="+ query + "&apikey="+process.env.APIKEY
    request(url, function(error, response, body){
        if(!error && response.statusCode==200){
            var data = JSON.parse(body)
            var movies = []
            if(data.Response == "True"){
                movies.push(data.Search)
                var size = Number(data.totalResults);
                size = size>60?60:size;
                for(var i = 2; (i-1)*10 < size; i++){
                    console.log("i="+i)
                    url = "http://www.omdbapi.com/?s="+ query + "&apikey="+process.env.APIKEY+"&page="+i;
                    request(url, function(error1, response1, body1){
                        console.log(response1.statusCode)
                        if(!error1 && response1.statusCode==200){
                            console.log("Safely In")
                            var nData = JSON.parse(body1);
                            movies.push(nData.Search);
                        }
                        else
                            return;
                    })
                
                }


                console.log(movies)

                res.render("results", {data: movies})
            }
            else
                res.render("error")
        }
    })
})

app.get("/movie/:imdbID", function(req, res){
    var id = req.params.imdbID
    var url = "http://www.omdbapi.com/?i="+ id +"&apikey="+process.env.APIKEY+"&plot=full"
    request(url, function(error, response, body){
        if(!error && response.statusCode==200){
            var data = JSON.parse(body)
            if(data.Response == "True"){
                res.render("movie", {movie: data})
            }
            else
                res.render("error")
        }
    })
})

app.get("/", function(req, res){
    res.render("home")
})


app.listen(3000, function(){
    console.log("MyMDb is on Fire!")
})