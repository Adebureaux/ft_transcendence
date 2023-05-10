// To parse this data:
//
//   import { Convert, StoreData } from "./file";
//
//   const storeData = Convert.toStoreData(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export enum UserStatus {
  OFFLINE = "OFFLINE",
  ONLINE = "ONLINE",
  INGAME = "INGAME",
  WATCHING = "WATCHING",
}

export type UserBoard = {
  username: string,
  victoriesAsPOne: number,
  victoriesAsPTwo: number,
  defeatsAsPOne: number,
  defeatsAsPTwo: number,
}

export type StoreData = {
  username: string;
  email?: string;
  twoFA: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  victoriesAsPOne: number;
  victoriesAsPTwo: number;
  defeatsAsPOne: number;
  defeatsAsPTwo: number;
  // refresh_token?: string;
  // password?: string;
  // avatars?: null;
  channelSubscriptions?: ChannelSubscription[];
  followedBy?: FollowedBy[];
  following?: Following[];
  blocking?: Blocking[];
};

export type Blocking = {
  blockingId: string;
  id: string;
};

export type ChannelSubscription = {
  channelId: string;
  role: Role;
  stateActiveUntil: Date | null;
  state: State;
  channel: Channel;
};

export type Channel = {
  subscribedUsers: SubscribedUser[];
  id: string;
  name: string;
  channelType: string;
  hash?: null | string;
  passwordProtected: boolean;
  messages: Message[];
};

export type Message = {
  id: number;
  CreatedAt: Date;
  ReceivedAt?: Date;
  content: string;
  username: string;
  channelId: string;
};

export type SubscribedUser = {
  username: string;
  role: Role;
  state: State;
  stateActiveUntil: Date | null;
};

export enum Role {
  ADMIN = "ADMIN",
  OWNER = "OWNER",
  USER = "USER",
}

export enum State {
  BANNED = "BANNED",
  MUTED = "MUTED",
  OK = "OK",
}
export enum ChannelType {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  ONE_TO_ONE = "ONE_TO_ONE",
}

export enum ChanState {
  LOADING = "LOADING",
  PASSWDSUBMITION = "PASSWDSUBMITION",
  ACTIVE = "ACTIVE",
  ERROR = "ERROR",
}

export type FollowedBy = {
  followerId: string;
  id?: string;
};

export type Following = {
  followingId: string;
  id?: string;
};
