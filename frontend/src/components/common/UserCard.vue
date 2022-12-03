<template>
  <div>

    <q-item class="main" v-if="!content || !timestamp">
      <q-item-section class="avatar">
        <div v-if="validStatus(onlineStatus)" class="onlineStatus" :class="onlineStatusToCSSClass(onlineStatus)"/>
        <q-img :src="avatar" :width="avatarSizeC" :height="avatarSizeC" img-class="usercard-image"/>
      </q-item-section>
      <q-item-section class="datas name-date toto">
        <q-item-label class="name">{{ name }}</q-item-label>
      </q-item-section>

      <q-item-section v-if="icon" class="avatar">
        <q-avatar :icon="icon" :size="avatarSizeC" class=""/>
      </q-item-section>
    </q-item>

    <q-item class="main" v-else>
      <q-item-section class="avatar">
        <div v-if="validStatus(onlineStatus)" class="onlineStatus" :class="onlineStatusToCSSClass(onlineStatus)"/>
        <q-img :src="avatar" :width="avatarSizeC" :height="avatarSizeC" img-class="usercard-image"/>
      </q-item-section>

      <q-item-section class="datas">
        <q-item-section class="name-date">
          <q-item-label class="name">{{ name }}</q-item-label>
          <q-item-label class="timestamp" v-if="timestamp">{{ getRelativeDate(timestamp) }}</q-item-label>
        </q-item-section>

        <q-item-section class="content" v-if="content">
          <q-item-label>{{ content }}</q-item-label>
        </q-item-section>
      </q-item-section>

      <q-item-section v-if="icon" class="avatar">
        <q-avatar :icon="icon" :size="avatarSizeC" class=""/>
      </q-item-section>
    </q-item>

  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { OnlineStatus } from '../../models/models';

let definedSizes = {
  small : { px: 50  , em: 1 },
  medium: { px: 50  , em: 2 },
  large : { px: 134 , em: 3 },
}


export default defineComponent({
  name: 'UserCard',
  components: {},
  props: {
    name         : { type: String , required:  true    },
    avatar       : { type: String , required:  true    },
    content      : { type: String , default :  null    },
    timestamp    : { type: Date   , default :  null    },
    icon         : { type: String , default :  null    },
    mirror       : { type: Boolean, default :  false   },
    size         : { type: String , default : 'medium' },
    nameColor    : { type: String , default : 'white'  },
    contentColor : { type: String , default : 'white'  },
    ratio        : { type: Number , default : 1        },
    onlineStatus : { type: Number, default :  OnlineStatus.NONE    },

  },
  data() {
    return {
      marginSizeC: this.marginSize(this.size) as string,
      avatarSizeC: this.avatarSize(this.size) as string,
      textSizeC: this.textSize(this.size) as string,
      onlineStatusSizeC: this.onlineStatusSize(this.size) as string,
      onlineStatusPositionC: this.onlineStatusPosition(this.size) as string,
      onlineStatusBorderSizeC: this.onlineStatusBorderSize(this.size) as string,
    }
  },
  methods: {
    marginSize(size: string): string {
      switch (size) {
        case 'small' : return ((this.ratio * ((definedSizes.small.px / 2)  - definedSizes.small.em  * 8.9)) + 'px');
        case 'medium': return ((this.ratio * ((definedSizes.medium.px / 2) - definedSizes.medium.em * 8.9)) + 'px');
        case 'large' : return ((this.ratio * ((definedSizes.large.px / 2)  - definedSizes.large.em  * 8.9)) + 'px');
        default: return (this.marginSize('medium'));
      }
    },
    avatarSize(size: string): string {
      switch (size) {
        case 'small' : return ((this.ratio * definedSizes.small.px) + 'px');
        case 'medium': return ((this.ratio * definedSizes.medium.px) + 'px');
        case 'large' : return ((this.ratio * definedSizes.large.px) + 'px');
        default: return (this.avatarSize('medium'));
      }
    },
    onlineStatusSize(size: string): string {
      switch (size) {
        case 'small' : return ((this.ratio * definedSizes.small.px  / 2) + 'px');
        case 'medium': return ((this.ratio * definedSizes.medium.px / 2) + 'px');
        case 'large' : return ((this.ratio * definedSizes.large.px  / 3) + 'px');
        default: return (this.avatarSize('medium'));
      }
    },
    onlineStatusPosition(size: string): string {
      switch (size) {
        case 'small' : return ((this.ratio * definedSizes.small.px  * 0.62) + 'px');
        case 'medium': return ((this.ratio * definedSizes.medium.px * 0.62) + 'px');
        case 'large' : return ((this.ratio * definedSizes.large.px  * 0.62) + 'px');
        default: return (this.avatarSize('medium'));
      }
    },
    onlineStatusBorderSize(size: string): string {
      switch (size) {
        case 'small' : return ((this.ratio * definedSizes.small.px  * 0.1) + 'px');
        case 'medium': return ((this.ratio * definedSizes.medium.px * 0.1) + 'px');
        case 'large' : return ((this.ratio * definedSizes.large.px  * 0.05) + 'px');
        default: return (this.avatarSize('medium'));
      }
    },
    textSize(size: string): string {
      switch (size) {
        case 'small' : return ((this.ratio * definedSizes.small.em) + 'em');
        case 'medium': return ((this.ratio * definedSizes.medium.em) + 'em');
        case 'large' : return ((this.ratio * definedSizes.large.em) + 'em');
        default: return (this.textSize('medium'));
      }
    },
    getRelativeDate(cdate: Date): string {
      let diff : number = (new Date().getTime() - cdate.getTime()) / (3600 * 1000)
      if (diff < 24.)
        return 'Today at '+cdate.getHours()+':'+cdate.getMinutes()
      else if (diff < 48.)
        return 'Yesterday at '+cdate.getHours()+':'+cdate.getMinutes()
      return cdate.toLocaleString()
    },
    onlineStatusToCSSClass(s: OnlineStatus) {
      switch (s) {
        case OnlineStatus.ONLINE  : return 'onlineStatus-online'
        case OnlineStatus.OFFLINE : return 'onlineStatus-offline'
        case OnlineStatus.INGAME  : return 'onlineStatus-ingame'
        case OnlineStatus.NONE    : return ''
      }
    },
    validStatus(s: OnlineStatus) { return s != OnlineStatus.NONE }
  },
});
</script>


<style lang="sass">
.usercard-image
  border-radius: 1000px
  z-index: 2
</style>

<style lang="sass" scoped>
.main
  display: flex-start
  align-items: flex-start
  margin:  0.1em
  padding: 0.1em
  flex-direction: row

.avatar
  max-width: v-bind(avatarSizeC) !important

.name
  font-weight: bold
  color: v-bind(nameColor)
  font-size: v-bind(textSizeC)
  margin-right: 0.8vw

  // add '...' to the end of name if it overflow the container
  overflow: hidden
  white-space: nowrap
  text-overflow: ellipsis

.content
  margin: 0px
  color: v-bind(contentColor)
  font-size: v-bind(textSizeC)

.timestamp
  margin: 0px

.datas
  margin-left: 0.8vw
  flex-direction: column

.name-date
  flex-direction: row
  justify-content: left
  align-items: flex-start

.toto
  min-height: v-bind(avatarSizeC) !important
  *
    margin-top: v-bind(marginSizeC)
    margin-bottom: v-bind(marginSizeC)


.onlineStatus
  z-index: 1
  width: v-bind(onlineStatusSizeC)
  height: v-bind(onlineStatusSizeC)
  background-color: rgb(25, 220, 25)
  border-radius: 50px
  border: v-bind(onlineStatusBorderSizeC) solid #303030
  position: absolute !important
  margin-left: v-bind(onlineStatusPositionC)
  margin-top:  v-bind(onlineStatusPositionC)

.onlineStatus-online
  background-color: rgb(25, 220, 25)
.onlineStatus-offline
  background-color: rgb(220, 25, 25)
.onlineStatus-ingame
  background-color: rgb(15, 125, 200)

</style>
