import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
// FIX: To resolve a "Cannot find namespace 'JSX'" error and an export error with `GroupProps`, the component props are now typed with `React.ComponentProps<'group'>` to avoid reliance on global JSX types.
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// This preloads the model so it's ready when the component mounts.
useGLTF.preload('/sakura_tree.glb');

/**
 * A 3D component that loads and animates a sakura tree model.
 */
export function SakuraTree(props: React.ComponentProps<'group'>) {
  const modelRef = useRef<THREE.Group>(null!);
  
  // Load the GLTF model from the public directory.
  // The 'as any' is a simple way to bypass complex GLTF type generation.
  const { scene } = useGLTF('/sakura_tree.glb') as any;

  // Enable shadows for all meshes in the model.
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [scene]);


  // Use the useFrame hook to apply animations on every rendered frame.
  useFrame((_state, delta) => {
    // Add a continuous, subtle rotation around the Y-axis.
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.1;
    }
  });

  // Render the loaded scene using a <primitive> object.
  // This is a flexible way to render raw three.js objects in R3F.
  return (
    <primitive 
        ref={modelRef} 
        object={scene} 
        {...props} 
    />
  );
}