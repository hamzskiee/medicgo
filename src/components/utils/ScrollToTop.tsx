import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const scrollToTop = () => {
     
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant", 
      });

      document.body.scrollTo(0, 0);
      document.documentElement.scrollTo(0, 0);

      const root = document.getElementById("root");
      if (root) root.scrollTo(0, 0);
    };
    scrollToTop();

    requestAnimationFrame(() => {
      scrollToTop();
    });
  }, [pathname]);

  return null;
}
