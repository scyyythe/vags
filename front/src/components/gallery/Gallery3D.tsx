// src/components/Gallery3D.tsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { PMREMGenerator } from 'three';

const Gallery3D = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [controlsEnabled, setControlsEnabled] = useState(false);

  useEffect(() => {
    const mount = mountRef.current!;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    

    // Scene, camera, renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(-13, 1, 0); // Place camera to the left
    camera.lookAt(new THREE.Vector3(100, 1, 0)); // Look toward +X

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // Lights
    // const ambientLight = new THREE.AmbientLight(0xffffff, 20);
    // scene.add(ambientLight);
    // const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    // directionalLight.position.set(5, 10, 7.5);
    // scene.add(directionalLight);

    // Controls
    const controls = new PointerLockControls(camera, renderer.domElement);

    // To enable pointer lock on click
    mount.addEventListener("click", () => {
      controls.lock();
    });

    controls.addEventListener("lock", () => {
      console.log("Pointer locked - controls enabled");
      setControlsEnabled(true);
    });

    controls.addEventListener("unlock", () => {
      console.log("Pointer unlocked - controls disabled");
      setControlsEnabled(false);
    });

    scene.add(controls.getObject());

    // Movement variables
    const moveForward = false;
    const moveBackward = false;
    const moveLeft = false;
    const moveRight = false;
    let velocity = new THREE.Vector3();
    let direction = new THREE.Vector3();

    const keysPressed: Record<string, boolean> = {};

    const onKeyDown = (event: KeyboardEvent) => {
      keysPressed[event.code] = true;
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keysPressed[event.code] = false;
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    // Load model
    const loader = new GLTFLoader();
    loader.load(
      "/gallery_scenes/10art_scene.glb",
      (gltf) => {
        scene.add(gltf.scene);
      },
      undefined,
      (error) => {
        console.error("Error loading model:", error);
      }
    );

    // Clock for delta time
    const clock = new THREE.Clock();

    const rgbeLoader = new RGBELoader();
    rgbeLoader.load('/gallery_scenes/autumn_field_puresky_4k.hdr', function (texture) {
        const pmremGenerator = new PMREMGenerator(renderer);
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        scene.environment = envMap;
        scene.background = envMap; // optional
        texture.dispose();
        pmremGenerator.dispose();
    });

    // Animate loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (controls.isLocked) {
        const delta = clock.getDelta();
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(keysPressed["KeyW"]) - Number(keysPressed["KeyS"]);
        direction.x = Number(keysPressed["KeyD"]) - Number(keysPressed["KeyA"]);
        
        const speed = 20.0;

        if (direction.lengthSq() > 0) {
          direction.normalize(); // this ensures consistent movements in all directions
          velocity.x -= direction.x * speed * delta;
          velocity.z -= direction.z * speed * delta;
        }

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      mount.removeChild(renderer.domElement);
      controls.dispose();
    };
  }, []);

  return (
    <>
      <div
        ref={mountRef}
        style={{ width: "100%", height: "100vh", outline: "none" }}
        tabIndex={0}
      />
      {!controlsEnabled && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            width: "100%",
            textAlign: "center",
            color: "white",
            fontSize: "20px",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          Click to enter the gallery and use WASD + mouse to move
        </div>
      )}
    </>
  );
};

export default Gallery3D;



