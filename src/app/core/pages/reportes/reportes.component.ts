import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { Cuestionario, RespuestasUsuario } from 'app/shared/models/cuestionario';
import { CuestionarioService } from 'app/core/services/cuestionario/cuestionario.service';
import { UsuarioService } from 'app/core/services/user/usuarios/usuario.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Usuario } from 'app/shared/models/usuario';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {

  // Banderas para DOM
  flagTabla: boolean = false;

  consultaForm: FormGroup;

  usuarios: Usuario[] = [];

  cuestionariosUser: Cuestionario[] = [];
  cuestionarios: Cuestionario[] = [];
  cuestionario: Cuestionario = {};
  respuestasUsuario: RespuestasUsuario[] = [];

  // Nombre columnas tabla
  displayedColumns: string[] = ['Fecha', 'Intento', ' '];

  dataSource = new MatTableDataSource<RespuestasUsuario>();

  constructor(
    private fb: FormBuilder,
    private cuestionarioService: CuestionarioService,
    private router: Router,
    public userService: UsuarioService,
    public auth: AngularFireAuth
  ) { }

  ngOnInit(): void {
    this.userService.validateRolUser();
    this.consultaForm = this.registerBuildForm();
    this.cargarData();
  }

  cargarData() {
    //  **USUARIO
    // Cargar los cuestionarios del usuario logueado ordenados
    this.cuestionarioService.getCuestionarioUserLogedDB().
      pipe(
        // Los ordena alfabeticamente
        map((data) => {
          data.sort((a, b) => {
            return a.categoriaNombre < b.categoriaNombre ? -1 : 1;
          });
          return data;
        })
      ).subscribe((cuestionarioUserDB: Cuestionario[]) => {
        this.cuestionarios = cuestionarioUserDB;
      });

    //  **ADMINISTRADOR
    this.userService.getUsersDB().subscribe((users) => {
      this.usuarios = users;
    });

    // Consulta los cuestionarios que ha contestado el usuario seleccionado
    this.consultaForm.get('idUsuario').valueChanges.subscribe(idUsuarioSelect => {
      this.cuestionarioService.getCuestionarioUserDB(idUsuarioSelect).subscribe((cuestionariosUser) => {
        this.cuestionariosUser = cuestionariosUser;
      });
    })
  }
  // Table
  buscarCuestionario(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

  }

  /* Functions */

  // Permite ver la tabla con las diferentes evaluaciones hechas por el usuario según la categoría
  visualizacionResultados(cuestionario: Cuestionario) {
    // Reporte general
    if (cuestionario == 'todas') {
      this.verReporteGeneral();
    }
    // Obtiene reporte individual
    else {
      this.flagTabla = true;
      this.cuestionario = cuestionario;
      this.cuestionarioService.getCuestionarioRespuestasDB(cuestionario.id).subscribe((respuestasUser) => {
        this.dataSource.data = respuestasUser;
      });
    }

  }

  // Permite ver detalladamente el resultado de la evaluación realizada
  verReporteGeneral() {
    this.router.navigate(['/reporteGeneral']);
  }

  //                    ** ADMINISTRADOR  **

  /* Validador de formulario */
  registerBuildForm() {
    return this.fb.group({
      idUsuario: ['', Validators.required],
      idCategoria: ['', Validators.required]
    });
  }

  consultarUsuario() {
    this.flagTabla = true;
    let idUser = this.consultaForm.get("idUsuario").value;
    localStorage.setItem("idUserCuestionario", idUser);
    let categoria = this.consultaForm.get("idCategoria").value;
    this.cuestionario = categoria;

    this.cuestionarioService.getCuestionarioRespuestasDB(this.cuestionario.id).subscribe((respuestasUser) => {
      this.dataSource.data = respuestasUser;
    });
  }

  consultarReportesUsuarios() {
    this.cuestionarioService.getCuestionariosDB().subscribe((cuestionarios) => {
      //console.log(cuestionarios);

    });
  }


}
