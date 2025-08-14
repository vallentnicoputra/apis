// api/religion/motivasi.js
const { checkApiKeyAndLimit } = require("../../middleware");

module.exports = (app) => {
  const data = [
    "Jangan pernah lelah untuk terus berdoa, karena tidak ada yang mustahil bagi Allah.",
    "Allah tidak melihat bentuk rupa dan harta kalian, tetapi Dia melihat hati dan amal kalian. (HR. Muslim)",
    "Cobaan itu datang bukan untuk melemahkanmu, tapi untuk mendekatkanmu pada Allah.",
    "Ketika kamu merasa lemah, ingatlah bahwa Allah selalu bersamamu.",
    "Bersyukurlah walau hanya sekecil apapun nikmat yang Allah beri.",
    "Orang yang paling dicintai Allah adalah yang paling bermanfaat bagi sesama.",
    "Dunia adalah ladang akhirat, tanamlah kebaikan sebanyak-banyaknya.",
    "Semua akan indah pada waktunya, jika kita bersabar dan tawakal.",
    "Jangan iri pada rezeki orang lain, karena rezeki kita sudah dijamin oleh Allah.",
    "Dengan mengingat Allah, hati menjadi tenang. (QS. Ar-Ra’d: 28)",
    "Sholat adalah tempat terbaik untuk mengadukan segala hal.",
    "Sebaik-baik manusia adalah yang paling bertakwa kepada Allah.",
    "Setiap kesulitan pasti ada kemudahan. (QS. Al-Insyirah: 6)",
    "Berbaik sangkalah kepada Allah, karena Dia tahu yang terbaik untukmu.",
    "Allah tahu kapan yang terbaik untuk menjawab doamu.",
    "Allah mendengar setiap doa, bahkan yang hanya berupa air mata.",
    "Kuatkan sabar, perkuat doa, dan yakinlah pada janji Allah.",
    "Tak ada yang lebih membahagiakan daripada keikhlasan hati dalam ibadah.",
    "Jangan tunggu bahagia untuk bersyukur, bersyukurlah agar bahagia.",
    "Doa adalah kekuatan orang beriman yang tak pernah padam."
  ];

  app.get("/religion/motivasi", checkApiKeyAndLimit, (req, res) => {
    const randomMotivasi = data[Math.floor(Math.random() * data.length)];
    res.json({
      status: true,
      motivasi: randomMotivasi
    });
  });
};