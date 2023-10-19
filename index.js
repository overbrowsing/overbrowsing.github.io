var fsp = require('fs/promises');
const fs = require('fs');
const client = require('https');

const channelNames = ["design-tool-rzfxmnmei8g", "founding-principles"]

Promise.all(channelNames.map(id => 
    fetch(`https://api.are.na/v2/channels/${id}?per=200`)
    .then(resp => resp.json())))
    .then(async data => {
        // merge and sort channels
        const json = Object.assign(data[0].contents, data[1].contents);
        json.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // compress images before pageload
        json.forEach(async element => {
            if (element.image) {
                client.get(element.image.thumb.url, (res) => {
                    res.pipe(fs.createWriteStream('uploads/' + element.id + '.png'));
                });
            }
           
        });
    // save data to json
    await fsp.writeFile("data.json", JSON.stringify(json));
})
