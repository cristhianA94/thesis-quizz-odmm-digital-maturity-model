import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RespuestasUsuario, Cuestionario } from 'app/shared/models/cuestionario';
import { CuestionarioService } from 'app/core/services/cuestionario/cuestionario.service';

import { ChartDataSets, RadialChartOptions } from 'chart.js';
import { Label } from 'ng2-charts';
// PDF
import * as jsPDF from 'jspdf'



@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.component.html',
  styles: [``]
})
export class ReporteComponent implements OnInit {

  @ViewChild('respuestasData') respuestasData: ElementRef;


  flag: boolean = false;
  respuestasUsuario: RespuestasUsuario;
  cuestionarios: Cuestionario[] = [];

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
    private actRouter: ActivatedRoute,
    private cuestionarioService: CuestionarioService,
  ) { }

  ngOnInit(): void {
    this.cargarData();
  }


  // Carga las respuestas del usuario y puntuacion, y carga los puntuajes de las categorias para el grafico radar
  cargarData() {
    let idCuestionario = localStorage.getItem("cuestionario");
    let idRespuesta = this.actRouter.snapshot.paramMap.get('id');
    let arrayDataUltimoIntento: number[] = [];
    let arrayDataPnultimoIntento: number[] = [];

    // Carga las respuesta del usuario del cuestionario seleccionado
    this.cuestionarioService.getCuestionarioRespuestaDB(idCuestionario, idRespuesta).subscribe((res: RespuestasUsuario) => {
      this.respuestasUsuario = res;
      this.flag = true;
    });

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
          arrayDataUltimoIntento.push(respuestas[0].puntuacionCategoria);

          // Valida si no existe otro intento
          if (respuestas[1]) {
            // Guarda la puntuacion de cada categoria evaluada del penultimo intento
            arrayDataPnultimoIntento.push(respuestas[1].puntuacionCategoria);
            //console.log("No tiene otro intento ");
          } else {
            arrayDataPnultimoIntento.push(0);
          }
          this.radarChartData[0].data = arrayDataUltimoIntento;
          this.radarChartData[1].data = arrayDataPnultimoIntento;
        });
      });

      //console.log(this.radarChartData);
    });
  };

  public openPDF():void {
    let DATA = this.respuestasData.nativeElement;
    let doc = new jsPDF('p','pt', 'a4');
    doc.fromHTML(DATA.innerHTML,15,15);
    doc.output('dataurlnewwindow');
  }

  public openTESTPDF():void {
    let DATA = this.respuestasData.nativeElement;
    let doc = new jsPDF('p','pt', 'a4');
    doc.fromHTML(DATA.innerHTML,15,15);
    doc.output('dataurlnewwindow');
  }


  public downloadPDF():void {
    let DATA = this.respuestasData.nativeElement;
    let doc = new jsPDF('p','pt', 'a4');

    let handleElement = {
      '#editor':function(element,renderer){
        return true;
      }
    };
    doc.fromHTML(DATA.innerHTML,15,15,{
      'width': 200,
      'elementHandlers': handleElement
    });

    doc.save('angular-demo.pdf');
  }

}
