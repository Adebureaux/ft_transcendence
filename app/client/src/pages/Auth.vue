<template>
  <q-page class="row justify-center items-center q-flex">
    <q-card v-if="state === 'loginOrSignup'" class="form q-pa-lg" style="width: 400px">
      <q-btn-toggle v-model="signOpt" @click="switchMode" spread class="my-custom-toggle q-pa-md" no-caps rounded
        unelevated toggle-color="primary" color="#F7F7FF" text-color="primary" :options="[
          { label: 'SIGN IN', value: true },
          { label: 'SIGN UP', value: false },
        ]" />

      <q-form v-if="signOpt" @submit="onSubmitSignIn" class="q-gutter-md">
        <q-input class="input" filled v-model="username" label="Username" lazy-rules maxlength="20"/>

        <q-input class="input" filled v-model="password" label="Password" lazy-rules type="password" autocomplete="on"
          current-password maxlength="42"/>
        <q-card-actions class="q-mt-md">
          <q-btn label="Connect" type="submit" color="primary" class="submitbutton" />
        </q-card-actions>
        <!-- <q-card-actions>
          <q-btn label="Connect with 42" @click="onSubmitSignIn42" color="primary" class="submitbutton" />
        </q-card-actions> -->
      </q-form>

      <q-form v-else @submit="onSubmitSignUp" @submit42="onSubmitSignIn42" class="q-gutter-md">
        <q-input class="input" filled v-model="username" label="Username" lazy-rules maxlength="20" />

        <q-input class="input" filled v-model="email" label="Email" lazy-rules maxlength="30" />

        <q-input class="input" filled v-model="password" label="Password" lazy-rules type="password" autocomplete="on" maxlength="42"/>
        <q-card-actions class="q-mt-md">
          <q-btn label="signup" type="submit" color="primary" class="submitbutton" />
        </q-card-actions>
      </q-form>
      <!-- <q-form>
        <q-card class="q-pa-md q-ma-sm text-center text-bold text-h6" v-for="user in preSetUsers" :key="user"
          @click="quickconnect(user)">
          {{ (user as preset).username }}
        </q-card>
      </q-form> -->
    </q-card>
    <q-card v-else-if="state === 'twoFA'" class="form q-pa-lg" style="width: 400px">
      <q-form @submit="submit2FAcode" class="q-gutter-md">
        <q-input class="input" mask="### ###" unmasked-value filled v-model="twoFACode" label="2FA Code" maxlength="7"/>

        <q-card-actions class="q-mt-md">
          <q-btn label="Connect" type="submit" color="primary" class="submitbutton" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
// type preset = { username: string; password: string };
// const _preSetUsers: preset[] = [
//   {
//     username: "Alice99",
//     password: "null",
//   },
//   {
//     username: "admin",
//     password: "null",
//   },
//   {
//     username: "Victor",
//     password: "null",
//   },
// ];

export default defineComponent({
  name: "Auth",
  components: {},

    data() {
    this.$route.name == "auth";
    return {
      state: ref(this.$route.name == "auth" ? "loginOrSignup" : "auth42loading"),
      twoFAToken: ref(""),
      twoFACode: "",
      // preSetUsers: _preSetUsers as [],
      username: "" as string,
      password: "" as string,
      email: "" as string,
      signOpt: true as boolean,
    };
  },
  async beforeMount() {
    if (this.$route.name === "42callback") {
      await this.$api
        .signin42(this.$route.query.code as string)
        .then((res) => {
          this.$router.replace("/");
        })
        .catch((error) => {
          if (error?.response?.status) {
            if (error.response.status === 401) {
              if (error.response.data.message[0] === "2fa needed") {
                this.state = "twoFA";
                this.twoFAToken = error.response.data.message[1];
              }
            } else {
              for (let message of error?.response?.data?.message || []) {
                this.$q.notify({
                  type: "negative",
                  message,
                });
              }
              this.state = "loginOrSignup";
            }
          }
        });
    }
  },
  methods: {
    quickconnect(user: any) {
      this.username = user.username;
      this.password = user.password;
      this.onSubmitSignIn();
    },
    switchMode() {
      this.username = "";
      this.password = "";
      this.email = "";
    },

    submit2FAcode() {
      this.$api
        .login2fa({ code: this.twoFACode, token: this.twoFAToken })
		.then(() => {
			this.twoFACode = "";
			this.twoFAToken = "";
			this.$router.replace({ path: "/" });
		})
        .catch((err) => {
          this.twoFACode = "";
		  if (err?.response?.status === 417) {
			this.twoFAToken = "";
			this.$q.notify({
              type: "negative",
              message: "Token expired",
            });
			this.state = "loginOrSignup";
		  }
		else if (err?.response?.status === 400) {
			this.twoFACode = "";
			this.$q.notify({
				type: "warning",
				message: "Invalid 2FA code",
			});
		}
        })

    },
    signIn(username: string, password: string) {
      let payload: object = Object({
        username: username,
        password: password,
      });
      this.$api
        .login(payload)
        .then(() => {
          this.$router.replace({ path: "/" });
        })
        .catch((error) => {
          if (error?.response?.status) {
            if (error.response.status === 401) {
              if (error.response.data.message[0] === "2fa needed") {
                this.state = "twoFA";
                this.twoFAToken = error.response.data.message[1];
              }
            } else {
              for (let message of error?.response?.data?.message || []) {
                this.$q.notify({
                  type: "negative",
                  message,
                });
              }
            }
          }
        });
    },
    onSubmitSignIn() {
      this.signIn(this.username, this.password);
    },
    onSubmitSignUp() {
      let payload: object = Object({
        username: this.username,
        email: this.email,
        password: this.password,
      });

      this.$api
        .signup(payload)
        .then(() => {
          this.$router.replace({ path: "/" });
        })
        .catch((error) => {
          for (let message of error?.response?.data?.message || []) {
            this.$q.notify({
              type: "negative",
              message,
            });
          }
        });
    },
    onSubmitSignIn42() {
      this.$api.axiosInstance
        .get("auth/42authURI")
        .then((res) => {
          window.location.href = res.data.uri;
        })
        .catch((err) => {
          this.$q.notify({
            type: "negative",
            message: "Auth 42 Unavailable",
          });
        });
    },
  },
});
</script>

<style lang="sass" scoped>
.form
  justify-content: center
  align-items: center
  background-color: $bg-secondary

.input
  background-color: white

.submitbutton
  width: 100%

.q-flex
  display: flexbox
</style>
