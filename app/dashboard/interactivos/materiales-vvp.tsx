'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { CheckCircle, XCircle, RotateCcw, ClipboardCheck } from 'lucide-react';

const COLORS = {
  primaryGreen: '#a3e635',
  primaryBlue: '#38bdf8',
  darkBlue: '#0369a1',
  bgLight: '#f8fafc',
  border: '#e2e8f0'
};

const CORRECT_ITEMS_FOR_PVP = [
  { id: '1', name: 'Guantes de procedimiento', image: '/images/guantes_procedimiento.png' },
  { id: '2', name: '4 Torulas de algodon', image: '/images/torulas.png' },
  { id: '3', name: 'Branula', image: '/images/branula.png' },
  { id: '4', name: 'Apósito Transparente', image: '/images/aposito_transparente.png' },
  { id: '5', name: 'Liga', image: '/images/liga.png' },
  { id: '6', name: 'Suero Fisiológico', image: '/images/ampolla_suero.png' },
  { id: '7', name: '2 Jeringas', image: '/images/jeringa_1.png' },
  { id: '8', name: 'Llave de 3 pasos / Tapa', image: '/images/llave_3.png' },
  { id: '9', name: 'Riñon esteril', image: '/images/riñon.png' },
  { id: '10', name: 'Extensor en T', image: '/images/conector_t.png' },
  { id: '11', name: 'Rótulo', image: '/images/rotulo.png' },
];

const ALL_AVAILABLE_ITEMS = [
  ...CORRECT_ITEMS_FOR_PVP,
  { id: '12', name: 'Mascarilla Quirúrgica', image: '/images/mascarilla.png' },
  { id: '13', name: 'Sonda Foley', image: '/images/sonda_foley.png' },
  { id: '14', name: 'Bisturí', image: '/images/bisturi.png' },
  { id: '15', name: 'Termometro', image: '/images/termometro.png' },
  { id: '16', name: 'Guantes esteriles', image: '/images/guantes_esteriles.png' },
];

type Item = { id: string; name: string; image: string };

const ValidationMessage = ({ type, message }: { type: string; message: string }) => {
  const isSuccess = type === 'success';
  return (
    <div style={{
      borderRadius: 12, padding: 16, marginTop: 20, display: 'flex', alignItems: 'center', gap: 12, border: '1px solid',
      backgroundColor: isSuccess ? '#f0fdf4' : '#fef2f2', 
      color: isSuccess ? '#166534' : '#991b1b', 
      borderColor: isSuccess ? '#bbf7d0' : '#fecaca'
    }}>
      {isSuccess ? <CheckCircle size={24} color="#22c55e" /> : <XCircle size={24} color="#ef4444" />}
      <span style={{ fontWeight: 600, fontSize: 16 }}>{message}</span>
    </div>
  );
};

const VenousAccessDragAndDrop = () => {
  const [availableItems, setAvailableItems] = useState<Item[]>(ALL_AVAILABLE_ITEMS);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [validationMessage, setValidationMessage] = useState('');
  const [validationType, setValidationType] = useState('');
  const [showResults, setShowResults] = useState(false);

  const onDragEnd = (result: any) => {
    const { source, destination } = result;
    if (!destination) return;
    
    const newAvailable = Array.from(availableItems);
    const newSelected = Array.from(selectedItems);
    let movedItem;

    if (source.droppableId === 'available') {
      [movedItem] = newAvailable.splice(source.index, 1);
      if (destination.droppableId === 'selected') newSelected.splice(destination.index, 0, movedItem);
      else newAvailable.splice(destination.index, 0, movedItem);
    } else {
      [movedItem] = newSelected.splice(source.index, 1);
      if (destination.droppableId === 'available') newAvailable.splice(destination.index, 0, movedItem);
      else newSelected.splice(destination.index, 0, movedItem);
    }

    setAvailableItems(newAvailable);
    setSelectedItems(newSelected);
    setValidationMessage('');
    setShowResults(false);
  };

  const validateSelection = () => {
    const correctIds = new Set(CORRECT_ITEMS_FOR_PVP.map(i => i.id));
    const selectedIds = new Set(selectedItems.map(i => i.id));
    const missing = CORRECT_ITEMS_FOR_PVP.filter(i => !selectedIds.has(i.id));
    const extra = selectedItems.filter(i => !correctIds.has(i.id));

    if (missing.length === 0 && extra.length === 0) {
      setValidationMessage('¡Excelente! Material completo para VVP.');
      setValidationType('success');
    } else {
      setValidationMessage('Revisa el material. Faltan o sobran elementos.');
      setValidationType('error');
    }
    setShowResults(true);
  };

  const score = (() => {
    const correctIds = new Set(CORRECT_ITEMS_FOR_PVP.map(i => i.id));
    const correctCount = selectedItems.filter(i => correctIds.has(i.id)).length;
    return {
      correct: correctCount,
      total: CORRECT_ITEMS_FOR_PVP.length,
      percentage: Math.round((correctCount / CORRECT_ITEMS_FOR_PVP.length) * 100)
    };
  })();

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ padding: '10px', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* BOTONES RESPONSIVOS */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          <button onClick={validateSelection} style={{
            backgroundColor: COLORS.primaryGreen, color: '#000', padding: '12px 20px', fontSize: '14px',
            borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 0 #84cc16'
          }}>
            <ClipboardCheck size={18} /> Comprobar Material
          </button>
          
          <button onClick={() => { setAvailableItems(ALL_AVAILABLE_ITEMS); setSelectedItems([]); setShowResults(false); setValidationMessage(''); }} 
            style={{
              backgroundColor: '#e2e8f0', color: '#475569', padding: '12px 20px', fontSize: '14px',
              borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8
            }}>
            <RotateCcw size={18} /> Reiniciar
          </button>
        </div>

        {validationMessage && (
          <div style={{ marginBottom: 20 }}>
            <ValidationMessage type={validationType} message={validationMessage} />
          </div>
        )}

        {/* CONTENEDOR PRINCIPAL RESPONSIVO (GRID) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '20px' 
        }}>
          
          {/* COLUMNA DISPONIBLES */}
          <Droppable droppableId="available">
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.droppableProps} style={{
                background: snapshot.isDraggingOver ? '#f1f5f9' : COLORS.bgLight,
                padding: '15px', borderRadius: '16px', border: `2px dashed ${COLORS.border}`, minHeight: '500px'
              }}>
                <h3 style={{ color: COLORS.darkBlue, textAlign: 'center', marginBottom: 15 }}>Maletín de Insumos</h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                  gap: '10px' 
                }}>
                  {availableItems.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} 
                             style={{
                               userSelect: 'none', background: 'white', borderRadius: '12px', padding: '10px',
                               border: `1px solid ${snapshot.isDragging ? COLORS.primaryGreen : COLORS.border}`,
                               display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                               boxShadow: '0 2px 4px rgba(0,0,0,0.05)', ...provided.draggableProps.style
                             }}>
                          {/* IMAGEN MÁS GRANDE */}
                          <img src={item.image} alt={item.name} style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                          <span style={{ fontSize: '12px', textAlign: 'center', fontWeight: 600, color: '#334155' }}>{item.name}</span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* COLUMNA BANDEJA */}
          <Droppable droppableId="selected">
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.droppableProps} style={{
                background: '#f0f9ff', padding: '15px', borderRadius: '16px', 
                border: `2px dashed ${COLORS.primaryBlue}`, minHeight: '500px'
              }}>
                <h3 style={{ color: COLORS.darkBlue, textAlign: 'center', marginBottom: 15 }}>Bandeja de Procedimiento</h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                  gap: '10px' 
                }}>
                  {selectedItems.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                             style={{
                               userSelect: 'none', background: 'white', borderRadius: '12px', padding: '10px',
                               border: `1px solid ${snapshot.isDragging ? COLORS.primaryBlue : COLORS.border}`,
                               display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                               boxShadow: '0 2px 4px rgba(0,0,0,0.05)', ...provided.draggableProps.style
                             }}>
                          <img src={item.image} alt={item.name} style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                          <span style={{ fontSize: '12px', textAlign: 'center', fontWeight: 600, color: '#334155' }}>{item.name}</span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* MODAL RESULTADOS RESPONSIVO */}
        {showResults && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '20px', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
              <div style={{ fontSize: '40px' }}>{score.percentage >= 100 ? '🥇' : '👶'}</div>
              <h2 style={{ color: COLORS.darkBlue, margin: '10px 0' }}>Resultado</h2>
              <div style={{ margin: '15px 0', padding: '15px', backgroundColor: '#f1f5f9', borderRadius: '10px' }}>
                <p style={{ fontSize: '22px', fontWeight: 'bold' }}>{score.percentage}%</p>
                <p style={{ color: '#64748b', fontSize: '14px' }}>{score.correct} de {score.total} correctos</p>
              </div>
              <button onClick={() => setShowResults(false)} style={{
                backgroundColor: COLORS.primaryBlue, color: 'white', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', width: '100%'
              }}>
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
};

export default VenousAccessDragAndDrop;