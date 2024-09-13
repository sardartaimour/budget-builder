import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { startOfYear, endOfYear, format, addMonths, endOfMonth } from 'date-fns';
import { BudgetI } from '../../models/budget.interface';
import { PositiveNumberDirective } from '../../directives/positive.number.directive';
import { PopupComponent } from '../popup/popup.component';
import { startOfMonth } from 'date-fns/fp';

@Component({
	selector: 'app-table',
	standalone: true,
	imports: [FormsModule, CommonModule, PositiveNumberDirective, PopupComponent],
	templateUrl: './table.component.html',
	styleUrl: './table.component.scss'
})
export class TableComponent {

	endDate: any;
	startDate: any;
	slectedObject: any = null;
	
	months: string[] = [];
	budgetData: BudgetI[] = [];

	constructor() {
		const date = new Date()
		this.endDate = format(endOfYear(endOfMonth(date)), 'yyyy-MM');
		this.startDate = format(startOfYear(startOfMonth(date)), 'yyyy-MM');

		this.getMonths();
	}

	ngAfterViewInit(): void {
		this.focusAndSelect(this.months[0] + '_0');
	}

	focusAndSelect(Id: string): void {
		const firstInput: any = document.getElementById(Id);
		if (firstInput) {
			firstInput.focus();
			firstInput?.select();
		}
	}

	getMonths() {
	
		let current = new Date(this.startDate);
		this.months = [];

		while (current <= new Date(this.endDate)) {
			this.months.push(format(current, 'MMM yyyy')); // Format as "Month Year"
			current = addMonths(current, 1);
		}

		const data = this.months.map(month => { return { key: month, value: null }});
		const openingBalance = JSON.parse(JSON.stringify(data));
		openingBalance[0].value = 0;

		this.budgetData = [{
			type: 'Parent Category',
			title: 'Income',
			data: [], // column wise data
			items: [{
				type: 'Sub Category',
				title: 'General Income',
				data: JSON.parse(JSON.stringify(data)),
				items: [
					{
						type: 'Items',
						title: 'Title',
						data: JSON.parse(JSON.stringify(data)),
						items: []
					}
				],
				categorySummary: {
					type: 'Sub Total',
					title: 'Sub Total',
					items: [],
					data: JSON.parse(JSON.stringify(data))
				}
				 
			}],
			categorySummary: {
				type: 'Category Total',
				title: 'Category Total',
				items: [],
				data: JSON.parse(JSON.stringify(data))
			}
		}, {
			type: 'Parent Category',
			title: 'Expenses',
			data: [], // column wise data
			items: [{
				type: 'Sub Category',
				title: 'Operational Expense',
				data: JSON.parse(JSON.stringify(data)),
				items: [
					{
						type: 'Items',
						title: 'Management Fess',
						items: [],
						data: JSON.parse(JSON.stringify(data))
					}
				],
				categorySummary: {
					type: 'Sub Total',
					title: 'Sub Total',
					items: [],
					data: JSON.parse(JSON.stringify(data))
				}
				 
			}],
			categorySummary: {
				type: 'Category Total',
				title: 'Category Total',
				items: [],
				data: JSON.parse(JSON.stringify(data))
			}
		}, {
			type: 'Summary',
			title: 'Total Expenses',
			data: JSON.parse(JSON.stringify(data)), // column wise data
			items: []
		}, {
			type: 'Summary',
			title: 'Profit / Loss',
			data: JSON.parse(JSON.stringify(data)), // column wise data
			items: []
		}, {
			type: 'Summary',
			title: 'Opening Balance',
			data: openingBalance, // column wise data
			items: []
		}, {
			type: 'Summary',
			title: 'Closing Balance',
			data: JSON.parse(JSON.stringify(data)), // column wise data
			items: []
		}];
	}

	onAddSubCategory(items: BudgetI[]): void {
		const title = 'Title';
		const data = this.months.map(month => { return { key: month, value: null }});
		items.push({
			type: 'Items',
			title: 'Title',
			items: [],
			data: JSON.parse(JSON.stringify(data))
		});

		setTimeout(() => this.focusAndSelect(title+'_title_' + (items.length-1)), 100);
	}

	onAddParentCategory(items: BudgetI[], Idx: number): void {
		const title = 'Sub Category';
		Idx += 1;
		const data = this.months.map(month => { return { key: month, value: null }});
		items.splice(Idx, 0, {
			type: 'Sub Category',
			title,
			data: JSON.parse(JSON.stringify(data)),
			items: [
				{
					type: 'Items',
					title: 'Title',
					data: JSON.parse(JSON.stringify(data)),
					items: []
				}
				
			],
			categorySummary: {
				type: 'Sub Total',
				title: 'Sub Total',
				items: [],
				data: JSON.parse(JSON.stringify(data))
			}
			 
		});

		setTimeout(() => this.focusAndSelect(title+'_category_title_' + Idx), 100);
	}

	onRightClick(event: MouseEvent, args: any) {
		event.preventDefault();
		this.slectedObject = args;
	}

	onApplyAll(ev: any) {
		if (ev.ev === 'APPLY') {
			const { parentCategoryIdx, subCategoryIdx, itemIdx, data, key, id} = this.slectedObject;
			this.focusAndSelect(id);
			data.map((item: any) => item.value = data[itemIdx].value);

			this.months.forEach(month => {
				this.onReCalculate(parentCategoryIdx, subCategoryIdx, itemIdx, key);
			});
		};

		this.slectedObject = null;
	}

	onReCalculate(parentCategoryIdx: number, subCategoryIdx: number, itemIdx: number, key: string): void {
		// Calculate subcategory sum & update summary
		const sum = this.calculateSum(this.budgetData[parentCategoryIdx].items[subCategoryIdx], itemIdx);
		this.updateSummary(this.budgetData[parentCategoryIdx].items[subCategoryIdx], key, sum);
	
		// Calculate parent category sum & update summary
		const categoryTotal = this.budgetData[parentCategoryIdx].items.reduce((total, subCategory) => {
			return total + this.getSummaryValue(subCategory, key);
		}, 0);
		this.updateSummary(this.budgetData[parentCategoryIdx], key, categoryTotal);
	
		// Calculate total income & expense then update whole summary
		const totalIncome = this.getSummaryValue(this.budgetData[0], key);
		const totalExpense = this.getSummaryValue(this.budgetData[1], key);
		
		const summary = this.budgetData.filter(budget => budget.type === 'Summary');
		summary[0].data[itemIdx].value = totalExpense;
		summary[1].data[itemIdx].value = totalIncome - totalExpense;

		const openingBalance = itemIdx === 0 ? Object.assign({}, { value: 0 }) : Object.assign({}, summary[3].data[itemIdx - 1]);
		summary[2].data[itemIdx].value = openingBalance.value; // carry forward

		const profitLoss = Object.assign({}, summary[1].data[itemIdx]);
		console.log('profitLos', profitLoss, openingBalance)
		summary[3].data[itemIdx].value = 
			(isNaN(profitLoss.value) ? 0 : Number(profitLoss.value)) 
				+ 
			(isNaN(openingBalance.value) ? Number(openingBalance.value) : 0);
	}
	
	private calculateSum(category: any, itemIdx: number): number {
		let sum = this.getValue(category.data[itemIdx]);
	
		if (category.items) {
			for (const item of category.items) {
				sum += this.calculateSum(item, itemIdx);
			}
		}
	
		return sum;
	}
	
	private updateSummary(category: any, key: string, value: number): void {
		if (category.categorySummary) {
			for (const summary of category.categorySummary.data) {
				if (summary.key === key) {
					summary.value = value;
					break;
				}
			}
		}
	}
	
	private getSummaryValue(category: any, key: string): number {
		if (category.categorySummary) {
			const summary = category.categorySummary.data.find((summary: any) => summary.key === key);
			return summary ? this.getValue(summary) : 0;
		}
		return 0;
	}
	
	private getValue(dataItem: any): number {
		return dataItem && !isNaN(Number(dataItem.value)) ? Number(dataItem.value) : 0;
	}

	onDateChange(ev: any) {
		this.getMonths()
	}
}
