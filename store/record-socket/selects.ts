/* eslint-disable react-hooks/rules-of-hooks */
import { useRecordSocketState } from 'app/store/record-socket/state';

export const selectStatus = () =>
	useRecordSocketState((state) => state.recordStatus);
export const selectIsConnected = () =>
	useRecordSocketState((state) => state.isConnected);
export const selectIsRecording = () =>
	useRecordSocketState((state) => state.isRecording);
