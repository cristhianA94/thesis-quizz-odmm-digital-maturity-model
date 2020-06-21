import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import {
  Categoria,
  Subcategoria,
  Capacidad,
  Metrica,
  Respuesta,
} from "app/shared/models/cuestionario";
import { CategoriasService } from "app/core/services/cuestionario/categorias/categorias.service";

import { ActivatedRoute } from "@angular/router";
import { Observable, Subject } from "rxjs";
import { SubcategoriasService } from "app/core/services/cuestionario/subcategorias/subcategorias.service";
import { takeUntil } from "rxjs/operators";
import { MetricasService } from "app/core/services/cuestionario/metricas/metricas.service";
import { CapacidadesService } from "app/core/services/cuestionario/capacidades/capacidades.service";

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
  idCategoria: string;
  dimension2Form: FormGroup;
  categoria: Categoria;
  subcategorias: Subcategoria[] = [];
  capacidades: Capacidad[] = [];
  metricas: Metrica[] = [];
  respuestas: Respuesta[] = [];
  private _unsubscribeAll: Subject<any>;

  constructor(
    private categoriasServices: CategoriasService,
    private subcategoriasServices: SubcategoriasService,
    private metricasServices: MetricasService,
    private capacidadesServices: CapacidadesService,
    private fb: FormBuilder,
    private actRoute: ActivatedRoute
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    //this.dimension2Form = this.buildForm();
    this.categoriasServices.onCategoriaChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((categoria) => {
        console.log(categoria);
        this.categoria = categoria;
      });
    this.subcategoriasServices.onSubcategoriaChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((subcategorias) => {
        console.log(subcategorias);
        this.subcategorias = subcategorias;
      });
  }

  cargarCapacidades(subs: any) {
    //console.log("llege", subs);

    // Recorre cada subcategoria
    this.subcategorias.forEach((subcategoria) => {
      //console.log(subcategoria);
      /* this.capacidadesServices.getCapacidades_SubcategoriaDB(subcategoria.id).subscribe(capacidades => {
        this.capacidades = capacidades;
        //console.log("CAPACIDADES", this.capacidades);
      }) */
    });
  }

  cargarCapacidades2(subcategorias: Subcategoria[]) {
    /* Carga subcategoria 1: Vigilancia de la marca*/
    //console.log(subcategorias);

    // Capacidades
    this.capacidadesServices
      .getCapacidades_SubcategoriaDB(subcategorias[2].id)
      .subscribe((capacidades) => {
        console.log(capacidades);
        this.capacidades = capacidades;
      });

    /* this.subcategorias.forEach(subcateg => {
      // Capacidades
      this.capacidadesServices.getCapacidades_SubcategoriaDB(subcateg.id).subscribe(capacidades => {
        this.capacidades = capacidades;
        //console.log("CAPACIDADES",this.capacidades);

        this.capacidades.forEach(capac => {
          // Metricas
          this.metricasServices.getMetricas_CapacidadesDB(capac.id).subscribe(metricas => {
            this.metricas = metricas;
            //console.log("metricas", this.metricas);

            this.metricas.forEach(metric => {

              this.respuestasServices.getRespuestas_MetricasDB(metric.id).subscribe(respuestas => {
                this.respuestas = respuestas;
                //console.log("respuestas", this.respuestas);
                this.loadData = true;
              })

            })
          })

        })

      })

    }) */
  }

  buildForm(): FormGroup {
    return this.fb.group({
      opcion: ["", Validators.required],
    });
  }
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
