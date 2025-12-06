import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageUrl'
})
export class ImageUrlPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return '';
    
    // Si c'est déjà une URL complète, retournez-la telle quelle
    if (value.startsWith('http')) {
      return value;
    }
    
    // Si c'est un chemin relatif, ajoutez l'URL de base du backend
    const baseUrl = 'http://localhost:8080';
    
    // Gérer les chemins qui commencent ou non par /
    if (value.startsWith('/')) {
      return `${baseUrl}${value}`;
    } else {
      return `${baseUrl}/${value}`;
    }
  }
}