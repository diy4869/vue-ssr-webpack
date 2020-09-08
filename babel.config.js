module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                corejs: 3,
                useBuiltIns: 'entry'
            }
        ]
    ],
    plugins: [
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-proposal-nullish-coalescing-operator',
        '@babel/plugin-syntax-optional-chaining'
    ]
}