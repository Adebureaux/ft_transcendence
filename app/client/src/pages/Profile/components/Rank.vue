<template>
<div>
  <q-item>
    <q-item-section>
      <q-img class="rank-img" :src="`/rank/${setRank(victory, defeat)}.png`"/>
      <q-item-label class="press2p label rank">{{setRank(victory, defeat)}}</q-item-label>
    </q-item-section>
  </q-item>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Rank',
  components: { },
  props: {
      victory : { type: Number , default: 0  },
      defeat  : { type: Number , default: 0  }
  },
  methods: {
    setRank(v: number, d: number) : string {
      const ratio : number = v / (v + d)

      if ((v + d) >= 10) {
        if (ratio < 1/3)
          return ('Bronze')
        else if (ratio > 2/3)
          return ('Gold')
        else
          return ('Silver')
      }
      else
        return('Unranked')
    }
  },
})
</script>

<style lang="sass" scoped>
@use "../../../css/interpolate" as r

.rank-img
  @include r.interpolate(width, 320px, 2560px, 60px, 125px)
  display: block
  margin-left: auto
  margin-right: auto

.rank
  text-align: center
</style>
