# Behance concepts and operational trading terminals

## Which references support dark foreground/background separation?

### Takeaway
Keep the canvas near-black and lift only bounded foreground surfaces. Dark-theme contrast comes from surface hierarchy, bright primary data, and selective color; a uniform graphite wash collapses those distinctions.

### Cited Findings
- **BlueTrade / Dashboard Design**: visually inspected the downloaded full dashboard image. The central page is almost black, while cards, navigation, and top bar are visibly lighter charcoal. White balance and section headings dominate; small green/red pills carry direction; colored sparklines sit on quiet cards. This is a Behance design presentation, not evidence of shipped functionality. [Project](https://www.behance.net/gallery/149543693/Dashboard-Design), [verified image](https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/b89795149543693.62e968d5e72e4.png).
- **Aries / Trading Dashboard UI/UX Design, Dude Studios**: visually inspected the downloaded image. The header, content cards, and page form distinct dark layers; white numeric cells remain legible against dark rows, with thin understated separators. Green is concentrated in selected tabs, actions, and positive results. It is a portfolio project, not a verified operational product. [Project](https://www.behance.net/gallery/200161555/Trading-Dashboard-UIUX-Design), [verified image](https://mir-s3-cdn-cf.behance.net/project_modules/fs/97b0d8200161555.665dffe1a94d9.png).
- **FundedNext / Prop Trading Dashboard UIUX**: visually inspected image. Its strongest relevant pattern is visual metric hierarchy: headline values plus small trends above a dominant analytics panel and grouped supporting views. The inspected version is light, so exclude its palette from the dark-theme direction. This is a Behance redesign concept. [Project](https://www.behance.net/gallery/182502539/Prop-Trading-Dashboard-UIUX), [verified image](https://mir-s3-cdn-cf.behance.net/project_modules/1400/81b990182502539.652edc785507d.png).

### Inferences
- For Rook, establish a near-black page, a dark neutral panel, a slightly elevated control surface, and a violet active surface. Use narrow highlight edges and dark gutters to make the layers apparent without brightening the entire app.
- Use gradients with a purpose: a restrained violet glow in the portfolio summary or active simulation result; a violet-to-transparent chart area; a stronger violet selected state. Keep ordinary tables and inputs neutral. These are proposed interpretations, not copied implementation details from the Behance sources.
- Avoid importing BlueTrade's tiny low-contrast market labels and Aries' extreme table density into a launch-video demo. Their composition is useful; their smallest typography is not.

### Gaps
- Behance project HTML was blocked for Aries and FundedNext, but their original CDN images were downloaded and visually inspected. Authorship metadata is available in search results; shipped status is unverified.
- Crypto Dashboard UI/UX – Data-Driven Design for Traders (229754077) explicitly describes itself as an exploration, but its key asset was video and was not visually verified; exclude it from palette claims. [Project](https://www.behance.net/gallery/229754077/Crypto-Dashboard-UIUX-Data-Driven-Design-for-Traders).

## What should we retain from real trading products for charts and data?

### Takeaway
Operational terminal references put readable data marks and chart context above decoration. Use their analytical clarity while preserving Rook's exposure and simulation purpose.

### Cited Findings
- **Coinbase Advanced**: downloaded its official UI GIF and visually inspected a middle frame. The chart occupies most of the workspace, with a near-black plot, bright candle marks, fine horizontal grid lines, right-side price labels, and bottom dates/timeframe context. Controls occupy compact separate bands. The official product page describes configurable widgets and TradingView charts. [Official page](https://www.coinbase.com/advanced-trade), [verified UI GIF](https://images.ctfassets.net/o10es7wu5gm1/2fAZBO8KZU0af7paT9AVBx/7a3421ba70c72d138a8da283a1bb2cb5/GTM26206_AdvancedModularUi_LOLP_Desktop_960x720-ezgif.com-video-to-gif-converter__1_.gif).
- **TradingView**: official documentation permits independent chart background treatment and states that its default dark chart background type is gradient. This establishes gradient backgrounds as compatible with operational charting, but is not proof that stronger gradients improve reading. [Official chart overrides](https://tradingview.com/charting-library-docs/latest/customization/overrides/chart-overrides/).
- Coinbase's help documentation explicitly distinguishes chart type, time range, and indicators; these are chart-context controls, not ornamental labels. [Dashboard guide](https://help.coinbase.com/en/coinbase/trading-and-funding/advanced-trade/dashboard-overview).

### Inferences
- Give Rook charts readable axes, units, visible baseline/zero, compact legends, and a clear time/scenario label. Gradient fill should fade toward the baseline so the line or bars stay primary.
- For a relationship graph: near-black canvas, bright node labels, opaque dark node surfaces, restrained violet halos only on selection, and links with enough contrast to follow. Do not place all labels inside a purple fog.
- Do not copy order books, execution panels, ticker ribbons, or candlesticks merely to resemble a terminal. Rook's main chart should expose portfolio composition, outcome distribution, or scenario change according to the existing model.
- No broad glassmorphism behind tables: fluctuating glow makes local text contrast harder to maintain. Reserve atmospheric depth for low-information summary regions.

### Gaps
- Coinbase reference is an official product demonstration animation, not a live authenticated session. The inspected frame demonstrates visual hierarchy, not tested interactive behavior.
- TradingView's documentation was read; its live desktop UI was not visually inspected during this research.

## How should the visual direction support simulation clarity and the launch video?

### Takeaway
Use one visually dominant result per screen, then structured supporting detail. The key tradeoff is selectively cinematic presentation without sacrificing the analytical reading of the product.

### Cited Findings
- BlueTrade makes a balance value prominent above the analytical region and groups supporting data in bounded cards. [Verified image](https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/b89795149543693.62e968d5e72e4.png).
- FundedNext combines headline statistics, one large time-series chart, smaller P&L/composition views, and a table in distinct regions. [Verified image](https://mir-s3-cdn-cf.behance.net/project_modules/1400/81b990182502539.652edc785507d.png).
- Coinbase's demonstrated screen gives the chart the greatest visual area while compact toolbars retain context. [Official demonstration](https://images.ctfassets.net/o10es7wu5gm1/2fAZBO8KZU0af7paT9AVBx/7a3421ba70c72d138a8da283a1bb2cb5/GTM26206_AdvancedModularUi_LOLP_Desktop_960x720-ezgif.com-video-to-gif-converter__1_.gif).

### Inferences
- Proposed simulation hierarchy: short scenario name and controls; dominant baseline-versus-scenario visual; large resulting P&L/exposure delta; compact contributing-position table. Explain model detail through disclosure or inspectable details rather than paragraphs across the primary screen.
- Use a localized gradient to identify the selected scenario and its result, not to imply that all positive outcomes are violet. Keep profit/loss colors semantic and use signs/labels as well as color.
- Check the actual launch-video capture frame at 1920×1080 and its 50% downscale. The main value, scenario name, primary chart, and active control should remain understandable. This is a proposed validation, not a source-backed universal font threshold.
- Record a stable state without pulsing glows, marquee tickers, or unnecessary animated numbers. A purposeful interaction can animate the scenario change; static capture should stay clean.

### Gaps
- No user testing or rendered Rook comparison was performed in this assignment. Recommendations are research-informed design hypotheses for the coordinator's plan.
