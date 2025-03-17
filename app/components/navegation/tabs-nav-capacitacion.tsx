import { BookCheck, TvIcon } from "lucide-react";
import SubTabs from "@/app/components/navegation/subtabs";
import PaginaDocumentos from "../operaciones-documentos/CargarDocumento";
import PaginaVideos from "../operaciones-videos/CargaVideos";


export const SelectExport = (seleccion: number) => {
    switch (seleccion) {
        case 0:
            return <Reanimacion />;
        case 1:
            return <CuidadosGenerales />;
        case 2:
            return <SoporteRespiratorio />;
        case 3:
            return <ManejoDeInfecciones />;
        case 4:
            return <NutricionAlimentacion />;
        case 5:
            return <AdministracionMedicamentos />;
        case 6:
            return <ProcedimientosInvasivos />;
        case 7:
            return <CuidadosDePielTermoregulacion />;
        case 8:
            return <Monitorizacion />;

        default:
            return <p>Página no seleccionada</p>;
    }
}

export const Reanimacion = () => {
    const misTabs = [
        { name: 'Videos', icon: <TvIcon />, component: PaginaVideos },
        { name: 'Documentos', icon: <BookCheck />, component: PaginaDocumentos },

    ];

    return (
        <div>

            <SubTabs tabs={misTabs} />
        </div>
    )
}


export const CuidadosGenerales= () => {
    const misTabs = [
        { name: 'Videos', icon: <TvIcon />, component: PaginaVideos },
        { name: 'Documentos', icon: <BookCheck />, component: PaginaDocumentos },
    ];

    return (
        <div>

            <SubTabs tabs={misTabs} />
        </div>
    )

}


export const SoporteRespiratorio= () => {
    const misTabs = [
        { name: 'Videos', icon: <TvIcon />, component: PaginaVideos },
        { name: 'Documentos', icon: <BookCheck />, component: PaginaDocumentos },
    ];

    return (
        <div>
            <SubTabs tabs={misTabs} />
        </div>
    );
};


export const ManejoDeInfecciones = () => {
    const misTabs = [
        { name: 'Videos', icon: <TvIcon />, component: PaginaVideos },
        { name: 'Documentos', icon: <BookCheck />, component: PaginaDocumentos },
    ];

    return (
        <div>
            <SubTabs tabs={misTabs} />
        </div>
    );
};


export const NutricionAlimentacion  = () => {
    const misTabs = [
        { name: 'Videos', icon: <TvIcon />, component: PaginaVideos },
        { name: 'Documentos', icon: <BookCheck />, component: PaginaDocumentos },
    ];

    return (
        <div>
            <SubTabs tabs={misTabs} />
        </div>
    );
};


export const AdministracionMedicamentos = () => {
    const misTabs = [
        { name: 'Videos', icon: <TvIcon />, component: PaginaVideos },
        { name: 'Documentos', icon: <BookCheck />, component: PaginaDocumentos },
    ];

    return (
        <div>
            <SubTabs tabs={misTabs} />
        </div>
    );
};


export const ProcedimientosInvasivos = () => {
    const misTabs = [
        { name: 'Videos', icon: <TvIcon />, component: PaginaVideos },
        { name: 'Documentos', icon: <BookCheck />, component: PaginaDocumentos },
    ];

    return (
        <div>
            <SubTabs tabs={misTabs} />
        </div>
    );
};


export const CuidadosDePielTermoregulacion = () => {
    const misTabs = [
        { name: 'Videos', icon: <TvIcon />, component: PaginaVideos },
        { name: 'Documentos', icon: <BookCheck />, component: PaginaDocumentos },
    ];

    return (
        <div>
            <SubTabs tabs={misTabs} />
        </div>
    );
};

export const Monitorizacion = () => {
    const misTabs = [
        { name: 'Videos', icon: <TvIcon />, component: PaginaVideos },
        { name: 'Documentos', icon: <BookCheck />, component: PaginaDocumentos },
    ];

    return (
        <div>
            <SubTabs tabs={misTabs} />
        </div>
    );
};



