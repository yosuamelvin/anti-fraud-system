import { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';
import {
  Download,
  Calendar,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  FileText
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import LoadingSpinner from '../components/LoadingSpinner';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchStatistics();
  }, [dateRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getStatistics(dateRange);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await reportsAPI.exportCases(dateRange);
      const cases = response.data.data;

      const exportData = cases.map(c => ({
        'No Tiket': c.nomor_tiket,
        'Tanggal Pelaporan': new Date(c.tanggal_pelaporan).toLocaleDateString('id-ID'),
        'Pelapor': c.email_pelapor || '-',
        'Subject': c.subject_laporan || '-',
        'Cabang': c.cabang,
        'Status': c.status_kasus,
        'Investigator': c.investigator?.nama_lengkap || '-',
        'SLA': c.status_sla,
        'Kategori': c.kategori_kasus || '-',
        'Terlapor': c.terlapor || '-'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Cases Report');

      const fileName = `Cases_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Gagal export ke Excel');
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await reportsAPI.exportCases(dateRange);
      const cases = response.data.data;

      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(16);
      doc.text('Anti-Fraud Investigation Cases Report', 14, 15);
      
      // Date range
      doc.setFontSize(10);
      const startDate = new Date(dateRange.start_date).toLocaleDateString('id-ID');
      const endDate = new Date(dateRange.end_date).toLocaleDateString('id-ID');
      doc.text(`Period: ${startDate} - ${endDate}`, 14, 22);

      // Table
      const tableData = cases.map(c => [
        c.nomor_tiket,
        new Date(c.tanggal_pelaporan).toLocaleDateString('id-ID'),
        c.cabang,
        c.status_kasus,
        c.investigator?.nama_lengkap || '-',
        c.status_sla
      ]);

      autoTable(doc, {
        startY: 28,
        head: [['No Tiket', 'Tanggal', 'Cabang', 'Status', 'Investigator', 'SLA']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 8 }
      });

      const fileName = `Cases_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert(`Gagal export ke PDF: ${error.message}`);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const formatMonthYear = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
  };

  // LOADING STATE
  if (loading) {
    return <LoadingSpinner text="Loading statistics..." />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report & Statistik</h1>
          <p className="text-sm text-gray-500 mt-1">
            Analisis dan visualisasi data case investigasi
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Cases</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.summary.total_cases || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Closed Cases</p>
              <p className="text-3xl font-bold text-green-600">{stats?.summary.closed_cases || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Resolution</p>
              <p className="text-3xl font-bold text-purple-600">{stats?.summary.avg_resolution_days || 0} hari</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <PieChartIcon className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Cases by Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats?.by_status || []}
                dataKey="count"
                nameKey="status_kasus"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {(stats?.by_status || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Cases by SLA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChartIcon className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Cases by SLA Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.by_sla || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status_sla" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases by Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <PieChartIcon className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Cases by Category</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats?.by_category || []}
                dataKey="count"
                nameKey="kategori_kasus"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {(stats?.by_category || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Cases Trend (6 months) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Cases Trend (6 Months)</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.by_month || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={formatMonthYear}
              />
              <YAxis />
              <Tooltip labelFormatter={formatMonthYear} />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Total Cases" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Cabang */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChartIcon className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Top 10 Cabang</h3>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={stats?.by_cabang || []} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="cabang" type="category" width={120} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#10b981" name="Total Cases" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Reports;