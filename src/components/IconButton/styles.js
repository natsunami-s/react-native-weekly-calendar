import { StyleSheet } from 'react-native';

import Colors from '../../Colors';

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledContainer: {
    backgroundColor: Colors.white,
    opacity: 0.5,
  },
  button: {
    backgroundColor: Colors.transparent,
    alignItems: 'center',
    padding: 0,
  },
});