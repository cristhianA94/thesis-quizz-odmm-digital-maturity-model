import { Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { DialogFormSectorIndustrialComponent } from './dialog-form-sectorIndustrial.component';
import { Sector_Industrial } from '../../../../shared/models/sector_industrial';
import { SectorIndustrialService } from '../../../services/user/sectorIndustrial/sector-industrial.service';

@Component({
  selector: 'app-sector-industrial-admin',
  templateUrl: './sector-industrial-admin.component.html',
  styleUrls: ['./sector-industrial-admin.component.css']
})
export class SectorIndustrialAdminComponent implements OnInit {

  @ViewChild(MatAccordion) sectoresIndItems: MatAccordion;

  sectoresI: Sector_Industrial[] = [];
  sectorI: Sector_Industrial;

  displayedColumns: string[] = ['Nombre', ' '];

  dataSource = new MatTableDataSource();

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public sectorIService: SectorIndustrialService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.sectorIService.getSectoresIndustrialesDB().subscribe(sectoresI => {
      this.sectoresI = sectoresI;
      this.dataSource.data = this.sectoresI;
    })

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Table
  buscarSectorIndustrial(event: Event) {
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
    //this.sectorI = row;
    //console.log('Row clicked: ', this.sectorI);
  }

  openDialog(action: string, obj: any) {
    // Agregar la accion al objeto para mostrarla en el dialog
    const dialogRef = this.dialog.open(DialogFormSectorIndustrialComponent, {
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

      this.sectorI = result.data;
      if (result.id) {
        this.sectorI.id = result.id;
      }

      if (result.event == "Agregar") {
        this.createSectorI(this.sectorI);
      } else if (result.event == "Actualizar") {
        this.updateSectorI(this.sectorI);
      } else if (result.event == "Eliminar") {
        this.deleteSectorI(this.sectorI);
      }

    });
  }

  createSectorI(sectorI: Sector_Industrial) {
    this.sectorIService.crearSectorIndustrialDB(sectorI);
  }

  updateSectorI(sectorI: Sector_Industrial) {
    this.sectorIService.updateSectorIndustrialDB(sectorI);
  }

  deleteSectorI(sectorI: Sector_Industrial) {
    this.sectorIService.deletePaisDB(sectorI);
  }
}
