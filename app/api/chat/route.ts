import { NextRequest, NextResponse } from "next/server";
import { findBrand, pickSpec, FuelType, OilSpec } from "@/lib/oil/database";

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-5.1";

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

Premium Alman markalarında (BMW, Mercedes-Benz, Audi, Volkswagen, Porsche) model işarəsi mühərrik haqqında məlumat daşıyır. İstifadəçi mühərrik həcmini və ya yanacağı açıq yazmasa belə, model + il məlumdursa, öz bilikinə əsaslanaraq engineCc və fuel sahələrini DOLDUR:
- VACİB: badge rəqəmini birbaşa həcm kimi qəbul ETMƏ — modelin real nəsli və ilinə uyğun faktiki həcmi yaz. Məsələn: BMW 528i (F10, 2011-2016) → engineCc 1997 (2.0 turbo, N20), 2.8 DEYİL; BMW 530i (E60, 2003-2007) → 2996; BMW 320i (F30) → 1997; Mercedes E220 (W212) → təxminən 2143.
- Modeli dəqiq tanıyırsansa engineCc-ni təxmin et; yalnız model/il həqiqətən qeyri-müəyyəndirsə null saxla.
- engineCode-u da bildiyin halda doldur: Mercedes E220 (W212, dizel) → "OM651"; Mercedes E200/E250 CGI → "M274/M271"; BMW 528i (F10) → "N20"; BMW 320d (F30) → "N47/B47"; Audi/VW 2.0 TFSI → "EA888", 2.0 TDI → "EA288". Kuza/şassi kodu (W212, F10, E60) modeli tanımağa kömək edir — istifadəçi onu yazsa, mütləq nəzərə al.

Yanacaq növü tanıma:
- "benzin", "petrol", "qazolin", "gasoline" → "petrol"
- "dizel", "diesel", "tdi", "cdi", "hdi", "crdi", "dci" → "diesel"
- "hibrid", "hybrid", "hev", "phev", "plug-in" → "hybrid"
- "elektrik", "electric", "ev", "bev" → "ev"
- Model adı dizeli birbaşa göstərirsə (məs. "E220d", "320d", "Tiguan TDI") → "diesel"
- Alman premium markalarında badge yanacağı göstərir: BMW/Mercedes sonunda "d" (320d, E220d) → "diesel"; "i" (528i, 320i) → "petrol"; "e"/"iPerformanceeDrive" → "hybrid". Audi/VW: TFSI/TSI → "petrol", TDI → "diesel".
- "528", "320", "E220" kimi yalnız rəqəmli yazılışda da, model + ilə görə tipik yanacağı (adətən "petrol") təyin et.
- Tesla, hər hansı tam elektrik model → "ev"
- Tanınan Alman modeli üçün yuxarıdakı qaydalarla təxmin et; yalnız naməlum marka/modeldə və aydın deyilsə null qaytar.

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

// Hibrid: GPT əsas mənbədir (modelə/mühərrikə görə dəqiq), lokal baza isə
// yalnız yoxlama/dəstək referansı kimi prompt-a ötürülür.
function buildRecommendPrompt(data: Extracted, dbRef: OilSpec | null): string {
  const ref = dbRef
    ? `Daxili baza referansı (YALNIZ yoxlama/dəstək üçün, marka+il üzrə ümumidir, konkret mühərrikə görə DEYİL): SAE ${dbRef.sae}, Standart ${dbRef.standard}, Tip ${dbRef.type}, Həcm ${dbRef.capacityLiters} L. Əgər bu konkret model/mühərrik üçün istehsalçının düzgün tələbi fərqlidirsə, ÖZ DÜZGÜN dəyərini ver — bazaya kor-koranə uyma.`
    : `Daxili bazada bu marka yoxdur — tamamilə öz texniki bilikinə əsaslan.`;

  return `Sən VIP Motors Baku Yağ Seçici Botusan. Aşağıdakı avtomobil üçün KONKRET model və mühərrikə uyğun, dəqiq mühərrik yağı tövsiyəsi ver. Öz texniki bilikin ƏSAS mənbədir.

${ref}

Avtomobil məlumatı:
${JSON.stringify(data, null, 2)}

CAVABI yalnız aşağıdakı formatda, Azərbaycan dilində MƏTN kimi qaytar:

Salam! VIP Motors Baku Yağ Seçici Bot nəticəsi:

🚗 Avtomobil:
- Marka/Model: [marka model, məs. BMW 528i]
- İl: [il]
- Mühərrik: [həcm cc və/və ya kod, məs. 1997 cc · N20]
- Yanacaq: [Benzin/Dizel/Hibrid/Elektrik]

🛢 Tövsiyə olunan mühərrik yağı:
- SAE: [əsas özlülük, məs. 5W-30]
- Standart: [istehsalçı təsdiqi, məs. BMW Longlife-01 (LL-01)]
- Tip: Tam sintetik
- Həcm: [filtirlə birlikdə litr, məs. 5 L]
- Dəyişmə intervalı: [km aralığı, məs. 7000-10000 km]

📊 Nəticənin etibarlılığı:
[✅ Yüksək / ⚠️ Orta] — [qısa səbəb]

📞 Avtoservis ilə əlaqə saxlayın: +994 55 244 06 46

QAYDALAR:
- Yalnız yuxarıdakı mətni qaytar, başqa heç nə yazma.
- Özlülüyü (SAE) məhz bu mühərrik üçün düzgün ver — bu ən vacib sahədir.
- Həcmi həmişə litr ilə konkret yaz, tək rəqəm yazma.
- Elektrik avtomobildə yağ tutumu və interval "—" yaz.`;
}

async function callOpenAI(messages: any[], maxTokens: number) {
  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_completion_tokens: maxTokens,
      reasoning_effort: "low",
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
      1200
    );

    if (!extractRaw) {
      return NextResponse.json({ reply: "Cavab alına bilmədi.", needsContact: true });
    }

    const extracted = parseJson(extractRaw);
    if (!extracted || !extracted.brand) {
      return NextResponse.json({
        reply: "Avtomobil markasını müəyyən edə bilmədim. Marka, model, il və yanacaq növünü yazın.\n\nNümunə: BMW 520d 2016 dizel",
        needsContact: true
      });
    }

    // engineCc yağ seçiminə təsir etmir (pickSpec yalnız il + yanacaqdan asılıdır),
    // ona görə onu məcburi tələb etmirik — GPT modeldən təxmin edir, yoxsa boş qalır.
    const missing: string[] = [];
    if (!extracted.model) missing.push("model");
    if (!extracted.year) missing.push("il");
    if (!extracted.fuel && extracted.fuel !== "ev") missing.push("yanacaq növü (benzin / dizel / hibrid / elektrik)");

    if (missing.length > 0) {
      const engineHint = extracted.engineCc ? `${(extracted.engineCc / 1000).toFixed(1)}` : "[mühərrik]";
      return NextResponse.json({
        reply: `Dəqiq tövsiyə üçün bir az daha məlumat lazımdır. Zəhmət olmasa bunları da yazın: ${missing.join(", ")}.\n\nNümunə: ${extracted.brand} ${extracted.model ?? "[model]"} ${extracted.year ?? "[il]"} ${engineHint} ${extracted.fuel ? FUEL_LABEL[extracted.fuel].toLowerCase() : "[yanacaq]"}`,
        needsContact: true
      });
    }

    // Lokal bazadan yalnız referans götürürük (yoxlama üçün); əsas tövsiyəni
    // GPT modelə/mühərrikə görə dəqiq verir.
    const brandMatch = findBrand(extracted.brand);
    const dbReference: OilSpec | null = brandMatch
      ? pickSpec(brandMatch.entry, extracted.year, extracted.fuel).spec
      : null;

    const reply = await callOpenAI(
      [{ role: "user", content: buildRecommendPrompt(extracted, dbReference) }],
      1400
    );

    return NextResponse.json(
      reply ? { reply } : { reply: "Cavab alına bilmədi.", needsContact: true }
    );
  } catch (err: any) {
    console.error("Route error:", err);
    return NextResponse.json(
      { reply: `Xəta: ${err?.message ?? "naməlum"}. Yenidən cəhd edin.`, needsContact: true },
      { status: 500 }
    );
  }
}
