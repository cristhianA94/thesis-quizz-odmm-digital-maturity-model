import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Usuario } from 'app/shared/models/usuario';
import { UsuarioService } from 'app/core/services/user/usuarios/usuario.service';

@Component({
  selector: 'app-usuario-edit',
  templateUrl: './usuario-edit.component.html',
  styles: ['']
})
export class UsuarioEditComponent implements OnInit {


  usuario: Usuario;
  usuarioForm: FormGroup;

  hide = true;
  passReset: boolean = false;
  correoReset: string;

  sexo: string[] = [
    'Hombre',
    'Mujer'
  ];

  // Mensajes de validacion de inputs en tiempo real.
  account_validation_messages = {
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
    ]
  }


  //Form
  constructor(
    public userService: UsuarioService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    // Carga los datos del usuario
    this.userService.onUsuarioChanged.subscribe(usuario => {
      this.usuario = usuario
    });
    this.usuarioForm = this.userbuildForm();
  }


  /* Validador de formulario */
  userbuildForm() {

    return this.fb.group({
      nombres: [this.usuario.nombres, Validators.required],
      apellidos: [this.usuario.apellidos, Validators.required],
      cedula: [this.usuario.cedula],
      telefono: [this.usuario.telefono, [Validators.pattern("^[0-9]*$"), Validators.maxLength(10)]],
      sexo: [this.usuario.sexo],
      cargo: [this.usuario.cargo],
      correo: [this.usuario.correo, [Validators.required, Validators.email]],
      clave: ['', Validators.required]
    });
  }

  actualizarUsuario() {

    const userEdit: Usuario = {
      uid: this.usuario.uid,
      nombres: this.usuarioForm.value.nombres,
      apellidos: this.usuarioForm.value.apellidos,
      cedula: this.usuarioForm.value.cedula,
      telefono: this.usuarioForm.value.telefono,
      sexo: this.usuarioForm.value.sexo,
      cargo: this.usuarioForm.value.cargo,
      correo: this.usuarioForm.value.correo,
      rol: this.usuario.rol
    }
    
    this.userService.updateUsuario(userEdit)
  }

}
