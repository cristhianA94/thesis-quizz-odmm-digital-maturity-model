import { Capacidad } from 'app/shared/models/capacidad';
export interface Subcategoria {
    id?: string;
    nombre: string;
    descripcion: string;
    peso: number;
    idCategoria: any;
    capacidades?: Capacidad[];
}
