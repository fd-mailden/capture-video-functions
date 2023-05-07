import React, { forwardRef } from 'react';
import styled from '@emotion/styled/macro';

const VideoCamera1 = styled.video`
	border-radius: 50%;
	object-fit: cover;
	height: 200px;
	width: 200px;
	background-color: #000;
	box-shadow: 1px 1px 27px -2px rgba(0, 0, 0, 0.74);
	transition: filter 0.3s ease-out;
	transform: scaleX(-1);
	margin-right: 20px;

	&:hover {
		filter: brightness(60%);
	}
`;

export const Camera = forwardRef<HTMLVideoElement>((props, ref) => {
	return <VideoCamera1 ref={ref} autoPlay playsInline muted />;
});
Camera.displayName = 'Camera';
