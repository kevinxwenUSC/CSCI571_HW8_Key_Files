import { Component, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatTabsModule} from '@angular/material/tabs';
import { FormsModule } from '@angular/forms'; 
import { FormControl } from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { debounceTime, tap, switchMap, finalize, distinctUntilChanged, filter } from 'rxjs/operators';

import * as Highcharts from "highcharts/highstock";
import IndicatorsCore from "highcharts/indicators/indicators";
import vbp from 'highcharts/indicators/volume-by-price';
IndicatorsCore(Highcharts);
vbp(Highcharts);
//import {Options} from 'highcharts/highstock'



@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  myControl = new FormControl();

  //stuff for autocomplete
  filteredStocks:any = []
  stockOptions:any = []

  isLoading = false;
  errorMsg!: string;
  minLengthTerm = 2;
  selectedStock: any = "";

  //store JSON data from node.js server responses
  companyResponseData:any = []
  companyTicker:string = ''
  percentChangeinParen:string = ''

  stockHourly:any = []

  stockNews:any = []

  recommendData:any = []

  socialSentimentData:any = []

  companyPeerData:any = []

  companyEarningData:any = []

  //data for highcharts chart
  companyHistoryData:any = []
  historyClosePrice:any = []
  historyHighPrice:any = []
  historyLowPrice:any = []
  historyOpenPrice:any = []
  historyTimeStamp:any = []
  historyVolume:any = []

  //store converted time from unix to date obj
  historyNormalTime:any = []

  //store our combined data for highcharts to use
  ohlc:any = []
  volume:any = []
  groupingUnits:any = []

  //stuff for highcharts to be defined later once data is recieved
  highcharts:any
  chartOptions:any
  chartLoading = true

  //stuff for hourly price chart
  hourlyChart:any
  hourlyChartOptions:any
  hourlyChartLoading = true
  hourlyTimestamps:any = []
  hourlyPrices:any = []

  //stuff for insights charts, defined once data is recieved
  recommendChart:any
  recommendChartOptions:any
  recommendChartLoading = true
  recommendPeriod:any = []
  strongBuy:any = []
  buy:any = []
  hold:any = []
  sell:any = []
  strongSell:any = []

  //stuff for surprise chart
  surpriseChart:any
  surpriseChartOptions:any
  surpriseChartLoading = true
  surprisePeriod:any = []
  surpriseActual:any = []
  surpriseEstimate:any = []




  constructor(private http: HttpClient, public element: ElementRef) {
   
  }


  onSelected() {
    //option was chosen so send API call for the selected ticker automatically
    this.getData()
  }

  displayWith(value: any) {
    return value?.Symbol;
  }

  clearSelection() {
    this.selectedStock = "";
    this.filteredStocks = [];
  }




  ngOnInit(): void {
    this.myControl.valueChanges
      .pipe(
        filter(res => {
          return res !== null && res.length >= this.minLengthTerm
        }),
        distinctUntilChanged(),
        debounceTime(1000),
        tap(() => {
          this.errorMsg = "";
          this.filteredStocks = [];
          this.isLoading = true;
        }),
        switchMap(value => this.http.get('/autocomplete/' + value)
          .pipe(
            finalize(() => {
              this.isLoading = false
            }),
          )
        )
      )
      .subscribe((data) => {
        //data['result'] == undefined
        /*if (data == undefined) {
          this.errorMsg = "no search results";
          this.filteredStocks = [];
        } else {
          this.errorMsg = "";
          //this.filteredStocks = data['result'];
          this.filteredStocks = JSON.parse(data);
        }*/
        this.errorMsg = "";
        //this.filteredStocks = data['result'];
        this.stockOptions= data;
        this.filteredStocks = this.stockOptions.result
        console.log(this.stockOptions.count);
        console.log(this.filteredStocks)
      });

  }

  getData(){
    //call to node.js server for stock details
    this.companyTicker = (<HTMLInputElement>document.getElementById('query')).value;
    console.log(this.companyTicker)
    const url ='/search/' + this.companyTicker

    this.http.get(url).subscribe((res)=>{
      this.companyResponseData = res
      console.log(this.companyResponseData)

    })

    //separate call to node.js server for the news 
    const hourly_url = '/hourly/' + this.companyTicker

    this.http.get(hourly_url).subscribe((res)=>{
      this.stockHourly = res
      console.log(this.stockHourly)

    })

    //separate call to node.js server for the news 
    const news_url = '/news/' + this.companyTicker

    this.http.get(news_url).subscribe((res)=>{
      this.stockNews = res
      console.log(this.stockNews)

    })

    //separate call to node.js server for company recommendation trends
    const recommend_url = '/recommend/' + this.companyTicker

    this.http.get(recommend_url).subscribe((res)=>{
      this.recommendData = res
      console.log(this.recommendData)

    })

    //separate call for social sentiment data
    const sentiment_url = '/sentiment/' + this.companyTicker

    this.http.get(sentiment_url).subscribe((res)=>{
      this.socialSentimentData = res
      console.log(this.socialSentimentData)

    })

    //separate call for company peer data
    const peer_url = '/peer/' + this.companyTicker

    this.http.get(peer_url).subscribe((res)=>{
      this.companyPeerData= res
      console.log(this.companyPeerData)

    })

    //separate call for company earnings data
    const earning_url = '/earning/' + this.companyTicker

    this.http.get(earning_url).subscribe((res)=>{
      this.companyEarningData= res
      console.log(this.companyEarningData)

    })

    //separate call for company historical candle data for chart
    const history_url = '/history/' + this.companyTicker

    this.http.get(history_url).subscribe((res)=>{
      this.companyHistoryData= res
      console.log(this.companyHistoryData)

      //separate the data to be passed to the chart
      this.historyClosePrice = this.companyHistoryData.c
      this.historyHighPrice = this.companyHistoryData.h
      this.historyLowPrice = this.companyHistoryData.l
      this.historyOpenPrice = this.companyHistoryData.o
      this.historyTimeStamp = this.companyHistoryData.t
      this.historyVolume = this.companyHistoryData.v

      console.log(this.historyClosePrice)

      //convert unix timestamps to normal dates
      for(let i = 0; i < this.historyTimeStamp.length; i++){
        //var normalDate = new Date(this.historyTimeStamp[i] * 1000)

        //acount for x1000 offset for UNIX timestamps in Javascript/Typescript
        var normalDate = this.historyTimeStamp[i] * 1000
        this.historyNormalTime.push(normalDate)
      }

      console.log(this.historyTimeStamp)
      console.log(this.historyNormalTime)

      //clear ohlc and volume data each time so theres no overlap between charts
      //this.volume = []
      //this.ohlc = []

      //fill the ohlc and volume data for highcharts to use
      for(let i = 0; i < this.historyTimeStamp.length; i++){
        this.ohlc.push([this.historyNormalTime[i], this.historyOpenPrice[i], this.historyHighPrice[i], this.historyLowPrice[i], this.historyClosePrice[i]]);
        this.volume.push([this.historyNormalTime[i], this.historyVolume[i]])
      }

      console.log(this.volume)
      console.log(this.ohlc)

      this.generateHourlyChart()
      this.generateChart()
      this.generateInsights()

    })
  }

  generateHourlyChart(){

    this.hourlyTimestamps = []
    this.hourlyPrices = []

    //every 3 timestamps for this covers approx 1 hour
    for(let i = 0; i < this.stockHourly.c.length; i++){
      //this.hourlyTimestamps.push(this.stockHourly.t[i] * 1000)
      //use closing price since its more stable for the hour
      this.hourlyPrices.push([this.stockHourly.t[i] * 1000, this.stockHourly.c[i]])
    }

    this.hourlyChart = Highcharts;
    this.hourlyChartOptions = {

      rangeSelector: {
        selected: 1
      },

      title: {
        text: this.companyTicker + " Hourly Price Variation"
      },

      xAxis:{
        type: 'datetime',
        //categories: this.hourlyTimestamps
      },


      yAxis: {
        title: {
            text: 'Price'
        }
      },


      series: [{
        name: this.companyTicker,
        data: this.hourlyPrices
      }],

      responsive: {
        rules: [{
            condition: {
                maxWidth: 500
            },
            chartOptions: {
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                }
            }
        }]
      }

    }
    this.hourlyChartLoading = false
  }

  generateChart(){
    //generate chart once all data is ready

    this.chartLoading = true
    this.groupingUnits = [[
      'month',
      [1, 3, 6]
    ]];
    //highchart settings stuff here
    this.highcharts = Highcharts;

    this.chartOptions = {

      navigator: {
        enabled: true
      },

      scrollbar: {
        enabled: true
      },

      rangeSelector: {
        enabled: true
        //selected: 2
      },
  
      title: {
        text: this.companyTicker + ' Historical'
      },
  
      subtitle: {
        text: 'With SMA and Volume by Price technical indicators'
      },

      xAxis: {
        type: 'datetime',
      },

      
  
      yAxis: [{
        startOnTick: false,
        endOnTick: false,
        labels: {
            align: 'right',
            x: -3
        },
        title: {
            text: 'OHLC'
        },
        height: '60%',
        lineWidth: 2,
        resize: {
            enabled: true
        }
      }, {
        labels: {
            align: 'right',
            x: -3
        },
        title: {
            text: 'Volume'
        },
        top: '65%',
        height: '35%',
        offset: 0,
        lineWidth: 2
      }],
  
      tooltip: {
        split: true
      },
  
      plotOptions: {
        series: {
            dataGrouping: {
                units: this.groupingUnits
            }
        }
      },
  
      series: [{
        type: 'candlestick',
        name: this.companyTicker,
        id: 'aapl',
        zIndex: 2,
        data: this.ohlc //as Highcharts.SeriesCandlestickOptions[]
      }, {
        type: 'column',
        name: 'Volume',
        id: 'volume',
        data: this.volume, //as Highcharts.SeriesColumnOptions[][],
        yAxis: 1
      }, {
        type: 'vbp',
        linkedTo: 'aapl',
        params: {
            volumeSeriesID: 'volume'
        },
        dataLabels: {
            enabled: false
        },
        zoneLines: {
            enabled: false
        }
      }, {
        type: 'sma',
        linkedTo: 'aapl',
        zIndex: 1,
        marker: {
            enabled: false
        }
      }] as Highcharts.SeriesOptionsType[]
  
     };
   
   this.chartLoading = false

  }

  //function to generate all charts/tables for insights tab
  generateInsights(){
    //clear the previous company's data
    this.recommendPeriod = []

    //fill out arrays needed for stacked bar chart
    for(let i = 0; i < 4; i++){
      this.recommendPeriod.push(this.recommendData[i].period)
      this.strongBuy.push(this.recommendData[i].strongBuy)
      this.buy.push(this.recommendData[i].buy)
      this.hold.push(this.recommendData[i].hold)
      this.sell.push(this.recommendData[i].sell)
      this.strongSell.push(this.recommendData[i].strongSell)
    }


    //setup the recommendation trends chart
    this.recommendChart = Highcharts
    this.recommendChartOptions = {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Recommendation Trends'
      },
      xAxis: {
        categories: this.recommendPeriod
      },
      yAxis: {
        min: 0,
        title: {
            text: '#Analysis'
        },
        stackLabels: {
            enabled: true,
            style: {
                fontWeight: 'bold',
                color: ( // theme
                    ['#03571f', '#09e33c', '#995308', '#ff0d21','#3d0207']
                    
                ) //|| 'gray'
            }
         } 
      },

      legend: {
        /*x: -10,
        verticalAlign: 'bottom',
        y: 25,
        floating: true,*/
        backgroundColor:
            'white',
        borderColor: '#CCC',
        borderWidth: 1,
        shadow: false
      },

      tooltip: {
        headerFormat: '<b>{point.x}</b><br/>',
        pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
      },

      plotOptions: {
        column: {
            stacking: 'normal',
            dataLabels: {
                enabled: true
            }
        }
      },

      series: [{
        name: 'Strong Buy',
        data: this.strongBuy
      }, {
        name: 'Buy',
        data: this.buy
      }, {
        name: 'Hold',
        data: this.hold
      }, {
        name: 'Sell',
        data: this.sell
      }, {
        name: 'Strong Sell',
        data: this.strongSell
      }] as Highcharts.SeriesOptionsType[]
    
    };
    this.recommendChartLoading = false


    //clear previous data
    this.surprisePeriod = []
    this.surpriseEstimate = []
    this.surpriseActual = []

    //fill data for earning chart to use
    for(let i = 0; i < 4; i++){
      this.surprisePeriod.push(this.companyEarningData[i].period)
      this.surpriseEstimate.push(this.companyEarningData[i].estimate)
      this.surpriseActual.push(this.companyEarningData[i].actual)
    }

    //setup the recommendation trends chart
    this.surpriseChart = Highcharts
    this.surpriseChartOptions = {
      chart: {
        type: "spline"
      },
      title: {
        text: "Historical EPS Surprises"
      },
      
      xAxis:{
        categories: this.surprisePeriod
      },
      yAxis: {          
        title:{
           text:"Quarterly EPS"
        } 
      },
      tooltip: {
        valueSuffix:" °C"
      },
      series: [
        {
           name: 'Actual',
           data: this.surpriseActual
        },
        {
           name: 'Estimate',
           data: this.surpriseEstimate
        }
      ] as Highcharts.SeriesOptionsType[]
    };
    this.surpriseChartLoading = false


  }

}

//have app.component.html have the same search bar, but when search button is clicked, it routes to search.component.html. Use the ngOninit() to
//set the desired ticker from local storage and then retrieve it as normal. The clear button should just route back to app.component.html
//and a subsequent search just sets a new ticker and calls getData() again
