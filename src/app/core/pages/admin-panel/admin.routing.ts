import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UbicacionAdminComponent } from './ubicacion-admin/ubicacion-admin.component';
import { SectorIndustrialAdminComponent } from './sector-industrial-admin/sector-industrial-admin.component';
import { CuestionarioAdminComponent } from './cuestionario-admin/cuestionario-admin.component';
import { AuthUserGuard } from '../../auth/guards/auth-user.guard';

export const adminRoutes: Routes = [

    { path: 'sector-industrial-panel', component: SectorIndustrialAdminComponent, canActivate: [AuthUserGuard] },
    { path: 'ubicacion-panel', component: UbicacionAdminComponent, canActivate: [AuthUserGuard] },
    { path: 'cuestionario-panel', component: CuestionarioAdminComponent, canActivate: [AuthUserGuard] },
];

@NgModule({
    imports: [RouterModule.forChild(adminRoutes)],
    exports: [RouterModule],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminRoutingModule { }