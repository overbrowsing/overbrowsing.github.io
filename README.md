[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github)
[![CO₂ Shield](https://img.shields.io/badge/CO₂-A+_0.008g-58C521)](https://overbrowsing.com/projects/co2-shield)

# overbrowsing.com

## Overview

A low-impact static website for the Overbrowsing Research Group that prioritises sustainability by avoiding unnecessary frameworks and bloat. The HTML is semantically structured with lightweight CSS and vanilla JavaScript, using minimal IDs and classes for simplicity and maintainability. Designed with progressive enhancement, features like low-impact mode remain functional even with JavaScript disabled.

## Features

- **Low-Impact Mode**: Reacts to local energy grid's intensity data, hiding image resources until users opt to load them.
- **Sustainable Web Design**: Ensures all pages achieve an A+ rating on [Beacon](https://digitalbeacon.co), maintaining emissions of 0.095g CO₂e or less per page view.
- **Environmental Awareness**: The background and favicon change colour based on real-time air pollution and the time of day.
- **Dithered Images**: Optimised visuals for faster loading and smaller page weight.

## APIs Used

- **[NESO's Carbon Intensity API](https://carbonintensity.org.uk)**: Fetches UK-specific real-time regional energy grid intensity data.
- **[Green Web Foundation's Carbon Intensity API](https://developers.thegreenwebfoundation.org/api/ip-to-co2/overview)**: Provides global energy grid intensity data.
- **[OpenWeatherMap's Air Pollution API](https://openweathermap.org/api/air-pollution)**: Retrieves real-time air pollution metrics.
- **[IPinfo](https://ipinfo.io)**: Determines the user's location to assess energy grid intensity.
- **[Beacon](https://digitalbeacon.co)**: Fetches the CO₂e emissions per page view for transparency.

## Contributing

Contributions are welcome. Please feel free to [submit an issue](https://github.com/overbrowsing/overbrowsing.github.io/issues) or a [pull request](https://github.com/overbrowsing/overbrowsing.github.io/pulls).

## License

overbrowsing.com is released under the [MIT](/LICENSE) license. Feel free to use and modify it as needed.