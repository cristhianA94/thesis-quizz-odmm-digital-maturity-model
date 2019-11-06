export interface Pais {
    idPais?: string;
    nombre: string;
    idEmpresa?: string;
}

export interface Provincia {
    _id?: string;
    nombre: string;
    idPais: string;
}

export interface Canton {
    _id?: string;
    nombre: string;
    idProvincia: string;
}

