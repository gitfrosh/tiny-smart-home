import Vue from 'vue';
import Vuex from 'vuex';

import example from './module-example';

Vue.use(Vuex);

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

window.Event = new Vue(); // create globally usable events

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      example,
    },
  });

  return Store;
}
