const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.LISTENING_PORT || '3030')
}

export default config;