<template>
    <div id="app">
        <div>
            森岛4a4帆高 {{ test }}
            <div class="img"></div>
        </div>
        <router-view></router-view>
    </div>
</template>

<script>
console.log(module.hot)
export default {
    name: '',
    components: {},
    data () {
        return {
            test: '324'
        }
    },
    created () {
        this.getData()
    },
    methods: {
        getData () {
            console.log('getData')
        }
    }
}
</script>

<style lang="scss" scoped>
#app {
    color: red;
    .img {
        width: 500px;
        height: 500px;
        background: url('~/01.jpg') no-repeat;
    }
}
.red {
    color: red;
}
</style>
