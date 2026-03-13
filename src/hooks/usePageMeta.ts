import { useEffect } from "react";

interface PageMeta {
  title: string;
  description: string;
  path?: string;
}

const BASE_URL = "https://nab-it-fast.lovable.app";
const OG_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = "nabbit.ai";

const usePageMeta = ({ title, description, path = "/" }: PageMeta) => {
  useEffect(() => {
    document.title = title;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", `${BASE_URL}${path}`);
    setMeta("property", "og:image", OG_IMAGE);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
  }, [title, description, path]);
};

export default usePageMeta;
