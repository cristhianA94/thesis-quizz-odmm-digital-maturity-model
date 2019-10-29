import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
//Libreria para leer CSV
import { Papa } from 'ngx-papaparse';

import {
  Cuestionario,
  Recomendacion,
  Respuesta,
  Categoria,
  Metrica
} from './../../../models/cuestionario';
import { CSVRecord } from './../../../models/readCSV';

@Component({
  selector: 'app-cuestionario',
  templateUrl: './cuestionario.component.html',
  styleUrls: ['./cuestionario.component.scss']
})
export class CuestionarioComponent implements OnInit {

  cuestionarioForm: FormGroup;

  constructor(
    fb: FormBuilder,
    private formbuild: FormBuilder,
    private papa: Papa
  ) { }

  ngOnInit() {
    this.buildForm();
  }

  buildForm(): void {
    /*
    Validators.pattern:
    ^ - inicio de cadena (implícito en el patrón de expresión regular de cadena)
    (?=\D*\d) - debe haber 1 dígito
    (?=[^a-z]*[a-z]) - debe haber 1 letra minúscula ASCII
    (?=[^A-Z]*[A-Z]) - debe haber 1 letra ASCII mayúscula
    .{8,30} - 8 a 30 caracteres distintos de los caracteres de salto de línea
    $ - fin de cadena (implícito en el patrón de expresión regular de cadena).
     */

    this.cuestionarioForm = this.formbuild.group({
      respuesta1: ['', Validators.required],
      respuesta2: ['', Validators.required],
      respuesta3: ['', Validators.required],
      respuesta4: ['', Validators.required],
      respuesta5: ['', Validators.required],
    });

  }

  favoriteSeason: string;
  seasons: string[] = ['Winter', 'Spring', 'Summer', 'Autumn'];

  cuestionario: Cuestionario[] = [

  ]

  categorias: string[] = [
    'Big Data e IA',
    'Centrado en el cliente',
    'Cultura digital, talento y habilidades',
    'Innovación y entrega',
    'Dinamismo estratégico',
    'Liderazgo Tecnológico'
  ];

  ConvertCSVtoJSON() {
    console.log(JSON.stringify(this.test));
    // let csvData = '"Hello","World!"';
    // this.papa.parse(csvData, {
    //   complete: (results) => {
    //     console.log('Parsed  : ', results.data[0][1]);
    //     // console.log(results.data.length);
    //   }
    // });
  }
  test = [];

  //Método para leer CSV y transformarlo a JSON
  handleFileSelect(evt) {
    let files = evt.target.files; // FileList object
    let file = files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (event: any) => {
      let csv = event.target.result; // Content of CSV file
      this.papa.parse(csv, {
        skipEmptyLines: true,
        header: true,
        complete: (results) => {
          for (let i = 0; i < results.data.length; i++) {
            let orderDetails = {
              order_id: results.data[i].Address,
              age: results.data[i].Age
            };
            this.test.push(orderDetails);
          }
          // console.log(this.test);
          console.log('Parsed: k', results.data);
        }
      });
    }
  }






}
