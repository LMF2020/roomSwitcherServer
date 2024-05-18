import { createStore, Store, useStore as baseUseStore } from "vuex";
import { InjectionKey } from "vue";
import { ClientInfo, ServerInfo } from "../types/data";

export interface State {
  serverInfo: ServerInfo;
  clientInfo: Array<ClientInfo>;
}

// 定义 injection key
export const key: InjectionKey<Store<State>> = Symbol("store");

// 创建一个新的 store 实例
export const store = createStore<State>({
  state() {
    return {
      serverInfo: { ipAddr: "未连接", expireDate: "" },
      clientInfo: [],
    };
  },
  mutations: {
    setServerInfo(state, payload: ServerInfo) {
      state.serverInfo = payload;
    },
    updateClientInfo(state, payload) {
      const { action, clientInfo } = payload;
      if (action === "delete") {
        state.clientInfo = state.clientInfo.filter(
          (item) => item.clientId !== clientInfo.clientId
        );
      } else if (action === "add") {
        state.clientInfo.push(clientInfo);
      }
    },
  },
});

// 定义自己的 `useStore` 组合式函数
export function useStore() {
  return baseUseStore(key);
}
