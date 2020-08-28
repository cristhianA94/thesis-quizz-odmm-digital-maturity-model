import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RespuestasUsuario, Cuestionario } from 'app/shared/models/cuestionario';
import { CuestionarioService } from 'app/core/services/cuestionario/cuestionario.service';

import { ChartDataSets, RadialChartOptions } from 'chart.js';
import { Label } from 'ng2-charts';
// PDF
import * as jsPDF from 'jspdf';

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

    // TODO cargar data en grafico dependiendo del id
    let idCuestionario = localStorage.getItem("cuestionario");
    let idRespuesta = this.actRouter.snapshot.paramMap.get('id');
    let arrayDataUltimoIntento: number[] = [];
    let arrayDataPnultimoIntento: number[] = [];

    // Carga las respuesta del usuario del cuestionario seleccionado
    // TODO obtener idUserCuestionario del local y hacer consulta dependiendo de ese usuario
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
      this.flag = true;

      //console.log(this.radarChartData);
    });
  };

  public abrirPDF(): void {
    let fecha = new Date().toLocaleDateString();
    let doc = new jsPDF();
    let margins = {
      top: 15,
      bottom: 15,
      left: 15,
      width: 180
    };

    //            **PORTADA**
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
    doc.text("Nombre Empresa", 105, 140, null, null, "center");

    doc.setFontStyle("bold");
    doc.setTextColor(75, 86, 100);
    doc.text(fecha, 105, 160, null, null, "center");

    // Linea inferior
    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 285, 200, 285);
    // Crea otra pag
    doc.addPage();

    //          **INTRODUCCION**
    let texto = "El ODMM proporciona una cobertura en profundidad de todos los aspectos de la madurez digital de una organización, proporcionando a una empresa una visión cuantitativa y detallada de las brechas de madurez entre el estado actual y sus aspiraciones empresariales.\n\nEste resultado es una lista cuantificada y priorizada de las brechas entre la aspiración de negocio digital de la organización objetivo y su actual nivel de madurez digital. Estas brechas pueden ser utilizadas por la organización para crear un plan de acción para la transformación digital, permitiéndole transformarse de forma rentable en el negocio digital que aspira a ser.\n";
    // Linea superior
    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 13, 200, 13);

    // Text ODMM
    doc.setFontSize(20);
    doc.setFontStyle("bold");
    doc.setTextColor(75, 86, 100);
    doc.text(15, 30, "1. INTRODUCCIÓN");
    doc.setTextColor(0, 0, 0);
    doc.setFontStyle("normal");
    var splitText = doc.splitTextToSize(texto, 260);
    doc.setFontSize(14);
    doc.text(15, 45, splitText);

    doc.text(15, 110, "ODMM se divide en seis categorías principales:");
    let textCategorias = "     1. Dinamismo estratégico: Evalúa hasta qué punto la organización puede definir e implementar estrategias digitales eficaces basadas en una visión corporativa y un conjunto de objetivos claros.\n\n     2. Centrado en el cliente: Evalúa hasta qué punto la organización utiliza activamente los conocimientos del cliente para ofrecer una experiencia ROADS personalizada a sus clientes. La ODMM asume que los mejores negocios digitales hacen esto a través de un enfoque en la marca, la experiencia del cliente y el gobierno de la experiencia.\n\n     3. Cultura digital, talento y habilidades: Esta dimensión mide las herramientas, habilidades y procesos necesarios para capacitar a una fuerza laboral digital, evaluando cómo una organización contrata, retiene y motiva a los miembros de su equipo.\n\n     4. Innovación y entrega: Esta dimensión evalúa la capacidad de la organización para crear y ofrecer de forma rápida y eficaz productos y servicios digitales innovadores junto con un ecosistema de socios.\n\n     5. Big Data e IA: Evalúa el grado en que la organización utiliza los datos para crear negocios a través del impulso de la eficacia operativa y la reducción de costes, y a través de ingresos crecientes.\n\n     6. Liderazgo Tecnológico: Esta dimensión evalúa hasta qué punto la organización es capaz de adoptar nuevas tecnologías digitales junto con un gobierno efectivo y bien definido para ofrecer operaciones totalmente automatizadas, escalables y fiables."
    var splitText2 = doc.splitTextToSize(textCategorias, 180);
    doc.setFontSize(14);
    doc.text(15, 120, splitText2);

    // Linea inferior
    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 285, 200, 285);
    // Crea otra pag
    doc.addPage();

    //          **RESPUESTAS**
    // Linea superior
    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 13, 200, 13);


    doc.fromHTML(this.respuestasData.nativeElement,
      margins.left, // x coord
      margins.top, {
      // y coord
      width: margins.width,
    }, () => {
      // Crea otra pag
      doc.addPage();
      //          **GRAFICO**
      // Linea superior
      doc.setDrawColor(139, 196, 65);
      doc.setLineWidth(1.5);
      doc.line(10, 13, 200, 13);

      let textoGraficos = "A continuación se ofrece un análisis comparativo del nivel de madurez digital de tu negocio respecto a otras empresas, tomando como referencia distintos criterios.\n\nDebes tener en cuenta que sólo aparecerán comparaciones con otras empresas si se tienen los datos suficientes para ello, por lo que pueden aparecer gráficos comparativos sin datos.";

      doc.setFontSize(20);
      doc.setFontStyle("bold");
      doc.setTextColor(75, 86, 100);
      doc.text(15, 30, "3. BENCHMARKING");
      doc.setTextColor(0, 0, 0);
      doc.setFontStyle("normal");
      doc.setFontSize(14);
      var splitText = doc.splitTextToSize(textoGraficos, 180);
      doc.setFontSize(14);
      doc.text(15, 40, splitText);

      doc.setFontSize(16);
      doc.setFontStyle("bold");
      doc.setTextColor(75, 86, 100);
      doc.text(15, 85, "3.1. Nivel de madurez digital por ejes");
      doc.setFontStyle("normal");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(15, 95, "Aquí puedes ver el nivel de madurez obtenido por cada dimensión evaluada.\nLos datos a exponer son los valores del último y penúltimo intento.");

      // Grafico radar
      let canvas: any = document.getElementById("canvas");
      let canvasImg = canvas.toDataURL("image/png");
      doc.addImage(canvasImg, 'PNG', 40, 115, 120, 90);

      //          **FIN**

      // TODO REVISAR en despliegue
      //doc.output('dataurlnewwindow');
      var blob = doc.output("blob");
      window.open(URL.createObjectURL(blob));
    },
      margins
    );
  }


  public descargarReporte(): void {
    let fecha = new Date().toLocaleDateString();
    let docDown = new jsPDF();

    //            **PORTADA**
    // Linea superior
    docDown.setDrawColor(139, 196, 65);
    docDown.setLineWidth(1.5);
    docDown.line(10, 13, 200, 13);

    var imgLogo = new Image();
    imgLogo.src = '../../../../../assets/img/logo2.jpg';
    docDown.addImage(imgLogo, 65, 40, 75, 45);

    docDown.setFontSize(20);
    docDown.setFontStyle("bold");
    docDown.setTextColor(75, 86, 100);
    docDown.text("INFORME DE RESULTADOS", 105, 110, null, null, "center");
    docDown.text("DE MADUREZ DIGITAL", 105, 120, null, null, "center");

    docDown.setTextColor(0, 0, 0);
    docDown.setFontStyle("bold");
    docDown.text("Nombre Empresa", 105, 140, null, null, "center");

    docDown.setFontStyle("bold");
    docDown.setTextColor(75, 86, 100);
    docDown.text(fecha, 105, 160, null, null, "center");

    // Linea inferior
    docDown.setDrawColor(139, 196, 65);
    docDown.setLineWidth(1.5);
    docDown.line(10, 285, 200, 285);
    // Crea otra pag
    docDown.addPage();

    //          **INTRODUCCION**
    let texto = "El ODMM proporciona una cobertura en profundidad de todos los aspectos de la madurez digital de una organización, proporcionando a una empresa una visión cuantitativa y detallada de las brechas de madurez entre el estado actual y sus aspiraciones empresariales.\n\nEste resultado es una lista cuantificada y priorizada de las brechas entre la aspiración de negocio digital de la organización objetivo y su actual nivel de madurez digital. Estas brechas pueden ser utilizadas por la organización para crear un plan de acción para la transformación digital, permitiéndole transformarse de forma rentable en el negocio digital que aspira a ser.\n";
    // Linea superior
    docDown.setDrawColor(139, 196, 65);
    docDown.setLineWidth(1.5);
    docDown.line(10, 13, 200, 13);

    // Text ODMM
    docDown.setFontSize(20);
    docDown.setFontStyle("bold");
    docDown.setTextColor(75, 86, 100);
    docDown.text(15, 30, "1. INTRODUCCIÓN");
    docDown.setTextColor(0, 0, 0);
    docDown.setFontStyle("normal");
    var splitText = docDown.splitTextToSize(texto, 260);
    docDown.setFontSize(14);
    docDown.text(15, 45, splitText);

    docDown.text(15, 110, "ODMM se divide en seis categorías principales:");
    let textCategorias = "     1. Dinamismo estratégico: Evalúa hasta qué punto la organización puede definir e implementar estrategias digitales eficaces basadas en una visión corporativa y un conjunto de objetivos claros.\n\n     2. Centrado en el cliente: Evalúa hasta qué punto la organización utiliza activamente los conocimientos del cliente para ofrecer una experiencia ROADS personalizada a sus clientes. La ODMM asume que los mejores negocios digitales hacen esto a través de un enfoque en la marca, la experiencia del cliente y el gobierno de la experiencia.\n\n     3. Cultura digital, talento y habilidades: Esta dimensión mide las herramientas, habilidades y procesos necesarios para capacitar a una fuerza laboral digital, evaluando cómo una organización contrata, retiene y motiva a los miembros de su equipo.\n\n     4. Innovación y entrega: Esta dimensión evalúa la capacidad de la organización para crear y ofrecer de forma rápida y eficaz productos y servicios digitales innovadores junto con un ecosistema de socios.\n\n     5. Big Data e IA: Evalúa el grado en que la organización utiliza los datos para crear negocios a través del impulso de la eficacia operativa y la reducción de costes, y a través de ingresos crecientes.\n\n     6. Liderazgo Tecnológico: Esta dimensión evalúa hasta qué punto la organización es capaz de adoptar nuevas tecnologías digitales junto con un gobierno efectivo y bien definido para ofrecer operaciones totalmente automatizadas, escalables y fiables."
    var splitText2 = docDown.splitTextToSize(textCategorias, 180);
    docDown.setFontSize(14);
    docDown.text(15, 120, splitText2);

    // Linea inferior
    docDown.setDrawColor(139, 196, 65);
    docDown.setLineWidth(1.5);
    docDown.line(10, 285, 200, 285);
    // Crea otra pag
    docDown.addPage();

    //          **RESPUESTAS**
    // Linea superior
    docDown.setDrawColor(139, 196, 65);
    docDown.setLineWidth(1.5);
    docDown.line(10, 13, 200, 13);

    let margins = {
      top: 15,
      bottom: 15,
      left: 15,
      width: 180
    };

    let handleElement = {
      '#IDquenosemuestra': function (element, renderer) {
        return true;
      }
    };

    docDown.fromHTML($('#respuestasData').get(0),
      margins.left, // x coord
      margins.top, {
      // y coord
      width: margins.width,
      // max width of content on PDF
      'elementHandlers': handleElement
    },
      () => {
        // Crea otra pag
        docDown.addPage();
        //          **GRAFICO**
        // Linea superior
        docDown.setDrawColor(139, 196, 65);
        docDown.setLineWidth(1.5);
        docDown.line(10, 13, 200, 13);

        let textoGraficos = "A continuación se ofrece un análisis comparativo del nivel de madurez digital de tu negocio respecto a otras empresas, tomando como referencia distintos criterios.\n\nDebes tener en cuenta que sólo aparecerán comparaciones con otras empresas si se tienen los datos suficientes para ello, por lo que pueden aparecer gráficos comparativos sin datos.";

        docDown.setFontSize(20);
        docDown.setFontStyle("bold");
        docDown.setTextColor(75, 86, 100);
        docDown.text(15, 30, "3. BENCHMARKING");
        docDown.setTextColor(0, 0, 0);
        docDown.setFontStyle("normal");
        docDown.setFontSize(14);
        var splitText = docDown.splitTextToSize(textoGraficos, 180);
        docDown.setFontSize(14);
        docDown.text(15, 40, splitText);

        docDown.setFontSize(16);
        docDown.setFontStyle("bold");
        docDown.setTextColor(75, 86, 100);
        docDown.text(15, 85, "3.1. Nivel de madurez digital por ejes");
        docDown.setFontStyle("normal");
        docDown.setFontSize(14);
        docDown.setTextColor(0, 0, 0);
        docDown.text(15, 95, "Aquí puedes ver el nivel de madurez obtenido por cada dimensión evaluada.\nLos datos a exponer son los valores del último y penúltimo intento.");

        // Grafico radar
        let canvas: any = document.getElementById("canvas");
        let canvasImg = canvas.toDataURL("image/png");
        docDown.addImage(canvasImg, 'PNG', 40, 115, 120, 90);

        //          **FIN**
        docDown.save('Reporte_EncuestaODMM.pdf');
      },
      margins
    );

  }

  regresar() {
    this.router.navigate(["/reportes"]);
  }

}
