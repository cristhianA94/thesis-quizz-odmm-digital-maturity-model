import { Component, OnInit, ViewChild } from '@angular/core';
// Material
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatAccordion } from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';
import { DialogFormProvinciaComponent } from './dialog-form-provincia.component';

import { ProvinciaService } from '../../../../services/user/provincia/provincia.service';
import { Provincia } from 'app/shared/models/ubicacion';
import { PaisService } from 'app/core/services/user/pais/pais.service';

@Component({
  selector: 'app-admin-provincia',
  templateUrl: './admin-provincia.component.html',
  styleUrls: ['./admin-provincia.component.css']
})
export class AdminProvinciaComponent implements OnInit {


  @ViewChild(MatAccordion) paisesItems: MatAccordion;

  provincias: Provincia[] = [];
  provincia: Provincia;

  displayedColumns: string[] = ['Nombre', ' '];

  dataSource = new MatTableDataSource();

  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  
  constructor(
    public paisService: PaisService,
    public provinciaService: ProvinciaService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.provinciaService.getProvinciasDB().subscribe(provincias => {
      this.provincias = provincias;
      /* Table */
      // Agrega los datos a la tabla
      this.dataSource.data = this.provincias;
      //this.paisService.getPaisDB(this.provincias[].id)
    })

    /* 
    this.provincias.forEach(element => {
      console.log(element);
      this.paisService.getPaisDB(element.idPais).subscribe( pais=>{
        console.log(pais);
      }) 
    }); */

  }

  // Table
  buscarProvincia(event: Event) {
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
    this.provincia = row;
    //console.log('Row clicked: ', this.provincias);
  }

  openDialog(action: string, obj: any) {

    // Agregar la accion al objeto para mostrarla en el dialog
    const dialogRef = this.dialog.open(DialogFormProvinciaComponent, {
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

      this.provincia = result.data;
      // Si NO es nuevo se le agrega el id
      if (result.id) {
        this.provincia.id = result.id;
      }

      if (result.event == 'Agregar') {
        this.createProvincia(this.provincia);
      } else if (result.event == 'Actualizar') {
        this.updateProvincia(this.provincia);
      } else if (result.event == 'Borrar') {
        this.deleteProvincia(this.provincia);
      }

    });
  }

  createProvincia(provincia: Provincia) {
    this.provinciaService.createProvinciaDB(provincia);
  }

  updateProvincia(provincia: Provincia) {
    this.provinciaService.updateProvinciaDB(provincia);
  }

  deleteProvincia(provincia: Provincia) {
    this.provinciaService.deleteProvinciaDB(provincia);
  }

}
