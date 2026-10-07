# User-selected Dribbble references: dark surfaces and gradient hierarchy

## What is visually verified, and what makes the selected direction work?

### Takeaway
The user-supplied montage is visually verified. Its strongest transferable idea is a dark canvas with selective violet illumination inside a few foreground surfaces—not a uniform increase in every surface's brightness. The gradients establish focal points while most of the terminal remains restrained.

### Cited Findings
- The first selected Dribbble page identifies its design as a DeFi market-maker dashboard and explicitly describes purple gradients, Ethereum tracking, pricing cards, staking, governance, and wallet integration. This page's text was accessible, but its full-resolution artwork was not retrieved. — [Selected reference 1](https://dribbble.com/shots/26877921-DeFi-Market-Maker-Dashboard-Proactive-Liquidity-Web3-Trading)
- The supplied montage visibly uses near-black exterior gutters, very dark navigation, subtly lighter contained panels, and concentrated violet light in selected cards and chart areas. White headline figures and violet selected states sit above this subdued structure. This is a direct visual observation of the user's attachment; attribution to a specific online shot cannot be independently established from the low-resolution montage alone. — [User-provided montage](</var/folders/cn/65pg4qvn40d6c23s12dl8b200000gn/T/codex-clipboard-okHO69.png>)
- In the montage's upper-left screen, a violet information/action card on the right balances quieter content on the left. Small asset cards below vary in emphasis rather than all receiving equally strong gradient fills. — [User-provided montage](</var/folders/cn/65pg4qvn40d6c23s12dl8b200000gn/T/codex-clipboard-okHO69.png>)
- In the upper-right screen, one list panel receives a substantial violet gradient while the adjacent list remains neutral. In the bottom-left screen, one violet bar and a localized glow distinguish the chart's salient value from quiet gray bars. The bottom-right table remains predominantly neutral. — [User-provided montage](</var/folders/cn/65pg4qvn40d6c23s12dl8b200000gn/T/codex-clipboard-okHO69.png>)

### Inferences
- Gradients work here because their placement creates hierarchy: background stays dark; the chosen card, active row, primary action, or selected chart series becomes foreground. Applying the same gradient to every panel would remove this hierarchy.
- The composition has four luminance roles: darkest structural canvas, neutral panel bodies, gently raised interactive surfaces, and a small number of illuminated focal surfaces. Rook should specify these roles before selecting exact colors.
- The reference's compact text is a presentation artifact, not a suitable size target for a launch video or usable application. Preserve its visual hierarchy while using legible production typography.

### Gaps
- Exact pixel values, font family, original dimensions, and contrast ratios cannot be determined reliably from the supplied 400 × 300 montage.
- Full artwork for reference 1 was not retrieved. The webpage's palette chips are automatically surfaced colors, not a reliable interface token specification.
- [Selected reference 2](https://dribbble.com/shots/27561718-Crypto-Swap-Dashboard-UI-Dark-Web3-Trading-Platform) and [selected reference 3](https://dribbble.com/shots/27098305-Data-Driven-Trading-Experience-Fintech-UI) were not visually verified: web open failed for full URLs and short shot URLs; image search did not return these exact shots. No specific visual claims about them are used.

## How should Rook adapt gradients and foreground/background separation?

### Takeaway
Use gradients as deliberate lighting attached to meaningful product elements. Keep data surfaces mostly neutral and preserve a dark theme through a near-black canvas rather than making every foreground block black too.

### Cited Findings
- The montage concentrates purple illumination on one prominent right-side card, one list panel, and a selected chart value, with quiet neutral surfaces surrounding them. — [User-provided montage](</var/folders/cn/65pg4qvn40d6c23s12dl8b200000gn/T/codex-clipboard-okHO69.png>)
- The primary selected page describes gradients and glowing accents as part of the dashboard's visual treatment, alongside market data and wallet functionality. — [Selected reference 1](https://dribbble.com/shots/26877921-DeFi-Market-Maker-Dashboard-Proactive-Liquidity-Web3-Trading)

### Inferences
Proposed design decisions, not values sampled from the artwork:

- Restore a near-black application canvas, then define panel bodies one measured luminance step above it. Use an even lighter neutral for inputs, selected tabs, and hover states, plus visible restrained panel edges. Do not globally lighten all surface tokens.
- Add a low-opacity violet radial glow within the top-right or upper edge of the principal analytics panel. Clip it to the panel; fade to the neutral body before it reaches dense data. It should signal depth without tinting text or chart labels.
- Give the key opportunity/result card a restrained directional violet gradient, a fine brighter top edge, and a clear headline metric. One such card per view is sufficient.
- Use a more saturated violet gradient for the primary action, with a subtle border highlight and a small soft shadow. Secondary controls stay neutral so the primary action remains identifiable.
- On charts, use a crisp solid line and translucent fading area below it. A selected bar can carry a violet-to-lavender vertical gradient; inactive comparisons stay gray. Labels must remain crisp without glow.
- Use selected-row tint or a slim violet edge to identify the active contract/relationship. Do not put a full strong gradient under every table row.
- Keep green and red dedicated to gain/loss or outcome semantics. Violet should communicate selection, emphasis, and brand rather than financial direction.
- Keep any decorative light static for filming and normal use. No moving background gradients or floating glow animations are necessary to achieve the reference's visual depth.

### Gaps
- The current implementation's exact surface tokens and chart composition are being audited separately; these recommendations need mapping to actual components before implementation.
- Contrast should be measured against the brightest portion of any gradient beneath text; a nominal background token alone cannot establish readability.

## What typography, density, and decoration should be retained or rejected?

### Takeaway
Retain strong visual grouping and selective numeric prominence. Reject miniature reference typography, excessive decorative Web3 artwork, and gradients that compete with the terminal's financial data.

### Cited Findings
- The montage uses visually distinct metric sizes, contained card groups, compact lists, sparse chart annotation, and regular table alignment. Its bottom-right table receives less illumination than its prominent cards and chart selection. — [User-provided montage](</var/folders/cn/65pg4qvn40d6c23s12dl8b200000gn/T/codex-clipboard-okHO69.png>)
- A decorative circular token/mark occupies the prominent right-side panel in the montage; this is visible artwork rather than a demonstrated trading workflow necessity. — [User-provided montage](</var/folders/cn/65pg4qvn40d6c23s12dl8b200000gn/T/codex-clipboard-okHO69.png>)

### Inferences
- Maintain the user's requested sans-serif direction. Use proportional sans text with tabular numeral features for aligned monetary columns; no monospaced font is needed.
- Proposed production sizes: approximately 14–15 px for data rows and controls, 12–13 px only for genuinely secondary metadata, 18–22 px section titles, and 28–36 px headline metrics. Verify at actual recording resolution rather than trusting screenshots.
- Make primary labels and values brighter than secondary explanatory text. Use weight and size alongside color to distinguish levels. Avoid thin gray labels that disappear during video compression.
- Replace paragraphs describing each panel with short labels, visual relationships, plotted comparisons, and concise tooltips where useful. A finished-product screen should communicate one dominant task and a clear next action.
- Give charts more area than their captions and ensure the selected series is immediately apparent. Group related figures into a single clean summary strip instead of separate explanatory boxes.
- Tables should be dense enough to feel credible but not crowded: consistent rows, aligned numeric columns, visible header grouping, and one clear selection treatment. Avoid many nested cards around individual cells.
- Do not transfer decorative token renders, ornamental emblems, oversized wallet promotion cards, or tiny unreadable side widgets unless they serve Rook's actual scenario/portfolio workflow.
- Main risks: excessive glow makes surfaces muddy; strong fills hide risk colors; every-card gradients flatten emphasis; low-contrast microtype fails in the launch video; over-rounding and large padding reduce the amount of useful data visible.

### Gaps
- Interaction behavior and accessibility are not demonstrated by static Dribbble shots. This research supplies visual direction, not proof that those concepts are usable implementations.
