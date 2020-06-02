import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';

import { AppRoutingModule } from './core/auth/components/verify-email/app.routing';

import { AppComponent } from './app.component';
import { PagesComponent } from './core/pages/pages.component';
import { ComponentsModule } from './shared/components.module';

/* Firebase */
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule, StorageBucket } from '@angular/fire/storage';

// Alertas
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ToastrModule } from 'ngx-toastr';

// Pag para verificar el email
import { VerifyEmailComponent } from './core/auth/components/verify-email/verify-email.component';


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
    AngularFireStorageModule,
    AngularFirestoreModule.enablePersistence(),
    // Alertas
    SweetAlert2Module.forRoot(),
    // Notificaciones
    ToastrModule.forRoot({
      timeOut: 4000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      progressBar: true,
      progressAnimation: "decreasing",
      tapToDismiss: true
    }),
    MatPasswordStrengthModule,
  ],
  declarations: [
    AppComponent,
    VerifyEmailComponent

  ],
  providers: [
    // Storage Firebase
    { provide: StorageBucket, useValue: 'gs://fir-auth-web-75274.appspot.com' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
