export interface BudgetI {
	type: 'Parent Category' | 'Sub Category' | 'Items' | 'Summary' | 'Sub Total' | 'Category Total';
	title: string;
	data: any[];
	items: BudgetI[];
    categorySummary?: BudgetI;
}