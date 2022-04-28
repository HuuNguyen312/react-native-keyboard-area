var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { Component } from 'react';
import { Animated, Dimensions, findNodeHandle, TextInput, UIManager, } from 'react-native';
import { RNKeyboard, SoftInputMode } from './module';
import { isAndroid } from './utils';
export class KeyboardScrollableArea extends Component {
    constructor() {
        super(...arguments);
        this._scrollView = null;
        this._animated = new Animated.Value(0);
        this.componentDidEnter = () => __awaiter(this, void 0, void 0, function* () {
            const { enabled } = this.props;
            if (!!enabled && isAndroid) {
                this._softInputMode = yield RNKeyboard.getWindowSoftInputMode();
                RNKeyboard.setWindowSoftInputMode(SoftInputMode.SOFT_INPUT_ADJUST_NOTHING);
            }
        });
        this.componentDidExit = () => {
            if (this._softInputMode !== undefined &&
                this._softInputMode !== null &&
                isAndroid) {
                RNKeyboard.setWindowSoftInputMode(this._softInputMode);
            }
        };
        this.keyboardHeightChanged = (keyboardHeight) => __awaiter(this, void 0, void 0, function* () {
            const { height: screenHeight } = Dimensions.get('window');
            const { offset, scrollHeight, } = yield new Promise(resolve => {
                const node = findNodeHandle(this._scrollView);
                if (node !== null) {
                    UIManager.measure(node, (x, y, width, height, pageX, pageY) => {
                        resolve({
                            offset: screenHeight - pageY - height,
                            scrollHeight: height,
                        });
                    });
                }
                else {
                    resolve({ offset: 0, scrollHeight: 0 });
                }
            });
            const contentInset = keyboardHeight - offset;
            Animated.timing(this._animated, {
                toValue: keyboardHeight - offset,
                duration: 300,
                useNativeDriver: false,
            }).start(({ finished }) => {
                const { enabled } = this.props;
                if (keyboardHeight > 0 && finished && enabled) {
                    const additionalOffset = scrollHeight - contentInset;
                    this.scrollToInput(additionalOffset);
                }
            });
        });
        this.scrollToInput = (additionalOffset) => {
            const currentlyFocusedField = TextInput.State.currentlyFocusedField();
            const reactNode = findNodeHandle(currentlyFocusedField);
            if (reactNode !== null) {
                UIManager.measureLayout(reactNode, findNodeHandle(this._scrollView), () => { }, (left, top, width, height) => {
                    var _a;
                    (_a = this._scrollView) === null || _a === void 0 ? void 0 : _a.scrollTo({
                        y: top - additionalOffset + height,
                        animated: true,
                    });
                });
            }
        };
    }
    componentDidMount() {
        return __awaiter(this, void 0, void 0, function* () {
            const { navigation } = this.props;
            RNKeyboard.addKeyboardListener(this.keyboardHeightChanged);
            if (!!navigation) {
                navigation.addListener('blur', this.componentDidExit);
                navigation.addListener('focus', this.componentDidEnter);
            }
            else {
                this.componentDidEnter();
            }
        });
    }
    componentWillUnmount() {
        RNKeyboard.removeKeyboardListener(this.keyboardHeightChanged);
        const { navigation } = this.props;
        if (!navigation) {
            this.componentDidExit();
        }
    }
    render() {
        const { children, ScrollableComponent, scrollableProps } = this.props;
        return (<ScrollableComponent ref={(ref) => (this._scrollView = ref)} {...scrollableProps}>
        {children}
        <Animated.View style={{ height: this._animated }}/>
      </ScrollableComponent>);
    }
}
