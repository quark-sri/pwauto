#!/usr/bin/env node
/**
 * CI evidence policy: text results only. Fail when a run left a screenshot,
 * a video or a trace in reports/ or test-results/.
 *
 *   node scripts/check-ci-evidence.mjs [folder ...]     default: reports test-results
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MEDIA = /\.(png|jpe?g|gif|webp|webm|mp4|zip)$/i;

/** All image, video and trace files below the folders. */
export function findMedia(folders) {
  const walk = (dir) =>
    !existsSync(dir)
      ? []
      : readdirSync(dir).flatMap((name) => {
          const p = path.join(dir, name);
          return statSync(p).isDirectory() ? walk(p) : MEDIA.test(name) ? [p] : [];
        });
  return folders.flatMap(walk);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const folders = process.argv.slice(2).length ? process.argv.slice(2) : ['reports', 'test-results'];
  const found = findMedia(folders);
  if (found.length) {
    console.error(`CI must keep text results only, but ${found.length} image, video or trace file(s) exist:`);
    for (const f of found.slice(0, 20)) console.error(`- ${f}`);
    process.exit(1);
  }
  console.log(`check-ci-evidence: ok (no images, videos or traces in ${folders.join(', ')})`);
}
