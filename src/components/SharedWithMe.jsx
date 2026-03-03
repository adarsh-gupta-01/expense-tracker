import { useMemo, useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
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
import { FaCalendar, FaMoneyBillWave, FaUsers } from 'react-icons/fa';

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

const SharedWithMe = () => {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMonth: 0,
    totalToday: 0,
    categoryBreakdown: {},
    totalLent: 0,
    totalBorrowed: 0,
  });

  useEffect(() => {
    if (!currentUser?.email) return;

    const listQuery = query(
      collection(db, 'expenses'),
      where('accessEmails', 'array-contains', currentUser.email.toLowerCase())
    );

    const unsubscribe = onSnapshot(listQuery, (snapshot) => {
      const shared = [];
      snapshot.forEach((entry) => {
        const data = { id: entry.id, ...entry.data() };
        if (data.ownerUid !== currentUser.uid) shared.push(data);
      });
      setRecords(shared);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.email, currentUser?.uid]);

  const monthStart = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

  const ownerOptions = useMemo(() => {
    const emails = new Set(records.map((record) => record.ownerEmail || record.createdBy));
    return Array.from(emails).filter(Boolean).sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records
      .filter((record) => record.date >= monthStart && record.date <= monthEnd)
      .filter((record) => selectedOwner === 'all' || (record.ownerEmail || record.createdBy) === selectedOwner)
      .sort((first, second) => (first.date < second.date ? 1 : -1));
  }, [records, selectedOwner, monthStart, monthEnd]);

  // Calculate statistics whenever filtered records change
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    let totalMonth = 0;
    let totalToday = 0;
    let totalLent = 0;
    let totalBorrowed = 0;
    const categoryBreakdown = {};

    filteredRecords.forEach((record) => {
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
  }, [filteredRecords]);

  // Get category data for pie chart
  const getCategoryData = () => {
    const categoryTotals = {};
    
    filteredRecords
      .filter((entry) => (entry.recordType || 'expense') === 'expense')
      .forEach((expense) => {
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

  // Get daily data for bar chart
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
    filteredRecords
      .filter((entry) => (entry.recordType || 'expense') === 'expense')
      .forEach((expense) => {
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
          <p className="text-gray-600">Loading shared records...</p>
        </div>
      </div>
    );
  }

  const categoryData = getCategoryData();
  const dailyData = getDailyData();
  const totalExpenses = filteredRecords
    .filter((entry) => (entry.recordType || 'expense') === 'expense')
    .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

  return (
    <div className="fade-in pt-20 lg:pt-0 w-full">
      <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">Shared With Me</h1>
          <p className="text-sm sm:text-base text-gray-700">Dashboard and analytics of expenses shared by others.</p>
        </div>

        {/* Filters */}
        <div className="card mb-4 sm:mb-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Person</label>
            <select
              className="input-field w-full"
              value={selectedOwner}
              onChange={(event) => setSelectedOwner(event.target.value)}
            >
              <option value="all">All Shared Users</option>
              {ownerOptions.map((ownerEmail) => (
                <option key={ownerEmail} value={ownerEmail}>{ownerEmail}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMonthChange(-1)}
                className="btn-secondary text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap"
              >
                ←
              </button>
              <input
                type="month"
                className="input-field flex-1 min-w-0"
                value={format(selectedMonth, 'yyyy-MM')}
                onChange={(event) => {
                  const [year, month] = event.target.value.split('-');
                  setSelectedMonth(new Date(Number(year), Number(month) - 1, 1));
                }}
              />
              <button
                onClick={() => handleMonthChange(1)}
                className="btn-secondary text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="card text-center py-8 sm:py-12">
          <FaUsers className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-base sm:text-lg mb-1">No shared records found</p>
          <p className="text-gray-400 text-xs sm:text-sm px-4">
            {selectedOwner === 'all' 
              ? 'No one has shared expenses with you yet' 
              : 'No records from this person for selected month'}
          </p>
        </div>
      ) : (
        <>
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
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">{filteredRecords.length}</p>
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
                <p className="text-gray-500 col-span-full text-center py-4">No expenses in this period</p>
              )}
            </div>
          </div>

          {/* Charts Grid */}
          {categoryData.labels.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Pie Chart - Category Breakdown */}
              <div className="card">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Category Distribution</h2>
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
          )}

          {/* Detailed Records Table */}
          <div className="card mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Detailed Records</h2>
              <span className="text-xs sm:text-sm text-gray-500">{filteredRecords.length} entries</span>
            </div>

            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <table className="w-full min-w-max">
                <thead>
                  <tr className="border-b border-black">
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap">Shared By</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap">Date</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap">Type</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap">Category</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap hidden md:table-cell">Person</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap hidden lg:table-cell">Description</th>
                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm max-w-[120px] truncate" title={record.ownerEmail || record.createdBy}>{record.ownerEmail || record.createdBy}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap">{format(new Date(record.date), 'dd MMM')}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm capitalize">{record.recordType || 'expense'}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <span className="inline-block px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 capitalize">
                          {record.category}
                        </span>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm hidden md:table-cell">{record.counterparty || '-'}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm hidden lg:table-cell max-w-[150px] truncate" title={record.description}>{record.description || '-'}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right font-semibold whitespace-nowrap">{formatCurrency(record.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Summary Table */}
          {categoryData.labels.length > 0 && (
            <div className="card">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Category Summary</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Amount</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Transactions</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categoryData.labels.map((category, index) => {
                      const amount = categoryData.datasets[0].data[index];
                      const count = filteredRecords.filter(e => e.category === category && (e.recordType || 'expense') === 'expense').length;
                      const percentage = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : '0.0';
                      
                      return (
                        <tr key={category} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: categoryData.datasets[0].backgroundColor[index] }}
                              />
                              <span className="text-sm font-medium text-gray-900 capitalize">{category}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 font-semibold text-right">
                            {formatCurrency(amount)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 text-right">{count}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 text-right">{percentage}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export default SharedWithMe;
