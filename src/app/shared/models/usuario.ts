export class Usuario {
    //Atributos para redes sociales
    uid?: string;
    correo: string;
    photoURL?: string;
    nombres: string;
    //Resto atributos
    apellidos?: string;
    cedula?: string;
    telefono: number;
    sexo?: string;
    clave?: string;
    cargo?: string;
    rol?: string;

    constructor(usuario?) {
        usuario = usuario || {};
        this.uid = usuario.uid || "";
        this.correo = usuario.correo || "";
        this.photoURL = usuario.photoURL || "";
        this.nombres = usuario.nombres || "";
        this.apellidos = usuario.apellidos || "";
        this.cedula = usuario.cedula || "";
        this.telefono = usuario.telefono || "";
        this.sexo = usuario.sexo || null;
        this.cargo = usuario.cargo || "";
        this.clave = usuario.clave || "";
        this.rol = usuario.rol || "USER_ROLE";
    }
}
