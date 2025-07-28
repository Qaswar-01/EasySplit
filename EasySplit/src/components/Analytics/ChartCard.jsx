import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { formatCurrency } from '../../utils/calculations';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const ChartCard = ({ 
  title, 
  type, 
  data = [], 
  currency = 'PKR',
  icon,
  delay = 0 
}) => {
  // Enhanced chart implementations with Chart.js
  const renderPieChart = () => {
    if (data.length === 0) return <div className="text-gray-500 text-center py-8">No data available</div>;

    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ];

    const chartData = {
      labels: data.map(item => item.name),
      datasets: [
        {
          data: data.map(item => item.value),
          backgroundColor: colors.slice(0, data.length),
          borderColor: colors.slice(0, data.length).map(color => color + '80'),
          borderWidth: 2,
          hoverOffset: 4
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = formatCurrency(context.parsed, currency);
              const percentage = ((context.parsed / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
              return `${context.label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    };

    return (
      <div className="h-80">
        <Doughnut data={chartData} options={options} />
      </div>
    );
  };

  const renderBarChart = () => {
    if (data.length === 0) return <div className="text-gray-500 text-center py-8">No data available</div>;

    const chartData = {
      labels: data.map(item => item.name),
      datasets: [
        {
          label: 'Amount Paid',
          data: data.map(item => item.totalPaid || item.value || 0),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = formatCurrency(context.parsed.y, currency);
              const item = data[context.dataIndex];
              let label = `Amount: ${value}`;
              if (item.expenseCount) {
                label += ` (${item.expenseCount} expense${item.expenseCount !== 1 ? 's' : ''})`;
              }
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value, currency);
            }
          }
        },
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 0
          }
        }
      }
    };

    return (
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    );
  };

  const renderLineChart = () => {
    if (data.length === 0) return <div className="text-gray-500 text-center py-8">No data available</div>;

    const chartData = {
      labels: data.map(item => item.formattedMonth),
      datasets: [
        {
          label: 'Monthly Spending',
          data: data.map(item => item.amount),
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Amount: ${formatCurrency(context.parsed.y, currency)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value, currency);
            }
          }
        },
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 0
          }
        }
      },
      elements: {
        point: {
          hoverBackgroundColor: 'rgba(59, 130, 246, 1)',
        }
      }
    };

    return (
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    );
  };

  const renderDebtChart = () => {
    if (data.length === 0) return <div className="text-gray-500 text-center py-8">No debts to display</div>;

    // Prepare data for debt visualization
    const debtorData = data.map(debt => ({
      name: debt.fromName,
      amount: debt.amount,
      type: 'owes'
    }));

    const creditorData = data.map(debt => ({
      name: debt.toName,
      amount: debt.amount,
      type: 'owed'
    }));

    const chartData = {
      labels: [...new Set([...debtorData.map(d => d.name), ...creditorData.map(d => d.name)])],
      datasets: [
        {
          label: 'Amount Owed',
          data: creditorData.reduce((acc, item) => {
            const existing = acc.find(a => a.name === item.name);
            if (existing) {
              existing.amount += item.amount;
            } else {
              acc.push({ name: item.name, amount: item.amount });
            }
            return acc;
          }, []).map(item => item.amount),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
        },
        {
          label: 'Amount Owes',
          data: debtorData.reduce((acc, item) => {
            const existing = acc.find(a => a.name === item.name);
            if (existing) {
              existing.amount += item.amount;
            } else {
              acc.push({ name: item.name, amount: item.amount });
            }
            return acc;
          }, []).map(item => -item.amount), // Negative for visual distinction
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = Math.abs(context.parsed.y);
              const type = context.parsed.y >= 0 ? 'is owed' : 'owes';
              return `${context.dataset.label}: ${formatCurrency(value, currency)} (${type})`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(Math.abs(value), currency);
            }
          }
        }
      }
    };

    return (
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'pie':
        return renderPieChart();
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'debt':
        return renderDebtChart();
      default:
        return <div className="text-gray-500">Chart type not supported</div>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {data.length} item{data.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Chart */}
      <div className="min-h-[200px]">
        {renderChart()}
      </div>
    </motion.div>
  );
};

export default ChartCard;
