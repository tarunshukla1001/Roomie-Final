import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Cursor from "./Cursor";
import CursorField from "./CursorField";
import GeminiChat from "./GeminiChat";
import useLenis from "../hooks/useLenis";
import useColorScroll from "../hooks/useColorScroll";
import { motion, AnimatePresence } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export default function Layout({ ready }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  useLenis();
  useColorScroll(location.pathname);

  return (
    <div className="relative min-h-screen bg-[color:var(--paper)] text-[color:var(--ink)]">
      <CursorField />
      <Cursor />
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <div className={isAdmin ? "admin-footer-wrapper" : ""}>
        <Footer />
      </div>
      <GeminiChat ready={ready} />
    </div>
  );
}
