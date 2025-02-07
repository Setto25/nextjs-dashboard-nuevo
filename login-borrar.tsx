

import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import styles from '@/app/ui/home.module.css';
import { lusitana, monserrat } from '@/app/ui/fonts';
import Image from 'next/image';
import NoteForm from './app/components/noteform';
import { Baby, BookHeart, BookOpen, BookOpenText, BookOpenTextIcon, LucideBookOpenText } from 'lucide-react';
import AcmeCabecera from './app/ui/acme-cabecera';

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

      <div className="mt-4 flex grow flex-col gap-8 md:flex-row pl-4">


        <div className="flex flex-col justify-self-auto h-fit pb-6 gap-6 rounded-lg bg-lime-300 px-6 md:w-2/5 md:px-10 lg:px-20 shadow-[6px_6px_10px_-1px_rgba(0,0,0,0.15)]">


          <div />

          <Baby className="w-10 h-10 text-blue-600" />


          <p className="text-sm text-gray-800 md:text-base lg:text-lg md:leading-normal text-justify">
            Bienvenidas/os a la Plataforma de Capacitación de Neonatología del Hospital El Carmen, un espacio diseñado para potenciar el desarrollo profesional de nuestro equipo de matroneria, donde podrás acceder a recursos y herramientas que te permitirán mantenerte actualizado en los últimos protocolos y avances en el cuidado integral de recién nacidos, con el objetivo de seguir brindando una atención de excelencia.{' '}
            <a href="https://nextjs.org/learn/" className="text-blue-500">
              Next.js Learn Course
            </a>
            , brought to you by Vercel.
          </p>

          <div className=' flex  items-center justify-center space-x-10'>

            <Link
              href="app/login"
              className="flex items-center gap-2 self-start rounded-lg bg-yellow-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
            >
              <span>Log in</span> <ArrowRightIcon className="w-5 md:w-6" />

            </Link>

            <div className='px-2 md:px-10'><LucideBookOpenText className='w-10 h-10 text-blue-600' /></div>

          </div>


        </div>



        <div className="flex flex-col items-center h-fit justify-self-auto p-6 md:w-3/5 md:px-28 md:py-12 ">  {/* Este div muestra una imagen que se alterna con la otra */}
          {/* Add Hero Images Here */}
          <Image
            src="/rect2.webp"
            width={555}
            height={370}
            className="hidden md:block"
            alt="Capturas de pantalla del proyecto del panel que muestran la versión de escritorio"
          />
          <Image
            src="/rect2.webp"
            width={560}
            height={620}
            className="block md:hidden"
            alt="Capturas de pantalla del proyecto del panel que muestran la versión de escritorio"
          />
        </div>


        {/* <NoteForm/>  borrar si no se usa el formulario*/}
      </div>
    </main>
  );
}
