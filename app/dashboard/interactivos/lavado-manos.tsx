'use client';

import React, { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FaHandsWash } from 'react-icons/fa';
import { CheckCircle, XCircle, RotateCcw, ClipboardCheck } from 'lucide-react';

const ItemTypes = { STEP: 'step' };

// --- PALETA DE COLORES UPC NEONATAL ---
const COLORS = {
  primaryGreen: '#a3e635', // Verde lima logo
  primaryBlue: '#38bdf8',  // Azul cielo sidebar
  darkBlue: '#0369a1',     // Azul oscuro contraste
  success: '#22c55e',
  danger: '#ef4444',
  bgLight: '#f8fafc',
  border: '#e2e8f0'
};

const correctMoments = [
  { id: 1, title: "ANTES DE TOCAR AL PACIENTE", description: "Antes del contacto directo con el paciente", isCorrect: true },
  { id: 2, title: "ANTES DE REALIZAR TAREA ASÉPTICA", description: "Antes de manipular dispositivos invasivos", isCorrect: true },
  { id: 3, title: "DESPUÉS DE EXPOSICIÓN A FLUIDOS", description: "Después del contacto con fluidos o mucosas", isCorrect: true },
  { id: 4, title: "DESPUÉS DE TOCAR AL PACIENTE", description: "Después del contacto físico con el neonato", isCorrect: true },
  { id: 5, title: "DESPUÉS DEL ENTORNO DEL PACIENTE", description: "Después de tocar la cuna o monitores", isCorrect: true }
];

const distractors = [
  { id: 6, title: "AL INGRESAR AL HOSPITAL", description: "Al llegar al establecimiento", isCorrect: false },
  { id: 7, title: "CADA UNA HORA", description: "Control por reloj durante el turno", isCorrect: false },
  { id: 8, title: "ANTES DE COMER", description: "Antes de consumir alimentos", isCorrect: false },
  { id: 9, title: "DESPUÉS DE USAR EL BAÑO", description: "Higiene personal básica", isCorrect: false },
  { id: 10, title: "ANTES DEL DESAYUNO", description: "Previo a la primera comida", isCorrect: false }
];

const allItems = [...correctMoments, ...distractors];

type Step = { id: number; title: string; description: string; isCorrect: boolean };

// --- COMPONENTE DRAGGABLE ---
const DraggableStep = ({ step, index, isReviewed }: { step: Step, index: number, isReviewed: boolean }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.STEP,
    item: { id: step.id, index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [step.id, index]);

  return (
    <div
      ref={drag as any}
      style={{
        padding: '16px', margin: '8px 0', borderRadius: '12px', cursor: 'move',
        backgroundColor: 'white', border: `1px solid ${isDragging ? COLORS.primaryGreen : COLORS.border}`,
        opacity: isDragging ? 0.5 : 1, transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '12px'
      }}
    >
      <div style={{ color: COLORS.primaryBlue }}><FaHandsWash size={24} /></div>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>{step.title}</h4>
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>{step.description}</p>
      </div>
    </div>
  );
};

// --- COMPONENTE DROPZONE ---
const DropZone = ({ onDrop, children, isOver }: { onDrop: any, children: React.ReactNode, isOver: boolean }) => {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.STEP,
    drop: (item: any) => onDrop(item),
  }), [onDrop]);

  return (
    <div ref={drop as any} style={{
      minHeight: '450px', borderRadius: '16px', padding: '20px', transition: 'all 0.3s',
      background: isOver ? '#f1f5f9' : '#f0f9ff',
      border: `2px dashed ${isOver ? COLORS.primaryBlue : '#bae6fd'}`,
      backgroundImage: 'url(/5momentos.png)', // Ruta de la imagen de fondo
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      
    }}>
      {children}
    </div>
  );
};


// --- COMPONENTE PRINCIPAL ---
const HandwashingTraining = () => {
  const [availableItems, setAvailableItems] = useState<Step[]>(() => [...allItems].sort(() => Math.random() - 0.5));
  const [selectedItems, setSelectedItems] = useState<Step[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isOver, setIsOver] = useState(false); // Simplificado para el ejemplo

  const handleDrop = useCallback((item: { id: number }) => {
    const dragged = availableItems.find(s => s.id === item.id);
    if (dragged && selectedItems.length < 5) {
      setSelectedItems(prev => [...prev, dragged]);
      setAvailableItems(prev => prev.filter(s => s.id !== item.id));
    }
  }, [availableItems, selectedItems]);

  const removeStep = (id: number) => {
    const step = selectedItems.find(s => s.id === id);
    if (step) {
      setSelectedItems(prev => prev.filter(s => s.id !== id));
      setAvailableItems(prev => [...prev, step]);
    }
  };

  const score = (() => {
    const correct = selectedItems.filter(i => i.isCorrect).length;
    return {
      correct,
      incorrect: selectedItems.length - correct,
      percentage: Math.round((correct / 5) * 100)
    };
  })();

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: COLORS.darkBlue, fontSize: '2.5rem', marginBottom: '10px' }}>Los 5 Momentos del Lavado de Manos</h1>
          <p style={{ color: '#64748b' }}>Arrastra los 5 momentos correctos de la OMS hacia la bandeja azul</p>
        </div>

        {/* CONTROLES */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
          <button onClick={() => setShowResults(true)} disabled={selectedItems.length === 0}
            style={{
              backgroundColor: COLORS.primaryGreen, color: '#000', padding: '12px 24px',
              borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 0 #84cc16',
              opacity: selectedItems.length === 0 ? 0.5 : 1
            }}>
            <ClipboardCheck size={20} /> Revisar Actividad
          </button>
          
          <button onClick={() => { setAvailableItems([...allItems].sort(() => Math.random() - 0.5)); setSelectedItems([]); }} 
            style={{
              backgroundColor: '#e2e8f0', color: '#475569', padding: '12px 24px',
              borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8
            }}>
            <RotateCcw size={20} /> Reiniciar
          </button>
        </div>

        {/* GRID PRINCIPAL RESPONSIVO */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '30px' 
        }}>
          
          {/* OPCIONES */}
          <div style={{ background: COLORS.bgLight, padding: '20px', borderRadius: '16px', border: `1px solid ${COLORS.border}` }}>
            <h3 style={{ color: COLORS.darkBlue, textAlign: 'center', marginBottom: '20px' }}>Opciones Disponibles</h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {availableItems.map((step, index) => (
                <DraggableStep key={step.id} step={step} index={index} isReviewed={false} />
              ))}
              {availableItems.length === 0 && <p style={{ textAlign: 'center', color: '#94a3b8' }}>No quedan más opciones</p>}
            </div>
          </div>

          {/* SELECCIÓN */}
          <div style={{ position: 'relative' }}>
            <h3 style={{ color: COLORS.darkBlue, textAlign: 'center', marginBottom: '20px' }}>Tus 5 Momentos Seleccionados ({selectedItems.length}/5)</h3>
            <DropZone onDrop={handleDrop} isOver={false}>
              {selectedItems.map((step) => (
                <div key={step.id} onClick={() => removeStep(step.id)} style={{
                  padding: '16px', marginBottom: '10px', backgroundColor: 'white', borderRadius: '12px',
                  border: `1px solid ${COLORS.primaryBlue}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                  boxShadow: '0 4px 6px rgba(56, 189, 248, 0.1)'
                }}>
                   <div style={{ color: COLORS.primaryBlue }}><FaHandsWash size={20} /></div>
                   <div style={{ flex: 1 }}>
                     <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold' }}>{step.title}</h4>
                   </div>
                   <span style={{ fontSize: '10px', color: '#94a3b8' }}>Haz clic para quitar</span>
                </div>
              ))}
              {selectedItems.length === 0 && (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0000FF', textAlign: 'center', fontStyle:'bold', fontSize:'25px' }}>
                  <p>Arrastra aquí los momentos correctos</p>
                </div>
              )}
            </DropZone>
          </div>
        </div>

        {/* MODAL DE RESULTADOS */}
        {showResults && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center', maxWidth: '450px', width: '100%' }}>
              <div style={{ fontSize: '50px', marginBottom: '10px' }}>
                {score.percentage >= 80 ? '⭐' : score.percentage >= 60 ? '👍' : '📖'}
              </div>
              <h2 style={{ color: COLORS.darkBlue }}>Evaluación de su lavado de manos</h2>
              
              <div style={{ margin: '20px 0', padding: '20px', backgroundColor: '#f1f5f9', borderRadius: '15px' }}>
                <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{score.percentage}%</p>
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <p style={{ color: COLORS.success, fontWeight: 'bold' }}>Correctos: {score.correct}/5</p>
                  <p style={{ color: COLORS.danger, fontWeight: 'bold' }}>Incorrectos: {score.incorrect}</p>
                </div>
              </div>

              <button onClick={() => setShowResults(false)} style={{
                backgroundColor: COLORS.primaryBlue, color: 'white', padding: '12px 30px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', width: '100%'
              }}>
                Volver a revisar
              </button>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default HandwashingTraining;