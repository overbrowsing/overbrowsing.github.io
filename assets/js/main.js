/* ------------------- Grid-aware mode ------------------- */

let ipData;

const getIntensity = async () => {
  try {
    ipData ||= await fetch("https://ipinfo.io/json").then(r => r.json());

    const { country, region, ip } = ipData;

    if (country === "GB") {
      const res = await fetch("https://api.carbonintensity.org.uk/regional")
        .then(r => r.json());

      const regions = res.data[0].regions;
      const match =
        regions.find(r => r.shortname === (region || "GB")) || regions[0];

      return match.intensity.forecast;
    }

    const res = await fetch(
      `https://api.thegreenwebfoundation.org/api/v3/ip-to-co2intensity/${ip}`
    ).then(r => r.json());

    return res.carbon_intensity;

  } catch {
    return 300;
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

const renderIntensity = intensity => {
  document.getElementById("data-grid").textContent =
    `${getLabel(intensity)} local grid intensity`;

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
  const intensity = await getIntensity();

  renderIntensity(intensity);

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

const getSize = async url => {
  const res = await fetch(url, { method: "HEAD" });
  const bytes = res.headers.get("Content-Length");

  cache.set(
    url,
    bytes ? `${(bytes / 1024).toFixed(2)} KB` : "N/A"
  );
};

if (!("ontouchstart" in window)) {
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
      display.style.display = "none";
      return;
    }

    const url =
      img.src ||
      getComputedStyle(img).backgroundImage.slice(5, -2).replace(/"/g, "");

    if (!cache.has(url)) getSize(url);

    display.textContent = cache.get(url);
    display.style.display = "inline-block";
  });

  document.addEventListener("mouseout", () => {
    display.style.display = "none";
  });
}

/* ------------------- Emissions (Beacon) ------------------- */

(async () => {
  const response = await fetch(
    `https://digitalbeacon.co/badge?url=${encodeURIComponent(location.href)}`
  );

  const { url, co2 } = await response.json();
  
  const value = Number(co2).toFixed(3);

  document.getElementById("data-co2").innerHTML =
    `<a href="${url}" target="_blank">${value}g CO₂e</a>`;
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
    link.insertAdjacentHTML("beforeend", `<sup>${i + 1}</sup>`);

    link.onclick = e => {
      e.preventDefault();
      document
        .querySelector("#references")
        .scrollIntoView({ behavior: "smooth" });
    };
  });

  const html = links
    .map(link => {
      const clean = link.href.replace(/^https?:\/\//, "");
      return `<li><a href="${link.href}" target="_blank">${clean}</a></li>`;
    })
    .join("");

  document
    .querySelector("footer")
    .insertAdjacentHTML("afterend", `<div id="references"><ol>${html}</ol></div>`);
});