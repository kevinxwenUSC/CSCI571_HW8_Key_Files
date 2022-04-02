import { Component } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { MatTabsModule } from '@angular/material/tabs';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'my-app';
  //currentRouter:String = ''


  constructor(private http: HttpClient, private router: Router) {
    
  }

  hasRoute(route: string){
    return this.router.url.includes(route)
  }

  
}


