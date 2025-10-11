import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  
  // Calculs des différentes unités de temps
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  // Retourne la plus grande unité de temps significative
  if (diffInYears > 0) {
    return diffInYears === 1 ? 'Il y a 1 an' : `Il y a ${diffInYears} ans`;
  }
  
  if (diffInMonths > 0) {
    if (diffInMonths === 1) return 'Il y a 1 mois';
    
    // Si moins de 2 mois, on peut afficher en semaines
    if (diffInMonths === 1 && diffInWeeks >= 4) return 'Il y a 1 mois';
    if (diffInMonths === 2 && diffInWeeks < 9) return `Il y a ${diffInMonths} mois`;
    if (diffInMonths > 2) return `Il y a ${diffInMonths} mois`;
  }
  
  if (diffInWeeks > 0) {
    // Si plus d'une semaine mais moins d'un mois
    if (diffInWeeks === 1) return 'Il y a 1 semaine';
    if (diffInWeeks <= 4) return `Il y a ${diffInWeeks} semaines`;
  }
  
  if (diffInDays > 0) {
    if (diffInDays === 1) return 'Il y a 1 jour';
    if (diffInDays <= 6) return `Il y a ${diffInDays} jours`;
    // Si 7 jours exactement, on affiche 1 semaine
    if (diffInDays === 7) return 'Il y a 1 semaine';
  }
  
  if (diffInHours > 0) {
    if (diffInHours === 1) return 'Il y a 1 heure';
    return `Il y a ${diffInHours} heures`;
  }
  
  if (diffInMinutes > 0) {
    if (diffInMinutes === 1) return 'Il y a 1 minute';
    return `Il y a ${diffInMinutes} minutes`;
  }
  
  return 'À l\'instant';
};