<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page padding>
        <q-card inline style="max-width: 30%">
          <q-card-title>
            Login
            <span slot="subtitle">to Tiny Smart Home</span>
          </q-card-title>
          <q-card-main>
            <q-input type="text" name="username" v-model="form.username" float-label="Username"/>
            <q-input
              type="password"
              name="password"
              v-model="form.password"
              float-label="Password"
            />
          </q-card-main>
          <q-card-actions>
            <q-btn color="primary" @click="logIn">Submit</q-btn>
          </q-card-actions>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { required, email } from "vuelidate/lib/validators";
export default {
  name: "Login",
  data() {
    return {
      form: {
        username: "",
        password: ""
      }
    };
  },
  validations: {
    form: {
      username: { required },
      password: { required }
    }
  },
  methods: {
    loginFail() {
      this.$q.notify({
        color: "negative",
        position: "top",
        message: "Could not login.",
        icon: "report_problem"
      });
    },
    logIn() {
      this.$v.form.$touch();

      if (this.$v.form.$error) {
        this.$q.notify("Please review fields again.");
        return;
      } else {
        this.$axios
          .get(
            process.env.ROOT_URL +
              "login?username=" +
              this.form.username +
              "&password=" +
              this.form.password
          )
          .then(response => {
            return response.data;
          })
          .then(response => {
            console.log(response);
            if (response === "login success!") {
              this.$emit("Login::loginResult", { loginResult: true });
            } else {
              this.loginFail();
            }
          })
          .catch(e => {
            console.log(e);
            this.loginFail();
          });
      }
    }
  }
};
</script>