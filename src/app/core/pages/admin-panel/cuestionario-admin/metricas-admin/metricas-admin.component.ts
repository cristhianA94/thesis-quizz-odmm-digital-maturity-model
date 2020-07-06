import { Component, OnInit, ViewChild } from "@angular/core";
import { MatAccordion } from "@angular/material/expansion";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";
import { DialogFormMetricaComponent } from "./dialog-form-metrica.component";

import { CapacidadesService } from "app/core/services/cuestionario/capacidades/capacidades.service";
import { Metrica } from 'app/shared/models/metrica';
import { MetricasService } from 'app/core/services/cuestionario/metricas/metricas.service';

@Component({
  selector: "app-metricas-admin",
  templateUrl: "./metricas-admin.component.html",
  styleUrls: ["./metricas-admin.component.css"],
})
export class MetricasAdminComponent implements OnInit {
  @ViewChild(MatAccordion) metricasItems: MatAccordion;

  metricas: Metrica[] = [];
  metrica: Metrica;

  displayedColumns: string[] = ["Nombre", "Pregunta", "Peso", "Capacidad", " "];

  dataSource = new MatTableDataSource<Metrica>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public metricasService: MetricasService,
    public capacidadesService: CapacidadesService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.metricasService.getMetricasDB().subscribe((metricas) => {
      this.dataSource.data = metricas;
    });
  }

  // Table
  buscarMetrica(event: Event) {
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
    //this.metrica = row;
    //console.log("Row clicked: ", row);
  }

  openDialog(action: string, obj: any) {
    // Agregar la accion al objeto para mostrarla en el dialog
    const dialogRef = this.dialog.open(DialogFormMetricaComponent, {
      width: "450px",
      data: {
        obj,
        action
      },
    });

    // Despues de cerrar el dialog
    dialogRef.afterClosed().subscribe((result) => {
      // Si esta vacion no retorna nada
      if (!result) {
        return;
      }

      console.log(result);
      this.metrica = result;
      // Si NO es nuevo se le agrega el id
      if (result.id) {
        this.metrica.id = result.id;
      }

      if (action === "Agregar") {
        this.createMetrica(result);
      } else if (action === "Actualizar") {
        this.updateMetrica(this.metrica);
      } else if (action === "Borrar") {
        this.deleteMetrica(this.metrica);
      }

      // this.metricas = [];
    });
  }

  createMetrica(obj: Metrica) {
    delete obj.id;
    this.metricasService.createMetricaDB(obj);
  }

  updateMetrica(obj: Metrica) {
    this.metricasService.updateMetricaDB(obj);
  }

  deleteMetrica(metrica: any) {
    this.metricasService.deleteMetricaDB(metrica.id);
  }
}
