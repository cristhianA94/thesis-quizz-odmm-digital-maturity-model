import { Component, OnInit, OnDestroy } from "@angular/core";
import { MatRadioChange, MatRadioButton } from '@angular/material/radio';

import { Subject } from "rxjs";
import { takeUntil, min } from "rxjs/operators";

// Models
import { Categoria } from 'app/shared/models/categoria';
import { Subcategoria } from 'app/shared/models/subcategoria';
import { Capacidad } from 'app/shared/models/capacidad';
import { Metrica, Respuesta } from 'app/shared/models/metrica';
import { Cuestionario } from 'app/shared/models/cuestionario';

import { CuestionarioService } from 'app/core/services/cuestionario/cuestionario.service';
import { RespuestasUsuario } from '../../../../shared/models/cuestionario';
import { Router } from '@angular/router';

@Component({
  selector: "app-dimension",
  templateUrl: "./dimension.component.html",
  styles: [
    `
      .radio-group {
        display: flex;
        flex-direction: column;
        margin: 15px 0;
      }

      .radio-button {
        margin: 5px;
      }
    `,
  ],
})
export class DimensionComponent implements OnInit, OnDestroy {

  private _unsubscribeAll: Subject<any>;
  idUser: string;
  // For disabled buttons
  buttons = Array(3);
  load: boolean = false;

  puntuajes: any[] = [];

  cuestionario: Cuestionario;
  categoria: Categoria;

  subcategoria: Subcategoria;
  subcategorias: Subcategoria[] = [];
  subcategoriasEvaluadas: Subcategoria[] = [];

  capacidades: Capacidad[] = [];
  capacidad: Capacidad = null;

  metricas: Metrica[] = [];

  respuestas: Respuesta[] = [];
  respuestasUsuario: RespuestasUsuario[] = [];
  respuestaUsuario: RespuestasUsuario;

  constructor(
    private cuestionarioService: CuestionarioService,
    private router: Router
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.idUser = localStorage.getItem("uidUser");
    this.cuestionarioService.onCuestionarioChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((cuestionario) => {
        this.categoria = cuestionario;
        this.subcategorias = this.categoria.subcategorias;
        //this.cuestionario = cuestionario;

      });
    this.load = true;

  }

  // Detecta las opciones elegida por cada subcategoria
  onChange(mrChange: MatRadioChange, i: number, subcategoria: Subcategoria) {
    let mrButton: MatRadioButton = mrChange.source;
    // Guarda cada opcion de respuesta de cada metrica
    this.respuestas[i] = mrChange.value;
    // Guarda la subcategoria donde se encuentra el usuario contestando
    this.subcategoriasEvaluadas.push(subcategoria);
  }

  // Calcular la puntuacion de las metricas, capacidades, subcategoria y categoria.
  calcularPesos(subcategoria: Subcategoria) {
    //console.log(this.subcategoria.capacidades);

    // Arrays para almacenar los puntuajes
    let puntuajeMetricas: number[] = [];
    let puntuajeCapacidades: number[] = [];

    // Recorre cada capacidad para hacer el cálculo de cada métrica y capaciadad
    subcategoria.capacidades.forEach((capacidad, i) => {
      // Cálculo pesos metricas
      puntuajeMetricas.push(Number((capacidad.metrica.pesoPregunta * this.respuestas[i].pesoRespuesta).toFixed(2)));
      // Cálculo pesos capacidades
      puntuajeCapacidades.push(Number((capacidad.peso * puntuajeMetricas[i]).toFixed(4)));
    });

    // Cálculo peso subcategoria
    let puntuajeSubcategoria = puntuajeCapacidades.reduce((oldSum, sumaTotal) => (oldSum + sumaTotal));
    puntuajeSubcategoria *= subcategoria.peso;

    // Objeto para guardar la informacion de los puntuajes obtenidos de la subcategoria
    let obtPuntuajes = {
      subcategoria: this.subcategoria.nombre,
      puntuacionSubcategoria: puntuajeSubcategoria,
      puntuacionCapacidades: puntuajeCapacidades,
      puntuacionMetricas: puntuajeMetricas
    }

    // Agrega la subcategoria a un arreglo de puntuajes
    this.puntuajes.push(obtPuntuajes);
  }


  guardarRespuestas(idSub?: any) {

    // ** Validacion de otras subcategorias
    // Filtra la subcategoria contestada
    var arrTem: any = [...new Set(this.subcategoriasEvaluadas)];
    this.subcategoria = arrTem[0];

    // Manda la subcategoria contestada por el usuario para sacar los cálculos
    this.calcularPesos(this.subcategoria);

    // Limpia arreglo temporal de subcategoria
    this.subcategoriasEvaluadas = [];

    console.log(this.puntuajes);

    // Deshabilita boton de esa subcategoria
    this.buttons[idSub] = true;
  }


  guardarCategoria() {

/* Guardar service */



    this.respuestaUsuario = {
      intento: 1,
      puntuacionCategoria: 0.25,
      metricas: [
        {
          pregunta: "pregunta ejemplo ",
          respuesta: this.respuestas[0], //Respuesta{}
        },
        {
          pregunta: "pregunta2 ejemplo ",
          respuesta: this.respuestas[1], //Respuesta{}
        },
      ]
    }
    this.cuestionario = { idUser: this.idUser };
    //this.cuestionarioService.createCuestionarioDB(this.cuestionario, this.respuestaUsuario);
  }

  regresarSinGuardar() {
    this.puntuajes = [];
    this.router.navigate(["/cuestionario"]);
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
