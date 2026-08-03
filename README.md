# 👁️ NeoHec - Sistema Integral de Gestión y Capacitación Clínica (UCIN)

Plataforma web diseñada para centralizar y optimizar tanto el aprendizaje como la logística operativa en una Unidad de Cuidados Intensivos Neonatales (UCIN). NeoHec integra herramientas de capacitación continua, acceso a protocolos médicos, biblioteca digital y automatización en el control de insumos. Creada para mejorar el acceso al conocimiento, agilizar procesos clínicos y fomentar la autogestión del equipo de salud.

## 🌟 Propósito

* Centralizar el acceso a recursos clínicos fundamentales (protocolos, manuales y formación).
* Automatizar y modernizar procesos logísticos y operativos (ej. gestión de stock e insumos).
* Reducir la dependencia de procesos manuales, correo electrónico y memoria institucional.
* Empoderar al equipo clínico mediante herramientas de autogestión integral.

## 🌐 Tecnologías Utilizadas

* **Next.js & Vercel**: Framework de React para optimización de rendimiento (SSR), alojado y desplegado de forma gratuita a través de Vercel.
* **Prisma ORM** + **Neon (PostgreSQL)**: Modelo y gestión de base de datos en la nube.
* **Backblaze B2 & Cloudflare**: Almacenamiento seguro de archivos, documentos PDF y recursos multimedia utilizando la API S3 de B2, con Cloudflare actuando como proxy/CDN para permitir una transferencia de datos rápida y sin costos.
* **Autenticación Basada en Cookies**: Control de acceso seguro y gestión de permisos por roles.
* **Tailwind CSS**: Framework para una interfaz moderna, limpia y responsiva.
* **Zustand**: Gestión del estado global en React.

## 🧰 Módulos Principales

* **Capacitaciones Clínicas**: Gestión y publicación de cursos para el equipo (agregables por administradores).
* **Protocolos Neonatales**: Acceso ágil a directrices, guías de actuación y pautas.
* **Biblioteca Digital**: Repositorio centralizado de manuales, PDFs y guías de equipos.
* **Gestión de Usuarios**: Administración de cuentas con roles diferenciados de acceso.
* **Módulo de Autogestión**: Herramientas que permiten crear secciones, contenidos y usuarios sin intervención técnica.
* **Gestión de Insumos (En desarrollo)**: Incluye un submódulo de automatización mediante *web scraping* a un ERP local. Por motivos de seguridad y arquitectura, esta herramienta solo se ejecuta al estar conectado a la red física del recinto clínico.
* **Sistema de Plantillas de Documentos**: Funcionalidad que permite seleccionar e imprimir en lote múltiples plantillas y documentos utilizados frecuentemente en el servicio, otorgando gran fluidez al trabajo diario.


## ✅ Beneficios

* Organización centralizada y estandarizada del conocimiento.
* Acceso fácil e inmediato a protocolos clínicos actualizados.
* Mejora continua en la inducción de nuevo personal y actualización de conocimientos del personal vigente.
* Mayor agilidad en la atención, gracias al sistema de impresión simultánea de plantillas de documentos del servicio.
* Plataforma escalable y autogestionable.
* Solución adaptada a las necesidades reales de un entorno clínico crítico.

## 📚 Contexto Académico

Este proyecto fue desarrollado como parte de la práctica profesional de nivel técnico de la carrera de Ingeniería en Informática en IACC, aplicado e implementado en una UCIN real.

---

## 👤 Autor

**Cristian Álamos Rojas**

* 🩺 **Matrón** (Universidad de Chile) | Licenciado en Obstetricia y Puericultura (U. de Chile).
* 💻 **Técnico en Informática de Nivel Superior** (IACC) | Estudiante de Ingeniería en Informática (IACC).
* 📊 **Diplomado en Big Data y Machine Learning** (Universidad Autónoma).
* 💡 Desarrollando soluciones tecnológicas para mejorar la atención en salud.
* 🔗 **Perfil de LinkedIn:** [Cristian Álamos Rojas](https://www.linkedin.com/in/cristian-alamos-rojas-4b52a7156/)
