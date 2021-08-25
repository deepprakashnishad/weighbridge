import {Directive,HostListener} from '@angular/core'

@Directive({
selector: '[license-mask]'
})
export class LicenseMaskDirective {

  @HostListener('input', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;

    let trimmed = input.value.replace(/\s+/g, '');
    let totalStringLength = 29;
    if (trimmed.length > totalStringLength) {
      trimmed = trimmed.substr(0, totalStringLength);
  }

  trimmed = trimmed.replace(/-/g,'');

  let numbers = [];
 
  numbers.push(trimmed.substr(0,4));
  if(trimmed.substr(4,4)!=="")
    numbers.push(trimmed.substr(4,4));
  if(trimmed.substr(8,4)!="")
    numbers.push(trimmed.substr(8, 4));
  if (trimmed.substr(12, 4) != "")
    numbers.push(trimmed.substr(12, 4));
  if (trimmed.substr(16, 4) != "")
    numbers.push(trimmed.substr(16, 4));
  if (trimmed.substr(20, 4) != "")
    numbers.push(trimmed.substr(20, 4));

  input.value = numbers.join('-');

  }
}
