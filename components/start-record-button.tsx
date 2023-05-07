import React, { memo } from 'react';

import { styled } from '@mui/material/styles';

import { Button } from 'shared/components/button/button';
import { ReactComponent as IconOffline } from 'shared/components/icon/collection/offline.svg';
import { ReactComponent as IconRecord } from 'shared/components/icon/collection/record.svg';

interface IRecordButton {
	isRecording: boolean;
}

const RecordButton = styled(Button)<IRecordButton>`
	max-width: 190px;
	color: #fff;

	span svg circle {
		stroke: ${(props) => props.isRecording && '#FF5656'};
	}
`;

interface IStartRecordButton {
	className?: string;
	isRecording: boolean;
	isConnected: boolean;
	onStartRecording: () => void;
}

const StartRecordButtonComponent: React.FC<IStartRecordButton> = ({
	isRecording,
	className,
	onStartRecording,
	isConnected,
}) => {
	return (
		<RecordButton
			data-test-id="record-button"
			className={className}
			isRecording={isRecording}
			label={isRecording ? 'Recording' : 'Start Recording'}
			startIcon={!isConnected ? <IconOffline /> : <IconRecord />}
			disabled={!isConnected}
			onClick={!isRecording ? onStartRecording : undefined}
		/>
	);
};

export const StartRecordButton = memo(StartRecordButtonComponent);
