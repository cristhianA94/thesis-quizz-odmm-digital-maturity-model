import { Pais } from './../../../models/lugar';
import { Empresa } from './../../../models/empresa';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

/* Firebase */
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from 'src/app/services/auth.service';
import { AlertsService } from 'src/app/services/alerts.service';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection
} from '@angular/fire/firestore';

/* Interfaces */
import { Usuario } from 'src/app/models/usuario';

import { Sector_Industrial } from './../../../models/sector_industrial';
export interface Tamanio_Empresa {
  tipo_empresa: string;
  view: string;
}

@Component({
  selector: 'app-adminpage',
  templateUrl: './adminpage.component.html',
  styleUrls: ['./adminpage.component.scss']
})
export class AdminpageComponent implements OnInit, OnDestroy {

  private idUser;

  editing: boolean = false;

  usuarioCollection: AngularFirestoreCollection<Usuario>;
  usuarioDoc: AngularFirestoreDocument<Usuario>;
  usuarioObj = {} as Usuario;
  usuariosList: any = [];
  editingUsuario: Usuario; //Variable para editar usuario

  empresaCollection: AngularFirestoreCollection<Empresa>;
  empresaDoc: AngularFirestoreDocument<Empresa>;
  empresaObj = {} as Empresa;
  empresasList = [];
  editingEmpresa: Empresa; //Variable para editar empresa

  sectorIndCollection: AngularFirestoreCollection<Sector_Industrial>;
  sectorIndDoc: AngularFirestoreDocument<Sector_Industrial>;
  sectorIndustrialObj = {} as Sector_Industrial;
  sectorIndustrialesList = [];
  editingSectorInd: Sector_Industrial; //Variable para editar producto


  paisCollection: AngularFirestoreCollection<Pais>;
  paisDoc: AngularFirestoreDocument<Pais>;
  paisObj = {} as Pais;
  paisesList = [];
  editingPais: Pais; //Variable para editar producto


  constructor(
    public afAuth: AngularFireAuth,
    private router: Router,
    // servicio creado donde esta la logia de autenticacion
    private authService: AuthService,
    private formbuild: FormBuilder,
    //Alertas tras login
    private alerta: AlertsService,
  ) { }

  ngOnInit() {
    var body = document.getElementsByTagName("body")[0];
    body.classList.add("profile-page");
    this.buildForm();
    this.getUsers();
    this.getEmpresas();


  }
  ngOnDestroy() {
    var body = document.getElementsByTagName("body")[0];
    body.classList.remove("profile-page");
  }

  // Form
  userForm: FormGroup;
  empresaForm: FormGroup;
  sectorIndForm: FormGroup;
  lugarForm: FormGroup;

  /* Formulario sexo */
  required: boolean;
  sexo: string;
  genero: string[] = [
    'Hombre',
    'Mujer'
  ];

  showDetails: boolean;

  sector_industrial: string;
  sectores: Sector_Industrial[] = [
    { nombre: 'Actividades financieras y de seguros' },
    { nombre: 'Actividades inmobiliarias' },
    { nombre: 'Actividades profesionales, científicas y técnicas' },
    { nombre: 'Actividades administrativas y servicios auxliares' },
    { nombre: 'Actividades sanitarias y de servicios sociales' },
    { nombre: 'Actividades artísticas, recreativas y de entretenimiento' },
    { nombre: 'Actividades de los hogares como empleadores de personal doméstico' },
    { nombre: 'Actividades de los hogares como productores de bienes y servicios para uso propio' },
    { nombre: 'Actividades de organizaciones y organismos extraterritoriales' },
    { nombre: 'Administración Pública y defensa' },
    { nombre: 'Agricultura, ganadería, silvicultura y pesca' },
    { nombre: 'Comercio al por mayor y al por menor' },
    { nombre: 'Construcción' },
    { nombre: 'Educación' },
    { nombre: 'Hostelería' },
    { nombre: 'Industrias extractivas' },
    { nombre: 'Industria manufacturera' },
    { nombre: 'Información y comunicaciones' },
    { nombre: 'Otros servicios' },
    { nombre: 'Reparación de vehículos de motor y motocicletas' },
    { nombre: 'Seguridad Social obligatoria' },
    { nombre: 'Suministro de energía eléctrica, gas, vapor y aire acondicionado' },
    { nombre: 'Suministro de agua, actividades de saneamiento, gestión de residuos y descontaminación' },
    { nombre: 'Transporte y almacenamiento' }
  ];

  area_alcance: string;
  areas: string[] = [
    'Local',
    'Nacional',
    'Internacional'
  ];

  tamanio_empresa: string;
  empresas: string[] = [
    'Microempresa (menos de 10 personas)',
    'Pequeña empresa (entre 10 y 50 personas)',
    'Mediana empresa (entre 50 y 250)',
    'Gran empresa (más de 250 personas)'
  ];

  provincia: string;
  provincias: string[] = [
    'Azuay',
    'Antártida Ecuatoriana',
    'Bolívar',
    'Cañar',
    'Carchi',
    'Chimborazo',
    'Cotopaxi',
    'El Oro',
    'Esmeraldas',
    'Galápagos',
    'Guayas',
    'Imbabura',
    'Loja',
    'Los Ríos',
    'Manabí',
    'Morona Santiago',
    'Napo',
    'Orellana',
    'Pastaza',
    'Pichincha',
    'Santa Elena',
    'Sto. Domingo de los Tsachilas',
    'Sucumbíos',
    'Tungurahua',
    'Zamora Chinchipe'
  ];

  canton: string;
  cantones: string[] = [
    'Calvas',
    'Catamayo',
    'Celica',
    'Chaguarpamba',
    'Espíndola',
    'Gonzanamá',
    'Loja',
    'Macará',
    'Olmedo',
    'Paltas',
    'Pindal',
    'Puyango',
    'Quilanga',
    'Saraguro',
    'Sozoranga',
    'Zapotillo'
  ];

  pais: string;
  paises: string[] = [
    'Afganistán',
    'Albania',
    'Alemania',
    'Andorra',
    'Angola',
    'Antigua y Barbuda',
    'Arabia Saudita',
    'Argelia',
    'Argentina',
    'Armenia',
    'Australia',
    'Austria',
    'Azerbaiyán',
    'Bahamas',
    'Bangladés',
    'Barbados',
    'Baréin',
    'Bélgica',
    'Belice',
    'Benín',
    'Bielorrusia',
    'Birmania',
    'Bolivia',
    'Bosnia y Herzegovina',
    'Botsuana',
    'Brasil',
    'Brunéi',
    'Bulgaria',
    'Burkina Faso',
    'Burundi',
    'Bután',
    'Cabo Verde',
    'Camboya',
    'Camerún',
    'Canadá',
    'Catar',
    'Chad',
    'Chile',
    'China',
    'Chipre',
    'Ciudad del Vaticano',
    'Colombia',
    'Comoras',
    'Corea del Norte',
    'Corea del Sur',
    'Costa de Marfil',
    'Costa Rica',
    'Croacia',
    'Cuba',
    'Dinamarca',
    'Dominica',
    'Ecuador',
    'Egipto',
    'El Salvador',
    'Emiratos Árabes Unidos',
    'Eritrea',
    'Eslovaquia',
    'Eslovenia',
    'España',
    'Estados Unidos',
    'Estonia',
    'Etiopía',
    'Filipinas',
    'Finlandia',
    'Fiyi',
    'Francia',
    'Gabón',
    'Gambia',
    'Georgia',
    'Ghana',
    'Granada',
    'Grecia',
    'Guatemala',
    'Guyana',
    'Guinea',
    'Guinea ecuatorial',
    'Guinea-Bisáu',
    'Haití',
    'Honduras',
    'Hungría',
    'India',
    'Indonesia',
    'Irak',
    'Irán',
    'Irlanda',
    'Islandia',
    'Islas Marshall',
    'Islas Salomón',
    'Israel',
    'Italia',
    'Jamaica',
    'Japón',
    'Jordania',
    'Kazajistán',
    'Kenia',
    'Kirguistán',
    'Kiribati',
    'Kuwait',
    'Laos',
    'Lesoto',
    'Letonia',
    'Líbano',
    'Liberia',
    'Libia',
    'Liechtenstein',
    'Lituania',
    'Luxemburgo',
    'Macedonia del Norte',
    'Madagascar',
    'Malasia',
    'Malaui',
    'Maldivas',
    'Malí',
    'Malta',
    'Marruecos',
    'Mauricio',
    'Mauritania',
    'México',
    'Micronesia',
    'Moldavia',
    'Mónaco',
    'Mongolia',
    'Montenegro',
    'Mozambique',
    'Namibia',
    'Nauru',
    'Nepal',
    'Nicaragua',
    'Níger',
    'Nigeria',
    'Noruega',
    'Nueva Zelanda',
    'Omán',
    'Países Bajos',
    'Pakistán',
    'Palaos',
    'Panamá',
    'Papúa Nueva Guinea',
    'Paraguay',
    'Perú',
    'Polonia',
    'Portugal',
    'Reino Unido',
    'República Centroafricana',
    'República Checa',
    'República del Congo',
    'República Democrática del Congo',
    'República Dominicana',
    'República Sudafricana',
    'Ruanda',
    'Rumanía',
    'Rusia',
    'Samoa',
    'San Cristóbal y Nieves',
    'San Marino',
    'San Vicente y las Granadinas',
    'Santa Lucía',
    'Santo Tomé y Príncipe',
    'Senegal',
    'Serbia',
    'Seychelles',
    'Sierra Leona',
    'Singapur',
    'Siria',
    'Somalia',
    'Sri Lanka',
    'Suazilandia',
    'Sudán',
    'Sudán del Sur',
    'Suecia',
    'Suiza',
    'Surinam',
    'Tailandia',
    'Tanzania',
    'Tayikistán',
    'Timor Oriental',
    'Togo',
    'Tonga',
    'Trinidad y Tobago',
    'Túnez',
    'Turkmenistán',
    'Turquía',
    'Tuvalu',
    'Ucrania',
    'Uganda',
    'Uruguay',
    'Uzbekistán',
    'Vanuatu',
    'Venezuela',
    'Vietnam',
    'Yemen',
    'Yibuti',
    'Zambia',
    'Zimbabue'
  ];

  buildForm(): void {
    this.userForm = this.formbuild.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      cedula: ['', Validators.required],
      telefono: new FormControl('', Validators.required),
      sexo: ['',],
      correo: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      cargo: ['Gerente', Validators.required],
    });


    this.empresaForm = this.formbuild.group({
      razon_social: ['', Validators.required],
      tamanio_empresa: ['', Validators.required],
      anio_creacion: ['', Validators.required],
      franquicias: ['', Validators.required],
      area_alcance: ['', Validators.required],
      direccion: ['', Validators.required]
    });

    this.sectorIndForm = this.formbuild.group({
      nombre: ['', Validators.required],
    });

    /*  this.lugarForm = this.formbuild.group({
       pais: ['', Validators.required],
       provincia: ['', Validators.required],
       canton: ['', Validators.required]
     }); */

  }

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
      { type: 'pattern', message: 'Ingrese un email válido' }
    ],
    'confirm_password': [
      { type: 'required', message: 'Confirm password is required' },
      { type: 'areEqual', message: 'Password mismatch' }
    ],
    'clave': [
      { type: 'required', message: 'La contraseña es requerida' },
      { type: 'minlength', message: 'Password must be at least 5 characters long' },
      { type: 'pattern', message: 'Your password must contain at least one uppercase, one lowercase, and one number' }
    ],
    'terms': [
      { type: 'pattern', message: 'You must accept terms and conditions' }
    ]
  }

  getUsers() {
    /* this.authService.getUsuarios().subscribe(users => {
      this.usuariosList = users;
      console.log(this.usuariosList);
      console.log(this.usuariosList[0].rol);

    }); */

    this.authService.getAuth().subscribe(data => {
      this.authService.getUser(data.uid).subscribe(user => {
        this.usuarioObj = user;
        this.usuariosList = this.usuarioObj
        console.log(this.usuarioObj);
        
        this.idUser = user.uid
        // Recupera el id
        this.editingUsuario.uid = this.idUser;
        //this.editingUsuario.rol = this.usuariosList
      })
    })
  }

  getEmpresas() {
    this.authService.getEmpresas().subscribe(empresas => {
      this.empresasList = empresas;
    });

    this.authService.getAuth().subscribe(data => {
      this.authService.getUser(data.uid).subscribe(user => {
        // Recupera el id
        this.editingEmpresa.idUser = this.idUser;
      })
    })
  }

  editUsuario(event, user) {
    this.editing = !this.editing;
    this.editingUsuario = user;
    console.log("BL: ", user);

  }

  editEmpresa(event, business) {
    this.editing = !this.editing;
    this.editEmpresa = business;
    console.log("BL: ", business);
  }

  editSectorInd(event, sectorIn) {
    this.editing = !this.editing;
    this.editSectorInd = sectorIn;
  }


  /* Update usuario */
  updateUsuario() {
    this.authService.updateUsuario(this.userForm.value);
    this.editingUsuario = {} as Usuario;
    this.editing = false;
  }

  /* Update empresa */
  updateEmpresa() {
    this.editingEmpresa = this.empresaForm.value;
    list
    this.authService.updateEmpresa(this.empresaForm.value);
    this.editing = false;
  }

  /* Update Secttor Industrial */
  updateSectorIndustrial() {
    this.authService.updateSectorIndustrial(this.sectorIndForm.value);
    this.editingSectorInd = {} as Sector_Industrial;
    this.editing = false;
  }

  /* Update usuario */
  updateLocation() {
    this.authService.registerUser(this.userForm.value);
  }


}
