import { useMainStore } from "src/stores/store";
import { ChanState } from "src/stores/store.types";
import { RouteRecordRaw, useRouter } from "vue-router";
import api from "../services/api.service";

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        meta: { requiresAuth: true },

        component: () => import("layouts/MainLayout.vue"),
        children: [
            {
                path: "/",
                meta: { requiresAuth: true },
                name: "index",
                component: () => import("pages/Index/Index.vue"),
            },
            {
                path: "/leaderboard",
                meta: { requiresAuth: true },
                name: "leaderboard",
                component: () => import("pages/Leaderboard/Leaderboard.vue"),
            },
            {
                path: "/conversation/:channelId",
                name: "chat",
                meta: { requiresAuth: true },
                component: () => import("pages/Conversation/Conversation.vue"),
                beforeEnter: async (to, from, next) => {
                    const store = useMainStore();
                    const channelId: string = to.params.channelId as string;
                    const channelExist = await api.axiosInstance
                        .get("/chat/" + channelId)
                        .then(() => true)
                        .catch(() => false);
                    if (!channelExist) return next({ name: "notfound", replace: true });
                    if (!store.ws_connected && to.query.refresh !== "true") {
                        next({
                            path: "/",
                            query: {
                                refreshed: "true",
                                from: to.path,
                            },
                        });
                    } else if (store.isSubscribedToChannel(channelId)) {
                        store.current_channel_state = ChanState.LOADING;
                        store.setCurrentChannel(channelId);
                        next();
                    } else {
                        next({ name: "notfound", replace: true });
                    }
                },
            },
            {
                path: "/profile/:username",
                meta: { requiresAuth: true },
                component: () => import("pages/Profile/Profile.vue"),
            },

            {
                path: "/game/:gameId",
                name: "game",
                meta: { requiresAuth: true },

                component: () => import("pages/Game/Game.vue"),
                beforeEnter: async (to, from, next) => {
                    await api.axiosInstance
                        .get(`/games/play/${to.params.gameId}`)
                        .then((res) => {
                            if (res.status == 404) {
                                next({ name: "GameError" });
                            } else next();
                        })
                        .catch(() => {
                            next({ name: "GameError" });
                        });
                },
            },
            {
                path: "/game3d/:gameId",
                name: "game3d",
                meta: { requiresAuth: true },

                component: () => import("pages/Game/Game3d.vue"),
                beforeEnter: async (to, from, next) => {
                    await api.axiosInstance
                        .get(`/games/play/${to.params.gameId}`)
                        .then((res) => {
                            if (res.status == 404) {
                                next({ name: "GameError" });
                            } else next();
                        })
                        .catch(() => {
                            next({ name: "GameError" });
                        });
                },
            },
            {
                path: "/spectate/:gameId",
                name: "spectate",
                meta: { requiresAuth: true },

                component: () => import("pages/Game/Spectate.vue"),
                beforeEnter: async (to, from, next) => {
                    const store = useMainStore();
                    if (!store.ws_connected) {
                        next({
                            path: "/",
                        });
                    } else {
                        await api.axiosInstance
                            .get(`/games/watch/${to.params.gameId}`)
                            .then((res) => {
                                if (res.status == 404) {
                                    if (from.name === "game") {
                                        next({ name: "GameError" });
                                    }
                                    next({ name: "GameError" });
                                } else next();
                            })
                            .catch(() => {
                                next({ name: "GameError" });
                            });
                    }
                },
            },
            {
                path: "/spectate3d/:gameId",
                name: "spectate3d",
                meta: { requiresAuth: true },

                component: () => import("pages/Game/Spectate3d.vue"),
                beforeEnter: async (to, from, next) => {
                    const store = useMainStore();
                    if (!store.ws_connected) {
                        next({
                            path: "/",
                        });
                    } else {
                        await api.axiosInstance
                            .get(`/games/watch/${to.params.gameId}`)
                            .then((res) => {
                                if (res.status == 404) {
                                    next({ name: "GameError" });
                                } else next();
                            })
                            .catch(() => {
                                next({ name: "GameError" });
                            });
                    }
                },
            },
        ],
    },
    {
        path: "/login",
        meta: { requiresAuth: false },
        component: () => import("layouts/LoginLayout.vue"),
        children: [
            { path: "", name: "auth", component: () => import("pages/Auth.vue") },
            {
                path: "/42/callback",
                name: "42callback",
                component: () => import("pages/Auth.vue"),
            },
        ],
    },
    {
        path: "/game-error",
        name: "GameError",
        meta: { requiresAuth: true },
        component: () => import("pages/GameError.vue"),
    },
    {
        path: "/:catchAll(.*)*",
        name: "404",
        meta: { requiresAuth: false },
        component: () => import("pages/ErrorNotFound.vue"),
    },
    {
        path: "/404",
        name: "notfound",
        meta: { requiresAuth: false },
        component: () => import("pages/ErrorNotFound.vue"),
    },
];

export default routes;
