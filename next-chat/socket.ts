import { ManagerOptions, SocketOptions, io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const url = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000';
const opts: Partial<ManagerOptions & SocketOptions> = {
    autoConnect: false
};
const socket = io(url, opts);

export {
    socket
};