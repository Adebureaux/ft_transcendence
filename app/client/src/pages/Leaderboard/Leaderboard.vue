<template>
  <q-page>
    <div class="press2p text-center q-py-lg grandtitle">
      LeaderBoard
    </div>
    <q-btn-toggle
      class="justify-center"
      v-model="model"
      toggle-color="orange-7"
      :options="[
        { value: 'Username' , slot: 'username' },
        { value: 'Victory'  , slot: 'victory' },
        { value: 'Defeat'   , slot: 'defeat' },
        { value: 'Ratio'    , slot: 'ratio' },
      ]"
    >
      <template v-slot:[`${opt.slot}`] v-for="opt of sortoption" :key="opt.value">
        <div class="column items-center no-wrap r-mx-md" style="" @click="sortboard(opt.value)">
          <div class="press2psm" v-if="!!opt?.labels">
            {{ opt.labels }}
          </div>
          <q-icon :name="sorting(opt.value)" :color="sorttype ? 'green' : 'red'" class="iconsize"/>
        </div>
      </template>

    </q-btn-toggle>
    <q-list class="board">
      <LeaderCard v-for="(user, index) of users" :key="user.username"
        class=""
        :user="user"
        :rank="index"
      />
    </q-list>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import LeaderCard from './components/LeaderCard.vue'
import { UserBoard } from 'src/stores/store.types'

const sortoption = [
  { value: 'username', slot: 'username', labels: 'Username'  },
  { value: 'victory' , slot: 'victory' , labels: 'Victory'   },
  { value: 'defeat'  , slot: 'defeat'  , labels: 'Defeat'    },
  { value: 'ratio'   , slot: 'ratio'   , labels: 'Ratio'     },
]

export default defineComponent({
  name: 'Leaderboard',
  components: { LeaderCard },
  props: {},
  data() {
    return {
      users: [] as UserBoard[],
      sortindex: 'ratio',
      sorttype: false,
      sortoption,
      model: 'ratio',
    }
  },
  computed: {
  },
  methods: {
    getRatio(user: UserBoard) : number {
      let ret = (user.victoriesAsPOne + user.victoriesAsPTwo) / (user.victoriesAsPOne + user.victoriesAsPTwo + user.defeatsAsPOne + user.defeatsAsPTwo)
      if (isNaN(ret))
        return 0
      return ret
    },
    getVictory(user: UserBoard) { return user.victoriesAsPOne + user.victoriesAsPTwo },
    getDefeat(user: UserBoard) { return user.defeatsAsPOne + user.defeatsAsPTwo },
    sorting(i: string) {
      if (i == this.sortindex)
        return this.sorttype ? 'mdi-arrow-up-thin' : 'mdi-arrow-down-thin'
      return ''
    },
    sortboard(i: string) {
      if (this.sortindex == i) {
        this.sorttype = !this.sorttype
      } else {
        this.sortindex = i
        this.sorttype = true
      }
      switch (this.sortindex) {
        case 'username': this.users = this.users.sort((a: UserBoard, b: UserBoard) => { return a.username < b.username ? (this.sorttype ? -1 : 1) : (this.sorttype ? 1 : -1) }); break;
        case 'victory' : this.users = this.users.sort((a: UserBoard, b: UserBoard) => { return this.getVictory(a) < this.getVictory(b) ? (this.sorttype ? 1 : -1) : (this.sorttype ? -1 : 1) }); break;
        case 'defeat'  : this.users = this.users.sort((a: UserBoard, b: UserBoard) => { return this.getDefeat(a) < this.getDefeat(b) ? (this.sorttype ? 1 : -1) : (this.sorttype ? -1 : 1) }); break;
        case 'ratio'   : this.users = this.users.sort((a: UserBoard, b: UserBoard) => { return this.getRatio(a) < this.getRatio(b) ? (this.sorttype ? 1 : -1) : (this.sorttype ? -1 : 1) }); break;
      }
    },
  },
  beforeMount() {
    this.$api.getAllUsers()
    .then((r: any) => {
      this.users = r.data as UserBoard[]
      this.sortboard('ratio')
    })
    .catch(() => {})
  },
});
</script>

<style lang="sass" scoped>
@use "src/css/interpolate" as r

.board
  height: auto
  overflow-x: hidden

.score
  text-align: center

.victory
  color: $green

.defeat
  color: $red

.labelh
  @include r.interpolate(font-size, 320px, 2560px, 8px, 22px)
  color: $blue-grey-3

.grandtitle
  @include r.interpolate(font-size, 320px, 2560px, 17px, 60px)

.sorting-btn
  // width: calc(80vw / 4) !important
  @include r.interpolate(width, 320px, 2560px, 70px, 250px)
  @include r.interpolate(font-size, 320px, 2560px, 7px, 2px)
  flex-direction: column

.iconsize
  font-size: 4vw

.q-btn-toggle
  width: 100%
  background-color: #2c2c2c

</style>
