export type UserRole = 'admin' | 'kades';

export interface User {
  id: number;
  username: string;
  password: string;
  nama: string;
  jabatan: string;
  role: UserRole;
}

export interface Kriteria {
  id: number;
  kode: string;
  nama: string;
  atribut: 'Benefit' | 'Cost';
  bobot: number;
}

export interface SubKriteria {
  id: number;
  kriteriaId: number;
  nama: string;
  nilai: number;
}

export interface Keluarga {
  id: number;
  no_kk: string;
  alamat: string;
  rt_rw: string | null;
  kelurahan: string | null;
  kecamatan: string | null;
  wargas?: Warga[];
  kepala_keluarga?: Warga | null;
  created_at?: string;
}

export interface Warga {
  id: number;
  keluarga_id: number | null;
  nik: string;
  nama: string;
  jenis_kelamin: 'L' | 'P';
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  status_keluarga: 'Kepala Keluarga' | 'Istri' | 'Anak' | 'Orang Tua' | 'Lainnya';
  no_hp: string | null;
  pekerjaan: string | null;
  keterangan_khusus: string | null;
  usia: number | null;
  keluarga?: Keluarga | null;
  created_at?: string;
}

export interface Masyarakat {
  id: number;
  nik: string;
  nama: string;
  alamat: string;
  noHp: string;
  rtRw: string;
  tglDaftar: string;
  periode?: string;
  warga_id?: number | null;
  keluarga_id?: number | null;
  jenis_bantuan_id?: number | null;
}

export interface Penilaian {
  masyarakatId: number;
  kriteriaId: number;
  subKriteriaId: number;
  nilai: number;
}

export interface HasilSAWItem {
  id?: number;
  masyarakatId: number;
  periode: string;
  jenis_bantuan_id?: number;
  namaMasyarakat: string;
  alamat: string;
  noHp?: string;
  nilaiPerKriteria: Record<number, number>;
  normalisasi: Record<number, number>;
  nilaiAkhir: number;
  ranking: number;
  status: 'Layak' | 'Tidak Layak';
  status_approval?: 'pending' | 'disetujui' | 'ditolak';
  catatan?: string | null;
}

export interface JenisBantuan {
  id: number;
  nama_program: string;
  deskripsi: string | null;
  target_penerima?: 'keluarga' | 'individu';
  filter_target?: string | null;
  periode_evaluasi?: 'bulanan' | 'tahunan' | 'sekali';
}

export interface Sanggahan {
  id: number;
  warga_pelapor: string | null;
  nik_pelapor: string | null;
  no_hp_pelapor: string | null;
  warga_dilaporkan_id: number | null;
  nama_warga_dilaporkan: string | null;
  bantuan_id: number | null;
  periode: string | null;
  isi_sanggahan: string;
  bukti: string | null;
  status: 'baru' | 'diverifikasi_valid' | 'ditolak' | 'perlu_cek_lapangan';
  catatan_admin: string | null;
  tanggal_lapor: string;
  tanggal_verifikasi: string | null;
  diverifikasi_oleh: number | null;
  jenis_bantuan?: JenisBantuan;
  warga_dilaporkan?: Masyarakat;
  verifikator?: User;
  created_at?: string;
}

export interface KlaimBantuan {
  id: number;
  hasil_saw_id: number;
  kode_klaim: string;
  qr_code_url: string;
  status_klaim: 'belum_diambil' | 'sudah_diambil';
  tanggal_kirim_wa: string | null;
  status_kirim_wa: 'belum_dikirim' | 'terkirim' | 'gagal';
  pesan_wa: string | null;
  tanggal_diambil: string | null;
  diverifikasi_oleh: number | null;
  hasil_saw?: HasilSAWItem & { masyarakat?: Masyarakat; jenis_bantuan?: JenisBantuan };
  verifikator?: User;
  created_at?: string;
}

export interface AppData {
  jenisBantuan: JenisBantuan[];
  kriteria: Kriteria[];
  subKriteria: SubKriteria[];
  masyarakat: Masyarakat[];
  penilaian: Penilaian[];
  hasilSAW: HasilSAWItem[];
  approvedIds: Record<string, number[]>;
  kuotaBansos: number;
  activePeriode: string;
  activeJenisBantuanId: number | null;
  sawProcessed: boolean;
  sanggahans: Sanggahan[];
  klaimBantuans: KlaimBantuan[];
  wargas: Warga[];
  keluargas: Keluarga[];
  availablePeriods: string[];
  stats: {
    totalWarga: number;
    totalKeluarga: number;
    totalLansia: number;
    totalHamil: number;
  };
}

export const initialData: AppData = {
  jenisBantuan: [],
  kriteria: [],
  subKriteria: [],
  masyarakat: [],
  penilaian: [],
  hasilSAW: [],
  approvedIds: {},
  kuotaBansos: 8,
  activePeriode: '2026-06',
  activeJenisBantuanId: 1,
  sawProcessed: false,
  sanggahans: [],
  klaimBantuans: [],
  wargas: [],
  keluargas: [],
  availablePeriods: ['2026-06'],
  stats: {
    totalWarga: 0,
    totalKeluarga: 0,
    totalLansia: 0,
    totalHamil: 0,
  },
};
