<template>
  <q-layout view="lHh Lpr lFf">
    <q-layout-header>
      <q-toolbar>
        <q-btn flat dense round @click="leftDrawerOpen = !leftDrawerOpen" aria-label="Menu">
          <q-icon name="menu"/>
        </q-btn>

        <q-toolbar-title>Tiny Smart Home
          <div slot="subtitle">Running on Quasar v{{ $q.version }}</div>
        </q-toolbar-title>
        <q-btn
          flat
          round
          dense
          icon="update"
          @click="refetch"
          aria-label="Toggle menu on right side"
        />
      </q-toolbar>
    </q-layout-header>

    <q-layout-drawer
      v-model="leftDrawerOpen"
      :content-class="$q.theme === 'mat' ? 'bg-grey-2' : null"
    >
      <q-list no-border link inset-delimiter>
        <q-list-header>Navigation</q-list-header>
        <q-item to="/">
          <q-item-side icon="home"/>
          <q-item-main label="Home" sublabel="Go back"/>
        </q-item>
        <q-item to="/settings">
          <q-item-side icon="view_array"/>
          <q-item-main label="Settings" sublabel="Whatever fits"/>
        </q-item>
        <q-item to="/about">
          <q-item-side icon="pin_drop"/>
          <q-item-main label="About" sublabel="...this"/>
        </q-item>
        <q-item-separator/>
        <q-item @click.native="logout">
          <q-item-side icon="logout"/>
          <q-item-main label="Logout"/>
        </q-item>
      </q-list>
    </q-layout-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script>
import { openURL } from "quasar";

export default {
  name: "MyLayout",
  data() {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop
    };
  },
  methods: {
    refetch: function() {
      Event.$emit("refetchEvent");
    },
    logout: function() {
      console.log('dfsf')
      this.$axios
        .get(process.env.ROOT_URL + "logout")
        .then(response => {
          return response.data;
        })
        .then(response => {
          console.log(response);
          this.$emit("Login::loginResult", { loginResult: false });
          this.$router.go('/'); 
        })
        .catch(e => {
          this.$q.notify({
            color: "negative",
            position: "top",
            message: "Could not logout",
            icon: "report_problem"
          });
        });
    }
  },
  openURL
};
</script>

<style>
</style>
