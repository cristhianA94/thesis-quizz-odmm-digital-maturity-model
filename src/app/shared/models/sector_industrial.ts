export class Sector_Industrial {
    id?: string
    nombre: string;

    constructor(sectorIndustrial?) {
        sectorIndustrial = sectorIndustrial || {};
        this.nombre = sectorIndustrial.nombre || "";
    }
}