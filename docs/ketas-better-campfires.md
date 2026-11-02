# Keta's Better Campfires

Optional settings under World > Wilderness & encounters: owned camp beacons, Overworld markers, range, maximum height and opacity. Defaults off. Reads the existing live camp pool; packing/removal and floating-origin movement need no new save data. Hidden/remote camps are excluded and at most 16 markers draw.

The beam begins at the fire sprite top, respects scene depth, grows from 5m nearby to at most 100m far away, and fades from 55% of selected opacity to at most0.60. A single procedural quad is used per beam; no particle textures/framebuffer masks. Shader compilation is polled before use. GPU resources are disposed when disabled or the world stops.

No API proposal, patcher, combat rules, inventory automation or account files are included. Live gameplay/FPS acceptance remains pending; synthetic tests do not establish a real frame-rate improvement.

Overworld camps use pixel-art campfire or tent pins on the existing map canvas, with a short name and measured distance below. The wavy beam is depth-tested world geometry at the post-opaque render seam, with the native Fallen Star far-plane clamp. Its separate maximum height setting ranges from 100 to 1000 metres. The beam grows with camera distance and starts at the camp sprite top. No framed label tile or separate animation loop is added. Packed camps disappear on the next update. The combined map beam pass handles at most 16 camps and 10 death locations. Ordinary settlement filters and counts remain unchanged.
