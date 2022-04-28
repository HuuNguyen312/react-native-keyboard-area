import React, { Component } from 'react';
import {
  Animated,
  Dimensions,
  findNodeHandle,
  ScrollView,
  TextInput,
  UIManager,
} from 'react-native';
import { RNKeyboard, SoftInputMode } from './module';
import { isAndroid } from './utils';

interface IKeyboardScrollableAreaProps<T> {
  enabled?: boolean;
  ScrollableComponent?: any;
  scrollableProps?: T;
  navigation?: any;
}

export class KeyboardScrollableArea<T> extends Component<
  IKeyboardScrollableAreaProps<T>
> {
  private _scrollView: ScrollView | null = null;
  private _animated: Animated.Value = new Animated.Value(0);
  private _softInputMode?: number | null;

  async componentDidMount() {
    const { navigation } = this.props;
    RNKeyboard.addKeyboardListener(this.keyboardHeightChanged);
    if (!!navigation) {
      navigation.addListener('blur', this.componentDidExit);
      navigation.addListener('focus', this.componentDidEnter);
    } else {
      this.componentDidEnter();
    }
  }

  componentWillUnmount() {
    RNKeyboard.removeKeyboardListener(this.keyboardHeightChanged);
    const { navigation } = this.props;
    if (!navigation) {
      this.componentDidExit();
    }
  }

  componentDidEnter = async () => {
    const { enabled } = this.props;
    if (!!enabled && isAndroid) {
      this._softInputMode = await RNKeyboard.getWindowSoftInputMode();
      RNKeyboard.setWindowSoftInputMode(
        SoftInputMode.SOFT_INPUT_ADJUST_NOTHING,
      );
    }
  };

  componentDidExit = () => {
    if (
      this._softInputMode !== undefined &&
      this._softInputMode !== null &&
      isAndroid
    ) {
      RNKeyboard.setWindowSoftInputMode(this._softInputMode);
    }
  };

  keyboardHeightChanged = async (keyboardHeight: number) => {
    const { height: screenHeight } = Dimensions.get('window');
    const {
      offset,
      scrollHeight,
    }: { offset: number; scrollHeight: number } = await new Promise(resolve => {
      const node = findNodeHandle(this._scrollView);
      if (node !== null) {
        UIManager.measure(node, (x, y, width, height, pageX, pageY) => {
          resolve({
            offset: screenHeight - pageY - height,
            scrollHeight: height,
          });
        });
      } else {
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
  };

  scrollToInput = (additionalOffset: number) => {
    const currentlyFocusedField = TextInput.State.currentlyFocusedField();
    const reactNode = findNodeHandle(currentlyFocusedField);
    if (reactNode !== null) {
      UIManager.measureLayout(
        reactNode,
        findNodeHandle(this._scrollView)!,
        () => {},
        (left: number, top: number, width: number, height: number) => {
          this._scrollView?.scrollTo({
            y: top - additionalOffset + height,
            animated: true,
          });
        },
      );
    }
  };

  render() {
    const { children, ScrollableComponent, scrollableProps } = this.props;

    return (
      <ScrollableComponent
        ref={(ref: ScrollView | null) => (this._scrollView = ref)}
        {...scrollableProps}
      >
        {children}
        <Animated.View style={{ height: this._animated }} />
      </ScrollableComponent>
    );
  }
}
