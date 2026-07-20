import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas3D } from '../../render/Canvas3D';
import { createSceneController } from '../../render/SceneController';
import { FieldBrush, type BrushMode } from './FieldBrush';
import { rackToSamples, samplesEvaluate, samplesGradientZ } from './rackField';
import { VerdictCard } from '../VerdictCard';
import { EquationsPanel } from '../../ui/EquationsPanel';
import { SealBreakBadge } from '../../ui/SealBreakBadge';
import { FordRomanMeter } from '../../ui/FordRomanMeter';
import { NumericsReadout } from '../../ui/NumericsReadout';
import { Slot } from '../../ui/Slot';
import { useGeodesicTracer } from '../../render/useGeodesicTracer';
import { buildVerdict } from '../../physics/verdict';
import { fordRomanRatio } from '../../physics/conditions/fordRoman';
import { LabReport } from './LabReport';
import { storage } from '../../storage/storage';
import { STORAGE_KEYS } from '../../storage/schema';
import type { Build, Verdict } from '../../types/domain';
import { getIngredient } from '../../pantry/ingredients';
import { useStore } from '../../state/store';
import { HelpButton } from '../../ui/HelpButton';
import { RecipeShortcuts } from '../../ui/RecipeShortcuts';

const FB_EQUATIONS = ['einsteinField', 'nullEnergy', 'fordRoman'];

type Tool = 'brushNeg' | 'brushPos' | 'trace';

const SHIP_INITIAL_POS: [number, number] = [-8, 8];
const SHIP_INITIAL_VEL: [number, number] = [1.6, -1.6];
const FIELD_FORCE_SCALE = 6;
const MAX_TRAIL_POINTS = 400;
const VIEWPORT_HALF = 10;

export function ExperimentCanvas() {
  const controller = useMemo(() => createSceneController(10), []);
  const brush = useMemo(() => new FieldBrush(), []);
  const [tool, setTool] = useState<Tool>('brushNeg');
  const [, setTick] = useState(0);
  const [inFlight, setInFlight] = useState(false);
  const activeSeals = useStore((s) => s.activeSeals);
  const toggleSeal = useStore((s) => s.toggleSeal);
  const canBreak = useStore((s) => s.canBreak);
  const recordSeal = useStore((s) => s.recordSeal);
  const uiMode = useStore((s) => s.uiMode);
  const storePlacements = useStore((s) => s.activeConstruct.placements);

  const verdictRef = useRef<Verdict | null>(null);
  const shipPosRef = useRef<[number, number]>([...SHIP_INITIAL_POS]);
  const shipVelRef = useRef<[number, number]>([...SHIP_INITIAL_VEL]);
  const trailRef = useRef<number[]>([]);

  const rackSamples = useMemo(() => rackToSamples(storePlacements), [storePlacements]);
  const rackSamplesRef = useRef(rackSamples);
  rackSamplesRef.current = rackSamples;

  const { emitFrom, clear: clearRays, rayCount } = useGeodesicTracer({
    metricKind: 'paintedField',
    getMetricParams: () => ({
      samples: [...brush.serialize(), ...rackSamplesRef.current],
      forceScale: FIELD_FORCE_SCALE,
    }),
    scene: controller,
    raysPerBurst: 10,
    steps: 260,
    dt: 0.04,
    color: 0xffe27a,
  });

  useEffect(() => {
    controller.setEvaluator((x, y) => {
      const b = brush.evaluate(x, y);
      const r = samplesEvaluate(rackSamplesRef.current, x, y);
      return { z: b.z + r.z, expansion: b.expansion + r.expansion };
    });
    controller.setBubbleIndicator(false, 0, [0, 0]);
    controller.setShipPosition(SHIP_INITIAL_POS[0], SHIP_INITIAL_POS[1], 0.5);
  }, [controller, brush]);

  const pushTrail = useCallback(() => {
    const buf = new Float32Array(trailRef.current);
    controller.setShipConePaths([{ points: buf, color: 0xffe27a }]);
  }, [controller]);

  const resetShip = useCallback(() => {
    setInFlight(false);
    shipPosRef.current = [...SHIP_INITIAL_POS];
    shipVelRef.current = [...SHIP_INITIAL_VEL];
    trailRef.current = [];
    controller.setShipPosition(SHIP_INITIAL_POS[0], SHIP_INITIAL_POS[1], 0.5);
    controller.setShipVisible(true);
    controller.clearShipCone();
  }, [controller]);

  useEffect(() => {
    if (!inFlight) return;
    trailRef.current = [
      shipPosRef.current[0],
      shipPosRef.current[1],
    ];
    pushTrail();
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.04, (t - last) / 1000);
      last = t;
      const [px, py] = shipPosRef.current;
      const [vx, vy] = shipVelRef.current;
      const gBrush = brush.gradientZ(px, py);
      const gRack = samplesGradientZ(rackSamplesRef.current, px, py);
      const ax = -(gBrush.gx + gRack.gx) * FIELD_FORCE_SCALE;
      const ay = -(gBrush.gy + gRack.gy) * FIELD_FORCE_SCALE;
      const nvx = vx + ax * dt;
      const nvy = vy + ay * dt;
      const npx = px + nvx * dt;
      const npy = py + nvy * dt;
      shipVelRef.current = [nvx, nvy];
      shipPosRef.current = [npx, npy];
      controller.setShipPosition(npx, npy, 0.5);
      trailRef.current.push(npx, npy);
      if (trailRef.current.length > MAX_TRAIL_POINTS * 2) {
        trailRef.current.splice(0, trailRef.current.length - MAX_TRAIL_POINTS * 2);
      }
      pushTrail();
      if (Math.abs(npx) > VIEWPORT_HALF * 1.4 || Math.abs(npy) > VIEWPORT_HALF * 1.4) {
        setInFlight(false);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inFlight, brush, controller, pushTrail]);

  const launchShip = useCallback(() => {
    shipPosRef.current = [...SHIP_INITIAL_POS];
    shipVelRef.current = [...SHIP_INITIAL_VEL];
    trailRef.current = [];
    controller.clearShipCone();
    setInFlight(true);
  }, [controller]);

  const recomputeVerdict = useCallback(() => {
    const totalNeg = brush.totalNegative();
    const totalPos = brush.totalPositive();
    const placements: Build['construct']['placements'] = [...storePlacements];
    if (totalNeg > 0) placements.push({ ingredient: 'negativeEnergy', amount: totalNeg * 1e30, slot: 'field' });
    if (totalPos > 0) placements.push({ ingredient: 'ordinary', amount: totalPos, slot: 'field' });
    const verdict = buildVerdict({
      construct: {
        kind: 'custom',
        placements,
        parameters: { v_s: 1, wallThickness: 1 },
      },
      activeSeals,
      onSealBreak: recordSeal,
    });
    verdictRef.current = verdict;
    setTick((t) => t + 1);
  }, [brush, storePlacements, activeSeals, recordSeal]);

  useEffect(() => {
    recomputeVerdict();
  }, [recomputeVerdict]);

  const onWorldClick = useCallback(
    (world: { x: number; y: number }) => {
      if (tool === 'trace') {
        emitFrom(world);
        return;
      }
      const mode: BrushMode = tool === 'brushNeg' ? 'negative' : 'positive';
      brush.paint(world.x, world.y, mode, 1.5, 1);
      recomputeVerdict();
    },
    [tool, brush, emitFrom, recomputeVerdict],
  );

  const numericsCompute = useCallback(() => {
    const totalPos = brush.totalPositive();
    const totalNeg = brush.totalNegative();
    const rackAttractive = storePlacements.reduce(
      (s, p) => s + (getIngredient(p.ingredient).gravity === 'attractive' ? p.amount : 0),
      0,
    );
    const rackRepulsive = storePlacements.reduce(
      (s, p) => s + (getIngredient(p.ingredient).gravity === 'repulsive' ? p.amount : 0),
      0,
    );
    return [
      { label: 'Σρ⁺  (paint attractive)', value: totalPos, format: (v: number) => v.toExponential(2) },
      { label: 'Σρ⁻  (paint repulsive)', value: -totalNeg, format: (v: number) => v.toExponential(2) },
      { label: 'rack attractive (ordinary / anti / dark matter)', value: rackAttractive, format: (v: number) => v.toFixed(2) },
      { label: 'rack repulsive (negative energy / Casimir)', value: rackRepulsive, format: (v: number) => v.toFixed(2) },
      { label: 'rack items placed', value: rackSamples.length, format: (v: number) => v.toFixed(0) },
    ];
  }, [brush, storePlacements, rackSamples]);

  const clearAll = useCallback(() => {
    brush.clear();
    clearRays();
    recomputeVerdict();
  }, [brush, clearRays, recomputeVerdict]);

  const save = useCallback(() => {
    if (!verdictRef.current) return;
    const id = crypto.randomUUID();
    const build: Build = {
      id,
      construct: {
        kind: 'custom',
        placements: [...storePlacements],
        parameters: {},
      },
      verdict: verdictRef.current,
      createdAt: Date.now(),
    };
    storage.set(STORAGE_KEYS.build(id), {
      ...build,
      brushSamples: brush.serialize(),
    });
    const index = storage.get<string[]>(STORAGE_KEYS.buildIndex) ?? [];
    storage.set(STORAGE_KEYS.buildIndex, [...index, id].slice(-50));
    setTick((t) => t + 1);
  }, [brush, storePlacements]);

  const qiActive = activeSeals.includes('quantumInequality');

  const totalNegForRatio =
    brush.totalNegative() * 1e30 +
    storePlacements
      .filter((p) => getIngredient(p.ingredient).energyDensity === 'negative')
      .reduce((s, p) => s + p.amount, 0);
  const ratio = totalNegForRatio > 0 ? fordRomanRatio(-totalNegForRatio, 1) : 0;

  return (
    <div className="constructor freebuild-constructor">
      <div className="constructor-canvas">
        <Canvas3D controller={controller} onWorldClick={onWorldClick} />
        <div className="freebuild-toolbar">
          <button
            type="button"
            className={tool === 'brushNeg' ? 'active brush-neg' : 'brush-neg'}
            onClick={() => setTool('brushNeg')}
            title="Paint negative energy density"
          >
            − Paint ρ⁻
          </button>
          <button
            type="button"
            className={tool === 'brushPos' ? 'active brush-pos' : 'brush-pos'}
            onClick={() => setTool('brushPos')}
            title="Paint positive mass"
          >
            + Paint ρ⁺
          </button>
          <button
            type="button"
            className={tool === 'trace' ? 'active brush-trace' : 'brush-trace'}
            onClick={() => setTool('trace')}
            title="Fire light-ray fan"
          >
            ↯ Trace
          </button>
          <button type="button" onClick={clearAll}>
            Clear paint
          </button>
        </div>
        <div className="canvas-hint">
          {inFlight
            ? `Ship in flight · trail points: ${Math.floor(trailRef.current.length / 2)}`
            : tool === 'trace'
              ? `Click to fan rays · Rays: ${rayCount}`
              : `Click to paint · Samples: ${brush.size()}`}
        </div>
        <div className="canvas-toggles freebuild-launch-toggles">
          <button
            type="button"
            className="traversal-btn"
            onClick={launchShip}
            disabled={inFlight}
            title="Release the ship at (-8, 8) with velocity (1.6, -1.6) and let it fall through the painted field."
          >
            {inFlight ? 'In flight…' : 'Launch ship into field'}
          </button>
          <HelpButton helpKey="button-launch-field-ship" />
          {(inFlight || trailRef.current.length > 0) && (
            <button type="button" className="traversal-btn" onClick={resetShip}>
              {inFlight ? 'Stop ship' : 'Reset ship'}
            </button>
          )}
        </div>
      </div>
      <div className="constructor-panel">
        <h2>
          Free Build · Energy source rack + Field painter
          <HelpButton helpKey="panel-freebuild" />
        </h2>
        <p className="panel-blurb">
          Two ways to build a custom rig. Drop pantry ingredients into the rack for discrete contributions, and/or paint continuous energy density onto the canvas. The verdict sums both.
        </p>
        <Slot
          slot="field"
          label="Energy source rack"
          hint="Drop shapeable pantry ingredients (matter, antimatter, dark matter, exotic energy) here — each becomes a visible bump / well on the mesh and drives ships + rays through the combined field."
          accept={(id) => {
            const def = getIngredient(id);
            return def.shapeable || def.topological;
          }}
        />
        <RecipeShortcuts kind="custom" />
        <FordRomanMeter ratio={ratio} label="Ford–Roman ratio (rack ρ⁻ + paint ρ⁻)" />
        <SealBreakBadge
          seal="quantumInequality"
          label="Suspend Quantum Inequalities"
          active={qiActive}
          disabled={!canBreak('quantumInequality') && !qiActive}
          onToggle={() => toggleSeal('quantumInequality')}
          helpKey="seal-quantum-inequality"
        />
        {verdictRef.current && <VerdictCard verdict={verdictRef.current} />}
        <div className="freebuild-actions">
          <button
            type="button"
            onClick={save}
            disabled={brush.size() === 0 && storePlacements.length === 0}
          >
            Save Build
          </button>
        </div>
        <NumericsReadout compute={numericsCompute} />
        {uiMode !== 'story' && <EquationsPanel keys={FB_EQUATIONS} />}
        <LabReport />
      </div>
    </div>
  );
}
