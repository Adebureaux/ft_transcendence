import { boot } from "quasar/wrappers";
import { AxiosInstance } from "axios";
import WsService from "../services/ws.service";
import utils from "../services/utils.service";
import API from "../services/api.service";
import { useMainStore } from "../stores/store";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $ws: typeof ws;
    $api: typeof api;
    $utils: typeof utils;
    $store: ReturnType<typeof useMainStore>;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
// const api = axios.create({ baseURL: 'https://api.example.com' });
const api = API;
const ws = new WsService();
// const storeChat: ReturnType<typeof useChatStore> = useChatStore();
// const storeMe: ReturnType<typeof useMeStore> = useMeStore();
const store: ReturnType<typeof useMainStore> = useMainStore();
declare module "vue" {
  interface ComponentCustomProperties {
    $ws: typeof ws;
    $api: typeof api;
    $store: ReturnType<typeof useMainStore>;
    $utils: typeof utils;
  }
}
export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  //   app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file
  //   app.use(createPinia());
  app.config.globalProperties.$ws = ws;
  app.config.globalProperties.$api = api;
  app.config.globalProperties.$utils = utils;
  app.config.globalProperties.$store = store;
});
