/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Center, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Room3DProps {
  width: number;
  depth: number;
  height: number;
  humanHeight: number;
  roomType?: 'none' | 'bedroom' | 'toilet' | 'kitchen' | 'lounge';
  autoRotate?: boolean;
}

function Furniture({ type, width, depth }: { type: Room3DProps['roomType'], width: number, depth: number }) {
  if (!type || type === 'none') return null;

  switch (type) {
    case 'bedroom':
      return (
        <group>
          {/* Bed */}
          <mesh position={[0, 0.25, -depth * 0.1]}>
            <boxGeometry args={[2, 0.5, 2]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          {/* Pillow */}
          <mesh position={[0, 0.55, -depth * 0.1 - 0.7]}>
            <boxGeometry args={[1.5, 0.2, 0.5]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
          {/* Nightstand */}
          <mesh position={[1.3, 0.3, -depth * 0.1 - 0.7]}>
            <boxGeometry args={[0.5, 0.6, 0.5]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        </group>
      );
    case 'toilet':
      return (
        <group>
          {/* Toilet */}
          <group position={[-width * 0.2, 0, -depth * 0.3]}>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
              <meshStandardMaterial color="#eee" />
            </mesh>
            <mesh position={[0, 0.6, -0.2]}>
              <boxGeometry args={[0.6, 0.6, 0.3]} />
              <meshStandardMaterial color="#eee" />
            </mesh>
          </group>
          {/* Sink */}
          <mesh position={[width * 0.2, 0.4, -depth * 0.3]}>
            <boxGeometry args={[0.8, 0.8, 0.5]} />
            <meshStandardMaterial color="#ddd" />
          </mesh>
        </group>
      );
    case 'kitchen':
      return (
        <group>
          {/* Counter */}
          <mesh position={[-width * 0.3, 0.45, 0]}>
            <boxGeometry args={[0.6, 0.9, depth * 0.6]} />
            <meshStandardMaterial color="#444" />
          </mesh>
          {/* Fridge */}
          <mesh position={[width * 0.3, 0.9, depth * 0.3]}>
            <boxGeometry args={[0.7, 1.8, 0.7]} />
            <meshStandardMaterial color="#ccc" />
          </mesh>
        </group>
      );
    case 'lounge':
      return (
        <group>
          {/* Sofa */}
          <mesh position={[0, 0.3, -depth * 0.2]}>
            <boxGeometry args={[3, 0.6, 1.2]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          {/* TV Stand */}
          <mesh position={[0, 0.25, depth * 0.3]}>
            <boxGeometry args={[2.5, 0.5, 0.4]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}

function RoomMesh({ width, depth, height }: { width: number, depth: number, height: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  return (
    <group position={[0, height / 2, 0]}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -height / 2, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#f0f0f0" side={THREE.DoubleSide} />
      </mesh>

      {/* Wireframe Box */}
      <mesh ref={meshRef}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial 
          color="#000000" 
          wireframe 
          transparent 
          opacity={0.3} 
        />
      </mesh>

      {/* Translucent Walls (some of them to show volume without blocking everything) */}
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.05} 
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

function HumanModel({ height, position = [0, 0, 0] }: { height: number; position?: [number, number, number] }) {
  // A simple 3D humanoid representation using basic shapes
  const headSize = height * 0.15;
  const torsoHeight = height * 0.45;
  const legsHeight = height * 0.4;
  
  return (
    <group position={[position[0], height / 2 + position[1], position[2]]}>
      {/* Head */}
      <mesh position={[0, height / 2 - headSize / 2, 0]}>
        <sphereGeometry args={[headSize / 2, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      {/* Torso */}
      <mesh position={[0, legsHeight + torsoHeight / 2 - height / 2, 0]}>
        <boxGeometry args={[height * 0.2, torsoHeight, height * 0.1]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      {/* Legs */}
      <mesh position={[-height * 0.05, legsHeight / 2 - height / 2, 0]}>
        <boxGeometry args={[height * 0.07, legsHeight, height * 0.07]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[height * 0.05, legsHeight / 2 - height / 2, 0]}>
        <boxGeometry args={[height * 0.07, legsHeight, height * 0.07]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
}

function Label({ position, text, colorClass = "bg-black" }: { position: [number, number, number], text: string, colorClass?: string }) {
  return (
    <Html position={position} center distanceFactor={10}>
      <div className={`${colorClass} text-white px-2.5 py-1 text-[9px] uppercase font-mono font-bold whitespace-nowrap border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-colors duration-300`}>
        {text}
      </div>
    </Html>
  );
}

export default function Room3D({ width, depth, height, humanHeight, roomType = 'none', autoRotate = false }: Room3DProps) {
  // Calculate dynamic camera position to ensure room is always in view
  const cameraDist = Math.max(width, depth, height) * 1.5;

  // Calculate smart, non-overlapping position for the human scale model
  const humanPosition = useMemo((): [number, number, number] => {
    let x = 0;
    let z = 0;

    switch (roomType) {
      case 'bedroom':
        // Bed is centered at [0, 0, -depth * 0.1] of frame size 2.0w x 2.0d.
        // Nightstand centered at [1.3, 0, -depth * 0.1 - 0.7].
        // Stand gracefully on the left (free side) of the bed.
        x = -1.4;
        z = -depth * 0.1;
        break;

      case 'toilet':
        // Toilet centered at [-width * 0.2, 0, -depth * 0.3] (about 0.6x0.6)
        // Sink centered at [width * 0.2, 0, -depth * 0.3] (about 0.8w x 0.5d)
        // Position on the outer side of the toilet if room accepts it, else outer side of the sink.
        const leftSideX = -width * 0.2 - 0.8;
        const rightSideX = width * 0.2 + 0.8;
        const wallBound = -width * 0.5 + 0.6;
        
        if (leftSideX >= wallBound) {
          x = leftSideX;
          z = -depth * 0.3;
        } else if (rightSideX <= width * 0.5 - 0.6) {
          x = rightSideX;
          z = -depth * 0.3;
        } else {
          // If room is extremely compact, place in the middle but forward of the toilet unit
          x = 0;
          z = depth * 0.15;
        }
        break;

      case 'kitchen':
        // Desk counter is on the left: [-width * 0.3, 0, 0] (of size 0.6w x depth * 0.6d)
        // Fridge unit is on the right: [width * 0.3, 0, depth * 0.3] (of size 0.7 x 0.7)
        // Stand beside the counter on its clear right side facing the preparation area.
        x = -width * 0.3 + 0.8;
        z = -depth * 0.05;
        break;

      case 'lounge':
        // Sofa is center-back: [0, 0, -depth * 0.2] (of size 3.0w x 1.2d)
        // TV stand is center-front: [0, 0, depth * 0.3] (of size 2.5w x 0.4d)
        // Human stands directly next to the couch side. If too narrow, stand next to the TV panel.
        if (width >= 4.8) {
          x = 1.9;
          z = -depth * 0.2;
        } else {
          x = 1.5;
          z = depth * 0.3;
        }
        break;

      default:
        // Free floor layout, stand cleanly in the center
        x = 0;
        z = 0;
        break;
    }

    // Tectonic safety constraint: Ensure human avoids intersecting with physical walls (maintain 0.4m wall margin)
    const margin = 0.4;
    const limitX = width / 2 - margin;
    const limitZ = depth / 2 - margin;

    x = Math.max(-limitX, Math.min(limitX, x));
    z = Math.max(-limitZ, Math.min(limitZ, z));

    return [x, 0, z];
  }, [roomType, width, depth]);
  
  return (
    <div className="w-full h-full bg-studio-white">
      <Canvas shadows dpr={[1, 2]} gl={{ preserveDrawingBuffer: true }}>
        <PerspectiveCamera makeDefault position={[cameraDist, height * 1.2, cameraDist]} fov={50} />
        <OrbitControls 
          makeDefault 
          enableDamping 
          dampingFactor={0.05} 
          minDistance={2} 
          maxDistance={100} 
          enablePan={true}
          autoRotate={autoRotate}
          autoRotateSpeed={2.5}
        />
        
        <ambientLight intensity={1.5} />
        <pointLight position={[cameraDist, cameraDist, cameraDist]} intensity={1} />
        <spotLight position={[-cameraDist, cameraDist, cameraDist]} angle={0.15} penumbra={1} intensity={1} castShadow />

        <Center top>
          <RoomMesh width={width} depth={depth} height={height} />
          <HumanModel height={humanHeight} position={humanPosition} />
          <Furniture type={roomType} width={width} depth={depth} />
          
          {/* Dimension Labels with specific matching input colors */}
          <Label position={[width / 2, 0, depth / 2 + 0.5]} text={`Width: ${width}m`} colorClass="bg-red-500" />
          <Label position={[width / 2 + 0.5, 0, 0]} text={`Depth: ${depth}m`} colorClass="bg-blue-500" />
          <Label position={[-width / 2 - 0.5, height / 2, 0]} text={`Height: ${height}m`} colorClass="bg-green-500" />
        </Center>

        <Grid
          cellSize={1}
          sectionSize={5}
          fadeDistance={Math.max(width, depth, 50)}
          fadeStrength={5}
          followCamera={false}
          infiniteGrid={true}
        />
        
        <fog attach="fog" args={['#ffffff', 10, 100]} />
      </Canvas>
    </div>
  );
}
