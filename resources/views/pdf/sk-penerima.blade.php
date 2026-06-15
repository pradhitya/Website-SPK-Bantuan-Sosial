<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Surat Keputusan Penerima Bansos</title>
    <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; margin: 2cm; }
        .kop-surat { text-align: center; border-bottom: 3px solid black; padding-bottom: 10px; margin-bottom: 20px; }
        .kop-surat h1 { font-size: 16pt; margin: 0; text-transform: uppercase; font-weight: bold; }
        .kop-surat h2 { font-size: 14pt; margin: 0; text-transform: uppercase; font-weight: bold; }
        .kop-surat p { font-size: 11pt; margin: 0; }
        .judul { text-align: center; margin-bottom: 20px; }
        .judul h3 { font-size: 14pt; margin: 0; text-decoration: underline; text-transform: uppercase; }
        .judul p { margin: 0; font-size: 11pt; }
        table.data { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px; font-size: 11pt; }
        table.data th, table.data td { border: 1px solid black; padding: 6px 10px; text-align: left; }
        table.data th { background-color: #f2f2f2; text-align: center; font-weight: bold; }
        .ttd { width: 300px; float: right; text-align: center; margin-top: 30px; }
        .ttd p { margin: 0; }
        .ttd .nama-kades { margin-top: 80px; font-weight: bold; text-decoration: underline; }
        .clear { clear: both; }
    </style>
</head>
<body>

    <div class="kop-surat">
        <h2>PEMERINTAH KABUPATEN BANDUNG</h2>
        <h2>KECAMATAN SUKAJADI</h2>
        <h1>DESA SUKAMAJU</h1>
        <p>Jl. Raya Sukamaju No. 123, Kec. Sukajadi, Kab. Bandung 40123</p>
    </div>

    <div class="judul">
        <h3>SURAT KEPUTUSAN KEPALA DESA SUKAMAJU</h3>
        <p>Nomor: 147 / SK / KDS-SKM / {{ date('Y') }}</p>
        <br>
        <p><strong>TENTANG</strong></p>
        <p><strong>PENETAPAN DAFTAR PENERIMA BANTUAN SOSIAL PERIODE {{ $periode }}</strong></p>
    </div>

    <div class="isi">
        <p>Berdasarkan hasil musyawarah dan perhitungan menggunakan Sistem Pendukung Keputusan (Metode SAW), Kepala Desa Sukamaju dengan ini memutuskan dan menetapkan daftar nama-nama warga yang berhak menerima Bantuan Sosial untuk periode <strong>{{ $periode }}</strong> sebagai berikut:</p>
    </div>

    <table class="data">
        <thead>
            <tr>
                <th width="5%">No</th>
                <th width="20%">NIK</th>
                <th width="35%">Nama Lengkap</th>
                <th width="40%">Alamat</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($layak as $index => $item)
            <tr>
                <td style="text-align: center;">{{ $index + 1 }}</td>
                <td>{{ $item->masyarakat->nik ?? '-' }}</td>
                <td>{{ $item->masyarakat->nama ?? '-' }}</td>
                <td>{{ $item->masyarakat->alamat ?? '-' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="4" style="text-align: center;">Belum ada data penerima yang layak pada periode ini.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="isi">
        <p>Demikian Surat Keputusan ini dibuat agar dapat dipergunakan sebagaimana mestinya. Segala hal yang berkaitan dengan penyaluran bantuan akan diatur kemudian hari.</p>
    </div>

    <div class="ttd">
        <p>Ditetapkan di : Sukamaju</p>
        <p>Pada tanggal  : {{ \Carbon\Carbon::now()->isoFormat('D MMMM Y') }}</p>
        <p>Kepala Desa Sukamaju</p>
        <div class="nama-kades">Bpk. Achmad Syarif, S.IP</div>
    </div>

    <div class="clear"></div>

</body>
</html>
