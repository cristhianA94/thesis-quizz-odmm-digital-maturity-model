import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

// Models
import { Sector_Industrial } from 'app/shared/models/sector_industrial';
import { Pais } from 'app/shared/models/ubicacion';
import { Provincia, Canton } from 'app/shared/models/ubicacion';
import { Empresa } from 'app/shared/models/empresa';

// Services
import { PaisService } from 'app/core/services/user/pais/pais.service';
import { SectorIndustrialService } from 'app/core/services/user/sectorIndustrial/sector-industrial.service';
import { ProvinciaService } from 'app/core/services/user/provincia/provincia.service';
import { CantonService } from 'app/core/services/user/canton/canton.service';
import { EmpresaService } from 'app/core/services/user/empresas/empresa.service';
// Alertas
import Swal from 'sweetalert2';


@Component({
  selector: 'app-empresa-edit',
  templateUrl: './empresa-edit.component.html',
  styles: []
})
export class EmpresaEditComponent implements OnInit {

  load: boolean = false;
  idUser: string;
  editEmpresa: boolean = false;
  newEmpresa: boolean = false;
  empresasList: Empresa[] = [];
  empresa: Empresa;

  // Form
  empresaForm: FormGroup;

  areas: string[] = [
    'Local',
    'Nacional',
    'Internacional'
  ];

  empresas: string[] = [
    'Microempresa (menos de 10 personas)',
    'Pequeña empresa (entre 10 y 50 personas)',
    'Mediana empresa (entre 50 y 250)',
    'Gran empresa (más de 250 personas)'
  ];

  sectoresInds: Sector_Industrial[] = [];
  provincias: Provincia[] = [];
  cantones: Canton[] = [];
  paises: Pais[] = [];


  constructor(
    private fb: FormBuilder,
    // Services
    private empresaService: EmpresaService,
    private sectorIService: SectorIndustrialService,
    private paisService: PaisService,
    private provinciaService: ProvinciaService,
    private cantonService: CantonService,
  ) { }

  ngOnInit(): void {
    this.idUser = this.empresaService.idUser;

    this.empresaForm = this.empresabuildForm();
    this.cargarEmpresas();
    this.cargarServicios();
    // Quita la barra de cargando
    this.load = true;

  }

  cargarEmpresas() {
    this.empresaService.onEmpresaChanged.subscribe(empresas => {
      this.empresasList = empresas
    });
  }

  cargarServicios() {

    // Carga sectores industriales
    this.sectorIService.getSectoresIndustrialesDB().subscribe(sectoresInds => {
      this.sectoresInds = sectoresInds;
    });
    // Carga paises
    this.paisService.getPaisesDB().subscribe(paises => {
      this.paises = paises;
    });

    // Carga provincias segun pais
    this.empresaForm.get('idPais').valueChanges.subscribe(idPais => {
      this.provinciaService.getProvincias_PaisDB(idPais).subscribe(provincias => {
        this.provincias = provincias;
      });
    })

    // Carga canton segun provincia
    this.empresaForm.get('idProvincia').valueChanges.subscribe(idProvincia => {
      this.cantonService.getCantones_ProvinciasDB(idProvincia).subscribe(cantones => {
        this.cantones = cantones;
      });
    });
  }

  /* Construye el formulario */
  empresabuildForm() {
    return this.fb.group({
      razon_social: ['', Validators.required],
      anio_creacion: [, Validators.required],
      area_alcance: ['', Validators.required],
      franquicias: [''],
      direccion: ['', Validators.required],
      tamanio_empresa: ['', Validators.required],
      idPais: ['', Validators.required],
      idProvincia: ['', Validators.required],
      idCanton: ['', Validators.required],
      idSectorInd: ['', Validators.required]
    });
  }

  // Actualiza los valores segun la empresa elegida; si es nuevo se setea a 0 los campos
  empresaUpdateForm(empresa: Empresa, accion: string) {
    // Habilita los botones Registrar o Actualizar segun sea el caso
    if (accion == 'Agregar') {
      this.newEmpresa = true;
      this.editEmpresa = false;
    } else if (accion == 'Actualizar') {
      this.editEmpresa = true;
      this.newEmpresa = false;
    }

    this.empresa = empresa;

    this.empresaForm.patchValue({
      razon_social: [empresa.razon_social],
      anio_creacion: [empresa.anio_creacion],
      area_alcance: [empresa.area_alcance],
      franquicias: [empresa.franquicias],
      direccion: [empresa.direccion],
      tamanio_empresa: [empresa.tamanio_empresa],
      idPais: [],
      idProvincia: [],
      idCanton: [],
      idSectorInd: []
    });
  }


  // Crea una empresa nueva
  crearEmpresa() {

    const empresa: Empresa = {
      razon_social: this.empresaForm.value.razon_social,
      anio_creacion: this.empresaForm.value.anio_creacion,
      area_alcance: this.empresaForm.value.area_alcance,
      franquicias: this.empresaForm.value.franquicias,
      direccion: this.empresaForm.value.direccion,
      tamanio_empresa: this.empresaForm.value.tamanio_empresa,
      idCanton: this.empresaForm.value.idCanton,
      idSectorInd: this.empresaForm.value.idSectorInd
    }

    // Manda a registrar una nueva empresa
    this.empresaService.createEmpresaDB({ uid: this.idUser }, empresa);
  }

  actualizarEmpresa() {

    const empresaEdit: Empresa = {
      id: this.empresa.id,
      razon_social: this.empresaForm.value.razon_social,
      anio_creacion: this.empresaForm.value.anio_creacion,
      area_alcance: this.empresaForm.value.area_alcance,
      franquicias: this.empresaForm.value.franquicias,
      direccion: this.empresaForm.value.direccion,
      tamanio_empresa: this.empresaForm.value.tamanio_empresa,
      idUser: this.empresaService.idUser,
      idCanton: this.empresaForm.value.idCanton,
      idSectorInd: this.empresaForm.value.idSectorInd
    }

    console.log("Empresa edit", empresaEdit);
    this.empresaService.updateEmpresa(empresaEdit);
  }

  eliminarEmpresa(empresa: Empresa) {

    // Dialog confirmacion
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-outline-success btn-rounded m-2',
        cancelButton: 'btn btn-outline-danger btn-rounded'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: '¿Está seguro?',
      text: "Esta a punto de borrar la empresa " + empresa.razon_social,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, quiero borrarla',
      cancelButtonText: 'No, cancelar',
      reverseButtons: true
    }).then(error => {
      if (error.value) {

        // Borra la empresa
        this.empresaService.deleteEmpresa(empresa);

        swalWithBootstrapButtons.fire(
          '¡Empresa borrada!',
          'La empresa a sido eliminada',
          'success'
        )

      } else if (
        /* Read more about handling dismissals below */
        error.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelado',
          '',
          'error'
        )
      }
    });
  }

  cancelar() {
    this.newEmpresa = false;
    this.editEmpresa = false;
  }

}
