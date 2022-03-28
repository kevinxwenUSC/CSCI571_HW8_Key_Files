import { Component, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  companyResponseData:any = []
  companyTicker:string = ''
  percentChangeinParen:string = ''
  constructor(private http: HttpClient, public element: ElementRef) {
   
  }

  ngOnInit(): void {
  }

  getData(){
    this.companyTicker = (<HTMLInputElement>document.getElementById('query')).value;
    console.log(this.companyTicker)
    const url ='/search/' + this.companyTicker
    this.http.get(url).subscribe((res)=>{
      this.companyResponseData = res
      console.log(this.companyResponseData)

    })
  }
}
