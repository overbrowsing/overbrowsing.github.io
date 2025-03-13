// Demand Shifter

let ipDataCache = null;

const getIpData = async () => ipDataCache ??= await (await fetch('https://ipinfo.io/json')).json();

const fetchGrid = async () => {
  try {
    let { country, region, ip } = await getIpData(), intensity;
    if (country === "GB") {
      let { data } = await (await fetch('https://api.carbonintensity.org.uk/regional')).json();
      intensity = (data[0].regions.find(r => r.shortname === (region || 'GB')) || data[0].regions[0]).intensity.forecast;
    } else {
      let { carbon_intensity } = await (await fetch(`https://api.thegreenwebfoundation.org/api/v3/ip-to-co2intensity/${ip}`)).json();
      intensity = carbon_intensity;
    }
    return { intensity, region: country === "GB" ? "GB" : "N/A" };
  } catch {
    return { intensity: null, region: "N/A" };
  }
};

const getLevel = i => (document.getElementById('demand-shifter')?.style.setProperty('bottom', i === null || i >= 100 ? (innerWidth <= 650 ? '0' : '1em') : ''), 
  i === null || i >= 100 && i < 200 ? "Moderate" : i < 100 ? "Low" : i < 300 ? "High" : "Very High");

const updateDisplay = i => document.getElementById('data-grid').textContent = `${getLevel(i)} grid intensity`;

const showImg = (i, c) => (!i.src && (i.src = i.dataset.src), i.style.display = 'block');

const prefersReducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches;

const setupImgs = async () => {
  let { intensity } = await fetchGrid();
  updateDisplay(intensity);
  document.querySelectorAll('img[data-src]').forEach(img => {
    let cont = Object.assign(document.createElement('div'), { className: 'image-container', style: `height:${img.height || '100%'}; width:${img.width || '100%'}` });
    img.parentElement.insertBefore(cont, img);
    if (intensity < 100 && !prefersReducedData) showImg(img, cont);
    cont.append(img);
  });

  document.getElementById('show-all').onclick = () => {
    document.querySelectorAll('img[data-src]').forEach(img => showImg(img, img.closest('.image-container')));
    document.getElementById('demand-shifter').style.bottom = 'calc(-42px + -1em)';
  };

  document.getElementById('hide-notice').onclick = () => document.getElementById('demand-shifter').style.bottom = 'calc(-42px + -1em)';
};

document.body.innerHTML += `
  <div id="demand-shifter">
    <a href="/projects/website#:~:text=low-impact%20mode">Low-impact mode active</a>
    <div id="demand-shifter-controls">
      <button id="hide-notice">Continue</button>
      <button id="show-all">Revert</button>
    </div>
  </div>
`;

setupImgs();

// Menu

const header = document.querySelector('header');
header.style.position = 'fixed';
let lastScrollY = 0, activeParent = null;

const updateHeader = () => {
  const scrollY = window.scrollY;
  header.style.background = scrollY >= 80 ? 'var(--color-primary)' : '';
  header.style.top = (scrollY < lastScrollY || scrollY < 50) ? '0' : '-85px';

  if (scrollY > lastScrollY && activeParent) {
    const next = activeParent?.nextElementSibling;
    if (next) next.style.display = 'none';
    items.forEach(p => p.style.display = 'block');
    back.style.display = 'none';
    activeParent = null;
  }

  lastScrollY = scrollY;
};

window.addEventListener('scroll', updateHeader);
updateHeader();

// Nav

document.addEventListener("DOMContentLoaded", () => {
  const title = document.title.replace(/• Overbrowsing/i, '').trim();
  if (title && title !== 'Overbrowsing')  
    document.querySelector('header nav ul')?.append(Object.assign(document.createElement('li'), { innerHTML: `<a href="${location.href}">${title}</a>` }));
});

// Air Quality

const apiKey = '767a7cce68ed2b3098d41e24364ec56c'

const getVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

const updateFavicon = color => {
  let canvas = Object.assign(document.createElement('canvas'), { width: 32, height: 32 }), ctx = canvas.getContext('2d');
  ctx.arc(16, 16, 16, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
  let favicon = document.querySelector('link[rel="icon"]') || Object.assign(document.createElement('link'), { rel: 'icon' });
  favicon.href = canvas.toDataURL(); document.head.appendChild(favicon);
};

const updateBackground = (aqi, pm25, pm10) => {
  let [r, g, b] = getVar('--seaweed').split(',').map(Number);
  r = Math.min(255, r + (pm25 + pm10) * 0.7 + (aqi > 3 ? 10 : 0));
  if (new Date().getHours() >= 19 || new Date().getHours() < 5) [r, g, b] = [r - 30, g - 30, b - 25].map(v => Math.max(0, v));
  document.documentElement.style.setProperty('--color-primary', `rgb(${r}, ${g}, ${b})`);
  updateFavicon(`rgb(${r}, ${g}, ${b})`);
};

const getAirQualityLabel = aqi => ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'][aqi - 1] || 'Unknown';

const updateAirQuality = async () => {
  try {
    let { loc } = await getIpData(), [lat, lon] = loc.split(','), airData = await (await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`)).json();
    let { aqi } = airData.list[0].main, { pm2_5, pm10 } = airData.list[0].components;
    updateBackground(aqi, pm2_5, pm10);
    document.getElementById('data-aq').textContent = `${getAirQualityLabel(aqi)} air quality`;
  } catch (error) {
    console.error('Error:', error);
  }
};

updateAirQuality();

// Image Size

const imageSizeDisplay = document.getElementById('data-image'), cachedImageSizes = new Map();

const getImageSize = async url => {
  const res = await fetch(url, { method: 'HEAD' });
  cachedImageSizes.set(url, res.headers.get('Content-Length') ? `${(res.headers.get('Content-Length') / 1024).toFixed(2)} KB` : 'N/A');
};

if (!('ontouchstart' in window)) {
  document.addEventListener('mousemove', e => {
    const hoveredImage = [...document.querySelectorAll('img')].find(img => {
      let r = img.getBoundingClientRect();
      return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    });

    if (hoveredImage) {
      let url = hoveredImage.src || getComputedStyle(hoveredImage).backgroundImage.slice(5, -2).replace(/"/g, '');
      if (!cachedImageSizes.has(url)) getImageSize(url);
      imageSizeDisplay.textContent = cachedImageSizes.get(url);
      imageSizeDisplay.style.display = 'inline-block';
    } else imageSizeDisplay.style.display = 'none';
  });

  document.addEventListener('mouseout', () => imageSizeDisplay.style.display = 'none');
}

// Beacon

(async () => {
  const { url, co2 } = await (await fetch(`https://digitalbeacon.co/badge?url=${encodeURIComponent(window.location.href)}`)).json();
  document.getElementById('data-co2').innerHTML = `<a href="${url}" target="_blank">${parseFloat(co2).toFixed(3)}g CO₂e</a>`;
})();

// References

document.addEventListener("DOMContentLoaded", () => {
  const links = [...document.querySelectorAll('main a[target="_blank"]:not(.button):not([exclude])')];
  if (!links.length) return;
  document.querySelector('footer').insertAdjacentHTML('afterend', `<div id="references"><ol>${links.map((link, i) => {
    link.insertAdjacentHTML('beforeend', `<sup>${i + 1}</sup>`);
    link.onclick = e => (e.preventDefault(), document.querySelector('#references').scrollIntoView({ behavior: 'smooth' }));
    return `<li><a href="${link.href}" target="_blank">${link.href.replace(/^https?:\/\//, '')}</a></li>`;
  }).join('')}</ol></div>`);
});

// Close Tab

let originalTitle = document.title, message = 'Close this tab to save energy.', blink;
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) return clearInterval(blink);
  blink = setInterval(() => document.title = document.title === originalTitle ? message : originalTitle, 3000);
});