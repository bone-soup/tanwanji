<template>
	<view class="content">
		<web-view :src="src"></web-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				src: ''
			}
		},
		onLoad({
			src
		}) {
			console.log(src)
			this.src = src
		},
		methods: {

		}
	}
</script>

<style lang="scss">
	page {
		width: 100%;
		height: 100%;
	}

	.content {
		width: 100%;
		height: 100%;
	}

	web-view {
		width: 100%;
		height: 100%;
	}
</style>
