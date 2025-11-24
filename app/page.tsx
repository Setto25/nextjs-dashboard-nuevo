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

      <div className="contenedor__columnas grid grid-cols-[repeat(auto-fit,minmax(500px,1fr))] gap-2 justify-center items-center ">
        <div className=" contenedor_mensaje  justify-self-auto h-fit pb-6 m-6 gap-6 rounded-lg bg-lime-300 px-6  container-sombra-4lados ">
          <div />

          <Baby className="w-10 h-10 text-blue-600 mt-4" />

          <p className=" text-gray-800 subtitle-responsive  md:leading-normal text-justify m-6">
            Bienvenidas/os a la Plataforma de Neonatología del Hospital El Carmen, un espacio centralizado para nuestro equipo de matronería. Aquí encontrarás una amplia gama de recursos para apoyar tu labor diaria, incluyendo protocolos, capacitaciones, libros, videos, manuales y plantillas de documentos. El objetivo es facilitar el acceso a las herramientas necesarias para seguir brindando una atención de excelencia a nuestros recién nacidos.{' '}
          </p>

          <div className=' flex  items-center justify-center space-x-10'>
            <div className='px-2 md:px-10'><LucideBookOpenText className='w-10 h-10 text-blue-600' /></div>
          </div>
        </div>
        <div className=" contenedor__login flex justify-center w-full h-full items-center place-items-center">
          <LoginPage />
        </div>

      </div>
    </main>
  );
}