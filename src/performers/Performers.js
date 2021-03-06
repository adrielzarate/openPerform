// Parent should be a Three Scene, updateFromPN recieves data from PerceptionNeuron.js
import _ from 'lodash';
import dat from 'dat-gui';

import Performer from './Performer';
import GroupEffects from './../effects/group';

import config from './../config';

class Performers {
  constructor(inputManager, outputManager) {
    this.inputManager = inputManager;
    this.outputManager = outputManager;
    
    this.performers = {};
    window.performers = this.performers;
    this.dataBuffer = [];
  }
  init(parent) {
    this.parent = parent;
    this.colors = config.performerColors;

    // this.gui = new dat.GUI();
    // this.guiDOM = this.gui.domElement;
    // this.guiFolder = this.gui.addFolder('Group Effects');
    // this.guiFolder.open()

    this.groupEffects = new GroupEffects(this.parent, this.colors, this.guiFolder);
  }

  exists(inputId) {
    return _.has(this.performers, inputId);
  }

  add(inputId, type, leader, actions) {
    if (this.performers && !this.performers[inputId] && this.colors) {
      this.performers[inputId] = new Performer(
        this.parent,
        inputId,
        _.size(this.performers) + 1,
        type,
        leader,
        this.colors[_.size(this.performers) % this.colors.length],
        true,
        actions,
        this.inputManager,
        this.outputManager,
      );
      // this.performers[inputId+"_-1"] = new Performer(this.parent, inputId+"_-1", _.size(this.performers)+1, type, this.colors[_.size(this.performers)%this.colors.length], -1, true);
      // this.performers[inputId+"_1"] = new Performer(this.parent, inputId+"_1", _.size(this.performers)+1, type, this.colors[_.size(this.performers)%this.colors.length], 1, true);
      // this.performers[inputId+"_-2"] = new Performer(this.parent, inputId+"_-2", _.size(this.performers)+1, type, this.colors[_.size(this.performers)%this.colors.length], -2, true);
      // this.performers[inputId+"_2"] = new Performer(this.parent, inputId+"_2", _.size(this.performers)+1, type, this.colors[_.size(this.performers)%this.colors.length], 2, true);
      // if (_.size(this.performers)>1) {
      // 	this.addEffects(["line"]);
      // }
    }
  }

  remove(inputId) {
    if (this.exists(inputId)) {
      this.performers[inputId].clearScene();
      delete this.performers[inputId];
    }
  }

  getPerformers() {
    return _.map(this.performers);
  }

  getPerformer(id) {
    return this.performers[id];
  }

  togglePerformer(id) {
    this.getPerformer(id).toggleVisible();
  }

  addEffects(effects) {
    _.each(effects, (effect) => {
      this.addEffect(effect);
    });
  }

  addEffect(effect) {
    switch (effect) {
      case 'line':
        this.groupEffects.add('line');
        break;
    }
  }

  showWireframe() {
    _.each(this.performers, (performer) => {
      performer.showWireframe();
    });
  }

  hideWireframe() {
    _.each(this.performers, (performer) => {
      performer.hideWireframe();
    });
  }

  clearTracking() {
  	_.each(this.performers, (performer) => {
      performer.clearTracking();
    });
  }

  updateParameters(data) {
    _.each(this.performers, (performer) => {
      performer.updateParameters(data);
    });
  }

  addEffectsToClonesById(id, effect) {
    _.each(this.getCloneGroups()[id], (p) => {
      p.addEffect(effect);
    });
  }

  addEffectsToPerformer(id, effect) {
    this.getPerformer(id).addEffect(effect);
  }

  toggleClonesById(id) {
    _.each(this.getCloneGroups()[id], (p) => {
      p.toggleVisible();
    });
  }

  getCloneGroups() {
    return _.pickBy(_.groupBy(this.performers, (p) => {
      if (p.leader == null || p.leader == undefined) {
        return null;
      }
      return p.leader.inputId;
    }), function(value, key) {
      return (key !== null
        && key !== 'null'
        && key !== undefined
        && key !== 'undefined');
    })
  }

  circleClonesById(id) {
    let s = 1;
    _.each(this.getCloneGroups()[id], (performer) => {
      let rot = new THREE.Euler();//performer.getRotation();
      rot.y = parseFloat(s);
      performer.resetRotation();
      performer.resetOffset();
      performer.resetPosition();
      performer.setRotation(rot.clone());
      s++;
    });
  }

  resetClonesPositionById(id) {
    _.each(this.getCloneGroups()[id], (performer) => {
      performer.resetPosition();
    });
  }

  resetClonesRotationById(id) {
    _.each(this.getCloneGroups()[id], (performer) => {
      performer.resetRotation();
    });
  }

  spreadClonesById(id, val) {
    let v = val.clone();
    let s = 1;
    _.each(this.getCloneGroups()[id], (performer) => {
      v.setX(val.x * s);
      v.setY(val.y * s);
      v.setZ(val.z * s);
      performer.resetRotation();
       performer.resetOffset();
      performer.resetPosition();
      performer.setOffset(v);
      s++;
    });
  }

  spreadAll(val) {
    _.each(this.getCloneGroups(), (performerGroup, idx) => {
      let v = val.clone();
      let s = 1;
      _.each(performerGroup, (performer) => {
        v.setX(val.x * s);
        v.setY(val.y * s);
        v.setZ(val.z * s);
        performer.resetRotation();
        performer.resetOffset();
        performer.resetPosition();
        performer.setOffset(v);
        s++;
      });
    })
  }

  delayClonesById(id, delay) {
    let s = 1;
    _.each(this.getCloneGroups()[id], (performer) => {
      performer.setDelay(delay * s);
      s++;
    });
  }

  delayAll(delay) {
    _.each(this.getCloneGroups(), (performerGroup, idx) => {
      let s = 1;
      _.each(performerGroup, (performer) => {
        performer.setDelay(delay * s);
        s++;
      });
    })
  }

  scaleClonesById(id, scale) {
    let s = 1;
    _.each(this.getCloneGroups()[id], (performer) => {
      performer.setScale(scale * s);
      s++;
    });
  }

  scaleAll(scale) {
    _.each(this.getCloneGroups(), (performerGroup, idx) => {
      let s = 1;
      _.each(performerGroup, (performer) => {
        performer.setScale(scale * s);
        s++;
      });
    })
  }

  update(inputId, data) {
    if (this.performers[inputId]) {
      this.performers[inputId].update(data);
      _.each(_.filter(this.performers, (p) => {
        if (p.leader === null || p.leader === undefined) {
          return false;
        }
        return p.leader.inputId === inputId;
      }), (p) => p.update(data));
      this.groupEffects.update(this.performers);
    }
  }
}

module.exports = Performers;
