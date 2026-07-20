import { Gallery } from './Gallery';
import { ClassroomLoader } from '../missions/ClassroomLoader';
import type { Mission } from '../types/domain';

export function CommunityView() {
  const onPackLoaded = (extras: Mission[]) => {
    window.dispatchEvent(new CustomEvent('exotic-pantry:missions-changed', { detail: extras }));
  };

  return (
    <div className="community-view">
      <div className="community-column">
        <Gallery />
      </div>
      <div className="community-column">
        <ClassroomLoader onPackLoaded={onPackLoaded} />
      </div>
    </div>
  );
}
