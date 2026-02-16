import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../../components/hero/Hero";
import VenuesSection from "../../components/venuesSection/VenuesSection";
import FooterSection from "../../components/footerSection/FooterSection";
import "./Home.css";

// Sections we care about for hash + snapping
const SECTION_IDS = ["hero", "venues"];

function Home() {
  const containerRef = useRef(null);
  const debounceRef = useRef();
  const isHashScrollRef = useRef(false); // guard so observer updates don't loop when we scroll to a hash
  const location = useLocation();

  // Scroll helper that keeps scroll-snap intact and avoids history flood
  const scrollToId = (id, behavior = "smooth") => {
    const el = document.getElementById(id);
    if (!el) return;
    isHashScrollRef.current = true;
    el.scrollIntoView({ behavior, block: "start" });
    // release guard shortly after the scroll animation begins
    setTimeout(() => {
      isHashScrollRef.current = false;
    }, 350);
  };

  // On mount & whenever the hash changes (including back/forward), align scroll to hash or default hero.
  useEffect(() => {
    const rawId = (location.hash || "").replace("#", "");
    const targetId = SECTION_IDS.includes(rawId) ? rawId : "hero";
    // If no hash (e.g., navigating to /home), jump instantly to hero to clear any previous scroll.
    const behavior = location.hash ? "smooth" : "auto";
    scrollToId(targetId, behavior);
  }, [location.pathname, location.hash]);

  // Observe sections and update the URL hash based on the visible section.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;

        const newHash = `#${visible.target.id}`;
        // Debounce & skip while we're performing a hash-driven scroll to avoid loops.
        if (isHashScrollRef.current || location.hash === newHash) return;
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          // Use replaceState to avoid piling up history entries during scroll.
          window.history.replaceState({}, "", `${location.pathname}${newHash}`);
        }, 120);
      },
      {
        root: container,
        threshold: 0.6, // adjust to snap point; >50% keeps hash stable
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      clearTimeout(debounceRef.current);
      observer.disconnect();
    };
  }, [location.pathname]);

  return (
    <div className="scroll-container" ref={containerRef}>
      <section className="snap-section hero-section" id="hero">
        <Hero />
      </section>

      <section className="snap-section venues-snap" id="venues">
        <div className="venues-snap-inner">
          <VenuesSection />
        </div>
      </section>

      <section className="snap-section footer-snap" id="footer">
        <FooterSection />
      </section>
    </div>
  );
}

export default Home;
