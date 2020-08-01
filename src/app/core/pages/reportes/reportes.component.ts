import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ChartDataSets, RadialChartOptions } from 'chart.js';
import { Label } from 'ng2-charts';

import { CuestionarioService } from 'app/core/services/cuestionario/cuestionario.service';
import { Cuestionario, RespuestasUsuario } from 'app/shared/models/cuestionario';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styles: ['']
})
export class ReportesComponent implements OnInit {

  // Banderas para DOM
  flag: boolean = false;
  flag2: boolean = false;

  cuestionarios: Cuestionario[] = [];
  cuestionario: Cuestionario = {};
  respuestasUsuario: RespuestasUsuario[] = [];
  respuestaUsuario: RespuestasUsuario;

  ultimasCategoriasEval: Cuestionario[] = [];

  // Nombre columnas tabla
  displayedColumns: string[] = ['Fecha', 'Intento', ' '];

  dataSource = new MatTableDataSource<RespuestasUsuario>();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  // Radar
  public radarChartOptions: RadialChartOptions = {
    responsive: true,
  };

  public radarChartLabels: Label[] = [];

  public radarChartData: ChartDataSets[] = [
    { data: [], label: 'Última evaluación' },
    { data: [], label: 'Penúltima evaluación' }
  ];

  constructor(
    private cuestionarioService: CuestionarioService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias() {
    let arrayData: number[] = [];
    let arrayData2: number[] = [];
    let objData: ChartDataSets = {};
    // Carga los cuestionarios evaluados por del usuario
    this.cuestionarioService.getCuestionarioUserLogedDB().subscribe((cuestionarioUserDB: Cuestionario[]) => {
      this.cuestionarios = cuestionarioUserDB;

      // Recorre cada categoria evaluada
      this.cuestionarios.forEach((cuestionario: Cuestionario, index) => {
        // Labels para grafico de radar
        this.radarChartLabels.push(cuestionario.categoria);

        // Obtiene las respuestas de cada categoria
        this.cuestionarioService.getCuestionarioRespuestasDB(cuestionario.id).subscribe((respuestas: any) => {
          // Asigna el ultimo intento de respuestas a cada categoria evaluada del usuario
          this.cuestionarios[index].respuestasUsuario = respuestas[0];

          // Data para grafico de radar
          // Guarda la puntuacion de cada categoria evaluada del ultimo intento
          arrayData.push(respuestas[0].puntuacionCategoria);

          // Valida si no existe otro intento
          if (respuestas[1]) {
            // Guarda la puntuacion de cada categoria evaluada del penultimo intento
            arrayData2.push(respuestas[1].puntuacionCategoria);
            console.log("No tiene otro intento ");
          } else {
            arrayData2.push(0);
          }
          this.radarChartData[0].data = arrayData;
          this.radarChartData[1].data = arrayData2;
        });
      });

      console.log(this.radarChartData);

    });


  };

  // Table
  buscarCuestionario(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onRowClicked(row: any) {
    //this.cuestionario = row;
    //console.log('Row clicked: ', this.cuestionario);
  }


  // Metodos
  visualizacionResultados(cuestionario: Cuestionario) {
    this.flag2 = true;
    this.cuestionario = cuestionario;
    this.cuestionarioService.getCuestionarioRespuestasDB(cuestionario.id).subscribe((respuestasUser) => {
      //this.cuestionarios[index].respuestasUsuario.push(respuestasUser)
      this.dataSource.data = respuestasUser;
    });
  }

  verReporte(respuestasUsuario: RespuestasUsuario) {
    // Guarda el objeto 
    this.cuestionarioService.respuestaUsuario = respuestasUsuario;
    console.log(respuestasUsuario);
    this.flag = true;
    this.router.navigate(['reportes/reporte', respuestasUsuario.id])
  }

}
