import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-watch-list-component',
  templateUrl: './watch-list-component.component.html',
  styleUrls: ['./watch-list-component.component.css']
})
export class WatchListComponentComponent implements OnInit {

  //currentFavorites:any = Object.keys(localStorage)
  currentStorage:any 
  currentFavorites:any = []

  constructor(private router: Router) { }

  cardClicked(tickerClicked:any){

    //store the ticker that was clicked so search results component knows what ticker to call
    localStorage["ticker"] = tickerClicked

    //reroute to stock results page 
    this.router.navigateByUrl('/search');
  }

  removeFavorite(name: any){

    console.log("name to be removed is: " + name)
    //var removeComp = (<HTMLInputElement>document.getElementById(name)).value

    //remove company from local storage
    localStorage.removeItem(name)

    //clear favorites array
    this.currentFavorites = []
    //show updated list of companys
    this.ngOnInit()
  }

  ngOnInit(): void {
    console.log(localStorage)
    this.currentStorage = localStorage

    this.currentStorage.removeItem('ticker')

    //console.log(this.currentFavorites)

    //loop through currentStorage and parse JSON strings
    Object.keys(this.currentStorage).forEach((key) => {
      this.currentFavorites.push([key, JSON.parse(this.currentStorage.getItem(key))])
    });

    //this.currentFavorites.splice(-1)

    console.log(this.currentFavorites)

  }

}
