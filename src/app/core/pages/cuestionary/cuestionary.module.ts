import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CuestionaryRoutingModule } from './cuestionary.routing';
import { MaterialModule } from '../material.module';

import { DimensionComponent } from './dimension/dimension.component';

// Services
import { CategoriasService } from 'app/core/services/cuestionario/categorias/categorias.service';
import { CapacidadesService } from 'app/core/services/cuestionario/capacidades/capacidades.service';
import { MetricasService } from 'app/core/services/cuestionario/metricas/metricas.service';
import { RespuestasService } from 'app/core/services/cuestionario/respuestas/respuestas.service';
import { ComponentsModule } from '../../../shared/components.module';
import { SubcategoriasService } from 'app/core/services/cuestionario/subcategorias/subcategorias.service';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CuestionaryRoutingModule,
    MaterialModule,
    ComponentsModule
  ],
  declarations: [
    DimensionComponent,
  ],
  exports: [
    DimensionComponent,
  ],
  providers: [
    CategoriasService,
    SubcategoriasService,
    CapacidadesService,
    MetricasService,
    RespuestasService,
  ]
})
export class CuestionaryModule { }