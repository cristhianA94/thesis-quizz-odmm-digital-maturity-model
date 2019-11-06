import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

/* Boostrap ngx */
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { ProgressbarModule } from "ngx-bootstrap/progressbar";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { CollapseModule } from "ngx-bootstrap/collapse";
import { TabsModule } from "ngx-bootstrap/tabs";
import { PaginationModule } from "ngx-bootstrap/pagination";
import { AlertModule } from "ngx-bootstrap/alert";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { CarouselModule } from "ngx-bootstrap/carousel";
import { ModalModule } from "ngx-bootstrap/modal";
import { JwBootstrapSwitchNg2Module } from "jw-bootstrap-switch-ng2";
import { PopoverModule } from "ngx-bootstrap/popover";

/* Components */
import { ProfilepageComponent } from "./profilepage/profilepage.component";
import { RegisterpageComponent } from "./registerpage/registerpage.component";
import { HomepageComponent } from "./home/homepage.component";
import { AcercaDeComponent } from './acerca-de/acerca-de.component';
import { AdminpageComponent } from './adminpage/adminpage.component';
import { CuestionarioComponent } from './cuestionario/cuestionario.component';

/* Servicios */
import { AuthService } from '../../services/auth.service';
import { AlertsService } from '../../services/alerts.service';
import { ToastrModule } from 'ngx-toastr';
//CSV
import { PapaParseModule } from 'ngx-papaparse';


/* Firebase */
import { environment } from '../../../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';

/* Angular Material */
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../material.module';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';
import { MatPagesModule } from '@angular-material-extensions/pages';

//import { ScrollingModule } from '@angular/cdk/scrolling';



@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    /* Boostrap */
    BsDropdownModule.forRoot(),
    ProgressbarModule.forRoot(),
    TooltipModule.forRoot(),
    PopoverModule.forRoot(),
    CollapseModule.forRoot(),
    JwBootstrapSwitchNg2Module,
    TabsModule.forRoot(),
    PaginationModule.forRoot(),
    AlertModule.forRoot(),
    BsDatepickerModule.forRoot(),
    CarouselModule.forRoot(),
    ModalModule.forRoot(),
    //Modulos Firebase
    AngularFireModule.initializeApp(environment.firebaseConfig), //inicializa conexcion Firebase
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
    PapaParseModule,
    // Modulos de angular material
    MaterialModule,
    MatPasswordStrengthModule.forRoot(),
    MatPagesModule.forRoot(),
    //ScrollingModule,


  ],
  declarations: [
    ProfilepageComponent,
    RegisterpageComponent,
    HomepageComponent,
    AcercaDeComponent,
    AdminpageComponent,
    CuestionarioComponent,
  ],
  exports: [
    ProfilepageComponent,
    RegisterpageComponent,
    HomepageComponent,
    AcercaDeComponent,
    AdminpageComponent
  ],
  providers: [
    AlertsService,
    AuthService
  ]
})
export class PagesModule {}
