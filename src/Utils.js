import { Dimensions } from 'react-native';

export const { height, width } = Dimensions.get('screen');

export const scale = (designWidth = 0) => designWidth * (width / 375);
