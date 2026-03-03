import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export const generatePDF = async (expenses, selectedMonth) => {
  try {
    // Create new PDF document
    const doc = new jsPDF();
    
    const monthYear = format(selectedMonth, 'MMMM yyyy');
    
    const expenseOnly = expenses.filter((entry) => (entry.recordType || 'expense') === 'expense');
    const lendOnly = expenses.filter((entry) => (entry.recordType || 'expense') === 'lend');
    const borrowOnly = expenses.filter((entry) => (entry.recordType || 'expense') === 'borrow');

    // Calculate totals
    const totalAmount = expenseOnly.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const totalLent = lendOnly.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const totalBorrowed = borrowOnly.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    
    // Category breakdown
    const categoryTotals = {};
    expenseOnly.forEach((expense) => {
      const category = expense.category;
      const amount = parseFloat(expense.amount) || 0;
      
      if (categoryTotals[category]) {
        categoryTotals[category] += amount;
      } else {
        categoryTotals[category] = amount;
      }
    });

    // Helper function to format currency
    const formatCurrency = (amount) => {
      const formatted = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount || 0);
      return `₹${formatted}`;
    };

    // Header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Expense Report', 14, 20);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(monthYear, 14, 28);
    
    // Draw a line
    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);

    // Summary Section
    let yPos = 42;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Summary', 14, yPos);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Expenses: ${formatCurrency(totalAmount)}`, 14, yPos);

    yPos += 6;
    doc.text(`Total Lent: ${formatCurrency(totalLent)}`, 14, yPos);

    yPos += 6;
    doc.text(`Total Borrowed: ${formatCurrency(totalBorrowed)}`, 14, yPos);
    
    yPos += 6;
    doc.text(`Total Transactions: ${expenses.length}`, 14, yPos);
    
    yPos += 6;
    doc.text(`Report Generated: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, 14, yPos);

    // Category Breakdown Section
    yPos += 15;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Category Breakdown', 14, yPos);
    
    yPos += 8;
    
    // Category table
    const categoryRows = Object.entries(categoryTotals).map(([category, amount]) => {
      const percentage = ((amount / totalAmount) * 100).toFixed(1);
      return [
        category,
        formatCurrency(amount),
        `${percentage}%`
      ];
    });

    doc.autoTable({
      startY: yPos,
      head: [['Category', 'Amount', 'Percentage']],
      body: categoryRows.length > 0 ? categoryRows : [['No expense records', '-', '-']],
      theme: 'grid',
      headStyles: {
        fillColor: [14, 165, 233],
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9
      },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' }
      }
    });

    // Expense Details Section
    yPos = doc.lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Expense Details', 14, yPos);
    
    yPos += 8;

    // Prepare expense rows
    const expenseRows = expenses.map((expense) => {
      return [
        format(new Date(expense.date), 'dd MMM yyyy'),
        (expense.recordType || 'expense').toUpperCase(),
        expense.category,
        expense.counterparty || '-',
        expense.description || '-',
        formatCurrency(expense.amount)
      ];
    });

    // Expense details table
    doc.autoTable({
      startY: yPos,
      head: [['Date', 'Type', 'Category', 'Person', 'Description', 'Amount']],
      body: expenseRows,
      theme: 'striped',
      headStyles: {
        fillColor: [14, 165, 233],
        fontSize: 9,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 24 },
        1: { cellWidth: 20 },
        2: { cellWidth: 24 },
        3: { cellWidth: 28 },
        4: { cellWidth: 62 },
        5: { halign: 'right', cellWidth: 24 }
      }
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY;
    if (finalY > 260) {
      doc.addPage();
    }
    
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      doc.text(
        'Generated by Expense Tracker',
        14,
        doc.internal.pageSize.height - 10
      );
    }

    // Save PDF
    const fileName = `Expense_Report_${format(selectedMonth, 'MMM_yyyy')}.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
