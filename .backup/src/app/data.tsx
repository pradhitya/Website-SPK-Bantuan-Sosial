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

export interface Masyarakat {
  id: number;
  nik: string;
  nama: string;
  alamat: string;
  noHp: string;
  rtRw: string;
  tglDaftar: string;
}

export interface Penilaian {
  masyarakatId: number;
  kriteriaId: number;
  subKriteriaId: number;
  nilai: number;
}

export interface HasilSAWItem {
  masyarakatId: number;
  namaMasyarakat: string;
  alamat: string;
  nilaiPerKriteria: Record<number, number>;
  normalisasi: Record<number, number>;
  nilaiAkhir: number;
  ranking: number;
  status: 'Layak' | 'Tidak Layak';
}

export interface AppData {
  kriteria: Kriteria[];
  subKriteria: SubKriteria[];
  masyarakat: Masyarakat[];
  penilaian: Penilaian[];
  hasilSAW: HasilSAWItem[];
  approvedIds: number[];
  kuotaBansos: number;
  sawProcessed: boolean;
}

export const USERS: User[] = [
  { id: 1, username: 'admin', password: 'admin123', nama: 'Ahmad Yusuf, S.Kom', jabatan: 'Operator Sistem', role: 'admin' },
  { id: 2, username: 'kades', password: 'kades123', nama: 'H. Suryanto', jabatan: 'Kepala Desa Sukamaju', role: 'kades' },
];

export const initialKriteria: Kriteria[] = [
  { id: 1, kode: 'C1', nama: 'Penghasilan per Bulan', atribut: 'Cost', bobot: 20 },
  { id: 2, kode: 'C2', nama: 'Jumlah Tanggungan Keluarga', atribut: 'Benefit', bobot: 15 },
  { id: 3, kode: 'C3', nama: 'Status Kepemilikan Rumah', atribut: 'Cost', bobot: 15 },
  { id: 4, kode: 'C4', nama: 'Tingkat Pendidikan Terakhir', atribut: 'Cost', bobot: 10 },
  { id: 5, kode: 'C5', nama: 'Kondisi Fisik Rumah', atribut: 'Cost', bobot: 10 },
  { id: 6, kode: 'C6', nama: 'Status Pekerjaan', atribut: 'Cost', bobot: 10 },
  { id: 7, kode: 'C7', nama: 'Akses Listrik', atribut: 'Cost', bobot: 5 },
  { id: 8, kode: 'C8', nama: 'Akses Air Bersih', atribut: 'Cost', bobot: 5 },
  { id: 9, kode: 'C9', nama: 'Kepemilikan Lahan/Tanah', atribut: 'Cost', bobot: 5 },
  { id: 10, kode: 'C10', nama: 'Kepemilikan Kendaraan', atribut: 'Cost', bobot: 5 },
];

export const initialSubKriteria: SubKriteria[] = [
  { id: 1, kriteriaId: 1, nama: '< Rp 500.000', nilai: 1 },
  { id: 2, kriteriaId: 1, nama: 'Rp 500.001 – Rp 1.000.000', nilai: 2 },
  { id: 3, kriteriaId: 1, nama: 'Rp 1.000.001 – Rp 2.000.000', nilai: 3 },
  { id: 4, kriteriaId: 1, nama: 'Rp 2.000.001 – Rp 3.500.000', nilai: 4 },
  { id: 5, kriteriaId: 1, nama: '> Rp 3.500.000', nilai: 5 },
  { id: 6, kriteriaId: 2, nama: '1 Orang', nilai: 1 },
  { id: 7, kriteriaId: 2, nama: '2 Orang', nilai: 2 },
  { id: 8, kriteriaId: 2, nama: '3 Orang', nilai: 3 },
  { id: 9, kriteriaId: 2, nama: '4 Orang', nilai: 4 },
  { id: 10, kriteriaId: 2, nama: '≥ 5 Orang', nilai: 5 },
  { id: 11, kriteriaId: 3, nama: 'Milik Sendiri', nilai: 1 },
  { id: 12, kriteriaId: 3, nama: 'Sewa / Kontrak', nilai: 2 },
  { id: 13, kriteriaId: 3, nama: 'Menumpang', nilai: 3 },
  { id: 14, kriteriaId: 3, nama: 'Tanpa Tempat Tinggal', nilai: 4 },
  { id: 15, kriteriaId: 4, nama: 'Sarjana (S1/S2/S3)', nilai: 1 },
  { id: 16, kriteriaId: 4, nama: 'SMA / Sederajat', nilai: 2 },
  { id: 17, kriteriaId: 4, nama: 'SMP / Sederajat', nilai: 3 },
  { id: 18, kriteriaId: 4, nama: 'SD / Sederajat', nilai: 4 },
  { id: 19, kriteriaId: 4, nama: 'Tidak Sekolah', nilai: 5 },
  { id: 20, kriteriaId: 5, nama: 'Permanen (Layak Huni)', nilai: 1 },
  { id: 21, kriteriaId: 5, nama: 'Semi Permanen', nilai: 2 },
  { id: 22, kriteriaId: 5, nama: 'Darurat / Tidak Layak Huni', nilai: 3 },
  { id: 23, kriteriaId: 6, nama: 'PNS / TNI / Polri', nilai: 1 },
  { id: 24, kriteriaId: 6, nama: 'Karyawan Swasta', nilai: 2 },
  { id: 25, kriteriaId: 6, nama: 'Wiraswasta / Pedagang', nilai: 3 },
  { id: 26, kriteriaId: 6, nama: 'Buruh Harian Lepas', nilai: 4 },
  { id: 27, kriteriaId: 6, nama: 'Tidak Bekerja / Pengangguran', nilai: 5 },
  { id: 28, kriteriaId: 7, nama: 'Listrik PLN Mandiri', nilai: 1 },
  { id: 29, kriteriaId: 7, nama: 'Listrik Bersama / Numpang', nilai: 2 },
  { id: 30, kriteriaId: 7, nama: 'Tidak Ada Listrik', nilai: 3 },
  { id: 31, kriteriaId: 8, nama: 'Air PDAM / Ledeng', nilai: 1 },
  { id: 32, kriteriaId: 8, nama: 'Sumur / Pompa Tangan', nilai: 2 },
  { id: 33, kriteriaId: 8, nama: 'Sungai / Tidak Layak', nilai: 3 },
  { id: 34, kriteriaId: 9, nama: 'Memiliki > 1 Bidang Tanah', nilai: 1 },
  { id: 35, kriteriaId: 9, nama: 'Memiliki 1 Bidang Tanah', nilai: 2 },
  { id: 36, kriteriaId: 9, nama: 'Tidak Memiliki Tanah', nilai: 3 },
  { id: 37, kriteriaId: 10, nama: 'Memiliki > 2 Kendaraan', nilai: 1 },
  { id: 38, kriteriaId: 10, nama: 'Memiliki 1–2 Kendaraan', nilai: 2 },
  { id: 39, kriteriaId: 10, nama: 'Tidak Memiliki Kendaraan', nilai: 3 },
];

export const initialMasyarakat: Masyarakat[] = [
  { id: 1, nik: '3271010101800001', nama: 'Budi Santoso', alamat: 'Jl. Merdeka No. 12 RT 01/RW 02', noHp: '081234567890', rtRw: '01/02', tglDaftar: '2025-01-05' },
  { id: 2, nik: '3271010202850002', nama: 'Siti Rahayu', alamat: 'Jl. Mawar No. 5 RT 02/RW 01', noHp: '082345678901', rtRw: '02/01', tglDaftar: '2025-01-06' },
  { id: 3, nik: '3271010303790003', nama: 'Ahmad Fauzi', alamat: 'Jl. Kenanga No. 8 RT 03/RW 02', noHp: '083456789012', rtRw: '03/02', tglDaftar: '2025-01-07' },
  { id: 4, nik: '3271010404900004', nama: 'Dewi Lestari', alamat: 'Jl. Melati No. 3 RT 01/RW 03', noHp: '084567890123', rtRw: '01/03', tglDaftar: '2025-01-08' },
  { id: 5, nik: '3271010505750005', nama: 'Suparman', alamat: 'Jl. Anggrek No. 17 RT 04/RW 01', noHp: '085678901234', rtRw: '04/01', tglDaftar: '2025-01-09' },
  { id: 6, nik: '3271010606880006', nama: 'Ratna Wulandari', alamat: 'Jl. Dahlia No. 22 RT 02/RW 04', noHp: '086789012345', rtRw: '02/04', tglDaftar: '2025-01-10' },
  { id: 7, nik: '3271010707820007', nama: 'Hendra Wijaya', alamat: 'Jl. Flamboyan No. 9 RT 03/RW 03', noHp: '087890123456', rtRw: '03/03', tglDaftar: '2025-01-11' },
  { id: 8, nik: '3271010808910008', nama: 'Fatimah', alamat: 'Jl. Cempaka No. 1 RT 05/RW 02', noHp: '088901234567', rtRw: '05/02', tglDaftar: '2025-01-12' },
  { id: 9, nik: '3271010909770009', nama: 'Agus Setiawan', alamat: 'Jl. Teratai No. 15 RT 01/RW 05', noHp: '089012345678', rtRw: '01/05', tglDaftar: '2025-01-13' },
  { id: 10, nik: '3271011010860010', nama: 'Sri Mulyani', alamat: 'Jl. Kamboja No. 7 RT 04/RW 03', noHp: '081123456789', rtRw: '04/03', tglDaftar: '2025-01-14' },
  { id: 11, nik: '3271011111830011', nama: 'Joko Susilo', alamat: 'Jl. Seruni No. 11 RT 02/RW 05', noHp: '082234567890', rtRw: '02/05', tglDaftar: '2025-01-15' },
  { id: 12, nik: '3271011212920012', nama: 'Maryati', alamat: 'Jl. Tulip No. 4 RT 05/RW 04', noHp: '083345678901', rtRw: '05/04', tglDaftar: '2025-01-16' },
  { id: 13, nik: '3271011313780013', nama: 'Bambang Purnomo', alamat: 'Jl. Pahlawan No. 19 RT 03/RW 01', noHp: '084456789012', rtRw: '03/01', tglDaftar: '2025-01-17' },
  { id: 14, nik: '3271011414890014', nama: 'Eni Suryani', alamat: 'Jl. Sejahtera No. 6 RT 06/RW 02', noHp: '085567890123', rtRw: '06/02', tglDaftar: '2025-01-18' },
  { id: 15, nik: '3271011515810015', nama: 'Wahyu Prasetyo', alamat: 'Jl. Damai No. 13 RT 04/RW 04', noHp: '086678901234', rtRw: '04/04', tglDaftar: '2025-01-19' },
];

export const initialPenilaian: Penilaian[] = [
  // Budi Santoso
  { masyarakatId: 1, kriteriaId: 1, subKriteriaId: 2, nilai: 2 },
  { masyarakatId: 1, kriteriaId: 2, subKriteriaId: 9, nilai: 4 },
  { masyarakatId: 1, kriteriaId: 3, subKriteriaId: 12, nilai: 2 },
  { masyarakatId: 1, kriteriaId: 4, subKriteriaId: 18, nilai: 4 },
  { masyarakatId: 1, kriteriaId: 5, subKriteriaId: 21, nilai: 2 },
  { masyarakatId: 1, kriteriaId: 6, subKriteriaId: 26, nilai: 4 },
  { masyarakatId: 1, kriteriaId: 7, subKriteriaId: 29, nilai: 2 },
  { masyarakatId: 1, kriteriaId: 8, subKriteriaId: 32, nilai: 2 },
  { masyarakatId: 1, kriteriaId: 9, subKriteriaId: 36, nilai: 3 },
  { masyarakatId: 1, kriteriaId: 10, subKriteriaId: 39, nilai: 3 },
  // Siti Rahayu
  { masyarakatId: 2, kriteriaId: 1, subKriteriaId: 1, nilai: 1 },
  { masyarakatId: 2, kriteriaId: 2, subKriteriaId: 10, nilai: 5 },
  { masyarakatId: 2, kriteriaId: 3, subKriteriaId: 13, nilai: 3 },
  { masyarakatId: 2, kriteriaId: 4, subKriteriaId: 19, nilai: 5 },
  { masyarakatId: 2, kriteriaId: 5, subKriteriaId: 22, nilai: 3 },
  { masyarakatId: 2, kriteriaId: 6, subKriteriaId: 27, nilai: 5 },
  { masyarakatId: 2, kriteriaId: 7, subKriteriaId: 30, nilai: 3 },
  { masyarakatId: 2, kriteriaId: 8, subKriteriaId: 33, nilai: 3 },
  { masyarakatId: 2, kriteriaId: 9, subKriteriaId: 36, nilai: 3 },
  { masyarakatId: 2, kriteriaId: 10, subKriteriaId: 39, nilai: 3 },
  // Ahmad Fauzi
  { masyarakatId: 3, kriteriaId: 1, subKriteriaId: 3, nilai: 3 },
  { masyarakatId: 3, kriteriaId: 2, subKriteriaId: 8, nilai: 3 },
  { masyarakatId: 3, kriteriaId: 3, subKriteriaId: 11, nilai: 1 },
  { masyarakatId: 3, kriteriaId: 4, subKriteriaId: 17, nilai: 3 },
  { masyarakatId: 3, kriteriaId: 5, subKriteriaId: 21, nilai: 2 },
  { masyarakatId: 3, kriteriaId: 6, subKriteriaId: 25, nilai: 3 },
  { masyarakatId: 3, kriteriaId: 7, subKriteriaId: 28, nilai: 1 },
  { masyarakatId: 3, kriteriaId: 8, subKriteriaId: 32, nilai: 2 },
  { masyarakatId: 3, kriteriaId: 9, subKriteriaId: 35, nilai: 2 },
  { masyarakatId: 3, kriteriaId: 10, subKriteriaId: 38, nilai: 2 },
  // Dewi Lestari
  { masyarakatId: 4, kriteriaId: 1, subKriteriaId: 2, nilai: 2 },
  { masyarakatId: 4, kriteriaId: 2, subKriteriaId: 10, nilai: 5 },
  { masyarakatId: 4, kriteriaId: 3, subKriteriaId: 12, nilai: 2 },
  { masyarakatId: 4, kriteriaId: 4, subKriteriaId: 18, nilai: 4 },
  { masyarakatId: 4, kriteriaId: 5, subKriteriaId: 22, nilai: 3 },
  { masyarakatId: 4, kriteriaId: 6, subKriteriaId: 27, nilai: 5 },
  { masyarakatId: 4, kriteriaId: 7, subKriteriaId: 29, nilai: 2 },
  { masyarakatId: 4, kriteriaId: 8, subKriteriaId: 32, nilai: 2 },
  { masyarakatId: 4, kriteriaId: 9, subKriteriaId: 36, nilai: 3 },
  { masyarakatId: 4, kriteriaId: 10, subKriteriaId: 39, nilai: 3 },
  // Suparman
  { masyarakatId: 5, kriteriaId: 1, subKriteriaId: 1, nilai: 1 },
  { masyarakatId: 5, kriteriaId: 2, subKriteriaId: 10, nilai: 5 },
  { masyarakatId: 5, kriteriaId: 3, subKriteriaId: 14, nilai: 4 },
  { masyarakatId: 5, kriteriaId: 4, subKriteriaId: 19, nilai: 5 },
  { masyarakatId: 5, kriteriaId: 5, subKriteriaId: 22, nilai: 3 },
  { masyarakatId: 5, kriteriaId: 6, subKriteriaId: 27, nilai: 5 },
  { masyarakatId: 5, kriteriaId: 7, subKriteriaId: 30, nilai: 3 },
  { masyarakatId: 5, kriteriaId: 8, subKriteriaId: 33, nilai: 3 },
  { masyarakatId: 5, kriteriaId: 9, subKriteriaId: 36, nilai: 3 },
  { masyarakatId: 5, kriteriaId: 10, subKriteriaId: 39, nilai: 3 },
  // Ratna Wulandari
  { masyarakatId: 6, kriteriaId: 1, subKriteriaId: 2, nilai: 2 },
  { masyarakatId: 6, kriteriaId: 2, subKriteriaId: 9, nilai: 4 },
  { masyarakatId: 6, kriteriaId: 3, subKriteriaId: 13, nilai: 3 },
  { masyarakatId: 6, kriteriaId: 4, subKriteriaId: 17, nilai: 3 },
  { masyarakatId: 6, kriteriaId: 5, subKriteriaId: 21, nilai: 2 },
  { masyarakatId: 6, kriteriaId: 6, subKriteriaId: 26, nilai: 4 },
  { masyarakatId: 6, kriteriaId: 7, subKriteriaId: 29, nilai: 2 },
  { masyarakatId: 6, kriteriaId: 8, subKriteriaId: 32, nilai: 2 },
  { masyarakatId: 6, kriteriaId: 9, subKriteriaId: 36, nilai: 3 },
  { masyarakatId: 6, kriteriaId: 10, subKriteriaId: 39, nilai: 3 },
  // Hendra Wijaya
  { masyarakatId: 7, kriteriaId: 1, subKriteriaId: 4, nilai: 4 },
  { masyarakatId: 7, kriteriaId: 2, subKriteriaId: 7, nilai: 2 },
  { masyarakatId: 7, kriteriaId: 3, subKriteriaId: 11, nilai: 1 },
  { masyarakatId: 7, kriteriaId: 4, subKriteriaId: 16, nilai: 2 },
  { masyarakatId: 7, kriteriaId: 5, subKriteriaId: 20, nilai: 1 },
  { masyarakatId: 7, kriteriaId: 6, subKriteriaId: 24, nilai: 2 },
  { masyarakatId: 7, kriteriaId: 7, subKriteriaId: 28, nilai: 1 },
  { masyarakatId: 7, kriteriaId: 8, subKriteriaId: 31, nilai: 1 },
  { masyarakatId: 7, kriteriaId: 9, subKriteriaId: 35, nilai: 2 },
  { masyarakatId: 7, kriteriaId: 10, subKriteriaId: 38, nilai: 2 },
  // Fatimah
  { masyarakatId: 8, kriteriaId: 1, subKriteriaId: 1, nilai: 1 },
  { masyarakatId: 8, kriteriaId: 2, subKriteriaId: 10, nilai: 5 },
  { masyarakatId: 8, kriteriaId: 3, subKriteriaId: 13, nilai: 3 },
  { masyarakatId: 8, kriteriaId: 4, subKriteriaId: 18, nilai: 4 },
  { masyarakatId: 8, kriteriaId: 5, subKriteriaId: 22, nilai: 3 },
  { masyarakatId: 8, kriteriaId: 6, subKriteriaId: 27, nilai: 5 },
  { masyarakatId: 8, kriteriaId: 7, subKriteriaId: 30, nilai: 3 },
  { masyarakatId: 8, kriteriaId: 8, subKriteriaId: 33, nilai: 3 },
  { masyarakatId: 8, kriteriaId: 9, subKriteriaId: 36, nilai: 3 },
  { masyarakatId: 8, kriteriaId: 10, subKriteriaId: 39, nilai: 3 },
  // Agus Setiawan
  { masyarakatId: 9, kriteriaId: 1, subKriteriaId: 3, nilai: 3 },
  { masyarakatId: 9, kriteriaId: 2, subKriteriaId: 8, nilai: 3 },
  { masyarakatId: 9, kriteriaId: 3, subKriteriaId: 12, nilai: 2 },
  { masyarakatId: 9, kriteriaId: 4, subKriteriaId: 16, nilai: 2 },
  { masyarakatId: 9, kriteriaId: 5, subKriteriaId: 21, nilai: 2 },
  { masyarakatId: 9, kriteriaId: 6, subKriteriaId: 25, nilai: 3 },
  { masyarakatId: 9, kriteriaId: 7, subKriteriaId: 28, nilai: 1 },
  { masyarakatId: 9, kriteriaId: 8, subKriteriaId: 31, nilai: 1 },
  { masyarakatId: 9, kriteriaId: 9, subKriteriaId: 36, nilai: 3 },
  { masyarakatId: 9, kriteriaId: 10, subKriteriaId: 38, nilai: 2 },
  // Sri Mulyani
  { masyarakatId: 10, kriteriaId: 1, subKriteriaId: 1, nilai: 1 },
  { masyarakatId: 10, kriteriaId: 2, subKriteriaId: 9, nilai: 4 },
  { masyarakatId: 10, kriteriaId: 3, subKriteriaId: 13, nilai: 3 },
  { masyarakatId: 10, kriteriaId: 4, subKriteriaId: 17, nilai: 3 },
  { masyarakatId: 10, kriteriaId: 5, subKriteriaId: 22, nilai: 3 },
  { masyarakatId: 10, kriteriaId: 6, subKriteriaId: 26, nilai: 4 },
  { masyarakatId: 10, kriteriaId: 7, subKriteriaId: 29, nilai: 2 },
  { masyarakatId: 10, kriteriaId: 8, subKriteriaId: 32, nilai: 2 },
  { masyarakatId: 10, kriteriaId: 9, subKriteriaId: 36, nilai: 3 },
  { masyarakatId: 10, kriteriaId: 10, subKriteriaId: 39, nilai: 3 },
  // Joko Susilo
  { masyarakatId: 11, kriteriaId: 1, subKriteriaId: 3, nilai: 3 },
  { masyarakatId: 11, kriteriaId: 2, subKriteriaId: 7, nilai: 2 },
  { masyarakatId: 11, kriteriaId: 3, subKriteriaId: 11, nilai: 1 },
  { masyarakatId: 11, kriteriaId: 4, subKriteriaId: 16, nilai: 2 },
  { masyarakatId: 11, kriteriaId: 5, subKriteriaId: 20, nilai: 1 },
  { masyarakatId: 11, kriteriaId: 6, subKriteriaId: 25, nilai: 3 },
  { masyarakatId: 11, kriteriaId: 7, subKriteriaId: 28, nilai: 1 },
  { masyarakatId: 11, kriteriaId: 8, subKriteriaId: 31, nilai: 1 },
  { masyarakatId: 11, kriteriaId: 9, subKriteriaId: 35, nilai: 2 },
  { masyarakatId: 11, kriteriaId: 10, subKriteriaId: 38, nilai: 2 },
  // Maryati
  { masyarakatId: 12, kriteriaId: 1, subKriteriaId: 1, nilai: 1 },
  { masyarakatId: 12, kriteriaId: 2, subKriteriaId: 10, nilai: 5 },
  { masyarakatId: 12, kriteriaId: 3, subKriteriaId: 13, nilai: 3 },
  { masyarakatId: 12, kriteriaId: 4, subKriteriaId: 18, nilai: 4 },
  { masyarakatId: 12, kriteriaId: 5, subKriteriaId: 22, nilai: 3 },
  { masyarakatId: 12, kriteriaId: 6, subKriteriaId: 26, nilai: 4 },
  { masyarakatId: 12, kriteriaId: 7, subKriteriaId: 30, nilai: 3 },
  { masyarakatId: 12, kriteriaId: 8, subKriteriaId: 33, nilai: 3 },
  { masyarakatId: 12, kriteriaId: 9, subKriteriaId: 36, nilai: 3 },
  { masyarakatId: 12, kriteriaId: 10, subKriteriaId: 39, nilai: 3 },
  // Bambang Purnomo
  { masyarakatId: 13, kriteriaId: 1, subKriteriaId: 2, nilai: 2 },
  { masyarakatId: 13, kriteriaId: 2, subKriteriaId: 9, nilai: 4 },
  { masyarakatId: 13, kriteriaId: 3, subKriteriaId: 12, nilai: 2 },
  { masyarakatId: 13, kriteriaId: 4, subKriteriaId: 17, nilai: 3 },
  { masyarakatId: 13, kriteriaId: 5, subKriteriaId: 21, nilai: 2 },
  { masyarakatId: 13, kriteriaId: 6, subKriteriaId: 26, nilai: 4 },
  { masyarakatId: 13, kriteriaId: 7, subKriteriaId: 28, nilai: 1 },
  { masyarakatId: 13, kriteriaId: 8, subKriteriaId: 32, nilai: 2 },
  { masyarakatId: 13, kriteriaId: 9, subKriteriaId: 36, nilai: 3 },
  { masyarakatId: 13, kriteriaId: 10, subKriteriaId: 38, nilai: 2 },
  // Eni Suryani
  { masyarakatId: 14, kriteriaId: 1, subKriteriaId: 2, nilai: 2 },
  { masyarakatId: 14, kriteriaId: 2, subKriteriaId: 9, nilai: 4 },
  { masyarakatId: 14, kriteriaId: 3, subKriteriaId: 13, nilai: 3 },
  { masyarakatId: 14, kriteriaId: 4, subKriteriaId: 18, nilai: 4 },
  { masyarakatId: 14, kriteriaId: 5, subKriteriaId: 21, nilai: 2 },
  { masyarakatId: 14, kriteriaId: 6, subKriteriaId: 27, nilai: 5 },
  { masyarakatId: 14, kriteriaId: 7, subKriteriaId: 29, nilai: 2 },
  { masyarakatId: 14, kriteriaId: 8, subKriteriaId: 32, nilai: 2 },
  { masyarakatId: 14, kriteriaId: 9, subKriteriaId: 36, nilai: 3 },
  { masyarakatId: 14, kriteriaId: 10, subKriteriaId: 39, nilai: 3 },
  // Wahyu Prasetyo
  { masyarakatId: 15, kriteriaId: 1, subKriteriaId: 4, nilai: 4 },
  { masyarakatId: 15, kriteriaId: 2, subKriteriaId: 7, nilai: 2 },
  { masyarakatId: 15, kriteriaId: 3, subKriteriaId: 11, nilai: 1 },
  { masyarakatId: 15, kriteriaId: 4, subKriteriaId: 15, nilai: 1 },
  { masyarakatId: 15, kriteriaId: 5, subKriteriaId: 20, nilai: 1 },
  { masyarakatId: 15, kriteriaId: 6, subKriteriaId: 24, nilai: 2 },
  { masyarakatId: 15, kriteriaId: 7, subKriteriaId: 28, nilai: 1 },
  { masyarakatId: 15, kriteriaId: 8, subKriteriaId: 31, nilai: 1 },
  { masyarakatId: 15, kriteriaId: 9, subKriteriaId: 35, nilai: 2 },
  { masyarakatId: 15, kriteriaId: 10, subKriteriaId: 38, nilai: 2 },
];

export function calculateSAW(
  masyarakat: Masyarakat[],
  penilaian: Penilaian[],
  kriteria: Kriteria[],
  kuota: number
): HasilSAWItem[] {
  const matrix: Record<number, Record<number, number>> = {};
  for (const m of masyarakat) {
    matrix[m.id] = {};
    for (const k of kriteria) {
      const p = penilaian.find(p => p.masyarakatId === m.id && p.kriteriaId === k.id);
      matrix[m.id][k.id] = p ? p.nilai : 0;
    }
  }

  const normalized: Record<number, Record<number, number>> = {};
  for (const k of kriteria) {
    const vals = masyarakat.map(m => matrix[m.id][k.id]).filter(v => v > 0);
    const maxVal = vals.length ? Math.max(...vals) : 1;
    const minVal = vals.length ? Math.min(...vals) : 1;
    for (const m of masyarakat) {
      if (!normalized[m.id]) normalized[m.id] = {};
      const xij = matrix[m.id][k.id];
      if (xij === 0) {
        normalized[m.id][k.id] = 0;
      } else if (k.atribut === 'Benefit') {
        normalized[m.id][k.id] = parseFloat((xij / maxVal).toFixed(4));
      } else {
        normalized[m.id][k.id] = parseFloat((minVal / xij).toFixed(4));
      }
    }
  }

  const results: HasilSAWItem[] = masyarakat.map(m => {
    let nilaiAkhir = 0;
    for (const k of kriteria) {
      nilaiAkhir += (k.bobot / 100) * (normalized[m.id][k.id] || 0);
    }
    return {
      masyarakatId: m.id,
      namaMasyarakat: m.nama,
      alamat: m.alamat,
      nilaiPerKriteria: matrix[m.id],
      normalisasi: normalized[m.id],
      nilaiAkhir: parseFloat(nilaiAkhir.toFixed(4)),
      ranking: 0,
      status: 'Tidak Layak' as const,
    };
  });

  results.sort((a, b) => b.nilaiAkhir - a.nilaiAkhir);
  results.forEach((r, i) => {
    r.ranking = i + 1;
    r.status = r.ranking <= kuota ? 'Layak' : 'Tidak Layak';
  });

  return results;
}

export const initialData: AppData = {
  kriteria: initialKriteria,
  subKriteria: initialSubKriteria,
  masyarakat: initialMasyarakat,
  penilaian: initialPenilaian,
  hasilSAW: [],
  approvedIds: [],
  kuotaBansos: 8,
  sawProcessed: false,
};
