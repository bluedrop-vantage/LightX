import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../../state/store';
import { Canvas3D } from '../../render/Canvas3D';
import { createSceneController } from '../../render/SceneController';
import {
  alcubierreMeshOffset,
  comovingCoordinateVelocity,
  expansionScalar,
  stressEnergyDensity,
  type AlcubierreParams,
} from '../../physics/metrics/alcubierre';
import { ctcFromCrossingWarps } from '../../physics/conditions/chronology';
import { C } from '../../physics/constants';
import { Slot } from '../../ui/Slot';
import { Slider } from '../../ui/Slider';
import { VerdictCard } from '../VerdictCard';
import { EquationsPanel } from '../../ui/EquationsPanel';
import { SealBreakBadge } from '../../ui/SealBreakBadge';
import { FordRomanMeter } from '../../ui/FordRomanMeter';
import { NumericsReadout } from '../../ui/NumericsReadout';
import { TripClocks } from '../../ui/TripClocks';
import { getIngredient } from '../../pantry/ingredients';
import { useGeodesicTracer } from '../../render/useGeodesicTracer';
import { getGeodesicClient } from '../../workers/workerClient';
import { HelpButton } from '../../ui/HelpButton';
import { RecipeShortcuts } from '../../ui/RecipeShortcuts';

const WARP_EQUATIONS = ['alcubierreMetric', 'shapeFunction', 'einsteinField', 'nullEnergy', 'fordRoman'];

export function WarpConstructor() {
  const controller = useMemo(() => createSceneController(10), []);
  const v_s = useStore((s) => s.activeConstruct.parameters.v_s ?? 0.5);
  const wallThickness = useStore((s) => s.activeConstruct.parameters.wallThickness ?? 1);
  const twinEnabled = (useStore((s) => s.activeConstruct.parameters.twinBubble) ?? 0) > 0.5;
  const v_s2 = useStore((s) => s.activeConstruct.parameters.v_s2 ?? 1.5);
  const setParameter = useStore((s) => s.setParameter);
  const verdict = useStore((s) => s.verdict);
  const activeSeals = useStore((s) => s.activeSeals);
  const toggleSeal = useStore((s) => s.toggleSeal);
  const canBreak = useStore((s) => s.canBreak);
  const recordSeal = useStore((s) => s.recordSeal);
  const placements = useStore((s) => s.activeConstruct.placements);
  const [showCones, setShowCones] = useState(false);
  const [showShipCone, setShowShipCone] = useState(false);
  const [shipAsGeodesic, setShipAsGeodesic] = useState(false);
  const [ctcActive, setCtcActive] = useState(false);
  const ctcSealedRef = useRef(false);

  const tRef = useRef(0);
  const shipStateRef = useRef({ x: 0, y: 0 });
  const [clocks, setClocks] = useState({ shipTau: 0, earthT: 0, distance: 0 });
  const paramsRef = useRef<AlcubierreParams>({
    v_s: 0.5,
    R: 3,
    sigma: 2,
    center: [0, 0],
    t: 0,
  });
  const params2Ref = useRef<AlcubierreParams>({
    v_s: 1.5,
    R: 2.4,
    sigma: 2,
    center: [7, 3],
    t: 0,
  });

  useEffect(() => {
    paramsRef.current.v_s = v_s;
    paramsRef.current.sigma = 1 / Math.max(0.2, wallThickness);
    params2Ref.current.v_s = -v_s2;
    params2Ref.current.sigma = 1 / Math.max(0.2, wallThickness);
  }, [v_s, wallThickness, v_s2]);

  const hasNegativeWall = placements.some(
    (p) => p.slot === 'bubbleWall' && getIngredient(p.ingredient).energyDensity === 'negative',
  );

  const { emitFrom, clear: clearRays, rayCount } = useGeodesicTracer({
    metricKind: 'alcubierre',
    getMetricParams: () => ({
      v_s: paramsRef.current.v_s,
      R: paramsRef.current.R,
      sigma: paramsRef.current.sigma,
      center: paramsRef.current.center,
      t: 0,
    }),
    scene: controller,
    raysPerBurst: 10,
    steps: 220,
    dt: 0.05,
    color: 0xffe27a,
  });

  useEffect(() => {
    const positiveMass = placements
      .filter((p) => p.slot === 'bubbleWall')
      .reduce((s, p) => s + (getIngredient(p.ingredient).energyDensity === 'positive' ? p.amount : 0), 0);

    controller.setEvaluator((x, y) => {
      if (hasNegativeWall) {
        const p = paramsRef.current;
        p.t = tRef.current;
        const a = alcubierreMeshOffset(x, y, p);
        if (twinEnabled) {
          const p2 = params2Ref.current;
          p2.t = tRef.current;
          const b = alcubierreMeshOffset(x, y, p2);
          return {
            z: a.z + b.z,
            expansion: a.expansion + b.expansion,
            xOffset: a.xOffset + b.xOffset,
          };
        }
        return a;
      }
      if (positiveMass > 0) {
        const r = Math.hypot(x, y) + 0.5;
        return { z: -positiveMass / (r * r), expansion: 0 };
      }
      return { z: 0, expansion: 0 };
    });

    controller.setConeTilt((x, y) => {
      if (!hasNegativeWall) return { tiltX: 0, tiltY: 0 };
      const p = paramsRef.current;
      p.t = tRef.current;
      const dx = x - (p.center[0] + p.v_s * p.t);
      const along = Math.hypot(dx, y - p.center[1]) + 1e-6;
      const strength = expansionScalar(x, y, p);
      return { tiltX: (strength * dx) / along * 0.8, tiltY: 0 };
    });

    controller.setBubbleIndicator(hasNegativeWall, paramsRef.current.R, [
      paramsRef.current.center[0] + paramsRef.current.v_s * tRef.current,
      paramsRef.current.center[1],
    ]);
    controller.setSecondaryBubble(twinEnabled && hasNegativeWall, params2Ref.current.R, [
      params2Ref.current.center[0] + params2Ref.current.v_s * tRef.current,
      params2Ref.current.center[1],
    ]);
    controller.setLightConesVisible(showCones && hasNegativeWall);
    clearRays();
  }, [placements, controller, hasNegativeWall, twinEnabled, showCones, clearRays]);

  useEffect(() => {
    if (shipAsGeodesic) {
      shipStateRef.current = {
        x: paramsRef.current.center[0] + paramsRef.current.v_s * tRef.current,
        y: 0,
      };
    }
  }, [shipAsGeodesic]);

  useEffect(() => {
    if (!showShipCone) {
      controller.clearShipCone();
      return;
    }
    let cancelled = false;
    let raf = 0;
    let pulseStart = performance.now();
    const PULSE_MS = 1400;
    const client = getGeodesicClient();

    const fireBurst = async () => {
      if (cancelled) return;
      const p = paramsRef.current;
      const shipX = shipAsGeodesic
        ? shipStateRef.current.x
        : p.center[0] + p.v_s * tRef.current;
      const shipY = shipAsGeodesic ? shipStateRef.current.y : 0;
      const rays = [];
      const N = 12;
      for (let i = 0; i < N; i++) {
        const theta = (i / N) * Math.PI * 2;
        rays.push({
          x: shipX,
          y: shipY,
          vx: Math.cos(theta),
          vy: Math.sin(theta),
          kind: 'null' as const,
        });
      }
      try {
        const res = await client.integrate({
          metricKind: 'alcubierre',
          metricParams: { ...p, t: 0 },
          rays,
          steps: 80,
          dt: 0.04,
        });
        if (cancelled) return;
        controller.setShipConePaths(res.paths.map((points) => ({ points, color: 0x66d19e })));
        pulseStart = performance.now();
      } catch {
        /* ignore transient worker errors */
      }
    };

    fireBurst();
    const animate = (t: number) => {
      if (cancelled) return;
      const elapsed = t - pulseStart;
      const fraction = Math.min(1, elapsed / PULSE_MS);
      controller.setShipConeDrawFraction(fraction);
      if (fraction >= 1) {
        fireBurst();
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      controller.clearShipCone();
    };
  }, [showShipCone, shipAsGeodesic, controller]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      tRef.current += dt * 0.6;
      if (tRef.current * paramsRef.current.v_s > 6) tRef.current = -6 / Math.max(0.1, paramsRef.current.v_s);

      let primaryX: number;
      let primaryY: number;
      if (shipAsGeodesic) {
        const p = paramsRef.current;
        p.t = tRef.current;
        const drift = comovingCoordinateVelocity(
          shipStateRef.current.x,
          shipStateRef.current.y,
          p,
        );
        shipStateRef.current.x += drift.vx * dt * 0.6;
        shipStateRef.current.y += drift.vy * dt * 0.6;
        if (shipStateRef.current.x > 12 || shipStateRef.current.x < -12) {
          shipStateRef.current.x = -6;
          shipStateRef.current.y = 0;
        }
        primaryX = shipStateRef.current.x;
        primaryY = shipStateRef.current.y;
      } else {
        primaryX = paramsRef.current.center[0] + paramsRef.current.v_s * tRef.current;
        primaryY = 0;
      }
      controller.setShipPosition(primaryX, primaryY, 0.5);
      const superluminal = paramsRef.current.v_s > 1;
      controller.setShipSteeringSevered(superluminal);
      controller.setBubbleIndicator(hasNegativeWall, paramsRef.current.R, [
        paramsRef.current.center[0] + paramsRef.current.v_s * tRef.current,
        0,
      ]);

      if (twinEnabled && hasNegativeWall) {
        const secondX = params2Ref.current.center[0] + params2Ref.current.v_s * tRef.current;
        controller.setSecondaryShipPosition(secondX, params2Ref.current.center[1], 0.5);
        controller.setSecondaryBubble(true, params2Ref.current.R, [
          secondX,
          params2Ref.current.center[1],
        ]);
        const ctc = ctcFromCrossingWarps(
          {
            position: [primaryX, primaryY],
            velocity: [paramsRef.current.v_s * C, 0],
            bubbleRadius: paramsRef.current.R,
          },
          {
            position: [secondX, params2Ref.current.center[1]],
            velocity: [params2Ref.current.v_s * C, 0],
            bubbleRadius: params2Ref.current.R,
          },
        );
        setCtcActive(ctc);
        if (ctc && !ctcSealedRef.current) {
          ctcSealedRef.current = true;
          recordSeal({
            seal: 'chronologyProtection',
            reason:
              'Two superluminal warp bubbles overlapped — closed timelike curve detected (Hawking chronology protection violated).',
            citation: 'Hawking 1992',
            triggeredBy: 'geometry',
            timestamp: Date.now(),
          });
        } else if (!ctc) {
          ctcSealedRef.current = false;
        }
      } else {
        controller.setSecondaryBubble(false, 0, [0, 0]);
        setCtcActive(false);
        ctcSealedRef.current = false;
      }

      // Trip time (mod one lap of the bubble across the canvas) so the clocks
      // don't clip to 0 while tRef is briefly negative during the wrap-around.
      const lapDuration = 12 / Math.max(0.1, paramsRef.current.v_s);
      const tripTime = ((tRef.current + lapDuration / 2) % lapDuration + lapDuration) % lapDuration;
      // Alcubierre interior is locally inertial: dτ = dt, so ship τ === Earth t.
      setClocks({
        shipTau: tripTime,
        earthT: tripTime,
        distance: paramsRef.current.v_s * tripTime,
      });

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [controller, hasNegativeWall, twinEnabled, shipAsGeodesic, recordSeal]);

  const onWorldClick = useCallback(
    (world: { x: number; y: number }) => emitFrom(world),
    [emitFrom],
  );

  const numericsCompute = useCallback(() => {
    const p = paramsRef.current;
    const samplePoint = { x: p.center[0] + p.v_s * tRef.current, y: p.R };
    const theta = expansionScalar(samplePoint.x, samplePoint.y, { ...p, t: tRef.current });
    const rho = stressEnergyDensity(samplePoint.x, samplePoint.y, { ...p, t: tRef.current });
    return [
      { label: 'θ  (expansion, wall top)', value: theta, format: (v: number) => v.toExponential(3), unit: 'c/L' },
      { label: 'ρ  (T₀₀, wall top)', value: rho, format: (v: number) => v.toExponential(3), unit: 'ℓ_P⁻²' },
      { label: 'v_s', value: p.v_s, format: (v: number) => v.toFixed(2), unit: 'c' },
      { label: 'wall σ⁻¹', value: 1 / p.sigma, format: (v: number) => v.toFixed(2) },
    ];
  }, []);

  const superluminal = v_s > 1;
  const qiActive = activeSeals.includes('quantumInequality');

  return (
    <div className="constructor warp-constructor">
      <div className="constructor-canvas">
        <Canvas3D controller={controller} onWorldClick={onWorldClick} />
        <div className="canvas-hint">Click the canvas to fire a light-ray fan · Rays: {rayCount}</div>
        {rayCount > 0 && (
          <button type="button" className="canvas-clear" onClick={clearRays}>
            Clear rays
          </button>
        )}
        <div className="canvas-toggles">
          <label>
            <input
              type="checkbox"
              checked={showCones}
              onChange={(e) => setShowCones(e.target.checked)}
            />
            Light-cone ribbons
            <HelpButton helpKey="toggle-light-cones" />
          </label>
          <label>
            <input
              type="checkbox"
              checked={showShipCone}
              onChange={(e) => setShowShipCone(e.target.checked)}
            />
            Ship's local light cone
            <HelpButton helpKey="toggle-ship-cone" />
          </label>
          <label>
            <input
              type="checkbox"
              checked={shipAsGeodesic}
              onChange={(e) => setShipAsGeodesic(e.target.checked)}
            />
            Ship-as-geodesic (RK4)
            <HelpButton helpKey="toggle-ship-geodesic" />
          </label>
        </div>
        {(superluminal || ctcActive) && (
          <div className="canvas-overlays">
            {superluminal && (
              <div className="overlay-horizon" role="status">
                v_s &gt; c · steering severed · pilot cannot signal the front wall
              </div>
            )}
            {ctcActive && (
              <div className="overlay-chronology" role="alert">
                CTC alarm · two superluminal bubbles overlap · chronology protection violated
              </div>
            )}
          </div>
        )}
      </div>
      <div className="constructor-panel">
        <h2>
          Warp Bubble (Alcubierre)
          <HelpButton helpKey="panel-warp" />
        </h2>
        <Slot
          slot="bubbleWall"
          label="Bubble Wall"
          hint="Only negative-energy ingredients shape a working wall."
          accept={(id) => getIngredient(id).shapeable}
        />
        <RecipeShortcuts kind="warp" />
        <div className="sliders">
          <Slider
            label="Bubble velocity"
            value={v_s}
            min={0.1}
            max={10}
            step={0.05}
            unit="c"
            onChange={(v) => setParameter('v_s', v)}
            hint={superluminal ? 'Superluminal — chronology-alarm territory' : 'Subluminal — steering intact'}
            helpKey="slider-vs"
          />
          <Slider
            label="Wall thickness"
            value={wallThickness}
            min={0.05}
            max={4}
            step={0.05}
            onChange={(v) => setParameter('wallThickness', v)}
            hint="Thinner wall → higher required density → Ford–Roman ratio climbs"
            helpKey="slider-wall-thickness"
          />
        </div>
        <label className="twin-toggle">
          <input
            type="checkbox"
            checked={twinEnabled}
            onChange={(e) => setParameter('twinBubble', e.target.checked ? 1 : 0)}
          />
          <span>
            Twin bubble on a crossing path (Section 6.3 aha-moment: two superluminal warps → CTC)
          </span>
          <HelpButton helpKey="toggle-twin-bubble" />
        </label>
        {twinEnabled && (
          <Slider
            label="Second bubble velocity"
            value={v_s2}
            min={0.1}
            max={10}
            step={0.05}
            unit="c"
            onChange={(v) => setParameter('v_s2', v)}
          />
        )}
        <TripClocks {...clocks} />
        {verdict && <FordRomanMeter ratio={verdict.fordRomanRatio} />}
        <SealBreakBadge
          seal="quantumInequality"
          label="Suspend Quantum Inequalities"
          active={qiActive}
          disabled={!canBreak('quantumInequality') && !qiActive}
          onToggle={() => toggleSeal('quantumInequality')}
          helpKey="seal-quantum-inequality"
        />
        {verdict && <VerdictCard verdict={verdict} />}
        <NumericsReadout compute={numericsCompute} />
        <EquationsPanel keys={WARP_EQUATIONS} />
      </div>
    </div>
  );
}
