## Introduction

Overbrowsing is dedicated to fostering a deeper understanding of sustainable web design and development practices and their implications for our environment and society.

The term "overbrowsing" encapsulates our mission: a vigilant acknowledgment of the excesses and superfluous elements often overlooked within the digital landscape. Our purpose is to raise consciousness, disseminate knowledge concerning the imperative need to curtail this surplus, and kindle palpable, tangible change.

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

