import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RespuestasUsuario } from 'app/shared/models/cuestionario';
import { CuestionarioService } from 'app/core/services/cuestionario/cuestionario.service';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.component.html',
  styles: [``]
})
export class ReporteComponent implements OnInit {

  respuestasUsuario:RespuestasUsuario;

  constructor(
    private actRouter: ActivatedRoute,
    private cuestionarioService: CuestionarioService,
    ) { }

  ngOnInit(): void {
    this.actRouter.params.subscribe((categoria) => {
      this.respuestasUsuario = this.cuestionarioService.respuestaUsuario;
    });
  }

}
