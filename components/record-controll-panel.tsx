import React from 'react';
import styled from '@emotion/styled/macro';

import { Icon } from '../../../shared/components/icon/icon';
import { ICON_COLLECTION } from '../../../shared/components/icon/icon-list';
import { useDragWrapperContext } from '../context/drag-wrapper-context';

const ControllerButton = styled.button`
	background: transparent;
	padding: 0 14px;
	border: 1px solid transparent;
	cursor: pointer;
	transition: all 0.1s ease-out;
	&:hover {
		transform: translateY(-2px);
	}
`;

const DragController = styled(ControllerButton)`
	&:hover {
		cursor: grab;
	}

	&:active {
		cursor: grabbing;
	}
`;

interface IRecordControlPanel {
	onVideoSaved: () => void;
	resumeRecording: () => void;
	pauseRecording: () => void;
	resetRecording: () => void;
	toggleMicrophone: () => void;
	toggleCamera: () => void;
	isMuted: boolean;
	isShowCamera: boolean;
	isPaused: boolean;
}

const RecordControlPanelComponent: React.FC<IRecordControlPanel> = ({
	onVideoSaved,
	resumeRecording,
	pauseRecording,
	resetRecording,
	toggleMicrophone,
	toggleCamera,
	isMuted,
	isShowCamera,
	isPaused,
}) => {
	const { handelMouseDown, setIsOpenCamera } = useDragWrapperContext();
	const handleToggleCamera = () => {
		setIsOpenCamera(!isShowCamera);
		toggleCamera();
	};

	return (
		<>
			<DragController onMouseDown={handelMouseDown}>
				<Icon icon={ICON_COLLECTION.drag_indicator} />
			</DragController>
			<ControllerButton onClick={onVideoSaved}>
				<Icon icon={ICON_COLLECTION.stop} />
			</ControllerButton>
			{isPaused ? (
				<ControllerButton onClick={resumeRecording}>
					<Icon icon={ICON_COLLECTION.resume} />
				</ControllerButton>
			) : (
				<ControllerButton onClick={pauseRecording}>
					<Icon icon={ICON_COLLECTION.pause} />
				</ControllerButton>
			)}
			<ControllerButton onClick={resetRecording}>
				<Icon icon={ICON_COLLECTION.reset} />
			</ControllerButton>
			<ControllerButton onClick={toggleMicrophone}>
				{isMuted ? (
					<Icon icon={ICON_COLLECTION.microphone} />
				) : (
					<Icon icon={ICON_COLLECTION.microphone_off} />
				)}
			</ControllerButton>
			<ControllerButton onClick={handleToggleCamera}>
				{isShowCamera ? (
					<Icon icon={ICON_COLLECTION.camera} />
				) : (
					<Icon icon={ICON_COLLECTION.camera_off} />
				)}
			</ControllerButton>
		</>
	);
};

export const RecordControlPanel = React.memo(RecordControlPanelComponent);
