/**
 * Component: ScrollToTop.jsx
 * MVC Layer: View (Utility Component)
 * Responsibility: Scrolls the window to the top whenever the route changes.
 * Place this inside <Router> in App.jsx.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null; // Renders nothing — utility only
}
