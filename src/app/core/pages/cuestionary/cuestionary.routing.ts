import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CuestionaryComponent } from './cuestionary.component';
import { DimensionComponent } from './dimension/dimension.component';
import { CategoriasService } from '../../services/cuestionario/categorias/categorias.service';


export const cuestionaryRoutes: Routes = [

    /* {
        path: '',
        component: CuestionaryComponent,
        children: [
            { path: 'dimension/:id', component: Dimension1Component },
            
        ]
    }, */
    {
        path: 'dimension/:id',
        component: DimensionComponent
    },
];

@NgModule({
    imports: [RouterModule.forChild(cuestionaryRoutes)],
    exports: [RouterModule],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CuestionaryRoutingModule { }