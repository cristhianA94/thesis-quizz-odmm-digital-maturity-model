import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "../../material.module";

// Services
import { SubcategoriasService } from "../../../services/cuestionario/subcategorias/subcategorias.service";
import { CategoriasService } from "app/core/services/cuestionario/categorias/categorias.service";
import { CapacidadesService } from "../../../services/cuestionario/capacidades/capacidades.service";
import { MetricasService } from "../../../services/cuestionario/metricas/metricas.service";

// Components
import { CategoriaComponent } from "./categoria-admin/categoria.component";
import { DialogFormCategoriaComponent } from "./categoria-admin/dialog-form-categoria.component";
import { SubcategoriaComponent } from "./subcategoria-admin/subcategoria.component";
import { CapacidadesAdminComponent } from "./capacidades-admin/capacidades-admin.component";
import { MetricasAdminComponent } from "./metricas-admin/metricas-admin.component";
import { DialogFormMetricaComponent } from "./metricas-admin/dialog-form-metrica.component";
import { RecomendacionesAdminComponent } from "./recomendaciones-admin/recomendaciones-admin.component";
import { CuestionarioAdminComponent } from "./cuestionario-admin.component";

// Components reutilizables
import { DialogFormLoadDataComponent } from "./dialog-form/dialog-form-loadData.component";
import { ComponentsModule } from "../../../../shared/components.module";

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
    CapacidadesAdminComponent,
    DialogFormLoadDataComponent,
    MetricasAdminComponent,
    DialogFormMetricaComponent,

    RecomendacionesAdminComponent,
  ],
  providers: [
    CategoriasService,
    SubcategoriasService,
    CapacidadesService,
    MetricasService,
  ],
})
export class CuestionarioAdminModule {}
