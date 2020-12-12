import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RespuestasUsuario, Cuestionario } from 'app/shared/models/cuestionario';
import { CuestionarioService } from 'app/core/services/cuestionario/cuestionario.service';
import { EmpresaService } from '../../../services/user/empresas/empresa.service';
import { Empresa } from '../../../../shared/models/empresa';

import { ChartDataSets, RadialChartOptions } from 'chart.js';
import { Label } from 'ng2-charts';
// PDF
import * as jsPDF from 'jspdf';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.component.html',
  styles: [``]
})
export class ReporteComponent implements OnInit, OnDestroy {

  @ViewChild('respuestasData') respuestasData: ElementRef;
  @ViewChild('canvasPorcentaje') canvasPorcentaje: ElementRef;

  flag: boolean = false;
  respuestasUsuario: RespuestasUsuario;
  cuestionarios: Cuestionario[] = [];
  categoria: any;
  empresas: Empresa[] = [];
  empresa: Empresa;

  puntuaje: number;

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
    private router: Router,
    private cuestionarioService: CuestionarioService,
    private empresaService: EmpresaService,
  ) { }

  ngOnInit(): void {
    this.cargarData();
  }

  ngOnDestroy(): void {
    localStorage.removeItem("cuestionario");
    localStorage.removeItem("idUserCuestionario");
  }

  // Carga las respuestas del usuario y puntuacion, y carga los puntuajes de las categorias para el grafico radar
  cargarData() {

    // Cargar data en grafico dependiendo del id
    let idCuestionario = this.actRouter.snapshot.queryParams['idCuestionario'];
    let idRespuesta = this.actRouter.snapshot.paramMap.get('id');

    let arrayDataUltimoIntento: number[] = [];
    let arrayDataPnultimoIntento: number[] = [];

    // Consulta la categoria consultada
    this.cuestionarioService.getCuestionarioID(idCuestionario).subscribe((cat: Cuestionario) => {
      this.categoria = cat;
    });

    this.empresaService.onEmpresaChanged.subscribe(empresas => {
      this.empresas = empresas
      // Escoje la primera empresa registrada como la principal
      this.empresa = empresas[0];
    });


    // Carga las respuesta del usuario del cuestionario seleccionado
    this.cuestionarioService.getCuestionarioRespuestaDB(idCuestionario, idRespuesta).subscribe((res: RespuestasUsuario) => {
      this.respuestasUsuario = res;
      this.puntuaje = this.respuestasUsuario.puntuacionCategoria * 10;
      this.puntuaje = Number(this.puntuaje.toFixed(0));
      this.flag = true;
    });

    // Carga los cuestionarios evaluados por del usuario
    this.cuestionarioService.getCuestionarioUserLogedDB()
      .pipe(
        map((data) => {
          data.sort((a, b) => {
            return a.categoriaNombre < b.categoriaNombre ? -1 : 1;
          });
          return data;
        })
      ).subscribe((cuestionarioUserDB: Cuestionario[]) => {
        this.cuestionarios = cuestionarioUserDB;

        // Recorre cada categoria evaluada
        this.cuestionarios.forEach((cuestionario: Cuestionario, index) => {
          // Labels para grafico de radar
          this.radarChartLabels.push(cuestionario.categoriaNombre);

          // Obtiene las respuestas de cada categoria
          this.cuestionarioService.getCuestionarioRespuestasDB(cuestionario.id).subscribe((respuestas: any) => {
            // Asigna el ultimo intento de respuestas a cada categoria evaluada del usuario
            this.cuestionarios[index].respuestasUsuario = respuestas[0];

            // Data para grafico de radar
            // Guarda la puntuacion de cada categoria evaluada del ultimo intento, mostrada en Porcentaje%
            arrayDataUltimoIntento.push((respuestas[0].puntuacionCategoria) * 10);

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
        this.flag = true;

      });
  };


  descargarReporte(): void {
    let fecha = new Date().toLocaleDateString();
    let doc = new jsPDF();
    let margins = {
      top: 15,
      bottom: 15,
      left: 15,
      width: 180
    };

    //            ** PORTADA **
    // Linea superior
    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 13, 200, 13);

    var imgLogo = new Image();
    imgLogo.src = '../../../../../assets/img/logo2.jpg';
    doc.addImage(imgLogo, 65, 40, 75, 45);

    doc.setFontSize(20);
    doc.setFontStyle("bold");
    doc.setTextColor(75, 86, 100);
    doc.text("INFORME DE RESULTADOS", 105, 110, null, null, "center");
    doc.text("DE MADUREZ DIGITAL", 105, 120, null, null, "center");

    doc.setTextColor(0, 0, 0);
    doc.setFontStyle("bold");
    doc.text(this.empresa.razon_social, 105, 140, null, null, "center");

    doc.setFontStyle("bold");
    doc.setTextColor(75, 86, 100);
    doc.text(fecha, 105, 160, null, null, "center");

    // Linea inferior
    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 285, 200, 285);
    // Crea otra pag
    doc.addPage();

    //          ** 1. ÍNDICE **
    let textoIndice = "    1. Índice\n    2. Introducción\n    3. Resultados\n       3.1. Nivel madurez digital de categoría\n       3.2. Gráfico de nivel de madurez digital por ejes\n    4. Recomendaciones\n";
    // Linea superior
    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 13, 200, 13);

    doc.setFontSize(20);
    doc.setFontStyle("bold");
    doc.setTextColor(75, 86, 100);
    doc.text(15, 30, "1. ÍNDICE");
    var splitText = doc.splitTextToSize(textoIndice, 260);
    doc.setTextColor(123, 129, 146);
    doc.setFontSize(14);
    doc.text(15, 45, splitText);
    // Separa el texto en otras lineas **Ajustar probando
    var splitText = doc.splitTextToSize(textoIndice, 260);
    doc.setFontSize(14);
    doc.text(15, 45, splitText);

    // Linea inferior
    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 285, 200, 285);
    // Crea otra pag
    doc.addPage();

    //          ** 2. INTRODUCCION **
    let textoIntro = "El ODMM proporciona una cobertura en profundidad de todos los aspectos de la madurez digital de una organización, proporcionando a una empresa una visión cuantitativa y detallada de las brechas de madurez entre el estado actual y sus aspiraciones empresariales.\n\nEste resultado es una lista cuantificada y priorizada de las brechas entre la aspiración de negocio digital de la organización objetivo y su actual nivel de madurez digital. Estas brechas pueden ser utilizadas por la organización para crear un plan de acción para la transformación digital, permitiéndole transformarse de forma rentable en el negocio digital que aspira a ser.\n";
    // Linea superior
    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 13, 200, 13);

    doc.setFontSize(20);
    doc.setFontStyle("bold");
    doc.setTextColor(75, 86, 100);
    doc.text(15, 30, "2. INTRODUCCIÓN");
    doc.setTextColor(0, 0, 0);
    doc.setFontStyle("normal");
    var splitText = doc.splitTextToSize(textoIntro, 290);
    doc.setFontSize(12);
    doc.text(15, 40, splitText);

    var imgMarco = new Image();
    imgMarco.src = '../../../../../assets/img/marcoES.jpg';
    doc.addImage(imgMarco, 15, 90, 175, 180);

    // Linea inferior
    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 285, 200, 285);
    // Crea otra pag
    doc.addPage();

    //          ** 2. INTRODUCCION 2 **
    let textCategorias = "     1. Dinamismo estratégico: Evalúa hasta qué punto la organización puede definir e implementar estrategias digitales eficaces basadas en una visión corporativa y un conjunto de objetivos claros.\n\n     2. Centrado en el cliente: Evalúa hasta qué punto la organización utiliza activamente los conocimientos del cliente para ofrecer una experiencia ROADS personalizada a sus clientes. La ODMM asume que los mejores negocios digitales hacen esto a través de un enfoque en la marca, la experiencia del cliente y el gobierno de la experiencia.\n\n     3. Cultura digital, talento y habilidades: Esta categoría mide las herramientas, habilidades y procesos necesarios para capacitar a una fuerza laboral digital, evaluando cómo una organización contrata, retiene y motiva a los miembros de su equipo.\n\n     4. Innovación y entrega: Esta categoría evalúa la capacidad de la organización para crear y ofrecer de forma rápida y eficaz productos y servicios digitales innovadores junto con un ecosistema de socios.\n\n     5. Big Data e IA: Evalúa el grado en que la organización utiliza los datos para crear negocios a través del impulso de la eficacia operativa y la reducción de costes, y a través de ingresos crecientes.\n\n     6. Liderazgo Tecnológico: Esta categoría evalúa hasta qué punto la organización es capaz de adoptar nuevas tecnologías digitales junto con un gobierno efectivo y bien definido para ofrecer operaciones totalmente automatizadas, escalables y fiables."
    // Linea superior
    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 13, 200, 13);

    doc.text(15, 30, "ODMM se divide en seis categorías principales:");
    var splitText2 = doc.splitTextToSize(textCategorias, 180);
    doc.setFontSize(12);
    doc.text(15, 40, splitText2);

    // Linea inferior
    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 285, 200, 285);
    // Crea otra pag
    doc.addPage();

    //          ** 3. RESULTADOS **
    // Linea superior
    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 13, 200, 13);

    let textoResultados = "A continuación se ofrece los resultados de la categoría evaluada.";

    doc.setFontSize(20);
    doc.setFontStyle("bold");
    doc.setTextColor(75, 86, 100);
    doc.text(15, 30, "3. RESULTADOS");
    doc.setFontStyle("normal");
    doc.setTextColor(0, 0, 0);
    var splitText = doc.splitTextToSize(textoResultados, 280);
    doc.setFontSize(12);
    doc.text(15, 40, splitText);

    //          ** 3.1 Grafico porcentaje **
    let textoPorcentaje = `El nivel de madurez digital de la categoria ${this.categoria['categoriaNombre']} es:`;

    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 13, 200, 13);

    doc.setFontSize(16);
    doc.setFontStyle("bold");
    doc.setTextColor(75, 86, 100);
    doc.text(15, 50, "3.1. Nivel madurez digital de categoría");
    doc.setFontStyle("normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    var splitText = doc.splitTextToSize(textoPorcentaje, 280);
    doc.text(15, 60, splitText);

    let porcentajeString = (this.puntuaje).toString() + '%';

    doc.setLineWidth(0)
    doc.setDrawColor(0)
    doc.setFillColor(139, 196, 65);
    doc.roundedRect(80, 70, 40, 40, 19, 19, 'FD');
    doc.setFillColor(196, 233, 149);
    doc.roundedRect(85, 75, 30, 30, 14, 14, 'FD');
    doc.setFontSize(23);
    doc.setFontStyle("bold");
    doc.setTextColor(255, 255, 255);
    doc.text(93, 93, porcentajeString);

    //          ** 3.2 Grafico radar **
    let textoRadar = "Aquí puede ver el nivel de madurez obtenido por cada categoría evaluada.\nLos datos reflejados son los porcentajes del último y penúltimo intento de sus evaluaciones por cada categoría.";

    doc.setFontSize(16);
    doc.setFontStyle("bold");
    doc.setTextColor(75, 86, 100);
    doc.text(15, 125, "3.2. Gráfico de nivel de madurez digital por categoría");
    doc.setFontStyle("normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    var splitText = doc.splitTextToSize(textoRadar, 180);
    doc.text(15, 135, splitText);
    // Grafico radar
    let canvas: any = document.getElementById("canvas");
    let canvasImg = canvas.toDataURL("image/png");
    doc.addImage(canvasImg, 'PNG', 40, 160, 120, 100);

    // Linea inferior
    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 285, 200, 285);
    // Crea otra pag
    doc.addPage();


    //          ** 4. RECOMENDACIONES **
    // Linea superior
    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 13, 200, 13);

    doc.setFontSize(20);
    doc.setFontStyle("bold");
    doc.setTextColor(75, 86, 100);
    doc.text(15, 30, "4. RECOMENDACIONES");
    doc.setTextColor(0, 0, 0);
    doc.setFontStyle("normal");
    var splitText = doc.splitTextToSize('A continuación se ofrece un resumen del conjunto de recomendaciones de mejora aproximadas a cada métrica registrada en el cuestionario de autodiagnóstico.', 300);
    doc.setFontSize(12);
    doc.text(15, 40, splitText);


    doc.fromHTML(this.respuestasData.nativeElement,
      margins.left, // x coord
      55, {
      // y coord
      width: margins.width,
    }, () => {

      // Linea inferior
      doc.setDrawColor(139, 196, 65);
      doc.setLineWidth(1.5);
      doc.line(10, 285, 200, 285);

      // TODO Permite ver el .PDF
      // var blob = doc.output("blob");
      // window.open(URL.createObjectURL(blob));

      // TODO Guarda el .PDF
      doc.save('Reporte_EncuestaODMM.pdf');
    },
      margins
    );

  }


  regresar() {
    this.router.navigate(["/reportes"]);
  }

}
