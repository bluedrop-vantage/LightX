export const STORAGE_KEYS = {
  mode: 'exotic-pantry:uiMode:v1',
  sealLog: 'exotic-pantry:sealLog:v1',
  build: (id: string) => `exotic-pantry:builds:${id}`,
  gallery: (id: string) => `exotic-pantry:gallery:${id}`,
  buildIndex: 'exotic-pantry:buildIndex:v1',
} as const;
