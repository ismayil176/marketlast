import { Info, RefreshCw, ShieldCheck, Database, Globe, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export default function MethodologyPage() {
  const sections = [
    {
      title: "Məlumatların Toplanması",
      icon: Database,
      content: "QIYMET.AZ Azərbaycanın ən böyük supermarket şəbəkələrinin (Araz, Bazarstore, Bravo, Bolmart və s.) rəsmi onlayn platformalarından və mağaza daxili məlumatlarından istifadə edir. Məlumatlar avtomatlaşdırılmış sistemlər (adapterlər) vasitəsilə toplanır."
    },
    {
      title: "Yenilənmə Tezliyi",
      icon: RefreshCw,
      content: "Sistemimiz hər 6 saatdan bir bütün marketlərdəki qiymətləri yoxlayır. Bu, istifadəçilərimizə ən aktual qiymət və endirim məlumatlarını təqdim etməyə imkan verir."
    },
    {
      title: "Etibarlılıq Səviyyəsi",
      icon: ShieldCheck,
      content: "Hər bir qiymət təklifi üçün etibarlılıq səviyyəsi təyin edilir. 'Yüksək' səviyyə birbaşa rəsmi onlayn mənbədən alınan və son 24 saatda təsdiqlənmiş qiymətləri ifadə edir."
    },
    {
      title: "Onlayn vs Mağaza Qiymətləri",
      icon: Globe,
      content: "Bəzi hallarda marketlərin onlayn qiymətləri ilə fiziki mağazadakı qiymətləri arasında fərq ola bilər. Biz əsasən rəsmi onlayn qiymətləri əsas götürürük, lakin mağaza daxili monitorinqləri də nəzərə alırıq."
    },
    {
      title: "Endirimli Qiymətlər",
      icon: AlertTriangle,
      content: "Promo və ya endirimli qiymətlər sistemdə xüsusi olaraq qeyd edilir. Biz həm adi, həm də endirimli qiyməti göstəririk ki, istifadəçi real qənaəti görə bilsin."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-16 py-8">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mb-4">
          <Info size={32} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">İş Metodologiyamız</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          QIYMET.AZ olaraq şəffaflıq və dəqiqlik bizim üçün ən vacib amillərdir. Məlumatları necə emal etdiyimizi aşağıda ətraflı izah edirik.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {sections.map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-start"
          >
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
              <section.icon size={28} />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-slate-900">{section.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {section.content}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="bg-blue-600 rounded-[2rem] p-12 text-white text-center space-y-6 shadow-2xl shadow-blue-200">
        <h2 className="text-3xl font-black">Məsuliyyətdən İmtina</h2>
        <p className="text-blue-100 leading-relaxed max-w-2xl mx-auto">
          QIYMET.AZ yalnız məlumat xarakterli platformadır. Biz qiymətlərin 100% dəqiqliyinə zəmanət vermirik, çünki marketlər qiymətləri istənilən an dəyişə bilər. Alış-veriş etməzdən əvvəl qiyməti mağazada dəqiqləşdirməyiniz tövsiyə olunur.
        </p>
      </section>
    </div>
  );
}
