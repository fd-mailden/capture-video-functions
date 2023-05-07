import { createContext, useContext } from 'react';

interface IDragWrapperContext {
	handelMouseDown: (event: React.MouseEvent) => void;
	setIsOpenCamera: (isOpen: boolean) => void;
}

export const DragWrapperContext = createContext<IDragWrapperContext>({
	handelMouseDown: () => {},
	setIsOpenCamera: () => {},
});

export const useDragWrapperContext = () => {
	const { handelMouseDown, setIsOpenCamera } = useContext(DragWrapperContext);
	return {
		handelMouseDown,
		setIsOpenCamera,
	};
};
