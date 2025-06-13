// metro.config.js
const { getDefaultConfig } = require('metro-config')
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config')

module.exports = wrapWithReanimatedMetroConfig({
	transformer: {
		babelTransformerPath: require.resolve('react-native-reanimated/plugin'),
	},
})
