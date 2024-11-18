import {TextProps, Text as RNText, StyleSheet} from 'react-native';
import React from 'react';

export const Text: React.FC<TextProps> = props => {
  return <RNText {...props} style={[styles.defaultText, props.style]} />;
};

const styles = StyleSheet.create({
  defaultText: {
    fontFamily: 'PretendardGOVVariable',
    color: '#1e1e1e',
  },
});
