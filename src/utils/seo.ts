/**
 * Utilitário mínimo para SEO no SPA.
 * Atualiza <title>, <meta> dinâmicas em cada página.
 */

export interface SEOConfig {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  schema?: Record<string, unknown>;
}

export function updateSEO(config: SEOConfig) {
  // Title
  document.title = config.title;

  // Meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement("meta");
    metaDescription.setAttribute("name", "description");
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute("content", config.description);

  // Canonical
  if (config.canonical) {
    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", config.canonical);
  }

  // OG
  if (config.ogTitle) {
    setMetaProperty("og:title", config.ogTitle);
  }
  if (config.ogDescription) {
    setMetaProperty("og:description", config.ogDescription);
  }
  if (config.ogImage) {
    setMetaProperty("og:image", config.ogImage);
  }

  // Twitter
  if (config.twitterTitle) {
    setMetaName("twitter:title", config.twitterTitle);
  }
  if (config.twitterDescription) {
    setMetaName("twitter:description", config.twitterDescription);
  }
  if (config.twitterImage) {
    setMetaName("twitter:image", config.twitterImage);
  }

  // Schema.org (LD+JSON)
  if (config.schema) {
    let schemaScript = document.querySelector('script[type="application/ld+json"]');
    if (!schemaScript) {
      schemaScript = document.createElement("script");
      schemaScript.setAttribute("type", "application/ld+json");
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(config.schema);
  }
}

function setMetaProperty(property: string, content: string) {
  let meta = document.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

function setMetaName(name: string, content: string) {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}
