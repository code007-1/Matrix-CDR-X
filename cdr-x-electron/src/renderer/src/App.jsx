import { useEffect } from 'react'
import { Layout } from './layout';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function App() {

  const navigate = useNavigate();
  //const logged_in = useSelector((state) => state.app_slice.logged_in);
  const logged_in = sessionStorage.getItem('logged_in');

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem('currentPage', window.location.pathname);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (logged_in === 'true') {
      const savedPage = localStorage.getItem('currentPage');
      if (savedPage)
        navigate(savedPage);
      else navigate("/internal");
    }
    else { navigate("/login"); }

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
