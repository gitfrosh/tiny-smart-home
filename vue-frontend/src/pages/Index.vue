<template>
  <q-page padding class="docs-input row justify-center">
    <div class="row gutter-sm">
      <div class="col-12 col-sm-6">
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
      <div class="col-12 col-sm-6">
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
    Event.$on("refetchEvent", () => {
      this.fetchData();
    });
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
            .filter(obj =>
              moment(obj.time).isAfter(this.getFilter(this.toggle_temp))
            )
            .map(obj => obj.time),
          datasets: [
            {
              fill: false,
              spanGaps: true,
              label: "Temperature Child's Room",
              backgroundColor: "#f87971",
              data: this.fetcheddatacollection
                .filter(obj =>
                  moment(obj.time).isAfter(this.getFilter(this.toggle_temp))
                )
                .map(obj =>
                  obj.room === process.env.CHILDRENS_ROOM_ID
                    ? obj.temp
                    : Number.NaN
                )
            },
            {
              fill: false,
              spanGaps: true,
              label: "Temperature Sleeping Room",
              backgroundColor: "#ff9a35",
              data: this.fetcheddatacollection
                .filter(obj =>
                  moment(obj.time).isAfter(this.getFilter(this.toggle_temp))
                )
                .map(obj =>
                  obj.room === process.env.SLEEPING_ROOM_ID
                    ? obj.temp
                    : Number.NaN
                )
            }
          ]
        };
        this.datacollection_temp = datacollection_temp;
      }
      if (id === "humidity") {
        const datacollection_humidity = {
          labels: this.fetcheddatacollection
            .filter(obj =>
              moment(obj.time).isAfter(this.getFilter(this.toggle_humidity))
            )
            .map(obj => obj.time),
          datasets: [
            {
              fill: false,
              spanGaps: true,
              label: "Humidity Child's Room",
              backgroundColor: "#57a6db",
              data: this.fetcheddatacollection
                .filter(obj =>
                  moment(obj.time).isAfter(this.getFilter(this.toggle_humidity))
                )
                .map(obj =>
                  obj.room === process.env.CHILDRENS_ROOM_ID
                    ? obj.humidity
                    : Number.NaN
                )
            },
            {
              fill: false,
              spanGaps: true,
              label: "Humidity Sleeping Room",
              backgroundColor: "#57a65a",
              data: this.fetcheddatacollection
                .filter(obj =>
                  moment(obj.time).isAfter(this.getFilter(this.toggle_humidity))
                )
                .map(obj =>
                  obj.room === process.env.SLEEPING_ROOM_ID
                    ? obj.humidity
                    : Number.NaN
                )
            }
          ]
        };
        this.datacollection_humidity = datacollection_humidity;
      }
    },
    chooseTemp(event, id) {
      this.filterData(id, event);
    },
    getFilter(option) {
      switch (option) {
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
    fetchData() {
      this.loaded = false;
      this.toggle_temp = "all";
      this.toggle_humidity = "all";
      console.log("fetch ", process.env.ROOT_URL + "api");
      this.$axios
        .get(process.env.ROOT_URL + "api")
        .then(response => {
          return response.data;
        })
        .then(response => {
          this.fetcheddatacollection = response;
          const datacollection_temp = {
            labels: response.map(obj => (obj.time ? obj.time : Number.NaN)),
            datasets: [
              {
                fill: false,
                spanGaps: true,
                label: "Temperature Child's Room",
                backgroundColor: "#f87971",
                data: response.map(obj =>
                  obj.room === process.env.CHILDRENS_ROOM_ID
                    ? obj.temp
                    : Number.NaN
                )
              },
              {
                fill: false,
                spanGaps: true,
                label: "Temperature Sleeping Room",
                backgroundColor: "#ff9a35",
                data: response.map(obj =>
                  obj.room === process.env.SLEEPING_ROOM_ID
                    ? obj.temp
                    : Number.NaN
                )
              }
            ]
          };
          const datacollection_humidity = {
            labels: response.map(obj => (obj.time ? obj.time : Number.NaN)),
            datasets: [
              {
                fill: false,
                spanGaps: true,
                label: "Humidity Child's Room",
                backgroundColor: "#57a6db",
                data: response.map(obj =>
                  obj.room === process.env.CHILDRENS_ROOM_ID
                    ? obj.humidity
                    : Number.NaN
                )
              },
              {
                fill: false,
                spanGaps: true,
                label: "Humidity Sleeping Room",
                backgroundColor: "#57a65a",
                data: response.map(obj =>
                  obj.room === process.env.SLEEPING_ROOM_ID
                    ? obj.humidity
                    : Number.NaN
                )
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
                    beginAtZero: true,
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
