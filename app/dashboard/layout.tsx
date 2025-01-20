import SideNav from '@/app/components/navegation/sidenav';  
import { ToastContainer } from 'react-toastify';  
import 'react-toastify/dist/ReactToastify.css';  
   
export default function Layout({ children }: { children: React.ReactNode }) {  
  return (  
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">  
      <div className="w-full flex-none md:w-64">  
        <SideNav />  
      </div>  
      <div   
        className="flex-grow p-6 md:overflow-y-auto md:p-12"   
        style={{  
          backgroundImage: 'url(/fondo3.2.webp)', // Ruta de la imagen de fondo  
        }}  
      >  
        {children}  
        <ToastContainer   // Componente de notificaciones
          position="top-right"  
          autoClose={3000}  
          hideProgressBar={false}  
          newestOnTop={false}  
          closeOnClick  
          rtl={false}  
          pauseOnFocusLoss  
          draggable  
          pauseOnHover  
          style={{  
            fontSize: '20px', // Tamaño de fuente  
            width: '350px',   // Ancho del toast 
            height: 'auto',   // Alto del toast 
            padding: '10px', // Padding interno            
          }} 
          
          
        />  
      </div>  
    </div>  
  );  
}