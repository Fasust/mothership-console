## 🚀 Mothership Console

![Preview of Ypsilon Scenario](./doc/gifs/Ypsilon.gif)

- [🚀 Mothership Console](#-mothership-console)
  - [What this repo is](#what-this-repo-is)
- [🌐 Live site](#-live-site)
- [🕹️ Features](#️-features)
  - [Warden Menu](#warden-menu)
  - [Emergency Menu](#emergency-menu)
  - [Command Palette](#command-palette)
- [📚 Scenarios \& credits](#-scenarios--credits)
  - [Ypsilon 14](#ypsilon-14)
  - [Greta Base](#greta-base)
  - [Prospero's Dream](#prosperos-dream)
  - [RSV Fidanza](#rsv-fidanza)
  - [The Deep](#the-deep)
- [🛠️ Running and building locally](#️-running-and-building-locally)
  - [Prerequisites](#prerequisites)
  - [Install dependencies](#install-dependencies)
  - [Start a development server](#start-a-development-server)
- [🗂️ Project structure](#️-project-structure)

### What this repo is

**Mothership Console** is an interactive, browser‑based console for running sci‑fi horror tabletop sessions using the [*Mothership* TTRPG](https://www.tuesdayknightgames.com/pages/mothership-rpg?srsltid=AfmBOoqcbtrVLHVltBpp0sRu_inKGnt6yM_IWRXxR4ddML5dRiPV_1E5). It shows an in-universe terminal with relevant graphics for different [scenarios](#-scenarios--credits). I built this for my own Mothership group. The scenarios this app supports are just the scenarios my group and I played through. I thought other groups might find it useful, so I decided to publish it, but I do not currently have plans to extend it further.

The app is built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS**, and is designed to be run on a dedicated screen at the table (TV, projector, or a spare monitor).

## 🌐 Live site

This console is hosted at: https://mothership-console-jet.vercel.app/

## 🕹️ Features

### Warden Menu

Use `Cmd+K` / `Ctrl+K` or click the bottom left text "{{Scenario}} TERMINAL INTERFACE" 3 times to open the Warden Menu. From here you can navigate through any scenario of your choice and choose a color theme.

### Emergency Menu

Use `Cmd+E` / `Ctrl+E` or click the bottom left text "AUTHORIZED ACCESS ONLY" 3 times to open the Emergency Menu. From here you can start an emergency countdown or put the console into emergency mode. Useful if you want to create a sense of urgency for your players.

You can also press `Cmd+Shift+E` / `Ctrl+Shift+E` to toggle the emergency mode on/off without using the menu.

![Emergency mode demo](./doc/gifs/Emergency.gif)

### Command Palette 

Use `Cmd+P` / `Ctrl+P` to open the command palette, which offers a bunch of useful shortcuts.

## 📚 Scenarios & credits

All scenarios are **fan‑made digital aids** for running published modules. All setting content remains the property of the original authors and publishers; this project is a non‑commercial companion tool.

### Ypsilon 14

![Ypsilon demo](./doc/gifs/Ypsilon.gif)

- **Module**: [The Haunting of Ypsilon 14](https://www.tuesdayknightgames.com/collections/mothership-starter-modules/products/the-haunting-of-ypsilon-14)
- **Source file**: [`src/models/scenarios/ypsilon-14.ts`](src/models/scenarios/ypsilon-14.ts)
- **Source book credits**:
  - Written by **D. G. Chapman** (GoGoGolf!, Bastard Magic, The Graverobber's Guide)
  - Layout by **Sean McCoy** (*Mothership*, *Dead Planet*, *A Pound of Flesh*)
  - Published by **Tuesday Knight Games**

You will find two scenarios for Ypsilon: one with the tunnels and one without. In my campaign my players had to unlock the tunnel map, which is why I split them up. This scenario has a very elaborate interior view with interactive controls for different parts of the station. I gave my players access to this view whenever they were at an in-game terminal.

The login data for the Admin User is:

```
NAME: SONYA
PASSWORD: PRINCES
```

### Greta Base

![Greta Base demo](./doc/gifs/Greta.gif)

- **Module**: [Another Bug Hunt](https://www.tuesdayknightgames.com/collections/mothership-starter-modules/products/another-bug-hunt)
- **Source file**: [`src/models/scenarios/greta-base.ts`](src/models/scenarios/greta-base.ts)
- **Source book credits**:
  - Written by **DG Chapman**, **Luke Gearing**, **Alan Gerding**, **Tyler Kimball**
  - Edited by **Jarrett Crader**
  - Layout & Graphic Design by **Lone Archivist**, **Sean McCoy**
  - PDF Remediation by **Dai Shugars**
  - Art by **Don Austin**, **Franck Besançon**, **Paul Enami**, **Jacob Haynes**, **David Hoskins**, **Zach Hazard Vaupen**, **Sam Wildman**
  - Playtested by **Reece Carter**
  - Proofread by **Daniel Hallinan** and **Janne Puonti**
  - Published by **Tuesday Knight Games**

This one has a similar setup for the interior view as [Ypsilon 14](#ypsilon-14).

### Prospero's Dream

![Dream demo](./doc/gifs/Dream.gif)

- **Module**: [A Pound of Flesh](https://www.tuesdayknightgames.com/products/a-pound-of-flesh)
- **Source file**: [`src/models/scenarios/prosperos-dream.ts`](src/models/scenarios/prosperos-dream.ts)
- **Source book credits**:
  - Written by **Donn Stroud**, **Sean McCoy**, and others
  - Art and Layout by **Sean McCoy**
  - Published by **Tuesday Knight Games**

No interior view for the Dream, since it's simply too massive. But instead the exterior view now offers a selection of specific areas of the Deep that you can highlight on the map.

### RSV Fidanza

![Fidanza demo](./doc/gifs/Fidnaza.gif)

- **Module**: [Warped Beyond Recognition](https://www.paradiso.zone/ooo-wbr/)
- **Source file**: [`src/models/scenarios/rsv-fidanza.ts`](src/models/scenarios/rsv-fidanza.ts)
- **Source book credits**:
  - Created by **Paradiso**

For the interior view of this one I chose to just use the ASCII art already provided in the books, since it's basically perfect.

### The Deep

![Deep demo](./doc/gifs/Deep.gif)

- **Module**: [Gradient Descent](https://www.tuesdayknightgames.com/products/gradient-descent)
- **Source file**: [`src/models/scenarios/deep.ts`](src/models/scenarios/deep.ts)
- **Source book credits**:
  - Written by **Luke Gearing**
  - Illustrated by **Nick Tofani**
  - Edited by **Jarrett Crader**
  - Layout by **Sean McCoy**
  - Published by **Tuesday Knight Games**

You will find two scenarios for Gradient Descent: one for "The Deep" itself and one for Bell Station.

![Bell demo](./doc/gifs/Bell.gif)

## 🛠️ Running and building locally

### Prerequisites

- **Node.js** 20+ recommended
- **npm** (or `pnpm` if you prefer; a `pnpm-lock.yaml` is included)

### Install dependencies

From the repo root:

```bash
# using npm
npm i

# or, using pnpm
pnpm i
```

### Start a development server

```bash
npm run dev
# or
pnpm dev
```

Then open `http://localhost:3000` in your browser. The root route redirects to `/0/exterior` (the first scenario’s exterior view).

## 🗂️ Project structure

```text
root
│
├── public
│   ├── images/
│   └── sounds/
│
├── src
│   ├── app
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── [scenario]/
│   │       ├── page.tsx
│   │       └── [view]/page.tsx
│   │
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── models/
│   │   └── scenarios/
│   └── use-mobile.tsx, utils.ts
│
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

- **`src/app`**: Routing, layout, and provider setup.
- **`src/components`**: Exterior/interior views, overlays, menus, and shared UI.
- **`src/context`**: React context state for scenarios, views, theme, admin, audio, diagnostics, emergency, POIs, and table sorting.
- **`src/models`**: Types and data, including all scenario definitions under `src/models/scenarios`.
- **`src/data`**: Static data such as emergency presets.
- **`public`**: Static assets (images, sounds) used in the console.
- **Root config files**: Tooling and framework configuration (`tailwind.config.ts`, `tsconfig.json`, `.eslintrc.js`, `package.json`).


---

[<img src="./doc/imgs/buy-me-a-coffee.png" width="200">](https://buymeacoffee.com/fasust)
