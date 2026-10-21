export function visitorLabel(snapshot) {
  if (snapshot.username !== 'tropicalbee') throw Error('Unexpected counter username');
  if (snapshot.count === null && snapshot.fetchedAt === null) return 'AWAITING FIRST COUNT';
  if (!Number.isSafeInteger(snapshot.count) || snapshot.count < 0 ||
      typeof snapshot.fetchedAt !== 'string' || !Number.isFinite(Date.parse(snapshot.fetchedAt))) {
    throw Error('Invalid visitor snapshot; refusing to render a fabricated count');
  }
  return `RECORDED ${String(snapshot.count).padStart(6, '0')}`;
}
