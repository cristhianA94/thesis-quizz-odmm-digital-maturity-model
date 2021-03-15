import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CategoriasService } from "app/core/services/cuestionario/categorias/categorias.service";
import { CuestionarioIDComponent } from './cuestionarioID/cuestionarioID.component';
import { CuestionarioService } from 'app/core/services/cuestionario/cuestionario.service';

import { redirectUnauthorizedTo, AngularFireAuthGuard } from '@angular/fire/auth-guard';
// Auth Guard Firebase
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

export const cuestionaryRoutes: Routes = [
  {
    path: "categoria/:id",
    component: CuestionarioIDComponent,
    resolve: {
      categoria: CategoriasService,
      data: CuestionarioService
    },
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
];

@NgModule({
  imports: [RouterModule.forChild(cuestionaryRoutes)],
  exports: [RouterModule],
  providers: [CategoriasService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CuestionaryRoutingModule { }
