<template>
  <div class="notif-count justify-center items-center circle" v-if="nc.notifications.size > 0" />
  <div class="notif-count justify-center items-center" v-if="nc.notifications.size > 0">
    {{ nc.notifications.size < 99 ? nc.notifications.size : "99+" }} </div>
      <q-menu anchor="bottom left" class="notifmenu hide-scrollbar">
        <q-item class="n-info">
          <q-item-section class="items-center text-h6">{{ nc.notifications.size }}
            notification(s)</q-item-section>
          <q-space />
          <q-btn icon="cancel" flat @click="nc.clear()" v-if="nc.notifications.size > 0" />
        </q-item>
        <q-list class="n-list">
          <q-item v-for="[key, tmp] of nc.notifications" :key="key" class="row notif-item q-ma-sm"
            :class="notifcolor(tmp.options)">
            <q-img v-if="tmp.options.avatar" :src="tmp.options.avatar" class="notify-avatar q-mr-sm" />
            <q-item-section class="notify-message">
              {{ tmp.options.message }}
              <q-separator />
              {{ $utils.getRelativeDate(tmp.createdAt) }}
            </q-item-section>

            <q-space />

            <q-btn icon="cancel" flat @click="nc.pop(tmp.id)" />
          </q-item>
        </q-list>
      </q-menu>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ncc, { NotifyOptions } from "src/services/notifyCenter";

export default defineComponent({
  name: 'NotifyCenter',
  components: {},
  data() {
    return {
      nc: ncc,
    }
  },
  methods: {
    notifcolor(options: NotifyOptions) {
			if (options.type) {
				switch (options.type) {
					case "info":
						return "n-info";
					case "negative":
						return "n-negative";
					case "positive":
						return "n-positive";
					case "warning":
						return "n-warning";
					case "message":
						return "n-message";
				}
			}
			return "n-other";
		},
  },
});
</script>

<style scoped lang="sass">

.notify-avatar
  border-radius: 100px
  width: 42px
  height: 42px

.notif-item
  color: black

.n-info
  background-color: $grey-7

.n-negative
  background-color: $red

.n-positive
  background-color: $green

.n-warning
  background-color: $yellow

.n-other
  background-color: $grey-7

.n-message
  background-color: $yellow-4

.notif-count
  width: 20px
  height: 20px
  position: absolute
  margin-bottom: 29px
  margin-left: 22px
  font-size: 14px
  font-weight: bold
  color: white

.circle
  background-color: red
  border-radius: 100px
  margin-bottom: 24px

.n-info
  background-color: $bg-primary
  z-index: 1
  position: fixed
  width: 420px

.n-list
  margin-top: 60px
</style>
