<template>
  <q-page>
    <q-scroll-area :visible="true" style="height: 88vh; max-width: 100vw;" ref="chatScroll">
      <q-list bordered class="messagelist">
        <!-- <Message v-for="item in messagesList" :key="item.id" :message="item" class="messagecomp" /> -->
        <UserCard
          v-for="message in messagesList" :key="message.id"
          @click=goProfilPage(message?.identity.name)
          :name=message?.identity.name
          :avatar=message?.identity.avatar
          :content=message?.body
          :timestamp=message?.timestamp
          size="small"
          class="messagecomp"
        />
      </q-list>
    </q-scroll-area>
    <q-input filled v-model="text" placeholder="Enter text here" class="absolute-bottom input"/>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { IMessageList, IUserBasicInfo } from '../models/models';
import { fake_IMessageList } from '../models/fakedatas';
// import Message from '../components/Conversation/Message.vue';
import UserCard from '../components/common/UserCard.vue'

let _messagesList: IMessageList = fake_IMessageList(50);

export default defineComponent({
  name: 'Conversation',
  components: { UserCard },
  props: {
  },
  data() {
    return {
      messagesList: _messagesList as IMessageList,
      text: '',
    }
  },
  updated() {
    this.messagesList = fake_IMessageList(20);
  },
  mounted() {
    const scrollArea: any = this.$refs.chatScroll;
    const scrollTarget: any = scrollArea.getScrollTarget();
    const duration = 0; // ms - use 0 to instant scroll
    scrollArea.setScrollPosition(scrollTarget.scrollHeight, duration);
  },
  methods: {
    goProfilPage(user: string) {
      this.$router.push({
        path: '/profil',
        query: { user: user }
      })
    }
  },
});
</script>

<style lang="sass">
.messagelist
  width: 100% !important

.messagecomp
  margin-bottom: 1vh

.input
  // padding-left: 15% !important
  // margin: 15px
  // border-radius: 20px
  > div
    background-color: #555555
</style>
