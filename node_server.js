
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
        responseJSON = {"companyData" : first_JSON, "stockDetails": second_JSON};
        //res.send(JSON.stringify(responseJSON));

        //send final JSON back to client
        res.send(responseJSON)
    }

    handleStockSearch(stockTicker)

    //res.send() is equivalant to res.write() + res.end()
    //res.end();
});

//display which port the server is listening on
app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});
