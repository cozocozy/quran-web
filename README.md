# 📖 Al-Quran Web — Baca & Dengarkan Al-Quran

Aplikasi web untuk membaca dan mendengarkan Al-Quran 114 surah lengkap dengan terjemahan Bahasa Indonesia, dilengkapi fitur bookmark, pencarian, dan pengaturan tampilan yang bisa disesuaikan pengguna.

🔗 **Live Demo:** [read-quran-daily.netlify.app](https://read-quran-daily.netlify.app/)
📂 **Repository:** [github.com/cozocozy/quran-web](https://github.com/cozocozy/quran-web)

---

## ✨ Fitur Utama

- **114 Surah Lengkap** — Seluruh surah Al-Quran tersedia beserta info Makkiyah/Madaniyah dan jumlah ayat.
- **Teks Arab + Terjemahan** — Setiap ayat ditampilkan dengan teks Arab (Uthmani script) dan terjemahan Bahasa Indonesia per ayat, lengkap dengan info Juz dan halaman mushaf.
- **Mode Tampilan Fleksibel** — Toggle antara mode "Arab + Indonesia", "Arab saja", atau "Terjemahan saja" sesuai preferensi baca.
- **Audio Murottal** — Dengarkan bacaan Al-Quran langsung dari aplikasi.
- **Pencarian** — Cari surah atau ayat dengan cepat.
- **Bookmark** — Simpan dan lacak posisi terakhir dibaca.
- **Progress Tracking** — Melacak progres bacaan harian pengguna.
- **Pengaturan (Settings)** — Kustomisasi tampilan sesuai kebutuhan pengguna.
- **Responsive & Mobile-Friendly** — Dioptimalkan untuk dibuka di perangkat mobile maupun desktop.
- **SEO-Friendly** — Meta tag (Open Graph, Twitter Card, deskripsi) sudah dikonfigurasi untuk preview yang rapi saat dibagikan.

---

## 🛠️ Tech Stack

> *Sesuaikan bagian ini dengan stack yang benar-benar kamu pakai.*

| Kategori | Teknologi |
|---|---|
| Framework | Next.js |
| Styling | _(isi: Tailwind CSS / CSS Modules / dll)_ |
| Sumber Data Quran | _(isi: API yang digunakan, misal Al-Quran Cloud API / EQuran.id / data lokal)_ |
| Hosting/Deployment | Netlify |
| Bahasa Pemrograman | JavaScript/TypeScript |

---

## 📁 Struktur Project

```
quran-web/
├── pages/ atau app/       # Routing halaman (Beranda, Surah, Search, Bookmark, Settings)
├── components/            # Komponen UI reusable
├── public/                 # Aset statis
├── styles/                 # Styling global
└── README.md
```

> *Sesuaikan struktur di atas dengan struktur folder aktual di repository.*

---

## 🚀 Instalasi & Menjalankan Secara Lokal

```bash
# Clone repository
git clone https://github.com/cozocozy/quran-web.git

# Masuk ke folder project
cd quran-web

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Buka `http://localhost:3000` di browser untuk melihat hasilnya.

---

## 🌐 Deployment

Project ini di-deploy menggunakan **Netlify** dan dapat diakses secara publik di:
👉 https://read-quran-daily.netlify.app/

---

## 🗺️ Roadmap / Rencana Pengembangan

- [ ] Tafsir singkat per ayat
- [ ] Mode gelap (dark mode)
- [ ] Dukungan offline / PWA
- [ ] Pengaturan ukuran font Arab & terjemahan
- [ ] Multi-qari untuk pilihan audio murottal

---

## 👤 Tentang Developer

Project ini dibuat sebagai bagian dari portofolio pengembangan web, menunjukkan kemampuan dalam:
- Membangun aplikasi web full-featured dari nol
- Bekerja dengan data terstruktur (114 surah, ribuan ayat)
- Implementasi UI/UX yang ramah pengguna untuk kebutuhan ibadah harian
- Deployment dan optimasi SEO untuk aplikasi web publik

## 👨‍💻 Author & Contact

Dikembangkan oleh **Septian Hadi Prakoso**

- 📧 Email: septianhadipdev@gmail.com
- 💼 LinkedIn: [Septian Hadi Prakoso](https://www.linkedin.com/in/septian-hadi-prakoso-632446243)
- 🐙 GitHub: [@cozocozy](https://github.com/cozocozy)

## 📄 Lisensi

Project ini dibuat untuk kebutuhan portofolio / komersial dan dilindungi di bawah lisensi [MIT License](LICENSE).

