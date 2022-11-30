<template>
  <q-page id="home">
    {{ message }}
    {{ message }}
    <q-btn></q-btn>
  </q-page>
</template>

<script lang="ts">
import { api } from 'boot/axios'
import { ref } from 'vue'
import { defineComponent, PropType } from 'vue'


export default defineComponent({
  name: 'Profile',
  components: {},
  el: '#home',
  props: {
    name : { type: String, default: "username" },
  },
  methods: {
    loadData : function () {
      const data = ref(null)
      api.get('/api/users/Matthieu')
        .then((response) => {
          data.value = response.data
        })
        .catch(() => {
          console.error('error')
        })
        console.log(data.value)
        return (data)
    }
  },
  data () {
    return {
      message : "test"
    }
  },
  // setup () {
  //   const $q = useQuasar()
  //   const data = ref(null)

  //   function loadData () {
  //     api.get('/api/users/Matthieu')
  //       .then((response) => {
  //         data.value = response.data
  //         console.log(data.value)
  //       })
  //       .catch(() => {
  //         console.error('error')
  //       })
  //   }
  //   return { data, loadData }
  // }
})
</script>
