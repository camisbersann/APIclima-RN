import { View, Text } from 'react-native';
import styles from './styles';
import Title from '../../components/Title';

export default function Location() {
  return (
    <View style={styles.container}>
      <Title title={"Location"}/>
    </View>
  )
}