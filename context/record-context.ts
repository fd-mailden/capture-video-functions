import {createContext} from "react";

interface IRecordContext {
	isShow: boolean,
	isOnline: boolean,
	startRecording: () => void
}

export const RecordContext = createContext<IRecordContext>({
	isShow: true,
	isOnline: true,
	startRecording: () => console.log('default')
});
