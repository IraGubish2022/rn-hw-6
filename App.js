import { StyleSheet } from "react-native";
import { Provider } from "react-redux";
//import { store } from "./src/redux/store";
import { store } from './redux/store';
import Main from './components/Main';


export default function App() {
  return (
    <Provider store={store}>
      <Main />
    </Provider>
  );
}

const styles = StyleSheet.create({});

