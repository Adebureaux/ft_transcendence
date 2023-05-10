import { io } from "socket.io-client";
import { Cookies, useQuasar } from "quasar";
import { useMainStore } from "src/stores/store";
import { UserStatus } from "src/stores/store.types";

class WsService {
  public socket: any;
  constructor() {}
  get connected(): boolean {
    return this.socket?.connected;
  }
  getToken() {
    return Cookies.get("WsAuth");
  }

  emit(eventType: string, payload: object) {
    this.socket.emit(eventType, {
      ...payload,
      auth: { token: this.getToken() },
    });
  }

  emitcb(
    eventType: string,
    payload: object,
    onSuccessCallback: Function,
    onErrorCallback: Function
  ) {
    this.socket.emit(
      eventType,
      { ...payload, auth: { token: this.getToken() } },
      function (response: any) {
        if (response?.status === "error") {
          if (onErrorCallback) return onErrorCallback(response);
          return new Error(response.message);
        } else {
          if (onSuccessCallback) return onSuccessCallback(response);
          return response.data;
        }
      }
    );
  }

  listen(eventType: string, callback: Function) {
    this.socket?.on(eventType, callback);
  }

  removeListener(eventType: string) {
    this.socket?.removeAllListeners(eventType);
  }
  private async __init() {
    const socket = io(`/`, {
      auth: (cb) => {
        cb({ token: this.getToken() });
      },
      transports: ["websocket"],
      path: "/api/ws",
    });
    const connection = new Promise((resolve, reject) => {
      const connectionTimeOut = setTimeout(() => {
        reject(new Error("WsService Connection timeout"));
      }, 3000);
      socket.once("connect", () => {
        useMainStore().ws_connected = true;
        useMainStore().socketId = socket.id;
        clearTimeout(connectionTimeOut);
        resolve(socket);
      });
      socket.connect();
    });
    return connection;
  }
  // should only be called once access token has been received after initial REST request
  async connect(retry?: boolean) {
    if (retry) {
      this.socket = await this.__init().catch((e) => {
        const quasar = useQuasar();
        quasar.notify({
          message: e.message,
          type: "error",
        });
        throw e; // to be catched in mainLayout
      });
    } else {
      this.socket = await this.__init(); //.catch((err) => {});
      this.socket.on("disconnect", (e: any) => {
        useMainStore().ws_connected = false;
        useMainStore().socketId = undefined;
      });
      this.socket.on(
        "connect",
        (usersStatus: { username: string; status: UserStatus }[]) => {
          useMainStore().socketId = this.socket.id;
          useMainStore().ws_connected = true;
          // useMainStore().setUsersStatus(usersStatus);
        }
      );
    }
  }

  setupDefaultListeners() {}

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      useMainStore().socketId = undefined;
      useMainStore().ws_connected = false;
      this.socket.disconnect();
      this.socket = undefined;
    }
  }
}

export default WsService;
