import { Directive, ElementRef, HostListener,Output, EventEmitter, Renderer2} from '@angular/core';

@Directive({
  selector: '[appCapitalizeFirstLetter]'
})
export class CapitalizeFirstLetterDirective {

  constructor(private el: ElementRef, private _renderer: Renderer2) {
  	}
    
    @Output() ngModelChange: EventEmitter<any> = new EventEmitter();
	value: any;

	@HostListener('keyup', ['$event']) onInputChange($event) {
	    this.value = $event.target.value.toLowerCase()
					    .split(' ')
					    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
					    .join(' ');
	    this.el.nativeElement.value = this.value;
	}

}
