import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import Manifesto from "../components/Manifesto";
import ProductDeck from "../components/ProductDeck";
import ImageRibbon from "../components/ImageRibbon";
import HorizontalGallery from "../components/HorizontalGallery";
import HouseTour from "../components/HouseTour";
import FeaturedStays from "../components/FeaturedStays";
import CityMarquee from "../components/CityMarquee";
import ScrollMosaic from "../components/ScrollMosaic";
import PricePromise from "../components/PricePromise";
import Process from "../components/Process";
import CTA from "../components/CTA";
import { fetchStays } from "../services/api";

export default function Home() {
  const [stays, setStays] = useState([]);

  useEffect(() => {
    fetchStays()
      .then((list) => setStays(list.slice(0, 6)))
      .catch(() => setStays([]));
  }, []);

  return (
    <main>
      <Hero />
      <Manifesto />
      <ProductDeck />
      <ImageRibbon />
      <HouseTour />
      <HorizontalGallery />
      <FeaturedStays stays={stays} />
      <CityMarquee />
      <ScrollMosaic />
      <PricePromise />
      <Process />
      <CTA />
    </main>
  );
}
