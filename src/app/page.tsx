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

  const categoryStats = transactions.reduce((acc, tx) => {
    if (tx.type === 'expense') {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const categoryColors: Record<string, string> = {
    Food: 'bg-purple-500',
    Transport: 'bg-blue-500',
    Entertainment: 'bg-green-500',
    Utilities: 'bg-orange-500',
    Health: 'bg-pink-500',
    Shopping: 'bg-yellow-500',
    Other: 'bg-gray-500',
  };

  const categoryIcons: Record<string, string> = {
    Food: '🛒',
    Transport: '🚗',
    Entertainment: '🎮',
    Utilities: '🏠',
    Health: '💊',
    Shopping: '🛍️',
    Other: '📦',
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button className="p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex gap-3">
            <button className="p-2 relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {error && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Main Balance */}
        <div className="mb-6">
          <p className="text-gray-500 text-sm mb-1">Main balance</p>
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">${balance.toFixed(2)}</h1>
            <button className="p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => {
              setFormData({ ...formData, type: 'expense' });
              document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl shadow-sm"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-lg">➕</span>
            </div>
            <span className="text-xs text-gray-700">Add</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl shadow-sm">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-lg">🔄</span>
            </div>
            <span className="text-xs text-gray-700">Move</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl shadow-sm">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-lg">📤</span>
            </div>
            <span className="text-xs text-gray-700">Send</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl shadow-sm">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-lg">⋯</span>
            </div>
            <span className="text-xs text-gray-700">Details</span>
          </button>
        </div>

        {/* Quick Actions - Category Cards */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Quick actions</h2>
            <button className="text-sm text-gray-500">Edit</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(categoryStats).slice(0, 4).map(([category, amount]) => (
              <div
                key={category}
                className={`${categoryColors[category] || 'bg-gray-500'} rounded-2xl p-4 text-white shadow-md`}
              >
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-3">
                  <span className="text-2xl">{categoryIcons[category] || '📦'}</span>
                </div>
                <p className="text-sm opacity-90 mb-1">{category}</p>
                <p className="text-xl font-bold">${amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div id="form-section" className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add Transaction</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    type: 'expense',
                    category: CATEGORIES_EXPENSE[0],
                  });
                }}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                  formData.type === 'expense'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    type: 'income',
                    category: CATEGORIES_INCOME[0],
                  });
                }}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                  formData.type === 'income'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Income
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
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
                  className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Note</label>
              <input
                type="text"
                value={formData.note || ''}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="Optional"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition"
            >
              {loading ? 'Adding...' : 'Add Transaction'}
            </button>
          </form>
        </div>

        {/* Transactions List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Transactions</h2>
            {transactions.length > 0 && (
              <button className="text-sm text-gray-500">View all</button>
            )}
          </div>
          {transactions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">📝</span>
              </div>
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      categoryColors[tx.category] || 'bg-gray-500'
                    } bg-opacity-15`}>
                      <span className="text-lg">{categoryIcons[tx.category] || '📦'}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tx.category}</p>
                      <p className="text-xs text-gray-500">{tx.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p
                      className={`font-bold ${
                        tx.type === 'income' ? 'text-green-500' : 'text-gray-900'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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
