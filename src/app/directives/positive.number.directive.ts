import { Directive, HostListener, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appPositiveNumber]',
  standalone: true
})
export class PositiveNumberDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

    @HostListener('input', ['$event']) onInput(event: KeyboardEvent): void {
        const input = this.el.nativeElement as HTMLInputElement;
        const value = input.value;

        // Remove non-numeric characters except decimal point
        let cleanedValue = value.replace(/[^0-9.]/g, '');

        // Ensure there's only one decimal point
        const parts = cleanedValue.split('.');
        if (parts.length > 2) {
            cleanedValue = parts[0] + '.' + parts.slice(1).join('');
        }

        // Update the value
        this.renderer.setProperty(input, 'value', cleanedValue);
    }
}
