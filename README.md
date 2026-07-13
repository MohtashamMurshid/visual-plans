# Coolify Hosting — Visual Plan

A phone-friendly visual recap of the Coolify demo-hosting platform on `mohtasham.dev`.

## Local preview

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Production

The Dockerfile serves the static artifact through Nginx on port 80. Assign a Coolify domain such as `plan-coolify-hosting.demo.mohtasham.dev`.
