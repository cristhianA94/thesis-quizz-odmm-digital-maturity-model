import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsuarioService } from '../services/user/usuarios/usuario.service';

import { DashboardComponent } from './dashboard/dashboard.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { AuthComponent } from 'app/core/auth/components/login/auth.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { EmpresaService } from '../services/user/empresas/empresa.service';
import { CuestionaryComponent } from './cuestionary/cuestionary.component';
import { CategoriasService } from '../services/cuestionario/categorias/categorias.service';

export const PagesRoutes: Routes = [

    { path: 'home', component: HomeComponent },
    { path: 'acerca-de', component: AboutComponent },
    { path: 'dashboard', component: DashboardComponent },
    {
        path: 'cuestionario',
        component: CuestionaryComponent,
        loadChildren: () => import('./cuestionary/cuestionary.module').then(m => m.CuestionaryModule)
        //resolve: { CategoriasService }

    },
    { path: 'login', component: AuthComponent },
    {
        path: 'user-profile',
        component: UserProfileComponent,
        resolve: {
            dataUser: UsuarioService,
            dataEmpresa: EmpresaService
        }
    },
    {
        path: 'admin-panel',
        component: AdminPanelComponent,
        loadChildren: () => import('./admin-panel/admin.module').then(m => m.AdminModule)
    },
];

@NgModule({
    imports: [RouterModule.forChild(PagesRoutes)],
    exports: [RouterModule],
    providers: [
        UsuarioService,
        EmpresaService,
        CategoriasService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class PagesRoutingModule { }