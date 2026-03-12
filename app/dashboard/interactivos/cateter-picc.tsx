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

const CORRECT_ITEMS_FOR_PROCEDURE = [
  { id: '1', name: 'Set catéter percutáneo (1Fr/1.9Fr/2Fr)', image: '/images/set_picc.png' },
  { id: '2', name: 'Introductor / Pelacable', image: '/images/introductor.png' },
  { id: '3', name: 'Cinta métrica', image: '/images/huincha_medir.png' },
  { id: '4', name: 'Caja de cateterización', image: '/images/caja_cateterizacion.png' },
  { id: '5', name: 'Paño estériles(Campo)', image: '/images/pano_campo.png' },
  { id: '6', name: 'Gasas estériles', image: '/images/gasas.png' },
  { id: '7', name: 'Delantal estéril (2 operadores)', image: '/images/delantal_esteril.png' },
  { id: '8', name: 'Guantes estériles', image: '/images/guantes_esteriles.png' },
  { id: '9', name: 'Clorhexidina 2% o Alcohol 70°', image: '/images/clorhexidina.png' },
  { id: '10', name: 'Jeringas (5ml y 20ml)', image: '/images/jeringas_5_20.png' },
  { id: '11', name: 'Matraz de Suero Fisiológico', image: '/images/matraz_suero.png' },
  { id: '12', name: 'Ligadura estéril', image: '/images/liga.png' },
  { id: '13', name: 'Apósito transparente para fijación', image: '/images/aposito_transparente2.png' },
  { id: '14', name: 'Sutura adhesiva (Steri-Strip)', image: '/images/steri_strip.png' },
  { id: '15', name: 'Cofia', image: '/images/cofia.png' },
    { id: '16', name: 'Compresas esteriles', image: '/images/compresa_esteril.png' },
     { id: '17', name: 'Paño perforado esteril', image: '/images/pano_perforado.png' },
       { id: '18', name: 'Mascarilla Quirúrgica', image: '/images/mascarilla.png' },
        { id: '25', name: 'Apósito Transparente (2 unidades)', image: '/images/aposito_transparente.png' },
        { id: '26', name: 'Llave de 3 pasos ', image: '/images/llave_3.png' },
        { id: '27', name: 'Conector libre de agujas (tapa)', image: '/images/conector_tapa.png' },
        { id: '28', name: 'Aposito hemostatico', image: '/images/aposito_hemostatico.png' },
       
];

const ALL_AVAILABLE_ITEMS = [
  ...CORRECT_ITEMS_FOR_PROCEDURE,
  { id: '19', name: 'Sonda Foley', image: '/images/sonda_foley.png' },
  { id: '20', name: 'Bolsa recolectora', image: '/images/bolsa_recolectora.png' },
  { id: '21', name: 'Bisturí', image: '/images/bisturi.png' },
  { id: '22', name: 'Guantes de procedimiento', image: '/images/guantes_procedimiento.png' },
  { id: '23', name: 'Vaselina estéril', image: '/images/vaselina.png' },
  { id: '24', name: 'Sutura', image: '/images/sutura.png' },
   { id: '29', name: 'Cinta adhesiva hipoalergénica', image: '/images/tela_adhesiva.png' },
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

const CateterPICC_DragAndDrop = () => {
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
    const correctIds = new Set(CORRECT_ITEMS_FOR_PROCEDURE.map(i => i.id));
    const selectedIds = new Set(selectedItems.map(i => i.id));
    const missing = CORRECT_ITEMS_FOR_PROCEDURE.filter(i => !selectedIds.has(i.id));
    const extra = selectedItems.filter(i => !correctIds.has(i.id));

    if (missing.length === 0 && extra.length === 0) {
      setValidationMessage('¡Excelente! Bandeja perfectamente armada para la instalación PICC.');
      setValidationType('success');
    } else {
      let errorMsg = 'Revisa el material en la bandeja.';
      if (missing.length > 0) {
        errorMsg += ` Faltan ${missing.length} elementos.`;
      }
      if (extra.length > 0) {
        errorMsg += ` Sobran ${extra.length} elementos incorrectos.`;
      }
      setValidationMessage(errorMsg);
      setValidationType('error');
    }
    setShowResults(true);
  };

  const score = (() => {
    const correctIds = new Set(CORRECT_ITEMS_FOR_PROCEDURE.map(i => i.id));
    const correctCount = selectedItems.filter(i => correctIds.has(i.id)).length;
    return {
      correct: correctCount,
      total: CORRECT_ITEMS_FOR_PROCEDURE.length,
      percentage: Math.round((correctCount / CORRECT_ITEMS_FOR_PROCEDURE.length) * 100)
    };
  })();

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ padding: '10px', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', color: COLORS.darkBlue, marginBottom: '20px' }}>
          Materiales necesarios para instalación de Catéter Percutáneo (PICC)
        </h2>
        {/* BOTONES RESPONSIVOS */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          <button onClick={validateSelection} style={{
            backgroundColor: COLORS.primaryGreen, color: '#000', padding: '12px 20px', fontSize: '14px',
            borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 0 #84cc16'
          }}>
            <ClipboardCheck size={18} /> Comprobar Bandeja
          </button>
          
          <button onClick={() => { setAvailableItems(ALL_AVAILABLE_ITEMS); setSelectedItems([]); setShowResults(false); setValidationMessage(''); }} 
            style={{
              backgroundColor: '#e2e8f0', color: '#475569', padding: '12px 20px', fontSize: '14px',
              borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8
            }}>
            <RotateCcw size={18} /> Reiniciar Insumos
          </button>
        </div>

        {validationMessage && (
          <div style={{ marginBottom: 20 }}>
            <ValidationMessage type={validationType} message={validationMessage} />
          </div>
        )}

        {/* CONTENEDOR PRINCIPAL RESPONSIVO */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* COLUMNA DISPONIBLES */}
          <Droppable droppableId="available">
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.droppableProps} style={{
                background: snapshot.isDraggingOver ? '#f1f5f9' : COLORS.bgLight,
                padding: '15px', borderRadius: '16px', border: `2px dashed ${COLORS.border}`, minHeight: '500px'
              }}>
                <h3 style={{ color: COLORS.darkBlue, textAlign: 'center', marginBottom: 15 }}>Arsenal de Insumos</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
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
                          <div style={{width: '80px', height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', overflow: 'hidden'}}>
                            <img src={item.image} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                                 onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          </div>
                          <span style={{ fontSize: '11px', textAlign: 'center', fontWeight: 600, color: '#334155' }}>{item.name}</span>
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
                <h3 style={{ color: COLORS.darkBlue, textAlign: 'center', marginBottom: 15 }}>Elementos necesarios</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
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
                          <div style={{width: '80px', height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', overflow: 'hidden'}}>
                            <img src={item.image} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                                 onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          </div>
                          <span style={{ fontSize: '11px', textAlign: 'center', fontWeight: 600, color: '#334155' }}>{item.name}</span>
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

        {/* MODAL RESULTADOS */}
        {showResults && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '20px', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
              <div style={{ fontSize: '40px' }}>{score.percentage >= 100 ? '🥇 Excelente!, Eres lo maximo 💪!' : '👩‍⚕️'}</div>
              <h2 style={{ color: COLORS.darkBlue, margin: '10px 0' }}>Resultado de Práctica</h2>
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

export default CateterPICC_DragAndDrop;
