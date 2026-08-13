const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;

const hasAnalytics = () =>
  typeof window !== "undefined" &&
  typeof window.gtag === "function" &&
  Boolean(GA_MEASUREMENT_ID);

export const trackPageView = (
  path = `${window.location.pathname}${window.location.search}`
) => {
  if (!hasAnalytics()) {
    return;
  }

  window.gtag("event", "page_view", {
    send_to: GA_MEASUREMENT_ID,
    page_title: document.title,
    page_location: `${window.location.origin}${path}`,
    page_path: path,
  });
};