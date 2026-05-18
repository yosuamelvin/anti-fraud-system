import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { casesAPI } from '../services/api';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateCase = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    tanggal_pelaporan: new Date().toISOString().split('T')[0],
    sumber_laporan: 'Manual Input',
    email_pelapor: '',
    subject_laporan: '',
    spd_non_spd: 'Non SPD',
    cabang: 'Head Office',
    nama_debitur: '',
    nomor_agreement: '',
    terlapor: '',
    jabatan_terlapor: '',
    indikasi_kasus: '',
    kategori_kasus: 'Manipulation',
    note: ''
  });

  const spdLocations = [
    'Semarang', 'Purwokerto', 'Jogja', 'Tegal', 'Kudus', 'Solo',
    'Banjarmasin', 'Balikpapan', 'Samarinda', 'Pontianak',
    'Surabaya', 'Kediri', 'Malang', 'Denpasar',
    'Manado', 'Makassar', 'Kendari',
    'Palembang', 'Medan', 'Pekanbaru', 'Jambi', 'Lampung',
    'Bandung', 'Sukabumi', 'Cirebon'
  ];

  const nonSpdLocations = [
    'Head Office', 'Kalimalang', 'Depok', 'Kelapa Gading',
    'Fatmawati', 'Tangerang Selatan', 'Karawang'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-update cabang options when SPD/Non SPD changes
    if (name === 'spd_non_spd') {
      setFormData(prev => ({
        ...prev,
        spd_non_spd: value,
        cabang: value === 'SPD' ? spdLocations[0] : nonSpdLocations[0]
      }));
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await casesAPI.create(formData);
    const caseId = response.data.data.id;
    
    // Show success toast
    toast.success('Case berhasil dibuat!');
    
    // Redirect to case detail
    navigate(`/cases/${caseId}`);
  } catch (error) {
    console.error('Error creating case:', error);
    const errorMsg = error.response?.data?.message || 'Gagal membuat case';
    setError(errorMsg);
    toast.error(errorMsg);
  } finally {
    setLoading(false);
  }
  };

  const cabangOptions = formData.spd_non_spd === 'SPD' ? spdLocations : nonSpdLocations;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </button>

          <h1 className="text-2xl font-bold text-gray-900">Buat Case Baru</h1>
          <p className="text-sm text-gray-500 mt-1">
            Input manual untuk case investigasi
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Section 1: Informasi Dasar */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Pelaporan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="tanggal_pelaporan"
                  value={formData.tanggal_pelaporan}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sumber Laporan
                </label>
                <input
                  type="text"
                  name="sumber_laporan"
                  value={formData.sumber_laporan}
                  onChange={handleChange}
                  placeholder="Telepon, Walk-in, Email, dll"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Pelapor
                </label>
                <input
                  type="email"
                  name="email_pelapor"
                  value={formData.email_pelapor}
                  onChange={handleChange}
                  placeholder="pelapor@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori Kasus
                </label>
                <select
                  name="kategori_kasus"
                  value={formData.kategori_kasus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Manipulation">Manipulation</option>
                  <option value="Kode Etik/Kesalahan Prosedur">Kode Etik/Kesalahan Prosedur</option>
                  <option value="Embezzlement">Embezzlement</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Laporan
                </label>
                <input
                  type="text"
                  name="subject_laporan"
                  value={formData.subject_laporan}
                  onChange={handleChange}
                  placeholder="Ringkasan singkat case"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Lokasi */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lokasi & Area</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SPD / Non SPD <span className="text-red-500">*</span>
                </label>
                <select
                  name="spd_non_spd"
                  value={formData.spd_non_spd}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="SPD">SPD</option>
                  <option value="Non SPD">Non SPD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cabang <span className="text-red-500">*</span>
                </label>
                <select
                  name="cabang"
                  value={formData.cabang}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {cabangOptions.map(location => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Detail Case */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Case</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Debitur
                </label>
                <input
                  type="text"
                  name="nama_debitur"
                  value={formData.nama_debitur}
                  onChange={handleChange}
                  placeholder="PT Contoh Indonesia"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Agreement
                </label>
                <input
                  type="text"
                  name="nomor_agreement"
                  value={formData.nomor_agreement}
                  onChange={handleChange}
                  placeholder="AGR-2026-XXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Terlapor
                </label>
                <input
                  type="text"
                  name="terlapor"
                  value={formData.terlapor}
                  onChange={handleChange}
                  placeholder="Nama terlapor"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jabatan Terlapor
                </label>
                <input
                  type="text"
                  name="jabatan_terlapor"
                  value={formData.jabatan_terlapor}
                  onChange={handleChange}
                  placeholder="Credit Analyst, Branch Manager, dll"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Indikasi Kasus
                </label>
                <textarea
                  name="indikasi_kasus"
                  value={formData.indikasi_kasus}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Deskripsi detail tentang indikasi kasus yang ditemukan..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Catatan tambahan atau instruksi khusus..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 pt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Menyimpan...' : 'Simpan Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCase;