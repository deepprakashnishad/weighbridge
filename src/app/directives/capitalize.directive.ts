import { Directive, ElementRef, HostListener,Output, EventEmitter, Renderer2} from '@angular/core';

@Directive({
  selector: '[appCapitalize]'
})
export class CapitalizeDirective {

  lastValue: string;

  constructor(public ref: ElementRef) { }

  @HostListener('input', ['$event']) onInput($event) {
    var start = $event.target.selectionStart;
    var end = $event.target.selectionEnd;
    $event.target.value = $event.target.value.toUpperCase();
    $event.target.setSelectionRange(start, end);
    $event.preventDefault();

    if (!this.lastValue || (this.lastValue && $event.target.value.length > 0 && this.lastValue !== $event.target.value)) {
      this.lastValue = this.ref.nativeElement.value = $event.target.value;
      // Propagation
      const evt = document.createEvent('HTMLEvents');
      evt.initEvent('input', false, true);
      event.target.dispatchEvent(evt);
    }
  }

}
