// Types for enhanced card carousel

export interface TarotCard {
  id: string;
  name: string;
  nameTh: string;
  number: number;
  arcana: 'major' | 'minor';
  suit?: 'cups' | 'pentacles' | 'swords' | 'wands';
  imageUrl: string;
  meaningUpright: string;
  meaningReversed: string;
  keywords: string[];
}

export interface SelectedCard extends TarotCard {
  position: number;
  isReversed: boolean;
  selectedAt: number;
}

export interface CarouselState {
  currentIndex: number;
  dragOffset: number;
  velocity: number;
  isDragging: boolean;
  direction: 'left' | 'right' | null;
}

export interface SelectionState {
  selectedCards: SelectedCard[];
  maxSelection: number;
  isComplete: boolean;
}

export type CardState = 'idle' | 'hover' | 'dragging' | 'selected' | 'disabled';

export interface SpreadType {
  id: string;
  name: string;
  nameTh: string;
  cardCount: number;
  description: string;
  positions: string[];
  positionsTh: string[];
}
