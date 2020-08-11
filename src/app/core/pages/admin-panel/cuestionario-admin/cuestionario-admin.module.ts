import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { ComponentsModule } from 'app/shared/components.module';
import { MaterialModule } from "../../material.module";

// Services
import { CategoriasService } from "app/core/services/cuestionario/categorias/categorias.service";
import { SubcategoriasService } from 'app/core/services/cuestionario/subcategorias/subcategorias.service';
import { CapacidadesService } from 'app/core/services/cuestionario/capacidades/capacidades.service';
import { MetricasService } from 'app/core/services/cuestionario/metricas/metricas.service';

// Components
import { CategoriaComponent } from "./categoria-admin/categoria.component";
import { DialogFormCategoriaComponent } from "./categoria-admin/dialog-form-categoria.component";
import { SubcategoriaComponent } from "./subcategoria-admin/subcategoria.component";
import { CuestionarioAdminComponent } from "./cuestionario-admin.component";
import { CapacidadesComponent } from './capacidades-admin/capacidades.component';
import { MetricasComponent } from './metricas-admin/metricas.component';

// Components reutilizables
import { DialogFormLoadDataComponent } from "./dialog-form/dialog-form-loadData.component";
import { DialogFormMetricaComponent } from './metricas-admin/dialog-form-metrica.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule,
    ComponentsModule,
  ],
  declarations: [
    CuestionarioAdminComponent,
    CategoriaComponent,
    DialogFormCategoriaComponent,
    SubcategoriaComponent,
    CapacidadesComponent,
    DialogFormLoadDataComponent,
    MetricasComponent,
    DialogFormCategoriaComponent,
    DialogFormMetricaComponent
  ],
  providers: [
    CategoriasService,
    SubcategoriasService,
    CapacidadesService,
    MetricasService,
  ],
})
export class CuestionarioAdminModule {}
