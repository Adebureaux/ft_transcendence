<template>
<div class="doc-container"  style="margin:auto; margin-bottom:6px;">
  <div class="row">
    <q-item clickable @click=goProfilePage(pOne) class="col">
      <q-tooltip anchor="center middle" self="center right">{{ pOne }}'s profile</q-tooltip>
      <q-item-section avatar>
          <q-avatar class="avatar" :style="`background-color: ${$utils.usernameToColor(pOne || 'pOne')};`">
              <q-img :src="avatarOne"/>
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label class="label username">{{pOne}}</q-item-label>
        </q-item-section>
      </q-item>
      <q-separator class="mobile-hide" vertical inset color="white"/>
      <q-item class="col-2">
        <q-item-section>
          <q-item-label class="bigger score"><span v-bind:class=status>{{status}}</span></q-item-label>
          <q-item-label class="label score">{{scoreOne}} - {{scoreTwo}}</q-item-label>
        </q-item-section>
      </q-item>
    <q-separator class="mobile-hide" vertical inset color="white"/>
    <q-item clickable @click=goProfilePage(pTwo) class="col">
      <q-tooltip anchor="center middle" self="center left">{{ pTwo }}'s profile</q-tooltip>
      <q-item-section>
        <q-item-label class="right label username">{{pTwo}}</q-item-label>
      </q-item-section>
      <q-item-section avatar>
        <q-avatar class="avatar"  :style="`background-color: ${$utils.usernameToColor(pTwo || 'pTwo')};`">
            <q-img :src="avatarTwo"/>
          </q-avatar>
        </q-item-section>
      </q-item>
  </div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MatchHistory',
  props: {
    status : { type: String , default: 'Defeat' },
    pOne : { type: String , default: '' },
    pTwo : { type: String , default: '' },
    scoreOne : { type: Number, default: 0 },
    scoreTwo : { type: Number, default: 0 }
  },
  methods: {
    goProfilePage(username : string) {
      this.$router.push({
        path: '/profile/' + username,
      })
    }
  },
  data () {
    return {
      avatarOne: '/api/avatar/' as string,
      avatarTwo: '/api/avatar/' as string
    }
  },
  created () {
    this.avatarOne += `${this.pOne}/medium`
    this.avatarTwo += `${this.pTwo}/medium`
  },
  updated () {
    this.avatarOne = `/api/avatar/${this.pOne}/medium`
    this.avatarTwo = `/api/avatar/${this.pTwo}/medium`
  }
})
</script>

<style lang="sass" scoped>
@use "../../../css/interpolate" as r

.score
  text-align: center
  color: white

.Draw
  color: $orange

.Victory
  color: $green

.Defeat
  color: $red

.username
  color: white

.right
  text-align: right

.avatar
  @include r.interpolate(font-size, 320px, 2560px, 35px, 75px)

.q-item
  @include r.interpolate(padding, 320px, 2560px, 2px, 15px)

.q-item__section--side
  @include r.interpolate(padding, 320px, 2560px, 2px, 15px)

.q-item__section--avatar
  min-width: 2.5rem

.doc-container
  @include r.interpolate(width, 320px, 2560px, 300px, 1200px)
  @include r.interpolate((margin-top, margin-bottom), 320px, 2560px, 12px, 50px)
  @include r.interpolate((margin-left, margin-right), 320px, 2560px, 20px, 30px)
  background-color: $grey-8
  border-radius: 25px
</style>
