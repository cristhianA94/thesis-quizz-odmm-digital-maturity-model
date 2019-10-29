import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";
import { HttpClientModule } from "@angular/common/http";

/* Boostrap */
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { CollapseModule } from "ngx-bootstrap/collapse";

/* Angular Material */
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ToastrModule } from 'ngx-toastr';
import { MaterialModule } from './material.module';
import { MatPagesModule } from '@angular-material-extensions/pages';

/* Components shared */
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { FooterComponent } from './components/shared/footer/footer.component';

/* Pages */
import { PagesModule } from "./components/pages/pages.module";

/* Services */
import { AlertsService } from 'src/app/services/alerts.service';
import { AuthService } from './services/auth.service';

/* Firebase */
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent
  ],
  imports: [
    AppRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    PagesModule,
    //Boostrap
    BsDropdownModule.forRoot(),
    CollapseModule.forRoot(),
    //Modulos Firebase
    AngularFireModule.initializeApp(environment.firebaseConfig), //inicializa conexcion Firebase
    AngularFireAuthModule,
    AngularFirestoreModule,
    //Alertas
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
    //Angular Material
    MaterialModule,
    MatPagesModule.forRoot()
  ],
  providers: [AuthService, AlertsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
