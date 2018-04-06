# marlinspike

[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]

Superpowers for your [Sails.js](https://sailsjs.org) Hooks.

## Features
- Makes it easy to build and maintain Sails Hooks as separate projects.
- Magically extend Sails apps with additional Models, Controllers, and Services.

## Compatibility
- Sails.js 0.12 and newer
- Node.js 8.0 and newer

## Install

```sh
$ npm install git+ssh://git@github.com/fpm-git/marlinspike.git --save
```

## Usage
```js
// config/customhook.js
module.exports.customhook = {
  /**
   * Load hook into sails.hooks.custom
   */
  name: 'custom',

  /**
   * Load hook config into sails.hook.customHook
   */
  configKey: 'customHook',

  marlinspike: {
    /**
     * Load controllers from ../api/controllers into the parent app
     */
    controllers: true,

    /**
     * Load models from ../api/models into the parent app
     */
    models: true,

    /**
     * Load services from ../api/services into the parent app
     */
    services: true,

    /**
     * Load config from ../config/customhook.js into the parent app
     */
    config: true
  }
}
```

```js
// api/hooks/customhook.js
const Marlinspike = require('marlinspike');

class CustomHook extends Marlinspike {

  constructor(sails) {
    super(sails, module);
  }

  initialize(done) {
    // http://sailsjs.org/documentation/concepts/extending-sails/hooks/hook-specification/initialize
    return done();
  }

  configure() {
    // http://sailsjs.org/documentation/concepts/extending-sails/hooks/hook-specification/configure
  }

  defaults() {
    // http://sailsjs.org/documentation/concepts/extending-sails/hooks/hook-specification/defaults#?using-defaults-as-a-function
  }

  routes() {
    // http://sailsjs.org/documentation/concepts/extending-sails/hooks/hook-specification/routes
    return {
      before: {
        // Put here any route handlers which should run BEFORE user-defined routes.
      },
      after: {
        // Put here any route handlers which should run AFTER user-defined routes.
      }
    };
  }

}

module.exports = Marlinspike.createSailsHook(CustomHook);
```

## License
MIT

[npm-image]: https://img.shields.io/npm/v/marlinspike.svg?style=flat-square
[npm-url]: https://npmjs.org/package/marlinspike
[ci-image]: https://img.shields.io/travis/tjwebb/marlinspike/master.svg?style=flat-square
[ci-url]: https://travis-ci.org/tjwebb/marlinspike
[daviddm-image]: http://img.shields.io/david/tjwebb/marlinspike.svg?style=flat-square
[daviddm-url]: https://david-dm.org/tjwebb/marlinspike
[codeclimate-image]: https://img.shields.io/codeclimate/github/tjwebb/marlinspike.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/tjwebb/marlinspike
