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

const TOTAL_FRAMES = 240;
const FRAME_PATHS = Array.from({ length: TOTAL_FRAMES }, (_, index) => {
  const frame = `${index + 1}`.padStart(3, "0");
  return `/sequence/ezgif-frame-${frame}.jpg`;
});

const BEATS: Beat[] = [
  {
    id: "hero",
    eyebrow: "VIP MOTORS",
    title: "Luks hərəkətdədir.",
    body: [
      "Hər səfərdən daha artığını gözləyənlər üçün premium avtomobil xidməti yenidən düşünülüb."
    ],
    align: "center",
    start: 0,
    end: 0.16
  },
  {
    id: "engineering",
    eyebrow: "Mühəndislik Baxışı",
    title: "Mükəmməllik üçün dəqiqliklə qurulub.",
    body: [
      "Hər avtomobil bənzərsiz performans və etibarlılıq üçün incəliklə qulluq olunur.",
      "Mühərrikdən salona qədər hər detal qüsursuz sürüş təcrübəsi üçün hazırlanır."
    ],
    align: "left",
    start: 0.16,
    end: 0.4
  },
  {
    id: "experience",
    eyebrow: "Xidmət Təcrübəsi",
    title: "Sizə uyğunlaşan xidmət.",
    body: [
      "Harada olursunuzsa olun, ehtiyac duyduğunuz anda yanınızdadır.",
      "Rahat rezervasiya. Peşəkar sürücülər. Hava limanından tədbirlərə qədər hər yerə rahat çatın."
    ],
    align: "right",
    start: 0.4,
    end: 0.65
  },
  {
    id: "performance",
    eyebrow: "Performans və Ustalıq",
    title: "Hiss olunan performans.",
    body: [
      "Güc, idarəetmə və komfort hər səfərdə mükəmməl ahənglə işləyir.",
      "Yumşaq sürətlənmə, səssiz hərəkət və kompromissiz lüks üçün hazırlanıb."
    ],
    align: "left",
    start: 0.65,
    end: 0.85
  },
  {
    id: "cta",
    eyebrow: "Yenidən Toplanma",
    title: "Hər yolu yaşa. Daha azına razı olma.",
    body: [
      "VIP MOTORS. Komfort üçün düşünülüb, mükəmməllik üçün qurulub.",
      "Hava limanı, biznes görüşü və aradakı hər an üçün hazırlanıb."
    ],
    align: "center",
    start: 0.85,
    end: 1
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
      { label: "Dəstək xidməti", value: "24/7" },
      { label: "Premium marşrutlar", value: "Hava limanından görüşə" },
      { label: "Xidmət standartı", value: "İcraçı sinif incəliyi" }
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
          <span>vip motors</span>
        </div>

        <nav className="topbar__nav" aria-label="Primary">
          <a href="#overview">Baxış</a>
          <a href="#services">Xidmətlər</a>
          <a href="#store">Mağaza</a>
          <a href="#location">Ünvan</a>
          <a href="#about">Haqqımızda</a>
        </nav>

        <a href="#contact" className="cta-button cta-button--small">
          Rezerv et
        </a>
      </motion.header>

      <section ref={sectionRef} className="sequence-section" id="overview">
        <div className="sequence-stage">
          <div className="sequence-stage__backdrop" />
          <canvas ref={canvasRef} className="sequence-canvas" />

          <div className="sequence-hud">
            <div className="sequence-hud__status">
              <span>Kadr axını</span>
              <strong>
                {String(currentFrameRef.current + 1).padStart(3, "0")} /{" "}
                {String(TOTAL_FRAMES).padStart(3, "0")}
              </strong>
            </div>
            <div className="sequence-hud__status">
              <span>Yüklənən kadr</span>
              <strong>{loadedFrames}</strong>
            </div>
          </div>

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
                        Rezerv et
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
          <span className="eyebrow">Premium hərəkət memarlığı</span>
          <h1>Hər səfər üçün yeni nəsil VIP xidmət standartı.</h1>
          <p>
            VIP MOTORS sizə sadəcə avtomobil xidməti deyil, dəqiqlik, sakitlik
            və yüksək səviyyəli qarşılama hissi təqdim edir.
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
          <span className="eyebrow">Xidmət istiqamətləri</span>
          <h2>Lüks transfer xidməti, flaqman səviyyədə sazlanıb.</h2>
        </div>

        <div className="detail-grid__items">
          <article className="detail-card">
            <span>01</span>
            <h3>Hava limanı dəqiqliyi</h3>
            <p>
              Qarşılama vaxtının dəqiq idarəsi, uçuş məlumatlarının izlənməsi
              və hər çıxış üçün sakit, nəzarətli transfer axını.
            </p>
          </article>
          <article className="detail-card">
            <span>02</span>
            <h3>Korporativ hərəkət</h3>
            <p>
              Vaxt, məxfilik və diqqəti yayındırmayan komfort üzərində
              qurulmuş rəhbər transfer təcrübəsi.
            </p>
          </article>
          <article className="detail-card">
            <span>03</span>
            <h3>Tədbir hazırlığı</h3>
            <p>
              Premium park təqdimatı, yüksək sürücü standartı və hər
              dayanacaqda qonaqpərvərlik yönümlü xidmət.
            </p>
          </article>
        </div>
      </section>

      <section className="info-strip">
        <article className="info-panel" id="store">
          <span className="eyebrow">Magaza</span>
          <h3>Seçilmiş əlavə imkanlar.</h3>
          <p>
            Su, cihaz enerji yüklənməsi, uşaq oturacağı və sərnişinə uyğun
            fərdi seçimlər qapı açılmadan əvvəl hazırlanır.
          </p>
        </article>

        <article className="info-panel" id="location">
          <span className="eyebrow">Unvan</span>
          <h3>Bakı üzrə premium əhatə.</h3>
          <p>
            Hava limanı transferləri, şəhərdaxili görüşlər, hotellər və
            özəl tədbirlər üçün mərkəzləşdirilmiş premium xidmət.
          </p>
        </article>

        <article className="info-panel">
          <span className="eyebrow">Haqqımızda</span>
          <h3>Əsasda qonaqpərvərlik dayanır.</h3>
          <p>
            VIP MOTORS avtomobil intizamını, sürücü etiketi və sakit lüks
            hissini vahid müştəri təcrübəsində birləşdirir.
          </p>
        </article>
      </section>

      <section className="closing-panel" id="contact">
        <span className="eyebrow">Standartı rezerv edin</span>
        <h2>Komfort üçün düşünülüb. Mükəmməllik üçün qurulub.</h2>
        <p>
          VIP MOTORS hər səfərə premium yanaşma gətirir: hava limanı
          transferindən yüksək səviyyəli biznes hərəkətinə qədər.
        </p>
        <div className="story-card__actions">
          <a href="tel:+994000000000" className="cta-button">
            Bizimlə əlaqə
          </a>
          <a href="mailto:booking@vipmotors.az" className="cta-button cta-button--ghost">
            booking@vipmotors.az
          </a>
        </div>
      </section>
    </main>
  );
}
