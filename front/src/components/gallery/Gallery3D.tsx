import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { PMREMGenerator } from "three";

interface Gallery3DProps {
  slotArtworkMap: Record<number, string>;
  artworks: { id: string; image_url: string; title: string; artist: string }[];
}

const Gallery3D: React.FC<Gallery3DProps> = ({ slotArtworkMap, artworks }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [controlsEnabled, setControlsEnabled] = useState(false);

  const imageMeshesRef = useRef<Record<string, THREE.Mesh>>({});
  const titleMeshesRef = useRef<Record<string, THREE.Mesh>>({});
  const sceneRef = useRef<THREE.Scene | null>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(-13, 1, 0);
    camera.lookAt(new THREE.Vector3(100, 1, 0));

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const controls = new PointerLockControls(camera, renderer.domElement);
    mount.addEventListener("click", () => controls.lock());

    controls.addEventListener("lock", () => setControlsEnabled(true));
    controls.addEventListener("unlock", () => setControlsEnabled(false));
    scene.add(controls.getObject());

    let velocity = new THREE.Vector3();
    let direction = new THREE.Vector3();
    const keysPressed: Record<string, boolean> = {};

    const onKeyDown = (event: KeyboardEvent) => (keysPressed[event.code] = true);
    const onKeyUp = (event: KeyboardEvent) => (keysPressed[event.code] = false);

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    const loader = new GLTFLoader();
    loader.load("/gallery_scenes/10art_scene_apart.glb", (gltf) => {
      scene.add(gltf.scene);

      // Store mesh refs for reactivity
      for (let i = 1; i <= 10; i++) {
        const artMesh = gltf.scene.getObjectByName(`art_template${i}`) as THREE.Mesh;
        const titleMesh = gltf.scene.getObjectByName(`title_template${i}`) as THREE.Mesh;
        if (artMesh) imageMeshesRef.current[`art_template${i}`] = artMesh;
        if (titleMesh) titleMeshesRef.current[`title_template${i}`] = titleMesh;
      }
    });

    const clock = new THREE.Clock();
    new RGBELoader().load('/gallery_scenes/autumn_field_puresky_4k.hdr', (texture) => {
      const pmremGenerator = new PMREMGenerator(renderer);
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      scene.environment = envMap;
      scene.background = envMap;
      texture.dispose();
      pmremGenerator.dispose();
    });

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
          direction.normalize();
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

  // 🔁 Reactively update textures and titles
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();

    for (let i = 1; i <= 10; i++) {
      const slotId = i;
      const artworkId = slotArtworkMap[slotId];
      const meshName = `art_template${slotId}`;
      const titleName = `title_template${slotId}`;
      const mesh = imageMeshesRef.current[meshName];
      const titleMesh = titleMeshesRef.current[titleName];

      if (!mesh) continue;

      if (!artworkId) {
        // Clear slot
        mesh.material = new THREE.MeshBasicMaterial({ color: 0xeeeeee, side: THREE.DoubleSide });
        if (titleMesh) {
          titleMesh.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        }
        continue;
      }

      const artwork = artworks.find((a) => a.id === artworkId);
      if (!artwork) continue;

      // Load texture for artwork image
      textureLoader.load(artwork.image_url, (texture) => {
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.center.set(0.5, 0.5);

        const frameAspect = mesh.scale.x / mesh.scale.y;
        const imageAspect = texture.image.width / texture.image.height;

        if (imageAspect > frameAspect) {
          const scale = frameAspect / imageAspect;
          texture.repeat.set(1, scale);
          texture.offset.set(0, (1 - scale) / 2);
        } else {
          const scale = imageAspect / frameAspect;
          texture.repeat.set(scale, 1);
          texture.offset.set((1 - scale) / 2, 0);
        }

        mesh.material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
      });

      if (titleMesh) {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#000000";
        ctx.font = "bold 32px Arial";
        ctx.fillText(artwork.title || "Untitled", 20, 50);
        ctx.font = "24px Arial";
        ctx.fillText("by " + (artwork.artist || "Unknown"), 20, 100);

        const titleTexture = new THREE.CanvasTexture(canvas);
        titleMesh.material = new THREE.MeshBasicMaterial({ map: titleTexture, side: THREE.DoubleSide });
      }
    }
  }, [slotArtworkMap, artworks]);

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
          <p className="text-xs relative bottom-40">Click to enter the gallery and use WASD + mouse to move</p>
        </div>
      )}
    </>
  );
};

export default Gallery3D;
