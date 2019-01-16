import { Line } from 'vue-chartjs';

export default {
  extends: Line,
  props: {
    datacollection: {
      type: Object,
      default: null
    },
    options: {
      type: Object,
      default: null
    }
  },
  mounted() {
    this.renderChart(this.datacollection, this.options, {responsive: true})
  }
}