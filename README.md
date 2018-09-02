# Visualizations With D3

Application test drive is [here](https://d3visualizations.herokuapp.com/).

- Bar Chart
- Scatter Plot
- GapMinder

![Demo Image](./demo-images/gapminder.png)

**Note:** The application is a demonstration instance. It works correctly in modern Chrome.

## Table of Contents

- [Installation](#instalation)
- [Production Mode](#production_mode)
- [Development Mode](#development_mode)

## Installation

**Note:** Make sure git, NodeJs and NPM are installed

- Clone the current repository:

```bush
git clone https://github.com/serjilyashenko/d3-visualizations.git
```

- For installation of npm dependencies execute from project folder:

```bush
yarn install
```

or

```bush
npm install
```

## Production Mode

It is necessary pass `ENV=production`.

```bush
yarn gulp:build
yarn start
```

or

```bush
npm run gulp:build
npm start
```

You also can use `yarn gulp` instead of script `gulp:build`

Visit `localhost:8080`

## Development Mode

```
yarn dev
```

or

```
npm run dev
```
