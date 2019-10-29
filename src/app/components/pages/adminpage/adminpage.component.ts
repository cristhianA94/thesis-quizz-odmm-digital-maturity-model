import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-adminpage',
  templateUrl: './adminpage.component.html'
})
export class AdminpageComponent implements OnInit, OnDestroy{

  constructor() { }

  ngOnInit() {
    var body = document.getElementsByTagName("body")[0];
    body.classList.add("profile-page");
  }
  ngOnDestroy() {
    var body = document.getElementsByTagName("body")[0];
    body.classList.remove("profile-page");
  }
}
