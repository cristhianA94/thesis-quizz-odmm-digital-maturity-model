import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Categoria, Subcategoria } from 'app/shared/models/cuestionario';
import { CategoriasService } from 'app/core/services/cuestionario/categorias/categorias.service';
import { CapacidadesService } from '../../../services/cuestionario/capacidades/capacidades.service';
import { RespuestasService } from '../../../services/cuestionario/respuestas/respuestas.service';
import { MetricasService } from '../../../services/cuestionario/metricas/metricas.service';
import { Capacidad, Metrica, Respuesta } from '../../../../shared/models/cuestionario';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { SubcategoriasService } from 'app/core/services/cuestionario/subcategorias/subcategorias.service';

@Component({
  selector: 'app-dimension',
  templateUrl: './dimension.component.html',
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
    `
  ]
})
export class DimensionComponent implements OnInit {

  loadData: boolean = false;

  idCategoria: string;
  dimension2Form: FormGroup;
  categoria: Categoria;
  subcategorias: Subcategoria[] = [];
  capacidades: Capacidad[] = [];
  metricas: Metrica[] = [];
  respuestas: Respuesta[] = [];


  constructor(
    private categoriasServices: CategoriasService,
    private subcategoriasServices: SubcategoriasService,
    private metricasServices: MetricasService,
    private capacidadesServices: CapacidadesService,
    private respuestasServices: RespuestasService,
    private fb: FormBuilder,
    private actRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {

    this.actRoute.params.subscribe(params => {
      this.idCategoria = params.id;
    });

    this.cargarSubcategorias(this.idCategoria);

    //this.dimension2Form = this.buildForm();
  }

  cargarSubcategorias(id: string) {
    this.categoriasServices.getCategoriaDB(id).subscribe(categoria => {
      // Carga la categoria
      this.categoria = {
        id: id,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        peso: categoria.peso
      };

      // Cargar las subcategorias que corresponden a la categoria
      this.subcategoriasServices.getSubcategorias_CategoriaDB(id).subscribe(subcategorias => {
        console.log(subcategorias);
        this.subcategorias = subcategorias;
        
        //this.cargarCapacidades(this.subcategorias)
      })

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
    this.capacidadesServices.getCapacidades_SubcategoriaDB(subcategorias[2].id).subscribe(capacidades => {
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
      opcion: ['', Validators.required],
    });
  }

}
