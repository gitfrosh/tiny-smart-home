<template>
  <div id="q-app">
    <router-view v-if="isLoggedIn" />
    <Login v-else @Login::loginResult="handleLoginResult"/>
  </div>
</template>

<script>
import Login from './pages/Login'

export default {
  name: 'App',
    components: {
    Login
  },
  data() {
    return {
      userIsLoggedIn: false
    }
  },
  computed: {
    isLoggedIn() {
      return this.userIsLoggedIn
    }
  },
  methods: {
    handleLoginResult({loginResult}) {
      this.userIsLoggedIn = loginResult
    }
  }
};
</script>

<style>
</style>
