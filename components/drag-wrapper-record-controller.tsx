import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';

import { useEvent } from 'shared/hooks/use-event';

import { useDragContext } from '../context/drag-select-provider';
import { DragWrapperContext } from '../context/drag-wrapper-context';

interface IControllerWrapper {
	isMouseUp?: boolean;
	isTop?: boolean;
}

interface IWrapperRecordController {
	children: React.ReactNode;
}

const ControllerWrapper = styled.div<IControllerWrapper>`
	position: absolute;
	top: 20px;
	left: 33%;
	display: flex;
	flex-direction: row;
	width: auto;
	align-items: center;
	z-index: 1500;
`;

const CONDITION_RESIZE = {
	withCamera: { x: 700, y: 230 },
	withOutCamera: { x: 400, y: 70 },
};

const INDENT = 20;
const CONTROLLER_WIDTH = 700;
const CONTROLLER_HEIGHT = 500;

const body = document.body;
const WrapperRecordControllerComponent: React.FC<IWrapperRecordController> = ({
	children,
}) => {
	const [isOpenCamera, setIsOpenCamera] = useState(false);
	const [conditionCamera, setConditionCamera] = useState(
		CONDITION_RESIZE.withOutCamera,
	);

	const controllerRef = useRef<HTMLDivElement>(null);
	const { containerRef } = useDragContext();

	useEffect(() => {
		isOpenCamera
			? setConditionCamera(CONDITION_RESIZE.withCamera)
			: setConditionCamera(CONDITION_RESIZE.withOutCamera);

		isOpenCamera && onControllerSizeChanged();
	}, [isOpenCamera]);
	const onUpdatePosition = (newPosition: { x?: number; y?: number }) => {
		const controller = controllerRef.current;
		if (!controller) return;
		const clientRect = controller.getBoundingClientRect();
		controller.style.top = `${newPosition.y ? newPosition.y : clientRect.y}px`;
		controller.style.left = `${newPosition.x ? newPosition.x : clientRect.x}px`;
	};

	const onControllerSizeChanged = useEvent(() => {
		const container = containerRef?.current;
		const controller = controllerRef.current;
		if (!controller || !container) return;
		const clientRect = controller.getBoundingClientRect();
		clientRect.x + CONTROLLER_WIDTH >= container?.clientWidth &&
			onUpdatePosition({
				x: container?.clientWidth - CONTROLLER_WIDTH,
			});

		clientRect.y + CONTROLLER_HEIGHT >= container?.clientHeight &&
			onUpdatePosition({
				y: container?.clientHeight - CONDITION_RESIZE.withCamera.y,
			});
	});

	const examinationPosition = useEvent(() => {
		const container = containerRef?.current;
		const controller = controllerRef.current;
		if (!container || !controller) return;
		const clientRect = controller.getBoundingClientRect();
		clientRect.x <= INDENT && onUpdatePosition({ x: INDENT });

		clientRect.y <= INDENT && onUpdatePosition({ y: INDENT });

		clientRect.x + conditionCamera.x >= container.clientWidth &&
			onUpdatePosition({
				x: container.clientWidth - (controller.clientWidth + INDENT),
			});

		clientRect.y + conditionCamera.y >= container.clientHeight &&
			onUpdatePosition({
				y: container.clientHeight - (controller.clientHeight + INDENT),
			});
	});

	const handleMouseDown = (event: React.MouseEvent) => {
		const startX = event.pageX;
		const startY = event.pageY;
		const offsetY = controllerRef.current!.getBoundingClientRect().y - startY;
		const offsetX = controllerRef.current!.getBoundingClientRect().x - startX;
		const handleMouseMove = (event: MouseEvent) => {
			if (body) {
				body.classList.add('scrollYLocked');
			}
			const container = containerRef?.current;
			const controller = controllerRef.current;
			if (container && controller) {
				const newPosition = {
					x: event.pageX + offsetX,
					y: event.pageY + offsetY,
				};

				onUpdatePosition(newPosition);
			}
		};

		const handleMouseUp = () => {
			examinationPosition();
			if (body) {
				body.classList.remove('scrollYLocked');
			}
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	};

	return (
		<ControllerWrapper ref={controllerRef}>
			<DragWrapperContext.Provider
				value={{ handelMouseDown: handleMouseDown, setIsOpenCamera }}
			>
				{children}
			</DragWrapperContext.Provider>
		</ControllerWrapper>
	);
};

export const DragWrapperRecordController = React.memo(
	WrapperRecordControllerComponent,
);
