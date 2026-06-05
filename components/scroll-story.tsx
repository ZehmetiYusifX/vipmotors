"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import Lenis from "lenis";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Wrench,
  Gauge,
  Cog,
  Droplet,
  Disc3,
  Snowflake,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  Star,
  ArrowRight,
  Navigation
} from "lucide-react";

function WhatsApp({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.32.244-.673.244-1.017 0-.244-1.46-.96-1.687-1.075-.13-.057-.36-.144-.5-.144zM15.999 28.793c-2.42 0-4.81-.72-6.825-2.066L4 28.293l1.61-5.087C4.108 21.115 3.299 18.598 3.299 16c0-7.011 5.689-12.7 12.7-12.7S28.7 8.99 28.7 16s-5.689 12.7-12.7 12.793zm0-23.063c-5.731 0-10.376 4.645-10.376 10.27 0 2.235.717 4.367 2.072 6.13l-.93 2.857 2.962-.93a10.286 10.286 0 0 0 6.272 2.13c5.732 0 10.376-4.645 10.376-10.376S21.732 5.73 16 5.73z" />
    </svg>
  );
}

function Instagram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

import { AuthNav } from "./landing/AuthNav";
import { OilsPreview } from "./landing/OilsPreview";
import ChatWidget from "@/components/ChatWidget";
import { cn } from "@/lib/cn";

type Service = {
  id: string;
  title: string;
  body: string;
  Icon: typeof Wrench;
};

type Review = {
  name: string;
  quote: string;
  rating: number;
};

const SERVICES: Service[] = [
  {
    id: "01",
    title: "Yağ və filtr dəyişimi",
    body: "Mühərrik yağı, hava, salon və yağ filtrləri — istehsalçı tövsiyəsinə uyğun.",
    Icon: Droplet
  },
  {
    id: "02",
    title: "Sürətlər qutusu təmiri",
    body: "Avtomat və mexaniki qutularda keçid problemi, zərbə, səs və yağ sızması.",
    Icon: Cog
  },
  {
    id: "03",
    title: "Kompüter diaqnostikası",
    body: "Check engine, sensor nasazlıqları, elektron blok xətaları — peşəkar skaner.",
    Icon: Gauge
  },
  {
    id: "04",
    title: "Əyləc və asqı baxışı",
    body: "Kolodka, disk, amortizator, şaravoy və ön hissə təhlükəsizlik yoxlaması.",
    Icon: Disc3
  },
  {
    id: "05",
    title: "Mühərrik servisi",
    body: "Yağ sızması, qızma, səs və qeyri-sabit işləmə — mərhələli diaqnostika.",
    Icon: Wrench
  },
  {
    id: "06",
    title: "Kondisioner və soyutma",
    body: "Freon doldurulması, radiator və soyutma sistemi, yay mövsümünə hazırlıq.",
    Icon: Snowflake
  }
];

const REVIEWS: Review[] = [
  {
    name: "Kamran",
    quote: "Yağ dəyişiminə getmişdim, əyləc problemini də vaxtında aşkar etdilər. Səliqəli iş.",
    rating: 5
  },
  {
    name: "Nihad",
    quote: "Sürətlər qutusunda gecikmə vardı. Problemi dəqiq dedilər və boş yerə xərc çıxmadı.",
    rating: 5
  },
  {
    name: "Aysel",
    quote: "Müştəri ilə danışıq tərzi çox rahatdır. Hansı hissə niyə dəyişir, hamısını izah edirlər.",
    rating: 5
  },
  {
    name: "Tural",
    quote: "Diaqnostika dəqiqdir. Başqa yerdə tapa bilmədikləri xətanı burada həll etdilər.",
    rating: 5
  },
  {
    name: "Səbinə",
    quote: "Qiymət əvvəl deyilir, sonradan əlavə çıxmır. Bu, etibar yaradır.",
    rating: 5
  }
];

const FOUNDING_YEAR = 1992;
const YEARS_OF_EXPERIENCE = new Date().getFullYear() - FOUNDING_YEAR;

const STATS = [
  { value: "5000+", label: "Servis edilən avtomobil" },
  { value: `${YEARS_OF_EXPERIENCE}`, label: "İl təcrübə" },
  { value: "98%", label: "Müştəri məmnuniyyəti" },
  { value: "24s", label: "Orta təhvil müddəti" }
];

const PHONE_DISPLAY = "+994 55 244 06 46";
const PHONE_TEL = "+994552440646";
const WHATSAPP_URL = `https://wa.me/${PHONE_TEL.replace(/\D/g, "")}`;
const INSTAGRAM_URL = "https://www.instagram.com/vipmotors_baku/";
const LAT = 40.3902138;
const LNG = 49.8921322;
const ADDRESS_LABEL = "VIP Motors Baku";
const MAPS_LINKS = {
  google: `https://www.google.com/maps?cid=562961876439446058`,
  apple: `https://maps.apple.com/?ll=${LAT},${LNG}&q=${encodeURIComponent(ADDRESS_LABEL)}`,
  waze: `https://www.waze.com/ul?ll=${LAT}%2C${LNG}&navigate=yes`,
  yandex: `https://yandex.com/maps/?pt=${LNG},${LAT}&z=17&l=map`
};

export function ScrollStory() {
  const reducedMotion = useReducedMotion();

  const [navSolid, setNavSolid] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);

  const NAV_LINKS = useMemo(
    () => [
      { id: "overview", label: "Baxış", path: "/" },
      { id: "services", label: "Xidmətlər", path: "/services" },
      { id: "oils", label: "Kataloq", path: "/catalog" },
      { id: "reviews", label: "Rəylər", path: "/reviews" },
      { id: "contact", label: "Əlaqə", path: "/contact" }
    ],
    []
  );

  const lenisRef = useRef<Lenis | null>(null);

  // Capture the entry path during render, before the scroll-spy effect can
  // rewrite it to "/", so deep-link scrolling targets the right section.
  const entryPathRef = useRef<string | null>(null);
  if (entryPathRef.current === null) {
    entryPathRef.current =
      typeof window === "undefined" ? "/" : window.location.pathname;
  }

  const goToSection = useCallback(
    (id: string, path: string) => {
      const el = document.getElementById(id);
      if (el) {
        if (lenisRef.current) {
          lenisRef.current.scrollTo(el, { offset: 0 });
        } else {
          el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
        }
      }
      setActiveSection(id);
      if (window.location.pathname !== path) {
        window.history.replaceState(window.history.state, "", path);
      }
    },
    [reducedMotion]
  );

  useEffect(() => {
    if (reducedMotion) return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenisRef.current = lenis;
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  useEffect(() => {
    const onScroll = () => {
      setNavSolid(window.scrollY > 24);
      for (const link of NAV_LINKS) {
        const el = document.getElementById(link.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= 120 && r.bottom >= 120) {
          setActiveSection(link.id);
          if (window.location.pathname !== link.path) {
            window.history.replaceState(window.history.state, "", link.path);
          }
          break;
        }
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [NAV_LINKS]);

  // Deep-link: when the page loads on a section route (e.g. /catalog via
  // rewrite), jump to that section so refresh / direct entry lands correctly.
  useEffect(() => {
    const target = NAV_LINKS.find(
      (l) => l.path !== "/" && l.path === entryPathRef.current
    );
    if (!target) return;
    const rafId = window.requestAnimationFrame(() => {
      const el = document.getElementById(target.id);
      if (el) {
        if (lenisRef.current) lenisRef.current.scrollTo(el, { immediate: true });
        else el.scrollIntoView({ behavior: "auto" });
      }
      setActiveSection(target.id);
      window.history.replaceState(window.history.state, "", target.path);
    });
    return () => window.cancelAnimationFrame(rafId);
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  return (
    <main className="relative bg-ink-950 text-ink-100">
      {/* Top bar */}
      <motion.header
        initial={false}
        animate={{ y: 0 }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          navSolid ? "glass-strong shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]" : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
              <Image
                src="/images/vip-motors-logo.png"
                alt="VIP Motors logo"
                width={40}
                height={40}
                priority
                className="h-full w-full object-contain"
              />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              VIP <span className="text-ink-300">Motors Baku</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={link.path}
                onClick={(e) => {
                  e.preventDefault();
                  goToSection(link.id, link.path);
                }}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-colors rounded-lg",
                  activeSection === link.id
                    ? "text-white"
                    : "text-ink-300 hover:text-white"
                )}
              >
                {link.label}
                {activeSection === link.id && (
                  <motion.span
                    layoutId="navActive"
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand-500"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${PHONE_TEL}`}
              className="hidden md:inline-flex items-center gap-2 rounded-full border-hairline px-3.5 py-2 text-sm font-medium text-white hover:bg-white/5 transition-colors"
            >
              <Phone className="h-4 w-4 text-brand-400" />
              <span className="hidden xl:inline">{PHONE_DISPLAY}</span>
              <span className="xl:hidden">Zəng</span>
            </a>
            <div className="hidden sm:block">
              <AuthNav />
            </div>
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border-hairline text-white hover:bg-white/5"
              aria-label="Menyu"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden glass-strong border-t border-white/5"
          >
            <nav className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={link.path}
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileNavOpen(false);
                    goToSection(link.id, link.path);
                  }}
                  className="flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium text-ink-200 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4 text-ink-400" />
                </a>
              ))}
              <div className="mt-2 pt-3 border-t border-white/5 sm:hidden">
                <AuthNav />
              </div>
            </nav>
          </motion.div>
        )}
      </motion.header>

      {/* Hero */}
      <section className="relative h-screen w-full overflow-hidden" id="overview">
        <video
          className="absolute inset-0 h-full w-full object-cover hidden md:block"
          src="/videos/hero.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
        <video
          className="absolute inset-0 h-full w-full object-cover md:hidden"
          src="/videos/mobilehero.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
        <div className="relative z-20 h-full grid place-items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl flex flex-col gap-5 items-center text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] text-gradient">
              Avtomobiliniz etibarlı ustaların əlində.
            </h1>
            <p className="text-base sm:text-lg text-ink-200/90 max-w-xl leading-relaxed">
              Gündəlik baxımdan ağır təmirə qədər — peşəkar servis axını, şəffaf qiymət, sürətli təhvil.
            </p>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              <a
                href={`tel:${PHONE_TEL}`}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 hover:bg-brand-400 px-5 py-3 text-sm font-semibold text-white shadow-glow transition-all"
              >
                <Phone className="h-4 w-4" /> İndi zəng et
              </a>
              <a
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-white text-ink-950 hover:bg-ink-100 px-5 py-3 text-sm font-semibold shadow-glow transition-all"
              >
                Qeydiyyatdan keç <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/services"
                onClick={(e) => {
                  e.preventDefault();
                  goToSection("services", "/services");
                }}
                className="inline-flex items-center gap-2 rounded-full glass px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Xidmətlərə bax <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-white/5 bg-ink-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center sm:text-left">
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                {s.value}
              </div>
              <div className="mt-1 text-xs uppercase tracking-[0.18em] text-ink-400">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32" id="about">
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
              Gündəlik baxımdan ağır təmirə qədər{" "}
              <span className="text-gradient">etibarlı xidmət.</span>
            </h2>
            <p className="mt-6 text-lg text-ink-300 max-w-2xl leading-relaxed">
              VIP Motors Baku Azərbaycan sürücüləri üçün rahat qəbul, aydın diaqnostika
              və nəticəyə yönəlmiş usta işi təqdim edir. Avtomobili düzgün təmir
              edib sahibinə inamla təhvil verməyimiz bizim üçün əsas məsələdir.
            </p>
          </div>
          <div className="lg:col-span-5 grid grid-cols-1 gap-3">
            {[
              { label: "Gündəlik qəbul", value: "Bakı üzrə operativ servis", Icon: Clock },
              { label: "Əsas xidmətlər", value: "Sürtkü yağları, çilingər işləri, mühərrik və transmissiya, ehtiyat hissələri", Icon: Wrench },
              { label: "Müştəri dəstəyi", value: "Aydın izah və servis qeydi", Icon: ShieldCheck }
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-4 rounded-2xl border-hairline bg-ink-900/40 p-4 hover:bg-ink-900/70 transition-colors"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/10 text-brand-400">
                  <item.Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400">
                    {item.label}
                  </div>
                  <div className="text-white font-medium">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="relative py-24 sm:py-32" id="services">
        <div className="absolute inset-0 grid-bg radial-fade opacity-60 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
              Servisimiz ən çox tələb olunan{" "}
              <span className="text-gradient">avtomobil işlərini</span> bir məkanda toplayır.
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((s) => (
              <article
                key={s.id}
                className="group relative rounded-2xl border-hairline bg-ink-900/50 p-6 hover:bg-ink-900 hover:border-brand-500/30 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand-500/0 group-hover:bg-brand-500/10 blur-2xl transition-all duration-500" />
                <div className="relative flex items-start justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-700/10 border border-brand-500/20 text-brand-300 group-hover:text-brand-200 group-hover:scale-110 transition-all">
                    <s.Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono text-ink-500">{s.id}</span>
                </div>
                <h3 className="relative mt-5 text-xl font-semibold text-white">{s.title}</h3>
                <p className="relative mt-2 text-sm text-ink-300 leading-relaxed">{s.body}</p>
                <div className="relative mt-5 flex items-center gap-1.5 text-xs font-medium text-brand-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  Ətraflı <ArrowRight className="h-3 w-3" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <OilsPreview />

      {/* Reviews */}
      <section className="relative py-24 sm:py-32 bg-ink-900/30 border-y border-white/5" id="reviews">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
              Sürücülər ən çox <span className="text-gradient">dürüst yanaşmanı</span> qeyd edir.
            </h2>
          </div>
        </div>

        {/* Marquee */}
        <div className="relative mt-12 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-ink-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-ink-950 to-transparent z-10 pointer-events-none" />
          <div className="flex gap-5 w-max animate-[marquee_40s_linear_infinite]">
            {[...REVIEWS, ...REVIEWS].map((r, i) => (
              <article
                key={`${r.name}-${i}`}
                className="w-[340px] sm:w-[380px] rounded-2xl border-hairline bg-ink-900/70 p-6 shrink-0"
              >
                <div className="flex items-center gap-1 text-brand-400">
                  {Array.from({ length: r.rating }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-ink-100 leading-relaxed">"{r.quote}"</p>
                <div className="mt-5 flex items-center gap-3 pt-5 border-t border-white/5">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-semibold text-white">
                    {r.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{r.name}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / CTA */}
      <section className="relative py-24 sm:py-32" id="contact">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border-hairline bg-gradient-to-br from-ink-900 via-ink-850 to-ink-900 p-8 sm:p-14">
            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
            <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-brand-700/20 blur-3xl" />

            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05]">
                  Servis vaxtıdırsa, <br className="hidden sm:block" />
                  <span className="text-gradient">komandamız hazırdır.</span>
                </h2>
                <p className="mt-5 text-lg text-ink-300 max-w-lg">
                  Yağ dəyişimi, diaqnostika, sürətlər qutusu və ümumi texniki baxım üçün
                  bizimlə əlaqə saxlayın.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href={`tel:${PHONE_TEL}`}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-500 hover:bg-brand-400 px-5 py-3 text-sm font-semibold text-white shadow-glow transition-all"
                  >
                    <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
                  </a>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full glass px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-400" /> WhatsApp
                  </a>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setMapPickerOpen(true)}
                  className="w-full flex items-start gap-4 rounded-2xl glass p-4 text-left hover:bg-white/[0.06] transition-colors group"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-300 shrink-0 group-hover:bg-brand-500/20">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400">
                      Ünvan
                    </div>
                    <div className="text-white font-medium break-words">
                      31 Babək pr, Baku 1149
                    </div>
                    <div className="mt-1 text-xs text-brand-300 inline-flex items-center gap-1">
                      <Navigation className="h-3 w-3" /> Xəritədə aç
                    </div>
                  </div>
                </button>

                <a
                  href={`tel:${PHONE_TEL}`}
                  className="flex items-start gap-4 rounded-2xl glass p-4 hover:bg-white/[0.06] transition-colors"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-300 shrink-0">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400">
                      Telefon
                    </div>
                    <div className="text-white font-medium break-words">{PHONE_DISPLAY}</div>
                  </div>
                </a>

                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-4 rounded-2xl glass p-4 hover:bg-white/[0.06] transition-colors"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-300 shrink-0">
                    <Instagram className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400">
                      Instagram
                    </div>
                    <div className="text-white font-medium break-words">@vipmotors_baku</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
                <Image
                  src="/images/vip-motors-logo.png"
                  alt="VIP Motors logo"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="text-[15px] font-semibold">
                VIP <span className="text-ink-300">Motors Baku</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-ink-400 leading-relaxed">
              Bakıda peşəkar avtomobil servisi. Diaqnostika, təmir, periodik baxım.
            </p>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-ink-500">Naviqasiya</div>
            <ul className="mt-4 space-y-2 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.path}
                    onClick={(e) => {
                      e.preventDefault();
                      goToSection(link.id, link.path);
                    }}
                    className="text-ink-300 hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-ink-500">Hesab</div>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/login" className="text-ink-300 hover:text-white">Daxil ol</Link></li>
              <li><Link href="/register" className="text-ink-300 hover:text-white">Qeydiyyat</Link></li>
              <li><Link href="/dashboard" className="text-ink-300 hover:text-white">Sürücü kabineti</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-ink-500">Əlaqə</div>
            <ul className="mt-4 space-y-2 text-sm text-ink-300">
              <li><a href={`tel:${PHONE_TEL}`} className="hover:text-white">{PHONE_DISPLAY}</a></li>
              <li>
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="hover:text-white inline-flex items-center gap-1.5">
                  <Instagram className="h-3.5 w-3.5" /> @vipmotors_baku
                </a>
              </li>
              <li>31 Babək pr, Baku 1149</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-500">
            <div>© {new Date().getFullYear()} VIP Motors Baku. Bütün hüquqlar qorunur.</div>
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <span>Bakı, Azərbaycan</span>
              <span aria-hidden="true" className="text-ink-700">·</span>
              <span>
                Bu sayt{" "}
                <a
                  href="https://codalov.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink-300 hover:text-white transition-colors"
                >
                  Codalov
                </a>{" "}
                tərəfindən hazırlanmışdır
              </span>
            </div>
          </div>
        </div>
      </footer>

      <ChatWidget />

      {mapPickerOpen && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-ink-950/70 backdrop-blur-sm p-4"
          onClick={() => setMapPickerOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong w-full max-w-sm rounded-2xl overflow-hidden shadow-[0_24px_80px_-20px_rgba(0,0,0,0.7)]"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div>
                <div className="text-sm font-semibold text-white">Xəritədə aç</div>
                <div className="text-xs text-ink-400 mt-0.5">Tətbiq seçin</div>
              </div>
              <button
                type="button"
                onClick={() => setMapPickerOpen(false)}
                aria-label="Bağla"
                className="grid h-8 w-8 place-items-center rounded-full text-ink-300 hover:text-ink-100 hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-3 space-y-2">
              {[
                { label: "Google Maps", href: MAPS_LINKS.google },
                { label: "Apple Maps", href: MAPS_LINKS.apple },
                { label: "Waze", href: MAPS_LINKS.waze },
                { label: "Yandex Xəritə", href: MAPS_LINKS.yandex }
              ].map((opt) => (
                <a
                  key={opt.label}
                  href={opt.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMapPickerOpen(false)}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 px-4 py-3 text-sm font-medium text-white transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500/15 text-brand-300">
                      <Navigation className="h-4 w-4" />
                    </span>
                    {opt.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-ink-400" />
                </a>
              ))}
            </div>
            <div className="px-5 pb-4 pt-1 text-[11px] text-ink-500 text-center">
              40°23'25.1"N · 49°53'32.3"E
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
