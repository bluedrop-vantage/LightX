import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../../state/store';
import { Canvas3D } from '../../render/Canvas3D';
import { createSceneController } from '../../render/SceneController';
import { Slot } from '../../ui/Slot';
import { Slider } from '../../ui/Slider';
import { VerdictCard } from '../VerdictCard';
import { EquationsPanel } from '../../ui/EquationsPanel';
import { SealBreakBadge } from '../../ui/SealBreakBadge';
import { NumericsReadout } from '../../ui/NumericsReadout';
import { getIngredient } from '../../pantry/ingredients';
import { useGeodesicTracer } from '../../render/useGeodesicTracer';
import { HelpButton } from '../../ui/HelpButton';
import { RecipeShortcuts } from '../../ui/RecipeShortcuts';

const HYPERSPACE_EQUATIONS = ['einsteinField'];

/**
 * Charge time (ms) needed to open a brane portal of aperture 1.
 * Total time scales with aperture² since brane-punching energy grows with area.
 */
const BASE_CHARGE_MS = 2500;
const TRAVERSAL_DURATION_MS = 4500;

type PortalState = 'idle' | 'charging' | 'ready' | 'traversing' | 'done';

function shipHyperspacePosition(
  phase: number,
): { x: number; y: number; scale: number; visible: boolean } {
  const p = Math.max(0, Math.min(1, phase));
  if (p < 0.4) {
    const t = p / 0.4;
    return { x: -8 + 8 * t, y: 6 - 6 * t, scale: 1, visible: true };
  }
  if (p < 0.5) {
    const t = (p - 0.4) / 0.1;
    return { x: 0, y: 0, scale: 1 - t, visible: true };
  }
  if (p < 0.6) {
    return { x: 0, y: 0, scale: 0, visible: false };
  }
  if (p < 0.7) {
    const t = (p - 0.6) / 0.1;
    return { x: 8, y: -6, scale: t, visible: true };
  }
  const t = (p - 0.7) / 0.3;
  return { x: 8 + 2 * t, y: -6 - 2 * t, scale: 1, visible: true };
}

export function HyperspaceConstructor() {
  const controller = useMemo(() => createSceneController(10), []);
  const portalEnergy = useStore((s) => s.activeConstruct.parameters.portalEnergy ?? 1);
  const setParameter = useStore((s) => s.setParameter);
  const verdict = useStore((s) => s.verdict);
  const activeSeals = useStore((s) => s.activeSeals);
  const toggleSeal = useStore((s) => s.toggleSeal);
  const canBreak = useStore((s) => s.canBreak);
  const recordSeal = useStore((s) => s.recordSeal);
  const placements = useStore((s) => s.activeConstruct.placements);
  const activeMission = useStore((s) => s.activeMission);

  const centerRef = useRef<[number, number]>([0, 0]);
  const apertureRef = useRef(portalEnergy);
  const [portalState, setPortalState] = useState<PortalState>('idle');
  const [charge, setCharge] = useState(0);
  const traversalPhaseRef = useRef(0);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    apertureRef.current = portalEnergy;
  }, [portalEnergy]);

  const hasPermit = placements.some((p) => getIngredient(p.ingredient).topological);

  const { emitFrom, clear: clearRays, rayCount } = useGeodesicTracer({
    metricKind: hasPermit ? 'hyperspace' : 'flat',
    getMetricParams: () => ({ center: centerRef.current, aperture: apertureRef.current }),
    scene: controller,
    raysPerBurst: 10,
    steps: 200,
    dt: 0.04,
    color: 0xcaa9ff,
  });

  useEffect(() => {
    controller.setEvaluator((x, y) => {
      if (!hasPermit) return { z: 0, expansion: 0 };
      const r = Math.hypot(x, y);
      const portal = Math.exp(-r * r / (portalEnergy * portalEnergy * 3));
      const chargeBoost = 1 + charge * 0.35;
      return {
        z: portal * 3.5 * chargeBoost,
        expansion: portal - 0.3 * Math.min(1, r / 6),
      };
    });
    controller.setBubbleIndicator(hasPermit, portalEnergy, [0, 0]);
    controller.setShipPosition(-8, 6, 0.5);
    controller.setShipVisible(hasPermit);
    clearRays();
  }, [placements, controller, hasPermit, portalEnergy, charge, clearRays]);

  useEffect(() => {
    if (!hasPermit && portalState !== 'idle') {
      setPortalState('idle');
      setCharge(0);
      traversalPhaseRef.current = 0;
      setPhase(0);
    }
  }, [hasPermit, portalState]);

  useEffect(() => {
    if (portalState !== 'charging') return;
    const chargeMs = BASE_CHARGE_MS * portalEnergy * portalEnergy;
    let raf = 0;
    const start = performance.now();
    const loop = (t: number) => {
      const c = Math.min(1, (t - start) / chargeMs);
      setCharge(c);
      if (c >= 1) {
        setPortalState('ready');
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [portalState, portalEnergy]);

  useEffect(() => {
    if (portalState !== 'traversing') return;
    let raf = 0;
    const start = performance.now();
    const loop = (t: number) => {
      const p = Math.min(1, (t - start) / TRAVERSAL_DURATION_MS);
      traversalPhaseRef.current = p;
      setPhase(p);
      const { x, y, scale, visible } = shipHyperspacePosition(p);
      controller.setShipPosition(x, y, 0.5);
      controller.setShipVisible(visible);
      controller.ship.scale.setScalar(Math.max(0.001, scale));
      if (p >= 1) {
        setPortalState('done');
        setCharge(0);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [portalState, controller]);

  const onWorldClick = useCallback(
    (world: { x: number; y: number }) => emitFrom(world),
    [emitFrom],
  );

  const chargePortal = useCallback(() => {
    if (!hasPermit) return;
    setCharge(0);
    setPortalState('charging');
  }, [hasPermit]);

  const launchThroughPortal = useCallback(() => {
    if (!hasPermit || portalState !== 'ready') return;
    traversalPhaseRef.current = 0;
    setPhase(0);
    recordSeal({
      seal: 'realAvailability',
      reason: `Brane portal opened (aperture ${portalEnergy.toFixed(2)} L² = ${(portalEnergy * portalEnergy * 4.2).toExponential(2)} × 10¹⁸ J). Every hyperspace jump is beyond confirmed physics.`,
      citation: 'braneworld (speculative)',
      triggeredBy: 'user',
      timestamp: Date.now(),
      ...(activeMission?.id !== undefined ? { missionId: activeMission.id } : {}),
    });
    setPortalState('traversing');
  }, [hasPermit, portalState, portalEnergy, recordSeal, activeMission]);

  const resetPortal = useCallback(() => {
    setPortalState('idle');
    setCharge(0);
    traversalPhaseRef.current = 0;
    setPhase(0);
    controller.ship.scale.setScalar(1);
    controller.setShipPosition(-8, 6, 0.5);
    controller.setShipVisible(hasPermit);
  }, [controller, hasPermit]);

  const numericsCompute = useCallback(
    () => [
      { label: 'aperture', value: portalEnergy, format: (v: number) => v.toFixed(2), unit: 'L' },
      {
        label: 'brane energy (aperture²)',
        value: portalEnergy * portalEnergy * 4.2e18,
        format: (v: number) => v.toExponential(2),
        unit: 'J',
      },
      { label: 'charge', value: charge, format: (v: number) => `${(v * 100).toFixed(1)}%` },
      { label: 'phase', value: phase, format: (v: number) => `${(v * 100).toFixed(0)}%` },
    ],
    [portalEnergy, charge, phase],
  );

  const realActive = activeSeals.includes('realAvailability');
  const canLaunch = portalState === 'ready' && hasPermit;
  const chargeMs = BASE_CHARGE_MS * portalEnergy * portalEnergy;

  return (
    <div className="constructor hyperspace-constructor">
      <div className="constructor-canvas">
        <Canvas3D controller={controller} onWorldClick={onWorldClick} />
        <div className="canvas-hint">Click near the portal to fire rays · Rays: {rayCount}</div>
        {rayCount > 0 && (
          <button type="button" className="canvas-clear" onClick={clearRays}>
            Clear rays
          </button>
        )}
        <div className="overlay-beyond" role="status">
          Beyond known physics · every hyperspace mission is flagged
        </div>
      </div>
      <div className="constructor-panel">
        <h2>
          Hyperspace / Brane Portal
          <HelpButton helpKey="panel-hyperspace" />
        </h2>
        <p className="panel-blurb">
          Braneworld models with large extra dimensions could permit shortcut routing through the bulk. This module treats hyperspace as a labeled fiction — every mission that uses it is marked "beyond confirmed physics".
        </p>
        <Slot
          slot="source"
          label="Portal permit"
          hint="Requires the Hyperspace Permit ingredient."
          accept={(id) => getIngredient(id).topological}
        />
        <RecipeShortcuts kind="hyperspace" />
        <div className="sliders">
          <Slider
            label="Portal aperture"
            value={portalEnergy}
            min={0.5}
            max={5}
            step={0.05}
            onChange={(v) => setParameter('portalEnergy', v)}
            hint={`Charge time scales with aperture²: ${(chargeMs / 1000).toFixed(1)} s at current aperture.`}
          />
        </div>
        <div className="portal-controls">
          <div className="portal-charge-bar" aria-label="Portal charge">
            <div
              className={`portal-charge-fill ${portalState === 'ready' ? 'ready' : ''}`}
              style={{ width: `${(charge * 100).toFixed(1)}%` }}
            />
            <span className="portal-charge-label">
              {portalState === 'charging' && 'Charging brane field…'}
              {portalState === 'ready' && 'Portal charged · ready to launch'}
              {portalState === 'traversing' && `Traversing brane · ${(phase * 100).toFixed(0)}%`}
              {portalState === 'done' && 'Traversal complete · portal closed'}
              {portalState === 'idle' && (hasPermit ? 'Portal idle' : 'Drop Hyperspace Permit to arm portal')}
            </span>
          </div>
          <div className="portal-buttons">
            <button
              type="button"
              onClick={chargePortal}
              disabled={!hasPermit || portalState === 'charging' || portalState === 'traversing'}
            >
              {portalState === 'ready' || portalState === 'done' ? 'Re-charge' : 'Charge portal'}
            </button>
            <HelpButton helpKey="button-charge-portal" />
            <button
              type="button"
              onClick={launchThroughPortal}
              disabled={!canLaunch}
              className="portal-launch"
            >
              Launch through
            </button>
            {(portalState !== 'idle' || charge > 0) && (
              <button type="button" onClick={resetPortal} className="portal-reset">
                Reset
              </button>
            )}
          </div>
        </div>
        <SealBreakBadge
          seal="realAvailability"
          label="Acknowledge: beyond known physics"
          active={realActive}
          disabled={!canBreak('realAvailability') && !realActive}
          onToggle={() => toggleSeal('realAvailability')}
          helpKey="seal-real-availability"
        />
        {verdict && <VerdictCard verdict={verdict} />}
        <NumericsReadout compute={numericsCompute} />
        <EquationsPanel keys={HYPERSPACE_EQUATIONS} />
      </div>
    </div>
  );
}
