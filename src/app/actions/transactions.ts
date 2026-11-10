'use server';

import { supabase } from '@/lib/supabase';
import { Transaction, TransactionInput } from '@/types/transaction';

export async function getTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function createTransaction(
  input: TransactionInput
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert([input])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function getMonthlyStats(): Promise<{
  income: number;
  expense: number;
}> {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const startDate = firstDay.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount')
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) throw new Error(error.message);

  const income = (data || [])
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const expense = (data || [])
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return { income, expense };
}
