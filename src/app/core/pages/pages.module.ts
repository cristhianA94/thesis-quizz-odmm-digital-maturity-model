import { CantonService } from '../services/user/canton/canton.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PagesRoutingModule } from './pages.routing';
import { ComponentsModule } from 'app/shared/components.module';

// Components
import { PagesComponent } from './pages.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { EmpresaEditComponent } from './user-profile/empresa-edit/empresa-edit.component';
import { UsuarioEditComponent } from './user-profile/usuario-edit/usuario-edit.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { AuthComponent } from '../auth/components/login/auth.component';
import { RegisterComponent } from '../auth/components/login/register/register.component';
import { LoginComponent } from '../auth/components/login/login/login.component';
import { CuestionaryComponent } from './cuestionary/cuestionary.component';
import { ReportesComponent } from './reportes/reportes.component';

// Angular Material
import { MaterialModule } from './material.module';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';
import { NgCircleProgressModule } from 'ng-circle-progress';


import { CuestionaryModule } from './cuestionary/cuestionary.module';

// Services
import { UsuarioService } from '../services/user/usuarios/usuario.service';
import { EmpresaService } from '../services/user/empresas/empresa.service';
import { PaisService } from '../services/user/pais/pais.service';
import { ProvinciaService } from '../services/user/provincia/provincia.service';
import { SectorIndustrialService } from '../services/user/sectorIndustrial/sector-industrial.service';
import { SubcategoriasService } from '../services/cuestionario/subcategorias/subcategorias.service';
import { CuestionarioService } from '../services/cuestionario/cuestionario.service';
import { ReporteComponent } from './reportes/reporte/reporte.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    PagesRoutingModule,
    ComponentsModule,
    MaterialModule,
    MatPasswordStrengthModule,
    // TODO ng-circle-progress
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: "#78C000",
      innerStrokeColor: "#C7E596",
      animationDuration: 300,
    }),
    CuestionaryModule
  ],
  declarations: [
    PagesComponent,
    HomeComponent,
    AboutComponent,
    AuthComponent,
    LoginComponent,
    RegisterComponent,
    UserProfileComponent,
    EmpresaEditComponent,
    UsuarioEditComponent,
    CuestionaryComponent,
    ReportesComponent,
    ReporteComponent,
  ],
  providers: [
    UsuarioService,
    EmpresaService,
    SectorIndustrialService,
    PaisService,
    ProvinciaService,
    CantonService,
    SubcategoriasService,
    CuestionarioService
  ]
})

export class PagesModule { }
