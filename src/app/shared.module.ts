import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DocPipe } from "./pipes/doc.pipe";
import { FlexLayoutModule } from "@angular/flex-layout";

@NgModule({
  declarations: [DocPipe],
  imports: [CommonModule, FlexLayoutModule],
  exports: [DocPipe, FlexLayoutModule],
})
export class SharedModule {}
