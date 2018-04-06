
const requireAll = require('require-all');
const path = require('path');
const _ = require('lodash');

module.exports = class Marlinspike {

  constructor (sails, hookModule) {
    this.sails = sails;
    this.name = this.constructor.name.toLowerCase();
    this.hookPath = path.resolve(path.dirname(hookModule.filename));

    this.sails.log.debug('hookPath:', this.hookPath);
  }

  configure () {
    return { };
  }
  initialize (next) {
    next();
  }
  routes () {
    return { };
  }
  defaults (overrides) {
    return { };
  }

  loadConfig () {
    const configPath = path.resolve(this.hookPath, '../../../config');
    this.sails.log.debug(`marlinspike (${this.name}): loading config from ${configPath}`);
    try {
      const configModules = requireAll({
        dirname: configPath,
        filter: /(.+)\.js$/
      });
      const sailsConfig = _.reduce(_.values(configModules), _.merge);
      _.defaultsDeep(this.sails.config, sailsConfig);
    } catch (e) {
      this.sails.log.debug(`marlinspike (${this.name}): no configuration found in ${configPath}. Skipping...`);
    }
  }

  loadModels () {
    this.sails.log.debug(`marlinspike (${this.name}): loading Models...`);
    try {
      const models = requireAll({
        dirname: path.resolve(this.hookPath, '../../models'),
        filter: /(.+)\.js$/
      });
      this.mergeEntities('models', models);
    } catch (e) {
      if (e.code !== 'ENOENT') {
        this.sails.log.error(e);
      }
      this.sails.log.warn(`marlinspike (${this.name}): no Models found. skipping`);
    }
  }

  loadPolicies () {
    this.sails.log.debug(`marlinspike (${this.name}): loading Policies...`);
    try {
      const policies = requireAll({
        dirname: path.resolve(this.hookPath, '../../policies'),
        filter: /(.+)\.js$/
      });
      _.extend(this.sails.hooks.policies.middleware, _.mapKeys(policies, (policy, key) => {
        return key.toLowerCase();
      }));
    } catch (e) {
      this.sails.log.warn(`marlinspike (${this.name}): no Policies found. skipping`);
    }

  }

  registerActions () {
    this.sails.log.debug(`marlinspike (${this.name}): loading Controllers...`);
    try {
      const controllers = requireAll({
        dirname: path.resolve(this.hookPath, '../../controllers'),
        filter: /(.+Controller)\.js$/,
        map (name, path) {
          return name.replace(/Controller/, '');
        }
      });
      _.forOwn(controllers, (action, controllerName) => {
        _.forOwn(action, (func, actionName) => {
          if (typeof func === 'function') {
            this.sails.registerAction(func, `${controllerName}/${actionName}`.toLowerCase(), true);
          }
        });
      });
    } catch (e) {
      this.sails.log.warn(`marlinspike (${this.name}): no Actions found. skipping`);
    }
  }

  loadControllers () {
    this.sails.log.debug(`marlinspike (${this.name}): loading Controllers...`);
    try {
      const controllers = requireAll({
        dirname: path.resolve(this.hookPath, '../../controllers'),
        filter: /(.+Controller)\.js$/,
        map (name, path) {
          return name.replace(/Controller/, '');
        }
      });
      this.mergeEntities('controllers', controllers);
    } catch (e) {
      this.sails.log.warn(`marlinspike (${this.name}): no Controllers found. skipping`);
    }
  }

  loadServices () {
    const servicesPath = path.resolve(this.hookPath, '../../services');
    this.sails.log.debug(`marlinspike (${this.name}): loading Services from ${servicesPath}...`);
    try {
      const services = requireAll({
        dirname: servicesPath,
        filter: /(.+)\.js$/
      });
      this.mergeEntities('services', services);
    } catch (e) {
      this.sails.log.warn(`marlinspike (${this.name}): no Services found. skipping`);
    }
  }

  /**
   * load modules into the sails namespace
   */
  mergeEntities (ns, entities) {
    if (ns === 'models') {
      this.sails.config.orm.moduleDefinitions.models = _.merge(this.sails.config.orm.moduleDefinitions.models || {}, Marlinspike.transformEntities(entities));
    }
    this.sails[ns] = _.merge(this.sails[ns] || { }, Marlinspike.transformEntities(entities));
  }

  static transformEntities (entities) {
    return _.chain(entities)
      .mapValues((entity, key) => {
        return _.defaults(entity, {
          globalId: key,
          identity: key.toLowerCase()
        });
      })
      .mapKeys((entity, key) => {
        return key.toLowerCase();
      })
      .value();
  }

  static defaultConfig () {
    return {
      marlinspike: {
        controllers: true,
        models: true,
        services: true,
        policies: true
      }
    };
  }

  /**
   * Return a bona fide Sails hook object forged from the
   * specified class
   *
   * @param Class Hook
   */
  static createSailsHook (Hook) {
    return sails => {
      const hook = new Hook(sails);
      hook.loadConfig(Hook.constructor.name);

      const config = _.defaults({ }, Marlinspike.defaultConfig());
      if (hook.name in sails.config) {
        _.extend(config.marlinspike, sails.config[hook.name].marlinspike);
      }

      return {
        name: this.name,
        routes: hook.routes(),
        defaults (overrides) {
          return _.merge(config, hook.defaults(overrides));
        },
        configure () {
          if (config.marlinspike.services) {
            hook.loadServices();
          }
          if (config.marlinspike.models) {
            hook.loadModels();
          }
          if (config.marlinspike.controllers) {
            hook.loadControllers();
          }
          if (config.marlinspike.policies) {
            hook.loadPolicies();
          }

          hook.configure();
          sails.emit(`hook:${hook.name}:configured`);
        },
        initialize (next) {

          hook.initialize(() => {
            // Check for `registerAction` for backwards compatibility
            if (config.marlinspike.controllers &&
                typeof sails.registerAction === 'function') {
              hook.registerActions();
            }

            sails.emit(`hook:${hook.name}:initialized`);
            next();
          });
        }
      };
    };
  }

};
