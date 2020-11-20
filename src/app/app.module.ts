import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { MatPasswordStrengthModule } from "@angular-material-extensions/password-strength";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app.routing";
import { ComponentsModule } from "./shared/components.module";

/* Firebase */
import { environment } from "../environments/environment";
import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireStorageModule, StorageBucket } from "@angular/fire/storage";
import { AngularFireAuthGuardModule } from '@angular/fire/auth-guard';

// Alertas
import { SweetAlert2Module } from "@sweetalert2/ngx-sweetalert2";
import { ToastrModule } from "ngx-toastr";

// Pag para verificar el email
import { VerifyEmailComponent } from "./core/auth/components/verify-email/verify-email.component";
import { AuthService } from "./core/auth/service/auth.service";

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    // Routes
    AppRoutingModule,
    // Shared components
    ComponentsModule,
    // Inicializa conexion Firebase
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule,
    //AngularFireStorageModule,
    AngularFireAuthGuardModule, 
    //AngularFirestoreModule.enablePersistence(),
    // Alertas
    SweetAlert2Module.forRoot(),
    // Notificaciones
    ToastrModule.forRoot({
      timeOut: 4000,
      positionClass: "toast-bottom-right",
      preventDuplicates: true,
      progressBar: true,
      progressAnimation: "decreasing",
      tapToDismiss: true,
    }),
    MatPasswordStrengthModule,
  ],
  declarations: [AppComponent, VerifyEmailComponent],
  providers: [
    AuthService,
    // Storage Firebase
    //{ provide: StorageBucket, useValue: "gs://fir-auth-web-75274.appspot.com" },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
