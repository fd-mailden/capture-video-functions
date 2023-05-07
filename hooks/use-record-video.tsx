import React from 'react';
import styled from '@emotion/styled';

import {
	selectIsRecording,
	selectStatus,
} from '../../../app/store/record-socket/selects';
import { RECORDING_STATUS } from '../../../shared/constants/record-statuses';
import { Camera } from '../components/camera';
import { Countdown } from '../components/countdown';
import { DragWrapperRecordController } from '../components/drag-wrapper-record-controller';
import { RecordControlPanel } from '../components/record-controll-panel';
import { StopWatch } from '../components/stop-watch';

import { useCameraControl } from './use-camera-controll';
import { useRecording } from './use-recording';

const WrapperController = styled.div`
	padding: 10px 30px 10px 24px;
	background: #000000;
	border-radius: 50px;
	display: flex;
	align-items: center;
`;
export const useRecordVideo = () => {
	const status = selectStatus();
	const isRecording = selectIsRecording();
	const {
		models: { isMicrophoneOn, counterBeforeStart },
		command: {
			startRecording,
			onVideoSaved,
			resumeRecording,
			pauseRecording,
			resetRecording,
			toggleMicrophone,
			onCancelPreview,
		},
	} = useRecording();

	const {
		models: { videoRef, isOpenCamera },
		command: { toggleCamera },
	} = useCameraControl();

	const recordControlPanel = isRecording && (
		<DragWrapperRecordController>
			{isOpenCamera && <Camera ref={videoRef} />}
			<WrapperController>
				<RecordControlPanel
					onVideoSaved={onVideoSaved}
					resumeRecording={resumeRecording}
					pauseRecording={pauseRecording}
					resetRecording={resetRecording}
					toggleMicrophone={toggleMicrophone}
					toggleCamera={toggleCamera}
					isShowCamera={isOpenCamera}
					isMuted={isMicrophoneOn}
					isPaused={status === RECORDING_STATUS.paused}
				/>
				<StopWatch />
			</WrapperController>
		</DragWrapperRecordController>
	);
	const countDownView = status === RECORDING_STATUS.idle &&
		counterBeforeStart > 0 && (
			<Countdown onCancel={onCancelPreview} count={counterBeforeStart} />
		);

	const recordWidget = (
		<>
			{recordControlPanel}
			{countDownView}
		</>
	);

	return {
		models: {
			recordWidget,
		},
		commands: {
			startRecording,
		},
	};
};
