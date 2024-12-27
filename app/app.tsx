import styled from "styled-components";
import { Tabs } from "./components/tabs";
function App() {
  return (
    <Container>
      <Tabs />
    </Container>
  );
}
const Container = styled.main`
  height: 100vh;
`;
export default App;