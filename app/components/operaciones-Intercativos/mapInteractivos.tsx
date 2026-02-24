import { ComponentType } from 'react';
import HandwashingTraining from '@/app/dashboard/interactivos/lavado-manos';
import VenousAccessDragAndDrop from '@/app/dashboard/interactivos/materiales-vvp';

// ESTO ES SOLO UN OBJETO (El Menú)
const mapaInteractivos: Record<string, ComponentType> = {
  "ViaVenosa": VenousAccessDragAndDrop,
  "Lavadodemanos": HandwashingTraining,
}; 

export default mapaInteractivos;