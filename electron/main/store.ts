import Store from "electron-store";

interface StoreType {
  currentRoomKey: string;
}

const schema: Record<keyof StoreType, unknown> = {
  currentRoomKey: {
    type: "string",
    default: "none",
  },
};

const store = new Store<StoreType>({ schema });

export default store;
