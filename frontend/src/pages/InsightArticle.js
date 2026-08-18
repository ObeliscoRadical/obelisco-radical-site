import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Calendar } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";
const logoUrl = "https://customer-assets.emergentagent.com/job_5fce1f4d-80cf-4626-b6e9-65e04d47c472/artifacts/h167wiyk_Captura%20de%20Tela%202026-03-12%20a%CC%80s%2021.48.12.png";

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });
  } catch (e) {
    return "";
  }
}

function ArticleSection({ section }) {
  const paragraphs = Array.isArray(section.paragraphs) ? section.paragraphs : [];
  const bullets = Array.isArray(section.bullets) ? section.bullets : [];
  return (
    <div className="mb-8">
      {section.heading && (
        <h2 className="text-xl md:text-2xl font-bold text-zinc-50 mb-3">{section.heading}</h2>
      )}
      {paragraphs.map((p, i) => (
        <p key={i} className="text-zinc-300 leading-relaxed mb-3">{p}</p>
      ))}
      {!paragraphs.length && section.content && (
        <p className="text-zinc-300 leading-relaxed mb-3">{section.content}</p>
      )}
      {bullets.length > 0 && (
        <ul className="list-disc list-inside space-y-1 text-zinc-300 mb-3">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function InsightArticle({ slug }) {
  const [status, setStatus] = useState("loading"); // loading | ok | not_found | error
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetch(`${BACKEND_URL}/api/public/site/article/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) {
          setStatus("not_found");
          return;
        }
        if (!res.ok) {
          setStatus("error");
          return;
        }
        const data = await res.json();
        setEntry(data.entry || null);
        setStatus("ok");
        fetch(`${BACKEND_URL}/api/public/site/view/article/${encodeURIComponent(slug)}`, { method: "POST" }).catch(() => {});
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (entry?.seo_title || entry?.title) {
      document.title = entry.seo_title || entry.title;
    }
  }, [entry]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src={logoUrl} alt="Obelisco Radical Eletricidade" className="h-9 w-auto" />
          </a>
          <a href="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-yellow-400 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao site
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        {status === "loading" && (
          <div className="flex items-center justify-center py-24 text-zinc-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {status === "error" && (
          <div className="text-center py-24">
            <p className="text-zinc-400">Nao foi possivel carregar este artigo neste momento.</p>
            <a href="/" className="inline-block mt-4 text-yellow-400 hover:underline">Voltar ao site</a>
          </div>
        )}

        {status === "not_found" && (
          <div className="text-center py-24">
            <h1 className="text-2xl font-bold text-zinc-50 mb-2">Artigo nao encontrado</h1>
            <p className="text-zinc-400">Este artigo pode ter sido removido ou o link esta incorreto.</p>
            <a href="/" className="inline-block mt-4 text-yellow-400 hover:underline">Voltar ao site</a>
          </div>
        )}

        {status === "ok" && entry && (
          <article>
            {entry.hero_image_url && (
              <img
                src={entry.hero_image_url}
                alt={entry.title || ""}
                className="w-full aspect-video object-cover rounded-xl mb-6 bg-zinc-900"
              />
            )}
            <h1 className="text-2xl md:text-4xl font-bold text-zinc-50 mb-3">{entry.title}</h1>
            {entry.published_at && (
              <div className="flex items-center gap-1.5 text-sm text-zinc-500 mb-6">
                <Calendar className="h-4 w-4" />
                {formatDate(entry.published_at)}
              </div>
            )}
            {entry.intro && (
              <p className="text-lg text-zinc-200 leading-relaxed mb-8">{entry.intro}</p>
            )}
            {Array.isArray(entry.sections) && entry.sections.map((section, i) => (
              <ArticleSection key={i} section={section || {}} />
            ))}
            {entry.cta_label && (
              <a
                href={entry.cta_url || "/#contact"}
                className="inline-block mt-4 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                {entry.cta_label}
              </a>
            )}
          </article>
        )}
      </main>
    </div>
  );
}
