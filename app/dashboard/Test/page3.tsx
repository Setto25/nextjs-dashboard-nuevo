


/*
"use client";
import { useState } from "react";  

const quizQuestions = [  
  {  
    id: 1,  
    question:  
      "Debes lavarte las manos antes de tocar al paciente, para evitar transmitirle gérmenes en las manos.",  
    options: [  
      "Antes de entrar en contacto con el paciente",  
      "Antes de realizar una tarea limpia/aséptica",  
      "Después del contacto con el paciente",  
      "Después de exposición a fluidos corporales",  
    ],  
    correct: "Antes de entrar en contacto con el paciente",  
  },  
  {  
    id: 2,  
    question:  
      "Estás a punto de insertar un catéter y debes prevenir infecciones al paciente.",  
    options: [  
      "Antes de realizar una tarea limpia/aséptica",  
      "Después de exposición a fluidos corporales",  
      "Después de contacto con el paciente",  
      "Antes de entrar en contacto con el paciente",  
    ],  
    correct: "Antes de realizar una tarea limpia/aséptica",  
  },  
  {  
    id: 3,  
    question:  
      "Acabas de tener contacto con sangre u otro fluido corporal; debes lavarte las manos para evitar contagio a ti mismo o a otros.",  
    options: [  
      "Después de exposición a fluidos corporales",  
      "Antes de realizar una tarea limpia/aséptica",  
      "Después de contacto con el paciente",  
      "Antes de entrar en contacto con el paciente",  
    ],  
    correct: "Después de exposición a fluidos corporales",  
  },  
  {  
    id: 4,  
    question:  
      "Terminaste de atender a un paciente y antes de irte debes lavarte las manos.",  
    options: [  
      "Después de contacto con el paciente",  
      "Antes de realizar una tarea limpia/aséptica",  
      "Antes de entrar en contacto con el paciente",  
      "Después de exposición a fluidos corporales",  
    ],  
    correct: "Después de contacto con el paciente",  
  },  
  {  
    id: 5,  
    question:  
      "Después de estar en la habitación del paciente, antes de salir, te lavas las manos para no contaminar otras áreas.",  
    options: [  
      "Después de contacto con el entorno del paciente",  
      "Antes de entrar en contacto con el paciente",  
      "Después de contacto con el paciente",  
      "Antes de realizar una tarea limpia/aséptica",  
    ],  
    correct: "Después de contacto con el entorno del paciente",  
  },  
];  

export default function LavadoManosQuiz() {  
  const [currentQ, setCurrentQ] = useState(0);  
  const [selectedOption, setSelectedOption] = useState(null);  
  const [score, setScore] = useState(0);  
  const [completed, setCompleted] = useState(false);  
  const [feedback, setFeedback] = useState("");  

  const handleAnswer = (option: any) => {  
    setSelectedOption(option);  
    if (option === quizQuestions[currentQ].correct) {  
      setScore(score + 1);  
      setFeedback("¡Correcto! 😊");  
    } else {  
      setFeedback(  
        `Incorrecto. La respuesta correcta es: "${quizQuestions[currentQ].correct}"`  
      );  
    }  
  };  

  const nextQuestion = () => {  
    setSelectedOption(null);  
    setFeedback("");  
    if (currentQ + 1 < quizQuestions.length) {  
      setCurrentQ(currentQ + 1);  
    } else {  
      setCompleted(true);  
    }  
  };  

  const restartQuiz = () => {  
    setCurrentQ(0);  
    setSelectedOption(null);  
    setScore(0);  
    setCompleted(false);  
    setFeedback("");  
  };  

  if (completed) {  
    return (  
      <div className="p-6 max-w-xl mx-auto text-center">  
        <h2 className="text-2xl font-bold mb-4">Quiz completado</h2>  
        <p className="mb-4">  
          Tu puntaje: {score} / {quizQuestions.length}  
        </p>  
        <button  
          className="px-4 py-2 bg-blue-600 text-white rounded"  
          onClick={restartQuiz}  
        >  
          Volver a intentarlo  
        </button>  
      </div>  
    );  
  }  

  const currentQuestion = quizQuestions[currentQ];  

  return (  
    <div className="p-6 max-w-xl mx-auto bg-white rounded shadow">  
      <h2 className="text-xl font-semibold mb-4">  
        Pregunta {currentQ + 1} de {quizQuestions.length}  
      </h2>  
      <p className="mb-6">{currentQuestion.question}</p>  

      <div className="flex flex-col space-y-3 mb-4">  
        {currentQuestion.options.map((option) => (  
          <button  
            key={option}  
            disabled={selectedOption !== null}  
            onClick={() => handleAnswer(option)}  
            className={`px-4 py-2 border rounded text-left hover:bg-blue-100   
              ${  
                selectedOption === option  
                  ? option === currentQuestion.correct  
                    ? "bg-green-300 border-green-700"  
                    : "bg-red-300 border-red-700"  
                  : "bg-white"  
              }  
            `}  
          >  
            {option}  
          </button>  
        ))}  
      </div>  

      {feedback && <p className="mb-4 font-medium">{feedback}</p>}  

      {selectedOption && (  
        <button  
          onClick={nextQuestion}  
          className="px-4 py-2 bg-blue-600 text-white rounded"  
        >  
          Siguiente  
        </button>  
      )}  
    </div>  
  );  
}  
*/

'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// --- Ajuste 1: Añadir la propiedad 'image' a cada elemento ---
// Definición de los elementos correctos para una vía venosa periférica
const CORRECT_ITEMS_FOR_PVP = [
  { id: '1', name: 'Guantes de procedimiento', image: '/images/guantes.png' }, // Ejemplo de ruta
  { id: '2', name: '4 Torulas de algodon (Agua estiril, jabón, seca, alcohol)', image: '/images/torundas.png' },
  { id: '3', name: 'Branula', image: '/images/cateter.png' },
  { id: '4', name: 'Apósito Transparente (Tegaderm)', image: '/images/aposito.png' },
  { id: '5', name: 'Liga', image: '/images/torniquete.png' },
  { id: '6', name: 'Suero Fisiológico (para Cebar y probar)', image: '/images/suero.png' },
  { id: '7', name: '2 Jeringas (para Cebar y probar)', image: '/images/jeringa.png' },
  { id: '8', name: 'Extras, tapa roja/antireflujo o llave de 3 pasos', image: '/images/etiqueta.png' },
  { id: '9', name: 'Riñon esteril', image: '/images/algodon.png' },
  { id: '10', name: 'Extensor en T', image: '/images/protector_cama.png' },
  { id: '11', name: 'Rótulo', image: '/images/etiqueta.png' },
];

// Todos los elementos disponibles, incluyendo algunos que no son "correctos" para PVP
const ALL_AVAILABLE_ITEMS = [
  ...CORRECT_ITEMS_FOR_PVP, // Incluimos todos los correctos
  { id: '12', name: 'Mascarilla Quirúrgica', image: '/images/mascarilla.png' },
  { id: '13', name: 'Sonda Foley', image: '/images/sonda_foley.png' },
  { id: '14', name: 'Bisturí', image: '/images/bisturi.png' },
  { id: '15', name: 'Termometro', image: '/images/tensiometro.png' },
  { id: '16', name: 'Guantes esteriles', image: '/images/martillo.png' },
];

// --- Ajuste 2: Actualizar el tipo Item para incluir la propiedad 'image' ---
type Item = { id: string; name: string; image: string };

const VenousAccessDragAndDrop = () => {
  const [availableItems, setAvailableItems] = useState<Item[]>(ALL_AVAILABLE_ITEMS);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [validationMessage, setValidationMessage] = useState('');
  const [validationType, setValidationType] = useState(''); // 'success', 'error', 'warning'

  const onDragEnd = (result:any) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Clonar las listas para trabajar con ellas y luego actualizar el estado
    const newAvailableItems = Array.from(availableItems);
    const newSelectedItems = Array.from(selectedItems);

    let movedItem;

    // Mover desde la lista de disponibles
    if (source.droppableId === 'available') {
      [movedItem] = newAvailableItems.splice(source.index, 1);
      if (destination.droppableId === 'selected') {
        newSelectedItems.splice(destination.index, 0, movedItem);
      } else { // Volver a la misma lista de disponibles (reordenar)
        newAvailableItems.splice(destination.index, 0, movedItem);
      }
    }
    // Mover desde la lista de seleccionados
    else if (source.droppableId === 'selected') {
      [movedItem] = newSelectedItems.splice(source.index, 1);
      if (destination.droppableId === 'available') {
        newAvailableItems.splice(destination.index, 0, movedItem);
      } else { // Volver a la misma lista de seleccionados (reordenar)
        newSelectedItems.splice(destination.index, 0, movedItem);
      }
    }

    setAvailableItems(newAvailableItems);
    setSelectedItems(newSelectedItems);
    setValidationMessage(''); // Limpiar mensaje de validación al mover
    setValidationType('');
  };

  const validateSelection = () => {
    // Para la validación, los 'id' de los elementos correctos se obtienen de CORRECT_ITEMS_FOR_PVP
    const correctItemIds = new Set(CORRECT_ITEMS_FOR_PVP.map(item => item.id));
    const selectedItemIds = new Set(selectedItems.map(item => item.id)); // Los IDs de los elementos actualmente seleccionados

    // Comprobamos si faltan elementos correctos
    const missingItems = CORRECT_ITEMS_FOR_PVP.filter(item => !selectedItemIds.has(item.id));
    // Comprobamos si hay elementos extra (incorrectos) en la selección
    const extraItems = selectedItems.filter(item => !correctItemIds.has(item.id));

    if (missingItems.length === 0 && extraItems.length === 0) {
      setValidationMessage('¡Selección CORRECTA! Todos los elementos necesarios están presentes y no hay elementos incorrectos.');
      setValidationType('success');
    } else {
      let message = 'Selección INCORRECTA:';
      if (missingItems.length > 0) {
        message += ` Faltan: ${missingItems.map(item => item.name).join(', ')}.`;
      }
      if (extraItems.length > 0) {
        message += ` Sobran: ${extraItems.map(item => item.name).join(', ')}.`;
      }
      setValidationMessage(message);
      setValidationType('error');
    }
  };

  // Función auxiliar para obtener el estilo de los items arrastrables
  const getItemStyle = (isDragging:any, draggableStyle:any) => ({
    userSelect: 'none',
    padding: 16,
    margin: `0 0 8px 0`,
    background: isDragging ? '#e0f7fa' : '#f0f0f0',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    display: 'flex', // Necesario para alinear imagen y texto
    alignItems: 'center', // Centrar verticalmente imagen y texto
    gap: '10px', // Espacio entre imagen y texto
    ...draggableStyle,
  });

  // Función auxiliar para obtener el estilo de las áreas donde se puede soltar
  const getListStyle = (isDraggingOver:any) => ({
    background: isDraggingOver ? '#bbdefb' : '#eceff1',
    padding: 8,
    minHeight: '250px', // Aumentado para mejor visualización
    borderRadius: '8px',
    border: '1px dashed #90caf9',
  });

  // Estilos para los mensajes de validación
  const validationMessageStyle: React.CSSProperties = {
    padding: '10px',
    marginTop: '20px',
    borderRadius: '5px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    ...(validationType === 'success' && { backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' }),
    ...(validationType === 'error' && { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' }),
    ...(validationType === 'warning' && { backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' }),
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px', flexWrap: 'wrap' }}>
        {/* Cuadro de Elementos Disponibles */}
        <Droppable droppableId="available">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{ ...getListStyle(snapshot.isDraggingOver), width: '45%', minWidth: '300px', marginBottom: '20px' }}
            >
              <h2>Elementos Disponibles</h2>
              {availableItems.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>No hay más elementos disponibles.</p>}
              {availableItems.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                    >
                      {/* --- Ajuste 3: Añadir la etiqueta <img> --- */}
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                      />
                      {item.name}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Cuadro de Elementos Seleccionados */}
        <Droppable droppableId="selected">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{ ...getListStyle(snapshot.isDraggingOver), width: '45%', minWidth: '300px', marginBottom: '20px' }}
            >
              <h2>Elementos a Usar (Vía Venosa Periférica)</h2>
              {selectedItems.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>Arrastra los elementos correctos aquí.</p>}
              {selectedItems.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                    >
                      {/* --- Ajuste 3: Añadir la etiqueta <img> --- */}
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                      />
                      {item.name}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={validateSelection}
          style={{
            padding: '10px 20px',
            fontSize: '18px',
            cursor: 'pointer',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          Comprobar Selección
        </button>
      </div>

      {validationMessage && (
        <div style={validationMessageStyle}>
          {validationMessage}
        </div>
      )}
    </DragDropContext>
  );
};

export default VenousAccessDragAndDrop;