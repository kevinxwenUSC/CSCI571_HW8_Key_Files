import { Component, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatTabsModule} from '@angular/material/tabs';
import { FormsModule } from '@angular/forms'; 
import { FormControl } from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { debounceTime, tap, switchMap, finalize, distinctUntilChanged, filter } from 'rxjs/operators';

import * as Highcharts from 'highcharts';



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



  //highchart settings stuff here
  highcharts = Highcharts;
  chartOptions = {   
      chart: {
         type: "spline"
      },
      title: {
         text: "Monthly Average Temperature"
      },
      subtitle: {
         text: "Source: WorldClimate.com"
      },
      xAxis:{
         categories:["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      },
      yAxis: {          
         title:{
            text:"Temperature °C"
         } 
      },
      tooltip: {
         valueSuffix:" °C"
      },
      series: [
         {
            name: 'Tokyo',
            data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2,26.5, 23.3, 18.3, 13.9, 9.6]
         },
         {
            name: 'New York',
            data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8,24.1, 20.1, 14.1, 8.6, 2.5]
         },
         {
            name: 'Berlin',
            data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
         },
         {
            name: 'London',
            data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
         }
      ] as Highcharts.SeriesOptionsType[]
   };




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

      //fill the ohlc and volume data for highcharts to use
      for(let i = 0; i < this.historyTimeStamp.length; i++){
        this.ohlc.push([this.historyNormalTime[i], this.historyOpenPrice[i], this.historyHighPrice[i], this.historyLowPrice[i], this.historyClosePrice[i]]);
        this.volume.push([this.historyNormalTime[i], this.historyVolume[i]])
      }

      console.log(this.volume)

    })

  }
}
