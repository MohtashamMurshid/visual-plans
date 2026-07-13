/*
 * Visual Plans — reusable visual components.
 *
 * Dependency-free custom elements that render SVG charts and diagrams in the
 * site's monochrome editorial style. Data is passed as a JSON `data`
 * attribute. See /components/ for a live gallery with usage examples.
 *
 *   <vp-bar-chart>    horizontal bar chart
 *   <vp-line-chart>   line / area trend chart
 *   <vp-donut>        donut chart with center value
 *   <vp-progress>     milestone progress track
 *   <vp-flow>         left-to-right pipeline diagram
 *   <vp-stack>        layered architecture diagram
 */

const INK = "#f0eee9";
const MUTED = "#8f8d88";
const FAINT = "#5d5b57";
const LINE = "rgba(255,255,255,0.09)";
const GOLD = "#c9b370";

const SVG_NS = "http://www.w3.org/2000/svg";

function parseData(el) {
  const raw = el.getAttribute("data");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[visual-plans] invalid JSON in <${el.tagName.toLowerCase()}>`, err);
    return null;
  }
}

function svgEl(name, attrs = {}, text) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    node.setAttribute(key, value);
  }
  if (text !== undefined) node.textContent = text;
  return node;
}

function makeSvg(width, height) {
  return svgEl("svg", {
    viewBox: `0 0 ${width} ${height}`,
    width: "100%",
    role: "img",
    style: "display:block",
  });
}

function label(el) {
  const title = el.getAttribute("label");
  if (!title) return null;
  const div = document.createElement("div");
  div.className = "vp-label";
  div.textContent = title;
  return div;
}

class VpBase extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;
    this.dataset.rendered = "true";
    this.classList.add("vp-component");
    const heading = label(this);
    if (heading) this.appendChild(heading);
    this.render();
  }
  render() {}
}

/* ---------- Bar chart ----------
 * data: [{ "label": "Signals", "value": 670, "highlight": true }]
 */
class VpBarChart extends VpBase {
  render() {
    const data = parseData(this);
    if (!data?.length) return;

    const rowH = 44;
    const width = 720;
    const height = data.length * rowH;
    const barLeft = 190;
    const barMax = width - barLeft - 84;
    const max = Math.max(...data.map((d) => d.value));

    const svg = makeSvg(width, height);
    data.forEach((d, i) => {
      const y = i * rowH;
      const w = Math.max((d.value / max) * barMax, 2);
      const color = d.highlight ? GOLD : INK;

      svg.appendChild(
        svgEl("text", {
          x: 0, y: y + rowH / 2 + 4,
          fill: MUTED, "font-size": 13, "font-family": "Inter, sans-serif",
        }, d.label)
      );
      svg.appendChild(
        svgEl("rect", {
          x: barLeft, y: y + rowH / 2 - 10,
          width: barMax, height: 20, fill: "rgba(255,255,255,0.04)",
        })
      );
      svg.appendChild(
        svgEl("rect", {
          x: barLeft, y: y + rowH / 2 - 10,
          width: w, height: 20, fill: color, opacity: d.highlight ? 0.9 : 0.82,
        })
      );
      svg.appendChild(
        svgEl("text", {
          x: barLeft + barMax + 14, y: y + rowH / 2 + 4,
          fill: INK, "font-size": 13.5,
          "font-family": "'Space Grotesk', Inter, sans-serif", "font-weight": 500,
        }, d.display ?? String(d.value))
      );
    });
    this.appendChild(svg);
  }
}

/* ---------- Line chart ----------
 * data: { "points": [4, 9, 6, 14], "labels": ["Q1","Q2","Q3","Q4"], "unit": "ms" }
 */
class VpLineChart extends VpBase {
  render() {
    const data = parseData(this);
    const points = data?.points;
    if (!points?.length) return;

    const width = 720;
    const height = 240;
    const pad = { top: 22, right: 22, bottom: 34, left: 22 };
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;
    const max = Math.max(...points);
    const min = Math.min(...points, 0);
    const range = max - min || 1;

    const xy = points.map((v, i) => [
      pad.left + (i / (points.length - 1)) * innerW,
      pad.top + innerH - ((v - min) / range) * innerH,
    ]);

    const svg = makeSvg(width, height);

    // horizontal grid lines
    for (let g = 0; g <= 3; g++) {
      const y = pad.top + (g / 3) * innerH;
      svg.appendChild(
        svgEl("line", { x1: pad.left, y1: y, x2: width - pad.right, y2: y, stroke: LINE })
      );
    }

    const linePath = xy.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
    const areaPath = `${linePath} L${xy[xy.length - 1][0]},${pad.top + innerH} L${xy[0][0]},${pad.top + innerH} Z`;

    svg.appendChild(svgEl("path", { d: areaPath, fill: "rgba(240,238,233,0.06)" }));
    svg.appendChild(
      svgEl("path", { d: linePath, fill: "none", stroke: INK, "stroke-width": 1.5 })
    );

    xy.forEach(([x, y], i) => {
      const last = i === xy.length - 1;
      svg.appendChild(
        svgEl("circle", {
          cx: x, cy: y, r: last ? 4 : 2.5,
          fill: last ? GOLD : INK, stroke: "#141414", "stroke-width": 2,
        })
      );
      if (last) {
        svg.appendChild(
          svgEl("text", {
            x: x - 8, y: y - 12, fill: GOLD, "text-anchor": "end", "font-size": 13,
            "font-family": "'Space Grotesk', Inter, sans-serif", "font-weight": 500,
          }, `${points[i]}${data.unit ?? ""}`)
        );
      }
    });

    (data.labels ?? []).forEach((text, i) => {
      if (i >= xy.length) return;
      svg.appendChild(
        svgEl("text", {
          x: xy[i][0], y: height - 10, fill: FAINT, "text-anchor": "middle",
          "font-size": 11, "font-family": "Inter, sans-serif", "letter-spacing": "0.08em",
        }, text.toUpperCase())
      );
    });

    this.appendChild(svg);
  }
}

/* ---------- Donut ----------
 * data: { "value": 80, "max": 100, "display": "80%", "caption": "complete" }
 */
class VpDonut extends VpBase {
  render() {
    const data = parseData(this);
    if (!data || typeof data.value !== "number") return;

    const size = 200;
    const c = size / 2;
    const r = 78;
    const circ = 2 * Math.PI * r;
    const frac = Math.min(Math.max(data.value / (data.max ?? 100), 0), 1);

    const svg = makeSvg(size, size);
    svg.style.maxWidth = "220px";
    svg.style.margin = "0 auto";

    svg.appendChild(
      svgEl("circle", {
        cx: c, cy: c, r, fill: "none", stroke: "rgba(255,255,255,0.07)", "stroke-width": 12,
      })
    );
    svg.appendChild(
      svgEl("circle", {
        cx: c, cy: c, r, fill: "none", stroke: INK, "stroke-width": 12,
        "stroke-dasharray": `${circ * frac} ${circ}`,
        "stroke-linecap": "butt",
        transform: `rotate(-90 ${c} ${c})`,
      })
    );
    svg.appendChild(
      svgEl("text", {
        x: c, y: c + (data.caption ? 2 : 10), "text-anchor": "middle", fill: INK,
        "font-size": 40, "font-family": "'Space Grotesk', Inter, sans-serif", "font-weight": 500,
      }, data.display ?? String(data.value))
    );
    if (data.caption) {
      svg.appendChild(
        svgEl("text", {
          x: c, y: c + 26, "text-anchor": "middle", fill: FAINT,
          "font-size": 11, "font-family": "Inter, sans-serif", "letter-spacing": "0.12em",
        }, data.caption.toUpperCase())
      );
    }
    this.appendChild(svg);
  }
}

/* ---------- Progress track ----------
 * data: { "done": 4, "total": 5, "milestones": ["VM", "Coolify", "DNS", "Ports", "Ship"] }
 */
class VpProgress extends VpBase {
  render() {
    const data = parseData(this);
    if (!data?.total) return;

    const milestones = data.milestones ?? [];
    const n = data.total;
    const width = 720;
    const height = milestones.length ? 84 : 44;
    const pad = 14;
    const innerW = width - pad * 2;
    const y = 30;

    const svg = makeSvg(width, height);
    svg.appendChild(
      svgEl("line", { x1: pad, y1: y, x2: width - pad, y2: y, stroke: LINE, "stroke-width": 2 })
    );
    if (data.done > 0) {
      const doneX = pad + ((data.done - 1) / (n - 1 || 1)) * innerW;
      svg.appendChild(
        svgEl("line", { x1: pad, y1: y, x2: doneX, y2: y, stroke: INK, "stroke-width": 2 })
      );
    }

    for (let i = 0; i < n; i++) {
      const x = pad + (i / (n - 1 || 1)) * innerW;
      const isDone = i < data.done;
      const isNow = i === data.done;
      svg.appendChild(
        svgEl("circle", {
          cx: x, cy: y, r: isNow ? 6 : 4.5,
          fill: isDone ? INK : isNow ? GOLD : "#141414",
          stroke: isDone ? INK : isNow ? GOLD : FAINT,
          "stroke-width": 1.5,
        })
      );
      if (milestones[i]) {
        const textAnchor = i === 0 ? "start" : i === n - 1 ? "end" : "middle";
        svg.appendChild(
          svgEl("text", {
            x, y: y + 34, "text-anchor": textAnchor,
            fill: isNow ? GOLD : isDone ? MUTED : FAINT,
            "font-size": 11, "font-family": "Inter, sans-serif", "letter-spacing": "0.08em",
          }, milestones[i].toUpperCase())
        );
      }
    }
    this.appendChild(svg);
  }
}

/* ---------- Flow diagram ----------
 * data: { "nodes": ["GitHub", "Coolify", "Traefik", "demo URL"], "highlight": 3 }
 */
class VpFlow extends VpBase {
  render() {
    const data = parseData(this);
    const nodes = data?.nodes;
    if (!nodes?.length) return;

    const boxH = 46;
    const gap = 34;
    const charW = 8.2;
    const padX = 18;
    const widths = nodes.map((t) => Math.max(t.length * charW + padX * 2, 76));
    const width = widths.reduce((a, b) => a + b, 0) + gap * (nodes.length - 1);
    const height = boxH + 8;

    const svg = makeSvg(width, height);
    let x = 0;
    nodes.forEach((text, i) => {
      const w = widths[i];
      const isHi = data.highlight === i;
      svg.appendChild(
        svgEl("rect", {
          x: x + 0.5, y: 4.5, width: w - 1, height: boxH - 1,
          fill: isHi ? "rgba(201,179,112,0.08)" : "rgba(255,255,255,0.02)",
          stroke: isHi ? "rgba(201,179,112,0.5)" : "rgba(255,255,255,0.16)",
        })
      );
      svg.appendChild(
        svgEl("text", {
          x: x + w / 2, y: 4 + boxH / 2 + 4.5, "text-anchor": "middle",
          fill: isHi ? GOLD : INK, "font-size": 13.5,
          "font-family": "'Space Grotesk', Inter, sans-serif", "font-weight": 500,
        }, text)
      );
      if (i < nodes.length - 1) {
        const ax = x + w;
        const mid = 4 + boxH / 2;
        svg.appendChild(
          svgEl("line", { x1: ax + 6, y1: mid, x2: ax + gap - 10, y2: mid, stroke: FAINT })
        );
        svg.appendChild(
          svgEl("path", {
            d: `M${ax + gap - 10},${mid - 3.5} L${ax + gap - 4},${mid} L${ax + gap - 10},${mid + 3.5}`,
            fill: "none", stroke: FAINT,
          })
        );
      }
      x += w + gap;
    });

    const wrap = document.createElement("div");
    wrap.className = "vp-scroll";
    wrap.appendChild(svg);
    svg.style.minWidth = `${Math.min(width, 720)}px`;
    svg.style.maxWidth = `${width}px`;
    this.appendChild(wrap);
  }
}

/* ---------- Stack diagram ----------
 * data: [{ "label": "Traefik proxy", "note": "80 / 443", "highlight": true },
 *        { "label": "Coolify", "cols": ["app A", "app B", "app C"] }]
 */
class VpStack extends VpBase {
  render() {
    const data = parseData(this);
    if (!data?.length) return;

    const width = 720;
    const rowH = 56;
    const gapY = 10;
    const height = data.length * (rowH + gapY) - gapY;

    const svg = makeSvg(width, height);
    data.forEach((layer, i) => {
      const y = i * (rowH + gapY);
      const isHi = layer.highlight;

      if (layer.cols?.length) {
        const gapX = 10;
        const colW = (width - gapX * (layer.cols.length - 1)) / layer.cols.length;
        layer.cols.forEach((col, j) => {
          const x = j * (colW + gapX);
          svg.appendChild(
            svgEl("rect", {
              x: x + 0.5, y: y + 0.5, width: colW - 1, height: rowH - 1,
              fill: "rgba(255,255,255,0.02)", stroke: "rgba(255,255,255,0.16)",
            })
          );
          svg.appendChild(
            svgEl("text", {
              x: x + colW / 2, y: y + rowH / 2 + 4.5, "text-anchor": "middle",
              fill: INK, "font-size": 13,
              "font-family": "'Space Grotesk', Inter, sans-serif", "font-weight": 500,
            }, col)
          );
        });
      } else {
        svg.appendChild(
          svgEl("rect", {
            x: 0.5, y: y + 0.5, width: width - 1, height: rowH - 1,
            fill: isHi ? "rgba(201,179,112,0.07)" : "rgba(255,255,255,0.02)",
            stroke: isHi ? "rgba(201,179,112,0.45)" : "rgba(255,255,255,0.16)",
          })
        );
        svg.appendChild(
          svgEl("text", {
            x: 22, y: y + rowH / 2 + 4.5,
            fill: isHi ? GOLD : INK, "font-size": 13.5,
            "font-family": "'Space Grotesk', Inter, sans-serif", "font-weight": 500,
          }, layer.label)
        );
        if (layer.note) {
          svg.appendChild(
            svgEl("text", {
              x: width - 22, y: y + rowH / 2 + 4, "text-anchor": "end",
              fill: FAINT, "font-size": 11, "font-family": "Inter, sans-serif",
              "letter-spacing": "0.1em",
            }, layer.note.toUpperCase())
          );
        }
      }
    });
    this.appendChild(svg);
  }
}

customElements.define("vp-bar-chart", VpBarChart);
customElements.define("vp-line-chart", VpLineChart);
customElements.define("vp-donut", VpDonut);
customElements.define("vp-progress", VpProgress);
customElements.define("vp-flow", VpFlow);
customElements.define("vp-stack", VpStack);
