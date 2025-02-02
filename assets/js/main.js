// Demand Shifter
let ipDataCache = null;

async function getIpData() {
  if (ipDataCache) return ipDataCache;
  const response = await fetch('https://ipinfo.io/json');
  return ipDataCache = await response.json();
}

async function fetchGrid() {
  try {
    const { country, region, ip } = await getIpData();
    let intensity = null;

    if (country === "GB") {
      const { data } = await fetch('https://api.carbonintensity.org.uk/regional').then(res => res.json());
      const regionData = data[0].regions.find(r => r.shortname === (region || 'GB')) || data[0].regions[0];
      intensity = regionData.intensity.forecast;
    } else {
      const { carbon_intensity } = await fetch(`https://api.thegreenwebfoundation.org/api/v3/ip-to-co2intensity/${ip}`).then(res => res.json());
      intensity = carbon_intensity;
    }

    return { intensity, region: country === "GB" ? "GB" : "N/A" };
  } catch {
    return { intensity: null, region: "N/A" };
  }
}

function getLevel(i) {
  const demandShifter = document.getElementById('demand-shifter');
  if (i === null || i >= 100) demandShifter?.style.setProperty('bottom', window.innerWidth <= 650 ? '0' : '1em');
  
  if (i === null || (i >= 100 && i < 200)) return "Moderate";
  if (i < 100) return "Low";
  if (i < 300) return "High";
  return "Very High";
}

function updateDisplay(i) {
  document.getElementById('data-grid').innerHTML = `${getLevel(i)} grid intensity`;
}

async function setupImgs() {
  const { intensity } = await fetchGrid();
  updateDisplay(intensity);

  document.querySelectorAll('img[data-src]').forEach(img => {
    const cont = document.createElement('div');
    cont.className = 'image-container';
    cont.style.cssText = `height:${img.getAttribute('height') || '100%'}; width:${img.getAttribute('width') || '100%'}`;
    img.parentElement.insertBefore(cont, img);

    if (intensity < 100) showImg(img, cont);
    cont.appendChild(img);
  });

  document.getElementById('show-all').onclick = () => {
    document.querySelectorAll('img[data-src]').forEach(img => showImg(img, img.closest('.image-container')));
    document.getElementById('demand-shifter').style.bottom = 'calc(-42px + -1em)';
  };

  document.getElementById('hide-notice').onclick = () => {
    document.getElementById('demand-shifter').style.bottom = 'calc(-42px + -1em)';
  };
}

function showImg(i, c) {
  if (!i.src) i.src = i.getAttribute('data-src');
  i.style.display = 'block';
}

function createControlDiv() {
  document.body.innerHTML += `
    <div id="demand-shifter">
      <a href="/projects/website"><span>●</span> Low-impact mode active.</a>
      <div id="demand-shifter-controls">
        <button id="hide-notice">Continue</button>
        <button id="show-all">Revert</button>
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
  const scrollY = window.scrollY;
  header.style.background = scrollY >= 80 ? 'var(--color-primary)' : '';
  header.style.top = scrollY < lastScrollY || scrollY < 50 ? '0' : '-85px';

  if (scrollY > lastScrollY && activeParent) {
    const nextSibling = activeParent?.nextElementSibling;
    if (nextSibling) nextSibling.style.display = 'none';
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
  if (title && title !== 'Overbrowsing') {
    document.querySelector('header nav ul')?.append(Object.assign(document.createElement('li'), {
      innerHTML: `<a href="${window.location.href}">${title}</a>`
    }));
  }
});

// Air Quality
const apiKey = '767a7cce68ed2b3098d41e24364ec56c';

const getCSSVariable = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const updateFavicon = (color) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.height = 32;
  ctx.beginPath();
  ctx.arc(16, 16, 16, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
  favicon.rel = 'icon';
  favicon.href = canvas.toDataURL();
  document.head.appendChild(favicon);
};

const updateBackground = (aqi, pm25, pm10) => {
  let [r, g, b] = getCSSVariable('--seaweed').split(',').map(Number);
  r += (pm25 + pm10) * 0.7;
  if (aqi > 3) r = Math.min(255, r + 10);

  const isNight = new Date().getHours() >= 19 || new Date().getHours() < 5;
  if (isNight) [r, g, b] = [r - 30, g - 30, b - 25].map(val => Math.max(0, val));

  const rgb = `rgb(${Math.min(255, r)}, ${Math.min(255, g)}, ${Math.min(255, b)})`;
  document.documentElement.style.setProperty('--color-primary', rgb);
  updateFavicon(rgb);
};

const getAirQualityLabel = (aqi) => {
  const labels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
  return labels[aqi - 1] || 'Unknown';
};

const createParticles = (pm25, pm10) => {
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  Object.assign(canvas.style, {
    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '999'
  });
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const totalParticles = Math.round(pm25 * 2 + pm10 * 2);

  for (let i = 0; i < totalParticles; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 1,
      speedX: Math.random() * 0.5 - 0.25,
      speedY: Math.random() * 0.5 - 0.25
    });
  }

  const animateParticles = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
      if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255)';
      ctx.fill();
    });

    requestAnimationFrame(animateParticles);
  };

  animateParticles();
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
    createParticles(pm25, pm10);

    const airQualityDiv = document.getElementById('data-aq');
    airQualityDiv.innerHTML = `${getAirQualityLabel(aqi)} air quality`;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

updateAirQuality();

// Image Size
const imageSize = document.getElementById('data-image');
const fetchedImages = new Map();

const fetchSize = async url => {
  const size = (await fetch(url, { method: 'HEAD' })).headers.get('Content-Length');
  fetchedImages.set(url, size ? `${(size / 1024).toFixed(2)} KB` : 'N/A');
};

if (!('ontouchstart' in window)) {
  document.addEventListener('mousemove', e => {
    const target = [...document.querySelectorAll('img')].find(el =>
      e.clientX >= el.getBoundingClientRect().left && e.clientX <= el.getBoundingClientRect().right &&
      e.clientY >= el.getBoundingClientRect().top && e.clientY <= el.getBoundingClientRect().bottom
    );

    if (target) {
      const imageUrl = target.src || window.getComputedStyle(target).backgroundImage.slice(5, -2).replace(/"/g, '');
      if (!fetchedImages.has(imageUrl)) fetchSize(imageUrl);
      imageSize.textContent = fetchedImages.get(imageUrl);
      imageSize.style.display = 'inline-block';
    } else {
      imageSize.style.display = 'none';
    }
  });

  document.addEventListener('mouseout', () => imageSize.style.display = 'none');
}

// Beacon
(async () => {
  const { url, co2 } = await (await fetch(`https://digitalbeacon.co/badge?url=${encodeURIComponent(window.location.href)}`)).json();
  document.getElementById('data-co2').innerHTML = `<a href="${url}" target="_blank">${parseFloat(co2).toFixed(3)}g CO₂e</a>`;
})();

// References
document.addEventListener("DOMContentLoaded", () => {
  const links = [...document.querySelectorAll('main a[target="_blank"]:not(.button):not([exclude])')];
  if (links.length) {
    const refs = links.map((link, i) => {
      const sup = document.createElement('sup');
      sup.textContent = `${i + 1}`;
      link.appendChild(sup);
      link.addEventListener('click', e => {
        e.preventDefault();
        document.querySelector('#references').scrollIntoView({ behavior: 'smooth' });
      });
      const url = link.href.replace(/^https?:\/\//, '');
      return `<li><a href="${link.href}" target="_blank">${url}</a></li>`;
    }).join('');
    
    const referencesSection = document.createElement('div');
    referencesSection.id = 'references';
    referencesSection.innerHTML = `<ol>${refs}</ol>`;
    document.querySelector('footer').insertAdjacentElement('afterend', referencesSection);
  }
});

// Sections
document.querySelectorAll('section').forEach(s => s.insertAdjacentHTML('afterend', '<hr>'));

// Close Tab
let originalTitle = document.title, message = 'Close this tab to save energy.';
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    let i = setInterval(() => { document.title = document.title === originalTitle ? message : originalTitle; }, 3000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) clearInterval(i); });
  }
});