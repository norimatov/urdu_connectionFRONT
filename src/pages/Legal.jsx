import PublicLayout from '../components/PublicLayout.jsx';

const TEXTS = {
  privacy: {
    title: 'Maxfiylik siyosati',
    body: [
      'Biz faqat platformani ishlatish uchun zarur bo‘lgan ma‘lumotlarni yig‘amiz: ism, username, email, telefon raqami va universitet.',
      'Parollar shifrlangan holda saqlanadi. Tasdiqlash kodlari vaqtinchalik va xeshlangan holda saqlanadi.',
      'Shaxsiy ma‘lumotlaringiz uchinchi tomonlarga sotilmaydi. Tizim ishlashi uchun zarur bo‘lgan xizmat provayderlari (email, SMS) bundan mustasno.',
    ],
  },
  terms: {
    title: 'Foydalanish shartlari',
    body: [
      'Platformadan foydalanish uchun email va telefon raqamingizni tasdiqlashingiz kerak.',
      'Haqoratli, noqonuniy yoki boshqalarga zarar yetkazadigan kontent taqiqlanadi. Bunday kontent moderatsiya qilinadi.',
      'Akkaunt ma‘muriyat tomonidan bloklanishi mumkin. Qoidalar o‘zgarganda foydalanuvchilar xabardor qilinadi.',
    ],
  },
};

export default function Legal({ kind }) {
  const t = TEXTS[kind];
  return (
    <PublicLayout>
      <section className="section narrow">
        <h1 className="page-title">{t.title}</h1>
        {t.body.map((p, i) => <p key={i} className="muted">{p}</p>)}
      </section>
    </PublicLayout>
  );
}
