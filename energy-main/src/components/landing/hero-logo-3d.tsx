"use client";

import type {
  Group,
  Material,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { useEffect, useRef, useState } from "react";
import {
  useAccessibleMotion,
  useFinePointer,
} from "@/hooks/use-accessible-motion";
import { withBasePath } from "@/lib/base-path";
import { threeMotion } from "@/lib/motion";

const modelSrc = withBasePath("/models/energy-logo-3d.glb");
const rotationSpeed = (Math.PI * 2) / threeMotion.rotationSeconds;
const frameInterval = 1000 / threeMotion.frameRate;

function disposeModel(root: Object3D) {
  root.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh) return;

    mesh.geometry.dispose();
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    materials.forEach((material: Material) => material.dispose());
  });
}

export function HeroLogo3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useAccessibleMotion();
  const finePointer = useFinePointer();
  const reducedRef = useRef(reduced);
  const syncMotionRef = useRef<() => void>(() => undefined);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const interactive = loaded && !failed && !reduced && finePointer;
  const shellClassName = failed
    ? "hero-logo-model-shell has-failed"
    : loaded
      ? `hero-logo-model-shell is-loaded${dragging ? " is-dragging" : ""}`
      : "hero-logo-model-shell";

  useEffect(() => {
    reducedRef.current = reduced;
    syncMotionRef.current();
  }, [reduced]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let active = true;
    let visible = true;
    let renderingFailed = false;
    let frameId: number | null = null;
    let previousTime = performance.now();
    let renderer: WebGLRenderer | undefined;
    let scene: Scene | undefined;
    let camera: PerspectiveCamera | undefined;
    let turntable: Group | undefined;
    let modelRoot: Object3D | undefined;
    let modelSize: Vector3 | undefined;
    let initializationTimer: number | undefined;
    let activePointerId: number | null = null;
    let previousPointerX = 0;
    let previousPointerY = 0;

    const canAnimate = () =>
      active &&
      !renderingFailed &&
      visible &&
      document.visibilityState === "visible" &&
      !reducedRef.current &&
      activePointerId === null &&
      Boolean(turntable);

    const renderOnce = () => {
      if (!renderingFailed && renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };

    const stopAnimation = () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
    };

    const animate = (time: number) => {
      frameId = null;
      if (!canAnimate() || !turntable) {
        renderOnce();
        return;
      }

      const elapsed = time - previousTime;
      if (elapsed < frameInterval) {
        frameId = requestAnimationFrame(animate);
        return;
      }

      const delta = Math.min(elapsed / 1000, 0.1);
      previousTime = time - (elapsed % frameInterval);
      turntable.rotation.y =
        (turntable.rotation.y + delta * rotationSpeed) % (Math.PI * 2);
      renderOnce();
      frameId = requestAnimationFrame(animate);
    };

    const syncAnimation = () => {
      if (canAnimate()) {
        if (frameId === null) {
          previousTime = performance.now();
          frameId = requestAnimationFrame(animate);
        }
      } else {
        stopAnimation();
        renderOnce();
      }
    };

    const fail = () => {
      if (!active) return;
      renderingFailed = true;
      stopAnimation();
      renderer?.dispose();
      renderer = undefined;
      setLoaded(false);
      setFailed(true);
    };

    const resize = () => {
      if (!renderer || !camera) return;

      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, threeMotion.maxPixelRatio),
      );
      renderer.setSize(width, height, false);
      camera.aspect = width / height;

      if (modelSize) {
        const verticalFov = (camera.fov * Math.PI) / 180;
        const horizontalFov =
          2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
        const heightDistance = modelSize.y / (2 * Math.tan(verticalFov / 2));
        const widthDistance = modelSize.x / (2 * Math.tan(horizontalFov / 2));
        const distance = Math.max(heightDistance, widthDistance) * 1.12;

        camera.position.set(0, 0, distance + modelSize.z / 2);
        camera.near = Math.max(0.01, distance / 100);
        camera.far = distance * 10;
        camera.updateProjectionMatrix();
        camera.lookAt(0, 0, 0);
      }

      renderOnce();
    };

    syncMotionRef.current = syncAnimation;

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncAnimation();
      },
      { rootMargin: "120px" },
    );
    intersectionObserver.observe(canvas);

    const handleVisibility = () => syncAnimation();
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      fail();
    };

    const updateManualRotation = () => {
      if (!turntable) return;
      canvas.dataset.rotationY = turntable.rotation.y.toFixed(4);
      canvas.dataset.rotationX = turntable.rotation.x.toFixed(4);
      renderOnce();
    };

    const handlePointerDown = (event: PointerEvent) => {
      const hasPrecisePointer =
        event.pointerType === "mouse" || event.pointerType === "pen";
      if (
        !turntable ||
        reducedRef.current ||
        !hasPrecisePointer ||
        event.button !== 0
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      activePointerId = event.pointerId;
      previousPointerX = event.clientX;
      previousPointerY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
      canvas.dataset.manipulating = "true";
      setDragging(true);
      stopAnimation();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (
        activePointerId !== event.pointerId ||
        !turntable ||
        reducedRef.current
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      const deltaX = event.clientX - previousPointerX;
      const deltaY = event.clientY - previousPointerY;
      previousPointerX = event.clientX;
      previousPointerY = event.clientY;

      const fullTurn = Math.PI * 2;
      turntable.rotation.y =
        ((turntable.rotation.y + deltaX * threeMotion.dragSensitivity) %
          fullTurn +
          fullTurn) %
        fullTurn;
      turntable.rotation.x = Math.max(
        -threeMotion.maxDragTilt,
        Math.min(
          threeMotion.maxDragTilt,
          turntable.rotation.x + deltaY * threeMotion.dragTiltSensitivity,
        ),
      );
      updateManualRotation();
    };

    const finishPointerInteraction = (event?: PointerEvent) => {
      if (
        event &&
        activePointerId !== null &&
        event.pointerId !== activePointerId
      ) {
        return;
      }

      if (
        activePointerId !== null &&
        canvas.hasPointerCapture(activePointerId)
      ) {
        canvas.releasePointerCapture(activePointerId);
      }
      activePointerId = null;
      canvas.dataset.manipulating = "false";
      if (active) setDragging(false);
      syncAnimation();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!turntable || reducedRef.current) return;

      const step = threeMotion.keyboardRotationStep;
      if (event.key === "ArrowLeft") turntable.rotation.y -= step;
      else if (event.key === "ArrowRight") turntable.rotation.y += step;
      else if (event.key === "ArrowUp") {
        turntable.rotation.x = Math.max(
          -threeMotion.maxDragTilt,
          turntable.rotation.x - step,
        );
      } else if (event.key === "ArrowDown") {
        turntable.rotation.x = Math.min(
          threeMotion.maxDragTilt,
          turntable.rotation.x + step,
        );
      } else {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      updateManualRotation();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", finishPointerInteraction);
    canvas.addEventListener("pointercancel", finishPointerInteraction);
    canvas.addEventListener("lostpointercapture", finishPointerInteraction);
    canvas.addEventListener("keydown", handleKeyDown);

    const initialize = async () => {
      try {
        const [THREE, { GLTFLoader }] = await Promise.all([
          import("three"),
          import("three/examples/jsm/loaders/GLTFLoader.js"),
        ]);
        if (!active) return;

        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: window.matchMedia(
            "(min-width: 851px) and (pointer: fine)",
          ).matches
            ? "high-performance"
            : "default",
        });
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(28, 1, 0.01, 100);
        camera.position.z = 8;

        scene.add(new THREE.HemisphereLight(0xffffff, 0x8f2f0a, 2.2));
        const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
        keyLight.position.set(5, 6, 7);
        scene.add(keyLight);
        const fillLight = new THREE.DirectionalLight(0xff9a6c, 2.1);
        fillLight.position.set(-5, -1, 4);
        scene.add(fillLight);
        const rimLight = new THREE.DirectionalLight(0x9db9d8, 1.2);
        rimLight.position.set(1, 3, -6);
        scene.add(rimLight);

        resize();

        const loader = new GLTFLoader();
        loader.load(
          modelSrc,
          (gltf) => {
            if (!active || !scene) {
              disposeModel(gltf.scene);
              return;
            }

            modelRoot = gltf.scene;
            const bounds = new THREE.Box3().setFromObject(modelRoot);
            const center = bounds.getCenter(new THREE.Vector3());
            modelRoot.position.sub(center);
            modelRoot.rotation.y = Math.PI / 2;

            turntable = new THREE.Group();
            turntable.rotation.y = -0.22;
            turntable.add(modelRoot);
            scene.add(turntable);
            turntable.updateMatrixWorld(true);
            modelSize = new THREE.Box3()
              .setFromObject(turntable)
              .getSize(new THREE.Vector3());

            resize();
            renderOnce();
            canvas.dataset.rotationY = turntable.rotation.y.toFixed(4);
            canvas.dataset.rotationX = turntable.rotation.x.toFixed(4);
            setLoaded(true);
            syncAnimation();
          },
          undefined,
          fail,
        );
      } catch {
        fail();
      }
    };

    initializationTimer = window.setTimeout(() => {
      initializationTimer = undefined;
      void initialize();
    }, threeMotion.loadDelayMs);

    return () => {
      active = false;
      syncMotionRef.current = () => undefined;
      if (initializationTimer !== undefined) {
        window.clearTimeout(initializationTimer);
      }
      stopAnimation();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", finishPointerInteraction);
      canvas.removeEventListener("pointercancel", finishPointerInteraction);
      canvas.removeEventListener(
        "lostpointercapture",
        finishPointerInteraction,
      );
      canvas.removeEventListener("keydown", handleKeyDown);
      if (modelRoot) disposeModel(modelRoot);
      renderer?.dispose();
    };
  }, []);

  return (
    <div
      className={shellClassName}
      data-model-loaded={loaded ? "true" : "false"}
      data-interactive={interactive ? "true" : "false"}
    >
      <canvas
        ref={canvasRef}
        className="hero-logo-model"
        data-motion={reduced ? "paused" : "running"}
        data-manipulating="false"
        role="img"
        aria-label={
          interactive
            ? "Símbolo tridimensional da Energy. Arraste com o mouse ou use as setas para girar."
            : "Símbolo tridimensional da Energy"
        }
        tabIndex={interactive ? 0 : -1}
      >
        Símbolo tridimensional da Energy
      </canvas>
      <span className="hero-logo-interaction-hint" aria-hidden="true">
        Arraste para girar
      </span>
    </div>
  );
}
