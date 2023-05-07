import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { selectAuthUserData } from 'app/store/auth/selects';
import { selectStatus } from 'app/store/record-socket/selects';
import { useRecordSocketState } from 'app/store/record-socket/state';

import { USER_ROUTES, VIDEO_ROUTES } from 'shared/config/routes';
import {
	RECORDING_STATUS,
	SOCKET_ACTIONS,
} from 'shared/constants/record-statuses';
import { useEvent } from 'shared/hooks/use-event';
import { SocketService } from 'shared/services/base-socket-service';

const DEFAULT_COUNTER = 3;
const RECORDING_INTERVAL = 1000;
const INTERVAL_COUNT_START = 1000;
const COUNTDOWN_TIME = 3500;
const PAGE_TITLES = {
	[VIDEO_ROUTES.MY_VIDEOS.path]: {
		title: [VIDEO_ROUTES.MY_VIDEOS.title],
	},
	[USER_ROUTES.MY_PROFILE.path]: {
		title: [USER_ROUTES.MY_PROFILE.title],
	},
};

export const useRecording = () => {
	const [isMicrophoneOn, setIsMicrophoneOn] = useState(true);
	const [counterBeforeStart, setCounterBeforeStart] = useState<number>(3);
	const mediaRecorder = useRef<MediaRecorder | null>(null);
	const isCancel = useRef(false);
	const status = selectStatus();
	const navigate = useNavigate();
	const user = selectAuthUserData();
	const location = useLocation();

	const {
		onConnectListener,
		onDisconnectedListener,
		setIsConnected,
		connect,
		setIsRecording,
		unfollowListener,
		setStatus,
		emit,
		save,
	} = useRecordSocketState();

	useEffect(() => {
		if (!user) return;
		onConnectListener();
		onDisconnectedListener(() => {
			if (mediaRecorder.current) {
				onStopMediaRecording();
			}
		});
		connect();
		return () => {
			unfollowListener(SOCKET_ACTIONS.disconnect);
			unfollowListener(SOCKET_ACTIONS.connect);
			if (SocketService.socket) {
				SocketService.socket.close();
			}
		};
	}, []);
	useEffect(() => {
		window.addEventListener('storage', (event) => {
			if (event.key === 'token') {
				onStopMediaRecording();
			}
		});
	}, []);

	useEffect(() => {
		window.addEventListener('offline', () => {
			setIsConnected(false);
		});
		window.addEventListener('online', () => {
			setIsConnected(true);
		});
	}, []);

	const wait = () =>
		new Promise<void>((resolve) => {
			const myInterval = setInterval(
				() => setCounterBeforeStart((prevState) => prevState - 1),
				INTERVAL_COUNT_START,
			);

			setTimeout(() => {
				clearInterval(myInterval);
				resolve();
			}, COUNTDOWN_TIME);
		});

	const requestMediaStream = async () => {
		try {
			const mediaDevices = navigator.mediaDevices;
			const displayMedia = await mediaDevices.getDisplayMedia();
			const userMedia: MediaStream | null = await mediaDevices.getUserMedia({
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
					sampleRate: 44100,
				},
			});

			let tracks = displayMedia.getTracks();
			console.log(displayMedia);
			if (userMedia) {
				tracks = [...userMedia.getTracks(), ...tracks];
			}

			if (tracks.length) {
				setStatus(RECORDING_STATUS.idle);
			}

			const stream: MediaStream = new MediaStream(tracks);

			stream.getVideoTracks()[0].onended = () => {
				stream.getTracks().forEach((track) => {
					track.stop();
				});
				isCancel.current ? onCancelPreview() : onVideoSaved();
			};
			if (stream.getAudioTracks().length) {
				stream.getAudioTracks()[0].enabled = true;
				setIsMicrophoneOn(true);
			} else {
				setIsMicrophoneOn(false);
			}
			const mediaRecorderLocal = new MediaRecorder(stream);

			mediaRecorderLocal.onstart = () => {
				emit({ type: SOCKET_ACTIONS.generate_video_path });
			};

			mediaRecorderLocal.ondataavailable = (event) => {
				emit({
					type: SOCKET_ACTIONS.start,
					payload: { chunk: event.data },
				});
			};

			return wait().then(() => {
				if (!isCancel.current) {
					mediaRecorderLocal.start(RECORDING_INTERVAL);
					mediaRecorder.current = mediaRecorderLocal;
					setStatus(RECORDING_STATUS.recording);
					setIsRecording(true);
					return mediaRecorderLocal;
				} else {
					mediaRecorderLocal.stream.getTracks().forEach((track) => {
						track.stop();
					});
				}
			});
		} catch (e) {
			console.error(e);
			setStatus(RECORDING_STATUS.error);
		}
	};

	const startRecording = useCallback(async () => {
		try {
			isCancel.current = false;
			setCounterBeforeStart(DEFAULT_COUNTER);
			await requestMediaStream();
		} catch (e) {
			console.log('Socket Connect:' + e);
			setStatus(RECORDING_STATUS.error);
		}
	}, [status]);

	const toggleMicrophone = useEvent(() => {
		setIsMicrophoneOn((prevValue) => {
			const newValue = !prevValue;
			if (
				mediaRecorder.current &&
				mediaRecorder.current.stream.getAudioTracks().length
			) {
				mediaRecorder.current.stream.getAudioTracks()[0].enabled = newValue;
			}
			return newValue;
		});
	});

	function onCancelPreview() {
		isCancel.current = true;
		setStatus(RECORDING_STATUS.permission_requested);
	}

	const onNavigateToVideoPage = (video: { id: string }) => {
		navigate(VIDEO_ROUTES.VIDEO.generate(video?.id), {
			state: PAGE_TITLES[location.pathname]
				? {
						from: location.pathname + location.search,
						title: PAGE_TITLES[location.pathname].title,
				  }
				: undefined,
		});
	};

	const onStopMediaRecording = () => {
		try {
			mediaRecorder.current?.stop();
			mediaRecorder.current?.stream.getTracks().forEach((track) => {
				track.stop();
			});
			mediaRecorder.current = null;
			setStatus(RECORDING_STATUS.stopped);
			setIsRecording(false);
		} catch (e) {
			console.error('Stop Media Recording error' + e);
		}
	};

	const onVideoSaved = useEvent(async () => {
		try {
			onStopMediaRecording();
			save(SOCKET_ACTIONS.save, onNavigateToVideoPage);
		} catch (e) {
			console.log('Stop Recording: ' + e);
			setStatus(RECORDING_STATUS.error);
		}
	});

	const resetRecording = () => {
		mediaRecorder.current?.stop();
		mediaRecorder.current?.stream.getTracks().forEach((track) => {
			track.stop();
		});
		emit({ type: SOCKET_ACTIONS.reset });

		setStatus(RECORDING_STATUS.reset);
		setIsRecording(false);
	};

	const pauseRecording = useEvent(() => {
		setStatus(RECORDING_STATUS.paused);
		mediaRecorder.current?.pause();
	});

	const resumeRecording = useEvent(() => {
		setStatus(RECORDING_STATUS.recording);
		mediaRecorder.current?.resume();
	});

	return {
		models: { isMicrophoneOn, isCancel, counterBeforeStart },
		command: {
			onCancelPreview,
			toggleMicrophone,
			pauseRecording,
			resetRecording,
			resumeRecording,
			startRecording,
			onVideoSaved,
		},
	};
};
