// lib/session.ts
import { IronSessionOptions } from "iron-session";

// Configuración de la sesión
export const sessionOptions: IronSessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string, // Debe tener 32+ caracteres
  cookieName: "misession",
  cookieOptions: {
    secure: false,//process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 86400,// 1 día en segundos
      sameSite: "lax", // 🔥 Necesario para desarrollo
      //domain: "localhost",
      path : "/" , 
  },
  
};

// Agregar log para inspeccionar sessionOptions
console.log("Configuración de la sesión:", sessionOptions);

// lib/session.ts
console.log("Clave cargada:", process.env.SECRET_COOKIE_PASSWORD); // Debe mostrar tu clave



// lib/session.ts
console.log("Clave cargada:", process.env.SECRET_COOKIE_PASSWORD); // Debe mostrar tu clave
// Extiende los tipos de sesión
declare module "iron-session" {
  interface IronSessionData {
    user?: {
      id: number;
      email: string;
      role: string; //##
    };
  }
}