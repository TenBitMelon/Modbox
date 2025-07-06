**Project Name:** Modbox (I'll use this as the umbrella term for the ecosystem)

**Core Vision:** To create an integrated ecosystem that significantly simplifies the creation, management, sharing, updating, and playing of Minecraft modpacks, leveraging modern tools like Git and Packwiz, and providing a superior user experience for both players and pack developers.

---

**I. Core Components of the Modbox Ecosystem:**

1.  **Modbox Platform (Website):** The central web application.
    *   **Target Audience:** Players & Modpack Developers.
    *   **Purpose:** Discovery, creation, management, collaboration, and distribution of modpacks.
2.  **Modbox Client Mod (In-Game):** A Minecraft mod to enhance the experience.
    *   **Target Audience:** Players & Modpack Developers (while in-game).
    *   **Purpose:** In-game access to Modbox features, pack management, update handling, developer tools.
3.  **Backend Services & Infrastructure:** The "engine" powering the platform.
    *   **Purpose:** User authentication, database management, Git operations, Packwiz operations, API for website and client mod.

---

**II. Key Features & Functionality (Categorized):**

**A. For Players (Focus: Ease of Use, Discovery, Seamless Play):**

1.  **Browse & Discover Modpacks:**
    *   Hosted on Modbox, potentially mirror/index from Modrinth/CurseForge (read-only views for external).
    *   View mod lists, descriptions, images/videos.
    *   **Deep Dive:** View configs, scripts (KubeJS), pack structure (how it's built via Packwiz).
    *   Filter by Minecraft version, mod loader, popularity, tags, etc.
    *   Changelogs and version history.
2.  **Install Modpacks:**
    *   **One-Click Install:** "Install with MultiMC" (via URL scheme).
    *   Download pre-packaged zip (for manual MultiMC/Prism import).
    *   Provide Packwiz `pack.toml` URL for direct Packwiz-CLI usage.
3.  **Update Modpacks:**
    *   **Client Mod Integration:**
        *   On launch, check for updates (configurable: always ask, auto-update with backup).
        *   Notification of updates with link to Modbox project page/changelog.
        *   Handles Packwiz update process locally.
    *   **Multiplayer Focus:**
        *   Client Mod checks if connected server has a recommended/required pack version.
        *   Prompt to update/switch if a mismatch is detected (with server admin configurable behavior).
4.  **In-Game Enhancements (via Modbox Client Mod):**
    *   **First Launch Popup:**
        *   Ask about update checking preferences.
        *   Ask to enable optional mods (if defined by pack dev).
        *   Customizable questions by pack dev.
    *   Option to auto-join last server.
    *   Display server info/update status on loading screen.
    *   In-game mod list viewer (potentially open config files from here if client has an editor association).
    *   Simple in-game notepad.

**B. For Modpack Developers (Focus: Powerful Creation Tools, Collaboration, Version Control):**

1.  **Create Modpacks:**
    *   **From Scratch:** Select MC version, mod loader.
    *   **Fork Existing:** Fork any public Modbox pack to create your own version (maintains upstream link for potential updates).
    *   **From Template:** Pre-defined starting points (e.g., "Performance Vanilla+", "Kitchen Sink Base").
    *   **Import Existing:**
        *   Upload CurseForge/Modrinth zip.
        *   Import via Packwiz URL.
2.  **Edit & Manage Modpacks (Web Interface):**
    *   **Packwiz in the Browser:**
        *   Add/remove mods (search Modrinth/CurseForge APIs).
        *   Manage mod versions, side (client/server/both), optional status.
        *   Edit `pack.toml` and other Packwiz files directly.
        *   Manage configs: upload, edit (text-based), view.
        *   Manage scripts (KubeJS, etc.): upload, edit.
        *   Manage datapacks & resource packs (basic add/remove, not deep management).
    *   **Git Integration:**
        *   Every modpack is a Git repository (likely on GitHub, managed by Modbox).
        *   View commit history.
        *   Branching, tagging (for releases, betas, alphas).
        *   Collaboration: Invite others to the GitHub repo.
    *   **Dependency Management:**
        *   Packwiz handles mod dependencies.
        *   Potential for "sub-pack" or module support (Git submodules or Packwiz feature).
3.  **In-Game Developer Tools (via Modbox Client Mod - "Dev Mode"):**
    *   **KubeJS & Scripting Helpers:**
        *   In-game recipe editor (visual or guided for KubeJS).
        *   JEI integration: right-click to get item IDs/tags, "remove this recipe" buttons.
        *   KubeJS-like item info display (tags, NBT).
        *   Tag list viewer.
    *   **Diagnostics & Utilities:**
        *   Easy access to open config files.
        *   View dependency tree for a mod.
        *   Embedded To-Do notes (synced with web).
        *   Auto-open crash report on crash.
        *   Reload on save for configs/scripts (if feasible).
        *   "Restart Game" button.
        *   Quick "Start a Test Server" button (local, basic).
    *   **Recommended Dev Mods:** Auto-suggest/include mods like Spark, WorldPreview, a menu editor.
4.  **Publish & Distribute:**
    *   Publish to Modbox (publicly or unlisted).
    *   Define release versions (stable, beta, alpha).
    *   **Export Options:**
        *   Generate CurseForge-compatible zip.
        *   Generate Modrinth-compatible mrpack.
        *   MultiMC/PrismLauncher direct export.
        *   Packwiz `pack.toml` link.
    *   Potential for Patreon integration for early access/tester releases.

**C. Modbox Platform - General Features:**

1.  **User Authentication:** Sign-in with GitHub (primary).
2.  **Public API:** Allow third-party tools to interact with Modbox data (e.g., stats, pack lists).
3.  **Documentation:** Extensive documentation for players, developers, and API users.
4.  **Community Features (Future):** Comments, ratings, forums, issue tracking per pack.

---

**III. Potential Technology Stack Considerations:**

*   **Storage Backend:**
    *   **GitHub:**
        *   Pros: Handles Git, auth, collaboration, free for public repos.
        *   Cons: API rate limits, not ideal for large binary mod JARs (Packwiz helps by only storing metadata and download links). Modbox would store the Packwiz project, not the mod JARs themselves.
*   **Website Frontend:**
    *   **SvelteKit (with Svelte 5):**
        *   Pros: Modern, good DX, performant, SSR, good for interactive UIs.
        *   Cons: Newer ecosystem, JavaScript backend (if using its server routes for full-stack).
    *   **Astro:**
        *   Pros: Great for static/content-heavy, can embed components from other frameworks.
        *   Cons: Less suited for highly dynamic web applications out-of-the-box, but can be made to work.
*   **Website Backend (if not SvelteKit full-stack):**
    *   Node.js (Express, Fastify) with TypeScript.
    *   Python (Django, Flask).
    *   Go.
    *   (Consider what's best for Git/Packwiz CLI operations if done server-side).
*   **Database:**
    *   PostgreSQL or MySQL (Relational: for user accounts, pack metadata not in Git, relations).
    *   MongoDB (NoSQL: if a more flexible schema is desired for some parts).
*   **Running Packwiz/Git:**
    *   **Client-Side:** For some operations, Packwiz (Go) could be compiled to WebAssembly. Git operations could use `isomorphic-git`. This reduces server load but relies on user's browser/machine.
    *   **Server-Side:** For reliability and complex operations, run Packwiz/Git CLIs in a secure environment on the backend, triggered by web requests. This is likely more robust for core functionality.
*   **Modbox Client Mod:**
    *   Java (using Forge or Fabric modding toolchains).

---

**IV. Addressing Specific Problems & Design Goals:**

*   **"Its challenging to create a modpack"**: Addressed by web UI for Packwiz, KubeJS helpers, config management.
*   **"Its hard to update modpacks"**: Addressed by Git versioning, Packwiz updates, client mod auto-update features, server sync.
*   **"People don't know JavaScript for KubeJS"**: Visual/guided recipe editor aims to lower this barrier.
*   **"Making quests is very hard"**: Quest system integration/helper is a big feature; could be V2 or V3. Start with recipe/script helpers.
*   **"Struggles when no crash report"**: Client mod could try to provide more contextual info before a full crash or enhance logging.
*   **"Mod compatibility"**: Very hard. Best effort is to rely on user reports, community, and known incompatibilities. Automated detection is a massive research project.
*   **"Auto load datapacks"**: Packwiz can manage datapacks. Client mod could ensure they are active.
*   **"Test launch game to get crash/launch time"**: Ambitious for a web platform. Could be a feature of a companion *desktop* app, or focus on robust crash reporting from the client mod.

---

**V. Phased Development Approach (High-Level MVP Ideas):**

You can't build all of this at once. Start with a core that delivers value.

**Phase 1: MVP - The "Packwiz Companion" & Player Focus**

1.  **Modbox Website (Basic):**
    *   GitHub Auth.
    *   Ability to "register" an *existing* Packwiz-based modpack (by linking its GitHub repo).
    *   Display pack info (from `pack.toml` and a `README.md`).
    *   List mods, view basic configs.
    *   Provide MultiMC install URL and Packwiz URL.
    *   Browse registered packs.
2.  **Modbox Client Mod (Basic):**
    *   Check for updates for the *currently installed Packwiz pack* (if it's a Modbox-registered pack).
    *   Ask user to update.
    *   Basic first-launch popup (update settings).
3.  **Backend:**
    *   User accounts.
    *   Database for pack metadata (linking to GitHub repos).
    *   Service to periodically check linked GitHub repos for Packwiz updates to notify users.

**Why this MVP?**
*   Leverages existing Packwiz ecosystem.
*   Provides immediate value to players using Packwiz packs.
*   Tests core update mechanism.
*   Relatively low barrier to entry for pack devs (they just need a Packwiz pack on GitHub).

**Phase 2: Developer Tools - Web-Based Pack Creation**

1.  **Modbox Website (Enhancements):**
    *   **Create New Pack:** Initialize a new GitHub repo with a basic Packwiz structure.
    *   **Web-Based Packwiz Editor:**
        *   Add/remove mods (searching Modrinth/CurseForge).
        *   Edit mod versions.
        *   Basic config file viewer/uploader.
    *   Git commit history view.
2.  **Backend:**
    *   Securely run Git commands on behalf of the user for their repos.
    *   Securely run Packwiz commands.

**Phase 3: In-Game Developer Enhancements & Deeper Integration**

1.  **Modbox Client Mod (Advanced):**
    *   KubeJS recipe helper basics.
    *   In-game config access.
    *   Crash report viewer.
    *   Notepad.
2.  **Website/Backend:**
    *   More sophisticated config/script editing.
    *   Collaboration features.

**Phase X: Advanced Features / "Nice to Haves"**

*   Quest editor.
*   Advanced mod compatibility checking (if feasible).
*   Full export to CF/Modrinth.
*   Public API.

---

**VI. Key Questions & Challenges to Keep in Mind:**

*   **Scope Creep:** This project is HUGE. Aggressively define and stick to MVPs for each phase.
*   **GitHub API Limits & Large Files:** While Packwiz avoids storing JARs in Git, frequent API calls for mod searches, etc., need to be managed. Caching will be essential.
*   **Security:** Running Git/Packwiz commands on a server initiated by users requires careful security considerations (sandboxing, input validation).
*   **User Adoption:** How will you convince pack devs and players to use Modbox over existing tools/workflows? The UX and unique value propositions need to be compelling.
*   **Maintenance:** Keeping up with Minecraft updates, mod loader changes, and external API changes will be ongoing work.
*   **Packwiz/Git in Browser vs. Server:** This is a core architectural decision. Server-side is likely more reliable and easier to implement robustly first, but client-side could offer speed and reduce server load for some operations.
    *   **For "Git in the browser":** `isomorphic-git` is a JS implementation.
    *   **For "Packwiz in the browser":** Packwiz is written in Go. Compiling Go to WebAssembly (WASM) is possible, but might be complex to integrate smoothly.

---

**VII. Your Skeleton Website Design:**

Your design goals align well with this structure.
*   **Browse Modpacks:** Covers player discovery.
*   **View Mods/Configs/Construction:** The "Deep Dive" for players and devs.
*   **For Players (Browse, Look Inside, Fork, Download, Autoinstall, Auto-update):** Core player features.
*   **Git in the browser / Packwiz in the browser:** These are implementation details for the "Edit on website" developer feature.

---

**Next Steps For You:**

1.  **Breathe!** This is a lot. Acknowledge the scale.
2.  **Prioritize:** What is the *absolute core* functionality you want to build first? I strongly recommend an MVP focused on either:
    *   **Option A (Player First):** A site to browse *existing* Packwiz packs from GitHub, with MultiMC install and a client mod for updates. This means devs don't have to change their workflow much initially.
    *   **Option B (Creator First Lite):** A web UI that helps create and manage a Packwiz pack on GitHub, essentially a "Packwiz GUI in the cloud."
3.  **Choose Your Core Tech:**
    *   Frontend framework (SvelteKit sounds like a good fit for your interest and the project's needs).
    *   Backend language/framework (Node.js/Express if using SvelteKit full-stack, or choose another).
    *   Database.
4.  **Sketch out the MVP UI/UX:** How would a user accomplish the 1-2 core tasks of your MVP?
5.  **Start Small:** Build one tiny piece of the MVP. For example:
    *   Set up GitHub OAuth.
    *   Build a page that lists public repos from a *specific* GitHub user known to have Packwiz packs.
    *   Try to parse a `pack.toml` file from one of those repos and display the mod list.

**Guiding Principles for Tech Stack Choice:**

1.  **Developer Experience (DX):** How easy and enjoyable is it to build with these tools?
2.  **Scalability:** Can it handle growth in users and data?
3.  **Ecosystem & Community:** Are there good libraries, support, and documentation?
4.  **Performance:** How fast will it be for the end-users?
5.  **Suitability for the Task:** Does the tech excel at what we need it to do (e.g., web UIs, backend logic, Git operations)?

**Recommended Tech Stack & Components:**

1.  **Frontend (Modbox Website - What users see in their browser):**
    *   **Framework:** **SvelteKit** (using Svelte 5)
        *   *Why:* You mentioned it. It's excellent for building highly interactive UIs, offers great performance, server-side rendering (SSR) for fast initial loads and SEO, and a fantastic developer experience. It can also handle basic backend logic via its "endpoints" (API routes).
    *   **Language:** **TypeScript**
        *   *Why:* Adds static typing to JavaScript, catching many errors during development, improving code quality and maintainability, especially in larger projects. SvelteKit has excellent TypeScript support.
    *   **Styling:**
        *   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
        *   *Or* **Component Library + CSS-in-JS/Scoped CSS:** (e.g., DaisyUI for Tailwind, or Svelte's built-in scoped styles).

2.  **Backend (Modbox Platform Logic - The "brains" behind the website):**
    *   **Runtime/Framework:** **Node.js with Express.js or Fastify** (if SvelteKit's built-in endpoints aren't enough or you want a dedicated API service)
        *   *Why:* JavaScript/TypeScript on the backend means you can use the same language across your stack. Node.js is excellent for I/O-bound operations (like handling web requests, talking to databases, calling external APIs). Express is mature; Fastify is known for high performance.
        *   *SvelteKit Alternative:* SvelteKit's server routes/endpoints can serve as your backend for many API needs, especially initially. This simplifies deployment. You'd write these in TypeScript/JavaScript.
    *   **Language:** **TypeScript** (consistent with frontend)
    *   **Key Responsibilities:**
        *   Handling user authentication (GitHub OAuth).
        *   API for the frontend (e.g., fetching pack lists, pack details, user data).
        *   API for the Modbox Client Mod (e.g., checking for updates).
        *   Interacting with the Database.
        *   **Orchestrating Git & Packwiz Operations:** This is crucial. The backend will execute Git commands (e.g., `git clone`, `git commit`, `git push`) and Packwiz CLI commands (e.g., `packwiz refresh`, `packwiz mr add`, `packwiz curseforge add`).
        *   Interacting with external APIs (GitHub, Modrinth, CurseForge).

3.  **Database (Storing persistent data):**
    *   **Type:** **PostgreSQL**
        *   *Why:* A powerful, open-source relational database. Reliable, scalable, and feature-rich. Good for structured data like user accounts, modpack metadata, relationships (forks, collaborators).
    *   **ORM (Object-Relational Mapper):** **Prisma**
        *   *Why:* Modern, type-safe database toolkit for Node.js and TypeScript. Makes database interactions easier and safer. Excellent integration with PostgreSQL and good DX.
    *   **What it stores:**
        *   User accounts (linked to GitHub ID, Modbox specific settings).
        *   Modpack metadata (name, description, owner, link to GitHub repo, tags, versions, download counts, etc.).
        *   Relationships (e.g., which user created which pack, forks, collaborators).
        *   Possibly cached data from external APIs.

4.  **Version Control & Modpack Storage (Core of Pack Management):**
    *   **System:** **Git**
    *   **Hosting:** **GitHub**
        *   *Why:* You mentioned it. It's the standard for Git hosting, offers robust APIs, free public repositories, built-in collaboration tools (issues, pull requests), and user authentication (GitHub OAuth for Modbox sign-in).
        *   *How:* Each Modbox modpack will be its own Git repository on GitHub, managed (created, committed to) via the Modbox backend using the GitHub API and direct Git CLI commands. The actual mod *JAR files* are NOT stored in Git; Packwiz handles this by storing download links and metadata.

5.  **Pack Management Tool (Core of Modpack Definition):**
    *   **Tool:** **Packwiz**
        *   *Why:* You mentioned it. It's designed for this. Git-friendly, manages mod metadata, versions, download sources, configs, and dependencies.
        *   *How:* The Modbox backend will run Packwiz CLI commands to:
            *   Initialize new packs.
            *   Add/remove/update mods from Modrinth/CurseForge.
            *   Refresh mod metadata.
            *   Manage config files within the Git repository.

6.  **Modbox Client Mod (In-Game Enhancements):**
    *   **Language:** **Java**
    *   **Toolchain:** **Forge or Fabric** (you'll need to choose one to target initially, or plan for supporting both, which adds complexity).
        *   *Why:* Standard for Minecraft modding.
    *   **How it connects:** Makes HTTP(S) requests to your Modbox Backend API to:
        *   Check for pack updates.
        *   Send crash reports (if implemented).
        *   Fetch in-game notepad data, etc.

7.  **Authentication:**
    *   **Method:** **OAuth 2.0 with GitHub as a provider.**
        *   *Why:* Secure, delegates user identity to a trusted source, "Sign in with GitHub" is common and convenient for developers.
    *   **Libraries:**
        *   SvelteKit: `lucia-auth` is a popular choice.
        *   Node.js/Express: `Passport.js` with a GitHub strategy.

8.  **Deployment (Where your application lives):**
    *   **SvelteKit App (Frontend + potentially some Backend logic):**
        *   **Vercel:** Excellent support for SvelteKit, easy deployment, serverless functions for API routes.
        *   **Netlify:** Similar to Vercel.
        *   **Fly.io, Railway, Render:** Platform-as-a-Service options that can host Node.js apps and SvelteKit.
    *   **Dedicated Backend (if separate from SvelteKit):**
        *   Same as above (Fly.io, Railway, Render), or Docker containers on AWS ECS/EKS, Google Cloud Run/GKE, Azure Container Apps.
    *   **PostgreSQL Database:**
        *   **Supabase:** Provides PostgreSQL hosting, auth, storage, and more (could simplify parts of your backend).
        *   **Neon:** Serverless Postgres.
        *   **Railway, Render:** Offer managed PostgreSQL.
        *   Cloud provider managed services (AWS RDS, Google Cloud SQL, Azure Database for PostgreSQL).

---

**How The Pieces Connect (Simplified Flow):**

```
+---------------------+      HTTP(S)       +------------------------+      Git API / CLI      +-----------------+
| User's Browser      |<------------------>| Modbox Backend         |<---------------------->| GitHub          |
| (SvelteKit Frontend)|                    | (Node.js/Express/SvelteKit Endpoints) |                       | (Packwiz Repos) |
+---------------------+                    +------------------------+                       +-----------------+
      ^                                          |        ^       ^
      |                                          |        |       | Packwiz CLI
      |                                          | Prisma |       | (runs locally on backend server)
      |                                          v        |       |
      | HTTP(S)                            +------------+ |       |
      |                                    | PostgreSQL | |       |
      |                                    | Database   | |       |
      |                                    +------------+ |       |
      |                                                     |       | HTTP(S)
      |                                                     |       v
+---------------------+                                     |   +-------------------+
| Minecraft Client    |<------------------------------------+   | Modrinth /        |
| (Modbox Java Mod)   |          HTTP(S) API Calls              | CurseForge APIs   |
+---------------------+                                         +-------------------+
```

**Detailed Interaction Example: Creating a New Modpack**

1.  **User (Frontend - SvelteKit):** Clicks "Create New Pack," fills in name, MC version, loader.
2.  **Frontend -> Backend API:** Sends a POST request to `/api/packs` with the pack details.
3.  **Backend (Node.js/SvelteKit Endpoint):**
    *   Authenticates the user (ensures they are logged in via GitHub OAuth).
    *   Uses the **GitHub API** to create a new, empty repository under the user's Modbox-linked account or an organization.
    *   Locally (on the server), clones this new empty repository using **Git CLI**.
    *   Inside the cloned repo, runs **Packwiz CLI** commands (`packwiz init`, etc.) to set up the basic pack structure (`pack.toml`, etc.).
    *   Adds/commits/pushes these initial files to GitHub using **Git CLI**.
    *   Stores metadata about this new pack (name, GitHub repo URL, owner ID) in the **PostgreSQL Database** via **Prisma**.
    *   Responds to the Frontend with success and the new pack's ID/URL.
4.  **User (Frontend):** Is redirected to the new pack's management page.

**Interaction Example: Player Updating a Modpack via Client Mod**

1.  **Player (Minecraft Client with Modbox Mod):** Game launches.
2.  **Modbox Mod -> Backend API:** Sends a GET request to `/api/packs/:packId/check-update?currentVersion=x.y.z`, providing the ID and current version of the installed Packwiz pack.
3.  **Backend:**
    *   Retrieves pack information from the **Database** (including its GitHub repo link).
    *   Fetches the latest `pack.toml` or version tags from the **GitHub** repo.
    *   Compares the latest version with the player's `currentVersion`.
    *   Responds to the Modbox Mod indicating if an update is available and the new version details (including a link to the updated `pack.toml` or Packwiz update instructions).
4.  **Modbox Mod:** If an update is available, prompts the player. If confirmed, it uses local Packwiz capabilities (or guides the user) to pull changes from the pack's Git repository and update mods.

---

**Key Considerations for this Stack:**

*   **Learning Curve:** If you're new to some of these (e.g., SvelteKit, Prisma, backend Node.js), there will be a learning curve. Start with tutorials for each piece.
*   **Monorepo vs. Separate Repos:** You could manage your SvelteKit frontend and Node.js backend in a single monorepo (e.g., using pnpm workspaces or Turborepo) or keep them as separate projects.
*   **Security:**
    *   Sanitize all inputs.
    *   Be extremely careful when executing CLI commands (Git, Packwiz) based on user input. Ensure commands are constructed safely to prevent command injection.
    *   Secure API keys for GitHub, Modrinth, CurseForge.
*   **"Git/Packwiz in the Browser":**
    *   **Git in browser:** Possible with libraries like `isomorphic-git` (JavaScript implementation of Git). Complex for full operations, better for read-only or limited writes.
    *   **Packwiz in browser:** Packwiz is a Go binary. You *could* compile it to WebAssembly (WASM) to run in the browser. This is advanced and might have limitations.
    *   **Recommendation:** Start with server-side Git/Packwiz operations for robustness and security. Browser-side can be an optimization later if truly needed.

This stack provides a solid, modern foundation. Start by building the simplest possible version of one feature (e.g., authenticating with GitHub and displaying user info, or listing hardcoded pack data) to get comfortable with the connections between frontend, backend, and database.


Okay, here's a detailed description of the design in the image, aimed at a designer:

**Overall Impression & Style:**

The design presents a **clean, modern, and minimalist user interface**, likely for a desktop application or a web-based game modding platform. It has a slightly **technical or utilitarian feel** but remains **approachable and user-friendly**. The aesthetic is flat with subtle depth cues like shadows and borders. It leans towards a **light theme** by default, with a clear provision for a dark mode (indicated by the moon icon).

**Color Palette:**

*   **Primary:** Monochromatic, dominated by various shades of **light gray and white**.
    *   Backgrounds: Very light gray (almost off-white) for the main content area.
    *   UI Elements (Navbar, Search Bar, Cards): Slightly darker, distinct shades of light gray. For example, the navbar and search/filter bar container seem to have a slightly cooler, more distinct gray than the card backgrounds.
    *   Text: Dark gray or near-black for high contrast and readability on light backgrounds.
*   **Accents:** Color is primarily introduced through the **modpack imagery (banner and icon)**. There are no strong, globally applied accent colors in the UI chrome itself, keeping the focus on the content.
*   **Borders & Dividers:** Subtle, very light gray borders are used to define elements like input fields, buttons, and card edges.

**Typography:**

*   **Font Family:** Righteous
*   **Hierarchy:**
    *   Logo ("ModBox"): Medium-to-bold weight, relatively large.
    *   Navigation Links: Medium weight.
    *   Modpack Titles: Bold weight, largest text within the card.
    *   Modpack Descriptions: Regular weight, smaller size.
    *   Metadata: Smallest text, regular or light weight.
    *   Placeholders & Labels: Regular weight.

**Iconography:**

*   Style: Simple, clean, **line-art icons**.
*   Examples: Wrench (logo), Moon (dark mode), User (implied for Account), Search, Chevron Down (dropdowns), Download, Clock, Arrow Up.
*   Consistency: Icons maintain a consistent line weight and style.

**Spacing & Visual Details:**

*   **Padding & Margins:** Generous padding within elements like buttons and cards. Consistent margins between sections and grid items, contributing to the clean look.
*   **No Rounded Corners:** There are no rounded corners. Prevalent on buttons, input fields, cards, and the search/filter bar container, giving a softer, modern feel. The radius is moderate, not overly pill-shaped.
*   **Shadows:** Hard drop shadows on cards and potentially on the header/search bar to create a sense of layering and depth. This makes the boxes feel like they are raised off the page.
*   **Borders:** There are thick borders on all the box elements on the page. This give the boxes a more 3D look.
*   **Interactions (Implied):**
    *   Hover states on buttons and cards would likely involve a slight change in background color (e.g., darkening the gray), a subtle lift via shadow adjustment, or a border highlight.
    *   Active states for dropdowns and navigation links would be clearly indicated.

**Key Design Elements to Emphasize:**

*   The **monochromatic light gray color scheme** with color introduced via content images.
*   The consistent use of **rounded rectangles** for interactive elements and containers.
*   The specific **layout and layering of the modpack card**, especially the **overlay icon** protruding below the banner and the unique **"diamond" accent** above the card.
*   The clean, **sans-serif typography** and clear visual hierarchy.
*   The overall **balance of whitespace and content density**, aiming for clarity and ease of scanning.

This design feels organized, efficient, and visually unobtrusive, allowing the modpack content itself to be the primary focus.