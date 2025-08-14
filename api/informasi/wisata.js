// file: api/tools/wisata.js
const { checkApiKeyAndLimit } = require('../../middleware');

const wisataData = {
  Lumajang: [
    "Air Terjun Tumpak Sewu",
    "Kawah Ijen",
    "Ranu Klakah",
    "Senduro Waterfall",
    "Waduk Lempung"
  ],
  Malang: [
    "Batu Night Spectacular",
    "Jatim Park 1",
    "Jatim Park 2",
    "Coban Rondo",
    "Museum Angkut"
  ],
  Banyuwangi: [
    "Pantai Pulau Merah",
    "Ijen Crater",
    "Baluran National Park",
    "Alas Purwo",
    "Pantai Sukamade"
  ],
  Yogyakarta: [
    "Candi Borobudur",
    "Candi Prambanan",
    "Malioboro",
    "Keraton Yogyakarta",
    "Pantai Parangtritis"
  ],
  Bandung: [
    "Tangkuban Perahu",
    "Kawah Putih",
    "Dusun Bambu",
    "Trans Studio Bandung",
    "Braga Street"
  ],
  Jakarta: [
    "Monas",
    "Kota Tua",
    "Taman Mini Indonesia Indah",
    "Ancol",
    "Museum Nasional"
  ],
  Surabaya: [
    "Tugu Pahlawan",
    "Jembatan Suramadu",
    "Kebun Binatang Surabaya",
    "House of Sampoerna",
    "Taman Bungkul"
  ],
  Medan: [
    "Istana Maimun",
    "Masjid Raya Al-Mashun",
    "Danau Toba",
    "Bukit Lawang",
    "Taman Alam Lumbini"
  ],
  Makassar: [
    "Pantai Losari",
    "Benteng Fort Rotterdam",
    "Trans Studio Makassar",
    "Pulau Samalona",
    "Taman Nasional Bantimurung-Bulusaraung"
  ],
  Palembang: [
    "Jembatan Ampera",
    "Pulau Kemaro",
    "Masjid Agung Palembang",
    "Taman Purbakala Sriwijaya",
    "Museum Sultan Mahmud Badaruddin II"
  ],
  Semarang: [
    "Lawang Sewu",
    "Kota Lama Semarang",
    "Masjid Agung Jawa Tengah",
    "Klenteng Sam Poo Kong",
    "Brown Canyon"
  ],
  Solo: [
    "Keraton Surakarta Hadiningrat",
    "Pasar Klewer",
    "Taman Balekambang",
    "Kampung Batik Laweyan",
    "Museum Danar Hadi"
  ],
  Batam: [
    "Jembatan Barelang",
    "Pantai Nongsa",
    "Bukit Senyum",
    "Taman Wisata Ocarina",
    "Gurun Pasir Bintan"
  ],
  Aceh: [
    "Masjid Raya Baiturrahman",
    "Museum Tsunami Aceh",
    "Sabang (Pulau Weh)",
    "Pantai Lampuuk",
    "Air Terjun Suhom"
  ],
  Lombok: [
    "Gili Trawangan",
    "Gunung Rinjani",
    "Pantai Senggigi",
    "Taman Narmada",
    "Air Terjun Sendang Gile"
  ],
  LabuanBajo: [
    "Pulau Komodo",
    "Pink Beach",
    "Pulau Padar",
    "Manta Point",
    "Gua Rangko"
  ],
  RajaAmpat: [
    "Piaynemo",
    "Teluk Kabui",
    "Wayag",
    "Arborek",
    "Pasir Timbul"
  ],
  Balikpapan: [
    "Pantai Kemala",
    "Kebun Raya Balikpapan",
    "Penangkaran Buaya Teritip",
    "Danau Cermin Lamaru",
    "Hutan Lindung Sungai Wain"
  ],
  Pontianak: [
    "Tugu Khatulistiwa",
    "Masjid Jami Sultan Syarif Abdurrahman",
    "Aloevera Center",
    "Taman Alun Kapuas",
    "Rumah Betang Radakng"
  ],
  Manado: [
    "Bunaken",
    "Danau Tondano",
    "Bukit Doa Mahawu",
    "Gunung Lokon",
    "Taman Nasional Tangkoko"
  ],
  Jayapura: [
    "Danau Sentani",
    "Pantai Base G",
    "Bukit Jokowi",
    "Tugu Peringatan Yos Sudarso",
    "Pasar Hamadi"
  ],
  Padang: [
    "Jembatan Siti Nurbaya",
    "Pantai Padang",
    "Museum Adityawarman",
    "Gunung Padang",
    "Air Terjun Sarasah"
  ],
  Pekanbaru: [
    "Masjid Agung An-Nur",
    "Danau Buatan Lembah Sari",
    "Taman Alam Mayang",
    "Rumah Singgah Tuan Kadi",
    "Sultan Syarif Kasim II"
  ],
  BandarLampung: [
    "Taman Nasional Way Kambas",
    "Menara Siger",
    "Pantai Pasir Putih",
    "Pulau Pahawang",
    "Taman Kupu-kupu"
  ],
  Cirebon: [
    "Keraton Kasepuhan",
    "Keraton Kanoman",
    "Goa Sunyaragi",
    "Masjid Agung Sang Cipta Rasa",
    "Batik Trusmi"
  ],
  Bogor: [
    "Kebun Raya Bogor",
    "Istana Bogor",
    "The Jungle Waterpark",
    "Gunung Salak",
    "Curug Cilember"
  ],
  Bekasi: [
    "Curug Parigi",
    "Taman Buaya Indonesia Jaya",
    "Transera Waterpark",
    "Danau Marakas",
    "Situ Cibeureum"
  ],
  Tasikmalaya: [
    "Gunung Galunggung",
    "Situ Gede",
    "Pantai Karang Tawulan",
    "Curug Dengdeng",
    "Kampung Naga"
  ],
  Palu: [
    "Jembatan Ponulele",
    "Pantai Talise",
    "Pantai Tanjung Karang",
    "Gunung Gawalise",
    "Masjid Apung"
  ],
  Kendari: [
    "Air Terjun Moramo",
    "Pulau Labengki",
    "Pantai Nambo",
    "Taman Nasional Rawa Aopa Watumohai",
    "Tugu Persatuan"
  ],
  Gorontalo: [
    "Danau Limboto",
    "Benteng Otanaha",
    "Pulau Saronde",
    "Monumen Nani Wartabone",
    "Pantai Olele"
  ],
  Ambon: [
    "Pantai Liang",
    "Benteng Amsterdam",
    "Pulau Ora",
    "Taman Nasional Manusela",
    "Pintu Kota"
  ],
  Ternate: [
    "Gunung Gamalama",
    "Danau Tolire",
    "Benteng Oranje",
    "Pulau Maitara",
    "Benteng Kastela"
  ],
  Kupang: [
    "Pantai Lasiana",
    "Goa Kristal",
    "Pantai Pasir Panjang",
    "Obyek Wisata Camplong",
    "Air Terjun Oenesu"
  ],
  Cilegon: [
    "Gunung Krakatau",
    "Pantai Anyer",
    "Bukit Teletubbies Cilegon",
    "Danau Tasikardi",
    "Pulau Merak Kecil"
  ],
  PadangPanjang: [
    "Lembah Anai",
    "Minang Village",
    "Air Terjun Lembah Anai",
    "Pusat Dokumentasi dan Informasi Kebudayaan Minangkabau"
  ],
  Bukittinggi: [
    "Jam Gadang",
    "Ngarai Sianok",
    "Taman Margasatwa dan Budaya Kinantan",
    "Benteng Fort de Kock",
    "Janjang Koto Gadang"
  ],
  Samosir: [
    "Danau Toba",
    "Tomok",
    "Tuk-tuk",
    "Batu Kursi Raja Siallagan",
    "Air Terjun Sipiso-piso"
  ],
  Sabang: [
    "Pulau Weh",
    "Tugu Nol Kilometer Indonesia",
    "Pantai Iboih",
    "Pantai Gapang",
    "Sabang Fair"
  ],
  Bengkulu: [
    "Pantai Panjang",
    "Benteng Marlborough",
    "Danau Dendam Tak Sudah",
    "Rumah Pengasingan Bung Karno",
    "Taman Wisata Alam Sebelat"
  ],
  Jambi: [
    "Danau Sipin",
    "Candi Muaro Jambi",
    "Taman Nasional Kerinci Seblat",
    "Tugu Keris Siginjai",
    "Museum Negeri Jambi"
  ],
  Pangkalpinang: [
    "Taman Nasional Gunung Tujuh",
    "Danau Kaolin",
    "Jembatan Emas",
    "Pantai Pasir Padi",
    "Museum Timah"
  ],
  Pontianak: [
    "Tugu Khatulistiwa",
    "Masjid Jami' Sultan Abdurrahman",
    "Rumah Radakng",
    "Taman Alun Kapuas",
    "Aloe Vera Center"
  ],
  Banjarmasin: [
    "Pasar Terapung",
    "Masjid Raya Sabilal Muhtadin",
    "Taman Siring",
    "Pulau Kembang",
    "Menara Pandang"
  ],
  Samarinda: [
    "Masjid Islamic Center Samarinda",
    "Taman Rekreasi Lembah Hijau",
    "Pulau Kumala",
    "Air Terjun Tanah Merah",
    "Taman Wisata Alam Bukit Bangkirai"
  ],
  Mataram: [
    "Taman Narmada",
    "Pura Lingsar",
    "Taman Mayura",
    "Islamic Center Mataram",
    "Air Terjun Benang Kelambu"
  ],
  Waingapu: [
    "Bukit Wairinding",
    "Desa Adat Praijing",
    "Air Terjun Tanggedu",
    "Pantai Walakiri",
    "Purukambera"
  ],
  Sorong: [
    "Wisata Bahari Raja Ampat",
    "Pantai Doom",
    "Taman Nasional Laut Teluk Cenderawasih",
    "Tugu Merah Putih",
    "Pulau Buaya"
  ],
  Merauke: [
    "Taman Nasional Wasur",
    "Tugu Kapsul Waktu",
    "Tugu Lingkaran Brawijaya",
    "Pantai Lampu Satu",
    "Kebun Kupu-kupu"
  ],
  Manokwari: [
    "Pantai Pasir Putih",
    "Pegunungan Arfak",
    "Pulau Mansinam",
    "Danau Framu",
    "Taman Nasional Teluk Cenderawasih"
  ],
  Mamuju: [
    "Pantai Karama",
    "Pulau Karampuang",
    "Air Terjun Tamasapi",
    "Tugu Kuda",
    "Museum Sulawesi Barat"
  ],
  Palopo: [
    "Taman Wisata Alam Puncak",
    "Air Terjun Latuppa",
    "Pantai Labombo",
    "Bukit Sampan",
    "Masjid Jami' Tua Palopo"
  ],
  Parepare: [
    "Monumen Cinta Habibie Ainun",
    "Taman Mattirotasi",
    "Pantai Tonrangeng",
    "Kebun Raya Jompie",
    "Museum Parepare"
  ],
  Bitung: [
    "Taman Nasional Tangkoko",
    "Pulau Lembeh",
    "Selat Lembeh",
    "Taman Wisata Alam Batu Putih",
    "Tugu Trikora"
  ],
  ToliToli: [
    "Pulau Salando",
    "Pulau Kabetan",
    "Air Terjun Tamboli",
    "Pantai Lalos",
    "Air Terjun Watu Nodulu"
  ],
  Kendal: [
    "Curug Sewu",
    "Pantai Cahaya",
    "Hutan Mangrove",
    "Taman Nasional Gunung Merbabu",
    "Waduk Darma"
  ],
  Pati: [
    "Waduk Gembong",
    "Goa Pancur",
    "Air Terjun Grenjengan",
    "Taman Wisata Pintu Langit",
    "Pantai Ngebuk"
  ],
  Wonosobo: [
    "Dataran Tinggi Dieng",
    "Telaga Warna",
    "Kawah Sikidang",
    "Candi Arjuna",
    "Gunung Prau"
  ],
  Blitar: [
    "Candi Penataran",
    "Makam Bung Karno",
    "Istana Gebang",
    "Pantai Tambakrejo",
    "Gumuk Sapu Angin"
  ],
  Sidoarjo: [
    "Tanggul Lumpur Lapindo",
    "Taman Wisata Bahari Tlocor",
    "Alun-alun Sidoarjo",
    "Candi Pari",
    "Museum Mpu Tantular"
  ],
  Pacitan: [
    "Goa Gong",
    "Pantai Klayar",
    "Pantai Teleng Ria",
    "Sungai Maron",
    "Goa Tabuhan"
  ]
};

module.exports = (app) => {
  app.get("/informasi/wisata", checkApiKeyAndLimit, (req, res) => {
    try {
      const kota = (req.query.kota || "").trim();
      if (!kota) {
        return res.json({
          status: true,
          data: wisataData
        });
      }

      const result = wisataData[kota];
      if (!result) {
        return res.status(404).json({
          status: false,
          message: `Tidak ada data wisata untuk kota ${kota}`
        });
      }

      res.json({
        status: true,
        kota: kota,
        wisata: result
      });
    } catch (err) {
      res.status(500).json({ status: false, message: err.message });
    }
  });
};
