import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CategoriasService } from "app/core/services/cuestionario/categorias/categorias.service";
import { DimensionComponent } from './dimension/dimension.component';
import { CuestionarioService } from 'app/core/services/cuestionario/cuestionario.service';
import { AuthUserGuard } from '../../auth/guards/auth-user.guard';

export const cuestionaryRoutes: Routes = [
  {
    path: "dimension/:id",
    component: DimensionComponent,
    resolve: {
      categoria: CategoriasService,
      data: CuestionarioService
    },
    canActivate: [AuthUserGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(cuestionaryRoutes)],
  exports: [RouterModule],
  providers: [CategoriasService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CuestionaryRoutingModule { }
