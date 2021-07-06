import { Directive, ElementRef, HostListener,Output, EventEmitter, Renderer2} from '@angular/core';

@Directive({
  selector: '[appCapitalize]'
})
export class CapitalizeDirective {

  	constructor(private el: ElementRef, private _renderer: Renderer2) {
  	}
    
    @Output() ngModelChange: EventEmitter<any> = new EventEmitter();
	value: any;

	@HostListener('keyup', ['$event']) onInputChange($event) {
	    this.value = $event.target.value.toUpperCase();
	    this.el.nativeElement.value = this.value;
	}

}
