import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls, button, monitor } from "leva";
import { FrameProfiler, formatReport } from "./frameProfiler.js";

const PROFILER_CAPACITY = 1800;
const ROLLING_CAPACITY = 120;

const LiveHud = ({ hudTextRef }) => {
  const rollingRef = useRef(new FrameProfiler(ROLLING_CAPACITY));

  useFrame(({ clock }) => {
    rollingRef.current.tick(clock.elapsedTime * 1000);
  });

  useEffect(() => {
    const updateHud = () => {
      const r = rollingRef.current.getReport({ warmupFrames: 5 });
      if (!r) {
        hudTextRef.current = "fps: --  ms: --";
        return;
      }
      hudTextRef.current = `fps rAF: ${r.fps.toFixed(0)}  ms: ${r.avgMs.toFixed(2)}`;
    };
    updateHud();
    const id = setInterval(updateHud, 250);
    return () => clearInterval(id);
  }, [hudTextRef]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.__chaos = window.__chaos || {};
    window.__chaos.rollingHud = rollingRef.current;
  }, []);

  return null;
};

const WorkTimeProbe = ({ active }) => {
  const profilerRef = useRef(new FrameProfiler(PROFILER_CAPACITY));
  const workRef = useRef(0);

  useFrame((state) => {
    if (!active) return;
    const t0 = state.clock.elapsedTime * 1000;
    if (state.gl.render) state.gl.render(state.scene, state.camera);
    const t1 = performance.now();
    const workMs = t1 - t0;
    workRef.current = workMs;
    profilerRef.current.recordDelta(workMs);
  }, 1000);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.__chaos = window.__chaos || {};
    window.__chaos.workProbe = {
      profiler: profilerRef.current,
      getLastWorkMs: () => workRef.current,
      getReport: (opts) => profilerRef.current.getReport(opts),
    };
  }, []);

  return null;
};

const BenchmarkHarness = () => {
  const hudTextRef = useRef("press Run 10s to start a benchmark");
  const reportTextRef = useRef("press a benchmark button");
  const lastConfigRef = useRef("—");
  const statusRef = useRef("idle");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.__chaos = window.__chaos || {};
    const runBenchmark = async (opts = {}) => {
      const durationSec = opts.durationSec ?? 10;
      const warmupFrames = opts.warmupFrames ?? 30;
      const label = opts.label ?? "manual";
      statusRef.current = "running";
      reportTextRef.current = `running for ${durationSec}s...`;
      lastConfigRef.current = `${label} • ${durationSec}s • warmup=${warmupFrames}`;
      setRunning(true);
      await new Promise((r) => setTimeout(r, 80));
      return new Promise((resolve) => {
        setTimeout(() => {
          setRunning(false);
          const probe = window.__chaos.workProbe;
          const rWork = probe?.getReport({ warmupFrames });
          if (rWork) {
            reportTextRef.current = `WORK  ms avg ${rWork.avgMs.toFixed(2)}  p50 ${rWork.p50Ms.toFixed(2)}  p95 ${rWork.p95Ms.toFixed(2)}  p99 ${rWork.p99Ms.toFixed(2)}  fps uncapped ${rWork.fps.toFixed(1)}  (${rWork.frames} frames in ${rWork.durationSec.toFixed(2)}s)`;
            console.log(`[chaos benchmark] ${label} (work)\n${formatReport(rWork)}`);
            console.log(`[chaos benchmark] ${label} (json)`, rWork);
            statusRef.current = "done";
          } else {
            reportTextRef.current = "not enough samples";
            statusRef.current = "no-samples";
            console.warn(`[chaos benchmark] ${label}: not enough samples`);
          }
          resolve(rWork);
        }, durationSec * 1000);
      });
    };
    window.__chaos.benchmark = runBenchmark;
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

  return (
    <>
      <LiveHud hudTextRef={hudTextRef} />
      {running && <WorkTimeProbe active={running} />}
    </>
  );
};

export default BenchmarkHarness;
