import { GetServerSideProps } from "next";
import { getIronSession } from "iron-session";
import { sessionOptions } from "../session/session";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  // 1. Obtiene la sesión del usuario
  const session = await getIronSession(req, res, sessionOptions);

  // 2. Verifica si es admin
  if (!session.user || session.user.role !== "admin") {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  // 3. Permite el acceso si es admin
  return { props: {} };
};

export default function AdminDashboard() {
  return <div>Contenido secreto para admins</div>;
}
//Función: Bloquea el acceso a usuarios no administradores usando getServerSideProps.