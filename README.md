# vue-test-utils-compat [![npm badge](https://img.shields.io/npm/v/vue-test-utils-compat)](https://npmjs.com/vue-test-utils-compat)

Upgrade your Vue components first, deal with tests later

---
A migration tool to help you with migration from Vue 2 to Vue3

Vue 3 introduced [migration build](https://v3.vuejs.org/guide/migration/introduction.html#migration-build) to help teams with gradual migration. [vue-test-utils-next](https://github.com/vuejs/vue-test-utils-next) is playing well with migration build, but there are many differences between [v1 vue-test-utils](https://github.com/vuejs/vue-test-utils) and [v2](https://github.com/vuejs/vue-test-utils-next).

This package provides a compatibility layer, which allows you to run old v1 test suites on vue-test-utils v2 and Vue 3

## Table of Contents

* ⏩ [Quickstart](#-quickstart)
* ✔️ [Upgrade workflow](#%EF%B8%8F-upgrade-workflow)
* 🌐 [Global API](#-global-api)
* 🏁 Compatibility flags
    * [EXPORT_CREATE_LOCAL_VUE](#export_create_local_vue)
    * [EXPORT_CREATE_WRAPPER](#export_create_wrapper)
    * [MOUNT_ARGS_CONTEXT_*](#mount_args_context_)
    * [MOUNT_ARGS_LISTENERS](mount_args_listeners)
    * [MOUNT_ARGS_MOCKS](#mount_args_mocks)
    * [MOUNT_ARGS_PROVIDE](#mount_args_provide)
    * [MOUNT_ARGS_SCOPED_SLOTS](#mount_args_scoped_slots)
    * [MOUNT_ARGS_SCOPED_SLOTS_THIS](#mount_args_scoped_slots_this)
    * [MOUNT_ARGS_STUBS](#mount_args_stubs)
    * [WRAPPER_ATTRIBUTES_DISABLED](#wrapper_attributes_disabled)
    * [WRAPPER_ATTRIBUTES_VALUE](#wrapper_attributes_value)
    * [WRAPPER_DESTROY](#wrapper_destroy)
    * [WRAPPER_DO_NOT_INCLUDE_NATIVE_EVENTS_IN_EMITTED](#wrapper_do_not_include_native_events_in_emitted)
    * [WRAPPER_FIND_ALL](#wrapper_find_all)
* 🚧 [Work in progress](#-work-in-progress)
* ⚠️ [Known issues](#known-issues)

## ⏩ Quickstart

```bash
npm install --save-dev vue-test-utils-compat
```


**Vue 3**:
```js
const VueTestUtils = require('vue@/test-utils');
const { h } = require('vue');
const {
  installCompat as installVTUCompat,
  fullCompatConfig
} = require('vue-test-utils-compat');

installVTUCompat(VueTestUtils, fullCompatConfig, h)
```

**Vue 3 migration build** (in Vue 2 mode):
```js
const VueTestUtils = require('vue@/test-utils');
const Vue = require('vue');
const {
  installCompat: installVTUCompat,
  fullCompatConfig
} = require('vue-test-utils-compat');
let compatH;
Vue.createApp({
  compatConfig: {
    MODE: 3,
    RENDER_FUNCTION: 'suppress-warning'
  },
  render(h) {
    compatH = h
  }
}).mount(document.createElement('div'))
installVTUCompat(VueTestUtils, fullCompatConfig, compatH)
```

## ✔️ Upgrade workflow
This upgrade workflow is demonstrated in [bootstrap-vue](https://github.com/bootstrap-vue/bootstrap-vue/compare/dev...xanf:vue3-compat-build) migration to Vue 3.

0. **Before you start** make sure you are using **latest** version of `@vue/test-utils` v1 in your project and fix all deprecations reported
1. Follow [Vue3 migration build upgrade workflow](https://v3.vuejs.org/guide/migration/migration-build.html#upgrade-workflow) to set up Vue build infrastructure [[example commit]](https://github.com/bootstrap-vue/bootstrap-vue/commit/b7a350c270da1e51f6288e7ffaec425a80c790ff)
1. Make sure your test infrastructure uses `@vue/compat` as `vue` alias.
Example (using jest - `jest.config.js`):
```js
module.exports = {
  // ...
  moduleNameMapper: {
    '^vue$': '@vue/compat',
  },
  // ...
};
```
> Hint: it might be a good idea to set up your environment to use Vue 2 or Vue 3 conditionally. It greatly simplifies the migration process.

[[example commit]](https://github.com/bootstrap-vue/bootstrap-vue/commit/ff82fd173c7b7d3939ee479e50112f689cf31a8f)

3. Install `vue-test-utils-compat`. Please take a note that your test environment might reset modules between files (`jest` do this), so make sure to do this in the proper place (we're using `setupFilesAfterEnv` in jest):

```js
  const compatH = new Vue({}).$createElement
  installVTUCompat(VTU, fullCompatConfig, compatH)
```

4. Run your tests and fix failing ones. Typical failures usually include:
    * using private Vue API (like `__vue__`) [[example commit]](https://github.com/bootstrap-vue/bootstrap-vue/commit/f068bed68c99ee5f633059e8f098ed4ffced72d2)
    * wrong usage of `find` vs. `findComponent` [[example commit]](https://github.com/bootstrap-vue/bootstrap-vue/commit/5a6de07225b8963e0b8d5fdd7f3cf08123240cb0)
    * snapshots (they might differ between Vue 2 and Vue 3)

5. At this point, you (theoretically) have a green suite and can start working on upgrading your code to Vue 3
6. Replace `fullCompatConfig` from step 3 with the detailed list of compat flags. You can copy-paste the full list of flags below or take a look at the source code to figure all flags:
```js
const compatConfig = {
  EXPORT_CREATE_LOCAL_VUE: true,
  EXPORT_CREATE_WRAPPER: true,

  GLOBAL_STUBS: true,

  MOUNT_ARGS_CONTEXT_ATTRS: true,
  MOUNT_ARGS_CONTEXT_CHILDREN: true,
  MOUNT_ARGS_CONTEXT_CLASS: true,
  MOUNT_ARGS_CONTEXT_ON: true,
  MOUNT_ARGS_CONTEXT_PROPS: true,
  MOUNT_ARGS_LISTENERS: true,
  MOUNT_ARGS_MOCKS: true,
  MOUNT_ARGS_PROVIDE: true,
  MOUNT_ARGS_SCOPED_SLOTS: true,
  MOUNT_ARGS_SCOPED_SLOTS_THIS: true,
  MOUNT_ARGS_STUBS: true,

  WRAPPER_ATTRIBUTES_DISABLED: true,
  WRAPPER_ATTRIBUTES_VALUE: true,
  WRAPPER_DESTROY: true,
  WRAPPER_DO_NOT_INCLUDE_NATIVE_EVENTS_IN_EMITTED: true,
  WRAPPER_FIND_ALL: true,
}
```
6. 🔁 Turn off one compatibility flag. Fix failing tests. Repeat.
7. As soon as you turn off the last compatibility flag - throw away and uninstall this package. You are awesome! 🎉

## 🌐 Global API

* `installCompat(VueTestUtilsModule, compatConfig, vueH)`
   * `VueTestUtilsModule` - module, which will be patched
   * `compatConfig: Record<string, boolean>` - list of compatibility flags
   * `vueH` - function which will be used to create Vue VNodes. Required only if `MOUNT_ARGS_SCOPED_SLOTS_THIS` compatibility flag is used, could be omitted otherwise
* `compatFlags` - object with all available compatibility flags
* `fullCompatConfig` - config object with all compatibility flags enabled

## 🏁 Compatibility flags

Tests cover all compatibility flags. If the flag description is unclear, check the relevant test in `tests` folder.

### EXPORT_CREATE_LOCAL_VUE
Adds `createLocalVue` to `@vue/test-utils` module and support for `{ localVue }` mount option.

>⚠️ `localVue` provides `.extend`, which is no-op operation. It is sufficient for most of the code but might require special handling

➡️ Migration strategy: [available in @vue/test-utils v2 docs](https://next.vue-test-utils.vuejs.org/migration/#no-more-createlocalvue)

### EXPORT_CREATE_WRAPPER
Adds `createWrapper` to `@vue/test-utils` module

➡️ Migration strategy: replace `createWrapper` with `new DOMWrapper()`, `new VueWrapper()` which are available as exports in `@vue/test-utils` v2

### MOUNT_ARGS_CONTEXT_*
Flags:
* `MOUNT_ARGS_CONTEXT_ATTRS`
* `MOUNT_ARGS_CONTEXT_CHILDREN`
* `MOUNT_ARGS_CONTEXT_CLASS`
* `MOUNT_ARGS_CONTEXT_ON`
* `MOUNT_ARGS_CONTEXT_PROPS`

Enable support for `context` field in `mount` args of `@vue/test-utils` (used to test functional components)

>⚠️ `MOUNT_ARGS_CONTEXT_CHILDREN` converts `context.children` to the default slot of the component. It is not a complete implementation of old `context.children` behavior but should be sufficient for most cases.

➡️ Migration strategy: rewrite your mount args as follows:
  * `context.props`, `context.attrs`, and `context.class` go directly to `props`
  * `children` are replaced with `slots.default`
  * `context.on` become corresponding `props`: (`click` → `onClick`, etc.)

### MOUNT_ARGS_LISTENERS
Allow passing `{ listeners }` field in `mount` arguments

➡️ Migration strategy: replace `listeners` with `props`: (`click` → `onClick`, etc.)

### MOUNT_ARGS_MOCKS
Enable passing `mocks` to the component from `mount` arguments

➡️ Migration strategy: move `mocks` mount arg to `global.mocks`

### MOUNT_ARGS_PROVIDE
Allow passing relevant `provide` to the component
>⚠️ `@vue/test-utils` v2 does not support passing `provide` as function. It means that your `provide()` function might be invoked earlier than you think

➡️ Migration strategy: move `provide` mount arg to `global.provide`. If your `provide` is a function - replace it with an object.

### MOUNT_ARGS_SCOPED_SLOTS
Enable `scopedSlots` support in mount args

➡️ Migration strategy: merge `scopedSlots` mount arg to `slots`. If your scoped slot is using raw string - wrap it with `<template #default="props">${your string here}</template>`

### MOUNT_ARGS_SCOPED_SLOTS_THIS
Allows `scopedSlots` declared as functions to receive `this` which contains `$createElement` and `$set`
>⚠️⚠️⚠️  Requires `MOUNT_ARGS_SCOPED_SLOTS` to be enabled and third argument (`vueH` ) a for `installCompat` call

>️⚠️`$createElement` provided by this flag is not context-aware and will not be able to render components as a string. Refer to [Vue docs](https://v3.vuejs.org/guide/migration/render-function-api.html#registered-component) for details

➡️ Migration strategy: ❌  rewrite such slots in your tests

### MOUNT_ARGS_STUBS
Enable `stubs` to be passed to mount arguments

➡️ Migration strategy: move `stubs` mount arg to `global.stubs`

### WRAPPER_ATTRIBUTES_DISABLED
Adds special handling when retrieving the `disabled` attribute on `wrapper`. Previously Vue always normalized such values ([Vue 3 migration guide](https://v3.vuejs.org/guide/migration/attribute-coercion.html) has more details on this)

➡️ Migration strategy: update your `.attributes("disabled")` assertions to relevant values

### WRAPPER_ATTRIBUTES_VALUE
Adds special handling when retrieving the `value` attribute on `wrapper`. Previously Vue always set `value` as DOM node attribute, which is no more the case

➡️ Migration strategy: ❌  rewrite   your value retrieval in another way

### WRAPPER_DESTROY
Enables `wrapper.destroy` calls and `enableAutoDestroy` calls

➡️ Migration strategy: replace all `wrapper.destroy` calls with `wrapper.unmount` and `enableAutoDestroy` with `enableAutoUnmount

### WRAPPER_DO_NOT_INCLUDE_NATIVE_EVENTS_IN_EMITTED
Makes sure that native events will not be captured in `.emitted()`

➡️ Migration strategy: rewrite your event-related assertions to take into account that native events are also captured, or (preferred) use [emits](https://v3.vuejs.org/guide/migration/emits-option.html#overview) option on your components

### WRAPPER_FIND_ALL
Implements old behavior of `.findAll` / `.findAllComponents` when results were wrapped with special object with `.wrappers` field and various methods (`.at`, `.filter`, `.trigger`, etc.)

➡️ Migration strategy: rewrite your tests, assuming that `.findAll` and `.findAllComponents` return a simple array instead

## 🚧 Work in progress
These compat rules are a work in progress and will be included soon

### WRAPPER_FIND_BY_REF
Allows finding DOM node by ref

## Known issues
This package monkey-patches `@vue/test-utils` package. Depending on your setup this might not work (for example you are using real imports). In that case you can create a mutable wrapper around VTU and replace all your imports from `@vue/test-utils` to this helper module:


```js
import * as VueTestUtils from '@vue/test-utils';
import { h } from 'vue';
import { installCompat, fullCompatConfig } from `@vue/test-utils/compat`

const PatchedVTU = { ...VueTestUtils };
installCompat(PatchedVTU, fullCompatConfig, h);
export PatchedVTU;
```
