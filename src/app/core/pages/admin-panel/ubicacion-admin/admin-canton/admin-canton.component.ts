import { Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { DialogFormCantonComponent } from './dialog-form-canton.component';
import { Canton } from '../../../../../shared/models/ubicacion';
import { CantonService } from '../../../../services/user/canton/canton.service';
import { ProvinciaService } from 'app/core/services/user/provincia/provincia.service';

@Component({
  selector: 'app-admin-canton',
  templateUrl: './admin-canton.component.html',
  styleUrls: ['./admin-canton.component.css']
})
export class AdminCantonComponent implements OnInit {

  @ViewChild(MatAccordion) cantonItems: MatAccordion;

  cantones: Canton[] = [];
  canton: Canton;

  displayedColumns: string[] = ['Nombre', ' '];

  dataSource = new MatTableDataSource();

  //@ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;


  constructor(
    public provinciaService: ProvinciaService,
    public cantonService: CantonService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.cantonService.getCantonesDB().subscribe(cantones => {
      this.cantones = cantones;
      /* Table */
      // Agrega los datos a la tabla
      this.dataSource.data = this.cantones;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  // Table
  buscarCanton(event: Event) {
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
    this.canton = row;
    //console.log('Row clicked: ', this.cantones);
  }

  openDialog(action: string, obj: any) {

    // Agregar la accion al objeto para mostrarla en el dialog
    const dialogRef = this.dialog.open(DialogFormCantonComponent, {
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

      this.canton = result.data;
      // Si NO es nuevo se le agrega el id
      if (result.id) {
        this.canton.id = result.id;
      }

      if (result.event == 'Agregar') {
        this.createCaton(this.canton);
      } else if (result.event == 'Actualizar') {
        this.updateCaton(this.canton);
      } else if (result.event == 'Borrar') {
        this.deleteCaton(this.canton);
      }

    });
  }

  createCaton(canton: Canton) {
    console.log("Metodo ", canton);
    this.cantonService.createCantonDB(canton);
  }

  updateCaton(canton: Canton) {
    this.cantonService.updateCantonDB(canton);
  }

  deleteCaton(canton: Canton) {
    this.cantonService.deleteCantonaDB(canton);
  }

}
