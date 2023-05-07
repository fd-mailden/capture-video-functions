import * as React from 'react';
import { useRef } from 'react';
import { AppMenu } from 'shared/layout/components/app-menu';

import { Container } from '@mui/material';
import { styled } from '@mui/material/styles';

import { DragContext } from '../../modules/videos/context/drag-select-provider';
import { RecordContext } from '../../modules/videos/context/record-context';
import { useRecordVideo } from '../../modules/videos/hooks/use-record-video';

const MainLayoutContainer = styled(Container)`
	display: flex;
	height: 100vh;
	overflow: hidden;
`;

const Main = styled('main')`
	flex-grow: 1;
	padding: 24px 32px;
	overflow-y: auto;
`;

export const MainLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
	const {
		models: { recordWidget },
		commands: { startRecording },
	} = useRecordVideo();
	const container = useRef<HTMLDivElement | null>(null);
	return (
		<RecordContext.Provider
			value={{ isShow: true, startRecording: startRecording, isOnline: true }}
		>
			<DragContext.Provider value={{ containerRef: container }}>
				<MainLayoutContainer disableGutters maxWidth={false} ref={container}>
					{recordWidget}
					<AppMenu />
					<Main>{children}</Main>
				</MainLayoutContainer>
			</DragContext.Provider>
		</RecordContext.Provider>
	);
};
