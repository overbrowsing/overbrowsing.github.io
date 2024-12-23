[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github)
[![CO₂ Shield](https://img.shields.io/badge/CO₂-A+_0.008g-58C521)](https://overbrowsing.com/projects/co2-shield)

# Overbrowsing Website

## Overview

This low-impact static website for the Overbrowsing Research Group prioritises sustainability by avoiding unnecessary frameworks and bloat. The HTML is structured for semantic clarity, with lightweight CSS and vanilla JavaScript to enhance the user experience. Minimal IDs and classes are used, relying on semantic tags and element selectors for simplicity and maintainability. Designed with progressive enhancement, core features like low-impact mode remain functional without JavaScript.

## Features

- **Low-Impact Mode**: Reacts to local energy grid's intensity data, hiding image resources until users opt to load them.
- **Sustainable Web Designn**: Maintains all pages under an A+ Digital Beacon score of 0.095g CO₂e per page view.
- **Nature Reactive**: The background and favicon changes color based on real-time air pollution and the time of day.
- **Dithered Images**: Optimised visuals for faster loading and smaller page weight.

## APIs Used

- **[IPinfo](https://ipinfo.io)**: Determines the user's location to assess energy grid intensity.
- **[NESO's Carbon Intensity API](https://carbonintensity.org.uk)**: Fetches UK-specific real-time regional energy grid intensity data.
- **[Green Web Foundation: Carbon Intensity API](https://developers.thegreenwebfoundation.org/api/ip-to-co2/overview)**: Provides global energy grid intensity data.
- **[OpenWeather Air Pollution API](https://openweathermap.org/api/air-pollution)**: Retrieves real-time air polution metrics.
- **[Beacon](https://digitalbeacon.co)**: Fetches the CO₂e emissions per page view for transparency.

## Contributing

Contributions are welcome. Please feel free to [submit an issue](https://github.com/overbrowsing/overbrowsing.github.io/issues) or a [pull request](https://github.com/overbrowsing/overbrowsing.github.io/pulls).

## License

CO₂ Shield Generator is released under the [MIT](/LICENSE) license. Feel free to use and modify it as needed.