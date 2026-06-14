import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls, button, monitor } from "leva";
import { FrameProfiler, formatReport } from "./frameProfiler.js";

const PROFILER_CAPACITY = 1800;
const ROLLING_CAPACITY = 120;

const BenchmarkHarness = () => {
  const profilerRef = useRef(new FrameProfiler(PROFILER_CAPACITY));
  const rollingRef = useRef(new FrameProfiler(ROLLING_CAPACITY));
  const hudTextRef = useRef("fps: --  ms: --");
  const statusRef = useRef("idle");
  const reportTextRef = useRef("press a benchmark button");
  const lastConfigRef = useRef("—");
  const [status, setStatus] = useState("idle");
  const hudTimerRef = useRef(0);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 1000;
    profilerRef.current.tick(t);
    rollingRef.current.tick(t);
  });

  useEffect(() => {
    const updateHud = () => {
      const live = rollingRef.current.getReport({ warmupFrames: 5 });
      if (!live) {
        hudTextRef.current = "fps: --  ms: --";
        return;
      }
      hudTextRef.current = `fps: ${live.fps.toFixed(1)}  ms avg: ${live.avgMs.toFixed(2)}  p95: ${live.p95Ms.toFixed(2)}`;
    };
    updateHud();
    hudTimerRef.current = setInterval(updateHud, 250);
    return () => clearInterval(hudTimerRef.current);
  }, []);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.__chaos = window.__chaos || {};
    const runBenchmark = (opts = {}) => {
      const durationSec = opts.durationSec ?? 10;
      const warmupFrames = opts.warmupFrames ?? 30;
      const label = opts.label ?? "manual";
      const profiler = profilerRef.current;
      profiler.reset();
      profiler.start();
      rollingRef.current.reset();
      rollingRef.current.start();
      setStatus("running");
      reportTextRef.current = `running for ${durationSec}s...`;
      lastConfigRef.current = `${label} • ${durationSec}s • warmup=${warmupFrames}`;
      return new Promise((resolve) => {
        setTimeout(() => {
          profiler.stop();
          const r = profiler.getReport({ warmupFrames });
          setStatus(r ? "done" : "no-samples");
          if (r) {
            reportTextRef.current = `avg ${r.avgMs.toFixed(2)} ms • p95 ${r.p95Ms.toFixed(2)} ms • p99 ${r.p99Ms.toFixed(2)} ms • ${r.fps.toFixed(1)} fps • ${r.frames} frames`;
            console.log(`[chaos benchmark] ${label}\n${formatReport(r)}`);
            console.log(`[chaos benchmark] ${label} (json)`, r);
          } else {
            reportTextRef.current = "not enough samples";
            console.warn(`[chaos benchmark] ${label}: not enough samples`);
          }
          resolve(r);
        }, durationSec * 1000);
      });
    };
    window.__chaos.benchmark = runBenchmark;
    window.__chaos.profiler = profilerRef.current;
    window.__chaos.rollingProfiler = rollingRef.current;
    return () => {
      if (window.__chaos.benchmark === runBenchmark) {
        delete window.__chaos.benchmark;
      }
    };
  }, []);

  useControls({
    "Live FPS": monitor(hudTextRef, { graph: false, interval: 250 }),
    "Run 10s": button(
      () => {
        window.__chaos?.benchmark({
          durationSec: 10,
          warmupFrames: 30,
          label: "10s",
        });
      },
      { label: "Run 10s benchmark" },
    ),
    "Run 30s": button(
      () => {
        window.__chaos?.benchmark({
          durationSec: 30,
          warmupFrames: 60,
          label: "30s",
        });
      },
      { label: "Run 30s benchmark" },
    ),
    Status: monitor(statusRef, { graph: false, interval: 250 }),
    "Last config": monitor(lastConfigRef, { graph: false, interval: 500 }),
    "Last report": monitor(reportTextRef, {
      graph: false,
      interval: 500,
    }),
  });

  return null;
};

export default BenchmarkHarness;
