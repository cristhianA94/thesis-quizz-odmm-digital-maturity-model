import { Pipe, PipeTransform } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
@Pipe({
  name: "doc",
})
export class DocPipe implements PipeTransform {
  constructor(private afs: AngularFirestore) {}

  transform(value: any): Observable<any> {
    return value ? this.afs.doc(value.path).valueChanges() : null;
  }
}
