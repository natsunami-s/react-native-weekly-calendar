import { ActivityIndicator, View } from 'react-native';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import Colors from '../../Colors';
import styles from './styles';


const LoadingWrapper = ({
  containerStyle,
  size = 'large',
  color = Colors.black,
  isLoading,
  children,
}) => (
  <Fragment>
    {!isLoading ? (
      children
    ) : (
      <View style={[styles.container, containerStyle]}>
        <ActivityIndicator color={color} size={size} />
      </View>
    )}
  </Fragment>
);

LoadingWrapper.propTypes = {
  containerStyle: PropTypes.object,
  size: PropTypes.string,
  color: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

LoadingWrapper.defaultProps = {
  containerStyle: {},
  size: 'large',
  color: Colors.black,
};


export default LoadingWrapper;
