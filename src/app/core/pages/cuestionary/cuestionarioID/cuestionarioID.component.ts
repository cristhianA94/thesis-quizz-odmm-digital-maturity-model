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
  selector: "app-cuestionarioId",
  templateUrl: "./cuestionarioID.component.html",
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
export class CuestionarioIDComponent implements OnInit, OnDestroy {

  private _unsubscribeAll: Subject<any>;
  idUser: string;
  // TODO For disabled buttons, editar si hay mas subcategorias
  buttons = Array(3);
  btnSave: boolean = true;
  load: boolean = false;

  categoriasEvaluadas: any[] = [];
  puntuajes: any[] = [];

  cuestionario: Cuestionario;
  categoria: Categoria;

  subcategoria: Subcategoria;
  subcategorias: Subcategoria[] = [];
  subcategoriasEvaluadas: Subcategoria[] = [];

  metricas: Metrica[] = [];

  respuestas: Respuesta[] = [];
  respuestasUsuario: RespuestasUsuario[] = [];
  respuestaUsuario: RespuestasUsuario = { metricas: [] };
  idCategoria: string;

  constructor(
    private cuestionarioService: CuestionarioService,
    private router: Router
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.idUser = localStorage.getItem("uidUser");
    // REST para obtener cuestionario
    this.idCategoria = this.cuestionarioService.idCategoria;
    this.cuestionarioService.onCuestionarioChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((cuestionario) => {
        this.categoria = cuestionario;
        this.subcategorias = this.categoria.subcategorias;
        this.load = true;
      });
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

    // console.log(this.puntuajes);

    // TODO Habilita el boton de guardar categoria cuando haya contestado a cada subcategoria; varia segun subcategorias
    if (this.puntuajes.length == 3) {
      this.btnSave = false;
    }
    // Deshabilita boton de esa subcategoria
    this.buttons[iSub] = true;
  }


  // Calcular la puntuacion de las metricas, capacidades, subcategoria.
  calcularPesos(subcategoria: Subcategoria) {

    // Arrays para almacenar los puntuajes
    let puntuajeMetricas: number[] = [];
    let puntuajeCapacidades: number[] = [];
    let objMetrica: any = {};

    // Recorre cada capacidad para hacer el cálculo de cada métrica y capacidad
    subcategoria.capacidades.forEach((capacidad, i) => {
      // console.log("aquiiiiii", capacidad);

      // Objeto Respuestas Usuario
      objMetrica = {
        metrica: capacidad.metrica.nombre,
        pregunta: capacidad.metrica.pregunta,
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
    //console.log(this.respuestaUsuario);

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

    // Fecha para el registro del cuestionario
    let fecha = new Date();
    let puntuajeCategoria: number = 0;

    // Calcula peso categoria
    this.puntuajes.forEach((puntuaje) => {
      puntuajeCategoria += puntuaje["puntuacionSubcategoria"];
    });
    // TODO Porcentaje de madurez
    //Number((puntuajeCategoria *= 10).toFixed(4));
    // Agrega al objeto puntuajes la puntuacion de la categoria
    this.puntuajes.push(puntuajeCategoria);

    /* Guardar categoria DB */
    this.cuestionario = {
      idUser: this.idUser,
      categoria: this.idCategoria,
      categoriaNombre: this.categoria.nombre,
      peso: Number(this.categoria.peso),
      intento: 0,
      puntuacionCategoria: Number(puntuajeCategoria.toFixed(2))
    };

    this.respuestaUsuario = {
      intento: 0,
      fecha: fecha,
      puntuacionCategoria: Number(puntuajeCategoria.toFixed(2)),
      metricas: this.puntuajes[0].metricas.metricas
    }

    //console.log(this.puntuajes);

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

}
