
import { Mission, QuizLevel } from './types';

export const COLORS = {
  energy: {
    chemical: '#4CAF50',   // Hijau
    mechanical: '#9E9E9E', // Abu
    electrical: '#2196F3', // Biru
    light: '#FFEB3B',      // Kuning
    heat: '#F44336',       // Merah
  }
};

export const MISSIONS: Mission[] = [
  {
    id: 1,
    title: "Lampu Darurat",
    desc: "Malam ini mati lampu! Ayah butuh cahaya untuk membaca. Bisakah kamu menyalakan lampu menggunakan tenaga kayuhan sepeda?",
    reqSource: 'BIKE',
    reqConverter: 'GENERATOR',
    reqOutput: 'BULB',
    difficulty: "Mudah"
  },
  {
    id: 2,
    title: "Kipas Tenaga Surya",
    desc: "Cuaca siang ini panas sekali dan Matahari bersinar terik. Ayo nyalakan kipas angin tanpa menggunakan listrik PLN, tapi pakai energi alam!",
    reqSource: 'SUN',
    reqConverter: 'SOLAR_PANEL',
    reqOutput: 'FAN',
    difficulty: "Sedang"
  },
  {
    id: 3,
    title: "Pemanas Air Sungai",
    desc: "Nenek ingin buat teh hangat. Di belakang rumah ada sungai mengalir deras. Bisakah kita manfaatkan aliran air itu untuk memanaskan air minum?",
    reqSource: 'WATER',
    reqConverter: 'GENERATOR',
    reqOutput: 'HEATER',
    difficulty: "Sulit"
  }
];

export const QUIZ_LEVELS: QuizLevel[] = [
  {
    level: 1,
    title: "Level 1: Pemula (LOTS)",
    desc: "Mengingat & Memahami Konsep Energi",
    questions: [
      { id: 1, question: "Apa sumber energi panas dan cahaya terbesar di Bumi?", options: ["Bulan", "Matahari", "Lampu", "Api Unggun"], correctAnswer: 1 },
      { id: 2, question: "Energi yang tersimpan dalam makanan disebut energi...", options: ["Gerak", "Listrik", "Kimia", "Panas"], correctAnswer: 2 },
      { id: 3, question: "Kincir air bergerak karena adanya energi...", options: ["Air mengalir", "Angin sepoi", "Panas matahari", "Listrik"], correctAnswer: 0 },
      { id: 4, question: "Energi tidak dapat diciptakan dan tidak dapat...", options: ["Diubah", "Disimpan", "Musnah", "Dipakai"], correctAnswer: 2 },
      { id: 5, question: "Alat untuk mengubah energi cahaya matahari menjadi listrik adalah...", options: ["Generator", "Panel Surya", "Baterai", "Dinamo"], correctAnswer: 1 },
      { id: 6, question: "Manakah benda yang menghasilkan energi bunyi?", options: ["Lampu menyala", "Gitar dipetik", "Setrika panas", "Kipas berputar"], correctAnswer: 1 },
      { id: 7, question: "Satuan untuk mengukur suhu adalah...", options: ["Meter", "Kilogram", "Derajat Celcius", "Detik"], correctAnswer: 2 },
      { id: 8, question: "Bensin pada mobil merupakan contoh sumber energi...", options: ["Terbarukan", "Fosil (Kimia)", "Alternatif", "Bunyi"], correctAnswer: 1 },
      { id: 9, question: "Saat kita bertepuk tangan, energi gerak berubah menjadi energi...", options: ["Cahaya", "Bunyi", "Kimia", "Listrik"], correctAnswer: 1 },
      { id: 10, question: "PLTA adalah singkatan dari Pembangkit Listrik Tenaga...", options: ["Angin", "Air", "Api", "Uap"], correctAnswer: 1 },
    ]
  },
  {
    level: 2,
    title: "Level 2: Terampil (MOTS)",
    desc: "Menerapkan Perubahan Energi",
    questions: [
      { id: 1, question: "Perubahan energi apa yang terjadi pada Kipas Angin?", options: ["Listrik → Gerak", "Gerak → Listrik", "Listrik → Panas", "Kimia → Gerak"], correctAnswer: 0 },
      { id: 2, question: "Saat Ayah menyalakan Televisi, terjadi perubahan energi listrik menjadi...", options: ["Gerak dan Panas", "Cahaya dan Bunyi", "Kimia dan Gerak", "Bunyi dan Gerak"], correctAnswer: 1 },
      { id: 3, question: "Setrika mengubah energi listrik menjadi energi panas. Benda lain yang perubahannya SAMA adalah...", options: ["Radio", "Blender", "Rice Cooker", "Lampu Senter"], correctAnswer: 2 },
      { id: 4, question: "Baterai pada jam dinding berfungsi mengubah energi Kimia menjadi...", options: ["Gerak jarum jam", "Cahaya jam", "Panas jam", "Bunyi jam"], correctAnswer: 0 },
      { id: 5, question: "Seorang anak bermain perosotan. Energi potensial berubah menjadi energi...", options: ["Listrik", "Kinetik (Gerak)", "Kimia", "Cahaya"], correctAnswer: 1 },
      { id: 6, question: "Panel surya tidak dapat bekerja maksimal jika...", options: ["Cuaca sangat panas", "Matahari bersinar terik", "Langit mendung/malam", "Dipasang di atap"], correctAnswer: 2 },
      { id: 7, question: "Mengapa kita berkeringat setelah berlari? Karena tubuh mengubah energi Kimia menjadi...", options: ["Gerak dan Panas", "Gerak dan Cahaya", "Bunyi dan Listrik", "Listrik dan Panas"], correctAnswer: 0 },
      { id: 8, question: "Dinamo pada sepeda menyalakan lampu dengan mengubah energi...", options: ["Listrik → Gerak", "Gerak → Listrik", "Kimia → Cahaya", "Panas → Listrik"], correctAnswer: 1 },
      { id: 9, question: "Gitar listrik membutuhkan amplifier (pengeras suara). Perubahannya adalah...", options: ["Listrik → Bunyi", "Gerak → Listrik", "Bunyi → Cahaya", "Kimia → Bunyi"], correctAnswer: 0 },
      { id: 10, question: "Manakah alat yang TIDAK menggunakan energi listrik?", options: ["Kompor Gas", "Kulkas", "Mesin Cuci", "Blender"], correctAnswer: 0 },
    ]
  },
  {
    level: 3,
    title: "Level 3: Ahli (HOTS)",
    desc: "Menganalisis & Mengevaluasi",
    questions: [
      { id: 1, question: "Jika kabel setrika terkelupas dan terlihat tembaganya, apa yang mungkin terjadi dan mengapa?", options: ["Setrika makin panas karena kabel terbuka", "Bahaya tersetrum karena tembaga menghantar listrik", "Tidak terjadi apa-apa", "Listrik menjadi hemat"], correctAnswer: 1 },
      { id: 2, question: "Mengapa penggunaan lampu LED lebih disarankan daripada lampu pijar (kaca)?", options: ["LED lebih mahal", "LED mengubah listrik ke cahaya lebih efisien (tidak panas)", "Lampu pijar lebih terang", "LED menggunakan minyak"], correctAnswer: 1 },
      { id: 3, question: "Di desa terpencil tanpa listrik PLN, namun ada sungai deras. Solusi energi terbaik adalah...", options: ["Membangun PLTU batubara", "Membuat kincir air (PLTMH)", "Membeli banyak baterai", "Menunggu bantuan kota"], correctAnswer: 1 },
      { id: 4, question: "Jika Matahari tiba-tiba berhenti bersinar, apa dampak terbesarnya bagi energi di Bumi?", options: ["Kita hanya perlu menyalakan lampu", "Tumbuhan mati, rantai makanan putus, tidak ada energi", "Panel surya tetap bekerja dengan cahaya bulan", "Bumi menjadi makin panas"], correctAnswer: 1 },
      { id: 5, question: "Mengapa mobil listrik dianggap lebih ramah lingkungan daripada mobil bensin?", options: ["Mobil listrik tidak mengeluarkan asap polusi", "Mobil listrik lebih murah harganya", "Mobil listrik lebih pelan", "Bensin baunya wangi"], correctAnswer: 0 },
      { id: 6, question: "Saat kita menggosok-gosokkan kedua telapak tangan, tangan menjadi hangat. Analisislah perubahan energinya!", options: ["Energi Listrik → Panas", "Energi Gerak → Panas", "Energi Kimia → Gerak", "Energi Panas → Gerak"], correctAnswer: 1 },
      { id: 7, question: "Sebuah bendungan PLTA kering karena kemarau. Apa dampaknya?", options: ["Listrik tetap stabil", "Turbin tidak berputar, produksi listrik berhenti", "Panel surya ikut mati", "Air sungai menjadi jernih"], correctAnswer: 1 },
      { id: 8, question: "Tubuh manusia seperti mesin. Jika tidak makan (tidak ada input energi), maka...", options: ["Tubuh tetap bisa bergerak selamanya", "Tubuh mengambil cadangan lemak, lalu lemas", "Tubuh melakukan fotosintesis", "Tubuh menghasilkan listrik sendiri"], correctAnswer: 1 },
      { id: 9, question: "Kipas angin mendengung tapi baling-baling tidak berputar. Kemungkinan kerusakan pada perubahan energinya adalah...", options: ["Energi listrik tidak masuk sama sekali", "Energi listrik berubah jadi panas/bunyi saja (macet)", "Kipas angin kehabisan baterai", "Angin di ruangan habis"], correctAnswer: 1 },
      { id: 10, question: "Mengapa kita harus menghemat energi listrik padahal bisa diciptakan?", options: ["Listrik tidak bisa diciptakan, sumbernya terbatas", "Agar perusahaan listrik bangkrut", "Supaya rumah jadi gelap", "Karena listrik itu gratis"], correctAnswer: 0 },
    ]
  }
];
