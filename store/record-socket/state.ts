import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import {
	RECORDING_STATUS,
	SOCKET_ACTIONS,
} from 'shared/constants/record-statuses';
import { SocketService } from 'shared/services/base-socket-service';

interface ISocket {
	isLoading: boolean;
	error: string;
	isConnected: boolean;
	recordStatus: string;
	isRecording: boolean;
	emit: (data: IEmitProps) => void;
	save: (type: string, fn: (video: { id: string }) => void) => void;
	connect: () => void;
	close: () => void;
	onConnectListener: () => void;
	onDisconnectedListener: (stopRecording: () => void) => void;
	unfollowListener: (type: string) => void;
	setStatus: (status: string) => void;
	setIsRecording: (isShow: boolean) => void;
	setIsConnected: (isOnline: boolean) => void;
}

interface IEmitProps {
	type: string;
	payload?: object | void;
}

export const useRecordSocketState = create<ISocket>()(
	devtools(
		(set, get) => ({
			isLoading: true,
			error: '',
			isConnected: false,
			recordStatus: RECORDING_STATUS.permission_requested,
			isRecording: false,
			emit(data) {
				if (get().recordStatus !== RECORDING_STATUS.reset) {
					SocketService.emit(data.type, data.payload);
				}
			},
			save(type, fn) {
				SocketService.save(type, fn);
			},
			connect() {
				if (!SocketService.socket.connected) {
					SocketService.socket.connect();
				}
			},
			close() {
				SocketService.socket.close();
				set({ isConnected: false });
			},
			onConnectListener() {
				SocketService.on(SOCKET_ACTIONS.connect, () => {
					set({ isConnected: true });
				});
			},
			onDisconnectedListener(stopRecording) {
				SocketService.on(SOCKET_ACTIONS.disconnect, () => {
					set({ isConnected: false });
					stopRecording();
					SocketService.socket?.close();
				});
			},
			unfollowListener(type) {
				SocketService.off(type);

				get().isConnected && set({ isConnected: false });
			},
			setStatus(status) {
				set({ recordStatus: status });
			},
			setIsRecording(isShow) {
				set({ isRecording: isShow });
			},
			setIsConnected(isConnected) {
				set({ isConnected: isConnected });
			},
		}),
		{ name: 'useRecordSocketState', store: 'useRecordSocketState' },
	),
);
