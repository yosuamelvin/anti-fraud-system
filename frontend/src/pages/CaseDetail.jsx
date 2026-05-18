import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { casesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Building,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Edit
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchCaseDetail();
  }, [id]);

  const fetchCaseDetail = async () => {
    try {
      setLoading(true);
      const response = await casesAPI.getById(id);
      setCaseData(response.data.data);
    } catch (error) {
      console.error('Error fetching case:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Unassigned': 'bg-yellow-100 text-yellow-800',
      'Open': 'bg-blue-100 text-blue-800',
      'Closed': 'bg-green-100 text-green-800',
      'Waiting Info': 'bg-orange-100 text-orange-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getSLABadge = (status) => {
    const badges = {
      'On Track': 'bg-green-100 text-green-800',
      'Warning': 'bg-yellow-100 text-yellow-800',
      'Overdue': 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const canEdit = () => {
    if (!caseData) return false;
    if (user.role === 'investigator' && caseData.investigator_id === user.id) {
      return true;
    }
    if (['kepala_divisi', 'kepala_departemen', 'superuser'].includes(user.role)) {
      return true;
    }
    return false;
  };

  // LOADING STATE
  if (loading) {
    return <LoadingSpinner text="Loading case detail..." />;
  }

  if (!caseData) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Case tidak ditemukan</h3>
          <p className="text-gray-600 mb-6">Case yang Anda cari tidak tersedia</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {caseData.nomor_tiket}
              </h1>
              <p className="text-gray-600">{caseData.subject_laporan || 'No Subject'}</p>
            </div>
            
            {canEdit() && (
              <button
                onClick={() => navigate(`/cases/${id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4" />
                Edit Case
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-2">Status Case</p>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(caseData.status_kasus)}`}>
                  {caseData.status_kasus}
                </span>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-2">Status SLA</p>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getSLABadge(caseData.status_sla)}`}>
                  {caseData.status_sla}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <div className="flex gap-4 px-6">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                      activeTab === 'details'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Detail Case
                  </button>
                  <button
                    onClick={() => setActiveTab('emails')}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                      activeTab === 'emails'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Thread Email ({caseData.email_threads?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                      activeTab === 'activity'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Log Aktivitas ({caseData.activity_logs?.length || 0})
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Detail Tab */}
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Tanggal Pelaporan</label>
                        <p className="mt-1 text-gray-900">{formatDate(caseData.tanggal_pelaporan)}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-600">Sumber Laporan</label>
                        <p className="mt-1 text-gray-900">{caseData.sumber_laporan}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">Email Pelapor</label>
                        <p className="mt-1 text-gray-900">{caseData.email_pelapor || '-'}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">SPD / Non SPD</label>
                        <p className="mt-1 text-gray-900">{caseData.spd_non_spd}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">Cabang</label>
                        <p className="mt-1 text-gray-900">{caseData.cabang}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">Kategori Kasus</label>
                        <p className="mt-1 text-gray-900">{caseData.kategori_kasus || '-'}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">Nama Debitur</label>
                        <p className="mt-1 text-gray-900">{caseData.nama_debitur || '-'}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">Nomor Agreement</label>
                        <p className="mt-1 text-gray-900">{caseData.nomor_agreement || '-'}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">Terlapor</label>
                        <p className="mt-1 text-gray-900">{caseData.terlapor || '-'}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">Jabatan Terlapor</label>
                        <p className="mt-1 text-gray-900">{caseData.jabatan_terlapor || '-'}</p>
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-600">Indikasi Kasus</label>
                        <p className="mt-1 text-gray-900">{caseData.indikasi_kasus || '-'}</p>
                      </div>

                      {caseData.note && (
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-600">Catatan</label>
                          <p className="mt-1 text-gray-900">{caseData.note}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Email Thread Tab */}
                {activeTab === 'emails' && (
                  <div className="space-y-4">
                    {caseData.email_threads?.length > 0 ? (
                      caseData.email_threads.map((email) => (
                        <div key={email.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Mail className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{email.email_from}</p>
                                <p className="text-sm text-gray-500">{formatDate(email.email_date)}</p>
                              </div>
                            </div>
                            {email.has_attachment && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {email.attachment_count} lampiran
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-2">{email.subject}</p>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{email.body}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Tidak ada email thread
                      </div>
                    )}
                  </div>
                )}

                {/* Activity Log Tab */}
                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    {caseData.activity_logs?.length > 0 ? (
                      <div className="relative">
                        {caseData.activity_logs.map((log, index) => (
                          <div key={log.id} className="relative pb-8">
                            {index !== caseData.activity_logs.length - 1 && (
                              <div className="absolute left-5 top-8 w-0.5 h-full bg-gray-200"></div>
                            )}
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{log.description}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {log.user ? `oleh ${log.user.nama_lengkap}` : 'System'} • {formatDate(log.created_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Tidak ada log aktivitas
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Case Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-600">Target Date</p>
                    <p className="font-medium text-gray-900">{formatDateShort(caseData.target_date)}</p>
                  </div>
                </div>

                {caseData.remaining_days !== undefined && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-gray-600">Sisa Hari</p>
                      <p className="font-medium text-gray-900">{caseData.remaining_days} hari kerja</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-600">Investigator</p>
                    <p className="font-medium text-gray-900">
                      {caseData.investigator?.nama_lengkap || 'Belum di-assign'}
                    </p>
                  </div>
                </div>

                {caseData.assigned_by && (
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-gray-600">Assigned By</p>
                      <p className="font-medium text-gray-900">{caseData.assigned_by.nama_lengkap}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-600">Total Email</p>
                    <p className="font-medium text-gray-900">{caseData.total_email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-600">SLA</p>
                    <p className="font-medium text-gray-900">{caseData.sla_hari} hari kerja</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-600">Fraud Status</p>
                    <p className="font-medium text-gray-900">{caseData.fraud_status || 'Belum ditentukan'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetail;