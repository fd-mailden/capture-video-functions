import React, { useEffect } from 'react';
import styled from '@emotion/styled/macro';

import { selectStatus } from 'app/store/record-socket/selects';

import { RECORDING_STATUS } from 'shared/constants/record-statuses';

import { useStopWatch } from '../hooks/use-stop-watch';

const ControllerStopWatch = styled.p`
	font-family: 'Catamaran', serif;
	font-weight: 600;
	font-size: 16px;
	color: ${({ theme }) => theme.palette.common.white};
	padding: 12px 0;
	margin: 0;
`;
export const StopWatch = () => {
	const { startTimer, pauseTimer, resetTimer, time } = useStopWatch();
	const status = selectStatus();

	const statusFn = {
		[RECORDING_STATUS.recording]: startTimer,
		[RECORDING_STATUS.stopped]: pauseTimer,
		[RECORDING_STATUS.paused]: pauseTimer,
		[RECORDING_STATUS.error]: resetTimer,
		[RECORDING_STATUS.permission_requested]: resetTimer,
		[RECORDING_STATUS.idle]: resetTimer,
	};

	useEffect(() => {
		statusFn[status]();
	}, [status]);

	return <ControllerStopWatch>{time}</ControllerStopWatch>;
};
