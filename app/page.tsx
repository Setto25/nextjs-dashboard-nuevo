

import AcmeLogo from '@/app/ui/acme-logo';
import { Baby, BookHeart, BookOpen, BookOpenText, BookOpenTextIcon, LucideBookOpenText } from 'lucide-react';
import LoginPage from './login/page';
import '@/app/ui/global/grids.css';
import '@/app/ui/global/texts.css';
import '@/app/ui/global/shadows.css';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col ">
      <div className="flex h-20 shrink-0 items-center rounded-lg bg-withe p-4 md:h-52 shadow-[6px_6px_5px_-1px_rgba(0,0,0,0.35)] " style={{
        backgroundImage: 'url(/cabecera9.webp)', // Ruta de la imagen de fondo  
        backgroundSize: 'cover', // O 'contain' dependiendo de cómo quieras que se ajuste la imagen  
        backgroundPosition: 'center', // Centra la imagen  
        backgroundRepeat: 'no-repeat', // Evita que la imagen se repita  
      }}  >

        {/*<AcmeCabecera/>*/}

        <div className='w-1/5 h-full'>
          <AcmeLogo />
        </div>

        <div className='w-4/5'>
          <p className=" sm:text-2xl md:text-3xl lg:text-4xl xl:text-6xl px-8 text-center font-bold first-letter:bg-yellow-400 flex-grow text-sky-500" style={{ textShadow: '0 2px 3px rgba(0,0,0,0.8)' }}>Plataforma de capacitación de neonatología</p>
        </div>



      </div>

      <div className=" grid grid-cols-[repeat(auto-fit,minmax(500px,1fr))] gap-10 ">


        <div className=" contenedor_mensaje  justify-self-auto h-fit pb-6 gap-6 rounded-lg bg-lime-300 px-6  container-sombra-4lados ">


          <div />

          <Baby className="w-10 h-10 text-blue-600 mt-4" />


          <p className=" text-gray-800 subtitle-responsive  md:leading-normal text-justify m-6">
            Bienvenidas/os a la Plataforma de Capacitación de Neonatología del Hospital El Carmen, un espacio diseñado para potenciar el desarrollo profesional de nuestro equipo de matroneria, donde podrás acceder a recursos y herramientas que te permitirán mantenerte actualizado en los últimos protocolos y avances en el cuidado integral de recién nacidos, con el objetivo de seguir brindando una atención de excelencia.{' '}
       
          </p>

          <div className=' flex  items-center justify-center space-x-10'>


            <div className='px-2 md:px-10'><LucideBookOpenText className='w-10 h-10 text-blue-600' /></div>

          </div>


        </div>



        <div className=" contenedor__login flex justify-center w-1/2 h-full items-center place-items-center">
          <LoginPage />
        </div>


        {/* <NoteForm/>  borrar si no se usa el formulario*/}
      </div>
    </main>
  );
}