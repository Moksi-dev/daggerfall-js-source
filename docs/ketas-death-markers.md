# Keta's Death Markers

Optional native settings under World > Death markers. The main switch defaults off. The current character keeps five death locations by default, adjustable from one to ten. Individual removal and confirmed clear-all are available in the same settings section. Local history is bounded to sixteen character entries.

In the world, small opaque skulls remain visible while a short caption appears after looking near one. Deaths sharing a dungeon entrance share one world marker. Straight, tapered blue beams follow the distance, height and opacity rules, with asynchronous shader preparation and cleanup on disable or disposal. No combat or detection behavior changes.

On the Overworld, pixel-art skull pins have short captions and measured distance below. Straight blue beams use depth-tested world geometry, additive light, and the same far-plane clamp as native Fallen Stars. A separate map-height setting ranges from 100 to 1000 metres. The existing map canvas is reused for icons and does not redraw while marker state is unchanged. Unknown dungeon entrances are not guessed.

This proposal covers world and Overworld death markers. Other map-skin integrations remain separate work. The combined PR also contains campfire and party visibility features, with a shared bounded map beacon pass. It adds no combat behavior, item automation, patch kit or API proposal.

Run `node tools/deathMarkersProbe.mjs` and `node tools/overworldBeaconsProbe.mjs` for synthetic DOM/WebGL checks. Live gameplay and GPU performance acceptance remain pending.
