'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  getMonthlyStats,
} from './actions/transactions';
import { Transaction, TransactionInput } from '@/types/transaction';

const CATEGORIES_INCOME = ['Salary', 'Bonus', 'Investment', 'Other'];
const CATEGORIES_EXPENSE = [
  'Food',
  'Transport',
  'Entertainment',
  'Utilities',
  'Health',
  'Shopping',
  'Other',
];

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({ income: 0, expense: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<TransactionInput>({
    type: 'expense',
    amount: 0,
    category: CATEGORIES_EXPENSE[0],
    date: '',
    note: '',
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      date: new Date().toISOString().split('T')[0],
    }));
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [txns, monthlyStats] = await Promise.all([
        getTransactions(),
        getMonthlyStats(),
      ]);
      setTransactions(txns);
      setStats(monthlyStats);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      await createTransaction({
        ...formData,
        amount: Number(formData.amount),
      });
      setFormData({
        type: 'expense',
        amount: 0,
        category: CATEGORIES_EXPENSE[0],
        date: new Date().toISOString().split('T')[0],
        note: '',
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const balance = stats.income - stats.expense;
  const categories =
    formData.type === 'income' ? CATEGORIES_INCOME : CATEGORIES_EXPENSE;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          💰 Finance Manager
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats Dashboard */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold">Balance</p>
            <p
              className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              ${balance.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold">Income</p>
            <p className="text-3xl font-bold text-green-600">
              ${stats.income.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-semibold">Expense</p>
            <p className="text-3xl font-bold text-red-600">
              ${stats.expense.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Add Transaction
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      type: e.target.value as 'income' | 'expense',
                      category: (
                        e.target.value === 'income'
                          ? CATEGORIES_INCOME
                          : CATEGORIES_EXPENSE
                      )[0],
                    });
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Note
              </label>
              <input
                type="text"
                value={formData.note || ''}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                placeholder="Optional note"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Transaction'}
            </button>
          </form>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Transactions
          </h2>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No transactions yet
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between border border-gray-200 rounded p-4 hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {tx.category}
                    </p>
                    <p className="text-sm text-gray-600">{tx.date}</p>
                    {tx.note && (
                      <p className="text-sm text-gray-500">{tx.note}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <p
                      className={`font-bold text-lg ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
