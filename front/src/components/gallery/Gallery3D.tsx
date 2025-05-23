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
      "/gallery_scenes/10art_scene_apart.glb",
      (gltf) => {
        scene.add(gltf.scene);

        const artworks = [
        {
          imageMesh: "art_template1",
          titleMesh: "title_template1",
          imageUrl: "https://images.vexels.com/media/users/3/207752/isolated/preview/697b63a22a36168f444beff7ade7e00b-david-abstract-art.png",
          title: "Starry Night",
          artist: "Vincent van Gogh"
        },
        {
          imageMesh: "art_template2",
          titleMesh: "title_template2",
          imageUrl: "https://png.pngtree.com/png-vector/20240120/ourmid/pngtree-owl-in-a-hypnotic-fractal-galaxy-of-patterns-png-image_11472209.png",
          title: "The Scream",
          artist: "Edvard Munch"
        },
        {
          imageMesh: "art_template3",
          titleMesh: "title_template3",
          imageUrl: "https://images.vexels.com/media/users/3/207752/isolated/preview/697b63a22a36168f444beff7ade7e00b-david-abstract-art.png",
          title: "Starry Night",
          artist: "Vincent van Gogh"
        },
        {
          imageMesh: "art_template4",
          titleMesh: "title_template4",
          imageUrl: "https://png.pngtree.com/png-vector/20240120/ourmid/pngtree-owl-in-a-hypnotic-fractal-galaxy-of-patterns-png-image_11472209.png",
          title: "The Scream",
          artist: "Edvard Munch"
        },
        {
          imageMesh: "art_template5",
          titleMesh: "title_template5",
          imageUrl: "https://images.vexels.com/media/users/3/207752/isolated/preview/697b63a22a36168f444beff7ade7e00b-david-abstract-art.png",
          title: "Starry Night",
          artist: "Vincent van Gogh"
        },
        {
          imageMesh: "art_template6",
          titleMesh: "title_template6",
          imageUrl: "https://png.pngtree.com/png-vector/20240120/ourmid/pngtree-owl-in-a-hypnotic-fractal-galaxy-of-patterns-png-image_11472209.png",
          title: "The Scream",
          artist: "Edvard Munch"
        },
        {
          imageMesh: "art_template7",
          titleMesh: "title_template7",
          imageUrl: "https://images.vexels.com/media/users/3/207752/isolated/preview/697b63a22a36168f444beff7ade7e00b-david-abstract-art.png",
          title: "Starry Night",
          artist: "Vincent van Gogh"
        },
        {
          imageMesh: "art_template8",
          titleMesh: "title_template8",
          imageUrl: "https://img.freepik.com/free-photo/tradition-pattern-nature-celebration-bird-white_1417-554.jpg?semt=ais_hybrid&w=740",
          title: "The Scream",
          artist: "Edvard Munch"
        },
        {
          imageMesh: "art_template9",
          titleMesh: "title_template9",
          imageUrl: "https://i.pinimg.com/736x/f2/a1/f5/f2a1f5a00ceefc664add2f820689bf57.jpg",
          title: "Starry Night",
          artist: "Vincent van Gogh"
        },
        {
          imageMesh: "art_template10",
          titleMesh: "title_template10",
          imageUrl: "https://png.pngtree.com/png-vector/20200123/ourmid/pngtree-hand-drawn-mandala-art-png-image_2133833.jpg",
          title: "The Scream",
          artist: "Edvard Munch"
        },
        
        // More entries...
      ];

      const textureLoader = new THREE.TextureLoader();

      artworks.forEach(({ imageMesh, titleMesh, imageUrl, title, artist }) => {
        const artObj = gltf.scene.getObjectByName(imageMesh) as THREE.Mesh;
        const titleObj = gltf.scene.getObjectByName(titleMesh) as THREE.Mesh;

        // 🖼 Apply artwork image
        if (artObj && artObj.material !== undefined) {
  textureLoader.load(imageUrl, (texture) => {
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.center.set(0.5, 0.5); // Center pivot for offsetting

    // Manually set frame dimensions here
    const frameWidth = artObj.scale.x;
    const frameHeight = artObj.scale.y;
    const frameAspect = frameWidth / frameHeight;
    const imageAspect = texture.image.width / texture.image.height;

    if (imageAspect > frameAspect) {
      // Wider image: scale height to fit, crop sides
      const scale = frameAspect / imageAspect;
      texture.repeat.set(1, scale);
      texture.offset.set(0, (1 - scale) / 2);
    } else {
      // Taller image: scale width to fit, crop top/bottom
      const scale = imageAspect / frameAspect;
      texture.repeat.set(scale, 1);
      texture.offset.set((1 - scale) / 2, 0);
    }

    artObj.material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
  });
}


        // 📝 Apply title + artist using canvas texture
        if (titleObj && titleObj.material !== undefined) {
          const canvas = document.createElement("canvas");
          canvas.width = 512;
          canvas.height = 128;
          const ctx = canvas.getContext("2d")!;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#000000";
          ctx.font = "bold 32px Arial";
          ctx.fillText(title, 20, 50);
          ctx.font = "24px Arial";
          ctx.fillText("by " + artist, 20, 100);

          const texture = new THREE.CanvasTexture(canvas);
          const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
          titleObj.material = mat;
        }
      });
    });


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



