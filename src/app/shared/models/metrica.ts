export interface Respuesta {
    opcion: string;
    peso: number;
    recomendacion: number;
}

export interface Metrica {
    id?: string;
    nombre: string;
    pregunta: string;
    peso: number;
    respuestas: Respuesta[];
    idCapacidad: any;
}