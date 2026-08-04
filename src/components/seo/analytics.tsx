import { getAnalyticsIds } from "@/lib/seo/public";

const GTM_SNIPPET = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',`; // id appended below

const GA_SNIPPET = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',`; // id appended below

/**
 * Injects Google Analytics (GA4) and/or Google Tag Manager on the public site,
 * driven entirely by the SEO panel. Renders nothing when no IDs are set.
 */
export async function Analytics() {
  const { gaId, gtmId } = await getAnalyticsIds();
  if (!gaId && !gtmId) return null;

  return (
    <>
      {gtmId && (
        <script
          dangerouslySetInnerHTML={{ __html: `${GTM_SNIPPET}'${gtmId}');` }}
        />
      )}
      {gaId && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
          <script dangerouslySetInnerHTML={{ __html: `${GA_SNIPPET}'${gaId}');` }} />
        </>
      )}
    </>
  );
}
