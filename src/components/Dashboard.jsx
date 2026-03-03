import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { FaTrash, FaCalendar, FaMoneyBillWave } from 'react-icons/fa';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [stats, setStats] = useState({
    totalMonth: 0,
    totalToday: 0,
    categoryBreakdown: {},
    totalLent: 0,
    totalBorrowed: 0,
  });
  
  const { currentUser } = useAuth();

  // Fetch expenses with real-time updates
  useEffect(() => {
    if (!currentUser?.uid) return;

    const monthStart = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

    const q = query(
      collection(db, 'expenses'),
      where('ownerUid', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setFetchError('');
        const expenseData = [];
        snapshot.forEach((doc) => {
          const data = { id: doc.id, ...doc.data() };
          if (data.date >= monthStart && data.date <= monthEnd) {
            expenseData.push(data);
          }
        });
        expenseData.sort((a, b) => (a.date < b.date ? 1 : -1));
        setExpenses(expenseData);
        calculateStats(expenseData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching expenses:', error);
        setFetchError('Unable to load dashboard data. Please refresh the page.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedMonth, currentUser?.uid]);

  // Calculate statistics
  const calculateStats = (expenseData) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    let totalMonth = 0;
    let totalToday = 0;
    let totalLent = 0;
    let totalBorrowed = 0;
    const categoryBreakdown = {};

    expenseData.forEach((record) => {
      const amount = parseFloat(record.amount) || 0;
      const recordType = record.recordType || 'expense';

      if (recordType === 'lend') {
        totalLent += amount;
      } else if (recordType === 'borrow') {
        totalBorrowed += amount;
      } else {
        totalMonth += amount;
        if (record.date === today) {
          totalToday += amount;
        }
        if (categoryBreakdown[record.category]) {
          categoryBreakdown[record.category] += amount;
        } else {
          categoryBreakdown[record.category] = amount;
        }
      }
    });

    setStats({ totalMonth, totalToday, categoryBreakdown, totalLent, totalBorrowed });
  };

  // Delete expense
  const handleDelete = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'expenses', expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
    return `₹${formatted}`;
  };

  // Month selector
  const handleMonthChange = (direction) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedMonth(newDate);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in pt-20 lg:pt-0 w-full">
      <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">My Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Overview of your own records</p>
      </div>

      {fetchError && (
        <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
          {fetchError}
        </div>
      )}

      {/* Month Selector */}
      <div className="card mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => handleMonthChange(-1)}
            className="btn-secondary text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap"
          >
            ←
          </button>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <FaCalendar className="text-black text-sm sm:text-base" />
            <span className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">
              {format(selectedMonth, 'MMM yyyy')}
            </span>
          </div>
          
          <button
            onClick={() => handleMonthChange(1)}
            className="btn-secondary text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap"
          >
            →
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <div className="card border-black">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-gray-700 text-xs sm:text-sm font-medium mb-1">Monthly Total</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-black truncate">{formatCurrency(stats.totalMonth)}</p>
            </div>
            <div className="p-2 sm:p-3 lg:p-4 border border-black rounded-lg flex-shrink-0">
              <FaMoneyBillWave className="text-xl sm:text-2xl lg:text-3xl text-black" />
            </div>
          </div>
        </div>

        <div className="card border-black">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-gray-700 text-xs sm:text-sm font-medium mb-1">Today's Spending</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-black truncate">{formatCurrency(stats.totalToday)}</p>
            </div>
            <div className="p-2 sm:p-3 lg:p-4 border border-black rounded-lg flex-shrink-0">
              <FaCalendar className="text-xl sm:text-2xl lg:text-3xl text-black" />
            </div>
          </div>
        </div>

        <div className="card border-black">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-gray-700 text-xs sm:text-sm font-medium mb-1">Total Records</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">{expenses.length}</p>
            </div>
            <div className="p-2 sm:p-3 lg:p-4 border border-black rounded-lg flex-shrink-0">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card border-black">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-gray-700 text-xs sm:text-sm font-medium mb-1">Money Lent</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-black truncate">{formatCurrency(stats.totalLent)}</p>
            </div>
            <div className="p-2 sm:p-3 lg:p-4 border border-black rounded-lg flex-shrink-0">
              <FaMoneyBillWave className="text-xl sm:text-2xl lg:text-3xl text-black" />
            </div>
          </div>
        </div>

        <div className="card border-black">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-gray-700 text-xs sm:text-sm font-medium mb-1">Money Borrowed</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-black truncate">{formatCurrency(stats.totalBorrowed)}</p>
            </div>
            <div className="p-2 sm:p-3 lg:p-4 border border-black rounded-lg flex-shrink-0">
              <FaMoneyBillWave className="text-xl sm:text-2xl lg:text-3xl text-black" />
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Category Breakdown</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {Object.entries(stats.categoryBreakdown).map(([category, amount]) => (
            <div key={category} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1 capitalize">{category}</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(amount)}</p>
            </div>
          ))}
          {Object.keys(stats.categoryBreakdown).length === 0 && (
            <p className="text-gray-500 col-span-full text-center py-4">No expenses in this month</p>
          )}
        </div>
      </div>

      {/* Expenses List */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Expenses</h2>
          {expenses.length > 0 && (
            <span className="text-xs sm:text-sm text-gray-500">{expenses.length} entries</span>
          )}
        </div>

        {expenses.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-base sm:text-lg mb-1">No expenses yet</p>
            <p className="text-gray-400 text-xs sm:text-sm">
              Start by adding your first record
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Date</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Type</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Category</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap hidden md:table-cell">Person</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap hidden lg:table-cell">Description</th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Amount</th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map((expense) => {
                  const recordType = expense.recordType || 'expense';
                  const canDelete = expense.ownerUid === currentUser?.uid;

                  return (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-800 whitespace-nowrap">
                      {format(new Date(expense.date), 'dd MMM')}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-700 capitalize">{recordType}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <span className="inline-block px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 capitalize">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell">{expense.counterparty || '-'}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 hidden lg:table-cell max-w-[150px] truncate" title={expense.description}>{expense.description || '-'}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-900 text-right whitespace-nowrap">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-right">
                      {canDelete ? (
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1 sm:p-2"
                          title="Delete expense"
                        >
                          <FaTrash />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Shared</span>
                      )}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
