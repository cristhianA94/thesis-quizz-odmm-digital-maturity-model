export interface Cuestionario {
    _id?: string;
    fecha: string;
}

export interface Recomendacion {
    _id?: string;
    detalle_nivel: string;
    recomendacion: string;
    nivel: string;
}

export interface Respuesta {
    _id?: string;
    opcion: string;
}

export interface Categoria {
    _id?: string;
    categoria: string;
    tipo: string;
    orden: string;
    padre: string;
}

export interface Metrica {
    _id?: string;
    pregunta: string;
    peso: number;
    detalle: string;
}
