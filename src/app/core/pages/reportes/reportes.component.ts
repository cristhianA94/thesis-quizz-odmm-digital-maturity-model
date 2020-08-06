import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Cuestionario, RespuestasUsuario } from 'app/shared/models/cuestionario';
import { CuestionarioService } from 'app/core/services/cuestionario/cuestionario.service';


@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {

  // Banderas para DOM
  flagTabla: boolean = false;

  cuestionarios: Cuestionario[] = [];
  cuestionario: Cuestionario = {};
  respuestasUsuario: RespuestasUsuario[] = [];

  // Nombre columnas tabla
  displayedColumns: string[] = ['Fecha', 'Intento', ' '];

  dataSource = new MatTableDataSource<RespuestasUsuario>();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private cuestionarioService: CuestionarioService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.cuestionarioService.getCuestionarioUserLogedDB().subscribe((cuestionarioUserDB: Cuestionario[]) => {
      this.cuestionarios = cuestionarioUserDB;
    });
  }

  // Table
  buscarCuestionario(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onRowClicked(row: any) {
    //this.cuestionario = row;
    //console.log('Row clicked: ', this.cuestionario);
  }


  // Metodos
  visualizacionResultados(cuestionario: Cuestionario) {
    this.flagTabla = true;
    this.cuestionario = cuestionario;
    this.cuestionarioService.getCuestionarioRespuestasDB(cuestionario.id).subscribe((respuestasUser) => {
      //this.cuestionarios[index].respuestasUsuario.push(respuestasUser)
      this.dataSource.data = respuestasUser;
    });
  }

  verReporte(respuestasUsuario: RespuestasUsuario) {
    // Guarda el id del cuestionario
    localStorage.setItem("cuestionario", this.cuestionario.id);
    this.router.navigate(['/reporte', respuestasUsuario.id])
  }

}
