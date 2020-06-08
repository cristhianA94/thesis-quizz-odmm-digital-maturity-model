import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin.routing';
import { ComponentsModule } from 'app/shared/components.module';

// Angular Material
import { MaterialModule } from './../material.module';

// Components
import { AdminPanelComponent } from './../admin-panel/admin-panel.component';
import { UbicacionAdminComponent } from './ubicacion-admin/ubicacion-admin.component';
import { AdminPaisComponent } from './ubicacion-admin/admin-pais/admin-pais.component';
import { DialogFormPaisComponent } from './ubicacion-admin/admin-pais/dialog-form-pais.component';
import { AdminProvinciaComponent } from './ubicacion-admin/admin-provincia/admin-provincia.component';
import { DialogFormProvinciaComponent } from './ubicacion-admin/admin-provincia/dialog-form-provincia.component';
import { AdminCantonComponent } from './ubicacion-admin/admin-canton/admin-canton.component';
import { DialogFormCantonComponent } from './ubicacion-admin/admin-canton/dialog-form-canton.component';
import { SectorIndustrialAdminComponent } from './sector-industrial-admin/sector-industrial-admin.component';
import { DialogFormSectorIndustrialComponent } from './sector-industrial-admin/dialog-form-sectorIndustrial.component';

// Services
import { UsuarioService } from 'app/core/services/user/usuarios/usuario.service';
import { EmpresaService } from 'app/core/services/user/empresas/empresa.service';
import { PaisService } from 'app/core/services/user/pais/pais.service';
import { ProvinciaService } from 'app/core/services/user/provincia/provincia.service';
import { CantonService } from 'app/core/services/user/canton/canton.service';
import { SectorIndustrialService } from 'app/core/services/user/sectorIndustrial/sector-industrial.service';
// Cuestionario
import { CuestionarioAdminModule } from './cuestionario-admin/cuestionario-admin.module';

// CSV
import { NgxCsvParserModule } from 'ngx-csv-parser';



``
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRoutingModule,
    MaterialModule,
    ComponentsModule,
    CuestionarioAdminModule,
    // CSV
    NgxCsvParserModule
  ],
  declarations: [
    AdminPanelComponent,
    UbicacionAdminComponent,
    AdminPaisComponent,
    DialogFormPaisComponent,
    AdminProvinciaComponent,
    DialogFormProvinciaComponent,
    AdminCantonComponent,
    DialogFormCantonComponent,
    SectorIndustrialAdminComponent,
    DialogFormSectorIndustrialComponent,
    
  ],
  providers:[
    UsuarioService,
    EmpresaService,
    SectorIndustrialService,
    PaisService,
    ProvinciaService,
    CantonService
  ]
})

export class AdminModule { }
