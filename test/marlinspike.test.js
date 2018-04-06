
const assert = require('assert');
const _ = require('lodash');

const Marlinspike = require('../lib/marlinspike');
const TestHook = require('./api/hooks/testhook');

describe('Marlinspike', () => {
  describe('#constructor', () => {
    it('empty hook should be constructable', () => {
      const spike = new TestHook(global.sails);
    });
  });

  describe('#createSailsHook', () => {
    it('should return a valid sails hook', () => {
      const HookDefinition = Marlinspike.createSailsHook(TestHook);
      const hook = HookDefinition(global.sails);

      assert(_.isFunction(HookDefinition));
      assert(_.isObject(hook));

      assert(_.isFunction(hook.defaults));
      assert(_.isFunction(hook.configure));
      assert(_.isFunction(hook.initialize));
      assert(_.isObject(hook.routes));
    });
    it('should extend controllers', () => {
      const HookDefinition = Marlinspike.createSailsHook(TestHook);
      const hook = HookDefinition(global.sails);

      hook.configure();

      assert(global.sails.controllers.test);
    });
    it('should extend services', () => {
      const HookDefinition = Marlinspike.createSailsHook(TestHook);
      const hook = HookDefinition(global.sails);

      hook.configure();

      assert(global.sails.services.testservice);
    });
    it('should extend models', done => {
      const HookDefinition = Marlinspike.createSailsHook(TestHook);
      const hook = HookDefinition(global.sails);

      hook.configure();

      global.sails.after('hook:orm:loaded', () => {
        assert(global.sails.models.testmodel);
        done();
      });
    });
    it('should extend policies', done => {
      const HookDefinition = Marlinspike.createSailsHook(TestHook);
      const hook = HookDefinition(global.sails);

      hook.configure();
      global.sails.after('hook:http:loaded', () => {
        assert(_.isFunction(global.sails.hooks.policies.middleware.testpolicy));
        assert(_.isFunction(global.sails.middleware.policies.testpolicy));
        done();
      });
    });
    it('should extend sails.config', () => {
      const HookDefinition = Marlinspike.createSailsHook(TestHook);
      const hook = HookDefinition(global.sails);

      hook.configure();

      assert.equal(global.sails.config.testconfig.foo, 'bar');
    });
    it('should merge sails.config defaults', () => {
      global.sails.config.testconfig = {
        foo: 'baz',
        bar: 1
      };

      const HookDefinition = Marlinspike.createSailsHook(TestHook);
      const hook = HookDefinition(global.sails);

      hook.configure();

      assert.equal(global.sails.config.testconfig.foo, 'baz');
      assert.equal(global.sails.config.testconfig.bar, 1);
    });
  });
});
