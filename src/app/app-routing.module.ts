import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { Routes, RouterModule } from "@angular/router";

import { ProfilepageComponent } from "./components/pages/profilepage/profilepage.component";
import { RegisterpageComponent } from "./components/pages/registerpage/registerpage.component";
import { HomepageComponent } from './components/pages/home/homepage.component';
import { AcercaDeComponent } from './components/pages/acerca-de/acerca-de.component';
import { AdminpageComponent } from './components/pages/adminpage/adminpage.component';
import { CuestionarioComponent } from './components/pages/cuestionario/cuestionario.component';

import { pipe } from 'rxjs';
import { map } from 'rxjs/operators';

/* Firebase Auth */
import { AuthGuard } from './services/auth.guard';
import { AngularFireAuthGuard, customClaims, redirectUnauthorizedTo } from '@angular/fire/auth-guard';


const redirectUnauthorizedToLogin = redirectUnauthorizedTo(["registro"]);

const isUser = () => pipe(map(user => {
  return !!user ? !!user : ['/'];
}));

const isAdmin = () => pipe(customClaims, map(claims => {
  return claims.admin === true ? claims.admin : ['/'];
}));

const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },
  { path: "home", component: HomepageComponent },
  { path: "about", component: AcercaDeComponent },
  { path: "register", component: RegisterpageComponent },
  { path: "profile", component: ProfilepageComponent, canActivate: [AuthGuard] },
  { path: "cuestionario", component: CuestionarioComponent },
  { path: "admin", component: AdminpageComponent },

  {
    path: 'admin', component: AdminpageComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: isAdmin }
  },
  /* {
    path: 'profile',
    component: ProfilepageComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: isUser }
  }, */
  //{ path: '**', component: HomepageComponent }
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
