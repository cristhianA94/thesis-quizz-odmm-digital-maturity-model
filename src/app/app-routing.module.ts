import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { Routes, RouterModule } from "@angular/router";

import { ProfilepageComponent } from "./components/pages/profilepage/profilepage.component";
import { RegisterpageComponent } from "./components/pages/registerpage/registerpage.component";
import { HomepageComponent } from './components/pages/home/homepage.component';
import { AcercaDeComponent } from './components/pages/acerca-de/acerca-de.component';

const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },
  { path: "home", component: HomepageComponent },
  { path: "register", component: RegisterpageComponent },
  { path: "about", component: AcercaDeComponent },
  { path: "profile", component: ProfilepageComponent }
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes, {
      useHash: true
    })
  ],
  exports: []
})
export class AppRoutingModule { }
