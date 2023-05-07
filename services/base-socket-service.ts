import {io, Socket} from 'socket.io-client';

import {RECORD_SOCKET_PATH} from 'shared/config/variables';

import {LocalStorageService} from './local-storage-service';


const socket = io(RECORD_SOCKET_PATH!, {
	transportOptions: {
		polling: {
			extraHeaders: {
				Authorization: `Bearer ${LocalStorageService.get('token')}`,
			},
		},
	},
	secure: true,
	autoConnect: false,
})
const socketInstance = () => {
	// eslint-disable-next-line
	// @ts-ignore
	socket.io.opts.transportOptions.polling.extraHeaders = {
		Authorization: `Bearer ${LocalStorageService.get('token')}`,
	}
	return socket
}

class _SocketService {
	private _socket: () => Socket = socketInstance

	get socket(): Socket {
		return this._socket();
	}

	emit(type: string, payload?: object | void) {
		this._socket().emit(type, payload && payload);
	}

	save(type: string, fn: (video: { id: string }) => void) {
		this._socket().emit(type, fn);
	}

	on(type: string, fn: () => void) {
		this._socket().on(type, fn);
	}

	off(type: string) {
		this._socket().off(type);
	}
}

export const SocketService = new _SocketService();

