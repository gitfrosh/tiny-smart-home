<template>
  <q-page padding class="docs-input row justify-center">
    <div class="row gutter-sm">
      <div class="col-6">
        <q-card inline>
          <q-card-media style="max-height: 250px">
            <img src="~assets/temperature.jpg">
            <q-card-title slot="overlay">
              Temperature
              <span slot="subtitle">hot or not</span>
            </q-card-title>
          </q-card-media>
          <q-card-main>lorem ipsum</q-card-main>
        </q-card>
      </div>
      <div class="col-6">
        <q-card inline>
          <q-card-media style="max-height: 250px">
            <img src="~assets/humidity.jpg">
            <q-card-title slot="overlay">
              Humidity
              <span slot="subtitle">some like it wet</span>
            </q-card-title>
          </q-card-media>
          <q-card-main>lorem ipsum</q-card-main>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style>
</style>

<script>
export default {
  name: "PageIndex"
};
</script>
