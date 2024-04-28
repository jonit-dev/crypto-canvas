import { observer } from 'mobx-react-lite';
import { Loading } from 'react-daisyui';
import styled from 'styled-components';
import { loadingStore } from '../store/LoadingStore';

export const LoadingScreen = observer(() => {
  return (
    loadingStore.isLoading && (
      <Container>
        <Loading size="lg" variant="infinity" />
      </Container>
    )
  );
});

const Container = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.8);
`;
