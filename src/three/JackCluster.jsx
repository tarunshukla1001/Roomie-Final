import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const COLORS = ["#2f5bff", "#efefef", "#141416", "#2f5bff", "#efefef", "#141416", "#2f5bff", "#f4f4f4"];

function Jack({ color, position, rotation, scale = 1 }) {
  const arm = [1.55, 0.34, 0.34];
  const radius = 0.09;
  const props = {
    color,
    roughness: 0.12,
    metalness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.6,
  };

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <RoundedBox args={arm} radius={radius} smoothness={6}>
        <meshPhysicalMaterial {...props} />
      </RoundedBox>
      <RoundedBox args={[arm[1], arm[0], arm[2]]} radius={radius} smoothness={6}>
        <meshPhysicalMaterial {...props} />
      </RoundedBox>
      <RoundedBox args={[arm[1], arm[2], arm[0]]} radius={radius} smoothness={6}>
        <meshPhysicalMaterial {...props} />
      </RoundedBox>
    </group>
  );
}

const LAYOUT = [
  { position: [0.15, 0.1, 0], rotation: [0.4, 0.6, 0.2], scale: 1.15 },
  { position: [-0.85, 0.35, -0.2], rotation: [0.9, -0.4, 0.5], scale: 0.82 },
  { position: [0.95, -0.15, 0.25], rotation: [-0.5, 0.8, 0.3], scale: 0.9 },
  { position: [-0.2, -0.7, 0.4], rotation: [0.2, 1.2, -0.4], scale: 0.72 },
  { position: [0.55, 0.75, -0.35], rotation: [1.1, 0.2, 0.7], scale: 0.64 },
  { position: [-1.1, -0.35, 0.15], rotation: [0.3, -0.9, 0.1], scale: 0.7 },
  { position: [1.15, 0.45, -0.15], rotation: [-0.7, 0.3, 1.1], scale: 0.55 },
  { position: [0.05, 0.05, -0.7], rotation: [0.6, 0.1, -0.8], scale: 0.5 },
];

export default function JackCluster({ mouse, deviceTier = "high" }) {
  const group = useRef();
  const items = deviceTier === "low" ? LAYOUT.slice(0, 5) : LAYOUT;

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y += delta * 0.18;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      mouse.current.y * 0.35 + Math.sin(t * 0.4) * 0.08,
      0.045
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      mouse.current.x * 0.2,
      0.045
    );
    group.current.position.y = Math.sin(t * 0.7) * 0.08;
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <spotLight position={[6, 8, 4]} intensity={80} angle={0.45} penumbra={0.8} />
      <pointLight position={[-4, 2, 3]} intensity={18} color="#2f5bff" />
      <pointLight position={[3, -2, 2]} intensity={8} />
      <group ref={group} scale={1.35}>
        {items.map((jack, i) => (
          <Jack key={i} color={COLORS[i]} {...jack} />
        ))}
      </group>
      {deviceTier !== "low" && (
        <>
          <Environment preset="studio" />
          <ContactShadows position={[0, -1.55, 0]} opacity={0.45} scale={12} blur={2.4} far={4} />
        </>
      )}
    </>
  );
}
