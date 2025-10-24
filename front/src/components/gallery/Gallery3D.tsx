import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { PMREMGenerator } from "three";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface Gallery3DProps {
  slotArtworkMap: Record<number, string>;
  artworks: { id: string; image_url: string; title: string; artist: string }[];
}

const Gallery3D: React.FC<Gallery3DProps> = ({ slotArtworkMap, artworks }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [controlsEnabled, setControlsEnabled] = useState(false);
  const { language } = useLanguage();

  const imageMeshesRef = useRef<Record<string, THREE.Mesh>>({});
  const titleMeshesRef = useRef<Record<string, THREE.Mesh>>({});
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [meshesReady, setMeshesReady] = useState(false);
<<<<<<< HEAD
  const [translatedArtworks, setTranslatedArtworks] = useState<Record<string, { title: string; artist: string }>>({});

  // Translation hooks
  const clickToEnterText = useAutoTranslation("Click to enter the gallery and use WASD + mouse to move", language);
=======
  const [translatedArtworks, setTranslatedArtworks] = useState<
    Record<string, { title: string; artist: string }>
  >({});

  // ✅ Hovered metadata state (now includes description & medium)
  const [hoveredArtwork, setHoveredArtwork] = useState<{
    title: string;
    artist: string;
    medium: string;
    description: string;
  } | null>(null);

  // Translation hooks
  const clickToEnterText = useAutoTranslation(
    "Click to enter the gallery and use WASD + mouse to move",
    language
  );
>>>>>>> 14df248f873820831656712267eefa581a71268f
  const untitledText = useAutoTranslation("Untitled", language);
  const byText = useAutoTranslation("by", language);
  const unknownText = useAutoTranslation("Unknown", language);

  // Translate artwork titles and artist names
  useEffect(() => {
    const translateArtworks = async () => {
      const { autoTranslate } = await import("@/utils/autoTranslate");
      const translated: Record<string, { title: string; artist: string }> = {};

      for (const artwork of artworks) {
        try {
<<<<<<< HEAD
          const translatedTitle = language.toLowerCase() !== "en" 
            ? await autoTranslate(artwork.title || "Untitled", language.toLowerCase())
            : artwork.title || "Untitled";
          
          const translatedArtist = language.toLowerCase() !== "en"
            ? await autoTranslate(artwork.artist || "Unknown", language.toLowerCase())
            : artwork.artist || "Unknown";

          translated[artwork.id] = {
            title: translatedTitle,
            artist: translatedArtist
          };
        } catch (error) {
          translated[artwork.id] = {
            title: artwork.title || "Untitled",
            artist: artwork.artist || "Unknown"
=======
          const translatedTitle =
            language.toLowerCase() !== "en"
              ? await autoTranslate(artwork.title || "Untitled", language.toLowerCase())
              : artwork.title || "Untitled";

          const translatedArtist =
            language.toLowerCase() !== "en"
              ? await autoTranslate(artwork.artist || "Unknown", language.toLowerCase())
              : artwork.artist || "Unknown";

          translated[artwork.id] = { title: translatedTitle, artist: translatedArtist };
        } catch (error) {
          translated[artwork.id] = {
            title: artwork.title || "Untitled",
            artist: artwork.artist || "Unknown",
>>>>>>> 14df248f873820831656712267eefa581a71268f
          };
        }
      }

      setTranslatedArtworks(translated);
    };

    if (artworks.length > 0) {
      translateArtworks();
    }
  }, [artworks, language]);

  useEffect(() => {
    const mount = mountRef.current!;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
<<<<<<< HEAD
    camera.position.set(-13, 1, 0);
=======
    camera.position.set(0, 2, 0);
>>>>>>> 14df248f873820831656712267eefa581a71268f
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

<<<<<<< HEAD
    const loader = new GLTFLoader();
loader.load("/gallery_scenes/10art_scene_apart.glb", (gltf) => {
  scene.add(gltf.scene);

  for (let i = 1; i <= 10; i++) {
    const artMesh = gltf.scene.getObjectByName(`art_template${i}`) as THREE.Mesh;
    const titleMesh = gltf.scene.getObjectByName(`title_template${i}`) as THREE.Mesh;
    if (artMesh) imageMeshesRef.current[`art_template${i}`] = artMesh;
    if (titleMesh) titleMeshesRef.current[`title_template${i}`] = titleMesh;
  }

  setMeshesReady(true); 
});


    const clock = new THREE.Clock();
    new RGBELoader().load('/gallery_scenes/autumn_field_puresky_4k.hdr', (texture) => {
=======
    // ✅ ESC → Unlock or go back
    const onEscape = (event: KeyboardEvent) => {
      if (event.code === "Escape") {
        if (controls.isLocked) controls.unlock();
        else window.history.back();
      }
    };
    document.addEventListener("keydown", onEscape);

    const loader = new GLTFLoader();
    loader.load("/gallery_scenes/test1.glb", (gltf) => {
      scene.add(gltf.scene);

      for (let i = 1; i <= 10; i++) {
        const artMesh = gltf.scene.getObjectByName(`art_template${i}`) as THREE.Mesh;
        const titleMesh = gltf.scene.getObjectByName(`title_template${i}`) as THREE.Mesh;
        if (artMesh) imageMeshesRef.current[`art_template${i}`] = artMesh;
        if (titleMesh) titleMeshesRef.current[`title_template${i}`] = titleMesh;
      }

      setMeshesReady(true);
    });

    new RGBELoader().load("/gallery_scenes/autumn_field_puresky_4k.hdr", (texture) => {
>>>>>>> 14df248f873820831656712267eefa581a71268f
      const pmremGenerator = new PMREMGenerator(renderer);
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      scene.environment = envMap;
      scene.background = envMap;
      texture.dispose();
      pmremGenerator.dispose();
    });

<<<<<<< HEAD
    const animate = () => {
      requestAnimationFrame(animate);
=======
    const clock = new THREE.Clock();
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);

>>>>>>> 14df248f873820831656712267eefa581a71268f
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

<<<<<<< HEAD
=======
      // ✅ Hover detection (with mock description + medium)
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Object.values(imageMeshesRef.current));
      if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object;
        const meshName = hoveredMesh.name;
        const slotIndex = parseInt(meshName.replace("art_template", ""));
        const artworkId = slotArtworkMap[slotIndex];
        const artwork = artworks.find((a) => a.id === artworkId);
        if (artwork) {
          setHoveredArtwork({
            title:
              translatedArtworks[artwork.id]?.title ||
              artwork.title ||
              untitledText,
            artist:
              translatedArtworks[artwork.id]?.artist ||
              artwork.artist ||
              unknownText,
            medium: "Oil on Canvas", // ✅ mock medium
            description:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus at dui vitae neque imperdiet suscipit.", // ✅ mock description
          });
        }
      } else {
        setHoveredArtwork(null);
      }

>>>>>>> 14df248f873820831656712267eefa581a71268f
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
<<<<<<< HEAD
      mount.removeChild(renderer.domElement);
      controls.dispose();
    };
  }, []);


useEffect(() => {
  if (!meshesReady) return; 

  const textureLoader = new THREE.TextureLoader();

  for (let i = 1; i <= 10; i++) {
    const slotId = i;
    const artworkId = slotArtworkMap[slotId];
    const meshName = `art_template${slotId}`;
    const titleName = `title_template${slotId}`;
    const mesh = imageMeshesRef.current[meshName];
    const titleMesh = titleMeshesRef.current[titleName];

    if (!mesh) {
    
      continue;
    }

    if (!artworkId) {
      mesh.material = new THREE.MeshBasicMaterial({ color: 0xeeeeee, side: THREE.DoubleSide });
      if (titleMesh) {
        titleMesh.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      }
      continue;
    }

    const artwork = artworks.find((a) => a.id === artworkId);
    if (!artwork) continue;

    textureLoader.load(
      artwork.image_url,
      (texture) => {
        mesh.material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
      },
      undefined,
      (err) => {
      
        mesh.material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
      }
    );

    if (titleMesh) {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 32px Arial";
      const displayTitle = translatedArtworks[artwork.id]?.title || artwork.title || untitledText;
      ctx.fillText(displayTitle, 20, 50);
      ctx.font = "24px Arial";
      const displayArtist = translatedArtworks[artwork.id]?.artist || artwork.artist || unknownText;
      ctx.fillText(byText + " " + displayArtist, 20, 100);

      const titleTexture = new THREE.CanvasTexture(canvas);
      titleMesh.material = new THREE.MeshBasicMaterial({ map: titleTexture, side: THREE.DoubleSide });
    }
  }
}, [slotArtworkMap, artworks, meshesReady, translatedArtworks, untitledText, byText, unknownText]);


  return (
    <>
      <div
        ref={mountRef}
        style={{ width: "100%", height: "100vh", outline: "none" }}
        tabIndex={0}
      />
=======
      document.removeEventListener("keydown", onEscape);
      window.removeEventListener("mousemove", onMouseMove);
      mount.removeChild(renderer.domElement);
      controls.dispose();
    };
  }, [slotArtworkMap, artworks, translatedArtworks, untitledText, unknownText]);

  // 🖼️ Apply textures + title/artist on meshes
  useEffect(() => {
    if (!meshesReady) return;

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
        mesh.material = new THREE.MeshBasicMaterial({ color: 0xeeeeee, side: THREE.DoubleSide });
        if (titleMesh) titleMesh.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        continue;
      }

      const artwork = artworks.find((a) => a.id === artworkId);
      if (!artwork) continue;

      textureLoader.load(
        artwork.image_url,
        (texture) => {
          mesh.material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        },
        undefined,
        () => {
          mesh.material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
        }
      );

      if (titleMesh) {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#000000";
        ctx.font = "bold 32px Arial";
        const displayTitle =
          translatedArtworks[artwork.id]?.title || artwork.title || untitledText;
        ctx.fillText(displayTitle, 20, 50);
        ctx.font = "24px Arial";
        const displayArtist =
          translatedArtworks[artwork.id]?.artist || artwork.artist || unknownText;
        ctx.fillText(byText + " " + displayArtist, 20, 100);

        const titleTexture = new THREE.CanvasTexture(canvas);
        titleMesh.material = new THREE.MeshBasicMaterial({
          map: titleTexture,
          side: THREE.DoubleSide,
        });
      }
    }
  }, [slotArtworkMap, artworks, meshesReady, translatedArtworks, untitledText, byText, unknownText]);

  return (
    <>
      <div ref={mountRef} style={{ width: "100%", height: "100vh", outline: "none" }} tabIndex={0} />

      {/* 🧠 Hover Metadata UI */}
      {hoveredArtwork && (
        <>
          {/* Bottom-center overlay */}
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0,0,0,0.5)",
              color: "white",
              padding: "10px 25px",
              borderRadius: "12px",
              fontSize: "16px",
              textAlign: "center",
              pointerEvents: "none",
              maxWidth: "60%",
            }}
          >
            <strong>{hoveredArtwork.title}</strong>
            <div>
              {byText} {hoveredArtwork.artist} &nbsp; | &nbsp; {hoveredArtwork.medium}
            </div>
          </div>

          {/* Left-side description */}
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              right: "40px",
              width: "25%",
              backgroundColor: "rgba(0,0,0,0.7)",
              color: "white",
              padding: "15px",
              borderRadius: "10px",
              fontSize: "14px",
              lineHeight: "1.5em",
              pointerEvents: "none",
            }}
          >
            {hoveredArtwork.description}
          </div>
        </>
      )}

>>>>>>> 14df248f873820831656712267eefa581a71268f
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
          <p className="text-xs relative bottom-40">{clickToEnterText}</p>
        </div>
      )}
    </>
  );
};

<<<<<<< HEAD
export default Gallery3D;
=======
export default Gallery3D;
>>>>>>> 14df248f873820831656712267eefa581a71268f
