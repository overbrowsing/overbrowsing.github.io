## Introduction

[Overbrowsing](https://en.wikipedia.org/wiki/Browsing_(herbivory)#:~:text=Overbrowsing%20occurs%20when%20overpopulated%20or%20densely-concentrated%20herbivores%20exert%20extreme%20pressure%20on%20plants,%20reducing%20the%20carrying%20capacity%20and%20altering%20the%20ecological%20functions%20of%20their%20habitat.): dedicated to fostering a deeper understanding of sustainable web design
and development practices and their implications for our environment and society.


The term overbrowsing encapsulates our mission: a vigilant acknowledgment of the
excesses and and superfluous elements often overlooked within the digital landscape.Our purpose is to raise consciousness, disseminate knowledge concerning the
imperative need to curtail this surplus, and kindle palpable, tangible change.


Overbrowsing advocates for conscious strategies, resource optimisation, and ethical
considerations. We expound why a sustainable web is pivotal for our planet, while
simultaneously enhancing user experiences and ensuring equitable access, fostering a
harmonious coexistence between technology and our planet.

## Table of Contents
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)


## Installation

To get started with Overbrowsing, follow these installation steps:

Clone the repository to your local machine:

```bash
git clone https://github.com/overbrowsing/overbrowsing.github.io.git
```
Navigate to the project directory

```bash
cd overbrowsing
```

Install the required dependencies:

```bash
yarn
```

The project comes without data uploaded. Call this script to call the API and pull in data for testing. **Note:** To keep the project light, don't commit the `cache/data.json` file or the `cache/images/` folder.

```bash
yarn build
```
This script will remove existing data and uploads, create necessary directories, and fetch the required data.





## Geting Started
### Serving

This project has a light server with express installed. To serve the project run:
```bash
yarn serve
```
This also runs `yarn build`. 

Visit `http://localhost:3000/` to view the site.

## Contributing
If you'd like to contribute to Overbrowsing Github Project, please follow these steps:

Fork the repository.

Create a new branch for your feature or bug fix:
```bash
git checkout -b feature/your-feature-name
```

Make your changes and commit them:
```bash
git commit -m "Add your commit message here"
```

Push your changes to your fork:
```bash
git push origin feature/your-feature-name
```

Create a pull request to the main repository, explaining your changes.

## License
This project is licensed under the This project is licensed under the [MIT License](LICENSE).

