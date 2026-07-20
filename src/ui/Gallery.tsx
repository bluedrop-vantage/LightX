import { useCallback, useEffect, useState } from 'react';
import { storage } from '../storage/storage';
import { STORAGE_KEYS } from '../storage/schema';
import type { Build } from '../types/domain';

interface GalleryEntry extends Build {
  author?: string;
  note?: string;
}

const GALLERY_INDEX = 'exotic-pantry:galleryIndex:v1';

export function Gallery() {
  const [entries, setEntries] = useState<GalleryEntry[]>([]);
  const [note, setNote] = useState('');
  const [author, setAuthor] = useState('');

  const reload = useCallback(() => {
    const index = storage.get<string[]>(GALLERY_INDEX) ?? [];
    const loaded = index
      .map((id) => storage.get<GalleryEntry>(STORAGE_KEYS.gallery(id)))
      .filter((b): b is GalleryEntry => b !== undefined)
      .reverse();
    setEntries(loaded);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const publishLatest = useCallback(() => {
    const index = storage.get<string[]>(STORAGE_KEYS.buildIndex) ?? [];
    const lastId = index[index.length - 1];
    if (!lastId) return;
    const build = storage.get<Build>(STORAGE_KEYS.build(lastId));
    if (!build) return;
    const galleryId = crypto.randomUUID();
    const entry: GalleryEntry = { ...build, id: galleryId };
    if (author.trim()) entry.author = author.trim();
    if (note.trim()) entry.note = note.trim();
    storage.set(STORAGE_KEYS.gallery(galleryId), entry);
    const gIndex = storage.get<string[]>(GALLERY_INDEX) ?? [];
    storage.set(GALLERY_INDEX, [...gIndex, galleryId].slice(-100));
    setNote('');
    reload();
  }, [note, author, reload]);

  const remove = useCallback((id: string) => {
    storage.remove(STORAGE_KEYS.gallery(id));
    const gIndex = storage.get<string[]>(GALLERY_INDEX) ?? [];
    storage.set(GALLERY_INDEX, gIndex.filter((x) => x !== id));
    reload();
  }, [reload]);

  return (
    <section className="gallery" aria-label="Shared Gallery">
      <header className="gallery-header">
        <div>
          <h3>Shared Gallery</h3>
          <p className="gallery-consent">
            Entries you publish here are stored under a shared scope and visible to anyone using this browser profile — no external upload happens in this MVP.
          </p>
        </div>
      </header>
      <div className="gallery-publish">
        <input
          type="text"
          placeholder="Author (optional)"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <input
          type="text"
          placeholder="Note about your latest saved build"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button type="button" onClick={publishLatest}>
          Publish latest saved build
        </button>
      </div>
      {entries.length === 0 ? (
        <p className="gallery-empty">Nothing published yet.</p>
      ) : (
        <ul className="gallery-list">
          {entries.map((e) => (
            <li key={e.id}>
              <div className="gallery-row">
                <span className={`verdict-dot verdict-${e.verdict.level}`} />
                <span className="gallery-title">{e.verdict.headline || e.verdict.level}</span>
                {e.author && <span className="gallery-author">by {e.author}</span>}
              </div>
              {e.note && <div className="gallery-note">"{e.note}"</div>}
              <div className="gallery-meta">
                NEC {e.verdict.necStatus} · seals {e.verdict.sealsBroken.length} · FR{' '}
                {e.verdict.fordRomanRatio > 0 ? e.verdict.fordRomanRatio.toExponential(1) : '—'}
              </div>
              <div className="build-actions">
                <button type="button" onClick={() => remove(e.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
