import { ComponentType } from 'react';
import HandwashingTraining from '@/app/dashboard/interactivos/lavado-manos';
import VenousAccessDragAndDrop from '@/app/dashboard/interactivos/materiales-vvp';
import CateterUrinarioDragAndDrop from '@/app/dashboard/interactivos/cateter-urinario';
import CateterPICC_DragAndDrop from '@/app/dashboard/interactivos/cateter-picc';

// ESTO ES SOLO UN OBJETO (El Menú)
const mapaInteractivos: Record<string, ComponentType> = {
  "ViaVenosa": VenousAccessDragAndDrop,
  "Lavadodemanos": HandwashingTraining,
  "InstalaciondeCUP": CateterUrinarioDragAndDrop,
  "InstalacionPICC": CateterPICC_DragAndDrop,
}; 

export default mapaInteractivos;