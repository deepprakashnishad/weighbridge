### Angular With Electron JS

#### Angular commands

There is no change in angular commands you can use them as is.

- To build : `npm run build`
- To server/start : `npm start`


##### To run electron app
- First we have to build angular app using following command
    `npm run build`
- Run the electron app using following command
    `npm run electron-start`

##### To build electron app

- Windows: `npm run build-win`
- Linux: `npm run build-linux`
- Mac: `npm run build-mac`

----------

#### Install electron packager

**For use in npm scripts (recommended)**
npm install electron-packager --save-dev

**For use from the CLI**
npm install electron-packager -g

#### To view contents of asar file

`npx asar extract app.asar destfolder`

----------

*Thanks to https://www.christianengvall.se/electron-packager-tutorial/  for `electron-packager documentation`*

----------


**If you wish to create installer you can refer the below url**

- [mac](https://www.christianengvall.se/dmg-installer-electron-app/`)
- [win](https://www.christianengvall.se/electron-windows-installer/)
- [linux](https://www.christianengvall.se/electron-installer-debian-package/)




----------






# Demo

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.1.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


