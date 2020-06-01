import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  // Permite editar styles material
  encapsulation: ViewEncapsulation.None
})
export class AuthComponent implements OnInit {

  constructor() {
    //this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit(): void {
  }

}

