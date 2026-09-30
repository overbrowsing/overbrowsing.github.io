/* ------------------- Grid-aware mode ------------------- */

let ipData;

const fetchJSON = async (url, ms = 6000) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
};

const setText = (id, text) => {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
};

setText("data-grid", "N/A");
setText("data-co2", "N/A");

const getIntensity = async () => {
  try {
    ipData ||= await fetchJSON("https://ipinfo.io/json");

    const { country, region, ip } = ipData;

    if (country === "GB") {
      const res = await fetchJSON("https://api.carbonintensity.org.uk/regional");

      const regions = res.data[0].regions;
      const match =
        regions.find(r => r.shortname === (region || "GB")) || regions[0];

      const value = Number(match.intensity.forecast);
      return Number.isFinite(value) ? value : null;
    }

    const res = await fetchJSON(
      `https://api.thegreenwebfoundation.org/api/v3/ip-to-co2intensity/${ip}`
    );

    const value = Number(res.carbon_intensity);
    return Number.isFinite(value) ? value : null;

  } catch {
    return null;
  }
};

const getLabel = intensity => {
  if (intensity < 100) return "Low";
  if (intensity < 200) return "Moderate";
  if (intensity < 300) return "High";
  return "Very high";
};

const setBannerPosition = intensity => {
  const el = document.getElementById("grid-aware-mode");

  if (!el) return;

  el.style.bottom =
    intensity >= 100
      ? (innerWidth <= 650 ? "0" : "1em")
      : "";
};

const renderIntensity = (intensity, known = true) => {
  setText(
    "data-grid",
    known ? `${getLabel(intensity)} local grid intensity` : "Grid intensity unavailable"
  );

  if (intensity >= 100) {
    document.documentElement.style.setProperty(
      "--color-primary",
      "hsl(23 14% 27%)"
    );
  }

  setBannerPosition(intensity);
};

const revealImage = img => {
  if (!img.src) img.src = img.dataset.src;
  img.style.display = "block";
};

const setupImages = (intensity, reducedDataMode) => {
  document.querySelectorAll("img[data-src]").forEach(img => {
    const container = document.createElement("div");
    container.className = "image-container";

    container.style.height = img.height || "100%";
    container.style.width = img.width || "100%";

    img.before(container);
    container.append(img);

    const allowLoad = intensity < 100 && !reducedDataMode;

    if (allowLoad) revealImage(img);
  });
};

const setupControls = () => {
  const hide = () =>
    (document.getElementById("grid-aware-mode").style.bottom =
      "calc(-40px - 1em)");

  document.getElementById("continue").onclick = hide;

  document.getElementById("revert").onclick = () => {
    document.querySelectorAll("img[data-src]").forEach(revealImage);
    hide();
  };
};

const init = async () => {
  const measured = await getIntensity();
  const known = measured !== null;
  const intensity = known ? measured : 300;

  renderIntensity(intensity, known);

  const reducedDataMode = matchMedia(
    "(prefers-reduced-data: reduce)"
  ).matches;

  setupImages(intensity, reducedDataMode);
  setupControls();
};

document.body.insertAdjacentHTML(
  "beforeend",
  `<div id="grid-aware-mode">
    <a href="/projects/website#:~:text=Grid-aware%20mode">Grid-aware mode active</a>
    <div id="grid-aware-mode-controls">
      <button id="continue">Continue</button>
      <button id="revert">Revert</button>
    </div>
  </div>`
);

init();

/* ------------------- Navigation ------------------- */

const header = document.querySelector("header");
header.style.position = "fixed";

let lastY = 0;
let activeParent = null;

const updateHeader = () => {
  const y = scrollY;

  header.style.background = y >= 80 ? "var(--color-primary)" : "";
  header.style.top = y < lastY || y < 50 ? "0" : "-80px";

  if (y > lastY && activeParent) {
    const next = activeParent.nextElementSibling;
    if (next) next.style.display = "none";

    if (typeof items !== "undefined") {
      items.forEach(i => (i.style.display = "block"));
    }

    if (typeof back !== "undefined") {
      back.style.display = "none";
    }

    activeParent = null;
  }

  lastY = y;
};

addEventListener("scroll", updateHeader);
updateHeader();

/* ------------------- Breadcrumbs ------------------- */

document.addEventListener("DOMContentLoaded", () => {
  const title = document.title.replace(/• Overbrowsing/i, "").trim();

  if (!title || title === "Overbrowsing") return;

  const link = document.createElement("li");
  link.innerHTML = `<a href="${location.href}">${title}</a>`;

  document.querySelector("header nav ul")?.append(link);
});

/* ------------------- Image size ------------------- */

const display = document.getElementById("data-image");
const cache = new Map();

let hoveredUrl = null;

const getSize = async url => {
  cache.set(url, "…");
  try {
    const res = await fetch(url, { method: "HEAD" });
    const bytes = res.headers.get("Content-Length");
    cache.set(url, bytes ? `${(bytes / 1024).toFixed(2)} KB` : "N/A");
  } catch {
    cache.set(url, "N/A");
  }
  if (display && hoveredUrl === url) display.textContent = cache.get(url);
};

if (display && !("ontouchstart" in window)) {
  document.addEventListener("mousemove", e => {
    const img = [...document.querySelectorAll("img")].find(i => {
      const r = i.getBoundingClientRect();
      return (
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom
      );
    });

    if (!img) {
      hoveredUrl = null;
      display.style.display = "none";
      return;
    }

    const url =
      img.src ||
      getComputedStyle(img).backgroundImage.slice(5, -2).replace(/"/g, "");

    if (!url) return;

    hoveredUrl = url;
    if (!cache.has(url)) getSize(url);

    display.textContent = cache.get(url) || "…";
    display.style.display = "inline-block";
  });

  document.addEventListener("mouseout", () => {
    hoveredUrl = null;
    display.style.display = "none";
  });
}

/* ------------------- Emissions (Beacon) ------------------- */

(async () => {
  const apiUrl = `https://digitalbeacon.co/badge?url=${encodeURIComponent(window.location.href)}`;

  const el = document.getElementById("data-co2");
  if (!el) return;

  try {
    const { url, co2 } = await fetchJSON(apiUrl, 10000);
    const value = parseFloat(co2);
    if (!Number.isFinite(value)) throw new Error("No CO2 value");

    const link = document.createElement("a");
    link.href = url || "https://digitalbeacon.co";
    link.target = "_blank";
    link.textContent = `${value.toFixed(3)}g CO₂e`;
    el.replaceChildren(link);
  } catch {
    el.textContent = "CO₂e unavailable";
  }
})();

/* ------------------- References ------------------- */

document.addEventListener("DOMContentLoaded", () => {
  const links = [
    ...document.querySelectorAll(
      'main a[target="_blank"]:not(.button):not([exclude])'
    )
  ];

  if (!links.length) return;

  links.forEach((link, i) => {
    link.id = `ref-${i + 1}`;
    link.insertAdjacentHTML("beforeend", `<sup>${i + 1}</sup>`);

    link.onclick = e => {
      e.preventDefault();
      document
        .querySelector("#references")
        .scrollIntoView({ behavior: "smooth" });
    };
  });

  const html = links
    .map((link, i) => {
      const clean = link.href.replace(/^https?:\/\//, "").replace(/\/$/, "");
      return `<li><a href="#ref-${i + 1}" class="ref-back">${i + 1}.</a> <a href="${link.href}" target="_blank">${clean}</a></li>`;
    })
    .join("");

  document
    .querySelector("footer")
    .insertAdjacentHTML("afterend", `<div id="references"><ol>${html}</ol></div>`);

  document.querySelectorAll("#references .ref-back").forEach(back => {
    back.onclick = e => {
      e.preventDefault();
      document
        .querySelector(back.getAttribute("href"))
        .scrollIntoView({ behavior: "smooth", block: "center" });
    };
  });
});