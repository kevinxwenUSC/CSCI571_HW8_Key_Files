
//use express.js as web application framework for node.js
const express = require('express');
const app = express(),
      bodyParser = require("body-parser");
      port = 3080;

//axios for handling HTTP requests in node.js, need to install with npm first tho
const axios = require('axios');
const { response } = require('express');

//let express know there is a dist folder with the assets of the angular build     
app.use(express.static(process.cwd()+"/my-app/dist/my-app/"));

//default api path for the server, probabaly used to display angular webpage for app
app.get('/', (req,res) => {
    //res.send('App Works !!!!');
    res.sendFile(process.cwd()+"/my-app/dist/my-app/index.html")
});

app.get('/search/:ticker', (req,res) => {
    //res.send('App Works !!!!');
    //to get URL parameter values, use req,params, make it match the string after the ":" in the URL
    stockTicker = req.params.ticker
    console.log("got the request")
    console.log(stockTicker)

    //async function for finnhub requests
    async function handleStockSearch(stockTicker){
        var first_JSON;
        var second_JSON;
        var news_JSON

        //generate url for the API call to finnhub
        finnHub_URL = "https://finnhub.io/api/v1/stock/profile2?symbol=" + stockTicker + "&token=c83mf0aad3ift3bmcrr0"

        //use axios for the HTTP call for the company JSON
        await axios
            .get(finnHub_URL)
                    .then(result => {
                        console.log(`statusCode: ${result.status}`)
                        console.log(result.data)
                        //send JSON result back to front end
                        first_JSON = result.data
                        //res.write(JSON.stringify(result.data) + "\n")
                    })
                    .catch(error => {
                        console.error(error)
                    })
    
        //second call for the stock detail info JSON
        finnHub_details_URL = "https://finnhub.io/api/v1/quote?symbol=" + stockTicker + "&token=c83mf0aad3ift3bmcrr0"
        await axios
            .get(finnHub_details_URL)
                   .then(result => {
                        console.log(`statusCode: ${result.status}`)
                        console.log(result.data)
                        //send JSON result back to front end
                        second_JSON = result.data
                        //res.write(JSON.stringify(result.data) + "\n")
                    })
                    .catch(error => {
                        console.error(error)
                    })



        //package both finnhub responses into one JSON
        //responseJSON = {"companyData" : first_JSON, "stockDetails": second_JSON};
        mergedJSON = Object.assign(first_JSON, second_JSON)
        

        //send final JSON back to client
        //res.send(responseJSON)
        res.send(mergedJSON)
    }

    handleStockSearch(stockTicker)

    //res.send() is equivalant to res.write() + res.end()
    //res.end();
});

//route for news API calls
app.get('/news/:ticker', (req,res) => {
    stockTicker = req.params.ticker
    console.log("got the NEWS request")
    console.log(stockTicker)

    var newsJSON;

    async function handleNews(stockTicker){

        //generate date for news tab API call
        let date_ob = new Date();

        let day = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();

        currentDateString = year + '-' + month + '-' + day;

        console.log(currentDateString)
        
        //generate date for 7 days ago to get interval for the news articles
        var beforedate = new Date();
        var priordate = new Date(new Date().setDate(beforedate.getDate()-7));

        let priorday = ("0" + priordate.getDate()).slice(-2);
        let priormonth = ("0" + (priordate.getMonth() + 1)).slice(-2);
        let prioryear = priordate.getFullYear();

        priorDateString = prioryear + '-' + priormonth + '-' + priorday;

        console.log(priorDateString)

        //https://finnhub.io/api/v1/company-news?symbol=%3CTICKER%3E&from=%3CDATE%3E&to=%3CDATE%3E&token=%3CAPI_KEY
        //generate URL for news API call
        finnHub_news_URL = "https://finnhub.io/api/v1/company-news?symbol=" + stockTicker + "&from=" + priorDateString + "&to=" + currentDateString + "&token=c83mf0aad3ift3bmcrr0"
        console.log(finnHub_news_URL)

        await axios.get(finnHub_news_URL)
                   .then(result => {
                        console.log(`statusCode: ${result.status}`)
                        //console.log(result.data)
                        //send JSON result back to front end
                        newsJSON = result.data
                        //res.write(JSON.stringify(result.data) + "\n")
                    })
                    .catch(error => {
                        console.error(error)
                    })
        

        res.send(newsJSON)

    }

    handleNews(stockTicker)

});

//route for autocomplete API calls
app.get('/autocomplete/:ticker', (req,res) => {
    stockTicker = req.params.ticker
    console.log("got the AUTOCOMPLETE request")
    console.log(stockTicker)
    var tickerOptions;

    async function handleAutocomplete(stockTicker){
        //finnhub API call for autocomplete options
        //https://finnhub.io/api/v1/search?q=AMZ&token=%3CAPI_KEY
        finnHub_details_URL = "https://finnhub.io/api/v1/search?q=" + stockTicker + "&token=c83mf0aad3ift3bmcrr0"

        await axios.get(finnHub_details_URL)
                   .then(result => {
                        console.log(`statusCode: ${result.status}`)
                        console.log(result.data)
                        //send JSON result back to front end
                        tickerOptions = result.data
                        //res.write(JSON.stringify(result.data) + "\n")
                    })
                    .catch(error => {
                        console.error(error)
                    })

        res.send(tickerOptions)

    }

    handleAutocomplete(stockTicker)
    

});



//display which port the server is listening on
app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});
