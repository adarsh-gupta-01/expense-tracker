import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FaMoneyBillWave, FaListUl, FaFileAlt, FaCalendar } from 'react-icons/fa';

const CATEGORIES = ['Food', 'Travel', 'Recharge', 'Shopping', 'Other'];
const RECORD_TYPES = [
  { value: 'expense', label: 'Expense' },
  { value: 'lend', label: 'Money Lent' },
  { value: 'borrow', label: 'Money Borrowed' },
];

const AddExpense = () => {
  const [formData, setFormData] = useState({
    recordType: 'expense',
    amount: '',
    category: 'Food',
    description: '',
    counterparty: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    if (!formData.date) {
      setError('Please select a date');
      return;
    }

    if (formData.recordType !== 'expense' && !formData.counterparty.trim()) {
      setError('Please enter person name/email for borrow/lend records');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const viewerEmails = Array.isArray(userProfile?.viewerEmails)
        ? userProfile.viewerEmails.map((email) => email.trim().toLowerCase()).filter(Boolean)
        : [];
      const accessEmails = Array.from(new Set([
        currentUser.email?.toLowerCase(),
        ...viewerEmails,
      ].filter(Boolean)));

      // Add expense to Firestore
      await addDoc(collection(db, 'expenses'), {
        recordType: formData.recordType,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description.trim(),
        counterparty: formData.counterparty.trim(),
        date: formData.date,
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
        ownerUid: currentUser.uid,
        ownerEmail: (currentUser.email || '').toLowerCase(),
        accessEmails,
      });

      // Show success message
      setSuccess(true);
      
      // Reset form
      setFormData({
        recordType: 'expense',
        amount: '',
        category: 'Food',
        description: '',
        counterparty: '',
        date: format(new Date(), 'yyyy-MM-dd')
      });

      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate('/');
      }, 1500);

    } catch (error) {
      console.error('Error adding expense:', error);
      setError('Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in pt-20 lg:pt-0 w-full">
      <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-8 max-w-3xl lg:max-w-4xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">Add Record</h1>
          <p className="text-sm sm:text-base text-gray-600">Add expense, lend, or borrow records</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="card mb-4 sm:mb-6 bg-green-50 border border-green-200">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5 sm:mt-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-green-800 font-semibold text-sm sm:text-base">Expense added successfully!</p>
              <p className="text-green-700 text-xs sm:text-sm">Redirecting to dashboard...</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-start sm:items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-xs sm:text-sm">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Record Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {RECORD_TYPES.map((option) => {
                const active = formData.recordType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, recordType: option.value }))}
                    className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg border text-xs sm:text-sm font-medium transition-colors ${active ? 'bg-black text-white border-black' : 'bg-white text-black border-black hover:bg-gray-100'}`}
                    disabled={loading}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Field */}
          <div>
            <label htmlFor="amount" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                <FaMoneyBillWave className="text-gray-400 text-sm sm:text-base" />
              </div>
              <input
                id="amount"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="input-field pl-8 sm:pl-10 text-sm sm:text-base"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                disabled={loading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Enter amount in INR</p>
          </div>

          {/* Category Field */}
          <div>
            <label htmlFor="category" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                <FaListUl className="text-gray-400 text-sm sm:text-base" />
              </div>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field pl-8 sm:pl-10 text-sm sm:text-base"
                required
                disabled={loading}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="relative">
              <div className="absolute top-2 sm:top-3 left-0 pl-2 sm:pl-3 pointer-events-none">
                <FaFileAlt className="text-gray-400 text-sm sm:text-base" />
              </div>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field pl-8 sm:pl-10 resize-none text-sm sm:text-base"
                placeholder="Add notes about this expense (optional)"
                rows="3"
                disabled={loading}
              />
            </div>
          </div>

          {formData.recordType !== 'expense' && (
            <div>
              <label htmlFor="counterparty" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Person Name / Email <span className="text-red-500">*</span>
              </label>
              <input
                id="counterparty"
                type="text"
                name="counterparty"
                value={formData.counterparty}
                onChange={handleChange}
                className="input-field text-sm sm:text-base"
                placeholder={formData.recordType === 'lend' ? 'Whom did you lend to?' : 'Whom did you borrow from?'}
                disabled={loading}
              />
            </div>
          )}

          {/* Date Field */}
          <div>
            <label htmlFor="date" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                <FaCalendar className="text-gray-400 text-sm sm:text-base" />
              </div>
              <input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input-field pl-8 sm:pl-10 text-sm sm:text-base"
                max={format(new Date(), 'yyyy-MM-dd')}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <div className="spinner border-2 border-white border-t-transparent w-4 h-4 sm:w-5 sm:h-5"></div>
                  <span>Adding...</span>
                </>
              ) : (
                  <span>Add Record</span>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/')}
              disabled={loading}
              className="btn-secondary py-2.5 sm:py-3 text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="mt-4 sm:mt-6 card bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-2 sm:gap-3">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-xs sm:text-sm text-blue-800 font-medium mb-1">Quick Tips</p>
            <ul className="text-xs sm:text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>All expenses are updated in real-time</li>
              <li>You can view expenses by month on the dashboard</li>
              <li>Expenses are automatically included in monthly reports</li>
            </ul>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AddExpense;
