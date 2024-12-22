// Grid Intensity
let ipDataCache = null;

async function getIpData() {
  if (ipDataCache) return ipDataCache;
  const response = await fetch('https://ipinfo.io/json');
  ipDataCache = await response.json();
  return ipDataCache;
}

async function fetchGrid() {
  try {
    const ipData = await getIpData();
    let intensity = null;
    
    if (ipData.country === "GB") {
      const { data } = await (await fetch('https://api.carbonintensity.org.uk/regional')).json();
      const regionData = data[0].regions.find(r => r.shortname === (ipData.region || 'GB')) || data[0].regions[0];
      intensity = regionData.intensity.forecast;
    } else {
      const { carbon_intensity } = await (await fetch(`https://api.thegreenwebfoundation.org/api/v3/ip-to-co2intensity/${ipData.ip}`)).json();
      intensity = carbon_intensity;
    }

    return { intensity, region: ipData.country === "GB" ? "GB" : "N/A" };
  } catch {
    return { intensity: null, region: "N/A" };
  }
}

function getLevel(i) {
  const demandShifter = document.getElementById('demand-shifter');

  if (i === null || i >= 100) {
    if (demandShifter) demandShifter.style.bottom = '0';
  }

  if (i === null || (i >= 100 && i < 200)) return "Moderate";
  if (i < 80) return "Very Low";
  if (i < 100) return "Low";
  if (i < 300) return "High";
  return "Very High";
}

function updateDisplay(i) {
  const strainLevel = getLevel(i);
  document.getElementById('data-strain').innerHTML = strainLevel.toLowerCase();
  document.getElementById('data-grid').innerHTML = `${strainLevel} grid intensity`;
}

async function setupImgs() {
  const { intensity } = await fetchGrid();
  updateDisplay(intensity);

  const imgs = document.querySelectorAll('img[data-src]');
  imgs.forEach(img => {
    const cont = document.createElement('div');
    cont.className = 'image-container';
    cont.style.height = img.getAttribute('height') || '100%';
    cont.style.width = img.getAttribute('width') || '100%';
    img.parentElement.insertBefore(cont, img);
    
    if (intensity > 200 || intensity === null) {
      createPlace(cont, img, img.alt);
    } else {
      showImg(img, cont);
    }
    cont.appendChild(img);
  });

  document.getElementById('show-all').onclick = () => {
    imgs.forEach(img => showImg(img, img.closest('.image-container')));
    document.getElementById('demand-shifter').style.bottom = '-18em';
  };

  document.getElementById('hide-notice').onclick = () => document.getElementById('demand-shifter').style.bottom = '-18em';
}

function createPlace(c, i, t) {
  c.innerHTML = `<h2 class="alt-text">${t}</h2><div class="show-image">Show Image</div>`;
  c.querySelector('.show-image').onclick = () => showImg(i, c);
}

function showImg(i, c) {
  if (!i.src) i.src = i.getAttribute('data-src');
  i.style.display = 'block';
  c.querySelector('.alt-text')?.remove();
  c.querySelector('.show-image')?.remove();
  c.style.border = 'none';
}

function createControlDiv() {
  document.body.innerHTML += `
    <div id="demand-shifter">
      <div id="demand-shifter-body">
        <h2>Low-Impact Mode Activated.</h2>
        <p>The energy grid where you are is under <span id="data-strain"></span> strain. To help, images have been prevented from loading until you choose to view them. You can continue in low-impact mode or revert to the original appearance.</p>
        <button id="hide-notice">Continue</button><button id="show-all">Revert</button>
      </div>
    </div>
  `;
}

createControlDiv();
setupImgs();

// Menu
const header = document.querySelector('header');
let lastScrollY = 0, activeParent = null;

const updateHeader = () => {
  const rect = document.querySelector('section')?.getBoundingClientRect();
  header.style.background = rect?.top <= 500 && rect.bottom > 500 ? '0' : (window.scrollY >= 100 ? 'var(--color-primary)' : '');
  header.style.top = window.scrollY < 100 || window.scrollY < lastScrollY ? '0' : '-7em';

  if (window.scrollY > lastScrollY && activeParent) {
    activeParent.nextElementSibling.style.display = 'none';
    items.forEach(p => p.style.display = 'block');
    back.style.display = 'none';
    activeParent = null;
  }

  lastScrollY = window.scrollY;
};

window.addEventListener('scroll', updateHeader);
updateHeader();

// Nav
document.addEventListener("DOMContentLoaded", () => {
  const title = document.title.replace(/• Overbrowsing/i, '').trim();
  if (title && title !== 'Overbrowsing') {
    document.querySelector('header nav ul')?.append(Object.assign(document.createElement('li'), {
      innerHTML: `<a href="${window.location.href}">${title}</a>`
    }));
  }
});

// Air Quality
const apiKey = '767a7cce68ed2b3098d41e24364ec56c';

const getCSSVariable = (variableName) => {
  const style = getComputedStyle(document.documentElement);
  return style.getPropertyValue(variableName).trim();
};

const capitalise = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const updateFavicon = (color) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const size = 32;
  canvas.width = size;
  canvas.height = size;
  
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, false);
  ctx.fillStyle = color;
  ctx.fill();
  
  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon) {
    favicon.href = canvas.toDataURL();
  } else {
    const newFavicon = document.createElement('link');
    newFavicon.rel = 'icon';
    newFavicon.href = canvas.toDataURL();
    document.head.appendChild(newFavicon);
  }
};

const updateBackground = (aqi, pm25, pm10) => {
  const seaweedRGB = getCSSVariable('--seaweed');
  let [r, g, b] = seaweedRGB.split(',').map(Number);

  r += (pm25 + pm10) * 0.3;
  if (aqi > 3) r = Math.min(255, r + 90);

  const currentHour = new Date().getHours();
  const isNight = currentHour >= 20 || currentHour < 5;

  if (isNight) {
    r = Math.max(0, r - 30);
    g = Math.max(0, g - 30);
    b = Math.max(0, b - 25);
  }

  const rgb = `rgb(${Math.min(255, r)}, ${Math.min(255, g)}, ${Math.min(255, b)})`;

  document.documentElement.style.setProperty('--color-primary', rgb);  
  updateFavicon(rgb);
};

const getAirQualityLabel = (aqi) => {
  const labels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
  return labels[aqi - 1] || 'Unknown';
};

const updateAirQuality = async () => {
  try {
    const ipData = await getIpData();
    const [lat, lon] = ipData.loc.split(',');

    const airResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    const airData = await airResponse.json();

    const aqi = airData.list[0].main.aqi;
    const pm25 = airData.list[0].components['pm2_5'];
    const pm10 = airData.list[0].components['pm10'];

    updateBackground(aqi, pm25, pm10);

    const airQualityDiv = document.getElementById('data-aq');
    airQualityDiv.innerHTML = `${getAirQualityLabel(aqi)} air quality`;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

updateAirQuality();

// Image Size
const imageSize = document.getElementById('data-image');
imageSize.style.display = 'none';
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('mouseover', async () => {
    const size = (await fetch(img.src).then(res => res.blob())).size / 1024;
    imageSize.textContent = `${size.toFixed(2)} KB`;
    imageSize.style.display = 'inline-flex';
  });
  img.addEventListener('mouseout', () => (imageSize.style.display = 'none'));
});

// Beacon
(async () => {
  const { rating, co2 } = await (await fetch(`https://digitalbeacon.co/badge?url=${encodeURIComponent(window.location.href)}`)).json();
  document.getElementById('data-co2').innerHTML = `${rating.toUpperCase()} ${parseFloat(co2).toFixed(3)}g CO₂`;
})();

// References
document.addEventListener("DOMContentLoaded", () => {
  const links = [...document.querySelectorAll('main a[target="_blank"]:not(.button)')];
  if (links.length) {
    let refs = '';
    links.forEach((link, i) => {
      link.id = `ref-${i + 1}`;
      const sup = document.createElement('sup');
      sup.textContent = `${i + 1}`;
      link.appendChild(sup);
      link.addEventListener('click', e => {
        e.preventDefault();
        document.querySelector('#references').scrollIntoView({ behavior: 'smooth' });
      });
      const linkText = link.cloneNode(true);
      linkText.querySelector('sup')?.remove();
      refs += `<li><a href="#ref-${i + 1}" class="ref-link">${linkText.textContent.trim()}</a> • <a href="${link.href}" target="_blank">${link.href}</a></li>`;
    });
    
    const referencesSection = document.createElement('div');
    referencesSection.id = 'references';
    referencesSection.innerHTML = `<ol>${refs}</ol>`;
    
    const footer = document.querySelector('footer');
    footer.parentNode.insertBefore(referencesSection, footer.nextSibling);
    
    document.querySelectorAll('.ref-link').forEach((refLink, i) => {
      refLink.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector(`#ref-${i + 1}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }
});

// Sections
document.querySelectorAll('section').forEach(s => s.insertAdjacentHTML('afterend', '<hr>'));