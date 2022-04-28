import { Component } from 'react';
interface IKeyboardScrollableAreaProps<T> {
    enabled?: boolean;
    ScrollableComponent?: any;
    scrollableProps?: T;
    navigation?: any;
}
export declare class KeyboardScrollableArea<T> extends Component<IKeyboardScrollableAreaProps<T>> {
    private _scrollView;
    private _animated;
    private _softInputMode?;
    componentDidMount(): Promise<void>;
    componentWillUnmount(): void;
    componentDidEnter: () => Promise<void>;
    componentDidExit: () => void;
    keyboardHeightChanged: (keyboardHeight: number) => Promise<void>;
    scrollToInput: (additionalOffset: number) => void;
    render(): JSX.Element;
}
export {};
