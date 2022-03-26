
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

    //generate url for the API call to finnhub
    finnHub_URL = "https://finnhub.io/api/v1/stock/profile2?symbol=" + stockTicker + "&token=c83mf0aad3ift3bmcrr0"

    //use axios for the HTTP call
    axios
        .get(finnHub_URL)
                .then(result => {
                    console.log(`statusCode: ${result.status}`)
                    console.log(result.data)
                    //send JSON result back to front end
                    res.send(JSON.stringify(result.data))
                })
                .catch(error => {
                    console.error(error)
                })
    
    //console.log("HTTP REQUEST VALID")
    //resultJson = response
    //console.log(response.data)
    
});

//display which port the server is listening on
app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});
