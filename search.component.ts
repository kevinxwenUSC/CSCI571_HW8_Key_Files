import { Component, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatTabsModule} from '@angular/material/tabs';
import { FormsModule } from '@angular/forms'; 
import { FormControl } from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { debounceTime, tap, switchMap, finalize, distinctUntilChanged, filter } from 'rxjs/operators';



@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  myControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];


  filteredStocks:any = []
  stockOptions:any = []

  isLoading = false;
  errorMsg!: string;
  minLengthTerm = 2;
  selectedStock: any = "";

  
  companyResponseData:any = []
  companyTicker:string = ''
  percentChangeinParen:string = ''

  stockNews:any = []

  recommendData:any = []

  socialSentimentData:any = []

  companyPeerData:any = []

  companyEarningData:any = []

  companyHistoryData:any = []

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

    })

  }
}
