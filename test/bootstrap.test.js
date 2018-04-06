
const SailsApp = require('sails').Sails;

beforeEach(function (done) {
  this.timeout(30000);
  const config = {
    log: {
      level: 'info'
    },
    hooks: {
      grunt: false,
      views: false
    }
  };

  global.sails = new SailsApp();
  global.sails.load(config, (err, sails) => {
    done(err);
  });
});

afterEach((done) => {
  global.sails.lower(done);
});
