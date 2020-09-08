import { createApp } from './app'

export default context => {
    
    // 因为有可能会是异步路由钩子函数或组件，所以我们将返回一个 Promise，
    // 以便服务器能够等待所有的内容在渲染前，
    // 就已经准备就绪。
    return new Promise((resolve, reject) => {
        const { app, router, store } = createApp()

        router.push(context.url)
        router.onReady(() => {
            const matchedCompoents = router.getMatchedComponents()
            
            // 服务器匹配不到就返回404
            if (!matchedCompoents.length) {
                return reject({
                    code: 404
                })
            }
            Promise.all(
                matchedCompoents.map(Component => {
                    if (Component && Component.methods) {
                       return Component.methods.getData({
                            store,
                            route: router.currentRoute
                        }) 
                    }
                })
            ).then(() => {
                context.state = store.state

                resolve(app)
            }).catch(() => {
                reject()
            })
        }, reject)
    })
}