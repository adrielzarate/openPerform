import _ from 'lodash';
import dat from 'dat-gui';

import MuseEnvironment from './museEnvironment';
import IslandEnvironment from './islandEnvironment';
import GridEnvironment from './gridEnvironment';
import GradientEnvironment from './gradientEnvironment';
import WaterEnvironment from './waterEnvironment';
import EmptyEnvironment from './emptyEnvironment';
import ForestEnvironment from './forestEnvironment';

import config from './../config';

class Environments {
  constructor(renderer, parent, performers) {
    this.renderer = renderer;
    this.parent = parent;
    this.performers = performers;
    this.defaultEnvironment = config.defaults.environment.toLowerCase();

    this.currentEnvironment = this.defaultEnvironment;
    console.log(this.currentEnvironment);
    this.availEnvironments = [/*'muse', 'island', */'water', 'forest', 'grid-white', /*'grid-light', 'gradient',*/ 'empty'];
    this.environments = [];

    this.gui = new dat.GUI({ autoPlace: false, width: "100%" });
    this.guiDOM = this.gui.domElement;
    // this.guiFolder = this.gui.addFolder('Environments');
    // this.guiFolder.open();

    this.add(this.defaultEnvironment); // default
  }

  getEnvironments() {
    return this.environments;
  }

  updateEnvironment(val) {
    this.add(this.availEnvironments[val]);
  }

  add(type) {
    this.removeAll();
    switch (type) {
      case 'forest':
        this.environments.push(new ForestEnvironment(this.renderer, this.parent, this.performers, this.guiFolder));
        break;
      case 'muse':
        this.environments.push(new MuseEnvironment(this.renderer, this.parent, this.performers, this.guiFolder, 'dark'));
        break;
      case 'island':
        this.environments.push(new IslandEnvironment(this.renderer, this.parent, this.performers, this.guiFolder));
        break;
      case 'water':
        this.environments.push(new WaterEnvironment(this.renderer, this.parent, this.guiFolder));
        break;
      case 'grid-white':
        this.environments.push(new GridEnvironment(this.renderer, this.parent, this.performers, 'dark'));
        break;
      case 'gradient':
        this.environments.push(new GradientEnvironment(this.renderer, this.parent, this.performers, this.guiFolder));
        break;
      case 'empty':
        this.environments.push(new EmptyEnvironment(this.renderer, this.parent, this.performers, this.guiFolder));
        break;
    }
    this.currentEnvironment = type;
  }

  removeAll() {
    _.each(this.environments, (environment) => {
      if (environment) {
        environment.remove();
      }
    });
    this.environments = [];
  }

  remove(inputId) {
    if (this.environments[inputId]) {
      this.environments[inputId].remove();
      delete this.environments[inputId];
    }
  }

  exists(inputId) {
    return _.has(this.environments, inputId);
  }

  toggle(variableName) {
    _.each(this.environments, (environment) => {
      environment.toggle(variableName);
    });
  }

  updateParameters(data) {
    _.each(this.environments, (environment) => {
      environment.updateParameters(data);
    });
  }

  update(data) {
    _.each(this.environments, (environment) => {
      environment.update(data);
    });
  }
}

module.exports = Environments;
