var fsp = require('fs/promises');
const fs = require('fs');
const client = require('https');

// Define your channel names and corresponding categories
const channelCategories = [
    { name: "design-tool-rzfxmnmei8g", category: "Design Tools" },
    { name: "founding-principles", category: "Founding Principals" },
    // Add more channel names and categories as needed
];

Promise.all(
    channelCategories.map(channel => 
        fetch(`https://api.are.na/v2/channels/${channel.name}?per=200`)
        .then(resp => resp.json())
    )
)
.then(async data => {
    // Merge and sort channels
    const mergedJson = [];

    data.forEach((channelData, index) => {
        const category = channelCategories[index].category;

        // Add the category to each item based on the channel category
        channelData.contents.forEach(element => {
            element.category = category;

            // Additional processing as needed (e.g., saving images)
            if (element.image) {
                client.get(element.image.thumb.url, (res) => {
                    res.pipe(fs.createWriteStream('cache/images/' + element.id + '.png'));
                });
            }
        });

        // Concatenate the channel data to mergedJson
        mergedJson.push(...channelData.contents);
    });

    // Sort mergedJson by created_at
    mergedJson.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Save data to JSON
    await fsp.writeFile("cache/data.json", JSON.stringify(mergedJson));
});
