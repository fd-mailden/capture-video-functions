import { useEffect, useRef, useState } from 'react';

import { selectIsRecording } from 'app/store/record-socket/selects';

export const useCameraControl = () => {
	const [isOpenCamera, setIsOpenCamera] = useState(false);
	const isRecording = selectIsRecording();
	const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

	async function enableVideoStream() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: false,
				video: { facingMode: 'environment' },
			});

			setMediaStream(stream);
		} catch (err) {
			console.log(err);
		}
	}

	const disabledVideoStream = () => {
		try {
			mediaStream?.getTracks().forEach((track) => {
				track.stop();
			});
		} catch (e) {
			console.log(e);
		}
	};

	const videoRef = useRef<HTMLVideoElement>(null);
	if (mediaStream && videoRef.current && !videoRef.current?.srcObject) {
		videoRef.current.srcObject = mediaStream;
	}
	useEffect(() => {
		isOpenCamera ? enableVideoStream() : disabledVideoStream();
	}, [isOpenCamera]);
	useEffect(() => {
		if (!isRecording) {
			setIsOpenCamera(false);
			disabledVideoStream();
		}
	}, [isRecording]);

	const toggleCamera = () => {
		setIsOpenCamera((prevState) => !prevState);
	};

	return {
		models: { videoRef, isOpenCamera },
		command: { toggleCamera },
	};
};
