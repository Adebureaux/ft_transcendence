/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js


const { configure } = require('quasar/wrappers');


module.exports = configure(function (ctx) {
	return {

		boot: [
			'setup'
		],
		// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
		css: [
			'app.sass'
		],
		// https://github.com/quasarframework/quasar/tree/dev/extras
		extras: [
			'material-icons',
			'mdi-v6',
			'ionicons-v4', // last webfont was available in v4.6.3
			'eva-icons',
			'fontawesome-v6',
			'themify',
			'line-awesome',
			'bootstrap-icons'
		],
		// Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
		build: {
			target: {
				browser: ['es2022']
			},
			polyfillModulePreload: true,
			vueRouterMode: 'history', // available values: 'hash', 'history'
			distDir: "dist",
			// vueRouterBase,
			// vueDevtools,
			// vueOptionsAPI: false,
			// extendViteConf(viteConf, { isServer, isClient }) {
			// 	console.log(isServer, isClient, ctx.prod)
			// 	if (!ctx.production) {
			// 		viteConf.server.fs = {
			// 			// Allow serving files from one level up to the project root
			// 			allow: ['..']
			// 		}
			// 	}				// do something with viteConf... change it in-place
			// }

		},

		// Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
		devServer: {
			// https: true,
			// vueDevtools: true,
			target: {
				browser: ['es2022']
			},
			open: false, // opens browser window automatically
			proxy: {
				// proxy all requests starting with /api to jsonplaceholder
				'/api': {
					target: 'http://localhost:3000',
					changeOrigin: true,
					pathRewrite: {
						'^/api': ''
					},
					// ws: true
				},
				'/api/ws': {
					target: 'ws://localhost:3000/api/ws',
					changeOrigin: true,
					ws: true
				},
			},
			fs: {
				allow: ['..']
			},
			polyfillModulePreload: true,

		},
		// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
		framework: {
			config: {},
			plugins: ['Notify', 'AppFullscreen', 'Cookies']

		},
		// animations: 'all', // --- includes all animations
		// https://v2.quasar.dev/options/animations
		animations: 'all',
	}
});
