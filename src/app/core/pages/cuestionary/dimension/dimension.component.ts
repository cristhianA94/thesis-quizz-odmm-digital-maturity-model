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
  btnSave: boolean = true;
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
  respuestaUsuario: RespuestasUsuario = { intento: 1, metricas: [], puntuacionCategoria: 0 };

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
  onChangeOptionValues(mrChange: MatRadioChange, i: number, subcategoria: Subcategoria) {
    let mrButton: MatRadioButton = mrChange.source;
    // Guarda cada opcion de respuesta de cada metrica
    this.respuestas[i] = mrChange.value;
    // Guarda la subcategoria donde se encuentra el usuario contestando
    this.subcategoriasEvaluadas.push(subcategoria);
  }

  guardarRespuestas(iSub?: any) {

    // ** Validacion de otras subcategorias
    // Filtra la subcategoria contestada
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
      puntuajeMetricas.push(Number((capacidad.metrica.pesoPregunta * this.respuestas[i].pesoRespuesta).toFixed(2)));
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
    puntuajeCategoria *= this.categoria.peso;
    // Agrega al objeto puntuajes la puntuacion de la categoria
    this.puntuajes.push(puntuajeCategoria);

    /* Guardar categoria DB */
    this.cuestionario = {
      idUser: this.idUser,
      categoria: this.categoria.nombre
    };

    // TODO Falta logica de intentos
    this.respuestaUsuario = {
      intento: 1,
      puntuacionCategoria: puntuajeCategoria,
      metricas: this.puntuajes[0].metricas.metricas
    }

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
