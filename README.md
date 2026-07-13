# Visual Plans

A phone-friendly library of implementation plans, roadmaps, and architecture
decisions. Each plan is a static page; the front page lists them, newest first.

## Structure

```
index.html            Front page — lists plans (sorted newest first)
styles.css            Shared design system
components.js         Reusable SVG chart/diagram custom elements
components/           Live gallery + usage docs for the components
coolify-hosting/      A published plan
```

## Visual components

Include the script and use the elements anywhere in a plan page. Data is
passed as JSON in the `data` attribute; see `/components/` for live examples.

```html
<script src="/components.js" defer></script>

<vp-bar-chart data='[{"label":"Risk signals","value":670,"highlight":true}]'></vp-bar-chart>
<vp-line-chart data='{"points":[42,31,19],"labels":["v1","v2","v3"],"unit":"s"}'></vp-line-chart>
<vp-donut data='{"value":80,"display":"80%","caption":"complete"}'></vp-donut>
<vp-progress data='{"done":4,"total":5,"milestones":["VM","DNS","Ship"]}'></vp-progress>
<vp-flow data='{"nodes":["GitHub","Coolify","HTTPS"],"highlight":2}'></vp-flow>
<vp-stack data='[{"label":"Proxy","highlight":true},{"cols":["app A","app B"]}]'></vp-stack>
```

## Add a plan

1. Create a folder with an `index.html` (copy `coolify-hosting/` as a template).
2. Add an entry to the `plans` array in `index.html`:

   ```js
   {
     title: "My new plan",
     description: "One-line summary.",
     href: "/my-new-plan/",
     date: "2026-07-20",        // ISO date — used for sorting
     status: "active",           // published | active | draft

     // Optional — shown as a meta line under the description:
     repo: "owner/repository",   // connected GitHub project
     branch: "feature/thing",
     pr: "https://github.com/owner/repo/pull/1",
     author: "Mohtasham",
     model: "Fable 5",           // AI model that authored the plan
   }
   ```

3. Inside the plan page, add a `details` strip under the hero for the same
   info (see `coolify-hosting/index.html` for the markup).

Plans are sorted by `date` automatically, so ordering takes care of itself.

## Local preview

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Production

The Dockerfile serves the static files through Nginx on port 80. Assign a
Coolify domain such as `plan-coolify-hosting.demo.mohtasham.dev`.
