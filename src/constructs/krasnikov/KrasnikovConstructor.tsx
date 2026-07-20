import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../../state/store';
import { Canvas3D } from '../../render/Canvas3D';
import { createSceneController } from '../../render/SceneController';
import {
  krasnikovMeshOffset,
  krasnikovStressDensity,
  type KrasnikovParams,
} from '../../physics/metrics/krasnikov';
import { Slot } from '../../ui/Slot';
import { Slider } from '../../ui/Slider';
import { VerdictCard } from '../VerdictCard';
import { EquationsPanel } from '../../ui/EquationsPanel';
import { SealBreakBadge } from '../../ui/SealBreakBadge';
import { FordRomanMeter } from '../../ui/FordRomanMeter';
import { NumericsReadout } from '../../ui/NumericsReadout';
import { getIngredient } from '../../pantry/ingredients';
import { useGeodesicTracer } from '../../render/useGeodesicTracer';
import { HelpButton } from '../../ui/HelpButton';
import { RecipeShortcuts } from '../../ui/RecipeShortcuts';

const KRASNIKOV_EQUATIONS = ['einsteinField', 'nullEnergy', 'fordRoman'];

export function KrasnikovConstructor() {
  const controller = useMemo(() => createSceneController(10), []);
  const v_s = useStore((s) => s.activeConstruct.parameters.v_s ?? 1);
  const tubeWidth = useStore((s) => s.activeConstruct.parameters.wallThickness ?? 0.7);
  const setParameter = useStore((s) => s.setParameter);
  const verdict = useStore((s) => s.verdict);
  const activeSeals = useStore((s) => s.activeSeals);
  const toggleSeal = useStore((s) => s.toggleSeal);
  const canBreak = useStore((s) => s.canBreak);
  const placements = useStore((s) => s.activeConstruct.placements);

  const tRef = useRef(0);
  const paramsRef = useRef<KrasnikovParams>({
    routeStart: [-7, 0],
    routeEnd: [7, 0],
    tubeWidth: 0.7,
    v_s: 1,
    t: 0,
  });

  useEffect(() => {
    paramsRef.current.v_s = v_s;
    paramsRef.current.tubeWidth = tubeWidth;
  }, [v_s, tubeWidth]);

  const hasNegativeRoute = placements.some(
    (p) => p.slot === 'route' && getIngredient(p.ingredient).energyDensity === 'negative',
  );

  const { emitFrom, clear: clearRays, rayCount } = useGeodesicTracer({
    metricKind: 'krasnikov',
    getMetricParams: () => ({
      routeStart: paramsRef.current.routeStart,
      routeEnd: paramsRef.current.routeEnd,
      tubeWidth: paramsRef.current.tubeWidth,
      v_s: paramsRef.current.v_s,
      t: tRef.current,
    }),
    scene: controller,
    raysPerBurst: 10,
    steps: 220,
    dt: 0.05,
    color: 0xffe27a,
  });

  useEffect(() => {
    controller.setEvaluator((x, y) => {
      if (!hasNegativeRoute) return { z: 0, expansion: 0 };
      const p = paramsRef.current;
      p.t = tRef.current;
      return krasnikovMeshOffset(x, y, p);
    });
    controller.setBubbleIndicator(false, 0, [0, 0]);
    clearRays();
  }, [placements, controller, hasNegativeRoute, clearRays]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      tRef.current += dt * 1.5;
      if (tRef.current > 14) tRef.current = -2;
      const p = paramsRef.current;
      const wavefront = p.routeStart[0] + Math.min(14, Math.max(0, tRef.current * p.v_s));
      controller.setShipPosition(wavefront, 0, 0.5);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [controller]);

  const onWorldClick = useCallback(
    (world: { x: number; y: number }) => emitFrom(world),
    [emitFrom],
  );

  const numericsCompute = useCallback(() => {
    const p = paramsRef.current;
    const along = { x: (p.routeStart[0] + p.routeEnd[0]) / 2, y: 0 };
    const rho = krasnikovStressDensity(along.x, along.y, { ...p, t: tRef.current });
    const routeLength = Math.hypot(
      p.routeEnd[0] - p.routeStart[0],
      p.routeEnd[1] - p.routeStart[1],
    );
    return [
      { label: 'ρ  (T₀₀ along tube)', value: rho, format: (v: number) => v.toExponential(3) },
      { label: 'route length', value: routeLength, format: (v: number) => v.toFixed(2), unit: 'L' },
      { label: 'wavefront', value: p.v_s * tRef.current, format: (v: number) => v.toFixed(2), unit: 'L' },
      { label: 'v_s', value: p.v_s, format: (v: number) => v.toFixed(2), unit: 'c' },
    ];
  }, []);

  const qiActive = activeSeals.includes('quantumInequality');
  const superluminal = v_s > 1;

  return (
    <div className="constructor krasnikov-constructor">
      <div className="constructor-canvas">
        <Canvas3D controller={controller} onWorldClick={onWorldClick} />
        <div className="canvas-hint">Click near the tube to fire rays · Rays: {rayCount}</div>
        {rayCount > 0 && (
          <button type="button" className="canvas-clear" onClick={clearRays}>
            Clear rays
          </button>
        )}
        {superluminal && (
          <div className="overlay-horizon" role="status">
            Tube wavefront at {v_s.toFixed(2)}c — permanent superluminal highway once laid
          </div>
        )}
      </div>
      <div className="constructor-panel">
        <h2>
          Krasnikov Tube
          <HelpButton helpKey="panel-krasnikov" />
        </h2>
        <p className="panel-blurb">
          A permanent superluminal corridor: negative energy is laid along a route as the ship travels it, allowing a fast return trip. Unlike the warp bubble, this is a persistent construct.
        </p>
        <Slot
          slot="route"
          label="Route (negative energy)"
          hint="Drop negative-energy ingredients to lay the tube."
          accept={(id) => getIngredient(id).shapeable}
        />
        <RecipeShortcuts kind="krasnikov" />
        <div className="sliders">
          <Slider
            label="Wavefront velocity"
            value={v_s}
            min={0.1}
            max={6}
            step={0.05}
            unit="c"
            onChange={(v) => setParameter('v_s', v)}
          />
          <Slider
            label="Tube width"
            value={tubeWidth}
            min={0.1}
            max={2.5}
            step={0.05}
            onChange={(v) => setParameter('wallThickness', v)}
          />
        </div>
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
        <EquationsPanel keys={KRASNIKOV_EQUATIONS} />
      </div>
    </div>
  );
}
