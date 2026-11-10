export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note?: string;
  created_at: string;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note?: string;
}
