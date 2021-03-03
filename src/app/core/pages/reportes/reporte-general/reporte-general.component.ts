import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { Router } from "@angular/router";

import { Empresa } from "app/shared/models/empresa";
import {
  RespuestasUsuario,
  Cuestionario,
} from "app/shared/models/cuestionario";

import { CuestionarioService } from "app/core/services/cuestionario/cuestionario.service";
import { EmpresaService } from "app/core/services/user/empresas/empresa.service";
import { UsuarioService } from "app/core/services/user/usuarios/usuario.service";

import { ChartDataSets, RadialChartOptions } from "chart.js";
import { Label } from "ng2-charts";
// PDF
import * as jsPDF from "jspdf";
// Lodash
import { map } from "rxjs/operators";
import * as _ from "lodash";


@Component({
  selector: "app-reporte-general",
  templateUrl: "./reporte-general.component.html",
  styles: [``],
})
export class ReporteGeneralComponent implements OnInit {
  @ViewChild("respuestasData") respuestasData: ElementRef;
  @ViewChild("graficoCategorias") graficoCategorias: ElementRef;
  @ViewChild("graficoSectores") graficoSectores: ElementRef;

  flag: boolean = false;

  cuestionarios: Cuestionario[] = [];
  cuestionariosUsers: Cuestionario[] = [];
  respuestasUsuario: RespuestasUsuario;
  metricas: any[] = [];

  empresas: Empresa[] = [];
  empresa: Empresa;
  empresasUsers: Empresa[] = [];

  cuestionariosUsersSector: any[] = [];

  puntuancionGlobal: number;

  puntuacionesUsers: any[] = [];

  // Colores para los puntuajes
  colors = ["#f28020", "#8bc441", "#e7c120", "#1a97d5", "#12b5b2", "#12ae4b"];
  colorsOpacity = [
    "#ecb180",
    "#c4e995",
    "#e9d687",
    "#94cbe6",
    "#95d5c0",
    "#a0d5b3",
  ];

  // Radar
  public radarChartOptions: RadialChartOptions = {
    responsive: true,
  };

  public radarChartLabels: Label[] = [];

  public radarChartData: ChartDataSets[] = [
    { data: [], label: "Última evaluación" },
    { data: [], label: "Penúltima evaluación" },
  ];

  public radarChartLabelsSectores: Label[] = [];

  public radarChartDataSectores: ChartDataSets[] = [
    { data: [], label: "Mi Empresa" },
    { data: [], label: "Empresas mismo sector" },
  ];
  usuarios: any[];

  constructor(
    private router: Router,
    private cuestionarioService: CuestionarioService,
    private empresaService: EmpresaService,
    private userService: UsuarioService
  ) { }

  ngOnInit(): void {
    this._cargarData();
  }

  private _cargarData() {
    this.empresaService.onEmpresaChanged.subscribe((empresas) => {

      this.empresas = empresas;
      this.empresa = empresas[0];
    });
    this.extraerData();
    // Extrae las empresas con el mismo sector industrial
    this.userService.onUsuariosChanged.subscribe((usuarios) => {
      this.usuarios = usuarios;
      this._calcularResultadosSectores(usuarios);
    });
  }

  // Consulta los cuestionarios y respuestas del usuario, con sus puntuaciones y recomendaciones
  private extraerData() {
    let arrayDataUltimoIntento: number[] = [];
    let arrayDataPnultimoIntento: number[] = [];

    let arrayPuntuacionGloblal: number[] = [];

    // Carga los cuestionarios evaluados por del usuario
    this.cuestionarioService
      .getCuestionarioUserLogedDB()
      .pipe(
        // Ordenad las categorias alfabeticamente
        map((data) => {
          data.sort((a, b) => {
            return a.categoriaNombre < b.categoriaNombre ? -1 : 1;
          });
          return data;
        })
      )
      .subscribe((cuestionarioUserDB: Cuestionario[]) => {
        this.cuestionarios = cuestionarioUserDB;

        // Recorre cada  evaluada
        this.cuestionarios.forEach((cuestionario: Cuestionario, index) => {
          // Labels para grafico de radar
          this.radarChartLabels.push(cuestionario.categoriaNombre);

          // Obtiene las respuestas de cada
          this.cuestionarioService
            .getCuestionarioRespuestasDB(cuestionario.id)
            .subscribe((respuestas: any) => {
              // Asigna el ultimo intento de respuestas a cada  evaluada del usuario
              this.cuestionarios[index].respuestasUsuario = respuestas[0];

              this.flag = true;
              // Asigna las respuestas de cada
              this.metricas.push(
                this.cuestionarios[index].respuestasUsuario["metricas"]
              );

              //        Data para grafico de radar
              // Guarda la puntuacion de cada  evaluada del ultimo intento
              arrayDataUltimoIntento.push(
                Number((respuestas[0].puntuacionCategoria * 10).toFixed(2))
              );

              // Valida si no existe otro intento
              if (respuestas[1]) {
                // Guarda la puntuacion de cada  evaluada del penultimo intento
                arrayDataPnultimoIntento.push(
                  Number((respuestas[1].puntuacionCategoria * 10).toFixed(2))
                );
                //console.log("No tiene otro intento ");
              } else {
                arrayDataPnultimoIntento.push(0);
              }
              // Asigna las puntuaciones a la data del grafico de radar del ultimo y penultimo intento
              this.radarChartData[0].data = arrayDataUltimoIntento;
              this.radarChartData[1].data = arrayDataPnultimoIntento;


              this.radarChartDataSectores[0].data = arrayDataUltimoIntento;

              // TODO Madurez digital global
              //Agrega todas las puntuaciones de cada
              arrayPuntuacionGloblal.push(
                this.cuestionarios[index].respuestasUsuario["puntuacionCategoria"] * this.cuestionarios[index].peso
              );
              // Suma todos los elementos del calculo anterior
              this.puntuancionGlobal = arrayPuntuacionGloblal.reduce(
                (x, y) => x + y
              );
            });
        });
      });
  }

  // Permite calcular el promedio de los puntuajes de todas las categorias de los usuaios con el mismo sector empresarial
  private _calcularResultadosSectores(empresasUser) {
    let categorias;

    this.radarChartDataSectores[1].data = [];
    empresasUser.forEach((empresa) => {
      this.cuestionarioService
        .getCuestionarioUserID(empresa.idUser)
        .pipe(
          // Ordena las categorias alfabeticamente
          map((data) => {
            data.sort((a, b) => {
              return a.categoriaNombre < b.categoriaNombre ? -1 : 1;
            });
            return data;
          })
        )
        .subscribe((cuestionariosUser: Cuestionario[]) => {
          cuestionariosUser.forEach((cuestionario, index) => {
            this.puntuacionesUsers.push(cuestionario);
          });

          // Agrupa el array con el id de los nombres de cada categoria
          categorias = _.groupBy(this.puntuacionesUsers, "categoriaNombre");
          // Mapea la agrupacion anterior y 
          categorias = _.map(categorias, (element, key) => {
            const totalPromedio = element.reduce((x, y) =>
              Number(
                (
                  ((x.puntuacionCategoria + y.puntuacionCategoria) / element.length) * 10
                ).toFixed(2)
              )
            );
            // Valida si tiene datos o no
            if (!isNaN(totalPromedio)) this.radarChartDataSectores[1].data.push(totalPromedio);
            //console.log("🚀 ~ file: reporte-general.component.ts ~ line 220 ~ ReporteGeneralComponent ~ categorias=_.map ~ this.radarChartDataSectores[1].data", this.radarChartDataSectores[1].data)
            if (!isNaN(totalPromedio)) this.radarChartLabelsSectores.push(key);

            return { key, totalPromedio };
          });


        });
    });
  }

  regresar() {
    this.router.navigate(["/reportes"]);
  }

  descargarReporte(): void {
    let fecha = new Date().toLocaleDateString();
    let doc = new jsPDF();
    let margins = {
      top: 15,
      bottom: 15,
      left: 15,
      width: 175,
    };

    //            **PORTADA**
    // Linea superior
    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 13, 200, 13);

    var imgLogo = new Image();
    imgLogo.src = "../../../../../assets/img/logo2.jpg";
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
    let textoIndice =
      "    1. Índice\n    2. Introducción\n    3. Resultados\n    4. Benchmarking\n       4.1. Nivel madurez digital por categorías\n       4.2. Nivel madurez digital por sector industrial\n    5. Recomendaciones\n";
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

    // Linea inferior
    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 285, 200, 285);
    // Crea otra pag
    doc.addPage();

    //          ** 2. INTRODUCCION **
    let textoIntro =
      "El ODMM proporciona una cobertura en profundidad de todos los aspectos de la madurez digital de una organización, proporcionando a una empresa una visión cuantitativa y detallada de las brechas de madurez entre el estado actual y sus aspiraciones empresariales.\n\nEste resultado es una lista cuantificada y priorizada de las brechas entre la aspiración de negocio digital de la organización objetivo y su actual nivel de madurez digital. Estas brechas pueden ser utilizadas por la organización para crear un plan de acción para la transformación digital, permitiéndole transformarse de forma rentable en el negocio digital que aspira a ser.\n";
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
    imgMarco.src = "../../../../../assets/img/marcoES.jpg";
    doc.addImage(imgMarco, 15, 90, 175, 180);

    // Linea inferior
    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 285, 200, 285);
    // Crea otra pag
    doc.addPage();

    //          ** 2. INTRODUCCION 2 **
    let texts =
      "     1. Dinamismo estratégico: Evalúa hasta qué punto la organización puede definir e implementar estrategias digitales eficaces basadas en una visión corporativa y un conjunto de objetivos claros.\n\n     2. Centrado en el cliente: Evalúa hasta qué punto la organización utiliza activamente los conocimientos del cliente para ofrecer una experiencia ROADS personalizada a sus clientes. La ODMM asume que los mejores negocios digitales hacen esto a través de un enfoque en la marca, la experiencia del cliente y el gobierno de la experiencia.\n\n     3. Cultura digital, talento y habilidades: Esta categoría mide las herramientas, habilidades y procesos necesarios para capacitar a una fuerza laboral digital, evaluando cómo una organización contrata, retiene y motiva a los miembros de su equipo.\n\n     4. Innovación y entrega: Esta categoría evalúa la capacidad de la organización para crear y ofrecer de forma rápida y eficaz productos y servicios digitales innovadores junto con un ecosistema de socios.\n\n     5. Big Data e IA: Evalúa el grado en que la organización utiliza los datos para crear negocios a través del impulso de la eficacia operativa y la reducción de costes, y a través de ingresos crecientes.\n\n     6. Liderazgo Tecnológico: Esta categoría evalúa hasta qué punto la organización es capaz de adoptar nuevas tecnologías digitales junto con un gobierno efectivo y bien definido para ofrecer operaciones totalmente automatizadas, escalables y fiables.";
    // Linea superior
    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 13, 200, 13);

    doc.text(15, 30, "ODMM se divide en seis categorías principales:");
    var splitText2 = doc.splitTextToSize(texts, 180);
    doc.setFontSize(12);
    doc.text(15, 40, splitText2);

    // Linea inferior
    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 285, 200, 285);
    // Crea otra pag
    doc.addPage();

    //          ** 3. RESULTADOS GLOBALES**
    // Linea superior
    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 13, 200, 13);

    let textoResultados =
      "A continuación se ofrece una valoración y análisis a detalle de los resultados obtenidos al realizar el cuestionario de autodiagnóstico, considerando cada respuesta reflejada en las preguntas de dicho cuestionario para la cuantificación del nivel de madurez digital de su negocio.";

    doc.setFontSize(20);
    doc.setFontStyle("bold");
    doc.setTextColor(75, 86, 100);
    doc.text(15, 30, "3. RESULTADOS DEL AUTODIAGNÓSTICO");
    doc.setFontStyle("normal");
    doc.setTextColor(0, 0, 0);
    var splitText = doc.splitTextToSize(textoResultados, 290);
    doc.setFontSize(12);
    doc.text(15, 40, splitText);

    var porcentCat1 = ' ';
    var porcentCat2 = ' ';
    var porcentCat3 = ' ';
    var porcentCat4 = ' ';
    var porcentCat5 = ' ';
    var porcentCat6 = ' ';

    var porcentCat1 = (this.cuestionarios[0].respuestasUsuario) ? Number(this.cuestionarios[0].respuestasUsuario["puntuacionCategoria"] * 10)
      .toFixed(0).toString() + "%"
      : ' ';
    // Porcentajes de madurez de cada categoria
    porcentCat2 =
      Number(
        this.cuestionarios[1].respuestasUsuario["puntuacionCategoria"] * 10
      )
        .toFixed(0)
        .toString() + "%";
    porcentCat3 =
      Number(
        this.cuestionarios[2].respuestasUsuario["puntuacionCategoria"] * 10
      )
        .toFixed(0)
        .toString() + "%";
    porcentCat4 =
      Number(
        this.cuestionarios[3].respuestasUsuario["puntuacionCategoria"] * 10
      )
        .toFixed(0)
        .toString() + "%";
    porcentCat5 =
      Number(
        this.cuestionarios[4].respuestasUsuario["puntuacionCategoria"] * 10
      )
        .toFixed(0)
        .toString() + "%";
    porcentCat6 =
      Number(
        this.cuestionarios[5].respuestasUsuario["puntuacionCategoria"] * 10
      )
        .toFixed(0)
        .toString() + "%";

    let porcentajeGlobal =
      Number(this.puntuancionGlobal * 10)
        .toFixed(0)
        .toString() + "%";

    var catTotalText = "NIVEL DE MADUREZ DIGITAL DEL NEGOCIO";
    var cat1Text = (this.cuestionarios[0]) ? `Categoría: ${this.cuestionarios[0].categoriaNombre}` : ' ';
    var cat2Text = (this.cuestionarios[1]) ? `Categoría: ${this.cuestionarios[1].categoriaNombre}` : ' ';
    var cat3Text = (this.cuestionarios[2]) ? `Categoría: ${this.cuestionarios[2].categoriaNombre}` : ' ';
    var cat4Text = (this.cuestionarios[3]) ? `Categoría: ${this.cuestionarios[3].categoriaNombre}` : ' ';
    var cat5Text = (this.cuestionarios[4]) ? `Categoría: ${this.cuestionarios[4].categoriaNombre}` : ' ';
    var cat6Text = (this.cuestionarios[5]) ? `Categoría: ${this.cuestionarios[5].categoriaNombre}` : ' ';

    // Porcentaje nivel madurez totalPromedio
    doc.setFontSize(16);
    doc.setTextColor(156, 58, 185);
    doc.setFontStyle("bold");
    var splitText = doc.splitTextToSize(catTotalText, 78);
    doc.text(75, 65, splitText);

    doc.setLineWidth(0);
    doc.setDrawColor(0);
    doc.setFillColor(230, 230, 14);
    doc.roundedRect(80, 75, 50, 50, 24, 24, "FD");
    doc.setFillColor(254, 255, 225);
    doc.roundedRect(85, 80, 40, 40, 19, 19, "FD");
    doc.setFontSize(30);
    doc.setFontStyle("bold");
    doc.setTextColor(0, 0, 0);
    doc.text(96, 102, porcentajeGlobal);

    //        ** Porcentajes nivel madurez por categorias **
    // Categoria 1
    doc.setFontSize(16);
    doc.setTextColor(156, 58, 185);
    doc.setFontStyle("bold");
    var splitText = doc.splitTextToSize(cat1Text, 55);
    doc.text(22, 140, splitText);

    doc.setLineWidth(0);
    doc.setDrawColor(0);
    doc.setFillColor(242, 128, 32);
    doc.roundedRect(20, 160, 40, 40, 19, 19, "FD");
    doc.setFillColor(236, 177, 128);
    doc.roundedRect(25, 165, 30, 30, 14, 14, "FD");
    doc.setFontSize(24);
    doc.setFontStyle("bold");
    doc.setTextColor(255, 255, 255);
    doc.text(32, 182, porcentCat1);

    // Categoria 2
    doc.setFontSize(16);
    doc.setTextColor(156, 58, 185);
    doc.setFontStyle("bold");
    var splitText = doc.splitTextToSize(cat2Text, 60);
    doc.text(80, 140, splitText);

    doc.setLineWidth(0);
    doc.setDrawColor(0);
    doc.setFillColor(139, 196, 65);
    doc.roundedRect(85, 160, 40, 40, 19, 19, "FD");
    doc.setFillColor(196, 233, 149);
    doc.roundedRect(90, 165, 30, 30, 14, 14, "FD");
    doc.setFontSize(24);
    doc.setFontStyle("bold");
    doc.setTextColor(255, 255, 255);
    doc.text(98, 182, porcentCat2);

    // Categoria 3
    doc.setFontSize(16);
    doc.setTextColor(156, 58, 185);
    doc.setFontStyle("bold");
    var splitText = doc.splitTextToSize(cat3Text, 60);
    doc.text(146, 140, splitText);

    doc.setLineWidth(0);
    doc.setDrawColor(0);
    doc.setFillColor(231, 193, 32);
    doc.roundedRect(150, 160, 40, 40, 19, 19, "FD");
    doc.setFillColor(233, 214, 135);
    doc.roundedRect(155, 165, 30, 30, 14, 14, "FD");
    doc.setFontSize(24);
    doc.setFontStyle("bold");
    doc.setTextColor(255, 255, 255);
    doc.text(162, 182, porcentCat3);

    // Categoria 4
    doc.setFontSize(16);
    doc.setTextColor(156, 58, 185);
    doc.setFontStyle("bold");
    var splitText = doc.splitTextToSize(cat4Text, 55);
    doc.text(22, 215, splitText);

    doc.setLineWidth(0);
    doc.setDrawColor(0);
    doc.setFillColor(26, 151, 213);
    doc.roundedRect(20, 235, 40, 40, 19, 19, "FD");
    doc.setFillColor(148, 203, 230);
    doc.roundedRect(25, 240, 30, 30, 14, 14, "FD");
    doc.setFontSize(24);
    doc.setFontStyle("bold");
    doc.setTextColor(255, 255, 255);
    doc.text(32, 257, porcentCat4);

    // Categoria 5
    doc.setFontSize(16);
    doc.setTextColor(156, 58, 185);
    doc.setFontStyle("bold");
    var splitText = doc.splitTextToSize(cat5Text, 60);
    doc.text(80, 215, splitText);

    doc.setLineWidth(0);
    doc.setDrawColor(0);
    doc.setFillColor(18, 181, 178);
    doc.roundedRect(85, 235, 40, 40, 19, 19, "FD");
    doc.setFillColor(149, 213, 192);
    doc.roundedRect(90, 240, 30, 30, 14, 14, "FD");
    doc.setFontSize(24);
    doc.setFontStyle("bold");
    doc.setTextColor(255, 255, 255);
    doc.text(98, 257, porcentCat5);

    // Categoria 6
    doc.setFontSize(16);
    doc.setTextColor(156, 58, 185);
    doc.setFontStyle("bold");
    var splitText = doc.splitTextToSize(cat6Text, 60);
    doc.text(146, 215, splitText);

    doc.setLineWidth(0);
    doc.setDrawColor(0);
    doc.setFillColor(18, 174, 75);
    doc.roundedRect(150, 235, 40, 40, 19, 19, "FD");
    doc.setFillColor(160, 213, 179);
    doc.roundedRect(155, 240, 30, 30, 14, 14, "FD");
    doc.setFontSize(24);
    doc.setFontStyle("bold");
    doc.setTextColor(255, 255, 255);
    doc.text(162, 257, porcentCat6);

    // Linea inferior
    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 285, 200, 285);
    // Crea otra pag
    doc.addPage();

    //                ** 3.1 Grafico radar **

    // Linea superior
    doc.setDrawColor(139, 196, 65);
    doc.setLineWidth(1.5);
    doc.line(10, 13, 200, 13);

    doc.setFontSize(20);
    doc.setFontStyle("bold");
    doc.setTextColor(75, 86, 100);
    doc.text(15, 30, "4. BENCHMARKING");

    let textoRadar = "Aquí puede ver el nivel de madurez obtenido por cada categoría evaluada.\nLos datos reflejados son los porcentajes del último y penúltimo intento de sus evaluaciones por cada categoría.";
    let textoSector = "Aquí puede ver el nivel de madurez obtenido por cada categoría evaluada de su negocio con el resto de empresas de tu sector diagnosticadas.";

    doc.setFontSize(16);
    doc.setFontStyle("bold");
    doc.setTextColor(75, 86, 100);
    doc.text(15, 40, "4.1. Gráfico de nivel de madurez digital por categorías");
    doc.setFontStyle("normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    var splitText = doc.splitTextToSize(textoRadar, 180);
    doc.text(15, 50, splitText);

    // Grafico radar
    let canvas: any = this.graficoCategorias.nativeElement;
    let canvasImg = canvas.toDataURL("image/png");
    doc.addImage(canvasImg, "PNG", 25, 60, 160, 90);

    doc.setFontSize(16);
    doc.setFontStyle("bold");
    doc.setTextColor(75, 86, 100);
    doc.text(15, 165, "4.2. Nivel madurez digital por sector industrial");
    doc.setFontStyle("normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    var splitText = doc.splitTextToSize(textoSector, 180);
    doc.text(15, 175, splitText);

    // Grafico Sector
    let canvas2: any = this.graficoSectores.nativeElement;
    let canvasSector = canvas2.toDataURL("image/png");
    doc.addImage(canvasSector, "PNG", 25, 185, 160, 90);

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
    doc.text(15, 30, "5. RECOMENDACIONES");
    doc.setTextColor(0, 0, 0);
    doc.setFontStyle("normal");
    var splitText = doc.splitTextToSize(
      "A continuación se ofrece, de manera general, un resumen del conjunto de recomendaciones de mejora aproximadas a cada métrica registradas en las distintas preguntas del autodiagnóstico.",
      290
    );
    doc.setFontSize(12);
    doc.text(15, 40, splitText);

    // Captura el #div de respuestas
    doc.fromHTML(
      this.respuestasData.nativeElement,
      margins.left, // x coord
      50,
      {
        // y coord
        width: margins.width,
      },
      () => {
        // Linea inferior
        doc.setDrawColor(139, 196, 65);
        doc.setLineWidth(1.5);
        doc.line(10, 285, 200, 285);

        // var blob = doc.output("blob");
        // window.open(URL.createObjectURL(blob));
        // TODO Guarda el .PDF
        doc.save('ReporteGeneral_EncuestaODMM.pdf');
      },
      margins
    );
  }
}
