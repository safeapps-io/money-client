import type { FullEntity, AllEntities } from '$stores/decr/types';

/**
 * IDEA: In future we'll add some complexity with dynamic migration script loading
 * and stuff, but for now we just define base ground for versioning.
 *
 * Version is stored in entities as a tuple of two numbers. Much like semver, `1.0`.
 * We only store major and minor numbers, no need for patches.
 *
 * Each entity has its own "current version" tuple. We compare it to each entity.
 * 1. both versions are the same — ok
 * 2. both major versions are the same:
 *  2.1 if code's minor is higher — upgrade
 *  2.2 if code's minor is lower — ok
 * 3. majors differ:
 *  3.1 code's major is higher — upgrade
 *  3.2 code's major is lower — block
 */

export enum EntitySyncVersionResolution {
  ok = 'ok',
  upgrade = 'upgrade',
  block = 'block',
}

export const getEntitySyncVersionResolution = (
  currentVersion: [number, number],
  ent: FullEntity<AllEntities>,
) => {
  const [major, minor] = ent.decr._v;
  if (currentVersion[0] == major && currentVersion[1] == minor)
    return EntitySyncVersionResolution.ok;

  if (major == currentVersion[0])
    return minor == currentVersion[1]
      ? EntitySyncVersionResolution.upgrade
      : EntitySyncVersionResolution.ok;
  else
    return minor == currentVersion[1]
      ? EntitySyncVersionResolution.upgrade
      : EntitySyncVersionResolution.block;
};
