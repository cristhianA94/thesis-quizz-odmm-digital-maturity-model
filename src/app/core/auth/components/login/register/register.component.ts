import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

// Models
import { Sector_Industrial } from 'app/shared/models/sector_industrial';
import { Provincia, Canton, Pais } from 'app/shared/models/ubicacion';

// Servicios
import { AlertsService } from 'app/core/services/notificaciones/alerts.service';
import { AuthService } from 'app/core/auth/service/auth.service';
import { SectorIndustrialService } from 'app/core/services/user/sectorIndustrial/sector-industrial.service';
import { PaisService } from 'app/core/services/user/pais/pais.service';
import { ProvinciaService } from 'app/core/services/user/provincia/provincia.service';
import { CantonService } from 'app/core/services/user/canton/canton.service';



@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registroForm: FormGroup;

  /* Formulario sexo */
  sexo: string[] = [
    'Hombre',
    'Mujer'
  ];
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

  provincia: any;
  provincias: Provincia[] = [];

  cantones: Canton[] = [];

  pais: any;
  paises: Pais[] = [];

  // Mensajes de validacion de inputs en tiempo real.
  account_validation_messages = {
    'username': [
      { type: 'required', message: 'Username is required' },
      { type: 'minlength', message: 'Username must be at least 5 characters long' },
      { type: 'maxlength', message: 'Username cannot be more than 25 characters long' },
      { type: 'pattern', message: 'Your username must contain only numbers and letters' },
      { type: 'validUsername', message: 'Your username has already been taken' }
    ],
    'correo': [
      { type: 'required', message: 'El email es requerido' },
      { type: 'email', message: 'Ingrese un email válido' }
    ],
    'confirm_password': [
      { type: 'required', message: 'Confirm password is required' },
      { type: 'areEqual', message: 'Password mismatch' }
    ],
    'clave': [
      { type: 'required', message: 'La contraseña es requerida' },
    ],
    'terms': [
      { type: 'pattern', message: 'You must accept terms and conditions' }
    ]
  }


  constructor(
    private router: Router,
    private formbuild: FormBuilder,
    // Services
    private alerta: AlertsService,
    private authService: AuthService,
    private alertaService: AlertsService,
    private sectorIService: SectorIndustrialService,
    private paisService: PaisService,
    private provinciaService: ProvinciaService,
    private cantonService: CantonService,
  ) { }

  ngOnInit(): void {
    this.registroForm = this.registerBuildForm();
    this.cargarServicios();
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
    this.registroForm.get('idPais').valueChanges.subscribe(idPais => {
      this.provinciaService.getProvincias_PaisDB(idPais).subscribe(provincias => {
        this.provincias = provincias;
      });
    })

    // Carga canton segun provincia
    this.registroForm.get('idProvincia').valueChanges.subscribe(idProvincia => {
      this.cantonService.getCantones_ProvinciasDB(idProvincia).subscribe(cantones => {
        this.cantones = cantones;
      });
    });
  }

  /* Validador de formulario */
  registerBuildForm() {
    return this.formbuild.group({
      // User
      nombres: ['', Validators.required],
      apellidos: [''],
      cedula: ['', Validators.required],
      telefono: ['', [Validators.pattern("^[0-9]*$"), Validators.maxLength(10)]],
      sexo: [''],
      correo: ['', [Validators.required, Validators.email]],
      clave: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]],
      cargo: ['', Validators.required],
      // Empresa
      razon_social: ['', Validators.required],
      anio_creacion: ['', Validators.required],
      area_alcance: ['', Validators.required],
      franquicias: [''],
      direccion: ['', Validators.required],
      tamanio_empresa: ['', Validators.required],
      idPais: ['', Validators.required],
      idProvincia: ['', Validators.required],
      idCanton: ['', Validators.required],
      idSectorIndustrial: ['', Validators.required]
    });
  }

  /* Registro usuario */
  registro() {
    this.authService.registerUser(this.registroForm.value)
  }


}
