import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css'],
})
export class AdminPanelComponent implements OnInit {

  flat: boolean = false;

  constructor(
    public router: Router
  ) { }

  ngOnInit(): void {
    console.log("gola");
  }

  redireccionarUbicaciones() {
    this.flat = true;
    this.router.navigate(['admin-panel/ubicacion-panel']);
  }

  redireccionarSectorInd() {
    this.flat = true;
    this.router.navigate(['admin-panel/sector-industrial-panel']);
  }

  redireccionarCuestionario() {
    this.flat = true;
    this.router.navigate(['admin-panel/cuestionario-panel']);
  }

}
