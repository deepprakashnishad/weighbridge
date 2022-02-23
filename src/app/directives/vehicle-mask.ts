import { Directive, HostListener } from '@angular/core'

@Directive({
  selector: '[vehicleMask]'
})
export class VehicleMaskDirective {

  @HostListener('input', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;

    let str = input.value.trim();
    var newStr = "";
    var currChar, prevChar;
    for (var i = 0; i < str.length; i++) {
      currChar = this.isLetter(str.charAt(i));
      if (prevChar === undefined) {
        newStr = newStr.concat(str[i]);
      } else if ((prevChar !== currChar) && str[i - 1] !== " " && str[i] !== " ") {
        newStr = newStr.concat(` ${str[i]}`);
      } else {
        newStr = newStr.concat(str[i]);
      }

      prevChar = currChar;
    }
    input.value = newStr.toUpperCase().trim();
  }

  isLetter(str) {
    return str.toUpperCase() !== str.toLowerCase();
  }
}
