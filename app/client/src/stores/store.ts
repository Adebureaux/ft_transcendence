import { NotifyCenter } from "./../services/notifyCenter";
import { defineStore, StateTree } from "pinia";
// import { QNotifyOptions } from "quasar";
import { intersection, difference, union } from "lodash";
// import * as ld from "lodash";
import nc from "../services/notifyCenter";

import { Blocking, ChannelSubscription, ChannelType, FollowedBy, Following, Message, State, StoreData, SubscribedUser, UserStatus } from "./store.types";
import { eChannelType } from "src/services/api.models";

type PendingRequest = {
    username: string;
    // createdAt: Date;
    category: "received" | "sent";
};

type running_game = {
    gameId: string;
    finishedAt?: Date;
    startedAt: Date;
    score_playerOne?: number;
    score_playerTwo?: number;
    playerOneName: string;
    playerTwoName: string;
    map: string;
};

enum ChanState {
    LOADING = "LOADING",
    PASSWDSUBMITION = "PASSWDSUBMITION",
    ACTIVE = "ACTIVE",
    ERROR = "ERROR",
}

type InternalAppInfos = {
    drawerStatus: boolean;
    notifCenter: NotifyCenter;
    ws_connected: boolean;
    users_status: Map<string, UserStatus>;
    active_channel: string;
    channels_passwords: Map<string, string>;
    running_games: running_game[];
    current_channel_state: ChanState;
    message_received: boolean;
    followedBy_str: string[] | undefined;
    following_str: string[] | undefined;
    blocking_str: string[] | undefined;
    first_connection: boolean;
    socketId: string | undefined;
};

interface storeGetters extends StateTree {
    channelPassword(state: MainStoreState): string | undefined;
    messages(state: MainStoreState): Message[] | undefined;
    messagesCount(state: MainStoreState): number;
    blocked(state: MainStoreState): string[] | undefined;
    friends(state: MainStoreState): string[] | undefined;
    friendRequestSent(state: MainStoreState): string[] | undefined;
    friendRequestRecevied(state: MainStoreState): string[] | undefined;
    // oneToOneChannels(state: MainStoreState): ChannelSubscription[] | undefined;
    getPublicPrivateChannels(state: MainStoreState): ChannelSubscription[] | undefined;
    publicPrivateChannelNamesList(state: MainStoreState): string[] | undefined;
    currentChannelSub(state: MainStoreState): ChannelSubscription | undefined;
}

interface storeActions {}

type MainStoreState = StoreData & InternalAppInfos;
// THE MEGA STORE
const useMainStore = defineStore("main-store", {
    state: (): MainStoreState => {
        return {
            username: "",
            email: "",
            twoFA: false,
            channelSubscriptions: [],
            followedBy: [],
            following: [],
            blocking: [],
            victoriesAsPOne: 0,
            victoriesAsPTwo: 0,
            defeatsAsPOne: 0,
            defeatsAsPTwo: 0,

            // InternalAppInfos
            drawerStatus: true,

            followedBy_str: [],
            following_str: [],
            blocking_str: [],
            // notifications: [],
            ws_connected: false,
            active_channel: "",
            current_channel_state: ChanState.LOADING,
            running_games: [],
            channels_passwords: new Map<string, string>(),
            users_status: new Map<string, UserStatus>(),
            message_received: false,
            socketId: undefined,

            notifCenter: nc, // from import
            first_connection: false,
        };
    },
    getters: {
        channelPassword(state: MainStoreState): string {
            return state.channels_passwords.get(state.active_channel) || "";
        },
        messages(state: MainStoreState): Message[] {
            return this.currentChannelSub?.channel.messages || [];
        },
        messagesCount(state: MainStoreState): number {
            let toto = this.currentChannelSub?.channel.messages?.length;
            if (!toto) return 0;
            return toto;
        },

        blocked(state: MainStoreState): string[] {
            if (this.blocking_str) return this.blocking_str;
            else return [];
        },
        friends(state: MainStoreState): string[] {
            if (this.followedBy) return intersection(this.followedBy_str, this.following_str);
            else return [];
        },
        friendRequestSent(state: MainStoreState): string[] {
            // keep only request without follow back
            return difference(state.following_str, state.followedBy_str || []);
        },
        friendRequestRecevied(state: MainStoreState): string[] {
            // keep only request without follow back
            return difference(state.followedBy_str, state.following_str || []);
        },
        pendingRequests: (state: MainStoreState): PendingRequest[] => {
            const invitationList: PendingRequest[] = [];
            const received: string[] = difference(state.followedBy_str, state.following_str || []) || [];
            const sent: string[] = difference(state.following_str, state.followedBy_str || []) || [];
            received.forEach((r) => {
                invitationList.push({ username: r, category: "received" });
            });
            sent.forEach((r) => {
                invitationList.push({ username: r, category: "sent" });
            });
            return invitationList;
        },

        getPublicPrivateChannels(state: MainStoreState): ChannelSubscription[] {
            return state.channelSubscriptions?.filter((e: ChannelSubscription) => e.channel.channelType !== ChannelType.ONE_TO_ONE) || [];
        },

        currentChannelType(state: MainStoreState): eChannelType {
            const channel = this.currentChannelSub?.channel;
            return channel.channelType as eChannelType;
        },
        currentChannelSub(state: MainStoreState): ChannelSubscription {
            return state.channelSubscriptions?.find((e: ChannelSubscription) => e.channelId === this.active_channel) || ({} as ChannelSubscription);
        },
        currentChannelSubState(state: MainStoreState): State {
            return state.channelSubscriptions?.find((e: ChannelSubscription) => e.channelId === this.active_channel)?.state || State.OK;
        },
        currentChannelName(state: MainStoreState): string {
            const channel = this.currentChannelSub?.channel;
            if (channel) {
                if (channel.channelType === ChannelType.ONE_TO_ONE) return channel.subscribedUsers.find((e) => e.username !== state.username)?.username || "";
                else return channel.name;
            }
            return "";
        },
        currentChannelUsers(state: MainStoreState): SubscribedUser[] {
            const channel = this.currentChannelSub?.channel;
            if (channel) {
                return channel.subscribedUsers;
            }
            return {} as SubscribedUser[];
        },
        currentChannelUserCount(state: MainStoreState): number {
            return this.currentChannelUsers.length;
        },
    },
    actions: {
        getUserGame(username: string): running_game | undefined {
            return this.running_games.find((e) => e.playerOneName === username || e.playerTwoName === username);
        },
        setUsersStatus(usersStatus: { username: string; status: UserStatus }[]) {
            if (usersStatus.length == 0) {
                this.users_status.clear();
                return;
            }
            usersStatus.forEach((e) => {
                this.users_status.set(e.username, e.status);
            });
            const usernames = usersStatus.map((e) => e.username);
            this.users_status.forEach((e, key, map) => {
                if (!usernames.includes(key)) map.delete(key);
            });
        },
        setSocketId(socketId: string) {
            this.socketId = socketId;
        },
        getStatus(username: string): UserStatus {
            return this.users_status.get(username) || UserStatus.OFFLINE;
        },

        getChannelIDByUsername(username: string): string | undefined {
            const needle: ChannelSubscription | undefined = this.channelSubscriptions?.find(
                (e: ChannelSubscription) => e.channel.channelType === ChannelType.ONE_TO_ONE && e.channel.subscribedUsers?.some((u: SubscribedUser) => u.username === username)
            );
            return needle?.channelId;
        },
        isSubscribedToChannel(channelId: string): boolean {
            const needle = this.channelSubscriptions?.find((e: ChannelSubscription) => e.channelId === channelId);
            return needle ? true : false;
        },
        addMessage(message: Message) {
            this.currentChannelSub?.channel.messages.push(message);
            this.message_received = true;
        },
        setCurrentChannel(channelId: string) {
            this.active_channel = channelId;
        },
        setStoreData(data: StoreData) {
            this.updateChannelSubscriptions(data.channelSubscriptions);
            delete data.channelSubscriptions;
            this.$patch(data);
            this.followedBy_str = this.followedBy?.map((e: FollowedBy) => e.followerId);
            this.following_str = this.following?.map((e: Following) => e.followingId);
            this.blocking_str = this.blocking?.map((e: Blocking) => e.blockingId);
        },
        updateChannelSubscriptions(channelSubscriptions: ChannelSubscription[] | undefined) {
            if (channelSubscriptions && channelSubscriptions.length >= 1) {
                channelSubscriptions.forEach((e: ChannelSubscription) => {
                    this.updateChannelSubscription(e);
                });
            }
        },
        deleteChannel(channelId: string) {
            if (this.channelSubscriptions) this.channelSubscriptions = this.channelSubscriptions.filter((e: ChannelSubscription) => e.channelId !== channelId);
        },
        updateChannelSubscription(channelSubscription: ChannelSubscription) {
            const foundSub: ChannelSubscription | undefined = this.channelSubscriptions?.find((sub: ChannelSubscription) => {
                return sub.channelId === channelSubscription.channelId;
            });
            if (!foundSub) {
                channelSubscription.channel.messages?.sort((a: Message, b: Message) => {
                    return a.CreatedAt?.getTime() - b.CreatedAt?.getTime();
                });
                this.channelSubscriptions?.push(channelSubscription);
            } else {
                foundSub.role = channelSubscription.role;
                foundSub.state = channelSubscription.state;
                foundSub.stateActiveUntil = channelSubscription.stateActiveUntil;
                foundSub.channel.subscribedUsers = channelSubscription.channel.subscribedUsers;
                foundSub.channel.name = channelSubscription.channel.name;
                foundSub.channel.passwordProtected = channelSubscription.channel.passwordProtected;
                if (!foundSub.channel.messages && channelSubscription.channel.messages) {
                    foundSub.channel.messages = channelSubscription.channel.messages;
                } else if (foundSub.channel.messages && channelSubscription.channel.messages && channelSubscription.channel.messages.length > foundSub.channel.messages.length) {
                    // console.log(channelSubscription.channel.messages);
                    // const res = union(foundSub.channel.messages, channelSubscription.channel.messages);
                    // console.log(res);
                    foundSub.channel.messages = channelSubscription.channel.messages;

                    // channelSubscription.channel.messages.sort((a: Message, b: Message) => {
                    //     return a.CreatedAt.getTime() - b.CreatedAt.getTime();
                    // });
                    // for (let i = foundSub.channel.messages.length; i < channelSubscription.channel.messages.length; i++) {
                    //     foundSub.channel.messages.push(channelSubscription.channel.messages[i]);
                    // }
                } else if (foundSub.channel.messages && channelSubscription.channel.messages && channelSubscription.channel.messages.length < foundSub.channel.messages.length) {
                    // const res = union(foundSub.channel.messages, channelSubscription.channel.messages);
                    // console.log(res);
                    foundSub.channel.messages = channelSubscription.channel.messages;
                    // console.log(channelSubscription.channel.messages);

                    // channelSubscription.channel.messages.sort((a: Message, b: Message) => {
                    //     return a.CreatedAt.getTime() - b.CreatedAt.getTime();
                    // });
                    // for (let i = 0; i < channelSubscription.channel.messages.length; i++) {
                    //     foundSub.channel.messages.push(channelSubscription.channel.messages[i]);
                    // }
                }
            }
        },
    },
});

export { useMainStore };
