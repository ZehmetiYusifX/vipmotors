import { NextRequest, NextResponse } from "next/server";
import { findBrand, pickSpec, FuelType, OilSpec } from "@/lib/oil/database";

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const EXTRACT_PROMPT = `Sən avtomobil məlumatlarını çıxaran assistant-san. İstifadəçinin mesajından və/və ya texpasport şəklindən bu məlumatları çıxar və YALNIZ JSON qaytar:

{
  "brand": "marka adı və ya null",
  "model": "model adı və ya null",
  "year": rəqəm və ya null,
  "engineCc": mühərrik həcmi cc-də rəqəm və ya null,
  "fuel": "petrol" | "diesel" | "hybrid" | "ev" və ya null,
  "engineCode": "mühərrik kodu varsa (məs. N20, EA888) və ya null"
}

Mühərrik həcmi tanıma (engineCc həmişə cc-də rəqəm olmalıdır):
- "2 mator", "2.0", "2.0L", "2L" → 2000
- "1.5", "1.5 mator", "1500cc" → 1500
- "2000cc", "2000 cc", "2.0 litr" → 2000
- "3.5", "3.5L" → 3500
- Yalnız rəqəm yazılıbsa (məs. "2") və kontekst mühərrik həcmidirsə → rəqəm × 1000

Yanacaq növü tanıma:
- "benzin", "petrol", "qazolin", "gasoline" → "petrol"
- "dizel", "diesel", "tdi", "cdi", "hdi", "crdi", "dci" → "diesel"
- "hibrid", "hybrid", "hev", "phev", "plug-in" → "hybrid"
- "elektrik", "electric", "ev", "bev" → "ev"
- Model adı dizeli birbaşa göstərirsə (məs. "E220d", "320d", "Tiguan TDI") → "diesel"
- Tesla, hər hansı tam elektrik model → "ev"
- Aydın deyilsə null qaytar, təxmin etmə.

Şəkil texpasport olduqda:
- D sahəsi = marka
- D.2 sahəsi = model
- D.3 sahəsi = tip
- G sahəsi = mühərrik həcmi (cc), yağ həcmi DEYİL
- P.3 sahəsi = yanacaq növü

Yalnız JSON qaytar, başqa heç nə yazma. Bilmədiyin sahəni null yaz.`;

const FUEL_LABEL: Record<string, string> = {
  petrol: "Benzin",
  diesel: "Dizel",
  hybrid: "Hibrid",
  ev: "Elektrik"
};

type Extracted = {
  brand: string | null;
  model: string | null;
  year: number | null;
  engineCc: number | null;
  fuel: FuelType | null;
  engineCode: string | null;
};

function parseJson(text: string): Extracted | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const obj = JSON.parse(match[0]);
    return {
      brand: typeof obj.brand === "string" ? obj.brand : null,
      model: typeof obj.model === "string" ? obj.model : null,
      year: typeof obj.year === "number" ? obj.year : null,
      engineCc: typeof obj.engineCc === "number" ? obj.engineCc : null,
      fuel: ["petrol", "diesel", "hybrid", "ev"].includes(obj.fuel) ? obj.fuel : null,
      engineCode: typeof obj.engineCode === "string" ? obj.engineCode : null
    };
  } catch {
    return null;
  }
}

function formatLiters(n: number): string {
  if (n === 0) return "—";
  return `${n.toFixed(1).replace(/\.0$/, "")} L (təxmini)`;
}

function buildReply(data: Extracted, spec: OilSpec, confidence: "high" | "medium" | "low", reason: string): string {
  const brand = data.brand ?? "—";
  const model = data.model ?? "—";
  const year = data.year ?? "—";
  const engine = data.engineCc ? `${data.engineCc} cc${data.engineCode ? ` · ${data.engineCode}` : ""}` : data.engineCode ?? "—";
  const fuel = data.fuel ? FUEL_LABEL[data.fuel] : "—";
  const conf = confidence === "high" ? "✅ Yüksək" : confidence === "medium" ? "⚠️ Orta" : "❌ Aşağı";
  const isEv = spec.capacityLiters === 0;

  return `Salam! VIP Motors Baku Yağ Seçici Bot nəticəsi:

🚗 Avtomobil:
- Marka/Model: ${brand} ${model}
- İl: ${year}
- Mühərrik: ${engine}
- Yanacaq: ${fuel}

🛢 Tövsiyə olunan mühərrik yağı:
- SAE: ${spec.sae}
- Standart: ${spec.standard}
- Tip: ${spec.type}
- Həcm: ${formatLiters(spec.capacityLiters)}
- Dəyişmə intervalı: ${isEv ? "—" : "5000-8000 km"}

📊 Nəticənin etibarlılığı:
${conf} — ${reason}

📞 Avtoservis ilə əlaqə saxlayın: +994 55 244 06 46`;
}

async function callOpenAI(messages: any[], maxTokens: number) {
  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: maxTokens,
      messages
    })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message ?? `OpenAI ${response.status}`);
  }
  return data.choices?.[0]?.message?.content as string | undefined;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, image } = body;

    const userContent: any[] = [];
    if (image) {
      userContent.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } });
    }
    userContent.push({
      type: "text",
      text: message || "Şəkili analiz et və avtomobil məlumatlarını çıxar."
    });

    const extractRaw = await callOpenAI(
      [
        { role: "system", content: EXTRACT_PROMPT },
        { role: "user", content: userContent }
      ],
      400
    );

    if (!extractRaw) {
      return NextResponse.json({ reply: "Cavab alına bilmədi." });
    }

    const extracted = parseJson(extractRaw);
    if (!extracted || !extracted.brand) {
      return NextResponse.json({
        reply: "Avtomobil markasını müəyyən edə bilmədim. Marka, model, il və yanacaq növünü yazın.\n\nNümunə: Mercedes E220 2015 dizel"
      });
    }

    const missing: string[] = [];
    if (!extracted.model) missing.push("model");
    if (!extracted.year) missing.push("il");
    if (!extracted.engineCc) missing.push("mühərrik həcmi (məs. 2.0 və ya 2000cc)");
    if (!extracted.fuel && extracted.fuel !== "ev") missing.push("yanacaq növü (benzin / dizel / hibrid / elektrik)");

    if (missing.length > 0) {
      const engineHint = extracted.engineCc ? `${(extracted.engineCc / 1000).toFixed(1)}` : "[mühərrik]";
      return NextResponse.json({
        reply: `Dəqiq tövsiyə üçün bir az daha məlumat lazımdır. Zəhmət olmasa bunları da yazın: ${missing.join(", ")}.\n\nNümunə: ${extracted.brand} ${extracted.model ?? "[model]"} ${extracted.year ?? "[il]"} ${engineHint} ${extracted.fuel ? FUEL_LABEL[extracted.fuel].toLowerCase() : "[yanacaq]"}`
      });
    }

    const brandMatch = findBrand(extracted.brand);

    if (brandMatch) {
      const { spec, matched } = pickSpec(brandMatch.entry, extracted.year, extracted.fuel);
      let confidence: "high" | "medium" | "low" = "medium";
      let reason = "Marka tanındı, dəqiq mühərrik kodu olmadan ümumi tövsiyə.";
      if (matched === "exact" && extracted.engineCc) {
        confidence = "high";
        reason = "Marka, il, yanacaq və mühərrik həcminə uyğun istehsalçı spesifikasiyası.";
      } else if (matched === "exact") {
        confidence = "high";
        reason = "Marka, il və yanacaq növünə uyğun istehsalçı standartı.";
      } else if (matched === "default") {
        confidence = "medium";
        reason = "Marka tanındı, il aralığı üçün xüsusi qayda yoxdur — markanın əsas standartı tətbiq edildi.";
      }
      const reply = buildReply(extracted, spec, confidence, reason);
      return NextResponse.json({ reply });
    }

    const fallbackPrompt = `Sən VIP Motors Baku Yağ Seçici Botusan. Aşağıdakı avtomobil üçün yağ tövsiyəsi ver. Bizim bazada bu marka yoxdur, ona görə öz bilikindən istifadə et və CAVABI MƏTN KİMİ AZƏRBAYCAN DİLİNDƏ bu formatda qaytar:

Salam! VIP Motors Baku Yağ Seçici Bot nəticəsi:

🚗 Avtomobil:
- Marka/Model: [marka model]
- İl: [il]
- Mühərrik: [həcm və/və ya kod]

🛢 Tövsiyə olunan mühərrik yağı:
- SAE: [SAE]
- Standart: [API/ACEA standartı]
- Tip: Tam sintetik
- Həcm: [litr] L (təxmini)
- Dəyişmə intervalı: 5000-8000 km

📊 Nəticənin etibarlılığı:
⚠️ Orta — Marka bazada yoxdur, ümumi mühərrik tipinə əsasən tövsiyə.

📞 Avtoservis ilə əlaqə saxlayın: +994 55 244 06 46

Avtomobil məlumatı:
${JSON.stringify(extracted, null, 2)}

QAYDA: Həcmi həmişə "(təxmini)" ilə yaz. İntervalı həmişə "5000-8000 km" yaz. Tək rəqəm yazma.`;

    const fallbackReply = await callOpenAI(
      [{ role: "user", content: fallbackPrompt }],
      500
    );

    return NextResponse.json({ reply: fallbackReply || "Cavab alına bilmədi." });
  } catch (err: any) {
    console.error("Route error:", err);
    return NextResponse.json({ reply: `Xəta: ${err?.message ?? "naməlum"}. Yenidən cəhd edin.` }, { status: 500 });
  }
}
