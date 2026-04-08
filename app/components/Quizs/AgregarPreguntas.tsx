'use client';

import { use, useEffect, useState } from "react";
import { toast } from "react-toastify";

// Interfaz de Temas
interface Temas {
    id: number;
    tema: string;
}


function AgregarPreguntas() {

    // Estado que guarda los datos del formulario.  
    const [formData, setFormData] = useState({
        pregunta: '',
        tema: '',  // 
        alternativas: ['', '', '', ''],  //
        respuesta: '',  //
    });

    const [tema, setTema] = useState<string>("");  // Estado que guarda los temas disponibles.
    const [temas, cargarTemas] = useState<Temas[]>([]);  // Estado que guarda los temas disponibles. Es nacesaria la interfaz para obtener el tipo de datos y extraerlos del objeto
    const [isLoading, setIsLoading] = useState(false);  // Indica si se está cargando un documento.  


    const handleAlternativeChange = (index: number, value: string) => {
        const newAlternativas = [...formData.alternativas];
        newAlternativas[index] = value; // Actualiza la alternativa en el índice correspondiente  
        setFormData({ ...formData, alternativas: newAlternativas });
    };

    useEffect(() => {
        // Cargar los temas disponibles.  
        const fetchTemas = async () => {
            try {
                const response = await fetch('/api/quiz/temas');
                const data = await response.json();
                cargarTemas(data);
                console.log('Temas cargados:', data);
            } catch (error) {
                console.error('Error al cargar los temas:', error);
            }
        };
        fetchTemas();
    }, []);




    const handleSubmit0 = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();  // Evita el comportamiento por defecto del formulario. 

        setIsLoading(true);  // Indica que se está cargando un documento.

        try {
            // Enviar los datos de temas al backend.  
            const response = await fetch('/api/quiz/temas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',   // Se especifica que se envía un JSON.
                },
                body: JSON.stringify(tema),  // Se convierte el objeto a JSON.
            });
            console.log('Enviando datos:', tema);
            if (response.ok) {
                toast.success('tema agregado!');  // Muestra un mensaje 

                const data = await response.json(); // Procesa la respuesta del backend
                console.log('Datos enviados correctamente:', data);
                setTema('');
                setIsLoading(false);  // Indica que se ha terminado de cargar el documento.
            }
        } catch (error) {
            console.error('Error al enviar los datos:', error);
        }

    }


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();  // Evita el comportamiento por defecto del formulario.  

        try {

            // Enviar los datos del formulario al backend.  
            const response2 = await fetch('/api/quiz/preguntas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',   // Se especifica que se envía un JSON.
                },
                body: JSON.stringify(formData),  // Se convierte el objeto a JSON.
            });

            if (response2.ok) {
                alert('Pregunta agregada con éxito');  // Muestra un mensaje de éxito.
            } else {
                alert('No se pudo agregar la pregunta');  // Muestra un mensaje de error.
            }

        }
        catch (error) {
            console.error('Error al enviar los datos:', error); // Muestra un mensaje de error.
        }
    };





    return (
        <div>
            <form onSubmit={handleSubmit0} className="space-y-4 flex flex-col">
                <h2 className="text-lg font-bold">Agregar un nuevo tema</h2>

                <input type="text" placeholder="Ingrese un nuevo tema" value={tema || ''} onChange={(e) => setTema(e.target.value)} className="w-full p-2 border rounded" required />

                <button type="submit" className={`w-full py-2 px-4 rounded transition-colors ${!tema ? 'bg-gray-300 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                    {isLoading ? 'Subiendo...' : 'Agregar protocolo'}
                </button>
            </form>

            <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
                <input type="text" placeholder="Ingrese la pregunta" value={formData.pregunta} onChange={(e) => setFormData({ ...formData, pregunta: e.target.value })} className="w-full p-2 border rounded" required />





                {/* Crea un select con los temas disponibles. */}
                <select value={formData.tema} onChange={(e) => setFormData({ ...formData, tema: e.target.value })} className="w-full p-2 border rounded" required >
                    <option value="" disabled>Seleccion un tema</option>
                    {temas.map((tema, index) => (
                        <option key={index} value={tema.tema}>{tema.tema}</option>
                    ))}

                </select>

                {/* Mapea las alternativas y crea un input para cada una. */}
                {formData.alternativas.map((alternativa, index) => (
                    <input
                        key={index}
                        type="text"
                        placeholder={`Ingrese la alternativa ${index + 1}`}
                        value={alternativa}
                        onChange={(e) => handleAlternativeChange(index, e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                ))}

                <select value={formData.respuesta} onChange={(e) => setFormData({ ...formData, respuesta: e.target.value })} className="w-full p-2 border rounded" required >
                    <option value="" disabled>Alternativa Correcta</option>

                    {formData.alternativas.map((alternativa, index) => (
                        <option key={index} value={alternativa}>{alternativa}</option>
                    ))}


                </select>
                <button type="submit" className={`w-full py-2 px-4 rounded transition-colors ${!tema ? 'bg-gray-300 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                    {tema ? 'Subiendo...' : 'Agregar protocolo'}
                </button>


            </form>
        </div>
    )



}
export default AgregarPreguntas;  // Exporta el componente AgregarPreguntas por defecto.