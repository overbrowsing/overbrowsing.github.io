/* 
Compiles the nunjucks templates to static html in _site folder
*/

const nunjucks = require('nunjucks');
const fs = require('fs');
const path = require('path');

function compileNunjucksTemplates() {
  const carbonData = JSON.parse(fs.readFileSync('./_site/data/carbon-data.json', 'utf8'));
  const aqiData = JSON.parse(fs.readFileSync('./_site/data/aqi-data.json', 'utf8'));
  const jsonData = JSON.parse(fs.readFileSync('./_site/data/data.json', 'utf8'));
  const currentDate = new Date();
  
  // Configure Nunjucks to load templates from the 'src' directory
  let env = nunjucks.configure('src', {
    autoescape: true,
    noCache: true, // Disable cache for development
  });

  // Custom filter function to convert date string to a JavaScript Date object
  const parseDate = function (dateString) {
    return new Date(dateString);
  };

  env.addFilter('parseDate', parseDate);

  // Ensure the output directory '_site' exists; create it if necessary
  const outputDirectory = '_site';

  // Read all files in the 'src' directory
  const templateFiles = fs.readdirSync('src');

  // Loop through each template file
  templateFiles.forEach((templateFile) => {
    // Skip the layout.njk file
    if (templateFile === 'layout.njk') {
      return;
    }

    // Check if the file has a .njk extension
    if (path.extname(templateFile) === '.njk') {
      try {
        // Construct the full paths for input and output
        const inputTemplate = path.join('src', templateFile);
        const outputHtml = path.join(outputDirectory, path.basename(templateFile, '.njk') + '.html');

        // Get the data for the template from the corresponding route
        let routeData;
        switch (templateFile) {
          case 'index.njk':
            routeData = {
              page: 'home',
              layout: 'layout.njk',
              carbonData: carbonData,
              aqiData: aqiData
            };
            break;
          case 'research.njk':
            routeData = {
              page: 'research',
              layout: 'layout.njk',
              data: jsonData,
              carbonData: carbonData,
              aqiData: aqiData,
              currentDate: currentDate
            };
            break;
          case 'about.njk':
            routeData = {
              page: 'about',
              layout: 'layout.njk',
              carbonData: carbonData,
              aqiData: aqiData
            };
            break;
          case '404.njk':
          routeData = {
            page: '404',
            layout: 'layout.njk',
          };
          break;
          default:
            routeData = {}; // Add default case or handle it as per your requirement
        }
        // Load the template
        const template = fs.readFileSync(inputTemplate, 'utf-8');

        // Compile the template with the route-specific data
        const compiledTemplate = nunjucks.renderString(template, routeData);

        // Write the compiled HTML to the output file
        fs.writeFileSync(outputHtml, compiledTemplate, 'utf-8');
      } catch (error) {
        console.error(`Error compiling template ${templateFile}:`, error.message);
      }
    }
  });

  console.log('All templates compiled successfully!');
}

compileNunjucksTemplates()

module.exports = compileNunjucksTemplates;
