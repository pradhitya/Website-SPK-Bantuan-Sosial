# Logical Record Structure (LRS) - SPK Bansos

Berikut adalah representasi LRS (Struktur Tabel Rekaman Logis) dari basis data aplikasi Sistem Pendukung Keputusan (SPK) Bantuan Sosial menggunakan metode SAW. 

Setiap kotak merepresentasikan tabel (Entitas) berserta tipe data dan kolom-kolomnya. Garis penghubung menunjukkan relasi antara tabel utama (Primary Key) dengan tabel terkait (Foreign Key).

```mermaid
erDiagram
    users {
        bigint id PK
        string username
        string nama
        string jabatan
        enum role "admin / kades"
        string password
        string remember_token
        timestamp created_at
        timestamp updated_at
    }

    kriterias {
        bigint id PK
        string kode_kriteria
        string nama_kriteria
        float bobot
        enum jenis "Benefit / Cost"
        timestamp created_at
        timestamp updated_at
    }

    sub_kriterias {
        bigint id PK
        bigint kriteria_id FK
        string nama_sub_kriteria
        float nilai
        timestamp created_at
        timestamp updated_at
    }

    masyarakats {
        bigint id PK
        string nik
        string nama
        string alamat
        string telepon
        string pekerjaan
        float penghasilan
        integer jumlah_tanggungan
        string periode
        timestamp created_at
        timestamp updated_at
    }

    penilaians {
        bigint id PK
        bigint masyarakat_id FK
        bigint kriteria_id FK
        bigint sub_kriteria_id FK
        float nilai
        timestamp created_at
        timestamp updated_at
    }

    hasil_s_a_w_s {
        bigint id PK
        bigint masyarakat_id FK
        float nilai_akhir
        integer ranking
        enum status "pending / approved / rejected"
        string periode
        text catatan
        timestamp created_at
        timestamp updated_at
    }

    settings {
        bigint id PK
        integer kuota_bansos
        string active_periode
        timestamp created_at
        timestamp updated_at
    }

    %% Definisi Relasi (Relationships)
    kriterias ||--o{ sub_kriterias : "mempunyai (1:N)"
    masyarakats ||--o{ penilaians : "dinilai dengan (1:N)"
    kriterias ||--o{ penilaians : "menjadi acuan (1:N)"
    sub_kriterias ||--o{ penilaians : "detail dari (1:N)"
    masyarakats ||--o| hasil_s_a_w_s : "mendapat hasil (1:1)"
```

### Penjelasan Relasi Tabel:
1. **`kriterias` ke `sub_kriterias` (One-to-Many):** Setiap Kriteria (contoh: Penghasilan) bisa memiliki banyak rentang Sub-Kriteria (contoh: < 1 Juta, 1-2 Juta).
2. **`masyarakats` ke `penilaians` (One-to-Many):** Satu warga (Masyarakat) akan memiliki banyak penilaian, masing-masing untuk setiap Kriteria yang ada.
3. **`kriterias` & `sub_kriterias` ke `penilaians` (One-to-Many):** Tabel Penilaian bertindak sebagai *Pivot/Junction Table* yang mencatat nilai spesifik warga berdasarkan parameter Sub-Kriteria dari sebuah Kriteria tertentu.
4. **`masyarakats` ke `hasil_s_a_w_s` (One-to-One):** Setiap warga yang divalidasi akan memiliki satu hasil perhitungan akhir SAW (beserta *ranking* dan status validasinya) per periode.
5. Tabel **`users`** dan **`settings`** saat ini berdiri mandiri (*independent*) digunakan untuk autentikasi sistem dan konfigurasi global.
