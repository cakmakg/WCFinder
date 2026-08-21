/**
 * 3D icon registry — Microsoft Fluent Emoji 3D (MIT), see
 * assets/icons3d/ATTRIBUTION.md. Import a source here rather than require()-ing
 * paths across screens.
 *
 * Usage: <Icon3D source={icons3d.toilet} size={96} />
 */

export const icons3d = {
  toilet: require('../../assets/icons3d/toilet.png'),
  pin: require('../../assets/icons3d/pin.png'),
  card: require('../../assets/icons3d/card.png'),
  money: require('../../assets/icons3d/money.png'),
  star: require('../../assets/icons3d/star.png'),
  check: require('../../assets/icons3d/check.png'),
  search: require('../../assets/icons3d/search.png'),
  profile: require('../../assets/icons3d/profile.png'),
  sparkles: require('../../assets/icons3d/sparkles.png'),
  locked: require('../../assets/icons3d/locked.png'),
  map: require('../../assets/icons3d/map.png'),
  party: require('../../assets/icons3d/party.png'),
} as const;

export type Icon3DName = keyof typeof icons3d;
