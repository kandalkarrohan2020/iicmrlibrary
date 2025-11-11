import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100); // Delay for 100ms to ensure it executes after page render
  }, [pathname]);

  return null;
};

export default ScrollToTop;