import { createApp } from './app'

const { app, router, store } = createApp()

/**
 * 当使用 template 时，context.state 将作为 window.__INITIAL_STATE__ 状态，自动嵌入到最终的 HTML 中。而在客户端，在挂载到应用程序之前，store 就应该获取到状态：
 */
if (window.__INITIAL_STATE_) {
    store.replaceState(window.__INITIAL_STATE__)
}

router.onReady(() => {
    router.beforeResolve((to, from, next) => {
        const matched = router.getMatchedComponents(to)
        const prevMatched = router.getMatchedComponents(from)

        // 我们只关心非预渲染的组件
        // 所以我们对比它们，找出两个匹配列表的差异组件
        let diffed = false

        const activated = matched.filter((c, i) => {
            return diffed || (diffed = (prevMatched[i] !== c))
        })

        if (!activated.length) {
            return next()
        }

        // 这里如果有加载指示器 (loading indicator)，就触发
        Promise.all(
            activated.map(Component => {
                if (Component && Component.methods) {
                    return Component.methods.getData({
                         store,
                         route: to
                     }) 
                 }
            })
        ).then(() => {
            // 停止加载指示器(loading indicator)
            next()
        }).catch(next)
    })

    app.$mount('#app')
})


