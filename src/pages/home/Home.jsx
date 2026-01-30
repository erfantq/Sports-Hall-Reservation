import React from "react";
import Hero from "../../components/hero/Hero";
import VenuesSection from "../../components/venuesSection/VenuesSection";
import FooterSection from "../../components/footerSection/FooterSection";
import "./Home.css";

function Home() {
  return (
    <div className="scroll-container">
      <section className="snap-section hero-section">
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
