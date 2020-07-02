import { Metrica } from './metrica';
export interface Capacidad {
    id?: string;
    nombre: string;
    descripcion: string;
    peso: number;
    idSubcategoria: any;
    metrica?: Metrica
}
