export interface Respuesta {
    opcion: string;
    pesoRespuesta: number;
    recomendacion: string;
}

export interface Metrica {
    id?: string;
    nombre: string;
    pregunta: string;
    pesoPregunta: number;
    idCapacidad: any;
    respuestas: Respuesta[];
}