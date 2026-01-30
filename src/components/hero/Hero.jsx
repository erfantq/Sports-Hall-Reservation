import { Button } from "react-bootstrap";
import MyNavbar from "../navbar/MyNavbar";
import MySquares from "../squares/MySquares";
import './Hero.css'

function Hero() {
  return (
    <section className="hero">
      {/* BACKGROUND */}
      <MySquares />

      {/* NAVBAR */}
      <MyNavbar />

      {/* HERO TEXT */}
      <div className="hero-container">
        <div className="hero-text">
          <h1>
            Your Game. Your Time. Your Court.
          </h1>

          <p>
            Smart booking for sports venues — fast, simple, and always available.
          </p>

          <Button
            onClick={() => {
              document.getElementById("venues")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
            className="btn-white-glass"

          >

            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Hero