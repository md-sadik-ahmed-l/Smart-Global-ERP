"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Float, Text, Environment, ContactShadows, Html } from "@react-three/drei";
import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";

// ============================================================
// 3D Factory Machine — represents a production machine
// ============================================================

interface MachineProps {
  position: [number, number, number];
  color: string;
  status: "running" | "idle" | "maintenance" | "error";
  name: string;
  output: number;
}

function FactoryMachine({ position, color, status, name, output }: MachineProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (groupRef.current && status === "running") {
      groupRef.current.rotation.y += delta * 0.5;
    }
    if (ringRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      ringRef.current.scale.set(scale, scale, scale);
    }
  });

  const statusColor = useMemo(() => {
    switch (status) {
      case "running": return "#10b981";
      case "idle": return "#64748b";
      case "maintenance": return "#f59e0b";
      case "error": return "#ef4444";
      default: return color;
    }
  }, [status, color]);

  return (
    <group position={position}>
      {/* Machine base */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 1, 1.4]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Machine top — rotating part */}
      <group ref={groupRef}>
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.3, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.4, 0]}>
          <coneGeometry args={[0.2, 0.3, 8]} />
          <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Status ring */}
      <mesh ref={ringRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.0, 32]} />
        <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={0.8} transparent opacity={0.8} />
      </mesh>

      {/* Glow point on top */}
      <pointLight position={[0, 2, 0]} color={statusColor} intensity={2} distance={3} />

      {/* Label */}
      <Html position={[0, 2.2, 0]} center distanceFactor={8}>
        <div className="pointer-events-none select-none whitespace-nowrap rounded-lg border border-indigo-500/30 bg-black/80 px-3 py-1.5 text-center backdrop-blur-md">
          <div className="text-[10px] font-bold text-white">{name}</div>
          <div className="text-[9px] font-medium" style={{ color: statusColor }}>
            {status.toUpperCase()} · {output}/hr
          </div>
        </div>
      </Html>
    </group>
  );
}

// ============================================================
// Conveyor belt connecting machines
// ============================================================

function ConveyorBelt({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const midpoint: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  ];
  const length = Math.sqrt(
    Math.pow(end[0] - start[0], 2) +
    Math.pow(end[1] - start[1], 2) +
    Math.pow(end[2] - start[2], 2)
  );
  const angle = Math.atan2(end[2] - start[2], end[0] - start[0]);

  return (
    <mesh position={midpoint} rotation={[0, -angle, 0]} receiveShadow>
      <boxGeometry args={[length, 0.1, 0.4]} />
      <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
    </mesh>
  );
}

// ============================================================
// Floating particles — ambient factory atmosphere
// ============================================================

function FloatingParticles({ count = 50 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = Math.random() * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += 0.01;
        if (positions[i * 3 + 1] > 8) positions[i * 3 + 1] = 0;
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#6366f1"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// ============================================================
// Main Factory Floor Visualization
// ============================================================

export interface FactoryMachineData {
  id: string;
  name: string;
  position: [number, number, number];
  color: string;
  status: "running" | "idle" | "maintenance" | "error";
  output: number;
}

interface FactoryFloor3DProps {
  machines?: FactoryMachineData[];
}

export function FactoryFloor3D({ machines = defaultMachines }: FactoryFloor3DProps) {
  return (
    <div className="h-full w-full">
      <Canvas
        shadows
        camera={{ position: [8, 8, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#050816"]} />
        <fog attach="fog" args={["#050816", 15, 35]} />

        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />
        <pointLight position={[-10, 5, -10]} intensity={0.5} color="#8b5cf6" />
        <pointLight position={[10, 5, 10]} intensity={0.5} color="#ec4899" />

        <Suspense fallback={null}>
          {/* Factory floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#0a0f1f" metalness={0.2} roughness={0.8} />
          </mesh>

          {/* Grid overlay */}
          <Grid
            args={[30, 30]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#1e293b"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#6366f1"
            fadeDistance={25}
            fadeStrength={1}
            infiniteGrid
          />

          {/* Machines */}
          {machines.map((m) => (
            <FactoryMachine key={m.id} {...m} />
          ))}

          {/* Conveyor belts between machines */}
          <ConveyorBelt start={[-3, 0, -2]} end={[0, 0, -2]} />
          <ConveyorBelt start={[0, 0, -2]} end={[3, 0, -2]} />
          <ConveyorBelt start={[-3, 0, 2]} end={[0, 0, 2]} />
          <ConveyorBelt start={[0, 0, 2]} end={[3, 0, 2]} />

          {/* Floating particles for atmosphere */}
          <FloatingParticles count={60} />

          {/* Contact shadows for grounding */}
          <ContactShadows
            position={[0, 0.01, 0]}
            opacity={0.4}
            scale={30}
            blur={2}
            far={4}
          />

          {/* Environment for reflections */}
          <Environment preset="night" />
        </Suspense>

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={5}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2 - 0.1}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}

const defaultMachines: FactoryMachineData[] = [
  { id: "M1", name: "Cutting Machine", position: [-3, 0, -2], color: "#3b82f6", status: "running", output: 240 },
  { id: "M2", name: "Sewing Line A", position: [0, 0, -2], color: "#8b5cf6", status: "running", output: 180 },
  { id: "M3", name: "Sewing Line B", position: [3, 0, -2], color: "#ec4899", status: "idle", output: 0 },
  { id: "M4", name: "QC Station", position: [-3, 0, 2], color: "#f59e0b", status: "running", output: 220 },
  { id: "M5", name: "Packaging", position: [0, 0, 2], color: "#10b981", status: "running", output: 200 },
  { id: "M6", name: "Loading Bay", position: [3, 0, 2], color: "#06b6d4", status: "maintenance", output: 0 },
];
