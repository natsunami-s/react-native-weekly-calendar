import { TouchableOpacity } from 'react-native';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import IonIcon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import PropTypes from 'prop-types';
import React from 'react';

import LoadingWrapper from '../LoadingWrapper';
import styles from './styles';

const iconComponents = {
  'AntDesign': AntDesignIcon,
  'Material': MaterialIcon,
  'MaterialCommunity': MaterialCommunityIcon,
  'Entypo': EntypoIcon,
  'FontAwesome': FontAwesomeIcon,
  'FontAwesome5': FontAwesome5Icon,
  'Feather': FeatherIcon,
  'Evil': EvilIcon,
  'Ionicons': IonIcon,
};

const IconButton = ({
  activeOpacity=0.5,
  type='Material',
  iconName,
  iconSize,
  iconColor,
  loaderColor,
  disabled,
  containerStyle,
  isLoading,
  onPress,
}) => {
  const Icon = iconComponents[type] || MaterialIcon;

  return(
    <LoadingWrapper isLoading={isLoading} color={loaderColor}>
      <TouchableOpacity
        disabled={disabled}
        style={[styles.container, disabled && styles.disabledContainer, containerStyle]}
        activeOpacity={activeOpacity}
        onPress={onPress}
      >
        <Icon
          name={iconName}
          size={iconSize}
          color={iconColor}
        />
      </TouchableOpacity>
    </LoadingWrapper>
  );};

IconButton.propTypes = {
  iconName: PropTypes.string.isRequired,
  iconSize: PropTypes.number.isRequired,
  activeOpacity: PropTypes.number,
  type: PropTypes.string,
  iconColor: PropTypes.string,
  loaderColor: PropTypes.string,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  containerStyle: PropTypes.object,
  iconStyle: PropTypes.object,
  onPress: PropTypes.func,
};

IconButton.defaultProps = {
  activeOpacity: 0.5,
  type: 'Material',
  iconColor: undefined,
  loaderColor: undefined,
  disabled: false,
  isLoading: false,
  containerStyle: {},
  iconStyle: {},
  onPress: () => {},
};


export default IconButton;
