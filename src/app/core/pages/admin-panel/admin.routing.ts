import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminPanelComponent } from './admin-panel.component';
import { UbicacionAdminComponent } from './ubicacion-admin/ubicacion-admin.component';
import { SectorIndustrialAdminComponent } from './sector-industrial-admin/sector-industrial-admin.component';
import { CuestionarioAdminComponent } from './cuestionario-admin/cuestionario-admin.component';

export const adminRoutes: Routes = [

    //{ path: 'admin-panel', component: AdminPanelComponent },
    { path: 'sector-industrial-panel', component: SectorIndustrialAdminComponent },
    { path: 'ubicacion-panel', component: UbicacionAdminComponent },
    { path: 'cuestionario-panel', component: CuestionarioAdminComponent },
];

@NgModule({
    imports: [RouterModule.forChild(adminRoutes)],
    exports: [RouterModule],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AdminRoutingModule { }