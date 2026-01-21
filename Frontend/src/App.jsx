import { useEffect } from 'react'
import { Layout } from './layout';
import { useNavigate } from 'react-router-dom';

function App() {

  const navigate = useNavigate();
  const logged_in = sessionStorage.getItem('logged_in');



  useEffect(() => {
    if (logged_in !== 'true') {
      navigate("/login");
    }

  }, [logged_in, navigate]);

  return (
    <>
      <div>
        <Layout />
      </div>
    </>
  )
}

export default App
