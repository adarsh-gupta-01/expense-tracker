import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { FaCalendar, FaDownload } from 'react-icons/fa';
import { generatePDF } from '../utils/pdfExport';
import { useAuth } from '../context/AuthContext';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Analytics = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [downloading, setDownloading] = useState(false);
  const { currentUser } = useAuth();

  // Fetch expenses for selected month
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
        const expenseData = [];
        snapshot.forEach((doc) => {
          const data = { id: doc.id, ...doc.data() };
          if (data.date >= monthStart && data.date <= monthEnd) {
            expenseData.push(data);
          }
        });
        expenseData.sort((a, b) => (a.date < b.date ? 1 : -1));
        setExpenses(expenseData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching expenses:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedMonth, currentUser?.uid]);

  // Calculate category data for pie chart
  const getCategoryData = () => {
    const categoryTotals = {};
    
    expenses.filter((entry) => (entry.recordType || 'expense') === 'expense').forEach((expense) => {
      const category = expense.category;
      const amount = parseFloat(expense.amount) || 0;
      
      if (categoryTotals[category]) {
        categoryTotals[category] += amount;
      } else {
        categoryTotals[category] = amount;
      }
    });

    return {
      labels: Object.keys(categoryTotals),
      datasets: [{
        label: 'Expenses by Category',
        data: Object.values(categoryTotals),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 2,
      }],
    };
  };

  // Calculate daily spending for bar chart
  const getDailyData = () => {
    const startDate = startOfMonth(selectedMonth);
    const endDate = endOfMonth(selectedMonth);
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });
    
    const dailyTotals = {};
    
    // Initialize all days with 0
    allDays.forEach((day) => {
      dailyTotals[format(day, 'yyyy-MM-dd')] = 0;
    });
    
    // Sum up expenses for each day
    expenses.filter((entry) => (entry.recordType || 'expense') === 'expense').forEach((expense) => {
      const date = expense.date;
      const amount = parseFloat(expense.amount) || 0;
      dailyTotals[date] = (dailyTotals[date] || 0) + amount;
    });

    return {
      labels: allDays.map(day => format(day, 'dd MMM')),
      datasets: [{
        label: 'Daily Spending',
        data: Object.values(dailyTotals),
        backgroundColor: 'rgba(14, 165, 233, 0.8)',
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 2,
      }],
    };
  };

  // Month selector
  const handleMonthChange = (direction) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedMonth(newDate);
  };

  // Download PDF report
  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      await generatePDF(expenses, selectedMonth);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const totalExpenses = expenses
    .filter((entry) => (entry.recordType || 'expense') === 'expense')
    .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  const categoryData = getCategoryData();
  const dailyData = getDailyData();

  return (
    <div className="fade-in pt-20 lg:pt-0 w-full">
      <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">My Analytics</h1>
          <p className="text-sm sm:text-base text-gray-600">Visual insights into your own records</p>
        </div>

        {/* Month Selector & Download */}
        <div className="card mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
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

          <button
            onClick={handleDownloadPDF}
            disabled={downloading || expenses.length === 0}
            className="btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm px-4 py-2"
          >
            {downloading ? (
              <>
                <div className="spinner border-2 border-white border-t-transparent w-3 h-3 sm:w-4 sm:h-4"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FaDownload className="text-sm sm:text-base" />
                <span>Download</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Total Summary */}
      <div className="card border-black mb-6 sm:mb-8">
        <div className="text-center py-4 sm:py-6">
          <p className="text-gray-700 text-sm sm:text-base lg:text-lg mb-2">Total Monthly Expenses</p>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black">{formatCurrency(totalExpenses)}</p>
          <p className="text-gray-700 mt-2 text-xs sm:text-sm">{expenses.length} transactions</p>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="card text-center py-8 sm:py-12">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500 text-base sm:text-lg">No data available for charts</p>
          <p className="text-gray-400 text-xs sm:text-sm">Add some expenses to see analytics</p>
        </div>
      ) : (
        <>
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Pie Chart - Category Breakdown */}
            <div className="card">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Category Breakdown</h2>
              <div className="flex items-center justify-center" style={{ height: '250px', maxHeight: '60vh' }}>
                <Pie 
                  data={categoryData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 15,
                          font: {
                            size: 12
                          }
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return `${label}: ${formatCurrency(value)}`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Bar Chart - Daily Spending */}
            <div className="card">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Daily Spending Trend</h2>
              <div style={{ height: '250px', maxHeight: '60vh' }}>
                <Bar 
                  data={dailyData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `Spent: ${formatCurrency(context.parsed.y)}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return '₹' + value;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Category Summary Table */}
          <div className="card">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Category Summary</h2>
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <table className="w-full min-w-max">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Category</th>
                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Total Amount</th>
                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap hidden sm:table-cell">Transactions</th>
                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap hidden md:table-cell">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categoryData.labels.map((category, index) => {
                    const amount = categoryData.datasets[0].data[index];
                    const count = expenses.filter(e => e.category === category).length;
                    const percentage = ((amount / totalExpenses) * 100).toFixed(1);
                    
                    return (
                      <tr key={category} className="hover:bg-gray-50">
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <div 
                              className="w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0"
                              style={{ backgroundColor: categoryData.datasets[0].backgroundColor[index] }}
                            />
                            <span className="text-xs sm:text-sm font-medium text-gray-900 capitalize">{category}</span>
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-900 font-semibold text-right whitespace-nowrap">
                          {formatCurrency(amount)}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 text-right hidden sm:table-cell">{count}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 text-right hidden md:table-cell">{percentage}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default Analytics;
