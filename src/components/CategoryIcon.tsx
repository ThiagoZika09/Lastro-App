import {
  Car,
  Film,
  Folder,
  GraduationCap,
  HeartPulse,
  Home,
  ShoppingBasket,
  UtensilsCrossed,
  Zap,
} from 'lucide-react';
import type { ExpenseCategoryId } from '../types/finance';

interface CategoryIconProps {
  categoryId: ExpenseCategoryId;
  className?: string;
}

export function CategoryIcon({ categoryId, className = 'h-4 w-4' }: CategoryIconProps) {
  switch (categoryId) {
    case 'moradia':
      return <Home className={className} aria-hidden="true" />;
    case 'alimentacao':
      return <ShoppingBasket className={className} aria-hidden="true" />;
    case 'educacao':
      return <GraduationCap className={className} aria-hidden="true" />;
    case 'transporte':
      return <Car className={className} aria-hidden="true" />;
    case 'contas':
      return <Zap className={className} aria-hidden="true" />;
    case 'lazer':
      return <Film className={className} aria-hidden="true" />;
    case 'saude':
      return <HeartPulse className={className} aria-hidden="true" />;
    case 'restaurantes':
      return <UtensilsCrossed className={className} aria-hidden="true" />;
    default:
      return <Folder className={className} aria-hidden="true" />;
  }
}
