import { promises as fsp, existsSync } from 'fs';
import fetch from 'node-fetch';
import sharp from 'sharp';
import path from 'path';

const channelCategories = [
    { name: "design-tool-rzfxmnmei8g", category: "Design Tools" },
    { name: "founding-principles", category: "Founding Principals" },
    // Add more channel names and categories as needed
];

async function downloadImage(url, filePath) {
    const response = await fetch(url);
    if (response.status === 200) {
        const imageArrayBuffer = await response.arrayBuffer();
        const imageBuffer = Buffer.from(imageArrayBuffer);
        await fsp.writeFile(filePath, imageBuffer);
    }
}

async function processAndOptimizeImage(inputFilePath, outputFilePath) {
    await sharp(inputFilePath)
        .resize(400) // Adjust dimensions as needed
        .toFormat('png')
        .png({
        dither: .9, // Enable dithering
        palette: true, // Create a color palette for dithering
        colors: 3,
        quality: 10,  // Adjust quality level as needed
        })
        .toFile(outputFilePath);

    console.log(`${outputFilePath}: Image optimization done`);
}

(async () => {
    try {
        const imagesDir = 'cache/images';
        const tempDir = 'cache/temp';

        if (existsSync(imagesDir)) {
            await fsp.rm(imagesDir, { recursive: true });
        }

        await fsp.mkdir(imagesDir, { recursive: true });
        await fsp.mkdir(tempDir, { recursive: true });

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
                    const inputFilePath = path.join(imagesDir, `${element.id}.png`);
                    const tempOutputFilePath = path.join(tempDir, `${element.id}.png`);

                    await downloadImage(element.image.display.url, inputFilePath);
                    await processAndOptimizeImage(inputFilePath, tempOutputFilePath);

                    await fsp.rename(tempOutputFilePath, inputFilePath);
                }
            }

            mergedJson.push(...channelData);
        }

        mergedJson.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        await fsp.writeFile("cache/data.json", JSON.stringify(mergedJson));
        
        // Delete the temporary folder
        await fsp.rm(tempDir, { recursive: true });
    } catch (err) {
        console.error('Error:', err);
    }
})();
