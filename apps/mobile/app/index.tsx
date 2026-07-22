import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
export default function HomeScreen() { return <View style={styles.container}><Text style={styles.eyebrow}>MARKETPLACE_APP</Text><Text style={styles.title}>Everything nearby, in one place.</Text><Text style={styles.body}>Expo Router foundation for Android and iOS is ready.</Text><StatusBar style="light" /></View>; }
const styles = StyleSheet.create({container:{flex:1,backgroundColor:'#0b1016',justifyContent:'center',padding:28},eyebrow:{color:'#65d6a6',fontWeight:'700',letterSpacing:2},title:{color:'#f5f7fa',fontSize:48,fontWeight:'800',lineHeight:50,marginVertical:20},body:{color:'#aeb9c7',fontSize:18,lineHeight:27}});
