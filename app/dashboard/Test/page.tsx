'use client';
import { HandIcon, PowerIcon } from 'lucide-react';
// Eliminada la importación de Image de lucide-react ya que no se usa.
import React, { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FaHandsWash } from 'react-icons/fa';

const ItemTypes = {
  STEP: 'step'
};

// Colores basados en la imagen del Hospital El Carmen
const colors = {
  primary: '#2f6feb', // azul
  secondary: '#f59e0b', // amarillo/naranja
  success: '#84cc16', // verde
  danger: '#ef4444', // rojo
  light: '#f8fafc',
  dark: '#1e293b'
};

// Los 5 momentos correctos según la OMS
const correctMoments = [
  {
    id: 1,
    title: "ANTES DE TOCAR AL PACIENTE",
    description: "Antes del contacto directo con el paciente",
    isCorrect: true
  },
  {
    id: 2,
    title: "ANTES DE REALIZAR UNA TAREA LIMPIA/ASÉPTICA",
    description: "Antes de procedimientos asépticos o manipular dispositivos invasivos",
    isCorrect: true
  },
  {
    id: 3,
    title: "DESPUÉS DEL RIESGO DE EXPOSICIÓN A FLUIDOS CORPORALES",
    description: "Después del contacto con fluidos corporales, mucosas o piel no intacta",
    isCorrect: true
  },
  {
    id: 4,
    title: "DESPUÉS DE TOCAR AL PACIENTE",
    description: "Después del contacto directo con el paciente",
    isCorrect: true
  },
  {
    id: 5,
    title: "DESPUÉS DEL CONTACTO CON EL ENTORNO DEL PACIENTE",
    description: "Después del contacto con superficies y objetos del entorno inmediato",
    isCorrect: true
  }
];

// Distractores (opciones incorrectas)
const distractors = [
  {
    id: 6,
    title: "ANTES DE INGRESAR AL HOSPITAL",
    description: "Al llegar al establecimiento de salud",
    isCorrect: false
  },
  {
    id: 7,
    title: "DESPUÉS DE CADA HORA DE TRABAJO",
    description: "Cada 60 minutos durante el turno",
    isCorrect: false
  },
  {
    id: 8,
    title: "ANTES DE COMER O BEBER",
    description: "Antes de consumir alimentos o bebidas",
    isCorrect: false
  },
  {
    id: 9,
    title: "DESPUÉS DE USAR EL BAÑO",
    description: "Después de hacer uso del baño",
    isCorrect: false
  },
  {
    id: 10,
    title: "ANTES DE TOMAR DESAYUNO",
    description: "Antes de tomar el desayuno",
    isCorrect: false
  }
];

// Todos los elementos mezclados
const allItems = [...correctMoments, ...distractors];

// Tipos
type Step = {
  id: number;
  title: string;
  description: string;
  isCorrect: boolean;
};

type DraggableStepProps = {
  step: Step;
  index: number;
  isReviewed?: boolean;
};

type DropZoneProps = {
  onDrop: (item: { id: number; index: number }) => void;
  children: React.ReactNode;
  className?: string;
};

// Componente para elementos arrastrables
const DraggableStep: React.FC<DraggableStepProps> = ({ step, index, isReviewed = false }) => {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: ItemTypes.STEP,
    item: { id: step.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [step.id, index]);

  const getBackgroundColor = () => {
    if (isReviewed) {
      return step.isCorrect ? colors.success : colors.danger;
    }
    return colors.primary;
  };

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`p-4 m-2 rounded-lg cursor-move transition-all duration-200 shadow-lg hover:shadow-xl text-white ${
        isDragging ? 'opacity-50 rotate-2' : 'opacity-100'
      }`}
      style={{ backgroundColor: getBackgroundColor() }}
    >
      <div className="flex items-center gap-3">
        <div className="" style={{ color: colors.light }}>
          {<FaHandsWash className="w-6 h-6" />}
        </div>
        <div>
          <h3 className="font-bold text-sm">{step.title}</h3>
          <p className="text-xs mt-1 opacity-90">{step.description}</p>
        </div>
        {isReviewed && (
          <div className="ml-auto text-white text-xl">
            {step.isCorrect ? '✓' : '✗'}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para zona de soltar
const DropZone: React.FC<DropZoneProps> = ({ onDrop, children, className = "" }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.STEP,
    drop: (item: { id: number; index: number }) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [onDrop]);

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`${className} transition-all duration-200 border-2 border-dashed rounded-lg`}
      style={{
        backgroundImage: 'url(/5momentos.png)', // Ruta de la imagen de fondo
        backgroundSize: 'cover', // Asegura que la imagen cubra el área
        backgroundPosition: 'center', // Centra la imagen
        borderColor: isOver ? '#60a5fa' : '#d1d5db',
      }}
    >
      {children}
    </div>
  );
};

// Componente principal
const HandwashingTraining = () => {
  const [availableItems, setAvailableItems] = useState<Step[]>(() => {
    // Mezclar todos los elementos inicialmente
    const shuffled = [...allItems].sort(() => Math.random() - 0.5);
    return shuffled;
  });

  const [selectedItems, setSelectedItems] = useState<Step[]>([]);
  const [isReviewed, setIsReviewed] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);

  const handleDrop = useCallback((item: { id: number; index: number }) => {
    const draggedStep = availableItems.find(step => step.id === item.id);
    if (draggedStep) {
      setSelectedItems(prev => [...prev, draggedStep]);
      setAvailableItems(prev => prev.filter(step => step.id !== item.id));
    }
  }, [availableItems]);

  const removeFromSelected = (stepId: number) => {
    const stepToRemove = selectedItems.find(step => step.id === stepId);
    if (stepToRemove) {
      setSelectedItems(prev => prev.filter(step => step.id !== stepId));
      setAvailableItems(prev => [...prev, stepToRemove]);
    }
  };

  const resetActivity = () => {
    const shuffled = [...allItems].sort(() => Math.random() - 0.5);
    setAvailableItems(shuffled);
    setSelectedItems([]);
    setIsReviewed(false);
    setShowResults(false);
  };

  const reviewActivity = () => {
    setIsReviewed(true);
    setShowResults(true);
  };

  const calculateScore = () => {
    const correctSelected = selectedItems.filter(item => item.isCorrect).length;
    const incorrectSelected = selectedItems.filter(item => !item.isCorrect).length;
    const totalCorrect = correctMoments.length;

    // Si no se han seleccionado los 5 correctos, la puntuación puede ser menor al 100%
    return {
      correct: correctSelected,
      incorrect: incorrectSelected,
      total: totalCorrect,
      percentage: totalCorrect > 0 ? Math.round((correctSelected / totalCorrect) * 100) : 0
    };
  };

  const score = calculateScore();

  return (
    <div className="min-h-screen p-4 bg-white/80 border rounded-xl" >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" >
      
            </div>
            <h1 className="text-4xl font-bold" style={{ color: colors.dark }}>
              Los 5 Momentos del Lavado de Manos
            </h1>
          </div>
          <p className="text-gray-600 text-lg mb-4">
            Selecciona y arrastra los 5 momentos correctos según la OMS
          </p>
          <div className="flex justify-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow">
              <span className="text-sm text-gray-600">Seleccionados: </span>
              <span className="font-bold" style={{ color: colors.success}}>
                {selectedItems.length}
              </span>
            </div>
            {isReviewed && (
              <div className="bg-white px-4 py-2 rounded-lg shadow">
                <span className="text-sm text-gray-600">Correctos: </span>
                <span className="font-bold" style={{ color: colors.success }}>
                  {score.correct}/5 ({score.percentage}%)
                </span>
              </div>
            )}
            <button
              onClick={reviewActivity}
              disabled={selectedItems.length === 0}
              className="px-6 py-2 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{ backgroundColor: colors.secondary }}
            >
              Revisar Actividad
            </button>
            <button
              onClick={resetActivity}
              className="px-6 py-2 rounded-lg text-white font-semibold transition-colors hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              Reiniciar
            </button>
          </div>
        </div>

        <DndProvider backend={HTML5Backend}> {/* DndProvider movido para envolver las zonas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Zona de opciones disponibles */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4" style={{ color: colors.dark }}>
                Opciones Disponibles
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableItems.map((step, index) => (
                  <DraggableStep
                    key={step.id}
                    step={step}
                    index={index}
                    isReviewed={isReviewed}
                  />
                ))}
              </div>
              {availableItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Todas las opciones han sido utilizadas
                </div>
              )}
            </div>

            {/* Zona de selección */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4" style={{ color: colors.dark }}>
                Tus 5 Momentos Seleccionados
              </h2>

              <DropZone
                onDrop={handleDrop}
                className="p-4 min-h-[400px] flex flex-col items-center justify-center" // Añadido flex para centrar el contenido
              >
                {selectedItems.length === 0 ? (
                  // --- Texto removido de aquí ---
                  <div className="text-center py-16 text-gray-500">
              
                    {/* <p>Arrastra aquí los 5 momentos correctos</p> */}
                    {/* <p className="text-sm mt-2">según las recomendaciones de la OMS</p> */}
                  </div>
                ) : (
                  <div className="space-y-2 w-full"> {/* Añadido w-full para que los ítems se expandan */}
                    {selectedItems.map((step) => (
                      
                      <div
                        key={step.id}
                        
                        className="p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200 text-white opacity-90 hover:opacity-100"
                        style={{ backgroundColor: isReviewed ? (step.isCorrect ? colors.success : colors.danger) : colors.primary }}
                        onClick={() => !isReviewed && removeFromSelected(step.id)}
                      >
                        <div className="flex items-center gap-3">
                       <div className="" style={{ color: colors.light }}>
          {<FaHandsWash className="w-6 h-6" />}
        </div>
                          <div>
                            <h3 className="font-bold text-sm">{step.title}</h3>
                            <p className="text-xs mt-1 opacity-90">{step.description}</p>
                          </div>
                          {isReviewed && (
                            <div className="ml-auto text-white text-xl">
                              {step.isCorrect ? '✓' : '✗'}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DropZone>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  • Selecciona exactamente 5 momentos <br></br>
                  • Haz clic sobre uno para removerlo
                </p>
              </div>
            </div>
          </div>
        </DndProvider>

        {/* Resultados */}
        {showResults && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md mx-4 shadow-2xl">
              <div className="text-center">
                <div className="text-6xl mb-4">
                 
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: colors.dark }}>
                  {score.percentage >= 80 ? '¡Excelente!' : score.percentage >= 60 ? '¡Buen trabajo!' : '¡Sigue estudiando!'}
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="text-gray-600">
                    Respuestas correctas: <span className="font-bold" style={{ color: colors.success }}>{score.correct}/5</span>
                  </p>
                  <p className="text-gray-600">
                    Respuestas incorrectas: <span className="font-bold" style={{ color: colors.danger }}>{score.incorrect}</span>
                  </p>
                  <p className="text-gray-600">
                    Puntuación: <span className="font-bold">{score.percentage}%</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowResults(false)}
                    className="w-full text-white py-2 px-4 rounded-lg transition-colors hover:opacity-90"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Revisar Respuestas
                  </button>
                  <button
                    onClick={() => {
                      setShowResults(false);
                      resetActivity();
                    }}
                    className="w-full text-white py-2 px-4 rounded-lg transition-colors hover:opacity-90"
                    style={{ backgroundColor: colors.secondary }}
                  >
                    Intentar de Nuevo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Se ha eliminado el HandwashingTrainingApp wrapper y exportado directamente HandwashingTraining
export default HandwashingTraining;