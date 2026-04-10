"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import Lenis from "lenis";
import { useEffect, useMemo, useRef, useState } from "react";

type Beat = {
  id: string;
  eyebrow: string;
  title: string;
  body: string[];
  align: "left" | "right" | "center";
  start: number;
  end: number;
};

type Service = {
  id: string;
  title: string;
  body: string;
};

type Master = {
  name: string;
  role: string;
  specialty: string;
  experience: string;
  image: string;
};

type Reason = {
  title: string;
  body: string;
};

type Review = {
  name: string;
  location: string;
  quote: string;
};

const TOTAL_FRAMES = 240;
const FRAME_PATHS = Array.from({ length: TOTAL_FRAMES }, (_, index) => {
  const frame = `${index + 1}`.padStart(3, "0");
  return `/sequence/ezgif-frame-${frame}.jpg`;
});

const BEATS: Beat[] = [
  {
    id: "hero",
    eyebrow: "VIP MOTORS SERVIS",
    title: "Avtomobiliniz etibarlı ustaların əlindədir.",
    body: [
      "Bakıda gündəlik texniki qulluqdan mürəkkəb diaqnostikaya qədər hər iş peşəkar servis axını ilə idarə olunur."
    ],
    align: "center",
    start: 0,
    end: 0.18
  },
  {
    id: "diagnostic",
    eyebrow: "Dəqiq diaqnostika",
    title: "Problemi təxminlə yox, yoxlama ilə tapırıq.",
    body: [
      "Mühərrik, sürətlər qutusu, elektronika və xəbərdarlıq kodları xüsusi avadanlıqla yoxlanılır.",
      "Müştəriyə iş başlamazdan əvvəl nasazlığın səbəbi və görüləcək addımlar aydın şəkildə izah olunur."
    ],
    align: "left",
    start: 0.18,
    end: 0.42
  },
  {
    id: "service",
    eyebrow: "Gündəlik servis",
    title: "Yağ dəyişikliyi, filtrlər, əyləc baxışı bir yerdə.",
    body: [
      "Azərbaycan yolları və iqlimi nəzərə alınaraq servis intervalı, uyğun yağ seçimi və əsas aşınma nöqtələri yoxlanılır.",
      "Tez təhvil, təmiz iş sahəsi və hər avtomobil üçün ayrıca servis qeydi təqdim olunur."
    ],
    align: "right",
    start: 0.42,
    end: 0.68
  },
  {
    id: "repair",
    eyebrow: "Təmir və bərpa",
    title: "Sürətlər qutusu və mühərrik işləri təcrübəli ustalarla.",
    body: [
      "Səs, titrəmə, ötürmə gecikməsi və yağ sızması kimi problemlər mərhələli şəkildə aradan qaldırılır.",
      "Orijinala uyğun ehtiyat hissələri və keyfiyyətə nəzarət prosesi ilə nəticə sabit saxlanılır."
    ],
    align: "left",
    start: 0.68,
    end: 0.88
  },
  {
    id: "cta",
    eyebrow: "VIP MOTORS",
    title: "Servisə gəl, problemi rahatlıqla həll et.",
    body: [
      "Yağ dəyişimi, kompüter diaqnostikası, sürətlər qutusu təmiri və periodik baxım üçün komandamız hazırdır.",
      "Bakıda sürücülərin etibar etdiyi servis təcrübəsini bir nöqtədə topladıq."
    ],
    align: "center",
    start: 0.88,
    end: 1
  }
];

const SERVICES: Service[] = [
  {
    id: "01",
    title: "Yağ və filtr dəyişimi",
    body:
      "Mühərrik yağı, hava, salon və yağ filtrlərinin dəyişimi istehsalçı tövsiyəsinə və avtomobilin yürüşünə uyğun aparılır."
  },
  {
    id: "02",
    title: "Sürətlər qutusu təmiri",
    body:
      "Avtomat və mexaniki sürətlər qutularında keçid problemi, zərbə, səs və yağ sızması üzrə diaqnostika və təmir."
  },
  {
    id: "03",
    title: "Kompüter diaqnostikası",
    body:
      "Check engine, sensor nasazlıqları, elektron blok və ümumi sistem xətaları peşəkar skaner vasitəsilə yoxlanılır."
  },
  {
    id: "04",
    title: "Əyləc və asqı baxışı",
    body:
      "Kolodka, disk, amortizator, şaravoy və ön hissə elementləri təhlükəsizlik baxımından yoxlanılır və dəyişdirilir."
  },
  {
    id: "05",
    title: "Mühərrik servisi",
    body:
      "Yağ sızması, qızma, səs və qeyri-sabit işləmə kimi hallar üçün mərhələli diaqnostika və təmir xidməti."
  },
  {
    id: "06",
    title: "Kondisioner və soyutma sistemi",
    body:
      "Freon doldurulması, radiator və soyutma sistemi yoxlaması, yay mövsümünə hazırlıq üçün tam servis."
  }
];

const MASTERS: Master[] = [
  {
    name: "Rəşad Məmmədov",
    role: "Baş mexanik",
    specialty: "Mühərrik diaqnostikası və ağır mexaniki təmir",
    experience: "12 il təcrübə",
    image: "/team/ustad-rashad.svg"
  },
  {
    name: "Elvin Həsənli",
    role: "Sürətlər qutusu ustası",
    specialty: "Avtomat transmissiya, yağ sızması və keçid problemləri",
    experience: "9 il təcrübə",
    image: "/team/ustad-elvin.svg"
  },
  {
    name: "Murad Əliyev",
    role: "Elektrik və diaqnostika ustası",
    specialty: "Elektron sistemlər, check engine və sensor xətaları",
    experience: "8 il təcrübə",
    image: "/team/ustad-murad.svg"
  }
];

const REASONS: Reason[] = [
  {
    title: "Azərbaycan yollarına uyğun servis yanaşması",
    body:
      "Tıxac, toz, yay istiliyi və gündəlik intensiv istifadə səbəbilə daha tez aşınan hissələrə xüsusi diqqət ayrılır."
  },
  {
    title: "Şəffaf qiymətləndirmə",
    body:
      "İş başlamazdan əvvəl görüləcək xidmətlər izah olunur, lazımsız dəyişiklik təklif edilmir və müştəri təsdiqi olmadan iş genişləndirilmir."
  },
  {
    title: "Sürətli qəbul və təhvil",
    body:
      "Növbə planlaması və servis axını elə qurulub ki, gündəlik qulluq işləri mümkün qədər operativ tamamlanıb avtomobil sahibinə təhvil verilsin."
  }
];

const REVIEWS: Review[] = [
  {
    name: "Kamran, Bakı",
    location: "Nərimanov",
    quote:
      "Yağ dəyişimi üçün getmişdim, əyləc və asqı ilə bağlı problemi də vaxtında aşkar etdilər. Ustalar həm izahlı, həm də səliqəli işləyir."
  },
  {
    name: "Nihad, Bakı",
    location: "Xətai",
    quote:
      "Sürətlər qutusunda gecikmə vardı. Diaqnostikadan sonra problemi dəqiq dedilər və boş yerə əlavə xərc çıxarmadılar."
  },
  {
    name: "Aysel, Sumqayıt",
    location: "Servis müştərisi",
    quote:
      "Müştəri ilə danışıq tərzi çox rahatdır. Hansı hissə niyə dəyişir, nə qədər vaxt çəkəcək, hamısını başa salırlar."
  }
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getBeatOpacity(progress: number, beat: Beat) {
  const entry = 0.07;
  const exit = 0.08;
  if (progress < beat.start || progress > beat.end) {
    return 0;
  }

  const fadeIn = clamp((progress - beat.start) / entry, 0, 1);
  const fadeOut = clamp((beat.end - progress) / exit, 0, 1);
  return Math.min(fadeIn, fadeOut, 1);
}

export function ScrollStory() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const reducedMotion = useReducedMotion();

  const [progress, setProgress] = useState(0);
  const [navVisible, setNavVisible] = useState(false);
  const [loadedFrames, setLoadedFrames] = useState(0);

  const stats = useMemo(
    () => [
      { label: "Gündəlik qəbul", value: "Bakı üzrə operativ servis" },
      { label: "Əsas xidmətlər", value: "Yağ, diaqnostika, transmissiya" },
      { label: "Müştəri dəstəyi", value: "Aydın izah və servis qeydi" }
    ],
    []
  );

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      gestureOrientation: "vertical"
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let mounted = true;
    let loaded = 0;

    const drawFrame = (image: HTMLImageElement) => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(viewportWidth * dpr);
      canvas.height = Math.floor(viewportHeight * dpr);
      canvas.style.width = `${viewportWidth}px`;
      canvas.style.height = `${viewportHeight}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, viewportWidth, viewportHeight);
      context.fillStyle = "#050505";
      context.fillRect(0, 0, viewportWidth, viewportHeight);

      const scale = Math.min(viewportWidth / image.width, viewportHeight / image.height);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      const offsetX = (viewportWidth - drawWidth) / 2;
      const offsetY = (viewportHeight - drawHeight) / 2;

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    };

    framesRef.current = FRAME_PATHS.map((path, index) => {
      const image = new window.Image();
      image.decoding = "async";
      image.src = path;
      image.onload = () => {
        loaded += 1;
        if (mounted) {
          setLoadedFrames(loaded);
        }

        if (index === 0) {
          drawFrame(image);
        }
      };
      return image;
    });

    const handleResize = () => {
      const activeImage = framesRef.current[currentFrameRef.current] ?? framesRef.current[0];
      if (activeImage?.complete) {
        drawFrame(activeImage);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      mounted = false;
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const drawFrame = (image: HTMLImageElement) => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(viewportWidth * dpr);
      canvas.height = Math.floor(viewportHeight * dpr);
      canvas.style.width = `${viewportWidth}px`;
      canvas.style.height = `${viewportHeight}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, viewportWidth, viewportHeight);
      context.fillStyle = "#050505";
      context.fillRect(0, 0, viewportWidth, viewportHeight);

      const scale = Math.min(viewportWidth / image.width, viewportHeight / image.height);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      const offsetX = (viewportWidth - drawWidth) / 2;
      const offsetY = (viewportHeight - drawHeight) / 2;

      context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    };

    const update = () => {
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(section.offsetHeight - window.innerHeight, 1);
      const rawProgress = clamp(-rect.top / scrollable, 0, 1);
      const nextFrame = clamp(
        Math.round(rawProgress * (TOTAL_FRAMES - 1)),
        0,
        TOTAL_FRAMES - 1
      );

      setProgress(rawProgress);
      setNavVisible(window.scrollY > 24);

      const frameImage = framesRef.current[nextFrame];
      if (frameImage?.complete && nextFrame !== currentFrameRef.current) {
        currentFrameRef.current = nextFrame;
        drawFrame(frameImage);
      } else if (nextFrame === 0 && frameImage?.complete) {
        drawFrame(frameImage);
      }
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <main className="page-shell">
      <motion.header
        className={`topbar ${navVisible ? "topbar--visible" : ""}`}
        initial={false}
        animate={{ opacity: navVisible ? 1 : 0.4 }}
      >
        <div className="topbar__brand">
          <Image
            src="/images/vipmotorslogo.jfif"
            alt="VIP Motors"
            width={28}
            height={28}
            className="topbar__logo"
          />
          <span>vip motors servis</span>
        </div>

        <nav className="topbar__nav" aria-label="Primary">
          <a href="#overview">Baxış</a>
          <a href="#services">Xidmətlər</a>
          <a href="#masters">Ustalarımız</a>
          <a href="#advantages">Üstünlüklər</a>
          <a href="#contact">Əlaqə</a>
        </nav>

        <a href="#contact" className="cta-button cta-button--small">
          Qəbul yazdır
        </a>
      </motion.header>

      <section ref={sectionRef} className="sequence-section" id="overview">
        <div className="sequence-stage">
          <div className="sequence-stage__backdrop" />
          <canvas ref={canvasRef} className="sequence-canvas" />

          <div className="sequence-copy">
            {BEATS.map((beat) => {
              const opacity = getBeatOpacity(progress, beat);
              const active = opacity > 0;
              return (
                <motion.article
                  key={beat.id}
                  className={`story-card story-card--${beat.align} ${
                    active ? "story-card--active" : ""
                  }`}
                  animate={{
                    opacity,
                    x:
                      beat.align === "left"
                        ? active
                          ? 0
                          : -40
                        : beat.align === "right"
                          ? active
                            ? 0
                            : 40
                          : 0,
                    y: active ? 0 : 28,
                    filter: `blur(${active ? 0 : 8}px)`
                  }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="eyebrow">{beat.eyebrow}</span>
                  <h2>{beat.title}</h2>
                  {beat.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {beat.id === "cta" ? (
                    <div className="story-card__actions">
                      <a href="#contact" className="cta-button">
                        Qəbul yazdır
                      </a>
                      <a href="#services" className="cta-button cta-button--ghost">
                        Xidmətlərə bax
                      </a>
                    </div>
                  ) : null}
                </motion.article>
              );
            })}
          </div>

          <div className="sequence-progress" aria-hidden="true">
            <span
              style={{
                transform: `scaleX(${progress.toFixed(4)})`
              }}
            />
          </div>
        </div>
      </section>

      <section className="hero-intro" id="about">
        <div className="hero-intro__copy">
          <span className="eyebrow">Bakıda peşəkar avtomobil servisi</span>
          <h1>Gündəlik baxımdan ağır təmirə qədər etibarlı xidmət.</h1>
          <p>
            VIP MOTORS Azərbaycan sürücüləri üçün rahat qəbul, aydın diaqnostika
            və nəticəyə yönəlmiş usta işi təqdim edir. Bizim üçün əsas məsələ
            avtomobili düzgün təmir edib sahibinə inamla təhvil verməkdir.
          </p>
        </div>

        <div className="hero-intro__meta">
          {stats.map((item) => (
            <div key={item.label} className="stat-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="detail-grid" id="services">
        <div className="detail-grid__lead">
          <span className="eyebrow">Əsas xidmətlər</span>
          <h2>Servisimiz ən çox tələb olunan avtomobil işlərini bir məkanda toplayır.</h2>
        </div>

        <div className="detail-grid__items detail-grid__items--services">
          {SERVICES.map((service) => (
            <article className="detail-card" key={service.id}>
              <span>{service.id}</span>
              <h3>{service.title}</h3>
              <p>{service.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="team-section" id="masters">
        <div className="team-section__lead">
          <span className="eyebrow">Ustalarımız</span>
          <h2>VIP MOTORS komandası avtomobilinizi işin adamına həvalə edir.</h2>
          <p>
            Hər usta öz sahəsi üzrə ixtisaslaşıb və servis axınında konkret məsuliyyət daşıyır. Müştəri avtomobili qəbul olunandan təhvilə qədər proses təcrübəli komanda nəzarətində qalır.
          </p>
        </div>

        <div className="team-grid">
          {MASTERS.map((master) => (
            <article className="master-card" key={master.name}>
              <div className="master-card__image-wrap">
                <Image
                  src={master.image}
                  alt={master.name}
                  width={520}
                  height={620}
                  className="master-card__image"
                />
              </div>
              <div className="master-card__body">
                <span className="eyebrow">{master.role}</span>
                <h3>{master.name}</h3>
                <p>{master.specialty}</p>
                <strong>{master.experience}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="info-strip" id="advantages">
        {REASONS.map((reason) => (
          <article className="info-panel" key={reason.title}>
            <span className="eyebrow">Niyə biz</span>
            <h3>{reason.title}</h3>
            <p>{reason.body}</p>
          </article>
        ))}
      </section>

      <section className="testimonials-section">
        <div className="detail-grid__lead">
          <span className="eyebrow">Müştəri rəyləri</span>
          <h2>Servisə gələn sürücülər ən çox dürüst yanaşmanı və nəticəni qeyd edir.</h2>
        </div>

        <div className="testimonials-grid">
          {REVIEWS.map((review) => (
            <article className="review-card" key={review.name}>
              <p>"{review.quote}"</p>
              <strong>{review.name}</strong>
              <span>{review.location}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="closing-panel" id="contact">
        <span className="eyebrow">Qəbul və əlaqə</span>
        <h2>Avtomobilinizə servis vaxtıdırsa, VIP MOTORS komandası hazırdır.</h2>
        <p>
          Yağ dəyişimi, diaqnostika, sürətlər qutusu problemi və ümumi texniki
          baxım üçün bizimlə əlaqə saxlayın. Servis qəbulunu öncədən planlayaq
          və avtomobilinizi növbəyə uyğun qəbul edək.
        </p>
        <div className="story-card__actions">
          <a href="tel:+994000000000" className="cta-button">
            +994 00 000 00 00
          </a>
          <a href="mailto:service@vipmotors.az" className="cta-button cta-button--ghost">
            service@vipmotors.az
          </a>
        </div>
      </section>
    </main>
  );
}



