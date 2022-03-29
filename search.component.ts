import { Component, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatTabsModule} from '@angular/material/tabs';
import { FormsModule } from '@angular/forms'; 
import { FormControl } from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  myControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];
  
  tickerAutocomplete = []
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
