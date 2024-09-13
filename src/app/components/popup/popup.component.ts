import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PositiveNumberDirective } from '../../directives/positive.number.directive';

@Component({
	selector: 'app-popup',
	standalone: true,
	imports: [FormsModule, CommonModule, PositiveNumberDirective],
	templateUrl: './popup.component.html',
	styleUrl: './popup.component.scss',
	encapsulation: ViewEncapsulation.None
})
export class PopupComponent {

	@Input() isModalOpen: boolean = false;
	@Output() applyAll: EventEmitter<any> = new EventEmitter();

	closeModal() {
		this.isModalOpen = false;
		this.applyAll.emit({ ev: 'CLOSE' });
	}
	
}