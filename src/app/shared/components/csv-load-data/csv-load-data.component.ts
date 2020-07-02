import { Component, OnInit, ViewChild, Input } from "@angular/core";
import { NgxCsvParser, NgxCSVParserError } from "ngx-csv-parser";

import { SubcategoriasService } from "app/core/services/cuestionario/subcategorias/subcategorias.service";
import { CapacidadesService } from "app/core/services/cuestionario/capacidades/capacidades.service";
import { MetricasService } from "app/core/services/cuestionario/metricas/metricas.service";


import { Subcategoria } from 'app/shared/models/subcategoria';
import { Capacidad } from 'app/shared/models/capacidad';
import { Metrica, Respuesta } from 'app/shared/models/metrica';


@Component({
  selector: "app-csv-load-data",
  templateUrl: "./csv-load-data.component.html",
  styles: [],
})
export class CsvLoadDataComponent implements OnInit {
  // Permite asignar el tipo de archivos a agregar al componente mediante este parametro
  @Input("tipo") tipo: string;

  // Guarda la data del archivo csv
  csvRecords: any[] = [];
  // Permite guardar el archivo en formato JSON
  header = true;

  fileSelected: boolean = false;

  @ViewChild("fileImportInput", { static: false }) fileImportInput: any;

  constructor(
    private ngxCsvParser: NgxCsvParser,
    private subcategoriasServices: SubcategoriasService,
    private capacidadesServices: CapacidadesService,
    private metricasServices: MetricasService
  ) { }

  ngOnInit(): void { }

  respuestas: Respuesta[] = [];

  // Sus aplicaciones introducen el cambio de escucha para el archivo CSV
  fileChangeListener($event: any): void {
    // Seleccione los archivos del evento...
    const files = $event.srcElement.files;


    if (files) {
      this.fileSelected = true;
    }

    // @delimiter: configura el delimitador del archivo
    this.ngxCsvParser
      .parse(files[0], { header: this.header, delimiter: ";" })
      .pipe()
      .subscribe(
        (result: Array<any>) => {
          //console.log('Result', result);

          // Agrega a la lista los resultados
          this.csvRecords = result;
        },
        (error: NgxCSVParserError) => {
          console.log("Error", error);
        }
      );
  }

  cargarData() {
    switch (this.tipo) {
      case "Subcategoria":
        this.csvRecords.forEach((element: Subcategoria) => {
          element.peso = Number(element.peso)
          this.subcategoriasServices.createSubcategoriaDB(element);
        });
        break;
      case "Capacidades":
        this.csvRecords.forEach((element: Capacidad) => {
          element.peso = Number(element.peso)
          this.capacidadesServices.createCapacidadDB(element);
        });
        break;
      case "Metricas":
        //console.log(this.csvRecords);

        // CsvRecords trae un array de objetos del csv
        this.csvRecords.forEach((element: any) => {

          let respuestas: Respuesta[] = [];

          let respuesta1: Respuesta = {
            opcion: element.opcion1,
            pesoRespuesta: 0,
            recomendacion: element.opcion2
          };
          respuestas.push(respuesta1);

          let respuesta2: Respuesta = {
            opcion: element.opcion2,
            pesoRespuesta: 2,
            recomendacion: element.opcion3
          };
          respuestas.push(respuesta2);

          let respuesta3: Respuesta = {
            opcion: element.opcion3,
            pesoRespuesta: 4,
            recomendacion: element.opcion4
          };
          respuestas.push(respuesta3);

          let respuesta4: Respuesta = {
            opcion: element.opcion4,
            pesoRespuesta: 6,
            recomendacion: element.opcion5
          };
          respuestas.push(respuesta4);

          let respuesta5: Respuesta = {
            opcion: element.opcion5,
            pesoRespuesta: 8,
            recomendacion: element.opcion6
          };
          respuestas.push(respuesta5);

          let respuesta6: Respuesta = {
            opcion: element.opcion6,
            pesoRespuesta: 10,
            recomendacion: '¡Felicidades, estás manejando esta métrica adecuada y eficientemente, sigue así!'
          };
          respuestas.push(respuesta6);

          let metrica: Metrica = {
            nombre: element.nombre,
            pregunta: element.pregunta,
            pesoPregunta: element.peso,
            respuestas: respuestas,
            idCapacidad: element.idCapacidad
          }

          this.metricasServices.createMetricaDB(metrica);
        });


        break;
      default:
        break;
    }
  }
}
