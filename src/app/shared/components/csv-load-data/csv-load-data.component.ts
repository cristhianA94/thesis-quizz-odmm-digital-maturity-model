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
        this.csvRecords.forEach((element) => {
          this.subcategoriasServices.createSubcategoriaDB(
            element as Subcategoria
          );
        });
        break;
      case "Capacidades":
        this.csvRecords.forEach((element) => {
          this.capacidadesServices.createCapacidadDB(element as Capacidad);
        });
        break;
      case "Metricas":
        //console.log(this.csvRecords);
        let peso = 0;

        // CsvRecords trae un array de objetos del csv
        this.csvRecords.forEach((element: any, i: number) => {

          let respuestas: Respuesta[] = [];

          let respuesta: Respuesta = {
            opcion: element.opcion1,
            peso: peso,
            recomendacion: element.opcion2
          };
          respuestas.push(respuesta);

          let metrica: Metrica = {
            nombre: element.nombre,
            pregunta: element.pregunta,
            peso: element.peso,
            respuestas: respuestas,
            idCapacidad: element.idCapacidad
          }


          console.log(metrica);
          //this.metricasServices.createMetricaDB(element as Metrica);
        });


        break;
      default:
        break;
    }
  }
}
