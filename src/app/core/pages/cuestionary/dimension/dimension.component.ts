import { Component, OnInit, OnDestroy, ViewEncapsulation } from "@angular/core";
import { MatRadioChange, MatRadioButton } from '@angular/material/radio';

import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

// Models
import { Categoria } from 'app/shared/models/categoria';
import { Subcategoria } from 'app/shared/models/subcategoria';
import { Metrica, Respuesta } from 'app/shared/models/metrica';
import { Cuestionario, RespuestasUsuario } from 'app/shared/models/cuestionario';

import { CuestionarioService } from 'app/core/services/cuestionario/cuestionario.service';
import { Router } from '@angular/router';

@Component({
  selector: "app-dimension",
  templateUrl: "./dimension.component.html",
  styles: [
    `
      .radio-group {
        display: flex;
        margin: 15px 0;
      }

      .radio-button {
        margin: 5px;
      }

      .wrap-mat-radio-label {
        white-space: normal;
      }
    `
  ],
  encapsulation: ViewEncapsulation.None
})
export class DimensionComponent implements OnInit, OnDestroy {

  private _unsubscribeAll: Subject<any>;
  idUser: string;
  // For disabled buttons
  buttons = Array(3);
  btnSave: boolean = true;
  load: boolean = false;

  puntuajes: any[] = [];

  cuestionario: Cuestionario;
  categoria: Categoria;

  subcategoria: Subcategoria;
  subcategorias: Subcategoria[] = [];
  subcategoriasEvaluadas: Subcategoria[] = [];

  metricas: Metrica[] = [];

  respuestas: Respuesta[] = [];
  respuestasUsuario: RespuestasUsuario[] = [];
  //respuestaUsuario: RespuestasUsuario = { intento: 1, metricas: [], puntuacionCategoria: 0 };
  respuestaUsuario: RespuestasUsuario = { metricas: [] };
  //respuestaUsuario: RespuestasUsuario;

  constructor(
    private cuestionarioService: CuestionarioService,
    private router: Router
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.idUser = localStorage.getItem("uidUser");
    // REST para obtener cuestionario
    this.cuestionarioService.onCuestionarioChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((cuestionario) => {
        this.categoria = cuestionario;
        this.subcategorias = this.categoria.subcategorias;
      });
    this.load = true;
  }

  // Detecta las opciones elegida por cada subcategoria
  onChangeOptionValues(mrChange: MatRadioChange, i: number, subcategoria: Subcategoria) {
    let mrButton: MatRadioButton = mrChange.source;
    // Guarda cada opcion de respuesta de cada metrica
    this.respuestas[i] = mrChange.value;
    // Guarda la subcategoria donde se encuentra el usuario contestando
    this.subcategoriasEvaluadas.push(subcategoria);
  }

  guardarRespuestas(iSub?: any) {

    // ** Validacion de otras subcategorias **
    // Elimina la subcategoria duplicada y la asigna
    var arrTem: any = [...new Set(this.subcategoriasEvaluadas)];
    this.subcategoria = arrTem[0];

    // Manda la subcategoria contestada por el usuario para sacar los cálculos
    this.calcularPesos(this.subcategoria);

    // Limpia arreglo temporal de subcategoria
    this.subcategoriasEvaluadas = [];

    console.log(this.puntuajes);

    // Habilita el boton de guardar categoria cuando haya contestado a cada subcategoria
    if (this.puntuajes.length === 3) {
      this.btnSave = false;
    }
    // Deshabilita boton de esa subcategoria
    this.buttons[iSub] = true;
  }


  // Calcular la puntuacion de las metricas, capacidades, subcategoria.
  calcularPesos(subcategoria: Subcategoria) {
    //console.log(this.subcategoria.capacidades);

    // Arrays para almacenar los puntuajes
    let puntuajeMetricas: number[] = [];
    let puntuajeCapacidades: number[] = [];
    let objMetrica: any = {};

    // Recorre cada capacidad para hacer el cálculo de cada métrica y capacidad
    subcategoria.capacidades.forEach((capacidad, i) => {
      objMetrica = {
        subcacategoria: subcategoria.nombre, // TODO eliminar por si
        metrica: capacidad.metrica.nombre,
        respuesta: {
          opcion: this.respuestas[i].opcion,
          recomendacion: this.respuestas[i].recomendacion
        }
      }
      // Agrega las metricas a un arreglo
      this.respuestaUsuario.metricas.push(objMetrica);
      delete this.respuestaUsuario.id;
      delete this.respuestaUsuario.intento;
      delete this.respuestaUsuario.puntuacionCategoria;
      // Cálculo pesos metricas
      puntuajeMetricas.push(Number((capacidad.metrica.pesoPregunta * this.respuestas[i].pesoRespuesta).toFixed(4)));
      // Cálculo pesos capacidades
      puntuajeCapacidades.push(Number((capacidad.peso * puntuajeMetricas[i]).toFixed(4)));
    });

    // Cálculo peso subcategoria
    let puntuajeSubcategoria = puntuajeCapacidades.reduce((oldSum, sumaTotal) => (oldSum + sumaTotal));
    puntuajeSubcategoria *= subcategoria.peso;

    // Agrega las metricas contestadas por el usuario con su opcion
    this.respuestasUsuario.push(this.respuestaUsuario);
    // Filtra la subcategoria contestada
    var respuestasFiltred: any = [...new Set(this.respuestasUsuario)];

    // Objeto para guardar la informacion de los puntuajes obtenidos de la subcategoria
    let obtPuntuajes = {
      subcategoria: this.subcategoria.nombre,
      puntuacionSubcategoria: puntuajeSubcategoria,
      puntuacionCapacidades: puntuajeCapacidades,
      puntuacionMetricas: puntuajeMetricas,
      metricas: respuestasFiltred[0]
    }

    // Agrega la subcategoria a un arreglo de puntuajes
    this.puntuajes.push(obtPuntuajes);
  }

  guardarCategoria() {

    let puntuajeCategoria: number = 0;

    // Calcula peso categoria
    this.puntuajes.forEach((puntuaje) => {
      puntuajeCategoria += puntuaje["puntuacionSubcategoria"];
    });
    // TODO Porcentaje de madurez
    Number((puntuajeCategoria *= 10).toFixed(4))
    // Agrega al objeto puntuajes la puntuacion de la categoria
    this.puntuajes.push(puntuajeCategoria);

    /* Guardar categoria DB */
    this.cuestionario = {
      idUser: this.idUser,
      categoria: this.categoria.nombre,
      intento: 0
    };

    // Fecha para el registro del cuestionario
    let fecha = new Date().toLocaleString();
    // TODO Falta logica de intentos
    this.respuestaUsuario = {
      intento: 0,
      fecha: fecha,
      puntuacionCategoria: puntuajeCategoria,
      metricas: this.puntuajes[0].metricas.metricas
    }

    console.log(this.puntuajes);

    // Crea el cuestionario en la BD
    this.cuestionarioService.createCuestionarioDB(this.cuestionario, this.respuestaUsuario);
    this.puntuajes = [];
    this.router.navigate(["/cuestionario"]);
  }

  regresarSinGuardar() {
    this.puntuajes = [];
    this.router.navigate(["/cuestionario"]);
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
/* 
  test() {
    this.cuestionario = {
      idUser: this.idUser,
      categoria: this.categoria.nombre
    };

    let fecha = new Date().toLocaleString();
    let obj = {
      intento: 2,
      fecha: fecha,
      puntuacionCategoria: 60,
      metricas: [
        {
          metrica: "Nombre metrica",
          respuesta:
          {
            opcion: "Opcion ejem",
            recomendacion: "Recomendacion ejem"
          },
          subcategoria: "Subcategoria ejem"
        },
        {
          metrica: "Nombre metrica",
          respuesta:
          {
            opcion: "Opcion ejem",
            recomendacion: "Recomendacion ejem"
          },
          subcategoria: "Subcategoria ejem"
        },

      ]
    }

    // Crea el cuestionario en la BD
    this.cuestionarioService.createCuestionarioDB(this.cuestionario, obj);
  }
   */
}
