<template>
  <q-input  dark color="orange" v-model="stringToFind" :label="inputLabel" @focus="markAsTouched" class="iinput" maxlength="20">
    <q-menu v-model="showMenuList" fit :offset="[10,10]" no-focus anchor="bottom left" self="top left" square class="menuu hide-scrollbar">

      <q-list v-if="menuList && menuList.length" class="listuser">
        <q-item v-for="elem in menuList" clickable :key="elem?.username">
          <q-item-section @click="goProfilePage(elem?.username)" style="max-width: 50px;">
            <q-avatar class="avatar" :style="`background-color: ${$utils.usernameToColor(elem?.username)};`">
              <img size="20px" :src="`/api/avatar/${elem?.username}/thumbnail`">
            </q-avatar>
          </q-item-section>

          <q-item-section @click="goProfilePage(elem?.username)">
            <q-item-label>
              {{ elem?.username }}
            </q-item-label>
          </q-item-section>

         <q-item-section side>
            <q-icon name="mdi-account-box-outline" flat round color="green" />
          </q-item-section>

		  <q-tooltip anchor="bottom right" self="center right">{{ elem.username }}'s profile</q-tooltip>
        </q-item>
      </q-list>

      <q-list v-else-if="menuList && !menuList.length && stringToFind.length" style="min-width: 100px" class="listuser">
        <q-item clickable>
          <q-item-section>{{ defaultLabel }}</q-item-section>
        </q-item>
      </q-list>

    </q-menu>
  </q-input>
</template>


<script lang="ts">
import { defineComponent, ref } from 'vue';

enum EUserStatus {
  UNKNOWN,
  FRIEND,
  PENDINGFROM,
  PENDINGTO,
  BLOCKED
}

interface IUserName {
  username: string;
  status: EUserStatus;
}

export default defineComponent({
  name: 'QInputMenu',
  emits: ['findListWithString', 'selectElement', 'createElement'],
  watch: {
    stringToFind(newValue: string, oldValue: string) {
      // Pour ne pas lancer un findListWithString
      // si une valeur est set à l'initialisation du composant
      if (!this.touched)
        return
      this.$emit('findListWithString', newValue)
    },
    menuList(newValue: any) {
      if (!this.touched)
        return
      this.showMenuList = (newValue !== null)
    }
  },
  setup() {
    const confirmBlock = ref(false)
    return {
      confirmBlock
    }
  },
  props: {
    menuList: {
      type: Array<IUserName>,
      default: null
    },
    inputLabel: {
      type: String,
      default: 'Search Users'
    },
    defaultLabel: {
      type: String,
      default: 'No match found'
    },
    itemType: {
      type: String,
      default: null
    },
    initialValue: {
      type: String,
      default: null
    },
    functions: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      stringToFind: '' as string,
      showMenuList: false as boolean,
      touched: false as boolean,
      username: '' as string
    }
  },
  methods: {
    selectElement(elem: any, mode: string) {
      this.$emit('selectElement', elem, mode)
      setTimeout(() => { this.$emit('findListWithString', this.stringToFind) }, 100)
    },
    createElement() {
      this.$emit('createElement')
    },
    markAsTouched() {
      this.touched = true
    },
    goProfilePage(username: string) {
      this.$router.push({
        path: '/profile/' + username,
      })
    },

  },
  mounted() {
    if (this.initialValue)
      this.stringToFind = this.initialValue
  }
});
</script>

<style lang="sass" scoped>
.listuser
  background-color: $bg-secondary
  width: 300px

.iinput
  padding-left: 10px

</style>

menuu