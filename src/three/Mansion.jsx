import { Suspense, lazy } from "react";
import Loader from "../components/Loader";

// Lazy-load the Three.js canvas so it doesn't block the initial page render
const MansionCanvas = lazy(() => import("./MansionCanvas"));

export default function Mansion(props) {
  return (
    <Suspense fallback={<Loader />}>
      <MansionCanvas {...props} />
    </Suspense>
  );
}

export { MansionCanvas };
export { MansionScene } from "./MansionCanvas";
