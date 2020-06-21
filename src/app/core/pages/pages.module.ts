import { CantonService } from '../services/user/canton/canton.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PagesRoutingModule } from './pages.routing';
import { ComponentsModule } from 'app/shared/components.module';

// Components
import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { EmpresaEditComponent } from './user-profile/empresa-edit/empresa-edit.component';
import { UsuarioEditComponent } from './user-profile/usuario-edit/usuario-edit.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { AuthComponent } from '../auth/components/login/auth.component';
import { RegisterComponent } from '../auth/components/login/register/register.component';
import { LoginComponent } from '../auth/components/login/login/login.component';
import { CuestionaryComponent } from './cuestionary/cuestionary.component';

// Angular Material
import { MaterialModule } from './material.module';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';

import { CuestionaryModule } from './cuestionary/cuestionary.module';

// Services
import { UsuarioService } from '../services/user/usuarios/usuario.service';
import { EmpresaService } from '../services/user/empresas/empresa.service';
import { PaisService } from '../services/user/pais/pais.service';
import { ProvinciaService } from '../services/user/provincia/provincia.service';
import { SectorIndustrialService } from '../services/user/sectorIndustrial/sector-industrial.service';
import { SubcategoriasService } from '../services/cuestionario/subcategorias/subcategorias.service';


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
    CuestionaryModule
  ],
  declarations: [
    PagesComponent,
    HomeComponent,
    AboutComponent,
    AuthComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    UserProfileComponent,
    EmpresaEditComponent,
    UsuarioEditComponent,
    CuestionaryComponent,
  ],
  providers: [
    UsuarioService,
    EmpresaService,
    SectorIndustrialService,
    PaisService,
    ProvinciaService,
    CantonService,
    SubcategoriasService
  ]
})

export class PagesModule { }
