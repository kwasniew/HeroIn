var chai = require('chai'),
  assert = chai.assert,
  heroin = require('../lib/heroin'),
  _ = require('lodash');

describe('HeroIn', function () {

  it('should prompt you for a pipeline config or name', function () {
    try {
      var configurator = heroin({});
      configurator.pipeline();
    } catch (e) {
      assert.equal(e.message, 'Please specify pipeline name or pipeline config');
    }
  });

  it('should not allow to create pipeline without any apps - no apps', function () {
    try {
      var configurator = heroin({});
      configurator.pipeline({name: 'sample_pipeline'});
    } catch (e) {
      assert.equal(e.message, 'Please specify at least one app in your pipeline. Provided: undefined');
    }
  });

  it('should not allow to create pipeline without any apps - empty apps', function () {
    try {
      var configurator = heroin({});
      configurator.pipeline({name: 'sample_pipeline', apps: {}});
    } catch (e) {
      assert.equal(e.message, 'Please specify at least one app in your pipeline. Provided: {}');
    }
  });

  it('should allow to export existing pipeline', function (done) {
    var configurator = heroin(inMemoryHerokuClient());
    configurator.
      pipeline('sample_pipeline').
      then(function (pipelineConfig) {
        assert.deepEqual({name: 'sample_pipeline', apps: {production: 'sample_app'}}, pipelineConfig);
      }).
      then(done).
      catch(done);
  });

  function inMemoryHerokuClient() {
    var herokuClient = {
      pipelinesList: {sample_pipeline: {id: 'sample_pipeline', name: 'sample_pipeline'}},
      appsList: {sample_app_id: {name: 'sample_app'}},
      couplings: [{
        app: {
          id: 'sample_app_id',
        },
        stage: 'production'
      }],

      apps: function (appId) {
        return {
          info: function () {
            return Promise.resolve(herokuClient.appsList[appId]);
          }
        }
      },

      pipelines: function (name) {
        return {
          pipelineCouplings: function () {
            return {
              list: function () {
                return Promise.resolve(herokuClient.couplings);
              }
            }
          },
          info: function () {
            return Promise.resolve(herokuClient.pipelinesList[name]);
          }
        }
      }
    };

    return herokuClient;
  }


});
