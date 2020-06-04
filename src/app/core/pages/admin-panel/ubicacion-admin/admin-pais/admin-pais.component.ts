import { Component, OnInit, ViewChild } from '@angular/core';
// Material
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatAccordion } from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';
import { DialogFormPaisComponent } from './dialog-form-pais.component';

import { Pais } from 'app/shared/models/ubicacion';
import { PaisService } from 'app/core/services/user/pais/pais.service';

@Component({
  selector: 'app-admin-pais',
  templateUrl: './admin-pais.component.html',
  styleUrls: ['./admin-pais.component.css']
})
export class AdminPaisComponent implements OnInit {

  @ViewChild(MatAccordion) paisesItems: MatAccordion;

  paises: Pais[] = [];
  pais: Pais;

  displayedColumns: string[] = ['Nombre', ' '];

  //dataSource = new MatTableDataSource();
  dataSource = new MatTableDataSource<Pais>();

  @ViewChild(MatSort) sort: MatSort;

  //@ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(
    public paisService: PaisService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.paisService.getPaisesDB().subscribe(paises => {
      this.paises = paises;
      this.dataSource.data = paises as Pais[];
      //this.dataSource.data = this.paises;
    })

  }

  // Table
  buscarPais(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  onRowClicked(row: any) {
    this.pais = row;
    console.log('Row clicked: ', this.pais);
  }

  openDialog(action: string, obj: any) {
    // Agregar la accion al objeto para mostrarla en el dialog
    const dialogRef = this.dialog.open(DialogFormPaisComponent, {
      width: '300px',
      data: {
        obj,
        action: action
      }
    });

    // Despues de cerrar el dialog
    dialogRef.afterClosed().subscribe(result => {
      // Si esta vacion no retorna nada
      if (!result) {
        return;
      }

      this.pais = result.data;
      if (result.id) {
        this.pais.id = result.id;
      }

      if (result.event == 'Agregar') {
        this.createPais(this.pais);
      } else if (result.event == 'Actualizar') {
        this.updatePais(this.pais);
      } else if (result.event == 'Borrar') {
        this.deletePais(this.pais);
      }

    });
  }

  createPais(pais: Pais) {
    this.paisService.createPaisDB(pais);
  }

  updatePais(pais: Pais) {
    this.paisService.updatePaisDB(pais);
  }

  deletePais(pais: Pais) {
    this.paisService.deletePaisDB(pais);
  }

}
