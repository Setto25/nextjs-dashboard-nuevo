'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { CheckCircle, XCircle } from 'lucide-react';

const CORRECT_ITEMS_FOR_PVP = [
  { id: '1', name: 'Guantes de procedimiento', image: '/images/guantes_procedimiento.png' },
  { id: '2', name: '4 Torulas de algodon (Agua estiril, jabón, seca, alcohol)', image: '/images/torulas.png' },
  { id: '3', name: 'Branula', image: '/images/branula.png' },
  { id: '4', name: 'Apósito Transparente (Tegaderm)', image: '/images/aposito_transparente.png' },
  { id: '5', name: 'Liga', image: '/images/liga.png' },
  { id: '6', name: 'Suero Fisiológico (para Cebar y probar)', image: '/images/ampolla_suero.png' },
  { id: '7', name: '2 Jeringas (para Cebar y probar)', image: '/images/jeringa_1.png' },
  { id: '8', name: 'Extras, tapa roja/antireflujo o llave de 3 pasos', image: '/images/llave_3.png' },
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

// Componente para mostrar mensajes de validación con estilo
const ValidationMessage = ({ type, message }: { type: string; message: string }) => {
  const styles = getValidationStyles(type);

  return (
    <div style={styles.container}>
      {type === 'success' && <CheckCircle size={32} style={styles.icon} />}
      {type === 'error' && <XCircle size={32} style={styles.icon} />}
      {type !== 'success' && type !== 'error' && (
        <span style={{ fontSize: 24, ...styles.icon }}>!</span>
      )}
      <span style={styles.text}>{message}</span>
    </div>
  );
};

// Función para obtener estilos según el tipo de validación
const getValidationStyles = (type: string) => {
  switch (type) {
    case 'success':
      return {
        container: {
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          boxShadow: '0 2px 6px rgba(21, 87, 36, 0.3)',
          borderRadius: 12,
          padding: 20,
          marginTop: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        },
        icon: { color: '#28a745', minWidth: 32, minHeight: 32 },
        text: { fontWeight: 600, fontSize: 18 },
      };
    case 'error':
      return {
        container: {
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          boxShadow: '0 2px 6px rgba(114, 28, 36, 0.3)',
          borderRadius: 12,
          padding: 20,
          marginTop: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        },
        icon: { color: '#dc3545', minWidth: 32, minHeight: 32 },
        text: { fontWeight: 600, fontSize: 18 },
      };
    default:
      return {
        container: {
          backgroundColor: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeeba',
          borderRadius: 12,
          padding: 20,
          marginTop: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        },
        icon: { color: '#ffc107', minWidth: 32, minHeight: 32 },
        text: { fontWeight: 600, fontSize: 18 },
      };
  }
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
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newAvailableItems = Array.from(availableItems);
    const newSelectedItems = Array.from(selectedItems);

    let movedItem;

    if (source.droppableId === 'available') {
      [movedItem] = newAvailableItems.splice(source.index, 1);
      if (destination.droppableId === 'selected') newSelectedItems.splice(destination.index, 0, movedItem);
      else newAvailableItems.splice(destination.index, 0, movedItem);
    } else if (source.droppableId === 'selected') {
      [movedItem] = newSelectedItems.splice(source.index, 1);
      if (destination.droppableId === 'available') newAvailableItems.splice(destination.index, 0, movedItem);
      else newSelectedItems.splice(destination.index, 0, movedItem);
    }

    setAvailableItems(newAvailableItems);
    setSelectedItems(newSelectedItems);
    setValidationMessage('');
    setValidationType('');
    setShowResults(false);
  };

  const validateSelection = () => {
    const correctItemIds = new Set(CORRECT_ITEMS_FOR_PVP.map((item) => item.id));
    const selectedItemIds = new Set(selectedItems.map((item) => item.id));

    const missingItems = CORRECT_ITEMS_FOR_PVP.filter((item) => !selectedItemIds.has(item.id));
    const extraItems = selectedItems.filter((item) => !correctItemIds.has(item.id));

    if (missingItems.length === 0 && extraItems.length === 0) {
      setValidationMessage('¡Selección CORRECTA! Todos los elementos necesarios están presentes y no hay elementos incorrectos.');
      setValidationType('success');
    } else {
      let message = 'Selección INCORRECTA:';
      if (missingItems.length > 0) {
        message += `---> FALTAN: ${missingItems.map((item) => item.name).join(', ')}.`;
      }
      if (extraItems.length > 0) {
        message += ` -----> SOBRAN: ${extraItems.map((item) => item.name).join(', ')}.`;
      }
      setValidationMessage(message);
      setValidationType('error');
    }
    setShowResults(true);
  };

  const resetActivity = () => {
    setAvailableItems(ALL_AVAILABLE_ITEMS);
    setSelectedItems([]);
    setValidationMessage('');
    setValidationType('');
    setShowResults(false);
  };

  const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
    userSelect: 'none',
    background: isDragging ? '#e0f7fa' : '#f0f0f0',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    boxSizing: 'border-box',
    breakInside: 'avoid',
    gap: 12,
    ...draggableStyle,
  });

  const getListStyle = (isDraggingOver: boolean) => ({
    background: isDraggingOver ? '#bbdefb' : '#eceff1',
    padding: 16,
    minHeight: 300,
    borderRadius: 12,
    border: '1px dashed #90caf9',
    width: '45%',
    maxWidth: '50%',
    marginBottom: 24,
    columns: 2,
    columnGap: 24,
  });

  // Calcular puntuación
  const calculateScore = () => {
    const correctItemIds = new Set(CORRECT_ITEMS_FOR_PVP.map(item => item.id));
    const selectedItemIds = selectedItems.map(item => item.id);
    
    const correctSelected = selectedItems.filter(item => correctItemIds.has(item.id)).length;
    const incorrectSelected = selectedItems.filter(item => !correctItemIds.has(item.id)).length;
    const totalCorrect = CORRECT_ITEMS_FOR_PVP.length;
    
    return {
      correct: correctSelected,
      incorrect: incorrectSelected,
      total: totalCorrect,
      percentage: Math.round((correctSelected / totalCorrect) * 100)
    };
  };

  const score = calculateScore();

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button
          onClick={validateSelection}
          style={{
            padding: '10px 20px',
            fontSize: 18,
            cursor: 'pointer',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            marginRight: 12
          }}
        >
          Comprobar Selección
        </button>
        
        <button
          onClick={resetActivity}
          style={{
            padding: '10px 20px',
            fontSize: 18,
            cursor: 'pointer',
            backgroundColor: '#2f6feb',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          Reiniciar
        </button>
      </div>

      {/* Mensaje de validación */}
      {validationMessage && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <ValidationMessage type={validationType} message={validationMessage} />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', padding: 20 }}>
        <Droppable droppableId="available">
          {(provided, snapshot) => (
            <div ref={provided.innerRef} {...provided.droppableProps} style={getListStyle(snapshot.isDraggingOver)}>
              <h2 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 16, columnSpan: 'all' }}>
                Elementos Disponibles
              </h2>
              {availableItems.length === 0 && (
                <p style={{ columnSpan: 'all', textAlign: 'center', color: '#666' }}>
                  No hay más elementos disponibles.
                </p>
              )}
              {availableItems.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '100%', maxWidth: 140, height: 140, objectFit: 'contain' }}
                      />
                      <div style={{ fontWeight: 'bold', textAlign: 'center', marginTop: 8 }}>{item.name}</div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <Droppable droppableId="selected">
          {(provided, snapshot) => (
            <div ref={provided.innerRef} {...provided.droppableProps} style={getListStyle(snapshot.isDraggingOver)}>
              <h2 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 16, columnSpan: 'all' }}>
                Elementos a Usar (Vía Venosa Periférica)
              </h2>
              {selectedItems.length === 0 && (
                <p style={{ columnSpan: 'all', textAlign: 'center', color: '#666' }}>
                  Arrastra los elementos correctos aquí.
                </p>
              )}
              {selectedItems.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '100%', maxWidth: 140, height: 140, objectFit: 'contain' }}
                      />
                      <div style={{ fontWeight: 'bold', textAlign: 'center', marginTop: 8 }}>{item.name}</div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>

      {/* Modal de resultados */}
      {showResults && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 32,
            maxWidth: 400,
            width: '100%',
            margin: 16,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>
                {score.percentage >= 80 ? '🎉' : score.percentage >= 60 ? '👍' : '📚'}
              </div>
              <h3 style={{ 
                fontSize: 24, 
                fontWeight: 'bold', 
                marginBottom: 8, 
                color: '#1e293b'
              }}>
                {score.percentage >= 80 ? '¡Excelente!' : score.percentage >= 60 ? '¡Buen trabajo!' : '¡Sigue estudiando!'}
              </h3>
              <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ color: '#4b5563' }}>
                  Respuestas correctas: <span style={{ fontWeight: 'bold', color: '#28a745' }}>{score.correct}/{score.total}</span>
                </p>
                <p style={{ color: '#4b5563' }}>
                  Respuestas incorrectas: <span style={{ fontWeight: 'bold', color: '#dc3545' }}>{score.incorrect}</span>
                </p>
                <p style={{ color: '#4b5563' }}>
                  Puntuación: <span style={{ fontWeight: 'bold' }}>{score.percentage}%</span>
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={() => setShowResults(false)}
                  style={{
                    width: '100%',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: 8,
                    backgroundColor: '#2f6feb',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'opacity 0.2s',
                  }}
                >
                  Revisar Respuestas
                </button>
                <button
                  onClick={resetActivity}
                  style={{
                    width: '100%',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: 8,
                    backgroundColor: '#f59e0b',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'opacity 0.2s',
                  }}
                >
                  Intentar de Nuevo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DragDropContext>
  );
};

export default VenousAccessDragAndDrop;