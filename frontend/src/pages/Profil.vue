<template>
    <q-btn
      @click="loadData"
      color="primary"
      label= data.username
    />
</template>

<script>
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import { api } from 'boot/axios'

export default {
  setup () {
    const $q = useQuasar()
    const data = ref(null)

    function loadData () {
      api.get('/api/users/Matthieu')
        .then((response) => {
          data.value = response.data
          console.log(data.value)
        })
        .catch(() => {
          console.error('error')
        })
    }
    return { data, loadData }
  }
}
</script>
