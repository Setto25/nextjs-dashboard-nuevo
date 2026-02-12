import AcmeLogo from '@/app/ui/acme-logo';
import { Baby, LucideBookOpenText } from 'lucide-react';
import LoginPage from './login/page';
import '@/app/ui/global/grids.css';
import '@/app/ui/global/texts.css';
import '@/app/ui/global/shadows.css';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col w-full justify-top">
      <div className=" flex flex-col md:flex-row items-center justify-center w-full h-fit  shrink-0 rounded-lg bg-withe p-4 md:h-52 shadow-[6px_6px_5px_-1px_rgba(0,0,0,0.35)] " style={{
        backgroundImage: 'url(/cabecera9.webp)', // Ruta de la imagen de fondo  
        backgroundSize: 'cover', // O 'contain' dependiendo de cómo quieras que se ajuste la imagen  
        backgroundPosition: 'center', // Centra la imagen  
        backgroundRepeat: 'no-repeat', // Evita que la imagen se repita  
      }}  >

        <div className=' w-fit h-full'>
          <AcmeLogo />
        </div>
        <div className=' w-4/5 h-full flex items-center justify-center'>
          <p className=" text-2xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-7xl px-8  text-center font-bold first-letter:bg-yellow-400 flex-grow text-sky-500" style={{ textShadow: '0 2px 3px rgba(0,0,0,0.8)' }}>Plataforma de Neonatología </p>
     
        </div>
      </div>

    {/* --- CONTENIDO PRINCIPAL --- */}
  <div className="contenedor__columnas grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 justify-center items-center w-full max-w-7xl mx-auto px-4 py-10">
    
    {/* --- CAJA DE MENSAJE (REDDISEÑADA) --- */}
    {/* Usamos bg-white/90 para un efecto semi-transparente si tienes fondo atrás, o bg-white sólido */}
    <div className="contenedor_mensaje flex flex-col items-center justify-center p-8 m-4 rounded-xl bg-white shadow-xl border-t-4 border-sky-500 backdrop-blur-sm">
      
      {/* Icono principal destacado */}
      <div className="p-3 bg-sky-50 rounded-full mb-4">
        <Baby className="w-12 h-12 text-sky-600" />
      </div>

      {/* Título de bienvenida opcional */}
      <h2 className="text-xl font-bold text-gray-700 mb-2">Bienvenidas/os</h2>

      {/* Texto justificado pero con buena tipografía */}
      <p className="text-gray-600 text-lg leading-relaxed text-justify md:text-center">
        A la Plataforma Digital. Una herramienta en constante crecimiento, pensada para simplificar la gestión diaria y facilitar el acceso rápido a protocolos, formatos y recursos educativos. Su objetivo es centralizar la información clave para apoyar la labor de excelencia en nuestra unidad.
      </p>

      {/* Separador visual pequeño */}
      <div className="w-16 h-1 bg-sky-200 rounded my-6"></div>

      {/* Icono secundario decorativo */}
      <div className='flex items-center justify-center'>
        <LucideBookOpenText className='w-8 h-8 text-sky-400' />
      </div>
    </div>
        <div className=" contenedor__login flex justify-center w-full h-full items-center place-items-center">
          <LoginPage />
        </div>

      </div>
    </main>
  );
}