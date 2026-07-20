import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../../state/store';
import { Canvas3D } from '../../render/Canvas3D';
import { createSceneController } from '../../render/SceneController';
import { EmbeddingView } from '../../render/EmbeddingView';
import { throatDisplacement, type MorrisThorneParams } from '../../physics/metrics/morrisThorne';
import { splitPathAtThroat } from '../../physics/wormholeTopology';
import type { GeodesicPath } from '../../render/GeodesicLayer';
import { HelpButton } from '../../ui/HelpButton';
import { RecipeShortcuts } from '../../ui/RecipeShortcuts';
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

const WH_EQUATIONS = ['morrisThorne', 'flareOut', 'nullEnergy', 'fordRoman'];

type CanvasView = '2d' | '3d' | 'multiverse';

const TRAVERSAL_DURATION = 6;
const PANE_B_BG = 0x1b0a0d;
const PANE_A_BG = 0x0a0f1a;

function shipPositionMouthA(phase: number, b0: number): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, phase / 0.55));
  const x = -7 * (1 - clamped);
  const y = 4 * (1 - clamped);
  const r = Math.hypot(x, y);
  const throatDip = -Math.exp(-(r * r) / (b0 * b0 * 1.5)) * 2.5;
  return [x, y, 0.5 + throatDip];
}

function shipPositionMouthB(phase: number, b0: number): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, (phase - 0.45) / 0.55));
  const x = 7 * clamped;
  const y = -4 * clamped;
  const r = Math.hypot(x, y);
  const throatDip = -Math.exp(-(r * r) / (b0 * b0 * 1.5)) * 2.5;
  return [x, y, 0.5 + throatDip];
}

const SHIP_A_VISIBLE_UNTIL = 0.6;
const SHIP_B_VISIBLE_FROM = 0.4;

export function WormholeConstructor() {
  const controller = useMemo(() => createSceneController(10), []);
  const controllerB = useMemo(() => createSceneController(10), []);
  const throatRadius = useStore((s) => s.activeConstruct.parameters.throatRadius ?? 1);
  const mouthOffset = useStore((s) => s.activeConstruct.parameters.mouthTimeOffset ?? 0);
  const mouthSeparation = useStore((s) => s.activeConstruct.parameters.mouthSeparation ?? 3);
  const maldacena = (useStore((s) => s.activeConstruct.parameters.maldacena) ?? 0) > 0.5;
  const setParameter = useStore((s) => s.setParameter);
  const verdict = useStore((s) => s.verdict);
  const activeSeals = useStore((s) => s.activeSeals);
  const toggleSeal = useStore((s) => s.toggleSeal);
  const canBreak = useStore((s) => s.canBreak);
  const placements = useStore((s) => s.activeConstruct.placements);
  const [view, setView] = useState<CanvasView>('2d');
  const [showCones, setShowCones] = useState(false);
  const [traversing, setTraversing] = useState(false);
  const traversalPhaseRef = useRef(0);
  const [clocks, setClocks] = useState({ shipTau: 0, earthT: 0, distance: 0 });

  const paramsRef = useRef<MorrisThorneParams>({
    b0: 1,
    center: [0, 0],
    phiCoefficients: [0],
  });

  useEffect(() => {
    paramsRef.current.b0 = Math.max(0.4, throatRadius);
  }, [throatRadius]);

  const throat = placements.filter((p) => p.slot === 'throat');
  const hasNegative = throat.some((p) => getIngredient(p.ingredient).energyDensity === 'negative');
  const hasFermion = throat.some((p) => p.ingredient === 'darkSectorFermion');
  const hasPositive = throat.some((p) => {
    const def = getIngredient(p.ingredient);
    return def.energyDensity === 'positive' && p.ingredient !== 'darkSectorFermion';
  });
  const throatOpen = hasNegative || (maldacena && hasFermion);

  const { emitFrom, emitTraversalBundle, clear: clearRays, rayCount, paths } = useGeodesicTracer({
    metricKind: throatOpen ? 'morrisThorne' : 'positiveMass',
    getMetricParams: () => (throatOpen ? paramsRef.current : { center: paramsRef.current.center, mass: 4 }),
    scene: controller,
    raysPerBurst: 10,
    steps: 240,
    dt: 0.04,
    color: throatOpen ? 0x8affea : 0xffe27a,
  });

  useEffect(() => {
    let pinchProgress = 0;
    let pinchTimer: number | null = null;
    if (hasPositive && !throatOpen) {
      pinchTimer = window.setInterval(() => {
        pinchProgress = Math.min(1, pinchProgress + 0.02);
      }, 33);
    }
    const evaluator = (x: number, y: number) => {
      const p = paramsRef.current;
      if (!throatOpen && !hasPositive) return { z: 0, expansion: 0 };
      const base = throatDisplacement(x, y, p);
      const z = throatOpen ? base : base * (1 - pinchProgress) - pinchProgress * 3 * Math.exp(-Math.hypot(x, y));
      return { z, expansion: 0 };
    };
    controller.setEvaluator(evaluator);
    controller.setBubbleIndicator(true, paramsRef.current.b0, paramsRef.current.center);
    controller.setConeTilt((x, y) => {
      if (!throatOpen) return { tiltX: 0, tiltY: 0 };
      const r = Math.hypot(x, y) + 1e-6;
      const inside = r < paramsRef.current.b0 * 2 ? 1 : 0.15;
      return { tiltX: (x / r) * inside * 0.6, tiltY: (y / r) * inside * 0.6 };
    });
    controller.setLightConesVisible(showCones && throatOpen);
    controllerB.setEvaluator(evaluator);
    controllerB.setBubbleIndicator(true, paramsRef.current.b0, [0, 0]);
    clearRays();
    return () => {
      if (pinchTimer !== null) window.clearInterval(pinchTimer);
    };
  }, [placements, throatRadius, controller, controllerB, throatOpen, hasPositive, showCones, clearRays]);

  useEffect(() => {
    controllerB.setBackgroundColor(PANE_B_BG);
    controller.setBackgroundColor(PANE_A_BG);
  }, [controller, controllerB]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      if (traversing) {
        traversalPhaseRef.current = Math.min(1, traversalPhaseRef.current + dt / TRAVERSAL_DURATION);
        if (traversalPhaseRef.current >= 1) {
          traversalPhaseRef.current = 1;
          setTraversing(false);
        }
      }
      const phase = traversalPhaseRef.current;
      const b0 = paramsRef.current.b0;

      const [ax, ay, az] = shipPositionMouthA(phase, b0);
      controller.setShipPosition(ax, ay, az);
      controller.setShipVisible(phase < SHIP_A_VISIBLE_UNTIL);

      const [bx, by, bz] = shipPositionMouthB(phase, b0);
      controllerB.setShipPosition(bx, by, bz);
      controllerB.setShipVisible(phase > SHIP_B_VISIBLE_FROM);

      const shipTau = phase * (2 * b0);
      const earthT = phase * (mouthSeparation + Math.abs(mouthOffset));
      setClocks({ shipTau, earthT, distance: phase * mouthSeparation });

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [controller, controllerB, traversing, mouthOffset, mouthSeparation]);

  const launchTraversal = useCallback(() => {
    if (!throatOpen) return;
    traversalPhaseRef.current = 0;
    setTraversing(true);
  }, [throatOpen]);

  const resetTraversal = useCallback(() => {
    setTraversing(false);
    traversalPhaseRef.current = 0;
  }, []);

  const onWorldClick = useCallback(
    (world: { x: number; y: number }) => emitFrom(world),
    [emitFrom],
  );

  const runTraversalTest = useCallback(async () => {
    if (!throatOpen) return;
    clearRays();
    const [cx, cy] = paramsRef.current.center;
    await emitTraversalBundle({ x: cx, y: cy }, 200);
  }, [emitTraversalBundle, clearRays, throatOpen]);

  useEffect(() => {
    if (!throatOpen) {
      controllerB.setGeodesicPaths([]);
      return;
    }
    const b0 = paramsRef.current.b0;
    const paneA: GeodesicPath[] = [];
    const paneB: GeodesicPath[] = [];
    for (const path of paths) {
      const split = splitPathAtThroat(path.points, b0);
      if (split.paneA) paneA.push({ points: split.paneA, color: path.color });
      if (split.paneB) paneB.push({ points: split.paneB, color: path.color });
    }
    controller.setGeodesicPaths(paneA);
    controllerB.setGeodesicPaths(paneB);
  }, [paths, controller, controllerB, throatOpen]);

  const numericsCompute = useCallback(() => {
    const p = paramsRef.current;
    return [
      { label: 'b₀ (throat radius)', value: p.b0, format: (v: number) => v.toFixed(2), unit: 'L' },
      {
        label: 'Δt / Δx (mouth clock ratio)',
        value: mouthOffset / Math.max(1e-6, mouthSeparation),
        format: (v: number) => v.toFixed(3),
      },
      {
        label: 'traversal phase',
        value: traversalPhaseRef.current,
        format: (v: number) => v.toFixed(3),
      },
    ];
  }, [mouthOffset, mouthSeparation]);

  const chronologyForming = !maldacena && Math.abs(mouthOffset) > mouthSeparation;
  const chronoActive = activeSeals.includes('chronologyProtection');
  const qiActive = activeSeals.includes('quantumInequality');

  return (
    <div className="constructor wormhole-constructor">
      <div className="constructor-canvas">
        <div className="view-tabs">
          <button type="button" className={view === '2d' ? 'active' : ''} onClick={() => setView('2d')}>
            2D mesh
          </button>
          <button type="button" className={view === '3d' ? 'active' : ''} onClick={() => setView('3d')}>
            3D embedding
          </button>
          <button
            type="button"
            className={view === 'multiverse' ? 'active' : ''}
            onClick={() => setView('multiverse')}
          >
            Two-pane multiverse
          </button>
        </div>
        {view === '2d' && (
          <>
            <Canvas3D controller={controller} onWorldClick={onWorldClick} />
            <div className="canvas-hint">Click near the throat to fire rays · Rays: {rayCount}</div>
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
              </label>
              <button
                type="button"
                className="traversal-btn"
                onClick={runTraversalTest}
                disabled={!throatOpen}
                title={
                  throatOpen
                    ? 'Fire a 200-ray bundle through the throat'
                    : 'Open the throat first (drop negative energy or enable Maldacena mode)'
                }
              >
                200-ray traversal test
              </button>
              <HelpButton helpKey="button-200-ray" />
            </div>
          </>
        )}
        {view === '3d' && (
          <EmbeddingView
            b0={paramsRef.current.b0}
            rays={paths}
            traversalPhaseRef={traversalPhaseRef}
          />
        )}
        {view === 'multiverse' && (
          <div className="multiverse-panes">
            <div className="multiverse-pane pane-a">
              <div className="pane-label pane-label-a">Universe A · mouth A</div>
              <div className="pane-sublabel">Ship enters here · rays that hit the throat vanish from this pane</div>
              <Canvas3D controller={controller} />
            </div>
            <div className="multiverse-pane pane-b">
              <div className="pane-label pane-label-b">Universe B · mouth B</div>
              <div className="pane-sublabel">Ship emerges here · rays that traversed the throat re-appear on the opposite side</div>
              <Canvas3D controller={controllerB} />
            </div>
          </div>
        )}
        {view !== '3d' && (chronologyForming || maldacena) && (
          <div className="canvas-overlays">
            {chronologyForming && (
              <div className="overlay-chronology" role="alert">
                Chronology alarm · |Δt| &gt; Δx/c · vacuum fluctuations amplifying
              </div>
            )}
            {maldacena && (
              <div className="overlay-maldacena" role="status">
                Maldacena mode · dark-sector fermion coupling · sub-light traversal enforced
              </div>
            )}
          </div>
        )}
      </div>
      <div className="constructor-panel">
        <h2>
          Wormhole (Morris–Thorne)
          <HelpButton helpKey="panel-wormhole" />
        </h2>
        <Slot
          slot="throat"
          label="Throat"
          hint={
            maldacena
              ? 'Maldacena mode: drop dark-sector fermions (no exotic matter needed).'
              : 'Only negative energy pries the throat open. Positive energy pinches it shut.'
          }
          accept={(id) => getIngredient(id).shapeable}
        />
        <RecipeShortcuts kind="wormhole" />
        <div className="sliders">
          <Slider
            label="Throat radius"
            value={throatRadius}
            min={0.2}
            max={4}
            step={0.05}
            onChange={(v) => setParameter('throatRadius', v)}
            hint="Larger throat = human-safe tides = more exotic matter."
            helpKey="slider-throat-radius"
          />
          <Slider
            label="Mouth separation"
            value={mouthSeparation}
            min={0.5}
            max={20}
            step={0.1}
            unit="ly"
            onChange={(v) => setParameter('mouthSeparation', v)}
            helpKey="slider-mouth-separation"
          />
          <Slider
            label="Mouth clock offset"
            value={mouthOffset}
            min={-25}
            max={25}
            step={0.1}
            unit="ly"
            onChange={(v) => setParameter('mouthTimeOffset', v)}
            hint={
              maldacena
                ? 'Maldacena mode: no chronology risk (sub-light).'
                : chronologyForming
                  ? '|Δt| > Δx/c — CTC forming'
                  : 'Within light-travel bound'
            }
            helpKey="slider-mouth-offset"
          />
        </div>
        <label className="maldacena-toggle">
          <input
            type="checkbox"
            checked={maldacena}
            onChange={(e) => setParameter('maldacena', e.target.checked ? 1 : 0)}
          />
          <span>Maldacena mode (dark-sector fermion coupling, sub-light traversal)</span>
          <HelpButton helpKey="toggle-maldacena" />
        </label>
        <div className="traversal-controls">
          <button
            type="button"
            className="traversal-launch"
            onClick={launchTraversal}
            disabled={!throatOpen || traversing}
            title={
              throatOpen
                ? 'Send the ship through the wormhole'
                : 'Open the throat first (drop negative energy or enable Maldacena mode)'
            }
          >
            {traversing ? 'Traversing…' : 'Launch ship through'}
          </button>
          <HelpButton helpKey="button-launch-through" />
          {traversalPhaseRef.current > 0 && !traversing && (
            <button type="button" className="traversal-reset" onClick={resetTraversal}>
              Reset
            </button>
          )}
          <input
            type="range"
            min={0}
            max={1}
            step={0.005}
            value={traversalPhaseRef.current}
            onChange={(e) => {
              setTraversing(false);
              traversalPhaseRef.current = parseFloat(e.target.value);
              setClocks((c) => ({ ...c }));
            }}
            aria-label="Traversal phase"
          />
        </div>
        <TripClocks {...clocks} label="Traversal clocks (mouth A → mouth B)" />
        {verdict && !maldacena && <FordRomanMeter ratio={verdict.fordRomanRatio} />}
        {!maldacena && (
          <SealBreakBadge
            seal="quantumInequality"
            label="Suspend Quantum Inequalities"
            active={qiActive}
            disabled={!canBreak('quantumInequality') && !qiActive}
            onToggle={() => toggleSeal('quantumInequality')}
            helpKey="seal-quantum-inequality"
          />
        )}
        {!maldacena && (
          <SealBreakBadge
            seal="chronologyProtection"
            label="Suspend Chronology Protection"
            active={chronoActive}
            disabled={!canBreak('chronologyProtection') && !chronoActive}
            onToggle={() => toggleSeal('chronologyProtection')}
            helpKey="seal-chronology"
          />
        )}
        {verdict && <VerdictCard verdict={verdict} />}
        <NumericsReadout compute={numericsCompute} />
        <EquationsPanel keys={WH_EQUATIONS} />
      </div>
    </div>
  );
}
