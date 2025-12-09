## Mothership Console

- [Mothership Console](#mothership-console)
  - [What this repo is](#what-this-repo-is)
- [Live site](#live-site)
- [Using the app](#using-the-app)
  - [Navigation model](#navigation-model)
  - [Keyboard shortcuts](#keyboard-shortcuts)
  - [Core features](#core-features)
- [Scenarios \& credits](#scenarios--credits)
  - [Ypsilon 14 \& Ypsilon 14 – Underground](#ypsilon-14--ypsilon-14--underground)
  - [Greta Base – Terraforming Colony](#greta-base--terraforming-colony)
  - [Bell Station \& The Deep](#bell-station--the-deep)
  - [Prospero's Dream](#prosperos-dream)
  - [RSV Fidanza](#rsv-fidanza)
- [Running and building locally](#running-and-building-locally)
  - [Prerequisites](#prerequisites)
  - [Install dependencies](#install-dependencies)
  - [Start a development server](#start-a-development-server)
  - [Production build](#production-build)
  - [Linting](#linting)
- [Project structure](#project-structure)

### What this repo is

**Mothership Console** is an interactive, browser‑based console for running sci‑fi horror tabletop sessions using the *Mothership* RPG. It presents station, ship, and colony data as an in‑universe control interface: exterior telemetry, interior maps, system diagnostics, emergency controls, and scenario‑specific widgets.

The app is built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS**, and is designed to be run on a dedicated screen at the table (GM laptop, projector, or a spare monitor).

---

## Live site

This console is hosted at:

> **TODO:** Replace this line with your public URL (for example: `https://your-domain-here`)

Once deployed, players can connect on any modern browser; it is optimized for desktop, with a simplified layout on smaller screens.

---

## Using the app

### Navigation model

- **Scenarios**: Each scenario is a location (station, ship, or base). Routes follow the pattern `/:scenarioIndex/:view`, for example `0/exterior`.
- **Views**:
  - **`exterior`**: Orbital / surface telemetry, charts, and stats.
  - **`interior`**: Graph‑based station/ship map view plus controls and logs.
  - **`interior-ascii`**: ASCII deckplan view (for scenarios that define one).
- **Scenario & theme selectors**:
  - The **Warden Menu** lets you switch scenario and UI theme from an overlay.
  - The **Command Palette** lets you quickly jump between scenarios, views, and themes from the keyboard.

### Keyboard shortcuts

- **Cmd+P / Ctrl+P**: Open/close the **Command Palette**.
  - Search by scenario id (e.g. `YPSILON`) or by navigation command (`Navigation: Exterior`, `Navigation: Interior`, etc.).
- **Cmd+K / Ctrl+K**: Toggle the **Warden Menu** (scenario + theme selector overlay).
- **Cmd+I / Ctrl+I**: Open the **terminal interface** / Warden Menu via the footer shortcut.
- **Cmd+E / Ctrl+E**: Toggle the **Emergency Menu** overlay (emergency countdown, alarm, and sound controls).
- **Cmd+Shift+E / Ctrl+Shift+E** (or Cmd/Ctrl+Alt+E): Toggle **Emergency Mode** on/off globally (red alert theming) without opening the menu.
- **Esc**: Close the currently open overlay where supported:
  - Warden Menu
  - Emergency Menu
  - Diagnostics view
  - Airlock control panels and other modal dialogs

### Core features

- **Scenario‑driven console**
  - Each scenario defines exterior stats, interior layout (graph or ASCII), system logs, and control surfaces.
  - Crew counts, ownership, and environmental conditions are surfaced in the UI header and side panels.

- **Exterior view**
  - Charts and gauges for things like radiation, temperature, atmosphere, rotation, and resource extraction.
  - Scenario‑specific alerts (e.g. high radiation) are highlighted.

- **Interior views**
  - **Graph map** (`station-graph-map`): clickable rooms, airlocks, and connections with pressure risk and access codes.
  - **ASCII map** (where provided): static but atmospheric ship layout for quick reference.
  - Diagnostics terminal with scrolling, typewriter‑style system checks and warnings.

- **Controls & administration**
  - **Airlock and room controls**, including admin‑locked toggles that require credentials.
  - **System control buttons** (e.g. self‑destruct, terraformer, communications) configured per scenario.
  - **Emergency protocol** with countdowns, alarms, and audio levels.

- **Themes & presentation**
  - Multiple color themes (amber, cyan, green, pink, white) applied via the theme context.
  - CRT‑style scanline and flicker effects for a retro console feel, with an emergency override theme.

---

## Scenarios & credits

> You can drop scenario art or maps under each heading below (for example in `public/images/`) and embed them here later.

All scenarios are **fan‑made digital aids** for running published modules. All setting content remains the property of the original authors and publishers; this project is a non‑commercial companion tool.

### Ypsilon 14 & Ypsilon 14 – Underground

- **Module**: *The Haunting of Ypsilon 14*  
  `https://www.tuesdayknightgames.com/collections/mothership-starter-modules/products/the-haunting-of-ypsilon-14`
- **In‑app scenarios**:
  - `YPSILON 14`
  - `YPSILON 14 - UNDERGROUND` (extends the map with mine tunnels)
- **Source book credits (from the module)**:
  - Written by **D. G. Chapman** (GoGoGolf!, Bastard Magic, The Graverobbe's Guide)
  - Layout by **Sean McCoy** (*Mothership*, *Dead Planet*, *A Pound of Flesh*)
  - Published by **Tuesday Knight Games**

### Greta Base – Terraforming Colony

- **Module**: *Another Bug Hunt*  
  `https://www.tuesdayknightgames.com/collections/mothership-starter-modules/products/another-bug-hunt`
- **In‑app scenario**: `GRETA BASE - TERRAFORMING COLONY`
- **Source book credits (from the module)**:
  - Written by **DG Chapman**, **Luke Gearing**, **Alan Gerding**, **Tyler Kimball**
  - Edited by **Jarrett Crader**
  - Layout & Graphic Design by **Lone Archivist**, **Sean McCoy**
  - PDF Remediation by **Dai Shugars**
  - Art by **Don Austin**, **Franck Besançon**, **Paul Enami**, **Jacob Haynes**, **David Hoskins**, **Zach Hazard Vaupen**, **Sam Wildman**
  - Playtested by **Reece Carter**
  - Proofread by **Daniel Hallinan** and **Janne Puonti**
  - Published by **Tuesday Knight Games**

### Bell Station & The Deep

- **Module**: *Gradient Descent*  
  `https://www.tuesdayknightgames.com/products/gradient-descent`
- **In‑app scenarios**:
  - `BELL STATION`
  - `DEEP STATION` / `THE DEEP`
- **Source book credits (from the module)**:
  - Written by **Luke Gearing**
  - Illustrated by **Nick Tofani**
  - Edited by **Jarrett Crader**
  - Layout by **Sean McCoy**
  - Published by **Tuesday Knight Games**

### Prospero's Dream

- **Module**: *A Pound of Flesh*  
  `https://www.tuesdayknightgames.com/products/a-pound-of-flesh`
- **In‑app scenario**: `PROSPERO'S DREAM`
- **Source book credits (from the module)**:
  - Written by **Donn Stroud**, **Sean McCoy**, and others
  - Art and Layout by **Sean McCoy**
  - Published by **Tuesday Knight Games**

### RSV Fidanza

- **Module**: *Warped Beyond Recognition*  
  `https://www.paradiso.zone/ooo-wbr/`
- **In‑app scenario**: `RSV FIDANZA`
- **Source book credits (from the module)**:
  - Created by **Paradiso**
  - Published by **Tuesday Knight Games**

---

## Running and building locally

### Prerequisites

- **Node.js** 20+ recommended
- **npm** (or `pnpm` if you prefer; a `pnpm-lock.yaml` is included)

### Install dependencies

From the repo root:

```bash
# using npm
npm install

# or, using pnpm
pnpm install
```

### Start a development server

```bash
npm run dev
# or
pnpm dev
```

Then open `http://localhost:3000` in your browser. The root route redirects to `/0/exterior` (the first scenario’s exterior view).

### Production build

```bash
npm run build
npm start
# or with pnpm
pnpm build
pnpm start
```

### Linting

```bash
npm run lint
# or
pnpm lint
```

---

## Project structure

High‑level layout of the codebase:

- **`src/app`**: Next.js App Router entrypoints and global layout.
  - `layout.tsx`: Root layout, fonts, and `ProviderRegistry` wrapper.
  - `provider-registry.tsx`: Composes all React context providers (theme, audio, scenario, emergency, diagnostics, POI, admin, table sorting, view) and mounts the command palette.
  - `page.tsx`: Root page; redirects to `/0/exterior`.
  - `[scenario]/page.tsx`: Validates the scenario index and redirects to the exterior view.
  - `[scenario]/[view]/page.tsx`: Main console page; wires together header, footer, exterior/interior views, emergency overlay, diagnostics, and Warden Menu.

- **`src/components`**: Presentational and interactive UI components.
  - `header.tsx`, `footer.tsx`, `loading.tsx`, `button.tsx`, dialogs, and admin login modal.
  - `command_palette/`: Command palette implementation (`Cmd+P` / `Ctrl+P`).
  - `exterior/`: Exterior views, charts, and stats for planets, asteroids, stations, and ships.
  - `interior/`: Station/ship interior components, including graph map, ASCII map, diagnostics view, control buttons, and info panel.
  - `emergency/`: Emergency overlay and emergency control menu.
  - `warden-menu.tsx`: Scenario & theme selector overlay.

- **`src/context`**: React context providers for global app state.
  - `theme-context.tsx`: Theme selection and CSS variable wiring.
  - `scenario-context.tsx`: Active scenario, crew, maps, and airlock state.
  - `view-context.tsx`: Current view (`exterior`, `interior`, `interior-ascii`).
  - `emergency-context.tsx`: Emergency state, countdown, and helpers.
  - `audio-context.tsx`: Alarm and tick audio configuration.
  - `diagnostics-context.tsx`: Diagnostics visibility and behaviour.
  - `poi-context.tsx`: Points of interest selection for scenarios that support it.
  - `admin-context.tsx`: Admin login state and credentials.
  - `table-sort-context.tsx`: Shared table sorting utilities.

- **`src/models`**: TypeScript models and scenario data.
  - `scenario.ts`: Core `Scenario` type and `allScenarios` list.
  - `scenarios/`: Definitions for each published scenario (Ypsilon 14, Greta Base, Bell, Deep, Prospero's Dream, RSV Fidanza) including maps, stats, logs, and credits.
  - `station-graph-map.ts`: Graph representation of interior layouts and helpers for doors, passwords, and diagnostics.
  - `exterior-stats.ts`, `poi.ts`: Types for exterior telemetry and points of interest.

- **`src/data`**
  - `emergency-repository.ts`: Predefined emergency countdowns and related data.

- **`src/app/globals.css`**
  - Global Tailwind layers plus custom CSS for themes, CRT effects, diagnostics terminal, and emergency styling.

- **Other utilities**
  - `src/use-mobile.tsx`: Hook for mobile detection/responsiveness.
  - `src/utils.ts`: Miscellaneous shared utilities.
  - `tailwind.config.ts`, `tsconfig.json`, `.eslintrc.js`: Tooling and configuration.

Use the `src/models/scenarios` directory to tweak or add new locations, and the components/contexts to change how those scenarios are presented and interacted with in the console.