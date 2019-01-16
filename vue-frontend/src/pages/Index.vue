<template>
  <q-page padding class="docs-input row justify-center">
    <div class="row gutter-sm">
      <div class="col-6">
        <q-card inline style="max-width: 100%">
          <q-card-media style="max-height: 250px">
            <img src="~assets/temperature.jpg">
            <q-card-title slot="overlay">
              Temperature
              <span slot="subtitle">hot or not</span>
            </q-card-title>
          </q-card-media>
          <q-card-main>
            <line-chart v-if="loaded" :datacollection="datacollection_temp" :options="options_temp"></line-chart>
          </q-card-main>
          <q-card-separator/>
          <q-card-actions align="center">
            <q-btn-toggle
              v-model="toggle_temp"
              v-on:input="chooseTemp($event, 'temp')"
              toggle-color="primary"
              :options="[
                {label: 'all', value: 'all'},
                {label: 'month', value: 'month'},
                {label: 'week', value: 'week'},
                {label: 'today', value: 'today'}
              ]"
            />
          </q-card-actions>
        </q-card>
      </div>
      <div class="col-6">
        <q-card inline style="max-width: 100%">
          <q-card-media style="max-height: 250px">
            <img src="~assets/humidity.jpg">
            <q-card-title slot="overlay">
              Humidity
              <span slot="subtitle">some like it wet</span>
            </q-card-title>
          </q-card-media>
          <q-card-main>
            <line-chart
              v-if="loaded"
              :datacollection="datacollection_humidity"
              :options="options_humidity"
            ></line-chart>
          </q-card-main>
          <q-card-separator/>
          <q-card-actions align="center">
            <q-btn-toggle
              v-model="toggle_humidity"
              v-on:input="chooseTemp($event, 'humidity')"
              toggle-color="primary"
              :options="[
                {label: 'all', value: 'all'},
                {label: 'month', value: 'month'},
                {label: 'week', value: 'week'},
                {label: 'today', value: 'today'}
              ]"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style>
</style>

<script>
import LineChart from "../components/LineChart.js";
import moment from "moment";
export default {
  name: "PageIndex",
  components: {
    LineChart
  },
  data() {
    return {
      loaded: false,
      toggle_temp: "all",
      toggle_humidity: "all",
      datacollection_humidity: null,
      fetcheddatacollection: null,
      datacollection_temp: null,
      startOfToday: moment().startOf("day"),
      startOfLastWeek: moment()
        .subtract(7, "days")
        .startOf("day"),
      startOfLastMonth: moment()
        .subtract(30, "days")
        .startOf("day")
    };
  },
  mounted() {
    // this.fetchData();
  },
  created() {
    this.fetchData();
  },
  methods: {
    // fillData() {},
    filterData(id, event) {
      if (id === "temp") {
        const datacollection_temp = {
          labels: this.fetcheddatacollection
            .filter(obj => moment(obj.time).isAfter(this.getTempFilter()))
            .map(obj => obj.time),
          datasets: [
            {
              label: "Temperature",
              backgroundColor: "#f87979",
              data: this.fetcheddatacollection
                .filter(obj => moment(obj.time).isAfter(this.getTempFilter()))
                .map(obj => obj.temp)
            }
          ]
        };
        this.datacollection_temp = datacollection_temp;
      }
      if (id === "humidity") {
        const datacollection_humidity = {
          labels: this.fetcheddatacollection
            .filter(obj => moment(obj.time).isAfter(this.getTempFilter()))
            .map(obj => obj.time),
          datasets: [
            {
              label: "Humidity",
              backgroundColor: "#000",
              data: this.fetcheddatacollection.map(obj => obj.humidity)
            }
          ]
        };
        this.datacollection_humidity = datacollection_humidity;
      }
    },
    chooseTemp(event, id) {
      this.filterData(id, event);
    },
    getTempFilter() {
      switch (this.toggle_temp) {
        case "all":
          return moment("1970-01-01");
          break;
        case "month":
          return this.startOfLastMonth;
          break;
        case "week":
          return this.startOfLastWeek;
          break;
        case "today":
          return this.startOfToday;
          break;
        default:
          return "";
      }
    },
    getHumidityFilter() {},
    fetchData() {
      this.loaded = false;

      this.$axios
        .get("http://localhost:3000")
        .then(response => {
          return response.data;
        })
        .then(response => {
          this.fetcheddatacollection = response;
          const datacollection_temp = {
            labels: response.map(obj => obj.time),
            datasets: [
              {
                label: "Temperature",
                backgroundColor: "#f87979",
                data: response.map(obj => obj.temp)
              }
            ]
          };
          console.log(datacollection_temp);
          const datacollection_humidity = {
            labels: response.map(obj => obj.time),
            datasets: [
              {
                label: "Humidity",
                backgroundColor: "#000",
                data: response.map(obj => obj.humidity)
              }
            ]
          };
          this.datacollection_humidity = datacollection_humidity;
          this.datacollection_temp = datacollection_temp;
          this.options_humidity = {
            scales: {
              xAxes: [
                {
                  type: "time",
                  distribution: "linear"
                }
              ],
              yAxes: [
                {
                  scaleLabel: {
                    display: true
                  },
                  ticks: {
                    callback: function(value, index, values) {
                      return value + "%";
                    }
                  }
                }
              ]
            }
          };
          this.options_temp = {
            scales: {
              xAxes: [
                {
                  type: "time",
                  distribution: "linear"
                }
              ],
              yAxes: [
                {
                  scaleLabel: {
                    display: true
                  },
                  ticks: {
                    callback: function(value, index, values) {
                      return value + "°C";
                    }
                  }
                }
              ]
            }
          };
          this.loaded = true;
        })
        .catch(e => {
          console.log(e);
          this.$q.notify({
            color: "negative",
            position: "top",
            message: "Could not fetch.",
            icon: "report_problem"
          });
        });
    }
  }
};
</script>
