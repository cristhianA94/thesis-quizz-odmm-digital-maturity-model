import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PagesComponent } from './core/pages/pages.component';
import { VerifyEmailComponent } from './core/auth/components/verify-email/verify-email.component';


const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: '',
    component: PagesComponent,
    //loadChildren: './core/pages/pages.module#PagesModule'
    loadChildren: () => import('./core/pages/pages.module').then(m => m.PagesModule)
  },
  { path: 'verify-email', component: VerifyEmailComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes,
      {
        //useHash: true,
        // Recarga la uri cuando es la misma
        onSameUrlNavigation: 'reload'
      }
    )
  ],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
