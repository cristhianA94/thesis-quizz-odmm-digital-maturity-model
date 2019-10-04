/* Modulos Angular MAterial */
import { NgModule } from '@angular/core';
import {
  MatTableModule,
  MatStepperModule,
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatOptionModule,
  MatSelectModule,
  MatIconModule,
  MatPaginatorModule,
  MatSortModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatExpansionModule,
  MatRadioModule,
  MatCardModule,
  MatProgressBarModule,
  MatTabsModule,
  MatToolbarModule,
} from '@angular/material';

const modules = [
  MatTableModule,
  MatStepperModule,
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  MatOptionModule,
  MatSelectModule,
  MatPaginatorModule,
  MatSortModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatExpansionModule,
  MatRadioModule,
  MatCardModule,
  MatProgressBarModule,
  MatTabsModule,
  MatToolbarModule,
]
@NgModule({
  imports: [...modules],
  exports: [...modules],
  providers: [
    MatDatepickerModule,
  ]
})
export class MaterialModule { }