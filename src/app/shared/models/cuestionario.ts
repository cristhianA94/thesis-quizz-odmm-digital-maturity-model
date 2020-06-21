
export interface Cuestionario {
    id?: string;
    fecha: string;
}

export interface Recomendacion {
    id?: string;
    detalle_nivel: string;
    recomendacion: string;
    nivel: string;
    idRespuesta: any;
}

export interface Respuesta {
    id?: string;
    opcion: string;
    peso: number;
    idMetrica: any;
}

export interface Metrica {
    id?: string;
    nombre: string;
    pregunta: string;
    peso: number;
    respuestas: any
    idCapacidad: any;
}

export interface Capacidad {
    id?: string;
    nombre: string;
    descripcion: string;
    peso: number;
    idSubcategoria: any;
}

export interface Subcategoria {
    id?: string;
    nombre: string;
    descripcion: string;
    peso: number;
    idCategoria: any;
}

export interface Categoria {
    id?: string;
    nombre: string;
    descripcion: string;
    peso: number;
}
