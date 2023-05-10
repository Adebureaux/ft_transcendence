<template>
  <div class="dialog q-pa-md">
    <div class="close-cross">
      <q-btn class="cross absolute-right" color="orange" icon="close" flat round v-close-popup />
    </div>
    <div class="q-px-xl r-py-md">
      <q-item-section>
        <q-item-label class="bigger press2p">Settings</q-item-label>
      </q-item-section>
    </div>
    <q-item class="justify-center centers q-px-xl r-pt-md">
      <q-uploader
        auto-upload         url="/api/avatar/"     ref="uploader" max-file-size="2048000"
        hide-upload-btn     field-name="avatar"    label="Change avatar"
        color="black"       @uploaded="onUploaded"
        class="uploader"    :filter="imgOnly"      @rejected="onRejected"
        >
        <template v-slot:list="scope">
          <img v-if="avatar" class="avatar" :src=avatar style="background-color: grey;">
          <q-inner-loading v-else :showing=true label="Please wait..." />
        </template>
      </q-uploader>
    </q-item>
    <q-item class="justify-center">
      <q-btn color="white" label="Remove Avatar" flat icon="delete" @click="confirmRemoveAvatar = true" />
    </q-item>
    <div class="q-pa-md">
      <q-input dark color="white" label="Change username" v-model="username" maxlength="20">
        <q-btn color="green" type="submit" flat rounded label="ok" @click="confirmChangeUsername = true" />
      </q-input>
    </div>
    <q-item class="justify-center q-pb-md">
      <q-checkbox color="orange" v-model="twoFA" @update:model-value="onUpdate">
        <q-item-label class="label text-white">Two factor authentification</q-item-label>
      </q-checkbox>
      <!-- QR-DIALOG -->
      <q-dialog persistent allow-focus-outside v-model="qrcode">
        <div class="dialog">
          <div class="q-px-xl r-py-md">
            <q-item-label class="label press2p">QR-CODE</q-item-label>
          </div>
          <q-item class="flex-center">
            <q-img src="/api/auth/2FA/generate" width="200px" />
          </q-item>
          <q-item>
            <q-item-label class="text-white">Please scan this QR code with your authenticator</q-item-label>
          </q-item>
          <q-item class="flex-center">
            <q-input item-aligned label="Validation code" dark color="white" v-model="validateQrcode" maxlength="7" mask="### ###" unmasked-value>
              <q-btn flat rounded color="green" type="submit" label="ok" @click="sendCode"/>
            </q-input>
          </q-item>
          <q-item class="flex-center q-pb-md">
            <q-btn color="orange" outline label="cancel" @click="cancelQRCode" icon="mdi-cancel" />
          </q-item>
        </div>
      </q-dialog>
      <!-- end QR-DIALOG -->
    </q-item>
    <q-item>
      <q-btn class="absolute-center logout" @click="confirmLogout = true" outline color="orange" label="logout" icon="logout"/>
    </q-item>
    <q-dialog persistent v-model=confirmLogout>
      <Confirm what="logout" :accept=logout />
    </q-dialog>
    <q-dialog persistent v-model=confirmRemoveAvatar>
      <Confirm what="remove your avatar" :accept=removeAvatar />
    </q-dialog>
    <q-dialog persistent v-model="confirmChangeUsername">
      <Confirm :what="`change your username to ${username}`" :accept="changeUsername" />
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { QRejectedEntry } from 'quasar'
import Confirm from './Confirm.vue'

interface UploadObject {
  files: readonly any[]
}

export default defineComponent({
  name: 'Settings',
  components : { Confirm },
  setup () {
    const confirmLogout = ref(false)
    const confirmRemoveAvatar = ref(false)
    const confirmChangeUsername = ref(false)
    const qrcode = ref(false)
    return {
      confirmLogout,
      confirmRemoveAvatar,
      confirmChangeUsername,
      qrcode
    }
  },
  data() {
    return {
      profile: [] as any,
      avatar: '' as string,
      twoFA: false as Boolean,
      refresh: 0 as number,
      username: '' as string,
      validateQrcode: '' as string,
      $refs: undefined as any,
    }
  },
  created() {
    this.fetchMe()
  },

  methods: {
    logout() {
      this.$router.push("/logout")
    },
    fetchMe() {
      this.$api.me()
        .then((result) => {
          this.profile = result
          this.username = this.$store.username
          this.avatar = `/api/avatar/${this.$store.username}/medium?${this.refresh++}`
          this.twoFA = this.$store.twoFA
        })
        .catch((error) => {
        })
    },
    removeAvatar() {
      this.$api.delete('avatar')
        .then((res) => {
          if (res.data === true) {
            this.$store.notifCenter.send({
              type: 'warning',
              message: 'Avatar is already set as default'
            })
          }
          else {
            this.$store.notifCenter.send({
              type: 'positive',
              message: 'Avatar successfully removed'
            })
            this.avatar = `/api/avatar/${this.$store.username}/medium?${this.refresh++}`
          }
          this.$refs.uploader.reset()
        })
        .catch(() => {})
    },
    changeUsername() {
      if (this.username !== this.$store.username) {
        this.$api.changeUsername(this.username)
          .then(() => {
            this.$store.notifCenter.send({
              type: 'positive',
              message: 'Username successfully changed'
            })
          })
          .catch((err) => {
            if (err?.response?.data?.message) {
              this.$store.notifCenter.send({
                message: `Unable to change your username: ${err.response.data.message}`,
                type: 'warning',
              })
            } else {
              this.$store.notifCenter.send({
                message: `Unable to change your username`,
                type: 'warning',
              })
            }
          })
      }
      else {
        this.$store.notifCenter.send({
          type: 'warning',
          message: `Your username is already "${this.username}"`
        })
      }
    },
    sendCode () {
      this.$api.axiosInstance.post('/auth/2FA/validate', { code: this.validateQrcode })
      .then(() => {
      this.validateQrcode = '';
      this.$store.twoFA = true;
      this.$store.notifCenter.send({
          type: 'positive',
          message: "2FA Successfuly Enabled"
        })
        this.qrcode = false
      })
      .catch ((e) => {
        this.validateQrcode = ''
        this.$store.notifCenter.send({
          type: 'negative',
          message: e.response.data.message[0]
        })
      })
    },
    cancelQRCode () {
      this.qrcode = false
      this.twoFA = false
    },
    imgOnly(files: readonly any[] | FileList): readonly any[] {
      if (files[0].type === 'image/png' || files[0].type === 'image/jpg' || files[0].type === 'image/jpeg')
        return (files as readonly any[])
      return ([])
    },
    onUploaded(info: UploadObject) {
      this.$store.notifCenter.send({
        type: 'positive',
        message: 'Avatar successfully uploaded'
      })
      this.$refs.uploader.removeUploadedFiles()
      this.avatar = `/api/avatar/${this.$store.username}/medium?${this.refresh++}`
    },
    onUpdate(value: boolean, evt: Event) {
      if (value === true)
        this.qrcode = true
      else
        this.$api.axiosInstance.post('/auth/2FA/deactivate').catch(() => {})
      // Delete this string after backend
    },
    onRejected(rejectedEntries: QRejectedEntry[]) {
      if (rejectedEntries[0].failedPropValidation === 'filter') {
        this.$store.notifCenter.send({
          type: 'negative',
          message: 'The file should be an image (.jpg, .jpeg or .png)'
        })
      }
      else {
        this.$store.notifCenter.send({
          type: 'warning',
          message: 'This file has already been downloaded Or the constraints are not fulfilled'
        })
      }
    }
  }
})
</script>

<style lang="sass">
.q-uploader__list
  padding: 0px
  overflow: hidden
</style>

<style lang="sass" scoped>

.avatar
  object-fit: cover
  width: 100%
  height: 100%

.uploader
  width: 224px
  min-height: 240px
  max-height: 100%

.logout
  width: 80%
</style>
