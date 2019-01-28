<template>
  <q-page padding>
    <q-list inset-separator class="q-mt-md">
      <q-item>
        <q-item-main label="Delete database?"/>
        <q-item-side right>
          <q-btn color="negative" @click="deleteDb" label="Execute"/>
        </q-item-side>
      </q-item>
      <q-item>
        <q-item-main label="Download database as CSV"/>
        <q-item-side right>
          <q-btn color="positive" @click="downloadDb" label="Download"/>
        </q-item-side>
      </q-item>
    </q-list>
  </q-page>
</template>

<script>
const fs = require("fs");

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
    },
    downloadDb() {
      console.log("fetch ", process.env.ROOT_URL + "download");
      this.$axios
        .get(process.env.ROOT_URL + "download")
        .then(response => {
          console.log(response);
          return response.data;
        })
        .then(response => {
          console.log(response);
          const url = window.URL.createObjectURL(new Blob([response]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "db.csv");
          document.body.appendChild(link);
          link.click();
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
