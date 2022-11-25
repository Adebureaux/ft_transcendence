<template>
    <q-item class="message" v-ripple :item="message">
      <!-- <UserCard :item="message?.identity"/> -->

      <q-item-section class="avatar absolute-top">
        <q-img :src="message?.identity?.avatar" width="42px" height="42px" img-class="image"/>
      </q-item-section>

      <q-item-section class="datas">

        <q-item-section class="layer_1">
          <span class="name">{{ message?.identity?.name }}</span>
          <span class="date">{{ getRelativeDate(message?.timestamp) }}</span>
        </q-item-section>

        <q-item-section class="layer_2">
          <span class="body">{{ message?.body }}</span>
        </q-item-section>

      </q-item-section>
      <!-- <q-item-section class="body">

      </q-item-section>
      <q-item-section class="date">
      </q-item-section> -->
    </q-item>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { IMessage } from '../../models/models'
import UserCard from '../common/UserCard.vue'

export default defineComponent({
  name: 'Message',
  components: { UserCard },
  props: {
    message: {
      type: Object as PropType<IMessage>,
      required: true
    }
  },
  data() {
    return {

    }
  },
  mounted() {
  },
  methods: {
    getRelativeDate(cdate: Date): string {
      let diff : number = (new Date().getTime() - cdate.getTime()) / (3600 * 1000)
      if (diff < 24.)
        return 'Aujourd\'hui à '+cdate.getHours()+':'+cdate.getMinutes()
      else if (diff < 48.)
        return 'Hier à '+cdate.getHours()+':'+cdate.getMinutes()
      return cdate.toLocaleString()
    }
  },
});
</script>

<style lang="sass">
.avatar
  max-width: 42px !important
  margin-top: 10px
  margin-left: 10px

.layer_1
  display: table-cell

// .layer_2
.name
  font-weight: bold
  font-size: 16px
  color: white
  margin: 3px
  margin-right: 10px

.datas
  padding-left: 2vw

// .date

.body
  color: white
</style>
