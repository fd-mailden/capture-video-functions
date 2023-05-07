import { useContext } from 'react';

import {
	selectIsConnected,
	selectIsRecording,
} from '../../../app/store/record-socket/selects';
import { RecordContext } from '../context/record-context';

export const useRecordContext = () => {
	const { startRecording } = useContext(RecordContext);
	const isRecording = selectIsRecording();
	const isConnected = selectIsConnected();

	return {
		isRecording,
		isConnected,
		startRecording,
	};
};
