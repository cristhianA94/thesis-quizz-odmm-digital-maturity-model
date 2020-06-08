import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MetricasService } from 'app/core/services/cuestionario/metricas/metricas.service';
import { MatDialog } from '@angular/material/dialog';

import { Respuesta } from '../../../../../shared/models/cuestionario';
import { RespuestasService } from '../../../../services/cuestionario/respuestas/respuestas.service';
import { DialogFormRespuestaComponent } from './dialog-form-respuesta.component';

@Component({
  selector: 'app-respuestas-admin',
  templateUrl: './respuestas-admin.component.html',
  styleUrls: ['./respuestas-admin.component.css']
})
export class RespuestasAdminComponent implements OnInit {

  respuestas: Respuesta[] = [];
  respuesta: Respuesta;

  displayedColumns: string[] = ["Opción", "Peso", "Métrica", " "];

  dataSource = new MatTableDataSource<Respuesta>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public respuestasService: RespuestasService,
    public metricasService: MetricasService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.respuestasService.getRespuestasDB().subscribe((respuestas) => {
      // Recorre cada subcategoria
      respuestas.forEach((element) => {
        // Busca la categoria segun el idCategoria
        this.metricasService
          .getMetricaDB(element.idMetrica)
          .subscribe((metrica) => {

            const respuestaObj: Respuesta = {
              id: element.id,
              opcion: element.opcion,
              peso: element.peso,
              idMetrica: element.idMetrica,
              nombreMetrica: metrica.nombre,
            };

            this.respuestas.push(respuestaObj);
            this.dataSource.data = this.respuestas;
          });
        // Agrega los datos a la tabla
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      });
    });
  }

  // Table
  buscarRespuesta(event: Event) {
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
    //this.respuesta = row;
    console.log("Row clicked: ", row);
  }

  openDialog(action: string, obj: any) {
    // Agregar la accion al objeto para mostrarla en el dialog
    const dialogRef = this.dialog.open(DialogFormRespuestaComponent, {
      width: "550px",
      data: {
        obj,
        action: action
      },
    });

    // Despues de cerrar el dialog
    dialogRef.afterClosed().subscribe((result) => {
      // Si esta vacion no retorna nada
      if (!result) {
        return;
      }

      this.respuesta = result.data;
      // Si NO es nuevo se le agrega el id
      if (result.id) {
        this.respuesta.id = result.id;
      }

      if (result.event == "Agregar") {
        this.createRespuesta(this.respuesta);
      } else if (result.event == "Actualizar") {
        this.updateRespuest(this.respuesta);
      } else if (result.event == "Borrar") {
        this.deleteRepuesta(this.respuesta);
      }

      this.respuestas = [];
    });
  }

  createRespuesta(obj: any) {
    const respuestaNew: Respuesta = {
      opcion: obj.opcion,
      peso: obj.peso,
      idMetrica: obj.idMetrica,
    };

    this.respuestasService.createRespuestaDB(respuestaNew);
  }

  updateRespuest(obj: any) {
    const respuestaEdit: Respuesta = {
      id: obj.id,
      opcion: obj.opcion,
      peso: obj.peso,
      idMetrica: obj.idMetrica,
    };
    this.respuestasService.updateRespuestaDB(respuestaEdit);
  }

  deleteRepuesta(respuesta: any) {
    this.respuestasService.deleteRespuestaDB(respuesta.id);
  }
}