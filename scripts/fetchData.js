import { promises as fsp, createWriteStream } from 'fs';
import gm from 'gm';
import fetch from 'node-fetch';

// Define your channel names and corresponding categories
const channelCategories = [
    { name: "design-tool-rzfxmnmei8g", category: "Design Tools" },
    { name: "founding-principles", category: "Founding Principals" },
    // Add more channel names and categories as needed
];

async function downloadImage(url, filePath) {
    const response = await fetch(url);
    if (response.status === 200) {
        const imageArrayBuffer = await response.arrayBuffer();
        const imageBuffer = Buffer.from(imageArrayBuffer); // Convert to Buffer
        fsp.writeFile(filePath, imageBuffer); // Write to file
    }
}

async function processAndOptimizeImage(filePath) {
    return new Promise((resolve, reject) => {
        gm(filePath)
            .resize('500')
            .setFormat('webp')
            .quality(20)
            .interlace('Line')
            .antialias(true)
            .colors(10)
            .dither("Bayer")
            .write(filePath, (err) => {
                if (err) {
                    console.error(`${filePath}: Error optimizing image`, err);
                    reject(err);
                } else {
                    console.log(`${filePath}: Image optimization done`);
                    resolve();
                }
            });
    });
}

(async () => {
    try {
        const data = await Promise.all(
            channelCategories.map((channel) =>
                fetch(`https://api.are.na/v2/channels/${channel.name}?per=200`).then((resp) => resp.json())
            )
        );

        const mergedJson = [];

        for (let index = 0; index < data.length; index++) {
            const category = channelCategories[index].category;

            const channelData = data[index].contents;

            for (const element of channelData) {
                element.category = category;

                if (element.image) {
                    const filePath = `cache/images/${element.id}.webp`; // Use WebP format
                    await downloadImage(element.image.display.url, filePath);
                    await processAndOptimizeImage(filePath);
                    console.log(`${filePath}: Image optimization done`);
                }
            }

            mergedJson.push(...channelData);
        }

        // Sort mergedJson by created_at
        mergedJson.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Save data to JSON
        await fsp.writeFile("cache/data.json", JSON.stringify(mergedJson));
    } catch (err) {
        console.error('Error:', err);
    }
})();
