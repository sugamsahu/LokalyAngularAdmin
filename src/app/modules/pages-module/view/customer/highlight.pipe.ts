import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {
  transform(value: any, searchTerm: any): any {
    if (!searchTerm) return value;
    if (!value) return value;
    if(typeof value !== 'string'){
      return value.toString().replace(new RegExp(searchTerm.trim(), 'gi'), match =>`<b class="highlight">${match}</b>`);
    }
    if(value.toLowerCase().includes(searchTerm.trim().toLowerCase())){
      return value.replace(new RegExp(searchTerm.trim(), 'gi'), match => `<b class="highlight">${match}</b>`);
    }else{
      return value
    }
  }
}
