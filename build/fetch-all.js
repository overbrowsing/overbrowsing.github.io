/* 
This file pulls in data from all are.na channels, downloads and compresses the images and saves the data to _site/data/data.json and images under _site/images/
It also calls the OpenWeather API and the WebsiteCarbon api and saves the data in _site/data/
*/

import { promises as fsp, existsSync } from 'fs';
import fetch from 'node-fetch';
import sharp from 'sharp';
import path from 'path';

const channelCategories = [
  { name: "principles-sfqb0jsjmws", category: "Principals" },
  { name: "development-2jvozc0jhuo", category: "Development" },
  { name: "how-to-help", category: "How to help" },
  { name: "what-to-know", category: "What to know" },
  { name: "design-y5g0saengtu", category: "Design"},
  // Add more channel names and categories as needed
];

async function downloadImage(url, filePath, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.status === 200) {
        const imageArrayBuffer = await response.arrayBuffer();
        const imageBuffer = Buffer.from(imageArrayBuffer);
        await fsp.writeFile(filePath, imageBuffer);
        return; // Exit the loop if successful
      } else {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
    } catch (error) {
      if (i < retries - 1) {
        console.log(`Retrying to download image (${i + 1}/${retries})...`);
      } else {
        console.error(`Failed to download image after ${retries} attempts:`, error);
        throw error; // Re-throw the error after exhausting retries
      }
    }
  }
}

async function processAndOptimizeImage(inputFilePath, outputFilePath) {
  await sharp(inputFilePath)
    .resize(450) // Adjust dimensions as needed
    .toFormat('png')
    .png({
      dither: 0,
      colors: 3, // change back to three for higher quality
      quality: 1,
    })
    .toFile(outputFilePath);
}

async function processChannel(channel) {
  const data = await fetch(`https://api.are.na/v2/channels/${channel.name}?per=200`).then(resp => resp.json());
  const category = channel.category;

  const imagesDir = '_site/images';
  await fsp.mkdir(imagesDir, { recursive: true });

  const mergedJson = [];

  await Promise.all(data.contents.map(async element => {
    const reducedData = {
      title: element.title,
      content: element.content,
      contents: element.contents,
      id: element.id,
      image: element.image,
      date: element.updated_at,
      category,
    };

    if (element.source) {
      reducedData.source = {
        url: element.source.url,
        title: element.source.title,
        provider: element.source.provider,
      };
    }

    if (element.image) {
      const inputFilePath = path.join(imagesDir, `${element.id}.png`);
      const tempOutputFilePath = path.join('_site/temp', `${element.id}.png`);

      await downloadImage(element.image.display.url, inputFilePath);
      await processAndOptimizeImage(inputFilePath, tempOutputFilePath);

      await fsp.rename(tempOutputFilePath, inputFilePath);
    }

    if (element.base_class === 'Channel') {
      // Make a new API call for the child channel
      const childChannelData = await fetch(`https://api.are.na/v2/channels/${element.slug}/contents?per=200`).then(resp => resp.json());
      // If the parent element is found, add the contents to its "contents"

      // Handle images for child channel contents
      await Promise.all(childChannelData.contents.map(async (content) => {
        if (content.image) {
          const contentInputFilePath = path.join(imagesDir, `${content.id}.png`);
          const contentTempOutputFilePath = path.join('_site/temp', `${content.id}.png`);

          await downloadImage(content.image.display.url, contentInputFilePath);
          await processAndOptimizeImage(contentInputFilePath, contentTempOutputFilePath);

          await fsp.rename(contentTempOutputFilePath, contentInputFilePath);
        }
      }));
      reducedData.contents = childChannelData.contents
    }
    
    // Add the reduced data to the merged JSON
    mergedJson.push(reducedData);
  }));

  return mergedJson;
}

async function compressAndSave() {
  try {

    if (existsSync('_site/images')) {
      await fsp.rm('_site/images', { recursive: true });
    }

    await fsp.mkdir('_site/temp', { recursive: true });

    const data = await Promise.all(channelCategories.map(processChannel));

    const mergedJson = data.flat().sort((a, b) => new Date(b.date) - new Date(a.date));

    await fsp.writeFile("_site/data/data.json", JSON.stringify(mergedJson));
    
    // Delete the temporary folder
    await fsp.rm('_site/temp', { recursive: true });

    console.log("Images Downloaded");
  } catch (err) {
    console.error('Error:', err);
  }
}

async function fetchAqiAndSave() {
  try {
    const [aqi, moonPhase] = await Promise.all([getAirQualityData(), getMoonPhase()]);

    const aqiValue = aqi.list[0].main.aqi;
    const airQualityDescription = getAirQualityDescription(aqiValue);
    const backgroundColor = calculateBackgroundColor(aqiValue);

    const data = {
      aqiValue,
      airQualityDescription,
      backgroundColor,
      moonPhase, // Add moon phase to the data
    };

    // Save data to a JSON file
    saveToJson(data);
  } catch (error) {
    console.error('Error fetching or processing data:', error);
  }
}

async function getMoonPhase() {
  try {
    const response = await fetch('https://api.openweathermap.org/data/2.5/onecall?lat=51.5073219&lon=-0.1276474&exclude=minutely&appid=a767027338c3e647bc664f0b09493eb2');
    const data = await response.json();
    const moonPhaseEmoji = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'][Math.floor(data.daily[0].moon_phase * 8)] || '🌎';
    return moonPhaseEmoji;
  } catch (error) {
    console.error('Error fetching moon phase:', error);
    throw error;
  }
}

async function getAirQualityData() {
  const response = await fetch(
    "https://api.openweathermap.org/data/2.5/air_pollution?lat=51.5073219&lon=-0.1276474&appid=a767027338c3e647bc664f0b09493eb2"
  );
  return response.json();
}

// Assigns AQI numerical value to qualitative value
function getAirQualityDescription(aqiValue) {
  const airQualityTable = {
    "1": "good",
    "2": "fair",
    "3": "moderate",
    "4": "poor",
    "5": "very poor",
  };
  return airQualityTable[aqiValue];
}

// Calculates a change of the background color to a red tone on bad AQI days
function calculateBackgroundColor(aqiValue) {
  let redness = 27;

  if (aqiValue > 2) {
    redness = Math.round(27 + (aqiValue - 1) * 5.4);
  }

  return `#${redness}2a24`;
}

// Save data to a JSON file
function saveToJson(data) {
  const json = JSON.stringify(data, null, 2);
  fsp.writeFile('_site/data/aqi-data.json', json, 'utf8');
}




compressAndSave()
fetchAqiAndSave();

