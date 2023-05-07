import React, { createContext, useContext } from 'react';

type ProviderProps = {
	containerRef: React.RefObject<HTMLDivElement> | null;
};
const DragContext = createContext<ProviderProps>({ containerRef: null });
const useDragContext = () => useContext<ProviderProps>(DragContext);

export { DragContext, useDragContext };
