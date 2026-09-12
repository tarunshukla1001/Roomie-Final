import { useMemo, useRef, useLayoutEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import useDeviceTier from "../hooks/useDeviceTier";

function canvasTexture(draw, size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  draw(canvas.getContext("2d"), size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function useEstateTextures() {
  return useMemo(() => {
    const brick = canvasTexture((ctx, size) => {
      ctx.fillStyle = "#8a4b3a";
      ctx.fillRect(0, 0, size, size);
      const brickH = 16;
      const brickW = 42;
      for (let y = 0, row = 0; y < size; y += brickH, row++) {
        const offset = row % 2 ? brickW / 2 : 0;
        for (let x = -brickW; x < size; x += brickW) {
          ctx.fillStyle = row % 3 === 0 ? "#9a5844" : "#7d4032";
          ctx.fillRect(x + offset + 1, y + 1, brickW - 2, brickH - 2);
          ctx.fillStyle = "rgba(255,220,180,0.12)";
          ctx.fillRect(x + offset + 2, y + 2, brickW - 8, 3);
        }
      }
    });
    brick.repeat.set(6, 3);

    const stone = canvasTexture((ctx, size) => {
      ctx.fillStyle = "#cfc6b8";
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = i % 2 ? "#b7aea0" : "#ddd4c6";
        const x = (i * 47) % size;
        const y = (i * 31) % size;
        ctx.fillRect(x, y, 48, 28);
        ctx.strokeStyle = "#9d9488";
        ctx.strokeRect(x, y, 48, 28);
      }
    });
    stone.repeat.set(4, 2);

    const slate = canvasTexture((ctx, size) => {
      ctx.fillStyle = "#2a3344";
      ctx.fillRect(0, 0, size, size);
      for (let y = 0; y < size; y += 10) {
        for (let x = -(y % 20); x < size; x += 18) {
          ctx.fillStyle = y % 20 === 0 ? "#3a465c" : "#1d2533";
          ctx.beginPath();
          ctx.moveTo(x, y + 10);
          ctx.lineTo(x + 9, y);
          ctx.lineTo(x + 18, y + 10);
          ctx.fill();
        }
      }
    });
    slate.repeat.set(8, 8);

    const marble = canvasTexture((ctx, size) => {
      ctx.fillStyle = "#ece6d8";
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = "rgba(40,30,20,0.18)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 22, 0);
        ctx.bezierCurveTo(80, 80, 40, 180, size, size);
        ctx.stroke();
      }
    });
    marble.repeat.set(6, 6);

    const wood = canvasTexture((ctx, size) => {
      ctx.fillStyle = "#5b3a22";
      ctx.fillRect(0, 0, size, size);
      for (let x = 0; x < size; x += 8) {
        ctx.fillStyle = x % 16 === 0 ? "#6b4528" : "#4c301c";
        ctx.fillRect(x, 0, 7, size);
      }
    });
    wood.repeat.set(2, 8);

    const darkWood = canvasTexture((ctx, size) => {
      ctx.fillStyle = "#3a2518";
      ctx.fillRect(0, 0, size, size);
      for (let x = 0; x < size; x += 6) {
        ctx.fillStyle = x % 12 === 0 ? "#4a3020" : "#2e1c12";
        ctx.fillRect(x, 0, 5, size);
      }
    });
    darkWood.repeat.set(2, 8);

    const copper = canvasTexture((ctx, size) => {
      ctx.fillStyle = "#b87333";
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = i % 2 ? "#c9844a" : "#a06428";
        const x = (i * 37) % size;
        const y = (i * 23) % size;
        ctx.fillRect(x, y, 40, 24);
      }
    });
    copper.repeat.set(4, 4);

    const glass = canvasTexture((ctx, size) => {
      ctx.fillStyle = "#1a2a3a";
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = "rgba(120,180,220,0.08)";
        ctx.fillRect((i * 33) % size, (i * 19) % size, 30, 20);
      }
    });
    glass.repeat.set(2, 2);

    return { brick, stone, slate, marble, wood, darkWood, copper, glass };
  }, []);
}

function MergedMesh({ geos, material, castShadow = true }) {
  const geometry = useMemo(() => mergeGeometries(geos, false), [geos]);
  return (
    <mesh geometry={geometry} castShadow={castShadow} receiveShadow>
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function box(w, h, d, x, y, z) {
  const geo = new THREE.BoxGeometry(w, h, d);
  geo.translate(x, y, z);
  return geo;
}

function Estate({ textures, deviceTier }) {
  const brickMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: textures.brick, roughness: 0.82, metalness: 0.04 }),
    [textures]
  );
  const stoneMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: textures.stone, roughness: 0.7 }),
    [textures]
  );
  const slateMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: textures.slate, roughness: 0.55, metalness: 0.12 }),
    [textures]
  );
  const marbleMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: textures.marble, roughness: 0.28, metalness: 0.08 }),
    [textures]
  );
  const woodMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: textures.wood, roughness: 0.65 }),
    [textures]
  );
  const darkWoodMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: textures.darkWood, roughness: 0.6 }),
    [textures]
  );
  const copperMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: textures.copper, roughness: 0.35, metalness: 0.85 }),
    [textures]
  );
  const trimMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#f2ebe0", roughness: 0.4 }),
    []
  );
  const goldMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#c9a227", metalness: 0.7, roughness: 0.28 }),
    []
  );

  const walls = useMemo(
    () => [
      box(16, 9.2, 0.45, 0, 4.7, -6.4),
      box(0.45, 9.2, 13.2, -8, 4.7, 0),
      box(0.45, 9.2, 13.2, 8, 4.7, 0),
      box(6.4, 9.2, 0.45, -4.8, 4.7, 6.4),
      box(6.4, 9.2, 0.45, 4.8, 4.7, 6.4),
      box(16.6, 0.5, 13.6, 0, 9.35, 0),
      box(7.2, 6.4, 0.38, -12.4, 3.3, 3.4),
      box(7.2, 6.4, 0.38, -12.4, 3.3, -3.4),
      box(0.38, 6.4, 7.2, -16, 3.3, 0),
      box(7.2, 6.4, 0.38, 12.4, 3.3, 3.4),
      box(7.2, 6.4, 0.38, 12.4, 3.3, -3.4),
      box(0.38, 6.4, 7.2, 16, 3.3, 0),
    ],
    []
  );

  const stone = useMemo(
    () => [
      box(17.2, 1.4, 14, 0, 0.7, 0),
      box(8.2, 1.1, 8, -12.4, 0.55, 0),
      box(8.2, 1.1, 8, 12.4, 0.55, 0),
      box(9.4, 0.28, 4.6, 0, 0.22, 9.1),
    ],
    []
  );

  const trim = useMemo(
    () => [
      box(16.4, 0.28, 13.6, 0, 3.55, 0),
      box(16.4, 0.28, 13.6, 0, 6.55, 0),
      box(4.8, 0.22, 4.2, 0, 2.35, 8.35),
      box(3.4, 0.16, 2.6, 0, 9.55, 2.2),
    ],
    []
  );

  const windowFrames = useMemo(() => {
    const list = [];
    const xs = [-5.6, -2.8, 2.8, 5.6];
    const ys = [2.35, 5.2, 7.85];
    xs.forEach((x) => {
      ys.forEach((y) => {
        list.push(box(1.18, 1.58, 0.08, x, y, 6.68));
        list.push(box(0.08, 1.58, 1.18, x - 0.55, y, 6.68));
        list.push(box(0.08, 1.58, 1.18, x + 0.55, y, 6.68));
        list.push(box(1.18, 0.08, 1.18, x, y - 0.75, 6.68));
        list.push(box(1.18, 0.08, 1.18, x, y + 0.75, 6.68));
      });
    });
    [-4, 0, 4].forEach((z) => {
      list.push(box(1.18, 1.58, 0.08, -8.34, 2.4, z));
      list.push(box(0.08, 1.58, 1.18, -8.34, 2.4, z - 0.55));
      list.push(box(0.08, 1.58, 1.18, -8.34, 2.4, z + 0.55));
      list.push(box(1.18, 0.08, 1.18, -8.34, 2.4 - 0.75, z));
      list.push(box(1.18, 0.08, 1.18, -8.34, 2.4 + 0.75, z));

      list.push(box(1.18, 1.58, 0.08, 8.34, 2.4, z));
      list.push(box(0.08, 1.58, 1.18, 8.34, 2.4, z - 0.55));
      list.push(box(0.08, 1.58, 1.18, 8.34, 2.4, z + 0.55));
      list.push(box(1.18, 0.08, 1.18, 8.34, 2.4 - 0.75, z));
      list.push(box(1.18, 0.08, 1.18, 8.34, 2.4 + 0.75, z));

      list.push(box(1.18, 1.58, 0.08, -8.34, 5.4, z));
      list.push(box(0.08, 1.58, 1.18, -8.34, 5.4, z - 0.55));
      list.push(box(0.08, 1.58, 1.18, -8.34, 5.4, z + 0.55));
      list.push(box(1.18, 0.08, 1.18, -8.34, 5.4 - 0.75, z));
      list.push(box(1.18, 0.08, 1.18, -8.34, 5.4 + 0.75, z));

      list.push(box(1.18, 1.58, 0.08, 8.34, 5.4, z));
      list.push(box(0.08, 1.58, 1.18, 8.34, 5.4, z - 0.55));
      list.push(box(0.08, 1.58, 1.18, 8.34, 5.4, z + 0.55));
      list.push(box(1.18, 0.08, 1.18, 8.34, 5.4 - 0.75, z));
      list.push(box(1.18, 0.08, 1.18, 8.34, 5.4 + 0.75, z));
    });
    return list;
  }, []);

  const windows = useMemo(() => {
    const list = [];
    const xs = [-5.6, -2.8, 2.8, 5.6];
    const ys = [2.35, 5.2, 7.85];
    xs.forEach((x, xi) => {
      ys.forEach((y, yi) => {
        list.push({ position: [x, y, 6.64], rotation: [0, 0, 0], lit: 0.35 + ((xi + yi) % 3) * 0.2 });
      });
    });
    [-4, 0, 4].forEach((z, i) => {
      list.push({ position: [-8.24, 2.4, z], rotation: [0, Math.PI / 2, 0], lit: 0.45 });
      list.push({ position: [8.24, 2.4, z], rotation: [0, -Math.PI / 2, 0], lit: 0.4 + i * 0.1 });
      list.push({ position: [-8.24, 5.4, z], rotation: [0, Math.PI / 2, 0], lit: 0.25 });
      list.push({ position: [8.24, 5.4, z], rotation: [0, -Math.PI / 2, 0], lit: 0.3 });
    });
    return list;
  }, []);

  const pilasters = useMemo(() => {
    const list = [];
    [-6.8, -4.4, -2, 0.4, 2.8, 5.2, 7.6].forEach((x) => {
      list.push(box(0.35, 9.0, 0.35, x, 4.7, -6.15));
    });
    return list;
  }, []);

  const frontSteps = useMemo(() => [
    box(5.0, 0.25, 1.2, 0, 0.125, 8.8),
    box(5.5, 0.25, 1.2, 0, 0.375, 9.6),
    box(6.0, 0.25, 1.2, 0, 0.625, 10.4),
  ], []);

  const doorFrame = useMemo(() => [
    box(0.12, 3.6, 0.12, -0.9, 1.8, 6.68),
    box(0.12, 3.6, 0.12, 0.9, 1.8, 6.68),
    box(0.12, 0.12, 1.2, -0.9, 3.62, 6.68),
    box(0.12, 0.12, 1.2, 0.9, 3.62, 6.68),
    box(2.0, 0.12, 0.12, 0, 1.8, 6.68),
  ], []);

  const dormers = useMemo(() => [
    box(1.4, 1.2, 1.2, -4.5, 10.9, -2.0),
    box(1.4, 1.2, 1.2, -1.5, 10.9, -3.5),
    box(1.4, 1.2, 1.2, 1.5, 10.9, -3.5),
    box(1.4, 1.2, 1.2, 4.5, 10.9, -2.0),
  ], []);

  const balconyRailing = useMemo(() => [
    box(4.0, 0.08, 0.08, 0, 6.0, 6.65),
    box(0.08, 0.6, 0.08, -1.9, 6.3, 6.65),
    box(0.08, 0.6, 0.08, -0.95, 6.3, 6.65),
    box(0.08, 0.6, 0.08, 0, 6.3, 6.65),
    box(0.08, 0.6, 0.08, 0.95, 6.3, 6.65),
    box(0.08, 0.6, 0.08, 1.9, 6.3, 6.65),
  ], []);

  const roofDetails = useMemo(() => [
    box(1.6, 0.4, 1.0, -6.5, 11.6, 0.5),
    box(1.6, 0.4, 1.0, 6.5, 11.6, 0.5),
  ], []);

  return (
    <group>
      <MergedMesh geos={walls} material={brickMat} />
      <MergedMesh geos={stone} material={stoneMat} />
      <MergedMesh geos={trim} material={trimMat} />
      <MergedMesh geos={pilasters} material={trimMat} />
      <MergedMesh geos={windowFrames} material={trimMat} />
      <MergedMesh geos={frontSteps} material={stoneMat} />
      <MergedMesh geos={doorFrame} material={goldMat} />
      <MergedMesh geos={dormers} material={brickMat} />
      <MergedMesh geos={balconyRailing} material={goldMat} />
      <MergedMesh geos={roofDetails} material={slateMat} />

      <mesh position={[0, 11.05, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[11.4, 3.6, 4]} />
        <primitive object={slateMat} attach="material" />
      </mesh>
      <mesh position={[-12.4, 7.55, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[5.4, 2.4, 4]} />
        <primitive object={slateMat} attach="material" />
      </mesh>
      <mesh position={[12.4, 7.55, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[5.4, 2.4, 4]} />
        <primitive object={slateMat} attach="material" />
      </mesh>

      <mesh position={[-6.5, 11.9, 0.5]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.2, 1.8, 4]} />
        <primitive object={slateMat} attach="material" />
      </mesh>
      <mesh position={[6.5, 11.9, 0.5]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.2, 1.8, 4]} />
        <primitive object={slateMat} attach="material" />
      </mesh>

      <mesh position={[-3.2, 12.4, 1.2]}>
        <boxGeometry args={[0.7, 1.6, 0.7]} />
        <meshStandardMaterial color="#4a433c" />
      </mesh>
      <mesh position={[3.2, 12.4, -0.6]}>
        <boxGeometry args={[0.7, 1.6, 0.7]} />
        <meshStandardMaterial color="#4a433c" />
      </mesh>

      <mesh position={[0, 1.85, 6.68]}>
        <boxGeometry args={[1.7, 3.2, 0.12]} />
        <primitive object={darkWoodMat} attach="material" />
      </mesh>
      <mesh position={[0, 2.65, 6.76]}>
        <boxGeometry args={[0.12, 1.4, 0.08]} />
        <primitive object={goldMat} attach="material" />
      </mesh>

      {windows.map((win, i) => (
        <mesh key={i} position={win.position} rotation={win.rotation}>
          <planeGeometry args={[1.05, 1.45]} />
          <meshStandardMaterial
            color="#7ec8ff"
            emissive="#ffcf8a"
            emissiveIntensity={win.lit}
            metalness={0.35}
            roughness={0.12}
            transparent
            opacity={0.92}
          />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -0.4]} receiveShadow>
        <planeGeometry args={[6.8, 10.4]} />
        <primitive object={marbleMat} attach="material" />
      </mesh>
      <mesh position={[0, 0.18, -1.1]}>
        <boxGeometry args={[2.4, 0.16, 1.2]} />
        <primitive object={woodMat} attach="material" />
      </mesh>
      <mesh position={[0, 0.55, 1.4]}>
        <boxGeometry args={[2.8, 0.55, 1.1]} />
        <meshStandardMaterial color="#2f3d66" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.05, 0.95]}>
        <boxGeometry args={[2.8, 0.7, 0.28]} />
        <meshStandardMaterial color="#3c4d7a" />
      </mesh>
      <mesh position={[0, 3.6, -0.2]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color="#ffe7b0" emissive="#ffd27a" emissiveIntensity={2.4} />
      </mesh>
      {[-0.55, 0, 0.55].map((x) => (
        <mesh key={x} position={[x, 1.35, -4.8]}>
          <boxGeometry args={[0.42, 2.4, 0.08]} />
          <meshStandardMaterial color="#d7c09a" />
        </mesh>
      ))}

      <mesh position={[0, 2.4, -2.6]}>
        <boxGeometry args={[1.8, 0.16, 3.4]} />
        <primitive object={marbleMat} attach="material" />
      </mesh>
      <mesh position={[-0.85, 1.2, -2.6]}>
        <boxGeometry args={[0.16, 2.4, 3.4]} />
        <meshStandardMaterial color="#f4eee4" />
      </mesh>
      <mesh position={[0.85, 1.2, -2.6]}>
        <boxGeometry args={[0.16, 2.4, 3.4]} />
        <meshStandardMaterial color="#f4eee4" />
      </mesh>

      <mesh position={[12.2, 0.55, 0.2]}>
        <boxGeometry args={[2.4, 0.42, 3.2]} />
        <meshStandardMaterial color="#efe6d6" />
      </mesh>
      <mesh position={[12.2, 0.85, -1.1]}>
        <boxGeometry args={[2.4, 0.7, 0.28]} />
        <primitive object={copperMat} attach="material" />
      </mesh>
      <mesh position={[12.2, 1.15, 1.35]}>
        <boxGeometry args={[0.9, 1.1, 0.12]} />
        <meshStandardMaterial color="#8fb7d8" emissive="#2f5bff" emissiveIntensity={0.2} />
      </mesh>

      <mesh position={[0, 9.8, 2.4]} receiveShadow>
        <boxGeometry args={[6.4, 0.12, 3.6]} />
        <meshStandardMaterial color="#c9c0b2" roughness={0.55} />
      </mesh>
      {[-2.8, 2.8].map((x) => (
        <mesh key={x} position={[x, 10.2, 2.4]}>
          <boxGeometry args={[0.08, 0.7, 3.6]} />
          <meshStandardMaterial color="#efe7da" />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[48, 48]} />
        <meshStandardMaterial color="#16351c" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 16]}>
        <planeGeometry args={[4.4, 22]} />
        <meshStandardMaterial color="#2a2c32" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[7.4, 0.06, 10.5]}>
        <circleGeometry args={[3.1, 28]} />
        <meshStandardMaterial color="#1a6d88" metalness={0.55} roughness={0.12} emissive="#0c3d4d" emissiveIntensity={0.35} />
      </mesh>

      <mesh position={[0, 0.35, 11.6]}>
        <cylinderGeometry args={[0.7, 0.9, 0.4, 16]} />
        <meshStandardMaterial color="#d9d0c2" />
      </mesh>
      <mesh position={[0, 1.15, 11.6]}>
        <sphereGeometry args={[0.28, 12, 12]} />
        <meshStandardMaterial color="#9fd4ff" transparent opacity={0.55} />
      </mesh>

      <mesh position={[0, 0.15, 12.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.5, 24]} />
        <meshStandardMaterial color="#e8e4dc" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.35, 12.5]}>
        <cylinderGeometry args={[0.5, 0.7, 0.35, 16]} />
        <meshStandardMaterial color="#c9c0b2" metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.8, 12.5]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#9fd4ff" emissive="#4da6ff" emissiveIntensity={0.6} transparent opacity={0.7} />
      </mesh>

      {[-10.5, 0, 10.8, 14.2, -18, 18.4].map((x, i) => (
        <Cypress key={i} position={[x, 0, i < 3 ? 11 + i * 0.5 : 7.6 + i * 0.3]} scale={0.8 + i * 0.08} />
      ))}

      {deviceTier !== "low" && (
        <>
          <pointLight position={[0, 3.6, -0.2]} intensity={18} color="#ffe4b5" distance={16} />
          <pointLight position={[12.2, 2.1, 0.2]} intensity={10} color="#6ea8ff" distance={10} />
          <pointLight position={[7.4, 0.4, 10.5]} intensity={16} color="#2ec4b6" distance={12} />
          <pointLight position={[0, 6, 0]} intensity={6} color="#ff9ecd" distance={20} />
        </>
      )}
    </group>
  );
}

function Cypress({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 1.4, 6]} />
        <meshStandardMaterial color="#4a3424" />
      </mesh>
      <mesh position={[0, 2.6, 0]}>
        <coneGeometry args={[0.85, 3.4, 7]} />
        <meshStandardMaterial color="#1f4a2c" />
      </mesh>
      <mesh position={[0, 3.7, 0]}>
        <coneGeometry args={[0.55, 2.1, 7]} />
        <meshStandardMaterial color="#2b6a3c" />
      </mesh>
    </group>
  );
}

function CameraRig({ progress, mouse }) {
  const look = useRef(new THREE.Vector3());
  const path = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(24, 13, 32),
          new THREE.Vector3(14, 6.2, 22),
          new THREE.Vector3(0.2, 3.4, 18),
          new THREE.Vector3(0.15, 2.1, 12.4),
          new THREE.Vector3(0.1, 1.7, 8.2),
          new THREE.Vector3(0.05, 1.55, 2.2),
          new THREE.Vector3(0.1, 2.6, -1.4),
          new THREE.Vector3(11.6, 1.55, 0.4),
          new THREE.Vector3(0.2, 10.4, 8.5),
        ],
        false,
        "catmullrom",
        0.14
      ),
    []
  );
  const targets = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(0, 4.2, 0),
          new THREE.Vector3(0, 3.2, 6),
          new THREE.Vector3(0, 2.4, 8.4),
          new THREE.Vector3(0, 1.8, 6.6),
          new THREE.Vector3(0, 1.4, 1.2),
          new THREE.Vector3(0, 1.2, -1.8),
          new THREE.Vector3(12.1, 1.0, 0.2),
          new THREE.Vector3(0, 4.6, 1.2),
        ],
        false,
        "catmullrom",
        0.14
      ),
    []
  );

  useFrame((state) => {
    const rawProgress =
      progress && typeof progress === "object" && "current" in progress
        ? progress.current
        : typeof progress === "number"
          ? progress
          : 0;
    const t = THREE.MathUtils.clamp(rawProgress, 0, 1);
    const pos = path.getPointAt(t);
    const target = targets.getPointAt(t);
    const mx = mouse && mouse.current ? mouse.current.x : 0;
    const my = mouse && mouse.current ? mouse.current.y : 0;
    pos.x += mx * 0.35;
    pos.y += my * 0.18;
    state.camera.position.lerp(pos, 0.085);
    look.current.lerp(target, 0.09);
    state.camera.lookAt(look.current);
    state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, 34 - t * 7, 0.05);
    state.camera.updateProjectionMatrix();
  });

  return null;
}

export function MansionScene({ progress, mouse, deviceTier = "high" }) {
  const textures = useEstateTextures();

  return (
    <>
      <color attach="background" args={["#0a1628"]} />
      <fog attach="fog" args={["#0a1628", 18, 62]} />
      <hemisphereLight args={["#b9d4ff", "#1b2a1c", 0.55]} />
      <directionalLight
        position={[12, 18, 8]}
        intensity={1.45}
        color="#fff1d6"
        castShadow={deviceTier === "high"}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <ambientLight intensity={0.18} />
      <CameraRig progress={progress} mouse={mouse} />
      <Estate textures={textures} deviceTier={deviceTier} />
    </>
  );
}

export default function MansionCanvas({ progress, mouse, deviceTier }) {
  const wrap = useRef(null);
  const detectedTier = useDeviceTier();
  const tier = deviceTier || detectedTier;
  const internalMouse = useRef({ x: 0, y: 0 });
  const mouseRef = mouse || internalMouse;
  const [active, setActive] = useState(true);

  useLayoutEffect(() => {
    const node = wrap.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "80px", threshold: 0.02 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (mouse) return;
    const onMove = (event) => {
      internalMouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      internalMouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mouse]);

  return (
    <div ref={wrap} className="h-full w-full">
      <Canvas
        shadows={tier === "high"}
        camera={{ position: [22, 12, 28], fov: 34 }}
        dpr={[1, tier === "high" ? 1.5 : 1]}
        frameloop={active ? "always" : "never"}
        gl={{
          antialias: tier === "high",
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        style={{ background: "#0a1628" }}
      >
        <MansionScene progress={progress} mouse={mouseRef} deviceTier={tier} />
      </Canvas>
    </div>
  );
}
