<template>
  <q-page padding>
    <q-list inset-separator class="q-mt-md">
      <q-item>
        <q-item-main label="Delete database?"/>
        <q-item-side right>
          <q-btn color="negative" @click="deleteDb" label="Execute"/>
        </q-item-side>
      </q-item>
    </q-list>
  </q-page>
</template>

<script>
export default {
  name: "PageSettings",
  methods: {
    deleteDb() {
      console.log("fetch ", process.env.ROOT_URL + "deleteData");
      this.$axios
        .get(process.env.ROOT_URL + "deleteData")
        .then(response => {
          return response.data;
        })
        .then(response => {
          this.$q.notify({
            color: "secondary",
            position: "top",
            message: response,
            icon: "check"
          });
        })
        .catch(e => {
          console.log(e);
          this.$q.notify({
            color: "negative",
            position: "top",
            message: "Could not execute.",
            icon: "report_problem"
          });
        });
    }
  }
};
</script>

<style>
</style>
