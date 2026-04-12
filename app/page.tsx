import AcmeLogo from '@/app/ui/acme-logo';
import { Baby, LucideBookOpenText } from 'lucide-react';
import LoginPage from './login/page';
import '@/app/ui/global/grids.css';
import '@/app/ui/global/texts.css';
import '@/app/ui/global/shadows.css';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col w-full bg-gray-50/50 overflow-x-hidden">
      {/* --- HEADER BANNER PREMIUM --- */}
      <div 
        className="relative flex flex-col md:flex-row items-center justify-center w-full min-h-[18rem] md:h-64 shadow-lg overflow-hidden" 
        style={{
          backgroundImage: 'url(/cabecera9.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay para contraste */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-emerald-900/60 transition-opacity duration-500"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-7xl px-6 md:px-12 py-8 gap-8">
          <div className="w-fit transform transition hover:scale-105 duration-300">
            <AcmeLogo />
          </div>
          
          <div className="flex-1 flex items-center justify-center md:justify-end text-center md:text-right">
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-2xl"
              style={{ textShadow: '2px 4px 8px rgba(0,0,0,0.4)' }}
            >
              Plataforma de <span className="text-emerald-400">Neonatología</span>
            </h1>
          </div>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* --- MENSAJE DE BIENVENIDA (LADO IZQUIERDO) --- */}
          <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-xl border-l-[6px] border-emerald-500 relative overflow-hidden group">
              {/* Decoración sutil de fondo */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-50 rounded-full group-hover:scale-125 transition-transform duration-700 opacity-50"></div>
              
              <div className="flex items-start gap-6 relative z-10">
                <div className="p-4 bg-emerald-50 rounded-2xl shrink-0">
                  <Baby className="w-10 h-10 md:w-12 md:h-12 text-emerald-600" aria-hidden="true" />
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                    Bienvenidos a su <span className="text-emerald-600">Espacio Digital</span>
                  </h2>
                  <p className="text-slate-600 text-lg leading-relaxed text-justify">
                    Nuestra plataforma es una herramienta viva en constante crecimiento, diseñada para simplificar su gestión diaria y centralizar el acceso a protocolos, formatos y recursos educativos de excelencia. Un punto de encuentro digital para apoyar la labor de nuestra unidad.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4 py-4 border-t border-slate-100">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <LucideBookOpenText className="w-6 h-6 text-emerald-500/70" />
                </div>
                <span className="text-slate-500 font-medium text-sm italic">Centralizando el conocimiento para el cuidado neonatal.</span>
              </div>
            </div>
          </div>

          {/* --- CONTENEDOR LOGIN (LADO DERECHO) --- */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            <div className="w-full max-w-md">
              <LoginPage />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}