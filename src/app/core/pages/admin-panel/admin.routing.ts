import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { redirectUnauthorizedTo, AngularFireAuthGuard } from '@angular/fire/auth-guard';

import { UbicacionAdminComponent } from './ubicacion-admin/ubicacion-admin.component';
import { SectorIndustrialAdminComponent } from './sector-industrial-admin/sector-industrial-admin.component';
import { CuestionarioAdminComponent } from './cuestionario-admin/cuestionario-admin.component';

// Auth Guard Firebase
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

export const adminRoutes: Routes = [
    {
        path: 'sector-industrial-panel',
        component: SectorIndustrialAdminComponent,
        canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
    },
    {
        path: 'ubicacion-panel',
        component: UbicacionAdminComponent,
        canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
    },
    {
        path: 'cuestionario-panel',
        component: CuestionarioAdminComponent,
        canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
    },
];

@NgModule({
    imports: [RouterModule.forChild(adminRoutes)],
    exports: [RouterModule],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminRoutingModule { }