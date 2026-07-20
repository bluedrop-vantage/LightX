import { useStore } from './state/store';
import { PantryRack } from './pantry/PantryRack';
import { WarpConstructor } from './constructs/warp/WarpConstructor';
import { WormholeConstructor } from './constructs/wormhole/WormholeConstructor';
import { ExperimentCanvas } from './constructs/freebuild/ExperimentCanvas';
import { KrasnikovConstructor } from './constructs/krasnikov/KrasnikovConstructor';
import { HyperspaceConstructor } from './constructs/hyperspace/HyperspaceConstructor';
import { Footer } from './ui/Footer';
import { ModePicker } from './ui/ModePicker';
import { ConstructTabs } from './ui/ConstructTabs';
import { CommunityView } from './ui/CommunityView';
import { LogoMark } from './ui/LogoMark';

export function App() {
  const uiMode = useStore((s) => s.uiMode);
  const activeKind = useStore((s) => s.activeKind);
  const activeView = useStore((s) => s.activeView);
  const highlighted = useStore((s) => s.highlighted);

  let view: React.ReactNode;
  if (activeView === 'community') {
    view = <CommunityView />;
  } else {
    switch (activeKind) {
      case 'warp':
        view = <WarpConstructor />;
        break;
      case 'wormhole':
        view = <WormholeConstructor />;
        break;
      case 'krasnikov':
        view = <KrasnikovConstructor />;
        break;
      case 'hyperspace':
        view = <HyperspaceConstructor />;
        break;
      case 'custom':
        view = <ExperimentCanvas />;
        break;
    }
  }

  return (
    <div className={`app-shell ${highlighted ? `hover-linked hover-linked-${highlighted}` : ''}`}>
      <header className="app-header">
        <span className="brand">
          <LogoMark size={22} className="brand-mark" />
          LightX
        </span>
        <span className="brand-tag">Interactive Physics Sandbox · FTL Constructs</span>
      </header>
      <ConstructTabs />
      <div className="app-body">
        {activeView === 'construct' && <PantryRack />}
        <main className={`constructor-host ${activeView === 'community' ? 'community-host' : ''}`}>{view}</main>
      </div>
      <Footer />
      {uiMode === null && <ModePicker />}
    </div>
  );
}
